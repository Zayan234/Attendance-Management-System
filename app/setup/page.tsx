"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupData, setSetupData] = useState<any>(null)

  async function runSetup() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/setup")
      const data = await response.json()

      if (response.ok) {
        setIsComplete(true)
        setSetupData(data)
      } else {
        setError(data.error || "An error occurred during setup")
      }
    } catch (err) {
      setError("Failed to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">AttendanceHub Setup</CardTitle>
          <CardDescription>Initialize your attendance management system</CardDescription>
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
              <p className="text-center">Setup completed successfully!</p>

              <div className="border rounded-md p-4 space-y-2">
                <p className="font-medium">Admin Login:</p>
                <p>Email: {setupData?.users?.admin?.email}</p>
                <p>Password: {setupData?.users?.admin?.password}</p>

                <div className="border-t my-2"></div>

                <p className="font-medium">Employee Login:</p>
                <p>Email: {setupData?.users?.employee1?.email}</p>
                <p>Password: {setupData?.users?.employee1?.password}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>This will set up your database with initial data including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Admin user</li>
                <li>Sample departments</li>
                <li>Sample employees</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                Note: This should only be run once when setting up the system for the first time.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {isComplete ? (
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          ) : (
            <Button onClick={runSetup} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Setting up..." : "Initialize Database"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
