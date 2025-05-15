import { NextResponse } from "next/server"

export async function GET() {
  try {
    const now = new Date()
    
    return NextResponse.json({
      serverTime: now.toISOString(),
      timestamp: Date.now(),
      formattedDate: now.toString(),
      utcString: now.toUTCString(),
      dateOnly: now.toISOString().split('T')[0],
    })
  } catch (error) {
    console.error("Error getting server time:", error)
    return NextResponse.json({ error: "Failed to get server time" }, { status: 500 })
  }
}