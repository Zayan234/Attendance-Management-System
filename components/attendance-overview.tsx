"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface AttendanceOverviewProps {
  className?: string
}

export function AttendanceOverview({ className }: AttendanceOverviewProps) {
  const [activeTab, setActiveTab] = useState("weekly")
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        setLoading(true)

        // Fetch weekly data
        const weeklyResponse = await fetch("/api/reports/overview?period=weekly")
        if (weeklyResponse.ok) {
          const data = await weeklyResponse.json()
          setWeeklyData(data.weeklyData || [])
        } else {
          throw new Error("Failed to fetch weekly data")
        }

        // Fetch monthly data
        const monthlyResponse = await fetch("/api/reports/overview?period=monthly")
        if (monthlyResponse.ok) {
          const data = await monthlyResponse.json()
          setMonthlyData(data.monthlyData || [])
        } else {
          throw new Error("Failed to fetch monthly data")
        }
      } catch (err) {
        console.error("Error fetching attendance overview data:", err)
        setError("Failed to load attendance overview data")
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>View attendance trends over time</CardDescription>
        <Tabs defaultValue="weekly" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <div className="flex items-center justify-center h-[350px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (activeTab === "weekly" && weeklyData.length === 0) ||
          (activeTab === "monthly" && monthlyData.length === 0) ? (
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">No attendance data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={activeTab === "weekly" ? weeklyData : monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#22c55e" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
