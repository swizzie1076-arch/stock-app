import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const normalizeTicker = (ticker: string) => ticker.trim().toUpperCase();

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("holdings").withIndex("by_createdAt").order("desc").collect();
  }
});

export const add = mutation({
  args: {
    ticker: v.string(),
    companyName: v.optional(v.string()),
    shares: v.number(),
    averageBuyPrice: v.number(),
    sector: v.optional(v.string()),
    thesis: v.optional(v.string()),
    conviction: v.optional(v.string()),
    targetPrice: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const ticker = normalizeTicker(args.ticker);
    const companyName = args.companyName?.trim();
    const sector = args.sector?.trim();
    const thesis = args.thesis?.trim();
    const conviction = args.conviction?.trim();

    if (!ticker) {
      throw new Error("Ticker is required.");
    }
    if (args.shares <= 0 || args.averageBuyPrice <= 0) {
      throw new Error("Shares and average buy price must be greater than zero.");
    }
    if (args.targetPrice !== undefined && args.targetPrice <= 0) {
      throw new Error("Target price must be greater than zero.");
    }

    const existing = await ctx.db
      .query("holdings")
      .withIndex("by_ticker", (q: any) => q.eq("ticker", ticker))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        companyName: companyName || ticker,
        shares: args.shares,
        averageBuyPrice: args.averageBuyPrice,
        sector: sector || undefined,
        thesis: thesis || undefined,
        conviction: conviction || undefined,
        targetPrice: args.targetPrice
      });
      return existing._id;
    }

    return await ctx.db.insert("holdings", {
      ticker,
      companyName: companyName || ticker,
      shares: args.shares,
      averageBuyPrice: args.averageBuyPrice,
      sector: sector || undefined,
      thesis: thesis || undefined,
      conviction: conviction || undefined,
      targetPrice: args.targetPrice,
      createdAt: Date.now()
    });
  }
});

export const remove = mutation({
  args: {
    id: v.id("holdings")
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  }
});
