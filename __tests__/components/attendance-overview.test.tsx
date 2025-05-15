import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { AttendanceOverview } from "@/components/attendance-overview"

// Mock weekly and monthly data
const mockWeeklyData = [
  { name: "Mon", present: 15, absent: 2, late: 3 },
  { name: "Tue", present: 16, absent: 1, late: 2 },
  { name: "Wed", present: 14, absent: 3, late: 2 },
  { name: "Thu", present: 15, absent: 2, late: 3 },
  { name: "Fri", present: 13, absent: 4, late: 2 },
]

const mockMonthlyData = [
  { name: "Week 1", present: 75, absent: 10, late: 15 },
  { name: "Week 2", present: 70, absent: 15, late: 10 },
  { name: "Week 3", present: 80, absent: 5, late: 10 },
  { name: "Week 4", present: 72, absent: 12, late: 8 },
]

describe("AttendanceOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock fetch responses for weekly and monthly data
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ weeklyData: mockWeeklyData }),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ monthlyData: mockMonthlyData }),
        }),
      )
  })

  test("renders attendance overview with weekly data by default", async () => {
    render(<AttendanceOverview />)

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check that weekly tab is active
    const weeklyTab = screen.getByRole("tab", { name: /weekly/i })
    expect(weeklyTab).toHaveAttribute("data-state", "active")
  })

  test("switches between weekly and monthly views", async () => {
    render(<AttendanceOverview />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Click on monthly tab
    const monthlyTab = screen.getByRole("tab", { name: /monthly/i })
    fireEvent.click(monthlyTab)

    // Check that monthly tab is now active
    expect(monthlyTab).toHaveAttribute("data-state", "active")
  })

  test("renders with custom className", async () => {
    render(<AttendanceOverview className="custom-class" />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check that the custom class is applied
    const card = screen.getByText("Attendance Overview").closest("div")
    expect(card).toHaveClass("custom-class")
  })

  test("handles fetch error", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch")))

    render(<AttendanceOverview />)

    // Wait for error to show
    await waitFor(() => {
      expect(screen.getByText(/Failed to load attendance overview data/i)).toBeInTheDocument()
    })
  })

  test("handles empty data", async () => {
    // Mock fetch to return empty arrays
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ weeklyData: [] }),
        }),
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ monthlyData: [] }),
        }),
      )

    render(<AttendanceOverview />)

    // Wait for empty state to show
    await waitFor(() => {
      expect(screen.getByText(/No attendance data available/i)).toBeInTheDocument()
    })
  })
})
