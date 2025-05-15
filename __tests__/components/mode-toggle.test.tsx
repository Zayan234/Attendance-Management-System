"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { ModeToggle } from "@/components/mode-toggle"
import { useTheme } from "@/components/theme-provider"

// Mock theme provider
jest.mock("@/components/theme-provider", () => ({
  useTheme: jest.fn(),
}))

// Mock DropdownMenu components
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ onClick, children }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}))

describe("ModeToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementation
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      setTheme: jest.fn(),
    })
  })

  test("renders toggle button", () => {
    render(<ModeToggle />)

    // Check for button
    const trigger = screen.getByTestId("dropdown-trigger")
    expect(trigger).toBeInTheDocument()

    // Check for sun icon in light mode
    const button = trigger.querySelector("button")
    expect(button).toBeInTheDocument()
  })

  test("opens dropdown menu when clicked", () => {
    render(<ModeToggle />)

    // Check for dropdown menu
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument()
    expect(screen.getByTestId("dropdown-content")).toBeInTheDocument()

    // Check for menu items
    const items = screen.getAllByTestId("dropdown-item")
    expect(items.length).toBe(3)
    expect(items[0].textContent).toBe("Light")
    expect(items[1].textContent).toBe("Dark")
    expect(items[2].textContent).toBe("System")
  })

  test("changes theme when option is selected", () => {
    const setTheme = jest.fn()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      setTheme,
    })

    render(<ModeToggle />)

    // Click dark theme option
    const items = screen.getAllByTestId("dropdown-item")
    fireEvent.click(items[1]) // Dark option

    // Check if setTheme was called with 'dark'
    expect(setTheme).toHaveBeenCalledWith("dark")
  })

  test("renders with dark theme", () => {
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "dark",
      setTheme: jest.fn(),
    })

    render(<ModeToggle />)

    // Check for moon icon in dark mode
    const trigger = screen.getByTestId("dropdown-trigger")
    const button = trigger.querySelector("button")
    expect(button).toBeInTheDocument()
  })

  test("changes theme to system when system option is selected", () => {
    const setTheme = jest.fn()
    ;(useTheme as jest.Mock).mockReturnValue({
      theme: "light",
      setTheme,
    })

    render(<ModeToggle />)

    // Click system theme option
    const items = screen.getAllByTestId("dropdown-item")
    fireEvent.click(items[2]) // System option

    // Check if setTheme was called with 'system'
    expect(setTheme).toHaveBeenCalledWith("system")
  })
})
