import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 })
    }

    // Check if department already exists
    const existingDepartment = await prisma.department.findFirst({
      where: { name },
    })

    if (existingDepartment) {
      return NextResponse.json({ error: "Department with this name already exists" }, { status: 400 })
    }

    // Create new department
    const newDepartment = await prisma.department.create({
      data: { name },
    })

    return NextResponse.json(newDepartment, { status: 201 })
  } catch (error) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}
