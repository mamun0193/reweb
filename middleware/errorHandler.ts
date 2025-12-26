import type { NextRequest } from "next/server";

export const withErrorHandler =
  (handler: (req: NextRequest) => Promise<Response>) =>
  async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Internal Server Error";

      console.error("API Error:", message);

      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
