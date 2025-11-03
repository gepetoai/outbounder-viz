import type { JobPosting } from '@/hooks/useJobPostings'
import type { EnrichedCandidateResponse } from '@/lib/search-api'

// Mock data for realistic LinkedIn profiles
const firstNames = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Jessica', 'James', 'Emily', 'Robert',
  'Amanda', 'Christopher', 'Lisa', 'Matthew', 'Michelle', 'Daniel', 'Ashley', 'Joseph',
  'Stephanie', 'Ryan', 'Nicole', 'Andrew', 'Melissa', 'Joshua', 'Elizabeth', 'Brian',
  'Samantha', 'Kevin', 'Rachel', 'Justin', 'Lauren', 'Brandon', 'Heather', 'Tyler',
  'Amber', 'Jonathan', 'Megan', 'Eric', 'Brittany', 'Nicholas', 'Kimberly', 'Anthony',
  'Rebecca', 'Alexander', 'Katherine', 'Jacob', 'Christina', 'William', 'Maria', 'Patrick',
  'Laura', 'Steven', 'Hannah', 'Zachary', 'Victoria', 'Kyle', 'Danielle', 'Thomas',
  'Sara', 'Aaron', 'Grace', 'Nathan', 'Olivia', 'Mark', 'Emma', 'Benjamin', 'Sophia',
  'Adam', 'Madison', 'Jason', 'Alexis', 'John', 'Taylor', 'Peter', 'Julia', 'Alex',
  'Anna', 'Sam', 'Kelly', 'Chris', 'Morgan', 'Jordan', 'Kayla', 'Cameron', 'Riley'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell',
  'Howard', 'Ward', 'Cox', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett'
]

const jobTitles = [
  'Manufacturing Engineer', 'Senior Manufacturing Engineer', 'Production Manager',
  'Plant Manager', 'Operations Manager', 'Quality Engineer',
  'Process Engineer', 'Industrial Engineer', 'Mechanical Engineer',
  'Production Supervisor', 'Supply Chain Manager', 'Maintenance Manager',
  'Quality Control Manager', 'Manufacturing Director', 'Operations Director',
  'Lean Manufacturing Specialist', 'Six Sigma Black Belt', 'Production Planner',
  'Materials Manager', 'Assembly Line Supervisor', 'Production Coordinator',
  'Continuous Improvement Manager', 'Manufacturing Technician', 'Quality Assurance Engineer',
  'Automation Engineer', 'Facilities Manager', 'Safety Manager'
]

const companies = [
  'Texas Instruments', 'ExxonMobil', 'Phillips 66', 'Valero Energy', 'Lockheed Martin',
  'Bell Textron', 'Caterpillar Inc', 'Deere & Company', 'Toyota Motor Manufacturing',
  'General Motors Arlington', 'Ford Motor Company', 'Tesla Gigafactory', 'SpaceX',
  'Blue Origin', 'Dow Chemical', 'DuPont', 'BASF Corporation', '3M Manufacturing',
  'Honeywell Aerospace', 'Boeing Defense', 'Raytheon Technologies', 'Northrop Grumman',
  'BAE Systems', 'L3Harris Technologies', 'Collins Aerospace', 'Pratt & Whitney',
  'Emerson Electric', 'Rockwell Automation', 'Schneider Electric', 'ABB Group',
  'Siemens Energy', 'General Electric', 'Parker Hannifin', 'Eaton Corporation',
  'Continental Automotive', 'Bosch Manufacturing', 'Flex Ltd', 'Jabil Inc',
  'Celestica', 'Sanmina Corporation', 'Benchmark Electronics', 'Plexus Corp'
]

const cities = [
  { city: 'Houston', state: 'TX' },
  { city: 'Dallas', state: 'TX' },
  { city: 'Austin', state: 'TX' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'Fort Worth', state: 'TX' },
  { city: 'El Paso', state: 'TX' },
  { city: 'Arlington', state: 'TX' },
  { city: 'Corpus Christi', state: 'TX' },
  { city: 'Plano', state: 'TX' },
  { city: 'Lubbock', state: 'TX' },
  { city: 'Irving', state: 'TX' },
  { city: 'Laredo', state: 'TX' },
  { city: 'Garland', state: 'TX' },
  { city: 'Frisco', state: 'TX' },
  { city: 'McKinney', state: 'TX' }
]

