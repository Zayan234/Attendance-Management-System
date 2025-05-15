"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"

interface RecentActivityProps {
  className?: string
}

interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
    initials: string
  }
  action: string
  time: string
  timestamp: string
}

export function RecentActivity({ className }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true)
        const response = await fetch("/api/attendance/recent")

        if (!response.ok) {
          throw new Error("Failed to fetch recent activity")
        }

        const data = await response.json()

        // Transform the data into the format we need
        const formattedActivities = data.map((record: any) => {
          let action = "checked in"
          if (record.status === "ABSENT") action = "is absent"
          else if (record.status === "LATE") action = "checked in late"
          else if (record.checkOut) action = "checked out"

          const initials = record.user.name
            ? record.user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
            : "??"

          return {
            id: record.id,
            user: {
              name: record.user.name,
              avatar: `/placeholder.svg?height=32&width=32&text=${initials}`,
              initials,
            },
            action,
            time: record.checkIn ? format(new Date(record.checkIn), "h:mm a") : "",
            timestamp: formatDistanceToNow(new Date(record.date), { addSuffix: true }),
          }
        })

        setActivities(formattedActivities)
        setError(null)
      } catch (err) {
        console.error("Error fetching recent activity:", err)
        setError("Failed to load recent activity")
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest attendance updates</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} {activity.time && `at ${activity.time}`}
                  </p>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
