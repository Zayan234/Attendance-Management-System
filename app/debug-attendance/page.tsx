"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugAttendancePage() {
  const { data: session, status } = useSession()
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [serverTime, setServerTime] = useState<Date | null>(null)
  const [clientTime, setClientTime] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)
  const [serverTimeDetails, setServerTimeDetails] = useState<any>(null)

  // Update client time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setClientTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch attendance records and server time
  const fetchData = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)

      // Fetch attendance records
      const recordsResponse = await fetch(`/api/attendance?userId=${session.user.id}&limit=10`)
      if (recordsResponse.ok) {
        const data = await recordsResponse.json()
        setAttendanceRecords(data)
      }

      // Fetch server time
      const timeResponse = await fetch("/api/server-time")
      if (timeResponse.ok) {
        const timeData = await timeResponse.json()
        setServerTime(new Date(timeData.serverTime))
        setServerTimeDetails(timeData)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [session])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const handleResetTodayAttendance = async () => {
    if (!session?.user?.id) return

    try {
      setMessage("")
      setError("")

      const response = await fetch("/api/debug/reset-today-attendance", {
        method: "POST",
      })

      if (response.ok) {
        setMessage("Successfully reset today's attendance record")
        await fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to reset attendance")
      }
    } catch (err) {
      console.error("Error resetting attendance:", err)
      setError("An error occurred while resetting attendance")
    }
  }

  const handleCreateTestRecord = async () => {
    if (!session?.user?.id) return

    try {
      setMessage("")
      setError("")

      const now = new Date()
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          date: now.toISOString(),
          status: "PRESENT",
        }),
      })

      if (response.ok) {
        setMessage("Successfully created test attendance record")
        await fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create test record")
      }
    } catch (err) {
      console.error("Error creating test record:", err)
      setError("An error occurred while creating test record")
    }
  }

  const handleForceCreateRecord = async () => {
    if (!session?.user?.id) return

    try {
      setMessage("")
      setError("")

      // Get current date in local timezone
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const localDateString = `${year}-${month}-${day}`
      
      // Create a date object at midnight local time
      const today = new Date(`${localDateString}T00:00:00`)

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          date: today.toISOString(), // Use the local midnight
          status: "PRESENT",
          notes: `Force created on ${now.toISOString()} for local date ${localDateString}`,
        }),
      })

      if (response.ok) {
        setMessage("Successfully force created attendance record for today")
        await fetchData()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create record")
      }
    } catch (err) {
      console.error("Error creating record:", err)
      setError("An error occurred while creating record")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8 pt-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8 pt-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>You must be logged in to access this page</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  // Find today's record by comparing the date components in local time
  const todayRecord = attendanceRecords.find((record) => {
    const recordDate = new Date(record.date)
    const today = new Date()
    return (
      recordDate.getFullYear() === today.getFullYear() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getDate() === today.getDate()
    )
  })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Attendance Debug Tool</h2>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {message && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <AlertDescription className="text-green-600 dark:text-green-400">{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Time Information</CardTitle>
              <CardDescription>Debug time-related issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Client Time</p>
                <p className="text-xl font-bold">{format(clientTime, "PPpp")}</p>
                <p className="text-xs text-muted-foreground">
                  ISO: {clientTime.toISOString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Local Date: {clientTime.getFullYear()}-{String(clientTime.getMonth() + 1).padStart(2, '0')}-{String(clientTime.getDate()).padStart(2, '0')}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Server Time</p>
                <p className="text-xl font-bold">{serverTime ? format(serverTime, "PPpp") : "Loading..."}</p>
                {serverTime && (
                  <>
                    <p className="text-xs text-muted-foreground">
                      ISO: {serverTime.toISOString()}
                    </p>
                    {serverTimeDetails && (
                      <>
                        <p className="text-xs text-muted-foreground">
                          Date Only: {serverTimeDetails.dateOnly}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          UTC String: {serverTimeDetails.utcString}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Formatted: {serverTimeDetails.formattedDate}
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>

              {serverTime && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Time Difference</p>
                  <p className="text-xl font-bold">
                    {Math.abs(clientTime.getTime() - serverTime.getTime()) / 1000} seconds
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Current attendance record for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayRecord ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="text-xl font-bold">{todayRecord.status}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Date (stored in database)</p>
                    <p className="text-xl font-bold">{format(new Date(todayRecord.date), "PPpp")}</p>
                    <p className="text-xs text-muted-foreground">ISO: {new Date(todayRecord.date).toISOString()}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Check In</p>
                    <p className="text-xl font-bold">
                      {todayRecord.checkIn ? format(new Date(todayRecord.checkIn), "h:mm:ss a") : "Not checked in"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Check Out</p>
                    <p className="text-xl font-bold">
                      {todayRecord.checkOut ? format(new Date(todayRecord.checkOut), "h:mm:ss a") : "Not checked out"}
                    </p>
                  </div>

                  <Button variant="destructive" className="w-full mt-4" onClick={handleResetTodayAttendance}>
                    Reset Today's Attendance
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] gap-4">
                  <p className="text-muted-foreground">No attendance record found for today</p>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateTestRecord}>Create Test Record</Button>
                    <Button variant="outline" onClick={handleForceCreateRecord}>Force Create for Today</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Records</CardTitle>
            <CardDescription>Last 10 attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">ISO Date</th>
                      <th className="text-left py-2 px-4">Check In</th>
                      <th className="text-left py-2 px-4">Check Out</th>
                      <th className="text-left py-2 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">{format(new Date(record.date), "MMM d, yyyy")}</td>
                        <td className="py-2 px-4 text-xs">{new Date(record.date).toISOString()}</td>
                        <td className="py-2 px-4">
                          {record.checkIn ? format(new Date(record.checkIn), "h:mm:ss a") : "—"}
                        </td>
                        <td className="py-2 px-4">
                          {record.checkOut ? format(new Date(record.checkOut), "h:mm:ss a") : "—"}
                        </td>
                        <td className="py-2 px-4">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No attendance records found.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}