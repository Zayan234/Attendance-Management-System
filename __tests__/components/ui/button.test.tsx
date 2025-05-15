"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  test("renders button with default variant and size", () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole("button", { name: "Click me" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-primary")
  })

  test("renders button with different variants", () => {
    const { rerender } = render(<Button variant="destructive">Destructive</Button>)

    let button = screen.getByRole("button", { name: "Destructive" })
    expect(button).toHaveClass("bg-destructive")

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole("button", { name: "Outline" })
    expect(button).toHaveClass("border-input")

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole("button", { name: "Secondary" })
    expect(button).toHaveClass("bg-secondary")

    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole("button", { name: "Ghost" })
    expect(button).toHaveClass("hover:bg-accent")

    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole("button", { name: "Link" })
    expect(button).toHaveClass("underline-offset-4")
  })

  test("renders button with different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>)

    let button = screen.getByRole("button", { name: "Default" })
    expect(button).toHaveClass("h-10")

    rerender(<Button size="sm">Small</Button>)
    button = screen.getByRole("button", { name: "Small" })
    expect(button).toHaveClass("h-9")

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole("button", { name: "Large" })
    expect(button).toHaveClass("h-11")

    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole("button", { name: "Icon" })
    expect(button).toHaveClass("h-10 w-10")
  })

  test("renders disabled button", () => {
    render(<Button disabled>Disabled</Button>)

    const button = screen.getByRole("button", { name: "Disabled" })
    expect(button).toBeDisabled()
    expect(button).toHaveClass("disabled:pointer-events-none")
  })

  test("renders button with custom className", () => {
    render(<Button className="custom-class">Custom</Button>)

    const button = screen.getByRole("button", { name: "Custom" })
    expect(button).toHaveClass("custom-class")
  })

  test("renders as child component", () => {
    render(
      <Button asChild>
        <a href="#">Link Button</a>
      </Button>,
    )

    const link = screen.getByRole("link", { name: "Link Button" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveClass("bg-primary")
  })

  test("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole("button", { name: "Click me" })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test("forwards ref correctly", () => {
    const ref = jest.fn()
    render(<Button ref={ref}>Ref Button</Button>)

    expect(ref).toHaveBeenCalled()
  })
})
