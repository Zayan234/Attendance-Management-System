"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"
import { useDepartments } from "@/lib/hooks/use-departments"

export function DepartmentAttendanceReport() {
  const { departments, loading: loadingDepartments } = useDepartments()
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set the first department as selected when departments are loaded
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0].id)
    }
  }, [departments, selectedDepartment])

  useEffect(() => {
    async function fetchDepartmentReport() {
      if (!selectedDepartment) return

      try {
        setLoading(true)
        const response = await fetch(`/api/reports/department?departmentId=${selectedDepartment}`)

        if (!response.ok) {
          throw new Error("Failed to fetch department report")
        }

        const data = await response.json()
        setReportData(data)
      } catch (err) {
        console.error("Error fetching department report:", err)
        setError("Failed to load department attendance data")
      } finally {
        setLoading(false)
      }
    }

    if (selectedDepartment) {
      fetchDepartmentReport()
    }
  }, [selectedDepartment])

  if (loadingDepartments) {
    return (
      <div className="space-y-4 flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">No departments found. Add departments to view reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-[250px]">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error || !reportData ? (
        <Card>
          <CardContent className="flex items-center justify-center h-[350px]">
            <p className="text-muted-foreground">Failed to load department attendance data</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend for {reportData.department?.name || "Department"}</CardTitle>
              <CardDescription>6-month attendance rate trend</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.monthlyData && reportData.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={reportData.monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#3b82f6"
                      name="Attendance Rate (%)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">No attendance data available for this department</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
              <CardDescription>
                Current month statistics for {reportData.department?.name || "Department"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{reportData.statistics?.employeeCount || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                  <p className="text-2xl font-bold">{reportData.statistics?.attendanceRate || 0}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Perfect Attendance</p>
                  <p className="text-2xl font-bold">{reportData.statistics?.perfectAttendance || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Improvement</p>
                  <p className="text-2xl font-bold">{reportData.statistics?.improvement || "0%"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
