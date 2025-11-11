import { useAuth as useClerkAuth } from '@clerk/nextjs'
import { useEffect, useCallback } from 'react'
import { setAuthToken } from '@/lib/api-client'

// JWT template name configured in Clerk Dashboard
// Create a template in Clerk Dashboard > JWT Templates with your desired token lifetime
const JWT_TEMPLATE_NAME = 'jwt-template-dev' // Change this to match your template name

export function useAuth() {
  const { getToken: getClerkToken, isSignedIn, isLoaded } = useClerkAuth()
  
  // Wrap getToken to always use the JWT template, with fallback to default token
  const getToken = useCallback(async (options?: { template?: string }) => {
    const templateName = options?.template || JWT_TEMPLATE_NAME
    
    try {
      // Try to get token with the specified template
      const token = await getClerkToken({ template: templateName })
      if (token) {
        return token
      }
    } catch (templateError) {
      // If template doesn't exist or fails, fall back to default token
      console.warn(`Failed to get token with template "${templateName}", falling back to default:`, templateError)
    }
    
    // Fallback to default token (no template)
    try {
      return await getClerkToken()
    } catch (error) {
      console.error('Failed to get default auth token:', error)
      throw error
    }
  }, [getClerkToken])
  
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
  }, [getToken, getClerkToken, isSignedIn, isLoaded])
  
  return {
    isSignedIn,
    isLoaded,
    getToken
  }
}