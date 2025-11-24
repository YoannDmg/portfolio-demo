import { action } from './_generated/server'
import { v } from 'convex/values'

const BINANCE_API = 'https://data-api.binance.vision'

/**
 * Fetch current price for a single symbol from Binance API
 */
export const getPrice = action({
  args: {
    symbol: v.string(),
  },
  handler: async (_ctx, args) => {
    const pair = `${args.symbol}USDT`
    const response = await fetch(
      `${BINANCE_API}/api/v3/ticker/price?symbol=${pair}`
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch price for ${args.symbol}: ${error}`)
    }

    const data = await response.json()
    return {
      symbol: args.symbol,
      price: parseFloat(data.price),
    }
  },
})

/**
 * Fetch current prices for multiple symbols from Binance API
 */
export const getPrices = action({
  args: {
    symbols: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    if (args.symbols.length === 0) {
      return []
    }

    const pairs = args.symbols.map((s) => `"${s}USDT"`).join(',')
    const response = await fetch(
      `${BINANCE_API}/api/v3/ticker/price?symbols=[${pairs}]`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch prices from Binance')
    }

    const data = await response.json()

    return data.map((item: { symbol: string; price: string }) => ({
      symbol: item.symbol.replace('USDT', ''),
      price: parseFloat(item.price),
    }))
  },
})

/**
 * Fetch 24h price change statistics for a symbol
 * Returns current price and 24h change percentage
 */
export const get24hChange = action({
  args: {
    symbol: v.string(),
  },
  handler: async (_ctx, args) => {
    const pair = `${args.symbol}USDT`
    const response = await fetch(
      `${BINANCE_API}/api/v3/ticker/24hr?symbol=${pair}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch 24h data for ${args.symbol}`)
    }

    const data = await response.json()
    return {
      symbol: args.symbol,
      price: parseFloat(data.lastPrice),
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      high24h: parseFloat(data.highPrice),
      low24h: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
    }
  },
})

/**
 * Fetch 24h price change statistics for multiple symbols
 */
export const get24hChanges = action({
  args: {
    symbols: v.array(v.string()),
  },
  handler: async (_ctx, args) => {
    if (args.symbols.length === 0) {
      return []
    }

    const pairs = args.symbols.map((s) => `"${s}USDT"`).join(',')
    const response = await fetch(
      `${BINANCE_API}/api/v3/ticker/24hr?symbols=[${pairs}]`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch 24h data from Binance')
    }

    const data = await response.json()

    return data.map((item: {
      symbol: string
      lastPrice: string
      priceChange: string
      priceChangePercent: string
      highPrice: string
      lowPrice: string
      volume: string
    }) => ({
      symbol: item.symbol.replace('USDT', ''),
      price: parseFloat(item.lastPrice),
      priceChange: parseFloat(item.priceChange),
      priceChangePercent: parseFloat(item.priceChangePercent),
      high24h: parseFloat(item.highPrice),
      low24h: parseFloat(item.lowPrice),
      volume: parseFloat(item.volume),
    }))
  },
})