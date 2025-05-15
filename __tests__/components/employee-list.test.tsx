import { render, screen, waitFor } from "@testing-library/react"
import { EmployeeList } from "@/components/employee-list"

// Mock employee data
const mockEmployeeData = [
  {
    id: "emp1",
    name: "John Doe",
    email: "john@example.com",
    role: "EMPLOYEE",
    position: "Developer",
    status: "ACTIVE",
    joinDate: "2023-01-15T00:00:00.000Z",
    department: {
      id: "dept1",
      name: "Engineering",
    },
  },
  {
    id: "emp2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "MANAGER",
    position: "Project Manager",
    status: "ON_LEAVE",
    joinDate: "2022-08-10T00:00:00.000Z",
    department: {
      id: "dept2",
      name: "Marketing",
    },
  },
]

// Mock console.error to prevent test output pollution
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})
afterAll(() => {
  console.error = originalConsoleError
})

describe("EmployeeList", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmployeeData),
      }),
    ) as jest.Mock
  })

  test("renders employee list", async () => {
    render(<EmployeeList />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
    })

    // Check for employee details
    expect(screen.getByText("john@example.com")).toBeInTheDocument()
    expect(screen.getByText("Engineering")).toBeInTheDocument()
    expect(screen.getByText("Developer")).toBeInTheDocument()
    expect(screen.getByText("ACTIVE")).toBeInTheDocument()
  })

  test("renders loading state", async () => {
    // Mock fetch to delay response
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve(mockEmployeeData),
              }),
            100,
          ),
        ),
    ) as jest.Mock

    render(<EmployeeList />)

    // Should show loading indicator (check for the spinner)
    const loadingSpinner = document.querySelector(".animate-spin")
    expect(loadingSpinner).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText("John Doe")).toBeInTheDocument()
    })
  })

  test("renders error state", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    render(<EmployeeList />)

    // Wait for error to show
    await waitFor(() => {
      const errorAlert = screen.getByRole("alert")
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert.textContent).toContain("Failed to fetch")
    })
  })

  test("renders empty state", async () => {
    // Mock fetch to return empty array
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    ) as jest.Mock

    render(<EmployeeList />)

    // Wait for empty state to show
    await waitFor(() => {
      expect(screen.getByText("No employees found")).toBeInTheDocument()
    })
  })

  test("handles server error response", async () => {
    // Mock fetch to return error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    ) as jest.Mock

    render(<EmployeeList />)

    // Wait for error to show
    await waitFor(() => {
      const errorAlert = screen.getByRole("alert")
      expect(errorAlert).toBeInTheDocument()
      expect(errorAlert.textContent).toContain("Failed to fetch employees")
    })
  })
})
