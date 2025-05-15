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
    const departmentId = searchParams.get("departmentId")
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    if (!departmentId) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 })
    }

    // Default to current month if dates not provided
    const today = new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(today.getFullYear(), today.getMonth() - 5, 1) // Last 6 months

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Get department details
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 })
    }

    // Get monthly attendance rates for the department
    const monthlyData = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

      // Get total attendance records for the month
      const totalRecords = await prisma.attendance.count({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          user: {
            departmentId,
          },
        },
      })

      // Get present/late records for the month
      const presentRecords = await prisma.attendance.count({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          user: {
            departmentId,
          },
          status: {
            in: ["PRESENT", "LATE"],
          },
        },
      })

      const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0

      monthlyData.push({
        month: monthStart.toLocaleString("default", { month: "short" }),
        rate: attendanceRate,
      })

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Get department statistics
    const employeeCount = await prisma.user.count({
      where: {
        departmentId,
      },
    })

    // Get perfect attendance count for current month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    const employeesWithAbsences = await prisma.attendance.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        user: {
          departmentId,
        },
        status: "ABSENT",
      },
    })

    const perfectAttendance = employeeCount - employeesWithAbsences.length

    // Calculate current month's attendance rate
    const currentMonthTotalRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        user: {
          departmentId,
        },
      },
    })

    const currentMonthPresentRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
        user: {
          departmentId,
        },
        status: {
          in: ["PRESENT", "LATE"],
        },
      },
    })

    const currentAttendanceRate =
      currentMonthTotalRecords > 0 ? Math.round((currentMonthPresentRecords / currentMonthTotalRecords) * 100) : 0

    // Calculate improvement from previous month
    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59)

    const prevMonthTotalRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
        user: {
          departmentId,
        },
      },
    })

    const prevMonthPresentRecords = await prisma.attendance.count({
      where: {
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd,
        },
        user: {
          departmentId,
        },
        status: {
          in: ["PRESENT", "LATE"],
        },
      },
    })

    const prevAttendanceRate =
      prevMonthTotalRecords > 0 ? Math.round((prevMonthPresentRecords / prevMonthTotalRecords) * 100) : 0

    const improvement = currentAttendanceRate - prevAttendanceRate

    return NextResponse.json({
      department,
      monthlyData,
      statistics: {
        employeeCount,
        attendanceRate: currentAttendanceRate,
        perfectAttendance,
        improvement: `${improvement > 0 ? "+" : ""}${improvement}%`,
      },
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error generating department report:", error)
    return NextResponse.json({ error: "Failed to generate department report" }, { status: 500 })
  }
}
