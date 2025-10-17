import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthToken } from '@/lib/axios'

export function useAuth() {
  const { getToken, isSignedIn, isLoaded } = useClerkAuth()

  useEffect(() => {
    const updateAuthToken = async () => {
      if (isLoaded && isSignedIn) {
        try {
          const token = await getToken()
          setAuthToken(token)
        } catch (error) {
          console.warn('Failed to get auth token:', error)
          setAuthToken(null)
        }
      } else {
        setAuthToken(null)
      }
    }

    updateAuthToken()
  }, [getToken, isSignedIn, isLoaded])

  return {
    isSignedIn,
    isLoaded,
    getToken
  }
}
