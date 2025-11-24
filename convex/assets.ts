import { query } from './_generated/server'

/**
 * Retrieve all assets in the portfolio
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('assets').collect()
  },
})