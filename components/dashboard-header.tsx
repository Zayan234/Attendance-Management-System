"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function DashboardHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  const adminLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/employees", label: "Employees" },
    { href: "/add-employee", label: "Add Employee" },
    { href: "/departments", label: "Departments" },
    { href: "/attendance", label: "Attendance" },
    { href: "/reports", label: "Reports" },
    { href: "/profile", label: "Profile" },
    { href: "/settings", label: "Settings" },
    { href: "/reset-attendance", label: "Reset Attendance" },
  ]

  const employeeLinks = [
    { href: "/employee/dashboard", label: "Dashboard" },
    { href: "/employee/profile", label: "Profile" },
    { href: "/employee/settings", label: "Settings" },
  ]

  const links = isAdmin ? adminLinks : employeeLinks

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link href={isAdmin ? "/dashboard" : "/employee/dashboard"} className="font-bold text-xl">
            AttendanceHub
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 py-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium ${
                      pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="justify-start px-2"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
