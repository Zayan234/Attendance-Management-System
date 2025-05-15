import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Building, Calendar, Shield } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Profile" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Admin User</CardTitle>
                <CardDescription>admin@example.com</CardDescription>
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
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          defaultValue="Admin User"
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          defaultValue="admin@example.com"
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="department"
                          defaultValue="Administration"
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Join Date</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="joinDate"
                          defaultValue="Jan 1, 2023"
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <Input
                          id="role"
                          defaultValue="Admin"
                          className="border-0 p-0 shadow-none focus-visible:ring-0"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
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
