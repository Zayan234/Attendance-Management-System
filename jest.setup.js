"use client"

import "@testing-library/jest-dom"

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock scrollIntoView (fixes cmdk/command component issues)
Element.prototype.scrollIntoView = jest.fn()

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/mock-path",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: "test-user-id",
        name: "Test User",
        email: "test@example.com",
        role: "ADMIN",
      },
    },
    status: "authenticated",
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  }),
)

// Mock date
const mockDate = new Date("2023-05-15T12:00:00Z")
global.Date = class extends Date {
  constructor(date) {
    if (date) {
      return super(date)
    }
    return mockDate
  }

  static now() {
    return mockDate.getTime()
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn((key) => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Radix UI components
jest.mock("@radix-ui/react-popover", () => ({
  Root: ({ children }) => <div data-testid="popover-root">{children}</div>,
  Trigger: ({ children }) => <div data-testid="popover-trigger">{children}</div>,
  Content: ({ children }) => <div data-testid="popover-content">{children}</div>,
  Portal: ({ children }) => <div data-testid="popover-portal">{children}</div>,
}))

// Mock recharts
jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

// Mock cmdk (Command component)
jest.mock("cmdk", () => ({
  Command: ({ children }) => <div data-testid="command">{children}</div>,
  CommandInput: (props) => <input data-testid="command-input" {...props} />,
  CommandList: ({ children }) => <div data-testid="command-list">{children}</div>,
  CommandItem: ({ children, onSelect }) => (
    <div data-testid="command-item" onClick={onSelect}>
      {children}
    </div>
  ),
  CommandGroup: ({ children }) => <div data-testid="command-group">{children}</div>,
  CommandEmpty: ({ children }) => <div data-testid="command-empty">{children}</div>,
}))
