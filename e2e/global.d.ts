// Global type definitions for E2E tests

interface ClerkUser {
  id: string
  firstName?: string
  lastName?: string
  emailAddresses?: Array<{ emailAddress: string }>
}

interface ClerkInstance {
  loaded?: boolean
  user?: ClerkUser | null
}

declare global {
  interface Window {
    Clerk?: ClerkInstance
  }
}

export {}
