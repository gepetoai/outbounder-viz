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
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
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

  return response.json()
}
