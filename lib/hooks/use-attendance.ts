"use client"

import { useState, useEffect } from "react"

export type AttendanceRecord = {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    department: {
      id: string
      name: string
    } | null
  }
}

export function useAttendance(date?: string, userId?: string, departmentId?: string, status?: string) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setLoading(true)

        // Build query params
        const params = new URLSearchParams()
        if (date) params.append("date", date)
        if (userId) params.append("userId", userId)
        if (departmentId) params.append("departmentId", departmentId)
        if (status) params.append("status", status)

        const response = await fetch(`/api/attendance?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch attendance records")
        }

        const data = await response.json()
        setRecords(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [date, userId, departmentId, status])

  return { records, loading, error }
}
