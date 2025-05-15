import { cn, formatDate, formatTime, calculateWorkHours } from "@/lib/utils"
import { describe, expect, test } from "vitest"

describe("Utils Functions", () => {
  describe("cn function", () => {
    test("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2")
      expect(cn("class1", true && "class2", false && "class3")).toBe("class1 class2")
      expect(cn("class1", undefined, "class2")).toBe("class1 class2")
      expect(cn(["class1", "class2"])).toBe("class1 class2")
    })
  })

  describe("formatDate function", () => {
    test("should format date correctly", () => {
      expect(formatDate("2023-05-15")).toMatch(/May 15, 2023/)
      expect(formatDate(new Date("2023-05-15"))).toMatch(/May 15, 2023/)
    })

    test("should handle undefined or invalid dates", () => {
      expect(formatDate(undefined)).toBe("—")
      expect(formatDate("invalid-date")).toBe("Invalid date")
    })
  })

  describe("formatTime function", () => {
    test("should format time correctly", () => {
      expect(formatTime("2023-05-15T14:30:00")).toMatch(/2:30 PM/)
      expect(formatTime(new Date("2023-05-15T14:30:00"))).toMatch(/2:30 PM/)
    })

    test("should handle undefined or invalid times", () => {
      expect(formatTime(undefined)).toBe("—")
      expect(formatTime("invalid-time")).toBe("Invalid time")
    })
  })

  describe("calculateWorkHours function", () => {
    test("should calculate work hours correctly", () => {
      expect(calculateWorkHours("2023-05-15T09:00:00", "2023-05-15T17:00:00")).toBe("8 hrs")
      expect(calculateWorkHours("2023-05-15T08:30:00", "2023-05-15T12:30:00")).toBe("4 hrs")
    })

    test("should handle undefined or invalid inputs", () => {
      expect(calculateWorkHours(undefined, "2023-05-15T17:00:00")).toBe("—")
      expect(calculateWorkHours("2023-05-15T09:00:00", undefined)).toBe("—")
      expect(calculateWorkHours("invalid", "invalid")).toBe("—")
    })

    test("should handle negative time differences", () => {
      expect(calculateWorkHours("2023-05-15T17:00:00", "2023-05-15T09:00:00")).toBe("—")
    })

    test("should handle same time", () => {
      expect(calculateWorkHours("2023-05-15T09:00:00", "2023-05-15T09:00:00")).toBe("0 hrs")
    })
  })
})
