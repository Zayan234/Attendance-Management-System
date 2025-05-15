/**
 * Gets the current local date string in YYYY-MM-DD format
 */
export function getLocalDateString(date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  /**
   * Creates a Date object for the start of the day (midnight) in local time
   */
  export function getLocalMidnight(date = new Date()): Date {
    const localDateString = getLocalDateString(date)
    const localMidnight = new Date(`${localDateString}T00:00:00`)
    return localMidnight
  }
  
  /**
   * Compares two dates to see if they are the same calendar day in local time
   */
  export function isSameLocalDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }
  
  /**
   * Formats a date for display
   */
  export function formatLocalDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }