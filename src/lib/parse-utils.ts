/**
 * Parses a comma-separated string into an array of trimmed, non-empty strings
 * @param input - The comma-separated string to parse
 * @returns Array of clean strings
 * 
 * @example
 * parseCommaSeparatedList("outside, account executive, territory")
 * // Returns: ["outside", "account executive", "territory"]
 */
export function parseCommaSeparatedList(input: string): string[] {
  return input
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

/**
 * Detects if the input contains comma-separated values
 * @param input - The string to check
 * @returns True if the string contains commas
 */
export function isCommaSeparatedList(input: string): boolean {
  return input.includes(',')
}

