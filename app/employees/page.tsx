import { DashboardHeader } from "@/components/dashboard-header"
import { EmployeeList } from "@/components/employee-list"

export default function EmployeesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-8 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-2">Manage your employees and their information.</p>
        </div>
        <EmployeeList />
      </main>
    </div>
  )
}
