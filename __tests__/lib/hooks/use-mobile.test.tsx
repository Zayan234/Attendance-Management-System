"use client"

import { renderHook } from "@testing-library/react"
import { useMobile } from "@/components/hooks/use-mobile"

describe("useMobile", () => {
  const originalInnerWidth = window.innerWidth

  afterEach(() => {
    // Reset window.innerWidth to its original value
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    })
  })

  test("should return false for desktop viewport", () => {
    // Set window.innerWidth to a desktop size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    })

    // Trigger the resize event
    window.dispatchEvent(new Event("resize"))

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(false)
  })

  test("should return true for mobile viewport", () => {
    // Set window.innerWidth to a mobile size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 480,
    })

    // Trigger the resize event
    window.dispatchEvent(new Event("resize"))

    const { result } = renderHook(() => useMobile())
    expect(result.current).toBe(true)
  })
})
