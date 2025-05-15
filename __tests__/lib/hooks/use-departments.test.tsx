import { renderHook, waitFor } from "@testing-library/react"
import { useDepartments } from "@/lib/hooks/use-departments"
import { expect } from "@jest/globals"

// Mock department data
const mockDepartmentData = [
  {
    id: "dept1",
    name: "Engineering",
    _count: {
      employees: 5,
    },
  },
  {
    id: "dept2",
    name: "Marketing",
    _count: {
      employees: 3,
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

describe("useDepartments", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDepartmentData),
      }),
    ) as jest.Mock
  })

  test("should fetch departments", async () => {
    const { result } = renderHook(() => useDepartments())

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the departments
    expect(result.current.departments).toEqual(mockDepartmentData)
    expect(result.current.error).toBeNull()
  })

  test("should handle fetch error", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    const { result } = renderHook(() => useDepartments())

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the error
    expect(result.current.error).toBe("Failed to fetch")
    expect(result.current.departments).toEqual([])
  })

  test("should handle server error response", async () => {
    // Mock fetch to return error response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      }),
    ) as jest.Mock

    const { result } = renderHook(() => useDepartments())

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the error
    expect(result.current.error).toBe("Failed to fetch departments")
    expect(result.current.departments).toEqual([])
  })
})
