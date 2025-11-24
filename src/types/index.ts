/**
 * @fileoverview Application type definitions
 * @description Centralized type exports for the crypto portfolio application.
 * Includes document types from Convex and custom application types.
 */

import type { Doc } from '../../convex/_generated/dataModel'

// ============================================================================
// Document Types (Convex)
// ============================================================================

/** Crypto asset holding in the portfolio */
export type Asset = Doc<'assets'>

/** Transaction record (deposit, withdraw, buy, sell) */
export type Transaction = Doc<'transactions'>

/** Price alert notification with AI analysis */
export type Notification = Doc<'notifications'>

// ============================================================================
// Application Types
// ============================================================================

/**
 * Real-time price data from Binance API
 * @property symbol - Crypto symbol (e.g., "BTC", "ETH")
 * @property price - Current price in USDT
 * @property priceChangePercent - 24h price change percentage
 */
export type PriceData = {
  symbol: string
  price: number
  priceChangePercent: number
}

/**
 * Aggregated portfolio statistics
 * @property totalValue - Current market value of all holdings
 * @property totalCost - Total amount invested (cost basis)
 * @property totalPnL - Unrealized profit/loss in USDT
 * @property totalPnLPercent - Unrealized profit/loss percentage
 */
export type PortfolioStats = {
  totalValue: number
  totalCost: number
  totalPnL: number
  totalPnLPercent: number
}