/**
 * @fileoverview Trading operations hook
 * @description Provides wallet and trading functionality with error handling.
 * Handles deposit, withdraw, buy, and sell operations at market price.
 */

import { useState } from 'react'
import { useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook for managing all trading and wallet operations
 *
 * @returns Object containing:
 *   - loading: Whether an operation is in progress
 *   - error: Error message from last failed operation
 *   - clearError: Function to clear error state
 *   - handleDeposit: Deposit USDT into wallet
 *   - handleWithdraw: Withdraw USDT from wallet
 *   - handleBuy: Buy crypto at market price
 *   - handleSell: Sell crypto at market price
 *
 * @example
 * ```tsx
 * const { handleBuy, loading, error } = useTrading()
 * await handleBuy('BTC', 0.5) // Buy 0.5 BTC at market price
 * ```
 */
export function useTrading() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Convex mutations and actions
  const deposit = useMutation(api.wallet.deposit)
  const withdraw = useMutation(api.wallet.withdraw)
  const buy = useMutation(api.trading.buy)
  const sell = useMutation(api.trading.sell)
  const getPrice = useAction(api.binance.getPrice)

  /** Clear any existing error message */
  const clearError = () => setError('')

  /**
   * Deposit USDT into wallet
   * @param amount - Amount of USDT to deposit
   * @throws Re-throws error after setting error state
   */
  const handleDeposit = async (amount: number) => {
    if (amount <= 0) return

    setLoading(true)
    setError('')
    try {
      await deposit({ amount })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Withdraw USDT from wallet
   * @param amount - Amount of USDT to withdraw
   * @throws Re-throws error after setting error state
   */
  const handleWithdraw = async (amount: number) => {
    if (amount <= 0) return

    setLoading(true)
    setError('')
    try {
      await withdraw({ amount })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Buy cryptocurrency at current market price
   * @param symbol - Crypto symbol (e.g., "BTC", "ETH")
   * @param quantity - Amount of crypto to buy
   * @throws Re-throws error after setting error state
   */
  const handleBuy = async (symbol: string, quantity: number) => {
    if (!symbol || quantity <= 0) {
      setError('Enter symbol and quantity')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Fetch current market price from Binance
      const priceData = await getPrice({ symbol: symbol.toUpperCase() })
      await buy({
        symbol: symbol.toUpperCase(),
        quantity,
        price: priceData.price,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buy failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sell cryptocurrency at current market price
   * @param symbol - Crypto symbol (e.g., "BTC", "ETH")
   * @param quantity - Amount of crypto to sell
   * @throws Re-throws error after setting error state
   */
  const handleSell = async (symbol: string, quantity: number) => {
    if (!symbol || quantity <= 0) {
      setError('Enter symbol and quantity')
      return
    }

    setLoading(true)
    setError('')
    try {
      // Fetch current market price from Binance
      const priceData = await getPrice({ symbol: symbol.toUpperCase() })
      await sell({
        symbol: symbol.toUpperCase(),
        quantity,
        price: priceData.price,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sell failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    clearError,
    handleDeposit,
    handleWithdraw,
    handleBuy,
    handleSell,
  }
}