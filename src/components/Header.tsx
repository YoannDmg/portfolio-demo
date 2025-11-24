/**
 * @fileoverview Application header component
 * @description Displays the app title and price update status indicator.
 */

import { Badge } from '@/components/ui/badge'

interface HeaderProps {
  /** Whether prices are currently being refreshed */
  loadingPrices: boolean
}

/**
 * Header component with app title and status indicators
 */
export function Header({ loadingPrices }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Crypto Portfolio</h1>
      <div className="flex items-center gap-3">
        {loadingPrices && (
          <Badge variant="outline" className="animate-pulse">
            Updating prices...
          </Badge>
        )}
      </div>
    </div>
  )
}