/**
 * @fileoverview Price alert system
 * @description Monitors portfolio assets for significant price changes
 * and generates AI-powered analysis using OpenRouter API.
 */

import { action, internalAction, internalMutation, internalQuery } from './_generated/server'
import { internal } from './_generated/api'
import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'

// ============================================================================
// Constants
// ============================================================================

const BINANCE_API = 'https://data-api.binance.vision'
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'

/** Alert threshold: trigger if 24h price change exceeds this percentage */
const PRICE_CHANGE_THRESHOLD = 5

// ============================================================================
// Types
// ============================================================================

type BinanceTicker = {
  symbol: string
  priceChangePercent: string
  lastPrice: string
}

// ============================================================================
// AI Analysis
// ============================================================================

/**
 * Generate AI analysis for a price alert using OpenRouter
 * Falls back to a simple message if API key is not configured
 *
 * @param symbol - Crypto symbol (e.g., "BTC")
 * @param priceChange - 24h price change percentage
 * @param currentPrice - Current price in USDT
 * @param type - Alert type (price_up or price_down)
 * @returns AI-generated analysis or fallback message
 */
async function generateAIAnalysis(
  symbol: string,
  priceChange: number,
  currentPrice: number,
  type: 'price_up' | 'price_down',
  apiKey: string | undefined
): Promise<string> {
  // Fallback if no API key configured
  if (!apiKey) {
    const direction = type === 'price_up' ? 'increased' : 'decreased'
    return `${symbol} has ${direction} by ${Math.abs(priceChange).toFixed(2)}%. Current price: $${currentPrice.toFixed(2)}`
  }

  const direction = type === 'price_up' ? 'increased' : 'decreased'
  const prompt = `You are a crypto market analyst. Provide a brief (2-3 sentences max) analysis for this alert:
${symbol} price has ${direction} by ${Math.abs(priceChange).toFixed(2)}% in the last 24 hours.
Current price: $${currentPrice.toFixed(2)}

Be concise, professional, and mention potential market factors. Do not give financial advice.`

  try {
    const response = await fetch(OPENROUTER_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenRouter API error')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'No analysis available.'
  } catch (error) {
    console.error('AI analysis failed:', error)
    const fallbackDirection = type === 'price_up' ? 'surged' : 'dropped'
    return `${symbol} has ${fallbackDirection} by ${Math.abs(priceChange).toFixed(2)}%. Current price: $${currentPrice.toFixed(2)}`
  }
}

// ============================================================================
// Internal Functions
// ============================================================================

/**
 * Internal query to get all portfolio assets
 */
export const getAssets = internalQuery({
  args: {},
  handler: async (ctx): Promise<Doc<'assets'>[]> => {
    return await ctx.db.query('assets').collect()
  },
})

/**
 * Internal mutation to create a notification
 */
export const createNotification = internalMutation({
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
 * Internal action to check price alerts for all portfolio assets
 * Called by the cron job every 5 minutes
 */
export const checkPriceAlerts = internalAction({
  args: {},
  handler: async (ctx): Promise<{ checked: number; alerts: number }> => {
    // Get all assets from the database
    const assets: Doc<'assets'>[] = await ctx.runQuery(internal.alerts.getAssets)

    if (assets.length === 0) {
      return { checked: 0, alerts: 0 }
    }

    // Fetch 24h price changes from Binance
    const symbols: string[] = assets.map((a: Doc<'assets'>) => a.symbol)
    const pairs = symbols.map((s: string) => `"${s}USDT"`).join(',')

    const response = await fetch(
      `${BINANCE_API}/api/v3/ticker/24hr?symbols=[${pairs}]`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch price data from Binance')
    }

    const data: BinanceTicker[] = await response.json()
    let alertsCreated = 0

    // Get OpenRouter API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY

    // Check each asset for significant price changes
    for (const ticker of data) {
      const symbol = ticker.symbol.replace('USDT', '')
      const priceChange = parseFloat(ticker.priceChangePercent)
      const currentPrice = parseFloat(ticker.lastPrice)

      // Skip if price change is below threshold
      if (Math.abs(priceChange) < PRICE_CHANGE_THRESHOLD) {
        continue
      }

      const type: 'price_up' | 'price_down' = priceChange > 0 ? 'price_up' : 'price_down'

      // Generate AI analysis
      const aiAnalysis = await generateAIAnalysis(
        symbol,
        priceChange,
        currentPrice,
        type,
        apiKey
      )

      // Create notification
      await ctx.runMutation(internal.alerts.createNotification, {
        symbol,
        type,
        priceChange,
        currentPrice,
        aiAnalysis,
      })

      alertsCreated++
    }

    return { checked: symbols.length, alerts: alertsCreated }
  },
})

// ============================================================================
// Public Actions
// ============================================================================

/**
 * Manual trigger for testing alerts
 * Can be called from the frontend to immediately check prices
 */
export const triggerCheck = action({
  args: {},
  handler: async (ctx): Promise<{ checked: number; alerts: number }> => {
    const result = await ctx.runAction(internal.alerts.checkPriceAlerts)
    return result
  },
})