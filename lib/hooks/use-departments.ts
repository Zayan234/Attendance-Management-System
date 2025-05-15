"use client"

import { useState, useEffect } from "react"

type Department = {
  id: string
  name: string
  _count?: {
    employees: number
  }
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setLoading(true)
        const response = await fetch("/api/departments")

        if (!response.ok) {
          throw new Error("Failed to fetch departments")
        }

        const data = await response.json()
        setDepartments(data)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching departments:", err)
        setError(err.message || "An error occurred while fetching departments")
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return { departments, loading, error }
}
