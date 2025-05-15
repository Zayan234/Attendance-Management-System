"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Building, Calendar, Shield } from "lucide-react"
import { format } from "date-fns"

export default function EmployeeProfilePage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          console.error("Failed to fetch user data")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div>Loading profile data...</div>
        </main>
      </div>
    )
  }

  // Create initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Format join date if available
  const formatJoinDate = (date: string | undefined) => {
    if (!date) return "N/A"
    try {
      return format(new Date(date), "MMM d, yyyy")
    } catch (e) {
      return "N/A"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Profile" />
                <AvatarFallback>{getInitials(userData?.name || "")}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userData?.name || "User"}</CardTitle>
                <CardDescription>{userData?.email || "No email available"}</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:max-w-[400px]">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>View your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          defaultValue={userData?.name || "Not available"}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          defaultValue={userData?.email || "Not available"}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="department"
                          defaultValue={userData?.department?.name || "Not assigned"}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="joinDate"
                          defaultValue={formatJoinDate(userData?.joinDate)}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="role"
                          defaultValue={userData?.role || "Employee"}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Position</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="position"
                          defaultValue={userData?.position || "Not specified"}
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  <div className="flex justify-end">
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
