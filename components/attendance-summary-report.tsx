"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Loader2 } from "lucide-react"

export function AttendanceSummaryReport() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummaryReport() {
      try {
        setLoading(true)
        const response = await fetch("/api/reports/summary")

        if (!response.ok) {
          throw new Error("Failed to fetch summary report")
        }

        const data = await response.json()
        setReportData(data)
      } catch (err) {
        console.error("Error fetching summary report:", err)
        setError("Failed to load attendance summary data")
      } finally {
        setLoading(false)
      }
    }

    fetchSummaryReport()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Failed to load attendance data</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Failed to load attendance data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Format data for pie chart
  const pieData = [
    { name: "Present", value: reportData.stats.present, color: "#22c55e" },
    { name: "Absent", value: reportData.stats.absent, color: "#ef4444" },
    { name: "Late", value: reportData.stats.late, color: "#f59e0b" },
    { name: "Half Day", value: reportData.stats.halfDay, color: "#6366f1" },
  ].filter((item) => item.value > 0) // Only show categories with values

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>Current month attendance distribution</CardDescription>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No attendance data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Statistics</CardTitle>
          <CardDescription>Key metrics for the current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{reportData.totalEmployees}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance Rate</p>
                <p className="text-2xl font-bold">{reportData.attendanceRate}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Perfect Attendance</p>
                <p className="text-2xl font-bold">{reportData.perfectAttendance}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Chronic Lateness</p>
                <p className="text-2xl font-bold">{reportData.chronicLateness}</p>
              </div>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Department Attendance Rates</h4>
              <div className="space-y-2">
                {reportData.departmentStats && reportData.departmentStats.length > 0 ? (
                  reportData.departmentStats.map((dept: any) => (
                    <div key={dept.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">{dept.name}</p>
                        <p className="text-sm font-medium">{dept.attendanceRate}%</p>
                      </div>
                      <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${dept.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No department data available</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
