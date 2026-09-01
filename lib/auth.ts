import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CLIENT",
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
  plugins: [nextCookies()],
})
