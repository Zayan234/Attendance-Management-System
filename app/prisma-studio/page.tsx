"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, ExternalLink, Terminal } from "lucide-react"

export default function PrismaStudioPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Prisma Studio</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>View Database Records with Prisma Studio</CardTitle>
            <CardDescription>Follow these steps to view and manage your database records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-4">
              <h3 className="text-lg font-medium">How to Open Prisma Studio</h3>

              <div className="space-y-2">
                <h4 className="font-medium">Step 1: Open your terminal</h4>
                <div className="flex items-center">
                  <Terminal className="mr-2 h-5 w-5" />
                  <p>Open a terminal or command prompt in your project directory</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Step 2: Run Prisma Studio</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">npx prisma studio</div>
                <p className="text-sm text-muted-foreground">This command will start Prisma Studio on port 5555</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Step 3: Access Prisma Studio in your browser</h4>
                <p>
                  Once started, Prisma Studio will be available at:{" "}
                  <a
                    href="http://localhost:5555"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    http://localhost:5555
                  </a>
                </p>
                <Button asChild>
                  <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer">
                    <Database className="mr-2 h-4 w-4" />
                    Open Prisma Studio
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-2">What You Can Do in Prisma Studio</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>View all tables in your database</li>
                <li>Create, read, update, and delete records</li>
                <li>Filter and sort records</li>
                <li>View relationships between records</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
