/**
 * API client with authentication support for React Query
 */

let authToken: string | null = null

/**
 * Set the authentication token for API requests
 */
export function setAuthToken(token: string | null) {
  authToken = token
}

/**
 * Get the current authentication token
 */
export function getAuthToken(): string | null {
  return authToken
}

/**
 * Authenticated fetch wrapper that automatically includes auth token
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}

/**
 * Custom error class that includes API error details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public detail?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Fetch with auth and automatic JSON parsing
 */
export async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options)

  if (!response.ok) {
    // Try to parse error response body for detailed error messages
    let errorDetail: string | undefined
    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const errorBody = await response.json()
        errorDetail = errorBody.detail || errorBody.message || errorBody.error
      }
    } catch {
      // If parsing fails, ignore and use default error message
    }

    const errorMessage = errorDetail 
      ? `API Error: ${response.status} ${response.statusText} - ${errorDetail}`
      : `API Error: ${response.status} ${response.statusText}`
    
    throw new ApiError(errorMessage, response.status, response.statusText, errorDetail)
  }

  // Handle 204 No Content responses (e.g., successful DELETE)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  // Check if response has content before parsing JSON
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }

  return undefined as T
}