const universities = [
  'University of Texas at Austin', 'Texas A&M University', 'Rice University',
  'University of Houston', 'Texas Tech University', 'UT Dallas', 'UT Arlington',
  'Texas State University', 'University of North Texas', 'SMU',
  'Baylor University', 'TCU', 'UTSA', 'UTEP', 'Texas A&M Commerce',
  'Lamar University', 'Sam Houston State University', 'Prairie View A&M'
]

const skills = [
  'Lean Manufacturing', 'Six Sigma', 'Kaizen', 'ISO 9001', 'Quality Management',
  'Process Improvement', 'AutoCAD', 'SolidWorks', 'CATIA', 'PLC Programming',
  'GMP Compliance', 'Root Cause Analysis', 'Statistical Process Control',
  'ERP Systems', 'SAP', 'Oracle Manufacturing', 'Production Planning',
  'Supply Chain Management', 'Inventory Management', 'Safety Management',
  'OSHA Compliance', 'Continuous Improvement', 'Value Stream Mapping',
  'Work Instructions', '5S Implementation', 'TPM', 'Manufacturing Execution Systems',
  'CNC Programming', 'Welding', 'Assembly Line Management', 'Quality Control',
  'Project Management', 'Team Leadership', 'Budgeting', 'Cost Reduction',
  'Capacity Planning', 'Preventive Maintenance', 'Problem Solving', 'Data Analysis'
]

function generateRandomCandidate(id: number): EnrichedCandidateResponse {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const location = cities[Math.floor(Math.random() * cities.length)]
  const currentCompany = companies[Math.floor(Math.random() * companies.length)]
  const currentTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)]
  const university = universities[Math.floor(Math.random() * universities.length)]
  
  // Generate 3-5 previous experiences
  const numExperiences = 3 + Math.floor(Math.random() * 3)
  const experiences = []
  for (let i = 0; i < numExperiences; i++) {
    const durationMonths = 12 + Math.floor(Math.random() * 36) // 1-4 years
    const yearsAgo = i * 2 + Math.floor(Math.random() * 2)
    const startYear = new Date().getFullYear() - yearsAgo - Math.floor(durationMonths / 12)
    const endYear = i === 0 ? null : startYear + Math.floor(durationMonths / 12)
    
    const departments = ['Manufacturing', 'Operations', 'Production', 'Quality', 'Supply Chain', 'Maintenance']
    experiences.push({
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      company_name: companies[Math.floor(Math.random() * companies.length)],
      duration: `${Math.floor(durationMonths / 12)} yr ${durationMonths % 12} mo`,
      duration_months: durationMonths,
      date_from: `${startYear}-01`,
      date_to: endYear ? `${endYear}-12` : null,
      description: 'Led manufacturing process improvements and collaborated with cross-functional teams to optimize production efficiency.',
      location: `${location.city}, ${location.state}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      management_level: null
    })
  }

  // Generate education
  const gradYear = 2010 + Math.floor(Math.random() * 12)
  const majors = [
    'Industrial Engineering', 'Mechanical Engineering', 'Manufacturing Engineering',
    'Chemical Engineering', 'Electrical Engineering', 'Operations Management',
    'Business Administration', 'Supply Chain Management', 'Quality Management'
  ]
  const education = [{
    title: 'Bachelor of Science',
    major: majors[Math.floor(Math.random() * majors.length)],
    institution_url: `https://linkedin.com/school/${university.toLowerCase().replace(/\s+/g, '-')}`,
    description: null,
    activities_and_societies: 'Engineering Society, Manufacturing Excellence Club',
    date_from: gradYear - 4,
    date_to: gradYear
  }]

  // Generate random skills
  const numSkills = 8 + Math.floor(Math.random() * 12)
  const candidateSkills = []
  const shuffledSkills = [...skills].sort(() => Math.random() - 0.5)
  for (let i = 0; i < numSkills; i++) {
    candidateSkills.push(shuffledSkills[i])
  }

  const slug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${id}`
  
  return {
    first_name: firstName,
    last_name: lastName,
    linkedin_shorthand_slug: slug,
    linkedin_canonical_slug: slug,
    company_name: currentCompany,
    city: location.city,
    state: location.state,
    job_title: currentTitle,
    raw_data: {
      picture_url: `https://i.pravatar.cc/150?img=${id % 70}`,
      websites_linkedin: `https://linkedin.com/in/${slug}`,
      description: `Experienced ${currentTitle.toLowerCase()} with expertise in lean manufacturing and operational excellence. ${experiences.length}+ years of experience in the manufacturing industry.`,
      headline: `${currentTitle} at ${currentCompany}`,
      generated_headline: `${currentTitle} at ${currentCompany}`,
      skills: candidateSkills,
      education: education,
      experience: experiences
    },
    fk_job_description_search_id: 1,
    id: id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

