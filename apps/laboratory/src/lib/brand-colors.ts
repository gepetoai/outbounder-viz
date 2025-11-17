/**
 * 248.AI Brand Colors - Official Color Palette
 * CRITICAL: NEVER use bright colors (blues, greens, oranges, purples, yellows)
 * Stay within monochromatic grayscale palette
 */

export const BRAND_COLORS = {
  // Primary Colors
  midnight: '#1C1B20', // Headers, Footer, Primary Buttons
  shadow: '#40404C', // Body Text
  sky: '#777D8D', // Supporting Text
  sheen: '#B9B8C0', // Subtle Elements
  glare: '#EEEEEE', // Cards, Off-White
  white: '#FFFFFF', // Main Backgrounds

  // Section Backgrounds
  lightSection: '#F5F5F5',
  lighterSection: '#FAFAFA'
} as const

/**
 * Typography Hierarchy
 */
export const TYPOGRAPHY = {
  h1: {
    size: '48px',
    weight: 'bold',
    color: BRAND_COLORS.midnight
  },
  h2: {
    size: '32px',
    weight: 'bold',
    color: BRAND_COLORS.midnight
  },
  h3: {
    size: '24px',
    weight: '600',
    color: BRAND_COLORS.midnight
  },
  bodyPrimary: {
    size: '16px',
    weight: 'normal',
    color: BRAND_COLORS.shadow
  },
  bodySecondary: {
    size: '14px',
    weight: 'normal',
    color: BRAND_COLORS.sky
  },
  small: {
    size: '12px',
    weight: 'normal',
    color: BRAND_COLORS.sky
  }
} as const

/**
 * Component Design Standards
 */
export const DESIGN_TOKENS = {
  card: {
    background: BRAND_COLORS.white,
    borderRadius: '12px',
    shadow: '0px 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '24px'
  },
  button: {
    primary: {
      background: BRAND_COLORS.midnight,
      color: BRAND_COLORS.white,
      borderRadius: '6px',
      padding: '12px 24px'
    },
    secondary: {
      background: 'transparent',
      color: BRAND_COLORS.midnight,
      border: `1px solid ${BRAND_COLORS.midnight}`,
      borderRadius: '6px',
      padding: '12px 24px'
    }
  }
} as const



