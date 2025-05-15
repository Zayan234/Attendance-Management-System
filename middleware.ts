import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exclude public paths from authentication check
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/setup" ||
    pathname.startsWith("/api/setup")
  ) {
    return NextResponse.next()
  }

  const token = await getToken({ req: request })

  // Redirect to login if not authenticated and not already on login page
  if (!token && pathname !== "/login") {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (token) {
    const userRole = token.role as string

    // Admin routes - only accessible by admins
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/employees") ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/reports")
    ) {
      if (userRole !== "ADMIN") {
        const url = new URL("/employee/dashboard", request.url)
        return NextResponse.redirect(url)
      }
    }

    // Employee routes - only accessible by employees
    if (pathname.startsWith("/employee")) {
      if (userRole === "ADMIN") {
        const url = new URL("/dashboard", request.url)
        return NextResponse.redirect(url)
      }
    }

    // Redirect authenticated users from login page
    if (pathname === "/login") {
      const url = new URL(userRole === "ADMIN" ? "/dashboard" : "/employee/dashboard", request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth/callback|_next/static|_next/image|favicon.ico).*)"],
}
