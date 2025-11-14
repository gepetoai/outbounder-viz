# SearchForm Component

A reusable, brand-compliant search form component for finding prospects and candidates across 248.AI applications.

## Overview

The `SearchForm` component provides a comprehensive search interface that can be used to find both candidates (recruiting) and prospects (sales). It connects to data providers like Coresignal, Britedata, and Apollo.

## Features

- **Education Filters**: Graduation year ranges
- **Location Filters**: State, city, and radius-based search
- **Experience Filters**: Years of experience, number of positions, connections, time in role
- **Inclusions**: Job titles, profile keywords, industries
- **Exclusions**: Titles, keywords, industries, management levels
- **Profile Preview**: Side panel for viewing profile details
- **Search Management**: Save, update, and run searches
- **Enrichment**: Enrich limited profiles with full data

## Brand Compliance

✅ **Custom 248.AI Icons Only** - No Lucide React icons used  
✅ **Grayscale Color Palette** - Uses #1C1B20, #40404C, #777D8D, #B9B8C0, #EEEEEE, #FFFFFF  
✅ **Proper Typography** - System UI/Inter fonts with correct hierarchy  
✅ **White Space** - Clean, breathable layout  
✅ **No Descriptive Text** - Components are self-explanatory  

## Usage

### Basic Implementation

```tsx
import { SearchForm, SearchParams, ProspectProfile } from '@repo/ui'

function MySearchPage() {
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultParams)
  const [resultCount, setResultCount] = useState(0)
  const [stagingProfiles, setStagingProfiles] = useState<ProspectProfile[]>([])
  const [currentSearchId, setCurrentSearchId] = useState<number | null>(null)
  const [searchTitle, setSearchTitle] = useState('')
  const [isSearchModified, setIsSearchModified] = useState(false)
  const [contextId, setContextId] = useState<number | null>(null)

  return (
    <SearchForm
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      resultCount={resultCount}
      setResultCount={setResultCount}
      stagingProfiles={stagingProfiles}
      setStagingProfiles={setStagingProfiles}
      onGoToResults={() => console.log('Navigate to results')}
      contextId={contextId}
      currentSearchId={currentSearchId}
      setCurrentSearchId={setCurrentSearchId}
      searchTitle={searchTitle}
      setSearchTitle={setSearchTitle}
      isSearchModified={isSearchModified}
      setIsSearchModified={setIsSearchModified}
      searchType="prospects" // or "candidates"
      contextLabel="Job Posting" // or "Target Market"
    />
  )
}
```

### For Recruiting (Candidates)

```tsx
<SearchForm
  {...props}
  searchType="candidates"
  contextLabel="Job Posting"
/>
```

### For Sales (Prospects)

```tsx
<SearchForm
  {...props}
  searchType="prospects"
  contextLabel="Target Market"
/>
```

## Props

### SearchFormProps

| Prop | Type | Description |
|------|------|-------------|
| `searchParams` | `SearchParams` | Current search filter values |
| `setSearchParams` | `(params: SearchParams) => void` | Update search parameters |
| `resultCount` | `number` | Number of results found |
| `setResultCount` | `(count: number) => void` | Update result count |
| `stagingProfiles` | `ProspectProfile[]` | Preview profiles to display |
| `setStagingProfiles` | `(profiles: ProspectProfile[]) => void` | Update staging profiles |
| `onGoToResults` | `() => void` | Callback when sending to review |
| `contextId` | `number \| null` | Job posting ID or target market ID |
| `currentSearchId` | `number \| null` | Current saved search ID |
| `setCurrentSearchId` | `(id: number \| null) => void` | Update search ID |
| `searchTitle` | `string` | Title for saved search |
| `setSearchTitle` | `(title: string) => void` | Update search title |
| `isSearchModified` | `boolean` | Whether search has unsaved changes |
| `setIsSearchModified` | `(modified: boolean) => void` | Update modification state |
| `searchType` | `'candidates' \| 'prospects'` | Type of search (default: 'prospects') |
| `contextLabel` | `string` | Label for context requirement (default: 'Context') |

### SearchParams Interface

```typescript
interface SearchParams {
  // Education
  graduationYearFrom: number
  graduationYearTo: number
  
  // Location
  locationCity: string
  locationState: string
  searchRadius: number
  includeWorkLocation: boolean
  
  // Experience
  numExperiences: number
  maxExperience: number
  connections: number
  maxJobDuration: number
  deptYears: number
  timeInRole: number
  department: string
  managementLevelExclusions: string
  recency: number
  
  // Inclusions
  industryInclusions: string[]
  jobTitleInclusions: string[]
  profileKeywords: string[]
  
  // Exclusions
  industryExclusions: string[]
  titleExclusions: string[]
  keywordExclusions: string[]
  companyExclusions: string
  
  // Legacy fields (for backwards compatibility)
  education: string
  graduationYear: string
  geography: string
  radius: number
  jobTitles: string[]
  skills: string[]
  exclusions: {
    keywords: string[]
    excludeCompanies: string[]
    excludePeople: string[]
  }
  experienceLength: string
  titleMatch: boolean
  profilePhoto: boolean
}
```

### ProspectProfile Interface

```typescript
interface ProspectProfile {
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
}
```

## Icon Requirements

The component requires these custom 248.AI icons in your public/icons directory:

- `book-light.svg` - Education section
- `circle-light.svg` - Location/results markers
- `briefcase-light.svg` - Experience section
- `check-light.svg` - Inclusions section
- `xmark-light.svg` - Exclusions section and remove buttons
- `magnifying-glass-dark.svg` - Search button
- `paper-plane-light.svg` - Send to review button
- `sparkles-light.svg` - Enrich button
- `loader-light.svg` - Loading states

## Examples

### Recruiter App

See: `/outbounder-viz/apps/recruiter/src/components/recruiter/SearchTab.tsx`

The recruiter app uses this pattern but with a full implementation including API calls, dropdown hooks, and candidate management.

### Laboratory App

See: `/outbounder-viz/apps/laboratory/src/components/search/SearchView.tsx`

The laboratory uses the shared component with mock data for testing and demonstration.

## Data Providers

This component is designed to work with:

- **Coresignal** - Professional data and signals
- **Britedata** - Business intelligence
- **Apollo** - B2B contact database

Integration happens at the application level through hooks and API clients.

## Customization

The component uses inline styles for brand colors to ensure consistency:

```tsx
style={{ color: '#1C1B20' }}  // Midnight (headers)
style={{ color: '#40404C' }}  // Shadow (body text)
style={{ color: '#777D8D' }}  // Sky (supporting text)
style={{ color: '#B9B8C0' }}  // Sheen (subtle elements)
style={{ borderColor: '#EEEEEE' }}  // Glare (dividers)
```

## Future Enhancements

- [ ] Industry dropdowns with API integration
- [ ] Company exclusions with CSV upload
- [ ] People exclusions with LinkedIn URL validation
- [ ] Advanced filters (company size, funding, etc.)
- [ ] Saved search templates
- [ ] Export search results


