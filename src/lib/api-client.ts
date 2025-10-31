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
 * Fetch with auth and automatic JSON parsing
 */
export async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options)

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
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
