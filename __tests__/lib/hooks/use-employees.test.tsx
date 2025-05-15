import { renderHook, waitFor } from "@testing-library/react"
import { useEmployees } from "@/lib/hooks/use-employees"

// Mock employee data
const mockEmployeeData = [
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
]

describe("useEmployees", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmployeeData),
      }),
    ) as jest.Mock
  })

  test("should fetch employees", async () => {
    const { result } = renderHook(() => useEmployees())

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the employees
    expect(result.current.employees).toEqual(mockEmployeeData)
    expect(result.current.error).toBeNull()
  })

  test("should handle fetch error", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    const { result } = renderHook(() => useEmployees())

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the error
    expect(result.current.error).toBe("Failed to fetch")
    expect(result.current.employees).toEqual([])
  })

  test("should provide mutate function", async () => {
    const { result } = renderHook(() => useEmployees())

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check that mutate is a function
    expect(typeof result.current.mutate).toBe("function")
  })
})
