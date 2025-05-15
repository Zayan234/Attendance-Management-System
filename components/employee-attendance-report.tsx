"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"
import { useEmployees } from "@/lib/hooks/use-employees"

export function EmployeeAttendanceReport() {
  const { employees, loading: loadingEmployees } = useEmployees()
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Set the first employee as selected when employees are loaded
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0].id)
    }
  }, [employees, selectedEmployee])

  useEffect(() => {
    async function fetchEmployeeReport() {
      if (!selectedEmployee) return

      try {
        setLoading(true)
        const response = await fetch(`/api/reports/employee?employeeId=${selectedEmployee}`)

        if (!response.ok) {
          throw new Error("Failed to fetch employee report")
        }

        const data = await response.json()
        setReportData(data)
      } catch (err) {
        console.error("Error fetching employee report:", err)
        setError("Failed to load employee attendance data")
      } finally {
        setLoading(false)
      }
    }

    if (selectedEmployee) {
      fetchEmployeeReport()
    }
  }, [selectedEmployee])

  if (loadingEmployees) {
    return (
      <div className="space-y-4 flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">No employees found. Add employees to view reports.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-[250px]">
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
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
            <p className="text-muted-foreground">Failed to load employee attendance data</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance for {reportData.employee?.name || "Employee"}</CardTitle>
              <CardDescription>Attendance breakdown by week</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData.weeklyData && reportData.weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={reportData.weeklyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#22c55e" name="Present" />
                    <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                    <Bar dataKey="late" fill="#f59e0b" name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">No attendance data available for this employee</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Key metrics for {reportData.employee?.name || "Employee"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                  <p className="text-2xl font-bold">{reportData.summary?.attendanceRate || 0}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Days Present</p>
                  <p className="text-2xl font-bold">{reportData.summary?.presentDays || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Days Absent</p>
                  <p className="text-2xl font-bold">{reportData.summary?.absentDays || 0}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
                  <p className="text-2xl font-bold">{reportData.summary?.lateDays || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
