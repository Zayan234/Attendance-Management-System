import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 })
    }

    // Default to current month if dates not provided
    const today = new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(today.getFullYear(), today.getMonth(), 1)

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Get employee details
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // Get attendance records for the employee
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId: employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Group attendance records by week
    const weeklyData = []
    let currentWeekStart = new Date(startDate)
    let currentWeekRecords = []

    attendanceRecords.forEach((record) => {
      const recordDate = new Date(record.date)

      // Check if this record belongs to a new week
      if (recordDate.getTime() - currentWeekStart.getTime() >= 7 * 24 * 60 * 60 * 1000) {
        // Process the current week's data
        if (currentWeekRecords.length > 0) {
          const weekData = {
            date: `Week of ${currentWeekStart.toLocaleDateString()}`,
            present: currentWeekRecords.filter((r) => r.status === "PRESENT").length,
            absent: currentWeekRecords.filter((r) => r.status === "ABSENT").length,
            late: currentWeekRecords.filter((r) => r.status === "LATE").length,
          }
          weeklyData.push(weekData)
        }

        // Start a new week
        currentWeekStart = new Date(recordDate)
        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()) // Set to start of week (Sunday)
        currentWeekRecords = [record]
      } else {
        currentWeekRecords.push(record)
      }
    })

    // Add the last week if there are any records
    if (currentWeekRecords.length > 0) {
      const weekData = {
        date: `Week of ${currentWeekStart.toLocaleDateString()}`,
        present: currentWeekRecords.filter((r) => r.status === "PRESENT").length,
        absent: currentWeekRecords.filter((r) => r.status === "ABSENT").length,
        late: currentWeekRecords.filter((r) => r.status === "LATE").length,
      }
      weeklyData.push(weekData)
    }

    // Calculate summary statistics
    const totalDays = attendanceRecords.length
    const presentDays = attendanceRecords.filter((r) => r.status === "PRESENT").length
    const absentDays = attendanceRecords.filter((r) => r.status === "ABSENT").length
    const lateDays = attendanceRecords.filter((r) => r.status === "LATE").length
    const halfDays = attendanceRecords.filter((r) => r.status === "HALF_DAY").length

    const attendanceRate = totalDays > 0 ? Math.round(((presentDays + lateDays) / totalDays) * 100) : 0

    return NextResponse.json({
      employee,
      weeklyData,
      summary: {
        attendanceRate,
        presentDays,
        absentDays,
        lateDays,
        halfDays,
      },
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error generating employee report:", error)
    return NextResponse.json({ error: "Failed to generate employee report" }, { status: 500 })
  }
}
