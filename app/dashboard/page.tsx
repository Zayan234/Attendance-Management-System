"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { AttendanceOverview } from "@/components/attendance-overview"
import { RecentActivity } from "@/components/recent-activity"
import { AttendanceStats } from "@/components/attendance-stats"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    rate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch("/api/dashboard/stats")

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <Button asChild>
            <Link href="/employees/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <AttendanceStats
                title="Present Today"
                value={stats.present.toString()}
                description="Today's attendance"
                trend="neutral"
              />
              <AttendanceStats
                title="Absent Today"
                value={stats.absent.toString()}
                description="Today's absences"
                trend="neutral"
              />
              <AttendanceStats
                title="Late Arrivals"
                value={stats.late.toString()}
                description="Today's late check-ins"
                trend="neutral"
              />
              <AttendanceStats
                title="Attendance Rate"
                value={`${stats.rate}%`}
                description="Overall attendance rate"
                trend="neutral"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <AttendanceOverview className="col-span-4" />
              <RecentActivity className="col-span-3" />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
