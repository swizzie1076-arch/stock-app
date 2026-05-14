import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  holdings: defineTable({
    ticker: v.string(),
    companyName: v.optional(v.string()),
    shares: v.number(),
    averageBuyPrice: v.number(),
    sector: v.optional(v.string()),
    thesis: v.optional(v.string()),
    conviction: v.optional(v.string()),
    targetPrice: v.optional(v.number()),
    createdAt: v.number()
  })
    .index("by_ticker", ["ticker"])
    .index("by_createdAt", ["createdAt"])
});
