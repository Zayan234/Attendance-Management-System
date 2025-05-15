"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { UserNav } from "@/components/user-nav"
import { useSession, signOut } from "next-auth/react"

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}))

// Mock dropdown menu
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }) => <button data-testid="dropdown-trigger">{children}</button>,
  DropdownMenuContent: ({ children }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuLabel: ({ children }) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
  DropdownMenuItem: ({ children, onClick }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}))

describe("UserNav", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Default mock implementation
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: "Test User",
          email: "test@example.com",
          role: "ADMIN",
        },
      },
      status: "authenticated",
    })
  })

  test("renders avatar with correct initials", () => {
    render(<UserNav />)

    // Check for avatar with initials
    expect(screen.getByText("TU")).toBeInTheDocument()
  })

  test("handles sign out", () => {
    render(<UserNav />)

    // Click the dropdown trigger
    fireEvent.click(screen.getByTestId("dropdown-trigger"))

    // Find and click the logout button
    const logoutButtons = screen.getAllByTestId("dropdown-item")
    // Assuming the last item is the logout button
    fireEvent.click(logoutButtons[logoutButtons.length - 1])

    // Check if signOut was called
    expect(signOut).toHaveBeenCalled()
  })
})
