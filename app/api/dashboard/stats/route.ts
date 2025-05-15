import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get today's date (start and end)
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Count present employees today
    const presentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "PRESENT",
      },
    })

    // Count late employees today
    const lateCount = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "LATE",
      },
    })

    // Count absent employees today
    const absentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "ABSENT",
      },
    })

    // Get total employees
    const totalEmployees = await prisma.user.count({
      where: {
        role: "EMPLOYEE",
      },
    })

    // Calculate attendance rate
    const totalAttendanceRecords = await prisma.attendance.count()
    const presentAndLateRecords = await prisma.attendance.count({
      where: {
        status: {
          in: ["PRESENT", "LATE"],
        },
      },
    })

    const attendanceRate =
      totalAttendanceRecords > 0 ? Math.round((presentAndLateRecords / totalAttendanceRecords) * 100) : 0

    return NextResponse.json({
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      rate: attendanceRate,
      totalEmployees,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
