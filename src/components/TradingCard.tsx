/**
 * @fileoverview Trading card component
 * @description Provides buy and sell functionality for cryptocurrencies.
 * Includes form validation and visual feedback for sell eligibility.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Asset } from '@/types'

interface TradingCardProps {
  /** Current portfolio assets for sell validation */
  assets: Asset[] | undefined
  /** Handler for buy operations */
  onBuy: (symbol: string, quantity: number) => Promise<void>
  /** Handler for sell operations */
  onSell: (symbol: string, quantity: number) => Promise<void>
  /** Whether an operation is in progress */
  loading: boolean
}

/**
 * Card component for buying and selling cryptocurrencies
 *
 * Features:
 * - Buy any crypto by symbol at market price
 * - Sell owned crypto with validation
 * - Visual feedback on sell button (red shades indicate validity)
 */
export function TradingCard({ assets, onBuy, onSell, loading }: TradingCardProps) {
  // Buy form state
  const [buySymbol, setBuySymbol] = useState('')
  const [buyQuantity, setBuyQuantity] = useState('')

  // Sell form state
  const [sellSymbol, setSellSymbol] = useState('')
  const [sellQuantity, setSellQuantity] = useState('')

  /**
   * Process buy order and clear form on success
   */
  const handleBuy = async () => {
    if (!buySymbol || !buyQuantity) return
    try {
      await onBuy(buySymbol, parseFloat(buyQuantity))
      setBuySymbol('')
      setBuyQuantity('')
    } catch {
      // Error handling delegated to parent component
    }
  }

  /**
   * Process sell order and clear form on success
   */
  const handleSell = async () => {
    if (!sellSymbol || !sellQuantity) return
    try {
      await onSell(sellSymbol, parseFloat(sellQuantity))
      setSellSymbol('')
      setSellQuantity('')
    } catch {
      // Error handling delegated to parent component
    }
  }

  /**
   * Check if sell order is valid:
   * - Symbol and quantity provided
   * - Quantity is positive
   * - User owns sufficient amount of the asset
   */
  const canSell =
    sellSymbol &&
    sellQuantity &&
    parseFloat(sellQuantity) > 0 &&
    assets?.find(
      (a) =>
        a.symbol === sellSymbol.toUpperCase() &&
        a.quantity >= parseFloat(sellQuantity)
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy / Sell Crypto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buy Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buy crypto with USDT</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="BTC"
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value.toUpperCase())}
              className="w-20 shrink-0"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={buyQuantity}
              onChange={(e) => setBuyQuantity(e.target.value)}
              className="min-w-0"
            />
            <Button
              onClick={handleBuy}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 shrink-0"
            >
              Buy
            </Button>
          </div>
        </div>

        {/* Sell Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sell crypto for USDT</label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="BTC"
              value={sellSymbol}
              onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
              className="w-20 shrink-0"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              className="min-w-0"
            />
            {/* Sell button: darker red when valid, lighter when invalid */}
            <Button
              onClick={handleSell}
              disabled={loading}
              className={`shrink-0 text-white ${
                canSell
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-300 hover:bg-red-400'
              }`}
            >
              Sell
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Market prices from Binance</p>
      </CardContent>
    </Card>
  )
}