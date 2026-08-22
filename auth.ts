import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/db/client'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .get()

        if (!user || !user.password) return null
        if (user.status === 'suspended') return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          isMainAdmin: user.isMainAdmin ?? false,
          updatedAt: user.updatedAt?.getTime() ?? 0
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in, store the snapshot
      if (user) {
        token.role = (user as any).role
        token.employeeId = (user as any).employeeId
        token.isMainAdmin = (user as any).isMainAdmin
        token.updatedAt = (user as any).updatedAt
      }

      // On every request after sign-in, re-validate against DB
      if (trigger !== 'signIn' && token.sub) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.id, token.sub))
          .get()

        // If suspended or deleted — kill session
        if (!dbUser || dbUser.status === 'suspended') {
          return null as any
        }

        // Sync latest role/isMainAdmin so UI updates immediately
        token.role = dbUser.role
        token.isMainAdmin = dbUser.isMainAdmin ?? false
        token.updatedAt = dbUser.updatedAt?.getTime() ?? 0
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
