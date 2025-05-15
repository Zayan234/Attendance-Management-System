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
    const date = searchParams.get("date")
    const userId = searchParams.get("userId")
    const departmentId = searchParams.get("departmentId")
    const status = searchParams.get("status")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    // Build query filters
    const filters: any = {}

    if (date) {
      // Parse the date in local timezone
      const parsedDate = new Date(date)
      
      // Create start and end dates for the day in local timezone
      const startDate = new Date(parsedDate)
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(parsedDate)
      endDate.setHours(23, 59, 59, 999)
      
      console.log('Querying attendance for date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      filters.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    if (userId) {
      filters.userId = userId
    }

    if (status) {
      filters.status = status
    }

    if (departmentId) {
      filters.user = {
        departmentId,
      }
    }

    // Fetch attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: filters,
      include: {
        user: {
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
        },
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
    })

    return NextResponse.json(attendanceRecords)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, date, checkIn, checkOut, status, notes } = body

    // Validate required fields
    if (!userId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the local date string in YYYY-MM-DD format based on local timezone
    let localDate: Date
    
    if (date) {
      localDate = new Date(date)
    } else {
      localDate = new Date()
    }
    
    const year = localDate.getFullYear()
    const month = String(localDate.getMonth() + 1).padStart(2, '0')
    const day = String(localDate.getDate()).padStart(2, '0')
    const localDateString = `${year}-${month}-${day}`
    
    // Create a date object at midnight local time
    const normalizedDate = new Date(`${localDateString}T00:00:00`)
    
    console.log('Creating/updating attendance for local date:', localDateString)
    console.log('Normalized date:', normalizedDate.toISOString())

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
      // Update existing record
      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: checkIn ? new Date(checkIn) : existingRecord.checkIn,
          checkOut: checkOut ? new Date(checkOut) : existingRecord.checkOut,
          status: status || existingRecord.status,
          notes: notes || existingRecord.notes,
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
    } else {
      console.log('Creating new record for local date:', localDateString)
      // Create new attendance record
      const newRecord = await prisma.attendance.create({
        data: {
          userId,
          date: normalizedDate,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          status,
          notes,
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

      return NextResponse.json(newRecord, { status: 201 })
    }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}