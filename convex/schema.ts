import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Wallet balance (USDT as base currency)
  wallet: defineTable({
    balance: v.number(),
  }),

  // Crypto holdings
  assets: defineTable({
    symbol: v.string(),
    quantity: v.number(),
    avgBuyPrice: v.number(),
  }),

  // Transaction history
  transactions: defineTable({
    type: v.union(
      v.literal('deposit'),
      v.literal('withdraw'),
      v.literal('buy'),
      v.literal('sell')
    ),
    symbol: v.optional(v.string()), // Only for buy/sell
    quantity: v.number(), // USDT for deposit/withdraw, crypto for buy/sell
    price: v.optional(v.number()), // Unit price for buy/sell
    total: v.number(), // Total USDT value
    timestamp: v.number(),
  }),

  // AI-generated alert notifications
  notifications: defineTable({
    symbol: v.string(),
    type: v.union(v.literal('price_up'), v.literal('price_down')),
    priceChange: v.number(),
    currentPrice: v.number(),
    aiAnalysis: v.string(),
    timestamp: v.number(),
    read: v.boolean(),
  }),
})
