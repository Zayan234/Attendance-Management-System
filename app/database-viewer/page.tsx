"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, ExternalLink } from "lucide-react"

export default function DatabaseViewerPage() {
  const [isStarting, setIsStarting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startPrismaStudio = async () => {
    setIsStarting(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch("/api/prisma-studio")
      const data = await response.json()

      if (response.ok) {
        setMessage(data.info || "Prisma Studio started successfully")
      } else {
        setError(data.error || "Failed to start Prisma Studio")
        setMessage(data.message || null)
      }
    } catch (err) {
      setError("An error occurred while trying to start Prisma Studio")
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Database Viewer</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>View Database Records</CardTitle>
            <CardDescription>Use Prisma Studio to view and manage your database records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Prisma Studio is a visual editor for your database. You can use it to view, create, update, and delete
              records.
            </p>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-medium">Option 1: Start Prisma Studio from the browser</h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to start Prisma Studio. This will open a new tab with Prisma Studio.
              </p>
              <Button onClick={startPrismaStudio} disabled={isStarting}>
                <Database className="mr-2 h-4 w-4" />
                {isStarting ? "Starting..." : "Start Prisma Studio"}
              </Button>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="text-lg font-medium">Option 2: Start Prisma Studio from the terminal</h3>
              <p className="text-sm text-muted-foreground">
                Run the following command in your terminal to start Prisma Studio:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">npx prisma studio</div>
              <p className="text-sm text-muted-foreground">
                Then open{" "}
                <a
                  href="http://localhost:5555"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  http://localhost:5555
                </a>{" "}
                in your browser.
              </p>
              <Button variant="outline" asChild>
                <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer">
                  Open Prisma Studio
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
