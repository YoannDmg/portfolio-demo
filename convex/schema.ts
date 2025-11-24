import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // Actifs du portfolio (ex: 0.5 BTC, 2 ETH)
  assets: defineTable({
    symbol: v.string(), // "BTC", "ETH", etc.
    quantity: v.number(), // Quantité détenue
    avgBuyPrice: v.number(), // Prix moyen d'achat en USD
  }),

  // Historique des transactions
  transactions: defineTable({
    symbol: v.string(),
    type: v.union(v.literal('buy'), v.literal('sell')),
    quantity: v.number(),
    price: v.number(), // Prix unitaire au moment de la transaction
    timestamp: v.number(), // Date de la transaction
  }),

  // Notifications d'alertes avec analyse IA
  notifications: defineTable({
    symbol: v.string(),
    type: v.union(v.literal('price_up'), v.literal('price_down')),
    priceChange: v.number(), // Variation en %
    currentPrice: v.number(),
    aiAnalysis: v.string(), // Commentaire généré par l'IA
    timestamp: v.number(),
    read: v.boolean(), // Notification lue ou non
  }),
})
