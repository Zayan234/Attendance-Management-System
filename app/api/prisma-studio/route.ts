import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
  try {
    // This endpoint should only be available in development
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
    }

    // Start Prisma Studio
    await execAsync("npx prisma studio")

    return NextResponse.json({
      message: "Prisma Studio started successfully",
      info: "Prisma Studio should now be running at http://localhost:5555",
    })
  } catch (error) {
    console.error("Error starting Prisma Studio:", error)
    return NextResponse.json(
      {
        error: "Failed to start Prisma Studio",
        message: "You can manually start Prisma Studio by running 'npx prisma studio' in your terminal",
      },
      { status: 500 },
    )
  }
}
