import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateWorkHours(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "—"
  
  const checkInTime = new Date(checkIn).getTime()
  const checkOutTime = new Date(checkOut).getTime()
  
  if (isNaN(checkInTime) || isNaN(checkOutTime)) return "—"
  
  const diffMs = checkOutTime - checkInTime
  if (diffMs < 0) return "—"
  
  const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10
  return `${diffHrs} hrs`
}