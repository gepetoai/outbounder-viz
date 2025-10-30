'use client'
import { useAuth } from '@clerk/nextjs'
import { LoginPage } from './login-page'
interface AuthWrapperProps {
  children: React.ReactNode
}
export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth()
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  // Show login page if not authenticated
  if (!isSignedIn) {
    return <LoginPage />
  }
  // Show main app if authenticated
  return <>{children}</>
}