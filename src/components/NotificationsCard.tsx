/**
 * @fileoverview Notifications card component
 * @description Displays price alerts with AI-generated analysis in a dashboard card.
 * Includes manual alert check trigger and mark all as read functionality.
 */

import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Formats a number as currency with 2 decimal places
 */
const formatCurrency = (value: number): string =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/**
 * Card displaying price alert notifications with AI analysis
 *
 * Features:
 * - List of recent price alerts (up to 10)
 * - Color-coded badges for price direction
 * - AI-generated market analysis for each alert
 * - Manual check trigger button
 * - Mark all as read functionality
 */
export function NotificationsCard() {
  // Notifications data and actions
  const notifications = useQuery(api.notifications.list)
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const triggerAlertCheck = useAction(api.alerts.triggerCheck)

  // Count unread notifications
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  // Loading state
  if (notifications === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Price Alerts</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerAlertCheck()}
          >
            Check Now
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-2">No alerts yet</p>
            <p className="text-sm text-muted-foreground">
              Alerts will appear when assets change by more than 5% in 24h
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Price Alerts</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="rounded-full">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerAlertCheck()}
          >
            Check Now
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.slice(0, 10).map((notif) => {
            const date = new Date(notif.timestamp)
            const isUp = notif.type === 'price_up'

            return (
              <div
                key={notif._id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  !notif.read ? 'bg-blue-50 border-blue-200' : 'bg-muted/30'
                }`}
                onClick={() => !notif.read && markAsRead({ id: notif._id })}
              >
                {/* Header: Symbol, Change, Unread indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        isUp
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                      }
                    >
                      {notif.symbol} {isUp ? '↑' : '↓'}{' '}
                      {Math.abs(notif.priceChange).toFixed(2)}%
                    </Badge>
                    <span className="text-sm font-medium">
                      ${formatCurrency(notif.currentPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* AI Analysis */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notif.aiAnalysis}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}