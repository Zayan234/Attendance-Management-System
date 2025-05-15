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
    const period = searchParams.get("period") || "weekly"

    const today = new Date()
    let data: any[] = []

    if (period === "weekly") {
      // Get data for the last 7 days
      data = await getWeeklyData(today)
    } else if (period === "monthly") {
      // Get data for the last 4 weeks
      data = await getMonthlyData(today)
    }

    return NextResponse.json({
      [`${period}Data`]: data,
    })
  } catch (error) {
    console.error(`Error fetching ${period} overview:`, error)
    return NextResponse.json({ error: `Failed to fetch ${period} overview` }, { status: 500 })
  }
}

async function getWeeklyData(today: Date) {
  const data = []

  // Get data for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)

    // Count present, absent, and late for this day
    const presentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: "PRESENT",
      },
    })

    const absentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: "ABSENT",
      },
    })

    const lateCount = await prisma.attendance.count({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: "LATE",
      },
    })

    // Format the day name (e.g., "Mon", "Tue")
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" })

    data.push({
      name: dayName,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
    })
  }

  return data
}

async function getMonthlyData(today: Date) {
  const data = []

  // Get data for the last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (i * 7 + 6))

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Count present, absent, and late for this week
    const presentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0),
          lte: new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59),
        },
        status: "PRESENT",
      },
    })

    const absentCount = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0),
          lte: new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59),
        },
        status: "ABSENT",
      },
    })

    const lateCount = await prisma.attendance.count({
      where: {
        date: {
          gte: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate(), 0, 0, 0),
          lte: new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate(), 23, 59, 59),
        },
        status: "LATE",
      },
    })

    data.push({
      name: `Week ${4 - i}`,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
    })
  }

  return data
}
