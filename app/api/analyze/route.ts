import { NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { withErrorHandler } from "@/middleware/errorHandler";
import { isValidUrl, normalizeUrl } from "@/helpers/validation";
import { generateSuggestions } from "@/lib/suggestions";
import { AnalysisResult } from "@/app/types/analysis";

// Constants (real-world averages)
const ENERGY_PER_MB = 0.81;     // Wh per MB
const CO2_PER_WH = 0.442;       // grams CO₂ per Wh
const WATER_PER_WH = 0.0018;    // liters per Wh



const handler = async (req: NextRequest) => {
    const reqBody = await req.json();
    const { url } = reqBody;
    if (!url || typeof url !== "string") {
        return new Response(JSON.stringify({ error: "Missing or invalid 'url' in request body" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
        return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    let browser;
    try {
        const isDev = process.env.NODE_ENV !== "production";
        // Launch Puppeteer and navigate to the URL

        browser = await puppeteer.launch({
            args: isDev ? [] : chromium.args,
            executablePath: isDev
                ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                : await chromium.executablePath(),
            headless: true,
        });

        const page = await browser.newPage();


        // Track HTML,CSS,JS,Images, API calls, Third-party scripts

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

                if (
                    url.startsWith("data:") ||
                    url.startsWith("blob:") ||
                    url.startsWith("chrome")
                ) return;

                const buffer = await response.buffer().catch(() => null);
                if (!buffer) return;

                const size = buffer.length;
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
            waitUntil: "networkidle0",
            timeout: 60000
        });
        totalBytes = htmlBytes + cssBytes + jsBytes + imageBytes + apiBytes + thirdPartyAPIBytes;

        // Calculations

        const pageSizeMB = totalBytes / (1024 * 1024); // Convert bytes to MB
        const toKB = (bytes: number) => parseFloat((bytes / 1024).toFixed(2));
        const energyConsumptionWh = pageSizeMB * ENERGY_PER_MB;
        const estimatedCO2g = energyConsumptionWh * CO2_PER_WH;
        const estimatedWaterL = energyConsumptionWh * WATER_PER_WH;

        // Build the analysis object first (without suggestions), then generate suggestions
        const response: AnalysisResult = {
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
                apiCalls: apiCalls,
                thirdPartyAPIBytes: toKB(thirdPartyAPIBytes),
                thirdPartyAPICalls: thirdPartyAPICalls,
            },

            impacts: {
                energyWH: energyConsumptionWh.toFixed(3) as unknown as number,
                carbon: estimatedCO2g.toFixed(3) as unknown as number,
                water: estimatedWaterL.toFixed(4) as unknown as number,
            },
            suggestions: [],
        };

        // Generate suggestions using the analysis data
        try {
            const suggestions = generateSuggestions(response);
            response.suggestions = suggestions;
        } catch (err) {
            response.suggestions = [];
            console.log(err);

        }

        await browser.close();
        return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (err) {
        if (browser) await browser.close().catch(() => { });
        throw err;
    }

}
export const POST = withErrorHandler(handler);