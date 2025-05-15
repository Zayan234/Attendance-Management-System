"use client"

import { useState, useEffect } from "react"

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/employees")

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setEmployees(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch employees:", err)
      setError(err.message || "Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const mutate = () => fetchEmployees()

  return { employees, loading, error, mutate }
}
