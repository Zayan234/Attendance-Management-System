import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { EmployeeAttendanceReport } from "@/components/employee-attendance-report"
import { useEmployees } from "@/lib/hooks/use-employees"

// Mock the useEmployees hook
jest.mock("@/lib/hooks/use-employees")

// Mock the recharts components
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey, fill, name }) => <div data-testid={`bar-${dataKey}`} data-fill={fill} data-name={name} />,
  XAxis: ({ dataKey }) => <div data-testid="x-axis" data-key={dataKey} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: ({ strokeDasharray }) => <div data-testid="cartesian-grid" data-dash={strokeDasharray} />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe("EmployeeAttendanceReport", () => {
  // Mock data
  const mockEmployees = [
    { id: "emp1", name: "John Doe" },
    { id: "emp2", name: "Jane Smith" },
  ]

  const mockReportData = {
    employee: { id: "emp1", name: "John Doe" },
    weeklyData: [
      { date: "Week 1", present: 5, absent: 0, late: 0 },
      { date: "Week 2", present: 4, absent: 1, late: 0 },
      { date: "Week 3", present: 3, absent: 1, late: 1 },
      { date: "Week 4", present: 5, absent: 0, late: 0 },
    ],
    summary: {
      attendanceRate: 85,
      presentDays: 17,
      absentDays: 2,
      lateDays: 1,
    },
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock fetch
    global.fetch = jest.fn()
  })

  test("renders loading state while fetching employees", () => {
    // Mock the useEmployees hook to return loading state
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: [],
      loading: true,
    })

    render(<EmployeeAttendanceReport />)

    // Check for loading spinner
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  test("renders empty state when no employees are found", () => {
    // Mock the useEmployees hook to return empty employees
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: [],
      loading: false,
    })

    render(<EmployeeAttendanceReport />)

    // Check for empty state message
    expect(screen.getByText("No employees found. Add employees to view reports.")).toBeInTheDocument()
  })

  test("renders loading state while fetching report data", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch to delay response
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<EmployeeAttendanceReport />)

    // Wait for the component to update after auto-selecting the first employee
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reports/employee?employeeId=emp1")
    })

    // Check for loading spinner
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  test("renders error state when API call fails", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch to return an error
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

    render(<EmployeeAttendanceReport />)

    // Wait for the error state to be rendered
    await waitFor(() => {
      expect(screen.getByText("Failed to load employee attendance data")).toBeInTheDocument()
    })
  })

  test("renders error state when API returns non-200 response", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch to return a non-200 response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    })

    render(<EmployeeAttendanceReport />)

    // Wait for the error state to be rendered
    await waitFor(() => {
      expect(screen.getByText("Failed to load employee attendance data")).toBeInTheDocument()
    })
  })

  test("renders report data successfully", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch to return successful data
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReportData),
    })

    render(<EmployeeAttendanceReport />)

    // Wait for the data to be rendered
    await waitFor(() => {
      expect(screen.getByText("Monthly Attendance for John Doe")).toBeInTheDocument()
    })

    // Check for chart components
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument()
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument()
    expect(screen.getByTestId("bar-present")).toBeInTheDocument()
    expect(screen.getByTestId("bar-absent")).toBeInTheDocument()
    expect(screen.getByTestId("bar-late")).toBeInTheDocument()

    // Check for summary data
    expect(screen.getByText("85%")).toBeInTheDocument()
    expect(screen.getByText("17")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  test("changes employee selection and fetches new data", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch for first employee
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReportData),
    })

    // Mock fetch for second employee
    const secondEmployeeData = {
      ...mockReportData,
      employee: { id: "emp2", name: "Jane Smith" },
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(secondEmployeeData),
    })

    render(<EmployeeAttendanceReport />)

    // Wait for the first data to be rendered
    await waitFor(() => {
      expect(screen.getByText("Monthly Attendance for John Doe")).toBeInTheDocument()
    })

    // Change the selected employee
    fireEvent.click(screen.getByRole("combobox"))
    fireEvent.click(screen.getByText("Jane Smith"))

    // Wait for the second API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reports/employee?employeeId=emp2")
    })

    // Wait for the second data to be rendered
    await waitFor(() => {
      expect(screen.getByText("Monthly Attendance for Jane Smith")).toBeInTheDocument()
    })
  })

  test("renders empty chart message when no weekly data", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch to return data with empty weeklyData
    const emptyDataResponse = {
      ...mockReportData,
      weeklyData: [],
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(emptyDataResponse),
    })

    render(<EmployeeAttendanceReport />)

    // Wait for the empty state message to be rendered
    await waitFor(() => {
      expect(screen.getByText("No attendance data available for this employee")).toBeInTheDocument()
    })
  })

  test("automatically selects first employee when employees load", async () => {
    // Mock the useEmployees hook
    ;(useEmployees as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      loading: false,
    })

    // Mock fetch
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockReportData),
    })

    render(<EmployeeAttendanceReport />)

    // Check that the first API call is made with the first employee ID
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/reports/employee?employeeId=emp1")
    })
  })
})
