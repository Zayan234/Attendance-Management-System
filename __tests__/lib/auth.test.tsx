import { hashPassword } from "@/lib/auth"
import { compare } from "bcryptjs"

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(() => Promise.resolve({ id: "user-id", role: "ADMIN" })),
}))

describe("Auth Functions", () => {
  describe("hashPassword", () => {
    test("should return a bcrypt hash", async () => {
      const password = "testpassword"
      const hashedPassword = await hashPassword(password)

      // Check that it's a bcrypt hash
      expect(hashedPassword).toMatch(/^\$2[aby]\$\d+\$/)
      // Check that it's not the original password
      expect(hashedPassword).not.toBe(password)

      // Verify that the hash can be compared with the original password
      const isMatch = await compare(password, hashedPassword)
      expect(isMatch).toBe(true)
    })
  })

  describe("authOptions", () => {
    // These tests would require more complex mocking of NextAuth
    // We'll focus on the hashPassword function for now
    test("should be defined", () => {
      const { authOptions } = require("@/lib/auth")
      expect(authOptions).toBeDefined()
    })
  })
})
