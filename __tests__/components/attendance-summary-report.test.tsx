import { render, screen, waitFor } from "@testing-library/react"
import { AttendanceSummaryReport } from "@/components/attendance-summary-report"
import "@testing-library/jest-dom"

// Mock the recharts library
jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts")
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children, width, height }) => (
      <div data-testid="responsive-container" style={{ width, height }}>
        {children}
      </div>
    ),
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children, data }) => (
      <div data-testid="pie" data-pie-data={JSON.stringify(data)}>
        {children}
      </div>
    ),
    Cell: ({ fill }) => <div data-testid="pie-cell" style={{ backgroundColor: fill }} />,
    Legend: () => <div data-testid="legend">Legend</div>,
    Tooltip: () => <div data-testid="tooltip">Tooltip</div>,
  }
})

// Mock fetch API
const mockFetch = jest.fn()
global.fetch = mockFetch

describe("AttendanceSummaryReport", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  const mockSuccessData = {
    stats: {
      present: 75,
      absent: 15,
      late: 8,
      halfDay: 2,
    },
    totalEmployees: 100,
    attendanceRate: 85,
    perfectAttendance: 65,
    chronicLateness: 5,
    departmentStats: [
      {
        id: "dept1",
        name: "Engineering",
        attendanceRate: 90,
      },
      {
        id: "dept2",
        name: "Marketing",
        attendanceRate: 80,
      },
    ],
  }

  test("renders loading state initially", () => {
    // Mock a pending fetch request
    mockFetch.mockImplementationOnce(() => new Promise(() => {}))

    render(<AttendanceSummaryReport />)

    // Check for loading spinners
    const loaders = screen.getAllByTestId("loading-spinner")
    expect(loaders).toHaveLength(2)
  })

  test("renders error state when fetch fails", async () => {
    // Mock a failed fetch request
    mockFetch.mockRejectedValueOnce(new Error("API Error"))

    render(<AttendanceSummaryReport />)

    // Wait for the error state to be rendered
    await waitFor(() => {
      const errorMessages = screen.getAllByText("Failed to load attendance data")
      expect(errorMessages).toHaveLength(2)
    })
  })

  test("renders error state when response is not ok", async () => {
    // Mock a response with non-200 status
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    })

    render(<AttendanceSummaryReport />)

    // Wait for the error state to be rendered
    await waitFor(() => {
      const errorMessages = screen.getAllByText("Failed to load attendance data")
      expect(errorMessages).toHaveLength(2)
    })
  })

  test("renders attendance data successfully", async () => {
    // Mock a successful fetch request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    })

    render(<AttendanceSummaryReport />)

    // Wait for data to be loaded and rendered
    await waitFor(() => {
      // Check for chart title
      expect(screen.getByText("Attendance Overview")).toBeInTheDocument()
      expect(screen.getByText("Current month attendance distribution")).toBeInTheDocument()

      // Check for statistics title
      expect(screen.getByText("Attendance Statistics")).toBeInTheDocument()
      expect(screen.getByText("Key metrics for the current month")).toBeInTheDocument()

      // Check for employee stats
      expect(screen.getByText("Total Employees")).toBeInTheDocument()
      expect(screen.getByText("100")).toBeInTheDocument()

      // Check for attendance rate
      expect(screen.getByText("Avg. Attendance Rate")).toBeInTheDocument()
      expect(screen.getByText("85%")).toBeInTheDocument()

      // Check for perfect attendance
      expect(screen.getByText("Perfect Attendance")).toBeInTheDocument()
      expect(screen.getByText("65")).toBeInTheDocument()

      // Check for chronic lateness
      expect(screen.getByText("Chronic Lateness")).toBeInTheDocument()
      expect(screen.getByText("5")).toBeInTheDocument()

      // Check for department stats
      expect(screen.getByText("Department Attendance Rates")).toBeInTheDocument()
      expect(screen.getByText("Engineering")).toBeInTheDocument()
      expect(screen.getByText("90%")).toBeInTheDocument()
      expect(screen.getByText("Marketing")).toBeInTheDocument()
      expect(screen.getByText("80%")).toBeInTheDocument()
    })
  })

  test("renders pie chart with correct data", async () => {
    // Mock a successful fetch request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    })

    render(<AttendanceSummaryReport />)

    // Wait for data to be loaded and rendered
    await waitFor(() => {
      // Check for pie chart
      const pieElement = screen.getByTestId("pie")
      const pieData = JSON.parse(pieElement.getAttribute("data-pie-data") || "[]")

      // Verify pie data
      expect(pieData).toHaveLength(4)
      expect(pieData[0].name).toBe("Present")
      expect(pieData[0].value).toBe(75)
      expect(pieData[0].color).toBe("#22c55e")

      expect(pieData[1].name).toBe("Absent")
      expect(pieData[1].value).toBe(15)
      expect(pieData[1].color).toBe("#ef4444")

      // Check for pie cells
      const pieCells = screen.getAllByTestId("pie-cell")
      expect(pieCells).toHaveLength(4)
    })
  })

  test("handles empty pie data", async () => {
    // Mock a successful fetch request with empty stats
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockSuccessData,
        stats: {
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
        },
      }),
    })

    render(<AttendanceSummaryReport />)

    // Wait for data to be loaded and rendered
    await waitFor(() => {
      // Check for empty state message
      expect(screen.getByText("No attendance data available")).toBeInTheDocument()
    })
  })

  test("handles empty department stats", async () => {
    // Mock a successful fetch request with empty department stats
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockSuccessData,
        departmentStats: [],
      }),
    })

    render(<AttendanceSummaryReport />)

    // Wait for data to be loaded and rendered
    await waitFor(() => {
      // Check for empty department stats message
      expect(screen.getByText("No department data available")).toBeInTheDocument()
    })
  })

  test("makes API call to correct endpoint", async () => {
    // Mock a successful fetch request
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessData,
    })

    render(<AttendanceSummaryReport />)

    // Verify the fetch call
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith("/api/reports/summary")
  })
})
