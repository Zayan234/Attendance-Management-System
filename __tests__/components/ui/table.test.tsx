import { render, screen } from "@testing-library/react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

describe("Table", () => {
  test("renders table with all components", () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header 1</TableHead>
            <TableHead>Header 2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell 1</TableCell>
            <TableCell>Cell 2</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer 1</TableCell>
            <TableCell>Footer 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    )

    expect(screen.getByText("Table Caption")).toBeInTheDocument()
    expect(screen.getByText("Header 1")).toBeInTheDocument()
    expect(screen.getByText("Header 2")).toBeInTheDocument()
    expect(screen.getByText("Cell 1")).toBeInTheDocument()
    expect(screen.getByText("Cell 2")).toBeInTheDocument()
    expect(screen.getByText("Footer 1")).toBeInTheDocument()
    expect(screen.getByText("Footer 2")).toBeInTheDocument()
  })

  test("renders table with custom className", () => {
    render(<Table className="custom-table">Table</Table>)

    const table = screen.getByRole("table")
    expect(table).toHaveClass("custom-table")
  })

  test("renders table header with custom className", () => {
    render(
      <Table>
        <TableHeader className="custom-header">
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    )

    const header = screen.getByRole("rowgroup")
    expect(header).toHaveClass("custom-header")
  })

  test("renders table row with custom className", () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="custom-row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    const row = screen.getByRole("row")
    expect(row).toHaveClass("custom-row")
  })
})
