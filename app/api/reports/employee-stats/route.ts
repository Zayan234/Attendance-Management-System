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
    const employeeId = searchParams.get("employeeId") || session.user.id

    // Check if user has permission to view this employee's stats
    if (session.user.id !== employeeId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current date info
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    // Calculate yearly attendance
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    // Get all attendance records for the year
    const yearlyAttendance = await prisma.attendance.findMany({
      where: {
        userId: employeeId as string,
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
    })

    // Calculate yearly stats
    const totalYearlyRecords = yearlyAttendance.length
    const presentYearlyRecords = yearlyAttendance.filter(
      (record) => record.status === "PRESENT" || record.status === "LATE",
    ).length

    const yearlyAttendancePercentage =
      totalYearlyRecords > 0 ? Math.round((presentYearlyRecords / totalYearlyRecords) * 100) : 0

    // Calculate monthly attendance
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

    // Get all attendance records for the month
    const monthlyAttendance = await prisma.attendance.findMany({
      where: {
        userId: employeeId as string,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    // Calculate monthly stats
    const totalMonthlyRecords = monthlyAttendance.length
    const presentMonthlyRecords = monthlyAttendance.filter(
      (record) => record.status === "PRESENT" || record.status === "LATE",
    ).length

    const monthlyAttendancePercentage =
      totalMonthlyRecords > 0 ? Math.round((presentMonthlyRecords / totalMonthlyRecords) * 100) : 0

    // Count present and absent days
    const presentDays = yearlyAttendance.filter(
      (record) => record.status === "PRESENT" || record.status === "LATE",
    ).length

    const absentDays = yearlyAttendance.filter((record) => record.status === "ABSENT").length

    return NextResponse.json({
      yearlyAttendancePercentage,
      monthlyAttendancePercentage,
      presentDays,
      absentDays,
      totalDays: totalYearlyRecords,
    })
  } catch (error) {
    console.error("Error generating employee stats:", error)
    return NextResponse.json({ error: "Failed to generate employee stats" }, { status: 500 })
  }
}
