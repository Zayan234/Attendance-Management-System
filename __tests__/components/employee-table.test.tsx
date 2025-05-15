import { render, screen } from "@testing-library/react"
import { EmployeeTable } from "@/components/employee-table"

// Mock the useEmployees hook
jest.mock("@/lib/hooks/use-employees", () => ({
  useEmployees: () => ({
    employees: [
      {
        id: "emp1",
        name: "John Doe",
        email: "john@example.com",
        role: "EMPLOYEE",
        position: "Developer",
        status: "ACTIVE",
        department: {
          id: "dept1",
          name: "Engineering",
        },
      },
    ],
    loading: false,
    error: null,
  }),
}))

describe("EmployeeTable", () => {
  test("renders employee records", () => {
    render(<EmployeeTable />)

    // Check if employee name is displayed
    expect(screen.getByText("John Doe")).toBeInTheDocument()

    // Check if email is displayed
    expect(screen.getByText("john@example.com")).toBeInTheDocument()

    // Check if department is displayed
    expect(screen.getByText("Engineering")).toBeInTheDocument()

    // Check if position is displayed
    expect(screen.getByText("Developer")).toBeInTheDocument()
  })

  test("renders loading state", () => {
    // Override the mock for this test
    jest.spyOn(require("@/lib/hooks/use-employees"), "useEmployees").mockImplementation(() => ({
      employees: [],
      loading: true,
      error: null,
    }))

    render(<EmployeeTable />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  test("renders empty state", () => {
    // Override the mock for this test
    jest.spyOn(require("@/lib/hooks/use-employees"), "useEmployees").mockImplementation(() => ({
      employees: [],
      loading: false,
      error: null,
    }))

    render(<EmployeeTable />)
    expect(screen.getByText("No employees found.")).toBeInTheDocument()
  })
})
