"use client"
import { DashboardHeader } from "@/components/dashboard-header"
import { AttendanceTable } from "@/components/attendance-table"
import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { DownloadIcon, FilterIcon } from "lucide-react"

export default function AttendancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Attendance Records</h2>
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <DatePicker />
            <Button variant="outline" size="sm">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
        <AttendanceTable />
      </main>
    </div>
  )
}
