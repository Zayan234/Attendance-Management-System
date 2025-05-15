"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

interface EmployeeAttendanceHistoryProps {
  limit?: number
  userId?: string // Optional userId for admin view
}

export function EmployeeAttendanceHistory({ limit, userId }: EmployeeAttendanceHistoryProps) {
  const { data: session } = useSession()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true)
        // Use the provided userId or fall back to the session user id
        const targetUserId = userId || session?.user.id

        if (!targetUserId) {
          setError("User ID not available")
          setLoading(false)
          return
        }

        const queryParams = new URLSearchParams()
        queryParams.append("userId", targetUserId)
        if (limit) {
          queryParams.append("limit", limit.toString())
        }

        const response = await fetch(`/api/attendance?${queryParams.toString()}`)

        if (response.ok) {
          const data = await response.json()
          setRecords(data)
          setError(null)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to fetch attendance records")
        }
      } catch (error) {
        console.error("Error fetching attendance history:", error)
        setError("An error occurred while fetching attendance records")
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if we have a session or a specific userId was provided
    if (session?.user.id || userId) {
      fetchAttendanceHistory()
    }
  }, [session, limit, userId])

  if (loading) {
    return <div className="py-4 text-center">Loading attendance history...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>
  }

  if (records.length === 0) {
    return <div className="py-4 text-center">No attendance records found.</div>
  }

  return (
    <Card>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Work Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              // Calculate work hours if both check-in and check-out exist
              let workHours = "-"
              if (record.checkIn && record.checkOut) {
                const checkIn = new Date(record.checkIn)
                const checkOut = new Date(record.checkOut)
                const diffMs = checkOut.getTime() - checkIn.getTime()
                const diffHrs = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10
                workHours = `${diffHrs} hrs`
              }

              return (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{record.checkIn ? format(new Date(record.checkIn), "h:mm a") : "-"}</TableCell>
                  <TableCell>{record.checkOut ? format(new Date(record.checkOut), "h:mm a") : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "PRESENT"
                          ? "default"
                          : record.status === "LATE"
                            ? "outline"
                            : record.status === "HALF_DAY"
                              ? "secondary"
                              : "destructive"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{workHours}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
