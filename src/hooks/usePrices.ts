/**
 * @fileoverview Real-time price fetching hook
 * @description Fetches and maintains live cryptocurrency prices from Binance API.
 * Automatically refreshes prices every 30 seconds.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { PriceData, Asset } from '@/types'

/** Price refresh interval in milliseconds (30 seconds) */
const REFRESH_INTERVAL_MS = 30000

/**
 * Hook for fetching and managing real-time cryptocurrency prices
 *
 * @param assets - List of portfolio assets to fetch prices for
 * @returns Object containing:
 *   - prices: Record mapping symbol to price data
 *   - loading: Whether prices are currently being fetched
 *   - refetch: Function to manually trigger price refresh
 *
 * @example
 * ```tsx
 * const { prices, loading } = usePrices(assets)
 * const btcPrice = prices['BTC']?.price
 * ```
 */
export function usePrices(assets: Asset[] | undefined) {
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loading, setLoading] = useState(false)
  const get24hChanges = useAction(api.binance.get24hChanges)

  const fetchPrices = useCallback(async () => {
    if (!assets || assets.length === 0) return

    setLoading(true)
    try {
      const symbols = assets.map((a) => a.symbol)
      const data = await get24hChanges({ symbols })

      // Transform array to record for O(1) lookup
      const priceMap: Record<string, PriceData> = {}
      for (const item of data) {
        priceMap[item.symbol] = item
      }
      setPrices(priceMap)
    } catch (err) {
      console.error('Failed to fetch prices:', err)
    } finally {
      setLoading(false)
    }
  }, [assets, get24hChanges])

  // Fetch prices on mount and set up auto-refresh interval
  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchPrices])

  return { prices, loading, refetch: fetchPrices }
}