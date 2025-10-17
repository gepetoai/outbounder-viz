import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8096/api/v1/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Function to set auth token for requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
  }
}

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - token may be invalid')
      // Clear the token if it's invalid
      setAuthToken(null)
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
