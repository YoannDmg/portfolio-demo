/**
 * @fileoverview Error alert component
 * @description Displays error messages in a styled alert box.
 * Returns null when no error message is provided.
 */

interface ErrorAlertProps {
  /** Error message to display */
  message: string
}

/**
 * Dismissible error alert banner
 * @returns Alert component or null if no message
 */
export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
      {message}
    </div>
  )
}