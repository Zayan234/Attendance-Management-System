import { renderHook, waitFor } from "@testing-library/react"
import { useAttendance } from "@/lib/hooks/use-attendance"

// Mock fetch
const mockAttendanceData = [
  {
    id: "1",
    date: "2023-05-01T00:00:00.000Z",
    checkIn: "2023-05-01T09:00:00.000Z",
    checkOut: "2023-05-01T17:00:00.000Z",
    status: "PRESENT",
    user: {
      id: "user1",
      name: "John Doe",
      email: "john@example.com",
      department: {
        id: "dept1",
        name: "Engineering",
      },
    },
  },
]

describe("useAttendance", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAttendanceData),
      }),
    ) as jest.Mock
  })

  test("should fetch attendance records", async () => {
    const { result } = renderHook(() => useAttendance())

    // Initially loading
    expect(result.current.loading).toBe(true)

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the records
    expect(result.current.records).toEqual(mockAttendanceData)
    expect(result.current.error).toBeNull()
  })

  test("should handle fetch error", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    const { result } = renderHook(() => useAttendance())

    // Wait for the fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Check the error
    expect(result.current.error).toBe("Failed to fetch")
    expect(result.current.records).toEqual([])
  })

  test("should apply filters correctly", async () => {
    const { result } = renderHook(() => useAttendance("2023-05-01", "user1", "dept1", "PRESENT"))

    // Check that fetch was called with the correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("date=2023-05-01&userId=user1&departmentId=dept1&status=PRESENT"),
    )
  })
})
