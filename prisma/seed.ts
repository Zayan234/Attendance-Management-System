import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create departments
  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {},
    create: { name: "Engineering" },
  })

  const marketing = await prisma.department.upsert({
    where: { name: "Marketing" },
    update: {},
    create: { name: "Marketing" },
  })

  const hr = await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: { name: "HR" },
  })

  const finance = await prisma.department.upsert({
    where: { name: "Finance" },
    update: {},
    create: { name: "Finance" },
  })

  // Create admin user
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  // Create sample employees
  const johnPassword = await hash("password", 12)
  const john = await prisma.user.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
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

  const janePassword = await hash("password", 12)
  const jane = await prisma.user.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
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

  const robertPassword = await hash("password", 12)
  const robert = await prisma.user.upsert({
    where: { email: "robert.johnson@example.com" },
    update: {},
    create: {
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      password: robertPassword,
      role: "EMPLOYEE",
      departmentId: hr.id,
      position: "HR Specialist",
      status: "ON_LEAVE",
      joinDate: new Date("2022-03-22"),
    },
  })

  // Create sample attendance records
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // John's attendance
  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: john.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: john.id,
      date: today,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 45),
      checkOut: null,
      status: "PRESENT",
    },
  })

  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: john.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: john.id,
      date: yesterday,
      checkIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 30),
      checkOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 15),
      status: "PRESENT",
    },
  })

  // Jane's attendance
  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: jane.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: jane.id,
      date: today,
      checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 2),
      checkOut: null,
      status: "PRESENT",
    },
  })

  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: jane.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: jane.id,
      date: yesterday,
      checkIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 5),
      checkOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 30),
      status: "PRESENT",
    },
  })

  // Robert's attendance (absent today)
  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: robert.id,
        date: today,
      },
    },
    update: {},
    create: {
      userId: robert.id,
      date: today,
      checkIn: null,
      checkOut: null,
      status: "ABSENT",
      notes: "On leave",
    },
  })

  await prisma.attendance.upsert({
    where: {
      userId_date: {
        userId: robert.id,
        date: yesterday,
      },
    },
    update: {},
    create: {
      userId: robert.id,
      date: yesterday,
      checkIn: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 8, 55),
      checkOut: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 17, 0),
      status: "PRESENT",
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
