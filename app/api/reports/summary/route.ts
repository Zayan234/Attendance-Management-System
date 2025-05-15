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
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Default to current month if dates not provided
    const today = new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(today.getFullYear(), today.getMonth(), 1)

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Get total employees count
    const totalEmployees = await prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    })

    // Get attendance statistics
    const attendanceStats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        status: true,
      },
    })

    // Format attendance stats
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
    }

    attendanceStats.forEach((stat) => {
      switch (stat.status) {
        case "PRESENT":
          stats.present = stat._count.status
          break
        case "ABSENT":
          stats.absent = stat._count.status
          break
        case "LATE":
          stats.late = stat._count.status
          break
        case "HALF_DAY":
          stats.halfDay = stat._count.status
          break
      }
    })

    // Get perfect attendance count (employees with no absences)
    const employeesWithAbsences = await prisma.attendance.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "ABSENT",
      },
    })

    const perfectAttendance = totalEmployees - employeesWithAbsences.length

    // Get chronic lateness (employees with more than 3 late arrivals)
    const employeesWithLateness = await prisma.attendance.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: "LATE",
      },
      _count: {
        status: true,
      },
      having: {
        status: {
          _count: {
            gt: 3,
          },
        },
      },
    })

    const chronicLateness = employeesWithLateness.length

    // Get department attendance rates
    const departments = await prisma.department.findMany()
    const departmentStats = []

    for (const dept of departments) {
      const totalRecords = await prisma.attendance.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          user: {
            departmentId: dept.id,
          },
        },
      })

      const presentRecords = await prisma.attendance.count({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          user: {
            departmentId: dept.id,
          },
          status: {
            in: ["PRESENT", "LATE"],
          },
        },
      })

      const attendanceRate = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0

      departmentStats.push({
        id: dept.id,
        name: dept.name,
        attendanceRate: Math.round(attendanceRate),
      })
    }

    // Calculate overall attendance rate
    const totalRecords = stats.present + stats.absent + stats.late + stats.halfDay
    const attendanceRate = totalRecords > 0 ? Math.round(((stats.present + stats.late) / totalRecords) * 100) : 0

    return NextResponse.json({
      totalEmployees,
      attendanceRate,
      perfectAttendance,
      chronicLateness,
      stats,
      departmentStats,
      period: {
        startDate,
        endDate,
      },
    })
  } catch (error) {
    console.error("Error generating summary report:", error)
    return NextResponse.json({ error: "Failed to generate summary report" }, { status: 500 })
  }
}
