import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    
    // Get the local date string in YYYY-MM-DD format based on local timezone
    const localDate = new Date()
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, '0')
    const day = String(localDate.getDate()).padStart(2, '0')
    const localDateString = `${year}-${month}-${day}`
    
    console.log('Check-out for local date:', localDateString)

    // Get all attendance records for this user
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
      },
    })
    
    // Find record with matching date (comparing only year, month, day in LOCAL time)
    const existingRecord = attendanceRecords.find(record => {
      const recordDate = new Date(record.date)
      const recordLocalDate = new Date(recordDate)
      return (
        recordLocalDate.getFullYear() === localDate.getFullYear() &&
        recordLocalDate.getMonth() === localDate.getMonth() &&
        recordLocalDate.getDate() === localDate.getDate()
      )
    })

    if (!existingRecord) {
      return NextResponse.json({ error: "No check-in record found for today. Please check in first." }, { status: 400 })
    }

    if (!existingRecord.checkIn) {
      return NextResponse.json({ error: "You haven't checked in today. Please check in first." }, { status: 400 })
    }

    if (existingRecord.checkOut) {
      return NextResponse.json(existingRecord)
    }

    // Update the record with check-out time
    const updatedRecord = await prisma.attendance.update({
      where: { id: existingRecord.id },
      data: {
        checkOut: now,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error recording check-out:", error)
    return NextResponse.json({ error: "Failed to record check-out" }, { status: 500 })
  }
}