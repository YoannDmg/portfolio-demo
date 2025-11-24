/**
 * @fileoverview Holdings table component
 * @description Displays portfolio assets with real-time prices, P&L calculations,
 * and quick sell functionality. Supports loading and empty states.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Asset, PriceData } from '@/types'

interface HoldingsTableProps {
  /** Portfolio assets to display */
  assets: Asset[] | undefined
  /** Current prices keyed by symbol */
  prices: Record<string, PriceData>
  /** Handler for selling entire position */
  onSellAll: (symbol: string, quantity: number) => Promise<void>
  /** Whether an operation is in progress */
  loading: boolean
}

/**
 * Formats a number as currency with 2 decimal places
 */
const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Formats a quantity with up to 8 decimal places
 */
const formatQuantity = (value: number): string =>
  value.toLocaleString(undefined, { maximumFractionDigits: 8 })

/**
 * Table displaying all portfolio holdings with performance metrics
 *
 * Columns:
 * - Asset: Symbol and trading pair
 * - Holdings: Quantity owned
 * - Avg Buy: Average purchase price
 * - Price: Current market price
 * - 24h: 24-hour price change
 * - Value: Current position value
 * - P&L: Profit/loss for position
 * - Actions: Sell all button
 */
export function HoldingsTable({ assets, prices, onSellAll, loading }: HoldingsTableProps) {
  // Loading state
  if (assets === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No assets in your portfolio</p>
            <p className="text-sm text-muted-foreground">
              Deposit USDT and buy crypto to get started
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Holdings</TableHead>
                <TableHead className="text-right">Avg Buy</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => {
                // Get current price data, fallback to avg buy price
                const priceData = prices[asset.symbol]
                const currentPrice = priceData?.price || asset.avgBuyPrice
                const change24h = priceData?.priceChangePercent || 0

                // Calculate position metrics
                const value = asset.quantity * currentPrice
                const cost = asset.quantity * asset.avgBuyPrice
                const pnl = value - cost
                const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0
                const isProfitable = pnl >= 0

                return (
                  <TableRow key={asset._id}>
                    {/* Asset Info */}
                    <TableCell>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {asset.symbol}/USDT
                      </div>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-right font-mono">
                      {formatQuantity(asset.quantity)}
                    </TableCell>

                    {/* Average Buy Price */}
                    <TableCell className="text-right font-mono">
                      ${formatCurrency(asset.avgBuyPrice)}
                    </TableCell>

                    {/* Current Price */}
                    <TableCell className="text-right font-mono">
                      ${formatCurrency(currentPrice)}
                    </TableCell>

                    {/* 24h Change */}
                    <TableCell className="text-right">
                      <Badge
                        variant={change24h >= 0 ? 'default' : 'destructive'}
                        className={change24h >= 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                      >
                        {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                      </Badge>
                    </TableCell>

                    {/* Position Value */}
                    <TableCell className="text-right font-mono font-medium">
                      ${formatCurrency(value)}
                    </TableCell>

                    {/* Profit/Loss */}
                    <TableCell className="text-right">
                      <div className={`font-mono font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                        {isProfitable ? '+' : ''}${formatCurrency(pnl)}
                      </div>
                      <div className={`text-xs ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                        {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSellAll(asset.symbol, asset.quantity)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Sell All
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}