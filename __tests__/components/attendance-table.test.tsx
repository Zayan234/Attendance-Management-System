import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { AttendanceTable } from "@/components/attendance-table"

// Mock fetch
const mockAttendanceData = [
  {
    id: "1",
    userId: "user1",
    user: {
      name: "John Doe",
      email: "john@example.com",
    },
    date: "2023-05-01T00:00:00.000Z",
    checkIn: "2023-05-01T09:00:00.000Z",
    checkOut: "2023-05-01T17:00:00.000Z",
    status: "PRESENT",
  },
  {
    id: "2",
    userId: "user2",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    date: "2023-05-01T00:00:00.000Z",
    checkIn: "2023-05-01T09:30:00.000Z",
    checkOut: "2023-05-01T17:30:00.000Z",
    status: "LATE",
  },
]

// Mock the useEffect hook to set data
jest.mock("react", () => {
  const originalReact = jest.requireActual("react")
  return {
    ...originalReact,
    useEffect: (callback: Function) => {
      callback()
    },
  }
})

describe("AttendanceTable", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAttendanceData),
      }),
    ) as jest.Mock
  })

  test("renders attendance records", async () => {
    render(<AttendanceTable />)

    // Check if employee names are displayed
    expect(await screen.findByText("John Doe")).toBeInTheDocument()
    expect(await screen.findByText("Jane Smith")).toBeInTheDocument()
  })

  test("renders loading state", () => {
    // Override the mock for this test to simulate loading
    jest.spyOn(React, "useState").mockImplementationOnce(() => [true, jest.fn()])
    jest.spyOn(React, "useState").mockImplementationOnce(() => [[], jest.fn()])
    jest.spyOn(React, "useState").mockImplementationOnce(() => [[], jest.fn()])

    render(<AttendanceTable />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  test("renders empty state", () => {
    // Override the mock for this test to simulate empty data
    jest.spyOn(React, "useState").mockImplementationOnce(() => [false, jest.fn()])
    jest.spyOn(React, "useState").mockImplementationOnce(() => [[], jest.fn()])
    jest.spyOn(React, "useState").mockImplementationOnce(() => [[], jest.fn()])

    render(<AttendanceTable />)
    expect(screen.getByText("No attendance records found.")).toBeInTheDocument()
  })

  test("filters records by employee name", async () => {
    render(<AttendanceTable />)

    // Wait for data to load
    await screen.findByText("John Doe")

    // Type in the filter input
    const filterInput = screen.getByPlaceholderText("Filter employees...")
    fireEvent.change(filterInput, { target: { value: "Jane" } })

    // Jane should be visible, John should not
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
    expect(screen.getByText("Jane Smith")).toBeInTheDocument()
  })

  test("renders different status badges", async () => {
    render(<AttendanceTable />)

    // Wait for data to load
    await screen.findByText("John Doe")

    // Check for status badges
    const presentBadge = screen.getByText("PRESENT")
    const lateBadge = screen.getByText("LATE")

    expect(presentBadge).toBeInTheDocument()
    expect(lateBadge).toBeInTheDocument()
  })
})
