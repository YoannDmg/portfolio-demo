import { mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Buy crypto with USDT
 * Deducts from wallet balance, adds to assets
 */
export const buy = mutation({
  args: {
    symbol: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      throw new Error('Quantity must be positive')
    }
    if (args.price <= 0) {
      throw new Error('Price must be positive')
    }

    const total = args.quantity * args.price

    // Check wallet balance
    const wallet = await ctx.db.query('wallet').first()
    const balance = wallet?.balance ?? 0

    if (total > balance) {
      throw new Error(`Insufficient USDT balance. Need ${total.toFixed(2)}, have ${balance.toFixed(2)}`)
    }

    // Deduct from wallet
    await ctx.db.patch(wallet!._id, {
      balance: balance - total,
    })

    // Update or create asset
    const existing = await ctx.db
      .query('assets')
      .filter((q) => q.eq(q.field('symbol'), args.symbol))
      .first()

    if (existing) {
      const totalValue = existing.quantity * existing.avgBuyPrice + total
      const totalQuantity = existing.quantity + args.quantity
      const newAvgPrice = totalValue / totalQuantity

      await ctx.db.patch(existing._id, {
        quantity: totalQuantity,
        avgBuyPrice: newAvgPrice,
      })
    } else {
      await ctx.db.insert('assets', {
        symbol: args.symbol,
        quantity: args.quantity,
        avgBuyPrice: args.price,
      })
    }

    // Record transaction
    await ctx.db.insert('transactions', {
      type: 'buy',
      symbol: args.symbol,
      quantity: args.quantity,
      price: args.price,
      total: total,
      timestamp: Date.now(),
    })
  },
})

/**
 * Sell crypto for USDT
 * Deducts from assets, adds to wallet balance
 */
export const sell = mutation({
  args: {
    symbol: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      throw new Error('Quantity must be positive')
    }
    if (args.price <= 0) {
      throw new Error('Price must be positive')
    }

    // Check asset balance
    const asset = await ctx.db
      .query('assets')
      .filter((q) => q.eq(q.field('symbol'), args.symbol))
      .first()

    if (!asset) {
      throw new Error(`You don't own any ${args.symbol}`)
    }

    if (args.quantity > asset.quantity) {
      throw new Error(`Insufficient ${args.symbol}. Have ${asset.quantity}, trying to sell ${args.quantity}`)
    }

    const total = args.quantity * args.price

    // Add to wallet
    const wallet = await ctx.db.query('wallet').first()
    if (wallet) {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + total,
      })
    } else {
      await ctx.db.insert('wallet', {
        balance: total,
      })
    }

    // Update or remove asset
    const remainingQuantity = asset.quantity - args.quantity
    if (remainingQuantity <= 0) {
      await ctx.db.delete(asset._id)
    } else {
      await ctx.db.patch(asset._id, {
        quantity: remainingQuantity,
      })
    }

    // Record transaction
    await ctx.db.insert('transactions', {
      type: 'sell',
      symbol: args.symbol,
      quantity: args.quantity,
      price: args.price,
      total: total,
      timestamp: Date.now(),
    })
  },
})