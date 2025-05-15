"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Simple calendar implementation that doesn't rely on react-day-picker
function SimpleCalendar({
  selected,
  onSelect,
}: {
  selected?: Date
  onSelect: (date: Date) => void
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = React.useState(today.getMonth())
  const [viewYear, setViewYear] = React.useState(today.getFullYear())

  // Get days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  // Get first day of month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()

  // Create calendar days
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(viewYear, viewMonth, i))
  }

  // Navigate to previous month
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  // Navigate to next month
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  // Check if a date is the selected date
  const isSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {monthNames[viewMonth]} {viewYear}
        </div>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        <div className="font-medium">Su</div>
        <div className="font-medium">Mo</div>
        <div className="font-medium">Tu</div>
        <div className="font-medium">We</div>
        <div className="font-medium">Th</div>
        <div className="font-medium">Fr</div>
        <div className="font-medium">Sa</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="h-8 w-8 p-0 flex items-center justify-center">
            {day ? (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 p-0 font-normal",
                  isSelected(day) && "bg-primary text-primary-foreground",
                  isToday(day) && !isSelected(day) && "border border-primary",
                )}
                onClick={() => onSelect(day)}
              >
                {day.getDate()}
              </Button>
            ) : (
              <span></span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Icons for the calendar
function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function DatePicker() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <SimpleCalendar selected={date} onSelect={setDate} />
      </PopoverContent>
    </Popover>
  )
}
