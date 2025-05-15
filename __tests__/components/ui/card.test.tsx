import { render, screen } from "@testing-library/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

describe("Card", () => {
  test("renders card with all components", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    )

    expect(screen.getByText("Card Title")).toBeInTheDocument()
    expect(screen.getByText("Card Description")).toBeInTheDocument()
    expect(screen.getByText("Card Content")).toBeInTheDocument()
    expect(screen.getByText("Card Footer")).toBeInTheDocument()
  })

  test("renders card with custom className", () => {
    render(<Card className="custom-class">Card</Card>)

    const card = screen.getByText("Card")
    expect(card).toHaveClass("custom-class")
  })

  test("renders card header with custom className", () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)

    const header = screen.getByText("Header")
    expect(header).toHaveClass("custom-header")
  })

  test("renders card content with custom className", () => {
    render(<CardContent className="custom-content">Content</CardContent>)

    const content = screen.getByText("Content")
    expect(content).toHaveClass("custom-content")
  })

  test("renders card footer with custom className", () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)

    const footer = screen.getByText("Footer")
    expect(footer).toHaveClass("custom-footer")
  })
})