// Generate mock candidates (default 275: 150 for Senior Full Stack Engineer + 125 for Territory Manager)
export function generateMockCandidates(count: number = 275): EnrichedCandidateResponse[] {
  const candidates: EnrichedCandidateResponse[] = []
  for (let i = 1; i <= count; i++) {
    candidates.push(generateRandomCandidate(i))
  }
  return candidates
}

// Default job postings
export const defaultJobPostings: JobPosting[] = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    url: 'https://jobs.example.com/senior-full-stack-engineer',
    raw_text: 'We are looking for an experienced Senior Full Stack Engineer to join our growing team...',
    target_candidates_count: 500,
    fk_organization_id: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Territory Manager',
    url: 'https://jobs.example.com/territory-manager',
    raw_text: 'Seeking a dynamic Territory Manager to drive sales growth and manage client relationships in assigned region...',
    target_candidates_count: 500,
    fk_organization_id: 1,
    created_at: new Date().toISOString()
  }
]

// Keep backwards compatibility
export const defaultJobPosting = defaultJobPostings[0]

// Initialize mock data in localStorage
export function initializeMockData() {
  if (typeof window === 'undefined') return

  // Version check - increment this to force regeneration of mock data
  const MOCK_DATA_VERSION = '2.0'
  const currentVersion = localStorage.getItem('mock_data_version')

  // Check if data already exists
  const existingJobs = localStorage.getItem('mock_job_postings')
  const existingCandidates = localStorage.getItem('mock_candidates')
  const existingJobCandidateMap = localStorage.getItem('mock_job_candidate_map')

  // Force regeneration if version changed
  const shouldRegenerate = currentVersion !== MOCK_DATA_VERSION

  if (!existingJobs || shouldRegenerate) {
    localStorage.setItem('mock_job_postings', JSON.stringify(defaultJobPostings))
  }

  if (!existingCandidates || shouldRegenerate) {
    // Generate 275 candidates (150 for Senior Full Stack Engineer + 125 for Territory Manager)
    const candidates = generateMockCandidates(275)
    localStorage.setItem('mock_candidates', JSON.stringify(candidates))
  }

  // Initialize job-candidate mapping
  if (!existingJobCandidateMap || shouldRegenerate) {
    const jobCandidateMap: Record<number, number[]> = {
      1: Array.from({ length: 150 }, (_, i) => i + 1), // Job 1: candidates 1-150
      2: Array.from({ length: 125 }, (_, i) => i + 151) // Job 2: candidates 151-275
    }
    localStorage.setItem('mock_job_candidate_map', JSON.stringify(jobCandidateMap))
  }

  // Initialize empty arrays for approved/rejected candidates
  if (!localStorage.getItem('mock_shortlisted_candidates') || shouldRegenerate) {
    localStorage.setItem('mock_shortlisted_candidates', JSON.stringify([]))
  }

  if (!localStorage.getItem('mock_rejected_candidates') || shouldRegenerate) {
    localStorage.setItem('mock_rejected_candidates', JSON.stringify([]))
  }

  // Update version
  localStorage.setItem('mock_data_version', MOCK_DATA_VERSION)
}

