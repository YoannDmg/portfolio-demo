/**
 * @fileoverview Scheduled jobs configuration
 * @description Defines cron jobs for automated tasks like price monitoring.
 */

import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

/**
 * Check portfolio assets for significant price changes
 * Runs every 5 minutes and creates notifications for assets
 * with 24h price changes exceeding the threshold (5%)
 */
crons.interval(
  'check-price-alerts',
  { minutes: 5 },
  internal.alerts.checkPriceAlerts
)

export default crons