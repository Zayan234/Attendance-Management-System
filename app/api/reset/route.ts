import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    // This is a destructive operation that will clear all data
    // We should only allow this in development or with proper authorization

    // Clear all existing data
    await prisma.attendance.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.department.deleteMany({})

    // Create admin user
    const adminPassword = await hashPassword("admin123")
    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Database reset successfully. Admin user created.",
      admin: {
        email: admin.email,
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("Error resetting database:", error)
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 })
  }
}
