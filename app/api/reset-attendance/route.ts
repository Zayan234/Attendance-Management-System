import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all attendance records
    await prisma.attendance.deleteMany({})

    return NextResponse.json({
      success: true,
      message: "All attendance records have been deleted successfully.",
    })
  } catch (error) {
    console.error("Error resetting attendance records:", error)
    return NextResponse.json({ error: "Failed to reset attendance records" }, { status: 500 })
  }
}
