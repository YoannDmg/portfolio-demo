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
  const assets = useQuery(api.assets.list)
  const transactions = useQuery(api.transactions.listRecent, { limit: 20 })
  const addAsset = useMutation(api.assets.add)
  const removeAsset = useMutation(api.assets.remove)
  const get24hChanges = useAction(api.binance.get24hChanges)
  const getPrice = useAction(api.binance.getPrice)

  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [prices, setPrices] = useState<Record<string, PriceData>>({})
  const [loadingPrices, setLoadingPrices] = useState(false)
  const [addingAsset, setAddingAsset] = useState(false)
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
      } catch (error) {
        console.error('Failed to fetch prices:', error)
      } finally {
        setLoadingPrices(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [assets, get24hChanges])

  const handleAddAsset = async () => {
    if (!symbol || !quantity) {
      setError('Please enter symbol and quantity')
      return
    }

    setAddingAsset(true)
    setError('')

    try {
      let buyPrice: number

      if (useCustomPrice && customPrice) {
        buyPrice = parseFloat(customPrice)
      } else {
        const priceData = await getPrice({ symbol: symbol.toUpperCase() })
        buyPrice = priceData.price
      }

      await addAsset({
        symbol: symbol.toUpperCase(),
        quantity: parseFloat(quantity),
        avgBuyPrice: buyPrice,
      })

      setSymbol('')
      setQuantity('')
      setCustomPrice('')
      setUseCustomPrice(false)
    } catch (err) {
      setError(`Failed to add asset. Check if "${symbol.toUpperCase()}" is a valid symbol.`)
      console.error(err)
    } finally {
      setAddingAsset(false)
    }
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

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Invested
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Profit/Loss
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

        {/* Add Asset Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Asset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Symbol</label>
                <Input
                  type="text"
                  placeholder="BTC, ETH, SOL..."
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Buy Price</label>
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={useCustomPrice}
                      onChange={(e) => setUseCustomPrice(e.target.checked)}
                      className="rounded"
                    />
                    Custom
                  </label>
                </div>
                <Input
                  type="number"
                  placeholder={useCustomPrice ? "Enter price" : "Auto (current)"}
                  step="any"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  disabled={!useCustomPrice}
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleAddAsset}
                  disabled={addingAsset}
                  className="w-full"
                >
                  {addingAsset ? 'Adding...' : 'Add Asset'}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <p className="text-xs text-muted-foreground">
              Leave "Buy Price" unchecked to use the current market price from Binance.
            </p>
          </CardContent>
        </Card>

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
                <p className="text-sm text-muted-foreground">Add your first crypto asset above to get started</p>
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
                              onClick={() => removeAsset({ id: asset._id })}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
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
                <p className="text-sm text-muted-foreground">Your buy and sell history will appear here</p>
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
                      const total = tx.quantity * tx.price
                      const date = new Date(tx.timestamp)

                      return (
                        <TableRow key={tx._id}>
                          <TableCell>
                            <div className="text-sm">{date.toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={tx.type === 'buy' ? 'default' : 'destructive'}
                              className={tx.type === 'buy' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            >
                              {tx.type.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{tx.symbol}</TableCell>
                          <TableCell className="text-right font-mono">
                            {tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            ${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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