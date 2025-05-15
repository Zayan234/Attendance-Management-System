"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useEmployees } from "@/lib/hooks/use-employees"

export function EmployeeTable() {
  const router = useRouter()
  const { employees, loading, error, mutate } = useEmployees()
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState([])

  useEffect(() => {
    if (employees) {
      setFilteredEmployees(
        employees.filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (employee.department && employee.department.name.toLowerCase().includes(searchTerm.toLowerCase())),
        ),
      )
    }
  }, [employees, searchTerm])

  const handleViewDetails = (id) => {
    router.push(`/employees/${id}`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "INACTIVE":
        return "bg-red-500"
      case "ON_LEAVE":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading employees: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department?.name || "—"}</TableCell>
                  <TableCell>{employee.position || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(employee.status)} text-white`}>
                      {employee.status === "ACTIVE"
                        ? "Active"
                        : employee.status === "INACTIVE"
                          ? "Inactive"
                          : "On Leave"}
                    </Badge>
                  </TableCell>
                  <TableCell>{employee.joinDate ? format(new Date(employee.joinDate), "MMM d, yyyy") : "—"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(employee.id)}>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
