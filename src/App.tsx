/**
 * @fileoverview Main application component
 * @description Root component that orchestrates the crypto portfolio dashboard.
 * Handles data fetching and passes state to child components.
 */

import { useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { usePrices, useTrading, usePortfolioStats } from '@/hooks'
import {
  Header,
  SummaryCards,
  WalletCard,
  TradingCard,
  HoldingsTable,
  TransactionHistory,
  ErrorAlert,
} from '@/components'

/**
 * Main application component
 *
 * Responsibilities:
 * - Fetch portfolio data from Convex
 * - Fetch real-time prices from Binance
 * - Calculate portfolio statistics
 * - Render dashboard layout with child components
 */
function App() {
  // ============================================================================
  // Data Fetching (Convex)
  // ============================================================================

  /** Current USDT wallet balance */
  const walletBalance = useQuery(api.wallet.getBalance)

  /** List of all portfolio assets */
  const assets = useQuery(api.assets.list)

  /** Recent transactions (last 20) */
  const transactions = useQuery(api.transactions.listRecent, { limit: 20 })

  // ============================================================================
  // Hooks
  // ============================================================================

  /** Real-time prices with auto-refresh */
  const { prices, loading: loadingPrices } = usePrices(assets)

  /** Trading operations with error handling */
  const { loading, error, handleDeposit, handleWithdraw, handleBuy, handleSell } = useTrading()

  /** Calculated portfolio statistics */
  const stats = usePortfolioStats(assets, prices)

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with price update indicator */}
        <Header loadingPrices={loadingPrices} />

        {/* Error display */}
        <ErrorAlert message={error} />

        {/* Portfolio KPIs */}
        <SummaryCards
          walletBalance={walletBalance ?? 0}
          stats={stats}
          assetCount={assets?.length ?? 0}
        />

        {/* Wallet and Trading cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WalletCard
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            loading={loading}
          />
          <TradingCard
            assets={assets}
            onBuy={handleBuy}
            onSell={handleSell}
            loading={loading}
          />
        </div>

        {/* Portfolio holdings */}
        <HoldingsTable
          assets={assets}
          prices={prices}
          onSellAll={handleSell}
          loading={loading}
        />

        {/* Transaction history */}
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  )
}

export default App