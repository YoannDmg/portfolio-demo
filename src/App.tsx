import { useState, useEffect } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PriceData = {
  symbol: string
  price: number
  priceChangePercent: number
}

function App() {
  const walletBalance = useQuery(api.wallet.getBalance)
  const assets = useQuery(api.assets.list)
  const transactions = useQuery(api.transactions.listRecent, { limit: 20 })

  const deposit = useMutation(api.wallet.deposit)
  const withdraw = useMutation(api.wallet.withdraw)
  const buy = useMutation(api.trading.buy)
  const sell = useMutation(api.trading.sell)
  const get24hChanges = useAction(api.binance.get24hChanges)
  const getPrice = useAction(api.binance.getPrice)

  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [buySymbol, setBuySymbol] = useState('')
  const [buyQuantity, setBuyQuantity] = useState('')
  const [sellSymbol, setSellSymbol] = useState('')
  const [sellQuantity, setSellQuantity] = useState('')
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch prices when assets change
  useEffect(() => {
    const fetchPrices = async () => {
      if (!assets || assets.length === 0) return

      setLoadingPrices(true)
      try {
        const symbols = assets.map((a) => a.symbol)
        const data = await get24hChanges({ symbols })
        const priceMap: Record<string, PriceData> = {}
        for (const item of data) {
          priceMap[item.symbol] = item
        }
        setPrices(priceMap)
      } catch (err) {
        console.error('Failed to fetch prices:', err)
      } finally {
        setLoadingPrices(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [assets, get24hChanges])

  const handleDeposit = async () => {
    if (!depositAmount) return
    setLoading(true)
    setError('')
    try {
      await deposit({ amount: parseFloat(depositAmount) })
      setDepositAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    setLoading(true)
    setError('')
    try {
      await withdraw({ amount: parseFloat(withdrawAmount) })
      setWithdrawAmount('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!buySymbol || !buyQuantity) {
      setError('Enter symbol and quantity')
      return
    }
    setLoading(true)
    setError('')
    try {
      const priceData = await getPrice({ symbol: buySymbol.toUpperCase() })
      await buy({
        symbol: buySymbol.toUpperCase(),
        quantity: parseFloat(buyQuantity),
        price: priceData.price,
      })
      setBuySymbol('')
      setBuyQuantity('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buy failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSell = async (symbol: string, quantity: number) => {
    setLoading(true)
    setError('')
    try {
      const priceData = await getPrice({ symbol })
      await sell({
        symbol,
        quantity,
        price: priceData.price,
      })
      setSellSymbol('')
      setSellQuantity('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sell failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSellPartial = async () => {
    if (!sellSymbol || !sellQuantity) {
      setError('Enter symbol and quantity')
      return
    }
    await handleSell(sellSymbol.toUpperCase(), parseFloat(sellQuantity))
  }

  // Calculate totals
  const totalValue = assets?.reduce((sum, asset) => {
    const currentPrice = prices[asset.symbol]?.price || asset.avgBuyPrice
    return sum + asset.quantity * currentPrice
  }, 0) || 0

  const totalCost = assets?.reduce((sum, asset) => {
    return sum + asset.quantity * asset.avgBuyPrice
  }, 0) || 0

  const totalPnL = totalValue - totalCost
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      case 'withdraw': return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
      case 'buy': return 'bg-green-100 text-green-800 hover:bg-green-100'
      case 'sell': return 'bg-red-100 text-red-800 hover:bg-red-100'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Crypto Portfolio</h1>
          {loadingPrices && (
            <Badge variant="outline" className="animate-pulse">
              Updating prices...
            </Badge>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                USDT Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${(walletBalance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                Available for trading
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Portfolio Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                {assets?.length ?? 0} asset{(assets?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className={`text-sm ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Deposit/Withdraw & Buy/Sell */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit/Withdraw */}
          <Card>
            <CardHeader>
              <CardTitle>Deposit / Withdraw USDT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Button onClick={handleDeposit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 w-24">
                    Deposit
                  </Button>
                </div>
              </div>
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
                  <Button variant="outline" onClick={handleWithdraw} disabled={loading} className="w-24">
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buy/Sell */}
          <Card>
            <CardHeader>
              <CardTitle>Buy / Sell Crypto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Button onClick={handleBuy} disabled={loading} className="bg-green-600 hover:bg-green-700 shrink-0">
                    Buy
                  </Button>
                </div>
              </div>
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
                  <Button
                    onClick={handleSellPartial}
                    disabled={loading}
                    className={`shrink-0 text-white ${
                      sellSymbol &&
                      sellQuantity &&
                      parseFloat(sellQuantity) > 0 &&
                      assets?.find(
                        (a) =>
                          a.symbol === sellSymbol.toUpperCase() &&
                          a.quantity >= parseFloat(sellQuantity)
                      )
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-300 hover:bg-red-400'
                    }`}
                  >
                    Sell
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Market prices from Binance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            {assets === undefined ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">No assets in your portfolio</p>
                <p className="text-sm text-muted-foreground">Deposit USDT and buy crypto to get started</p>
              </div>
            ) : (
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
                      const priceData = prices[asset.symbol]
                      const currentPrice = priceData?.price || asset.avgBuyPrice
                      const change24h = priceData?.priceChangePercent || 0
                      const value = asset.quantity * currentPrice
                      const cost = asset.quantity * asset.avgBuyPrice
                      const pnl = value - cost
                      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0

                      return (
                        <TableRow key={asset._id}>
                          <TableCell>
                            <div className="font-medium">{asset.symbol}</div>
                            <div className="text-xs text-muted-foreground">{asset.symbol}/USDT</div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${asset.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={change24h >= 0 ? 'default' : 'destructive'}
                              className={change24h >= 0 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            >
                              {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={`font-mono font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className={`text-xs ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSell(asset.symbol, asset.quantity)}
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
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions === undefined ? (
              <div className="flex justify-center py-8">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-2">No transactions yet</p>
                <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
              </div>
            ) : (
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
                          <TableCell>
                            <div className="text-sm">{date.toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeColor(tx.type)}>
                              {tx.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {tx.symbol || 'USDT'}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.price ? `$${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App