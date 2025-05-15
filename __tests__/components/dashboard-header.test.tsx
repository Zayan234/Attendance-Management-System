import { render, screen } from "@testing-library/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

describe("DashboardHeader", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Default mock implementations
    ;(usePathname as jest.Mock).mockReturnValue("/dashboard")
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "Test User",
          role: "ADMIN",
        },
      },
      status: "authenticated",
    })
  })

  test("renders admin navigation links", () => {
    render(<DashboardHeader />)

    // Check for main navigation links for admin
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Employees")).toBeInTheDocument()
    expect(screen.getByText("Departments")).toBeInTheDocument()
    expect(screen.getByText("Attendance")).toBeInTheDocument()
    expect(screen.getByText("Reports")).toBeInTheDocument()
  })

  test("renders employee navigation links", () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "Test User",
          role: "EMPLOYEE",
        },
      },
      status: "authenticated",
    })

    render(<DashboardHeader />)

    // Check for main navigation links for employee
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Settings")).toBeInTheDocument()
  })

  test("highlights current page", () => {
    render(<DashboardHeader />)

    // The Dashboard link should be highlighted since we mocked the path to be /dashboard
    const dashboardLink = screen.getByText("Dashboard").closest("a")
    expect(dashboardLink).toHaveClass("text-primary")

    // Other links should not be highlighted
    const employeesLink = screen.getByText("Employees").closest("a")
    expect(employeesLink).not.toHaveClass("text-primary")
  })

  test("renders mobile menu button", () => {
    render(<DashboardHeader />)

    // Check for mobile menu button
    const menuButton = screen.getByRole("button", { name: /toggle menu/i })
    expect(menuButton).toBeInTheDocument()
  })
})
