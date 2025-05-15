import { render, screen, waitFor } from "@testing-library/react"
import { RecentActivity } from "@/components/recent-activity"

// Mock activity data
const mockActivityData = [
  {
    id: "1",
    user: {
      name: "John Doe",
      email: "john@example.com",
    },
    date: "2023-05-01T00:00:00.000Z",
    checkIn: "2023-05-01T09:00:00.000Z",
    checkOut: null,
    status: "PRESENT",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    date: "2023-05-01T00:00:00.000Z",
    checkIn: null,
    checkOut: null,
    status: "ABSENT",
  },
]

describe("RecentActivity", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockActivityData),
      }),
    ) as jest.Mock
  })

  test("renders recent activity", async () => {
    render(<RecentActivity />)

    // Initially shows loading
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument()
      expect(screen.getByText("Jane Smith")).toBeInTheDocument()
    })
  })

  test("renders different activity types", async () => {
    render(<RecentActivity />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    })

    // Check for different activity types
    expect(screen.getByText(/checked in/i)).toBeInTheDocument()
    expect(screen.getByText(/is absent/i)).toBeInTheDocument()
  })

  test("renders error state", async () => {
    // Mock fetch to reject
    global.fetch = jest.fn(() => Promise.reject(new Error("Failed to fetch"))) as jest.Mock

    render(<RecentActivity />)

    // Wait for error to show
    await waitFor(() => {
      expect(screen.getByText(/Failed to load recent activity/i)).toBeInTheDocument()
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

    render(<RecentActivity />)

    // Wait for empty state to show
    await waitFor(() => {
      expect(screen.getByText(/No recent activity found/i)).toBeInTheDocument()
    })
  })
})
