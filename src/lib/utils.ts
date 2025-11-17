import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { EnrichedCandidateResponse } from './search-api'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  education: string
  experience: Array<{
    title: string
    company: string
    duration: string
  }>
  linkedinUrl: string
  summary: string
  searchTitle?: string
}

/**
 * Calculates the duration between two dates or from a start date to now
 * @param dateFrom - Start date (ISO string or null)
 * @param dateTo - End date (ISO string or null). If null, uses current date
 * @param existingDuration - If duration already exists, return it
 * @returns Formatted duration string (e.g., "2 years 3 months", "6 months", "Current")
 */
export function calculateDuration(
  dateFrom: string | null,
  dateTo: string | null,
  existingDuration?: string | null
): string {
  // If we already have a duration, return it
  if (existingDuration) {
    return existingDuration
  }

  // If no start date, return a default
  if (!dateFrom) {
    return 'Duration not available'
  }

  try {
    const startDate = new Date(dateFrom)
    const endDate = dateTo ? new Date(dateTo) : new Date()

    // Calculate the difference in months
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear()
    const monthsDiff = endDate.getMonth() - startDate.getMonth()
    const totalMonths = yearsDiff * 12 + monthsDiff

    // If it's less than 1 month
    if (totalMonths < 1) {
      return 'Less than 1 month'
    }

    // Calculate years and remaining months
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    // Format the duration
    const parts: string[] = []
    
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
    }
    
    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
    }

    const duration = parts.join(' ')
    
    // If it's a current position (no end date), add indicator
    return dateTo ? duration : `${duration} (Current)`
  } catch (error) {
    console.error('Error calculating duration:', error)
    return 'Duration not available'
  }
}

/**
 * Maps an enriched candidate response from the API to the Candidate interface
 * @param enriched - EnrichedCandidateResponse from the API
 * @returns Candidate object with formatted data
 */
// Helper function to detect 404 error placeholder candidates
export function is404ErrorCandidate(candidate: Candidate): boolean {
  return candidate.name.includes('Not Found (404 error)')
}

export function mapEnrichedCandidateToCandidate(enriched: EnrichedCandidateResponse): Candidate {
  const fullName = `${enriched.first_name} ${enriched.last_name}`
  const location = enriched.city && enriched.state 
    ? `${enriched.city}, ${enriched.state}` 
    : enriched.city || enriched.state || 'Location not available'

  // Use actual LinkedIn URL from raw_data or construct from slug
  const linkedinUrl = enriched.raw_data.websites_linkedin
    || (enriched.linkedin_canonical_slug ? `https://linkedin.com/in/${enriched.linkedin_canonical_slug}` : '')
    || (enriched.linkedin_shorthand_slug ? `https://linkedin.com/in/${enriched.linkedin_shorthand_slug}` : '')

  // Use actual profile picture or fallback to avatar
  const photo = enriched.raw_data.picture_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${enriched.id}`

  // Extract education from raw_data
  let education = 'Education details not available'
  if (enriched.raw_data.education && enriched.raw_data.education.length > 0) {
    const edu = enriched.raw_data.education[0]
    if (edu.major && edu.title) {
      education = `${edu.major} at ${edu.title}`
    } else if (edu.major) {
      education = edu.major
    } else if (edu.title) {
      education = edu.title
    }
  }

  // Extract experience from raw_data
  const experience = enriched.raw_data.experience && enriched.raw_data.experience.length > 0
    ? enriched.raw_data.experience.slice(0, 5).map(exp => ({
        title: exp.title,
        company: exp.company_name,
        duration: calculateDuration(exp.date_from, exp.date_to, exp.duration)
      }))
    : [{
        title: enriched.job_title || 'Position not specified',
        company: enriched.company_name || 'Company not specified',
        duration: 'Current'
      }]

  // Use description from raw_data or construct summary
  const summary = enriched.raw_data.description
    || enriched.raw_data.headline
    || enriched.raw_data.generated_headline
    || `${enriched.job_title || 'Professional'} at ${enriched.company_name || 'current company'} located in ${location}`

  const searchTitle = enriched.search_title && enriched.search_title !== 'Candidate Search' 
    ? enriched.search_title 
    : ''

  return {
    id: enriched.id.toString(),
    name: fullName,
    photo: photo,
    title: enriched.job_title || 'Position not specified',
    company: enriched.company_name || 'Company not specified',
    location: location,
    education: education,
    experience: experience,
    linkedinUrl: linkedinUrl,
    summary: summary,
    searchTitle: searchTitle
  }
}
