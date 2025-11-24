import { query } from './_generated/server'
import { v } from 'convex/values'

/**
 * Retrieve all transactions, sorted by most recent first
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('transactions')
      .order('desc')
      .collect()
  },
})

/**
 * Retrieve transactions for a specific symbol
 */
export const listBySymbol = query({
  args: {
    symbol: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('symbol'), args.symbol))
      .order('desc')
      .collect()
  },
})

/**
 * Retrieve recent transactions (last N)
 */
export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10
    return await ctx.db
      .query('transactions')
      .order('desc')
      .take(limit)
  },
})