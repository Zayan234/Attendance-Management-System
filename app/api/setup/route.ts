import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  try {
    // Check if admin user already exists
    const adminExists = await prisma.user.findFirst({
      where: { email: "admin@example.com" },
    })

    if (adminExists) {
      return NextResponse.json({ message: "Setup already completed" })
    }

    // Create departments
    const engineering = await prisma.department.create({
      data: { name: "Engineering" },
    })

    const marketing = await prisma.department.create({
      data: { name: "Marketing" },
    })

    const hr = await prisma.department.create({
      data: { name: "HR" },
    })

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

    // Create sample employees
    const johnPassword = await hashPassword("password")
    const john = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: johnPassword,
        role: "EMPLOYEE",
        departmentId: engineering.id,
        position: "Software Engineer",
        status: "ACTIVE",
        joinDate: new Date("2022-01-15"),
      },
    })

    const janePassword = await hashPassword("password")
    const jane = await prisma.user.create({
      data: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: janePassword,
        role: "EMPLOYEE",
        departmentId: marketing.id,
        position: "Marketing Manager",
        status: "ACTIVE",
        joinDate: new Date("2021-08-10"),
      },
    })

    // Create some attendance records for the employees
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Create attendance records for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      // John's attendance (mostly present)
      if (Math.random() > 0.1) {
        await prisma.attendance.create({
          data: {
            userId: john.id,
            date: date,
            checkIn: new Date(new Date(date).setHours(8, Math.floor(Math.random() * 30), 0)),
            checkOut: new Date(new Date(date).setHours(17, Math.floor(Math.random() * 30), 0)),
            status: Math.random() > 0.2 ? "PRESENT" : "LATE",
          },
        })
      } else {
        await prisma.attendance.create({
          data: {
            userId: john.id,
            date: date,
            status: "ABSENT",
          },
        })
      }

      // Jane's attendance (lower attendance rate for demonstration)
      if (Math.random() > 0.3) {
        await prisma.attendance.create({
          data: {
            userId: jane.id,
            date: date,
            checkIn: new Date(new Date(date).setHours(8, Math.floor(Math.random() * 45), 0)),
            checkOut: new Date(new Date(date).setHours(17, Math.floor(Math.random() * 30), 0)),
            status: Math.random() > 0.3 ? "PRESENT" : "LATE",
          },
        })
      } else {
        await prisma.attendance.create({
          data: {
            userId: jane.id,
            date: date,
            status: "ABSENT",
          },
        })
      }
    }

    return NextResponse.json({
      message: "Database setup completed successfully",
      users: {
        admin: { email: admin.email, password: "admin123" },
        employee1: { email: john.email, password: "password" },
        employee2: { email: jane.email, password: "password" },
      },
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to set up database" }, { status: 500 })
  }
}
