/**
 * @fileoverview Transaction history component
 * @description Displays a chronological list of all wallet and trading transactions.
 * Supports loading and empty states with color-coded transaction types.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/types'

interface TransactionHistoryProps {
  /** List of transactions to display */
  transactions: Transaction[] | undefined
}

/**
 * Color mapping for transaction type badges
 * @param type - Transaction type
 * @returns Tailwind CSS classes for badge styling
 */
const getBadgeColor = (type: string): string => {
  const colors: Record<string, string> = {
    deposit: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    withdraw: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    buy: 'bg-green-100 text-green-800 hover:bg-green-100',
    sell: 'bg-red-100 text-red-800 hover:bg-red-100',
  }
  return colors[type] || ''
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
 * Table displaying transaction history
 *
 * Columns:
 * - Date: Transaction timestamp
 * - Type: Color-coded transaction type (deposit, withdraw, buy, sell)
 * - Asset: Symbol or USDT for wallet operations
 * - Quantity: Amount of crypto or USDT
 * - Price: Unit price (for trades only)
 * - Total: Total USDT value
 */
export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  // Loading state
  if (transactions === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
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
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Your transaction history will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const date = new Date(tx.timestamp)

                return (
                  <TableRow key={tx._id}>
                    {/* Date & Time */}
                    <TableCell>
                      <div className="text-sm">{date.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleTimeString()}
                      </div>
                    </TableCell>

                    {/* Transaction Type */}
                    <TableCell>
                      <Badge className={getBadgeColor(tx.type)}>
                        {tx.type.toUpperCase()}
                      </Badge>
                    </TableCell>

                    {/* Asset Symbol */}
                    <TableCell className="font-medium">
                      {tx.symbol || 'USDT'}
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-right font-mono">
                      {formatQuantity(tx.quantity)}
                    </TableCell>

                    {/* Unit Price (trades only) */}
                    <TableCell className="text-right font-mono">
                      {tx.price ? `$${formatCurrency(tx.price)}` : '-'}
                    </TableCell>

                    {/* Total Value */}
                    <TableCell className="text-right font-mono font-medium">
                      ${formatCurrency(tx.total)}
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