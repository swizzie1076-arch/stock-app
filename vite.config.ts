import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { getChart, getQuote, searchCompanies } from "./lib/market-data";

loadLocalEnv();

function sendJson(res: { statusCode: number; setHeader: (name: string, value: string) => void; end: (body: string) => void }, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function loadLocalEnv() {
  try {
    const env = readFileSync(".env.local", "utf8");
    for (const line of env.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    }
  } catch {
    // Next loads this automatically; this keeps the Vite preview middleware aligned.
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "atlas-market-api",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/api/")) {
            next();
            return;
          }

          const url = new URL(req.url, "http://127.0.0.1:5173");

          try {
            if (url.pathname === "/api/search") {
              sendJson(res, 200, { items: await searchCompanies(url.searchParams.get("q") ?? "") });
              return;
            }

            if (url.pathname === "/api/quote") {
              const symbol = url.searchParams.get("symbol")?.trim().toUpperCase();
              if (!symbol) {
                sendJson(res, 400, { error: "Ticker symbol is required." });
                return;
              }
              sendJson(res, 200, await getQuote(symbol));
              return;
            }

            if (url.pathname === "/api/chart") {
              const symbol = url.searchParams.get("symbol")?.trim().toUpperCase();
              if (!symbol) {
                sendJson(res, 400, { error: "Ticker symbol is required." });
                return;
              }
              sendJson(res, 200, await getChart(symbol, url.searchParams.get("range") ?? "6mo"));
              return;
            }
          } catch (error) {
            sendJson(res, 502, { error: error instanceof Error ? error.message : "Market data unavailable." });
            return;
          }

          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url))
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173
  }
});
