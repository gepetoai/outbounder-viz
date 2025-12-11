import { fetchJson } from './api-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/**
 * Holiday from the holidays table
 */
export interface Holiday {
  id: number
  name: string
  date: string // YYYY-MM-DD format
  is_global: boolean
  created_at: string
  updated_at: string
}

/**
 * Organization Holiday association
 */
export interface OrganizationHoliday {
  id: number
  fk_organization_id: number
  fk_holiday_id: number
  created_at: string
  updated_at: string
}

/**
 * Request body for creating a custom holiday
 */
export interface HolidayCreateRequest {
  name: string
  date: string // YYYY-MM-DD format
}

/**
 * Request body for upserting organization holidays
 */
export interface OrganizationHolidaysBulkRequest {
  holiday_ids: number[]
}

/**
 * Response from bulk upsert operation
 */
export interface OrganizationHolidaysBulkResponse {
  organization_holidays: OrganizationHoliday[]
}

/**
 * Get all available holidays from the system
 * No authentication required
 */
export async function getHolidays(): Promise<Holiday[]> {
  return fetchJson<Holiday[]>(`${API_BASE_URL}/holidays/`)
}

/**
 * Get all holidays associated with the authenticated organization
 * Requires authentication
 */
export async function getOrganizationHolidays(): Promise<OrganizationHoliday[]> {
  return fetchJson<OrganizationHoliday[]>(`${API_BASE_URL}/organization-holidays/`)
}

/**
 * Create a custom holiday and automatically associate it with the authenticated organization
 * Requires authentication
 *
 * @param name - Name of the holiday
 * @param date - Date of the holiday in YYYY-MM-DD format
 * @returns Organization holiday association
 */
export async function createCustomHoliday(
  name: string,
  date: string
): Promise<OrganizationHoliday> {
  return fetchJson<OrganizationHoliday>(
    `${API_BASE_URL}/organization-holidays/create-holiday`,
    {
      method: 'POST',
      body: JSON.stringify({ name, date }),
    }
  )
}

/**
 * Update an organization holiday
 * Requires authentication
 *
 * @param holidayId - ID of the holiday to update
 * @param name - Name of the holiday
 * @param date - Date of the holiday in YYYY-MM-DD format
 * @returns Organization holiday association
 */
export async function updateOrganizationHoliday(
  holidayId: number,
  name: string,
  date: string
): Promise<OrganizationHoliday> {
  return fetchJson<OrganizationHoliday>(
    `${API_BASE_URL}/organization-holidays/update-holiday`,
    {
      method: 'PUT',
      body: JSON.stringify({
        id: holidayId,
        name,
        date,
      }),
    }
  )
} 

/**
 * Upsert (insert or skip if exists) organization holidays
 * Requires authentication
 *
 * @param holidayIds - Array of holiday IDs to associate with the organization
 * @returns All organization holidays (existing + newly created)
 */
export async function upsertOrganizationHolidays(
  holidayIds: number[]
): Promise<OrganizationHolidaysBulkResponse> {
  return fetchJson<OrganizationHolidaysBulkResponse>(
    `${API_BASE_URL}/organization-holidays/upsert`,
    {
      method: 'PUT',
      body: JSON.stringify({ holiday_ids: holidayIds }),
    }
  )
}
