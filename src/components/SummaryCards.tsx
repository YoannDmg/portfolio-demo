/**
 * @fileoverview Portfolio summary cards component
 * @description Displays key portfolio metrics in a responsive card grid.
 * Shows USDT balance, portfolio value, and profit/loss.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PortfolioStats } from '@/types'

interface SummaryCardsProps {
  /** Available USDT balance in wallet */
  walletBalance: number
  /** Aggregated portfolio statistics */
  stats: PortfolioStats
  /** Number of different assets held */
  assetCount: number
}

/**
 * Formats a number as currency with 2 decimal places
 */
const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Grid of summary cards displaying portfolio KPIs
 */
export function SummaryCards({ walletBalance, stats, assetCount }: SummaryCardsProps) {
  const { totalValue, totalPnL, totalPnLPercent } = stats
  const isProfitable = totalPnL >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* USDT Balance Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            USDT Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${formatCurrency(walletBalance)}</p>
          <p className="text-sm text-muted-foreground">Available for trading</p>
        </CardContent>
      </Card>

      {/* Portfolio Value Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Portfolio Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">${formatCurrency(totalValue)}</p>
          <p className="text-sm text-muted-foreground">
            {assetCount} asset{assetCount !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Profit/Loss Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Profit/Loss
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {isProfitable ? '+' : ''}${formatCurrency(totalPnL)}
          </p>
          <p className={`text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}