import type { Context, Next } from "hono";
import type { Env } from "../types";

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  // 跳過 CORS 預檢請求
  if (c.req.method === "OPTIONS") {
    return next();
  }
  const apiKey = c.req.query("apiKey");
  if (!apiKey || apiKey !== c.env.API_KEY) {
    return c.json({ message: "Invalid or missing API key" }, 401);
  }

  await next();
}
