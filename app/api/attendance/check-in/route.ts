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
    
    // Create a date object at midnight local time
    const today = new Date(`${localDateString}T00:00:00`)
    
    console.log('Check-in for local date:', localDateString)
    console.log('Today date object:', today.toISOString())

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

    if (existingRecord) {
      console.log('Found existing record:', existingRecord)
      // If already checked in, return the existing record
      if (existingRecord.checkIn) {
        return NextResponse.json(existingRecord)
      }

      // Otherwise, update the existing record with check-in time
      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: now,
          status: "PRESENT",
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
    }

    console.log('Creating new attendance record for local date:', localDateString)
    // Create a new attendance record
    const newRecord = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: now,
        status: "PRESENT",
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

    return NextResponse.json(newRecord)
  } catch (error) {
    console.error("Error recording check-in:", error)
    return NextResponse.json({ error: "Failed to record check-in" }, { status: 500 })
  }
}