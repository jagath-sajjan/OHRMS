import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role: string
    employeeId: string
    isMainAdmin: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      role: string
      employeeId: string
      isMainAdmin: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    employeeId: string
    isMainAdmin: boolean
  }
}
