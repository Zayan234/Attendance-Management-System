"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"

export default function ResetAttendancePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function resetAttendance() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/reset-attendance", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok) {
        setIsComplete(true)
      } else {
        setError(data.error || "An error occurred during reset")
      }
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-8 pt-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Reset Attendance Records</CardTitle>
              <CardDescription>Clear all attendance records from the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isComplete ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center text-center text-green-500 mb-4">
                    <CheckCircle className="h-16 w-16" />
                  </div>
                  <p className="text-center">All attendance records have been successfully deleted!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>This will delete all attendance records in the system. This action cannot be undone.</p>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Warning: This is a destructive operation. All attendance data will be permanently removed.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {isComplete ? (
                <Button asChild className="w-full">
                  <Link href="/attendance">Go to Attendance</Link>
                </Button>
              ) : (
                <Button onClick={resetAttendance} disabled={isLoading} variant="destructive" className="w-full">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Resetting..." : "Reset Attendance Records"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
