import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Get the current wallet balance
 * Creates wallet with 0 balance if it doesn't exist
 */
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const wallet = await ctx.db.query('wallet').first()
    return wallet?.balance ?? 0
  },
})

/**
 * Deposit USDT into the wallet
 */
export const deposit = mutation({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error('Deposit amount must be positive')
    }

    const wallet = await ctx.db.query('wallet').first()

    if (wallet) {
      await ctx.db.patch(wallet._id, {
        balance: wallet.balance + args.amount,
      })
    } else {
      await ctx.db.insert('wallet', {
        balance: args.amount,
      })
    }

    // Record transaction
    await ctx.db.insert('transactions', {
      type: 'deposit',
      quantity: args.amount,
      total: args.amount,
      timestamp: Date.now(),
    })
  },
})

/**
 * Withdraw USDT from the wallet
 */
export const withdraw = mutation({
  args: {
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error('Withdrawal amount must be positive')
    }

    const wallet = await ctx.db.query('wallet').first()
    const balance = wallet?.balance ?? 0

    if (args.amount > balance) {
      throw new Error('Insufficient balance')
    }

    await ctx.db.patch(wallet!._id, {
      balance: balance - args.amount,
    })

    // Record transaction
    await ctx.db.insert('transactions', {
      type: 'withdraw',
      quantity: args.amount,
      total: args.amount,
      timestamp: Date.now(),
    })
  },
})