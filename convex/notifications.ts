import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Retrieve all notifications ordered by most recent first
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('notifications')
      .order('desc')
      .collect()
  },
})

/**
 * Retrieve only unread notifications
 */
export const listUnread = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('read'), false))
      .order('desc')
      .collect()
  },
})

/**
 * Create a new price alert notification
 */
export const create = mutation({
  args: {
    symbol: v.string(),
    type: v.union(v.literal('price_up'), v.literal('price_down')),
    priceChange: v.number(),
    currentPrice: v.number(),
    aiAnalysis: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('notifications', {
      symbol: args.symbol,
      type: args.type,
      priceChange: args.priceChange,
      currentPrice: args.currentPrice,
      aiAnalysis: args.aiAnalysis,
      timestamp: Date.now(),
      read: false,
    })
  },
})

/**
 * Mark a single notification as read
 */
export const markAsRead = mutation({
  args: {
    id: v.id('notifications'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true })
  },
})

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query('notifications')
      .filter((q) => q.eq(q.field('read'), false))
      .collect()

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true })
    }
  },
})