// Get mock data from localStorage
export function getMockJobPostings(): JobPosting[] {
  if (typeof window === 'undefined') return defaultJobPostings
  const data = localStorage.getItem('mock_job_postings')
  return data ? JSON.parse(data) : defaultJobPostings
}

export function getMockCandidates(): EnrichedCandidateResponse[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('mock_candidates')
  return data ? JSON.parse(data) : generateMockCandidates(275)
}

export function getMockCandidatesForJob(jobDescriptionId: number): EnrichedCandidateResponse[] {
  if (typeof window === 'undefined') return []
  
  const allCandidates = getMockCandidates()
  const mapData = localStorage.getItem('mock_job_candidate_map')
  
  if (!mapData) {
    // Fallback: return all candidates if no mapping exists
    return allCandidates
  }
  
  const jobCandidateMap: Record<number, number[]> = JSON.parse(mapData)
  const candidateIds = jobCandidateMap[jobDescriptionId] || []
  
  return allCandidates.filter(candidate => candidateIds.includes(candidate.id))
}

export function getMockShortlistedCandidates(): number[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('mock_shortlisted_candidates')
  return data ? JSON.parse(data) : []
}

export function getMockRejectedCandidates(): number[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('mock_rejected_candidates')
  return data ? JSON.parse(data) : []
}

export function addMockShortlistedCandidate(candidateId: number) {
  const shortlisted = getMockShortlistedCandidates()
  const rejected = getMockRejectedCandidates()
  
  // Remove from rejected if present
  const newRejected = rejected.filter(id => id !== candidateId)
  localStorage.setItem('mock_rejected_candidates', JSON.stringify(newRejected))
  
  // Add to shortlisted if not already present
  if (!shortlisted.includes(candidateId)) {
    shortlisted.push(candidateId)
    localStorage.setItem('mock_shortlisted_candidates', JSON.stringify(shortlisted))
  }
}

export function addMockRejectedCandidate(candidateId: number) {
  const rejected = getMockRejectedCandidates()
  const shortlisted = getMockShortlistedCandidates()
  
  // Remove from shortlisted if present
  const newShortlisted = shortlisted.filter(id => id !== candidateId)
  localStorage.setItem('mock_shortlisted_candidates', JSON.stringify(newShortlisted))
  
  // Add to rejected if not already present
  if (!rejected.includes(candidateId)) {
    rejected.push(candidateId)
    localStorage.setItem('mock_rejected_candidates', JSON.stringify(rejected))
  }
}

export function addMockJobPosting(job: Omit<JobPosting, 'id' | 'created_at'>): JobPosting {
  const jobs = getMockJobPostings()
  const newJob: JobPosting = {
    ...job,
    id: jobs.length + 1,
    created_at: new Date().toISOString()
  }
  jobs.push(newJob)
  localStorage.setItem('mock_job_postings', JSON.stringify(jobs))
  return newJob
}

// Function to move candidate back to review (remove from approved/rejected)
export function removeMockCandidateDecision(candidateId: number) {
  const shortlisted = getMockShortlistedCandidates()
  const rejected = getMockRejectedCandidates()
  
  // Remove from both lists
  const newShortlisted = shortlisted.filter(id => id !== candidateId)
  const newRejected = rejected.filter(id => id !== candidateId)
  
  localStorage.setItem('mock_shortlisted_candidates', JSON.stringify(newShortlisted))
  localStorage.setItem('mock_rejected_candidates', JSON.stringify(newRejected))
}

// Function to reset all candidate approval/rejection data
export function resetCandidateDecisions() {
  if (typeof window === 'undefined') return
  localStorage.setItem('mock_shortlisted_candidates', JSON.stringify([]))
  localStorage.setItem('mock_rejected_candidates', JSON.stringify([]))
}

