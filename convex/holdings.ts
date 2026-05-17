import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const normalizeTicker = (ticker: string) => ticker.trim().toUpperCase();

async function getRequestUserId(ctx: QueryCtx | MutationCtx, fallbackUserId?: string) {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.subject ?? fallbackUserId?.trim();
  return userId || null;
}

export const list = query({
  args: {
    clerkUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getRequestUserId(ctx, args.clerkUserId);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("holdings")
      .withIndex("by_user_createdAt", (q) => q.eq("clerkUserId", userId))
      .order("desc")
      .collect();
  }
});

export const add = mutation({
  args: {
    clerkUserId: v.string(),
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
    const clerkUserId = (await getRequestUserId(ctx, args.clerkUserId)) ?? "";
    const ticker = normalizeTicker(args.ticker);
    const companyName = args.companyName?.trim();
    const sector = args.sector?.trim();
    const thesis = args.thesis?.trim();
    const conviction = args.conviction?.trim();

    if (!clerkUserId) {
      throw new Error("You must be signed in to save stocks.");
    }
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
      .withIndex("by_user_ticker", (q) => q.eq("clerkUserId", clerkUserId).eq("ticker", ticker))
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
      clerkUserId,
      userId: clerkUserId,
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
    id: v.id("holdings"),
    clerkUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getRequestUserId(ctx, args.clerkUserId);
    if (!userId) {
      throw new Error("You must be signed in to remove stocks.");
    }

    const holding = await ctx.db.get(args.id);
    const holdingUserId = holding?.clerkUserId ?? holding?.userId;
    if (!holding || holdingUserId !== userId) {
      throw new Error("You can only remove your own saved stocks.");
    }
    await ctx.db.delete(args.id);
  }
});
