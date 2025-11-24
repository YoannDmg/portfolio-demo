import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Retrieve all assets in the portfolio
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('assets').collect()
  },
})

/**
 * Add a new asset to the portfolio
 * If the asset already exists, updates quantity and recalculates weighted average price
 */
export const add = mutation({
  args: {
    symbol: v.string(),
    quantity: v.number(),
    avgBuyPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('assets')
      .filter((q) => q.eq(q.field('symbol'), args.symbol))
      .first()

    if (existing) {
      // Calculate new weighted average price
      const totalValue =
        existing.quantity * existing.avgBuyPrice +
        args.quantity * args.avgBuyPrice
      const totalQuantity = existing.quantity + args.quantity
      const newAvgPrice = totalValue / totalQuantity

      await ctx.db.patch(existing._id, {
        quantity: totalQuantity,
        avgBuyPrice: newAvgPrice,
      })
      return existing._id
    }

    return await ctx.db.insert('assets', {
      symbol: args.symbol,
      quantity: args.quantity,
      avgBuyPrice: args.avgBuyPrice,
    })
  },
})

/**
 * Remove an asset from the portfolio
 */
export const remove = mutation({
  args: {
    id: v.id('assets'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})