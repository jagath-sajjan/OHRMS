import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .get()

        if (!user) return null
        if (user.status === 'suspended') return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          isMainAdmin: user.isMainAdmin ?? false
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.employeeId = (user as any).employeeId
        token.isMainAdmin = (user as any).isMainAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.employeeId = token.employeeId as string
        session.user.id = token.sub as string
        session.user.isMainAdmin = token.isMainAdmin as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/sign-in'
  },
  session: {
    strategy: 'jwt'
  }
})
