import { render, screen } from "@testing-library/react"
import { Badge } from "@/components/ui/badge"

describe("Badge", () => {
  test("renders badge with default variant", () => {
    render(<Badge>Default</Badge>)

    const badge = screen.getByText("Default")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-primary")
  })

  test("renders badge with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>)

    const badge = screen.getByText("Secondary")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-secondary")
  })

  test("renders badge with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>)

    const badge = screen.getByText("Outline")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("border-border")
  })

  test("renders badge with destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>)

    const badge = screen.getByText("Destructive")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass("bg-destructive")
  })

  test("renders badge with custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>)

    const badge = screen.getByText("Custom")
    expect(badge).toHaveClass("custom-class")
  })
})
