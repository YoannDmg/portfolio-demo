/**
 * @fileoverview Application header component
 * @description Displays the app title, price update status, and notifications panel.
 */

import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface HeaderProps {
  /** Whether prices are currently being refreshed */
  loadingPrices: boolean
}

/**
 * Header component with app title, status indicators, and notifications
 */
export function Header({ loadingPrices }: HeaderProps) {
  // Notifications data and actions
  const notifications = useQuery(api.notifications.list)
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const triggerAlertCheck = useAction(api.alerts.triggerCheck)

  // Count unread notifications
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Crypto Portfolio</h1>

      <div className="flex items-center gap-3">
        {/* Price update indicator */}
        {loadingPrices && (
          <Badge variant="outline" className="animate-pulse">
            Updating prices...
          </Badge>
        )}

        {/* Notifications Panel */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              {/* Bell Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>

              {/* Unread badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-96 p-0" align="end">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => triggerAlertCheck()}
                  className="text-xs"
                >
                  Check Now
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 ${
                      !notif.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notif.read && markAsRead({ id: notif._id })}
                  >
                    {/* Alert Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          notif.type === 'price_up'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {notif.symbol} {notif.type === 'price_up' ? '↑' : '↓'}{' '}
                        {Math.abs(notif.priceChange).toFixed(2)}%
                      </Badge>
                      {!notif.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    {/* Price */}
                    <p className="text-sm text-muted-foreground mb-1">
                      $
                      {notif.currentPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>

                    {/* AI Analysis */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notif.aiAnalysis}
                    </p>

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}