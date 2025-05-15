"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { format } from "date-fns"
import { EmployeeAttendanceHistory } from "@/components/employee-attendance-history"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EmployeeDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayAttendance, setTodayAttendance] = useState<any>(null)
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/auth/me")
          if (response.ok) {
            const data = await response.json()
            setUserData(data)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    if (session?.user?.id) {
      fetchUserData()
    }
  }, [session])

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch today's attendance record
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(`/api/attendance?date=${today}&userId=${session?.user.id}`)

        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setTodayAttendance(data[0])
          } else {
            // No attendance record found for today
            setTodayAttendance(null)
          }
        }
      } catch (error) {
        console.error("Error fetching today's attendance:", error)
      }
    }

    if (session?.user.id) {
      fetchTodayAttendance()
    }
  }, [session])

  // Fetch attendance statistics
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        if (!session?.user.id) return

        const response = await fetch(`/api/reports/employee-stats?employeeId=${session.user.id}`)

        if (response.ok) {
          const data = await response.json()
          setAttendanceStats(data)
        }
      } catch (error) {
        console.error("Error fetching attendance stats:", error)
      }
    }

    fetchAttendanceStats()
  }, [session])

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data)
        setMessage("Check-in successful!")

        // Refresh after 2 seconds
        setTimeout(() => {
          setMessage("")
        }, 2000)
      } else {
        const errorData = await response.json()
        setMessage(`Failed to check in: ${errorData.error || "Please try again."}`)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setTodayAttendance(data)
        setMessage("Check-out successful!")

        // Refresh after 2 seconds
        setTimeout(() => {
          setMessage("")
        }, 2000)
      } else {
        const errorData = await response.json()
        setMessage(`Failed to check out: ${errorData.error || "Please try again."}`)
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  const attendancePercentage = attendanceStats?.yearlyAttendancePercentage || 0
  const isAttendanceLow = attendancePercentage < 80

  // Format the current date for display
  const formattedDate = format(currentTime, "EEEE, MMMM d, yyyy")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome, {userData?.name || session?.user?.name || "Employee"}
          </h2>
        </div>

        {isAttendanceLow && (
          <Alert
            variant="warning"
            className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900"
          >
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-600 dark:text-yellow-400">
              Your yearly attendance is below 80%. Please improve your attendance to avoid disciplinary action.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{format(currentTime, "h:mm:ss a")}</div>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
              {todayAttendance ? (
                todayAttendance.status === "ABSENT" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )
              ) : (
                <div className="h-4 w-4 rounded-full bg-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAttendance ? todayAttendance.status : "Not Recorded"}</div>
              <p className="text-xs text-muted-foreground">
                {todayAttendance
                  ? `Check-in: ${
                      todayAttendance.checkIn
                        ? new Date(todayAttendance.checkIn).toLocaleTimeString()
                        : "Not checked in"
                    }`
                  : "Mark your attendance for today"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Actions</CardTitle>
              <CardDescription>Mark your attendance for today ({format(currentTime, "MMM d, yyyy")})</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {message && <div className="bg-green-100 dark:bg-green-900 p-2 rounded text-sm">{message}</div>}
              <div className="flex gap-4">
                <Button
                  onClick={handleCheckIn}
                  disabled={isLoading || (todayAttendance && todayAttendance.checkIn)}
                  className="flex-1"
                >
                  Check In
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={isLoading || !todayAttendance || !todayAttendance.checkIn || todayAttendance.checkOut}
                  className="flex-1"
                  variant="outline"
                >
                  Check Out
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {todayAttendance && todayAttendance.checkIn
                ? `Checked in at ${new Date(todayAttendance.checkIn).toLocaleTimeString()}`
                : "You haven't checked in today"}
              {todayAttendance &&
                todayAttendance.checkOut &&
                ` • Checked out at ${new Date(todayAttendance.checkOut).toLocaleTimeString()}`}
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Statistics</CardTitle>
              <CardDescription>Your attendance performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Yearly Attendance</p>
                    <p className={`text-2xl font-bold ${isAttendanceLow ? "text-yellow-600" : ""}`}>
                      {attendanceStats?.yearlyAttendancePercentage || 0}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Attendance</p>
                    <p className="text-2xl font-bold">{attendanceStats?.monthlyAttendancePercentage || 0}%</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                    <p className="text-2xl font-bold">{attendanceStats?.presentDays || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Absent Days</p>
                    <p className="text-2xl font-bold">{attendanceStats?.absentDays || 0}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium mb-2">Yearly Attendance Progress</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Current</p>
                      <p className="text-sm font-medium">{attendanceStats?.yearlyAttendancePercentage || 0}%</p>
                    </div>
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                      <div
                        className={`h-full rounded-full ${isAttendanceLow ? "bg-yellow-500" : "bg-primary"}`}
                        style={{ width: `${attendanceStats?.yearlyAttendancePercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <p>0%</p>
                      <p>Target: 80%</p>
                      <p>100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent attendance records</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeAttendanceHistory limit={5} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Attendance History</h3>
          <EmployeeAttendanceHistory />
        </div>
      </main>
    </div>
  )
}