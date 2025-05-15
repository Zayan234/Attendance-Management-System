import { render, screen, waitFor } from "@testing-library/react"
import { EmployeeAttendanceHistory } from "@/components/employee-attendance-history"
import { useSession } from "next-auth/react"

// Mock next-auth/react
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}))

// Mock attendance data
const mockAttendanceData = [
  {
    id: "1",
    date: "2023-05-01T00:00:00.000Z",
    checkIn: "2023-05-01T09:00:00.000Z",
    checkOut: "2023-05-01T17:00:00.000Z",
    status: "PRESENT",
  },
  {
    id: "2",
    date: "2023-05-02T00:00:00.000Z",
    checkIn: "2023-05-02T09:30:00.000Z",
    checkOut: null,
    status: "LATE",
  },
]

describe("EmployeeAttendanceHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementation
    ;(useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "user-id",
          name: "Test User",
          role: "EMPLOYEE",
        },
      },
      status: "authenticated",
    })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAttendanceData),
      }),
    ) as jest.Mock
  })

  test("renders attendance history", async () => {
    render(<EmployeeAttendanceHistory />)

    // Initially shows loading
    expect(screen.getByText(/loading attendance history/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("May 1, 2023")).toBeInTheDocument()
      expect(screen.getByText("May 2, 2023")).toBeInTheDocument()
    })
  })

  test("renders with specific userId", async () => {
    render(<EmployeeAttendanceHistory userId="specific-user-id" />)

    // Check that fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("userId=specific-user-id"))
  })

  test("renders with limit", async () => {
    render(<EmployeeAttendanceHistory limit={5} />)

    // Check that fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"))
  })

  test("renders error state", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    render(<EmployeeAttendanceHistory />)

    // Wait for error to show
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument()
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

    render(<EmployeeAttendanceHistory />)

    // Wait for empty state to show
    await waitFor(() => {
      expect(screen.getByText(/No attendance records found/i)).toBeInTheDocument()
    })
  })
})
