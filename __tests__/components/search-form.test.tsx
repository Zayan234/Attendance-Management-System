import { render, screen, fireEvent } from "@testing-library/react"
import { SearchForm } from "@/components/search-form"

describe("SearchForm", () => {
  test("renders search input", () => {
    render(<SearchForm />)

    const searchInput = screen.getByPlaceholderText("Search...")
    expect(searchInput).toBeInTheDocument()
  })

  test("updates input value on change", () => {
    render(<SearchForm />)

    const searchInput = screen.getByPlaceholderText("Search...") as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: "test query" } })

    expect(searchInput.value).toBe("test query")
  })

  test("submits form with query", () => {
    // Mock console.log to check if it's called with the query
    const consoleSpy = jest.spyOn(console, "log").mockImplementation()

    render(<SearchForm />)

    const searchInput = screen.getByPlaceholderText("Search...")
    fireEvent.change(searchInput, { target: { value: "test query" } })

    const form = searchInput.closest("form")
    fireEvent.submit(form!)

    expect(consoleSpy).toHaveBeenCalledWith("Searching for:", "test query")

    // Restore console.log
    consoleSpy.mockRestore()
  })
})
