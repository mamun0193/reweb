import { NextRequest } from "next/server";
import puppeteer from "puppeteer";
import { withErrorHandler } from "@/middleware/errorHanlder";
import { isValidUrl } from "@/helpers/validation";


const handler = async (req: NextRequest) => {
    const reqBody = await req.json();
    const { url } = reqBody;
    if (!isValidUrl(url)) {
        return new Response(JSON.stringify({ error: "Invalid URL" }), { status: 400 });
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();
    return new Response(JSON.stringify({ content }), { status: 200 });

}
export const POST = withErrorHandler(handler);