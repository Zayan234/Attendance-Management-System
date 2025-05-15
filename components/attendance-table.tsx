"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type AttendanceRecord = {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: "Present" | "Absent" | "Late" | "Half Day"
  avatar: string
  initials: string
}

export function AttendanceTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [data, setData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch attendance records from the API
    const fetchAttendanceRecords = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/attendance")
        if (response.ok) {
          const records = await response.json()

          // Transform the data to match our component's expected format
          const formattedRecords = records.map((record: any) => {
            const initials = record.user?.name
              ? record.user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "??"

            return {
              id: record.id,
              employeeId: record.userId,
              employeeName: record.user?.name || "Unknown",
              date: new Date(record.date).toISOString().split("T")[0],
              checkIn: record.checkIn
                ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "",
              checkOut: record.checkOut
                ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "",
              status: record.status.charAt(0) + record.status.slice(1).toLowerCase().replace("_", " "),
              avatar: `/placeholder.svg?height=32&width=32&text=${initials}`,
              initials: initials,
            }
          })

          setData(formattedRecords)
        } else {
          console.error("Failed to fetch attendance records")
          setData([])
        }
      } catch (error) {
        console.error("Error fetching attendance records:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceRecords()
  }, [])

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar || "/placeholder.svg"} alt={row.original.employeeName} />
            <AvatarFallback>{row.original.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.getValue("employeeName")}</div>
            <div className="text-sm text-muted-foreground">{row.original.employeeId}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "checkIn",
      header: "Check In",
      cell: ({ row }) => {
        return row.original.checkIn ? row.original.checkIn : "-"
      },
    },
    {
      accessorKey: "checkOut",
      header: "Check Out",
      cell: ({ row }) => {
        return row.original.checkOut ? row.original.checkOut : "-"
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            variant={
              status === "Present"
                ? "default"
                : status === "Late"
                  ? "outline"
                  : status === "Half Day"
                    ? "secondary"
                    : "destructive"
            }
          >
            {status}
          </Badge>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter employees..."
          value={(table.getColumn("employeeName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("employeeName")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}
