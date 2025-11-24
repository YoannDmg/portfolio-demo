import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function App() {
  const assets = useQuery(api.assets.list)
  const addAsset = useMutation(api.assets.add)
  const removeAsset = useMutation(api.assets.remove)

  const [symbol, setSymbol] = useState('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')

  const handleAddAsset = async () => {
    if (!symbol || !quantity || !price) return

    await addAsset({
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      avgBuyPrice: parseFloat(price),
    })

    setSymbol('')
    setQuantity('')
    setPrice('')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Portfolio Crypto</h1>

        {/* Add Asset Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add Asset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Symbol (BTC, ETH...)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <input
                type="number"
                placeholder="Buy Price ($)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <Button onClick={handleAddAsset}>Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {assets === undefined ? (
              <p>Loading...</p>
            ) : assets.length === 0 ? (
              <p className="text-muted-foreground">No assets yet. Add one above!</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Avg Buy Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset._id}>
                      <TableCell className="font-medium">{asset.symbol}</TableCell>
                      <TableCell>{asset.quantity}</TableCell>
                      <TableCell>${asset.avgBuyPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        ${(asset.quantity * asset.avgBuyPrice).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset({ id: asset._id })}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App