/**
 * @fileoverview Application header component
 * @description Displays the app title, price update status, and notifications panel.
 */

import { Badge } from '@/components/ui/badge'
import { NotificationsPanel } from './NotificationsPanel'

interface HeaderProps {
  /** Whether prices are currently being refreshed */
  loadingPrices: boolean
}

/**
 * Header component with app title, status indicators, and notifications
 */
export function Header({ loadingPrices }: HeaderProps) {
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

        <NotificationsPanel />
      </div>
    </div>
  )
}