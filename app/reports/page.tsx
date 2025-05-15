import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import { AttendanceSummaryReport } from "@/components/attendance-summary-report"
import { EmployeeAttendanceReport } from "@/components/employee-attendance-report"
import { DepartmentAttendanceReport } from "@/components/department-attendance-report"

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="employee">By Employee</TabsTrigger>
            <TabsTrigger value="department">By Department</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <AttendanceSummaryReport />
          </TabsContent>
          <TabsContent value="employee">
            <EmployeeAttendanceReport />
          </TabsContent>
          <TabsContent value="department">
            <DepartmentAttendanceReport />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
