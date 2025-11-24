/**
 * @fileoverview Wallet operations card component
 * @description Provides deposit and withdraw functionality for USDT.
 * Manages local form state and delegates operations to parent handlers.
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WalletCardProps {
  /** Handler for deposit operations */
  onDeposit: (amount: number) => Promise<void>
  /** Handler for withdraw operations */
  onWithdraw: (amount: number) => Promise<void>
  /** Whether an operation is in progress */
  loading: boolean
}

/**
 * Card component for wallet deposit and withdrawal operations
 */
export function WalletCard({ onDeposit, onWithdraw, loading }: WalletCardProps) {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  /**
   * Process deposit and clear form on success
   */
  const handleDeposit = async () => {
    if (!depositAmount) return
    try {
      await onDeposit(parseFloat(depositAmount))
      setDepositAmount('')
    } catch {
      // Error handling delegated to parent component
    }
  }

  /**
   * Process withdrawal and clear form on success
   */
  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    try {
      await onWithdraw(parseFloat(withdrawAmount))
      setWithdrawAmount('')
    } catch {
      // Error handling delegated to parent component
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit / Withdraw USDT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deposit Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add funds to your wallet</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleDeposit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 w-24"
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Withdraw Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Withdraw from wallet</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleWithdraw}
              disabled={loading}
              className="w-24"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}