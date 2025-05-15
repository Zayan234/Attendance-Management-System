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
    
    // Get the local date string in YYYY-MM-DD format based on local timezone
    const localDate = new Date()
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, '0')
    const day = String(localDate.getDate()).padStart(2, '0')
    const localDateString = `${year}-${month}-${day}`
    
    console.log('Resetting attendance for local date:', localDateString)

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
      return NextResponse.json({ message: "No attendance record found for today" })
    }

    // Delete the record
    await prisma.attendance.delete({
      where: {
        id: existingRecord.id,
      },
    })

    return NextResponse.json({ message: "Successfully reset today's attendance record" })
  } catch (error) {
    console.error("Error resetting attendance:", error)
    return NextResponse.json({ error: "Failed to reset attendance record" }, { status: 500 })
  }
}