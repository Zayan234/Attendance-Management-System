import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { DepartmentAttendanceReport } from "@/components/department-attendance-report"
import { useDepartments } from "@/lib/hooks/use-departments"
import "@testing-library/jest-dom"

// Mock the useDepartments hook
jest.mock("@/lib/hooks/use-departments", () => ({
  useDepartments: jest.fn(),
}))

// Mock the Recharts components
jest.mock("recharts", () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="chart-line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="chart-tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div data-testid="chart-legend" />,
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("DepartmentAttendanceReport", () => {
  // Sample mock data
  const mockDepartments = [
    { id: "dept1", name: "Engineering" },
    { id: "dept2", name: "Marketing" },
  ]

  const mockReportData = {
    department: { id: "dept1", name: "Engineering" },
    monthlyData: [
      { month: "Jan", rate: 95 },
      { month: "Feb", rate: 92 },
      { month: "Mar", rate: 97 },
    ],
    statistics: {
      employeeCount: 15,
      attendanceRate: 94,
      perfectAttendance: 8,
      improvement: "+2%",
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders loading state when fetching departments", () => {
    // Mock the hook to return loading state
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: [],
      loading: true,
    })

    render(<DepartmentAttendanceReport />)

    // Check for loading spinner
    expect(screen.getByTestId("loading-departments")).toBeInTheDocument()
  })

  test("renders empty state when no departments are found", () => {
    // Mock the hook to return empty departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: [],
      loading: false,
    })

    render(<DepartmentAttendanceReport />)

    // Check for empty state message
    expect(screen.getByText(/No departments found/i)).toBeInTheDocument()
  })

  test("renders loading state when fetching department report", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch to delay response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => {
            resolve({
              ok: true,
              json: () => Promise.resolve(mockReportData),
            })
          }, 100),
        ),
    )

    render(<DepartmentAttendanceReport />)

    // Check for loading spinner for report data
    expect(screen.getByTestId("loading-report")).toBeInTheDocument()
  })

  test("renders error state when fetch fails", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch to return error
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      }),
    )

    render(<DepartmentAttendanceReport />)

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Failed to load department attendance data/i)).toBeInTheDocument()
    })
  })

  test("renders department report data successfully", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch to return data
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData),
      }),
    )

    render(<DepartmentAttendanceReport />)

    // Wait for data to load
    await waitFor(() => {
      // Check for department name in title
      expect(screen.getByText(/Attendance Trend for Engineering/i)).toBeInTheDocument()

      // Check for chart
      expect(screen.getByTestId("responsive-container")).toBeInTheDocument()

      // Check for statistics
      expect(screen.getByText("15")).toBeInTheDocument() // Total Employees
      expect(screen.getByText("94%")).toBeInTheDocument() // Avg. Attendance
      expect(screen.getByText("8")).toBeInTheDocument() // Perfect Attendance
      expect(screen.getByText("+2%")).toBeInTheDocument() // Improvement
    })
  })

  test("handles department selection change", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch responses for different departments
    mockFetch.mockImplementation((url) => {
      if (url.includes("dept1")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockReportData,
              department: { id: "dept1", name: "Engineering" },
            }),
        })
      } else {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ...mockReportData,
              department: { id: "dept2", name: "Marketing" },
            }),
        })
      }
    })

    render(<DepartmentAttendanceReport />)

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText(/Engineering/i)).toBeInTheDocument()
    })

    // Change department selection
    fireEvent.click(screen.getByRole("combobox"))
    fireEvent.click(screen.getByText("Marketing"))

    // Wait for new data to load
    await waitFor(() => {
      expect(screen.getByText(/Marketing/i)).toBeInTheDocument()
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("dept2"))
    })
  })

  test("renders empty chart message when no monthly data", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch to return data with empty monthly data
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockReportData,
            monthlyData: [],
          }),
      }),
    )

    render(<DepartmentAttendanceReport />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/No attendance data available for this department/i)).toBeInTheDocument()
    })
  })

  test("automatically selects first department when departments load", async () => {
    // Mock the hook to return departments
    ;(useDepartments as jest.Mock).mockReturnValue({
      departments: mockDepartments,
      loading: false,
    })

    // Mock fetch
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockReportData),
      }),
    )

    render(<DepartmentAttendanceReport />)

    // Check that fetch was called with the first department ID
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("dept1"))
    })
  })
})
