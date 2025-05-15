import { render, screen } from "@testing-library/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

describe("Alert", () => {
  test("renders alert with default variant", () => {
    render(<Alert>Test alert</Alert>)

    const alert = screen.getByRole("alert")
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass("bg-background")
  })

  test("renders alert with destructive variant", () => {
    render(<Alert variant="destructive">Destructive alert</Alert>)

    const alert = screen.getByRole("alert")
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass("border-destructive")
    expect(alert).toHaveClass("text-destructive")
  })

  test("renders alert with title and description", () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description text</AlertDescription>
      </Alert>,
    )

    expect(screen.getByText("Alert Title")).toBeInTheDocument()
    expect(screen.getByText("Alert description text")).toBeInTheDocument()
  })

  test("renders alert with custom className", () => {
    render(<Alert className="custom-class">Custom alert</Alert>)

    const alert = screen.getByRole("alert")
    expect(alert).toHaveClass("custom-class")
  })

  test("renders alert with icon", () => {
    const TestIcon = () => <svg data-testid="test-icon" />

    render(
      <Alert>
        <TestIcon />
        Alert with icon
      </Alert>,
    )

    expect(screen.getByTestId("test-icon")).toBeInTheDocument()
  })
})
