import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { DatePicker } from "@/components/date-picker"

describe("DatePicker", () => {
  test("renders date picker button", () => {
    render(<DatePicker />)

    // Check for button with specific text
    const button = screen.getByText("Pick a date", { exact: false })
    expect(button).toBeInTheDocument()

    // Check for calendar icon
    const calendarIcon = document.querySelector(".lucide-calendar")
    expect(calendarIcon).toBeInTheDocument()
  })

  test("opens calendar when clicked", async () => {
    render(<DatePicker />)

    // Click the button with specific text
    const button = screen.getByText("Pick a date", { exact: false })
    fireEvent.click(button)

    // Wait for calendar to appear
    await waitFor(() => {
      // Check for calendar elements
      expect(screen.getByText("Su")).toBeInTheDocument()
      expect(screen.getByText("Mo")).toBeInTheDocument()
      expect(screen.getByText("Tu")).toBeInTheDocument()
    })
  })

  test("selects a date when clicked", async () => {
    render(<DatePicker />)

    // Open calendar
    const button = screen.getByText("Pick a date", { exact: false })
    fireEvent.click(button)

    // Wait for calendar to appear
    await waitFor(() => {
      expect(screen.getByText("Su")).toBeInTheDocument()
    })

    // Find a day button (this will depend on the current month/year)
    // For simplicity, we'll just click the first available day button (1)
    const dayButtons = screen
      .getAllByRole("button")
      .filter((button) => !isNaN(Number(button.textContent)) && Number(button.textContent) > 0)

    if (dayButtons.length > 0) {
      fireEvent.click(dayButtons[0])

      // Check that the selected date is displayed (format will depend on the date)
      await waitFor(() => {
        expect(screen.queryByText("Pick a date")).not.toBeInTheDocument()
      })
    }
  })

  test("navigates between months", async () => {
    render(<DatePicker />)

    // Open calendar
    const button = screen.getByText("Pick a date", { exact: false })
    fireEvent.click(button)

    // Wait for calendar to appear
    await waitFor(() => {
      expect(screen.getByText("Su")).toBeInTheDocument()
    })

    // Get current month/year
    const currentMonthYear = screen.getByText(/^\w+ \d{4}$/)
    const initialMonthYear = currentMonthYear.textContent

    // Click next month button (using aria-label)
    const nextMonthButton = screen.getByLabelText("Next month")
    fireEvent.click(nextMonthButton)

    // Check that month/year has changed
    await waitFor(() => {
      expect(currentMonthYear.textContent).not.toBe(initialMonthYear)
    })
  })

  test("handles keyboard navigation", async () => {
    render(<DatePicker />)

    // Open calendar
    const button = screen.getByText("Pick a date", { exact: false })
    fireEvent.click(button)

    // Wait for calendar to appear
    await waitFor(() => {
      expect(screen.getByText("Su")).toBeInTheDocument()
    })

    // Test keyboard navigation (tab to focus on a day)
    fireEvent.keyDown(document.activeElement || document.body, { key: "Tab" })

    // Press Enter to select the focused day
    fireEvent.keyDown(document.activeElement || document.body, { key: "Enter" })

    // Calendar should close after selection
    await waitFor(() => {
      expect(screen.queryByText("Su")).not.toBeInTheDocument()
    })
  })
})
