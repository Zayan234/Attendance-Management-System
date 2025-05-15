"use client"
import { render, screen, fireEvent } from "@testing-library/react"
import { VersionSwitcher } from "@/components/version-switcher"

// Mock the versions data
const mockVersions = [
  { version: "v1.0.0", date: "2023-01-01" },
  { version: "v2.0.0", date: "2023-02-01" },
  { version: "v3.0.0", date: "2023-03-01" },
]

jest.mock("@/components/ui/command", () => ({
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

describe("VersionSwitcher", () => {
  test("renders current version", () => {
    render(<VersionSwitcher versions={mockVersions} currentVersion="v1.0.0" onVersionChange={() => {}} />)

    expect(screen.getByText("v1.0.0")).toBeInTheDocument()
  })

  test("opens dropdown when clicked", () => {
    render(<VersionSwitcher versions={mockVersions} currentVersion="v1.0.0" onVersionChange={() => {}} />)

    // Click the button
    fireEvent.click(screen.getByRole("button"))

    // Check that command input is displayed
    expect(screen.getByTestId("command-input")).toBeInTheDocument()
  })

  test("selects a version when clicked", () => {
    const handleVersionChange = jest.fn()
    render(<VersionSwitcher versions={mockVersions} currentVersion="v1.0.0" onVersionChange={handleVersionChange} />)

    // Open dropdown
    fireEvent.click(screen.getByRole("button"))

    // Click on a different version
    fireEvent.click(screen.getByText("v2.0.0"))

    // Check that the version change handler was called
    expect(handleVersionChange).toHaveBeenCalledWith("v2.0.0")
  })

  test("filters versions with search", () => {
    render(<VersionSwitcher versions={mockVersions} currentVersion="v1.0.0" onVersionChange={() => {}} />)

    // Open dropdown
    fireEvent.click(screen.getByRole("button"))

    // Type in search box
    fireEvent.change(screen.getByTestId("command-input"), { target: { value: "v2" } })

    // Check that only v2.0.0 is visible
    expect(screen.getByText("v2.0.0")).toBeInTheDocument()
  })
})
