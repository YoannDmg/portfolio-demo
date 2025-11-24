/**
 * @fileoverview Portfolio statistics calculator hook
 * @description Computes aggregated portfolio metrics including total value,
 * cost basis, and profit/loss calculations. Memoized for performance.
 */

import { useMemo } from 'react'
import type { Asset, PriceData, PortfolioStats } from '@/types'

/**
 * Hook for calculating portfolio performance metrics
 *
 * Uses current market prices when available, falls back to average buy price
 * for assets without live price data.
 *
 * @param assets - List of portfolio assets
 * @param prices - Record of current prices keyed by symbol
 * @returns Aggregated portfolio statistics
 *
 * @example
 * ```tsx
 * const stats = usePortfolioStats(assets, prices)
 * console.log(`P&L: ${stats.totalPnLPercent.toFixed(2)}%`)
 * ```
 */
export function usePortfolioStats(
  assets: Asset[] | undefined,
  prices: Record<string, PriceData>
): PortfolioStats {
  return useMemo(() => {
    // Calculate current market value of all holdings
    const totalValue =
      assets?.reduce((sum, asset) => {
        const currentPrice = prices[asset.symbol]?.price || asset.avgBuyPrice
        return sum + asset.quantity * currentPrice
      }, 0) || 0

    // Calculate total cost basis (amount originally invested)
    const totalCost =
      assets?.reduce((sum, asset) => {
        return sum + asset.quantity * asset.avgBuyPrice
      }, 0) || 0

    // Calculate unrealized profit/loss
    const totalPnL = totalValue - totalCost
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

    return { totalValue, totalCost, totalPnL, totalPnLPercent }
  }, [assets, prices])
}