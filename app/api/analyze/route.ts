export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { withErrorHandler } from "@/middleware/errorHandler";
import { isValidUrl, normalizeUrl } from "@/helpers/validation";
import { generateSuggestions } from "@/lib/suggestions";
import { AnalysisResult } from "@/app/types/analysis";

const ENERGY_PER_MB = 0.81;     // Wh per MB
const CO2_PER_WH = 0.442;       // grams CO₂ per Wh
const WATER_PER_WH = 0.0018;    // liters per Wh

const MAX_BUFFER_BYTES = 2 * 1024 * 1024; // 2 MB cap per response to avoid OOM

const handler = async (req: NextRequest) => {
  // dynamic import to avoid bundling issues and ensure Node runtime only usage
  const puppeteerModule = await import("puppeteer-core").catch((e) => {
    console.error("Failed to import puppeteer-core:", e);
    throw e;
  });
  const chromium = await import("@sparticuz/chromium").catch((e) => {
    console.error("Failed to import @sparticuz/chromium:", e);
    throw e;
  });

  const puppeteer = puppeteerModule.default ?? puppeteerModule;

  try {
    const reqBody = await req.json();
    const { url } = reqBody;
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'url' in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Launch Chromium
    let browser;
    try {
      // try to get executablePath — fall back to env variable if needed
      let executablePath = "";
      try {
        executablePath = await chromium.executablePath();
      } catch (err) {
        console.warn("chromium.executablePath() failed, checking CHROME_PATH env:", err);
        executablePath = process.env.CHROME_PATH || "";
      }

      const launchOptions: any = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: chromium.headless,
      };

      if (executablePath) {
        launchOptions.executablePath = executablePath;
      }

      browser = await puppeteer.launch(launchOptions);
    } catch (err) {
      console.error("Failed to launch browser:", err);
      return new Response(JSON.stringify({ error: "Failed to launch headless browser" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const page = await browser.newPage();

      const pageDomain = new URL(normalizedUrl).hostname;
      let totalBytes = 0;
      let htmlBytes = 0;
      let cssBytes = 0;
      let jsBytes = 0;
      let imageBytes = 0;
      let apiBytes = 0;
      let apiCalls = 0;
      let thirdPartyAPICalls = 0;
      let thirdPartyAPIBytes = 0;
      let requestCount = 0;

      page.on("response", async (response) => {
        try {
          const request = response.request();
          const url = request.url();
          const type = request.resourceType();

          if (!url || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("chrome")) return;

          // prefer content-length header to avoid allocating buffers
          const headers = response.headers();
          let size = 0;
          if (headers && headers["content-length"]) {
            const parsed = parseInt(headers["content-length"], 10);
            if (!Number.isNaN(parsed)) {
              size = parsed;
            }
          }

          // fallback to buffer() but cap the read to avoid OOM
          if (!size) {
            try {
              const buffer = await response.buffer().catch(() => null);
              if (buffer && buffer.length <= MAX_BUFFER_BYTES) {
                size = buffer.length;
              } else if (buffer && buffer.length > MAX_BUFFER_BYTES) {
                // too large — skip reading full body; approximate via header if possible
                size = MAX_BUFFER_BYTES;
              } else {
                // unknown size, skip
                return;
              }
            } catch (e) {
              // can't read body — skip
              return;
            }
          }

          const hostname = new URL(url).hostname;
          const isThirdParty = hostname !== pageDomain;

          requestCount++;

          if (isThirdParty) {
            thirdPartyAPIBytes += size;
            thirdPartyAPICalls++;
          }

          switch (type) {
            case "document":
              htmlBytes += size;
              break;
            case "stylesheet":
              cssBytes += size;
              break;
            case "script":
              jsBytes += size;
              break;
            case "image":
              imageBytes += size;
              break;
            case "xhr":
            case "fetch":
              apiBytes += size;
              apiCalls++;
              break;
            default:
              break;
          }
        } catch (err) {
          console.error("Resource parse error:", err);
        }
      });

      await page.goto(normalizedUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      totalBytes = htmlBytes + cssBytes + jsBytes + imageBytes + apiBytes + thirdPartyAPIBytes;

      const pageSizeMB = totalBytes / (1024 * 1024);
      const toKB = (bytes: number) => parseFloat((bytes / 1024).toFixed(2));
      const energyConsumptionWh = pageSizeMB * ENERGY_PER_MB;
      const estimatedCO2g = energyConsumptionWh * CO2_PER_WH;
      const estimatedWaterL = energyConsumptionWh * WATER_PER_WH;

      const responseObj: AnalysisResult = {
        url: normalizedUrl,
        pageSizeMB: parseFloat(pageSizeMB.toFixed(2)),
        resources: {
          requestCount,
          totalBytes: toKB(totalBytes),
          html: toKB(htmlBytes),
          css: toKB(cssBytes),
          js: toKB(jsBytes),
          image: toKB(imageBytes),
          apiBytes: toKB(apiBytes),
          apiCalls,
          thirdPartyAPIBytes: toKB(thirdPartyAPIBytes),
          thirdPartyAPICalls,
        },
        impacts: {
          energyWH: parseFloat(energyConsumptionWh.toFixed(3)),
          carbon: parseFloat(estimatedCO2g.toFixed(3)),
          water: parseFloat(estimatedWaterL.toFixed(4)),
        },
        suggestions: [],
      };

      try {
        const suggestions = generateSuggestions(responseObj);
        responseObj.suggestions = suggestions;
      } catch (err) {
        console.warn("generateSuggestions failed:", err);
        responseObj.suggestions = [];
      }

      await browser.close();
      return new Response(JSON.stringify(responseObj), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (_) {}
      }
    }
  } catch (err) {
    console.error("Unhandled error in analyze handler:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST = withErrorHandler(handler);
