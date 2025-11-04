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
  'Software Engineer', 'Senior Software Engineer', 'Staff Software Engineer',
  'Product Manager', 'Senior Product Manager', 'Engineering Manager',
  'Data Scientist', 'Senior Data Scientist', 'Machine Learning Engineer',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Architect',
  'UX Designer', 'Product Designer', 'Design Lead',
  'Technical Lead', 'Principal Engineer', 'Solutions Architect',
  'Data Engineer', 'Analytics Engineer', 'Business Analyst',
  'QA Engineer', 'Test Automation Engineer', 'Security Engineer'
]

const companies = [
  'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple',
  'Netflix', 'Uber', 'Airbnb', 'Stripe', 'Salesforce',
  'Adobe', 'Oracle', 'IBM', 'Intel', 'Cisco',
  'LinkedIn', 'Twitter', 'Snapchat', 'Pinterest', 'Reddit',
  'Shopify', 'Square', 'Dropbox', 'Slack', 'Zoom',
  'DocuSign', 'Atlassian', 'Twilio', 'HubSpot', 'Zendesk',
  'ServiceNow', 'Workday', 'Splunk', 'Snowflake', 'Databricks',
  'Coinbase', 'Robinhood', 'Plaid', 'Brex', 'Carta'
]

const cities = [
  { city: 'San Francisco', state: 'CA' },
  { city: 'New York', state: 'NY' },
  { city: 'Seattle', state: 'WA' },
  { city: 'Austin', state: 'TX' },
  { city: 'Boston', state: 'MA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Denver', state: 'CO' },
  { city: 'Portland', state: 'OR' },
  { city: 'Atlanta', state: 'GA' },
  { city: 'Miami', state: 'FL' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' }
]

const universities = [
  'Stanford University', 'MIT', 'UC Berkeley', 'Harvard University',
  'Carnegie Mellon University', 'University of Washington', 'Georgia Tech',
  'University of Illinois', 'University of Michigan', 'Cornell University',
  'Columbia University', 'UCLA', 'University of Texas at Austin', 'Caltech',
  'Princeton University', 'Yale University', 'Duke University', 'Northwestern University'
]

const skills = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS', 'Docker',
  'Kubernetes', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST APIs',
  'Machine Learning', 'Data Analysis', 'SQL', 'Git', 'CI/CD', 'Agile',
  'System Design', 'Microservices', 'TensorFlow', 'PyTorch', 'Java', 'Go',
  'Rust', 'C++', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Vue.js',
  'Angular', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Jenkins', 'Terraform'
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
    
    experiences.push({
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      company_name: companies[Math.floor(Math.random() * companies.length)],
      duration: `${Math.floor(durationMonths / 12)} yr ${durationMonths % 12} mo`,
      duration_months: durationMonths,
      date_from: `${startYear}-01`,
      date_to: endYear ? `${endYear}-12` : null,
      description: 'Led development of key features and collaborated with cross-functional teams.',
      location: `${location.city}, ${location.state}`,
      department: 'Engineering',
      management_level: null
    })
  }

  // Generate education
  const gradYear = 2010 + Math.floor(Math.random() * 12)
  const education = [{
    title: 'Bachelor of Science',
    major: 'Computer Science',
    institution_url: `https://linkedin.com/school/${university.toLowerCase().replace(/\s+/g, '-')}`,
    description: null,
    activities_and_societies: 'Computer Science Society, Hackathons',
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
      description: `Experienced ${currentTitle.toLowerCase()} with a passion for building scalable products. ${experiences.length}+ years of experience in the tech industry.`,
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

  // Check if data already exists
  const existingJobs = localStorage.getItem('mock_job_postings')
  const existingCandidates = localStorage.getItem('mock_candidates')
  const existingJobCandidateMap = localStorage.getItem('mock_job_candidate_map')

  if (!existingJobs) {
    localStorage.setItem('mock_job_postings', JSON.stringify(defaultJobPostings))
  }

  if (!existingCandidates) {
    // Generate 275 candidates (150 for Senior Full Stack Engineer + 125 for Territory Manager)
    const candidates = generateMockCandidates(275)
    localStorage.setItem('mock_candidates', JSON.stringify(candidates))
  }

  // Initialize job-candidate mapping
  if (!existingJobCandidateMap) {
    const jobCandidateMap: Record<number, number[]> = {
      1: Array.from({ length: 150 }, (_, i) => i + 1), // Job 1: candidates 1-150
      2: Array.from({ length: 125 }, (_, i) => i + 151) // Job 2: candidates 151-275
    }
    localStorage.setItem('mock_job_candidate_map', JSON.stringify(jobCandidateMap))
  }

  // Initialize empty arrays for approved/rejected candidates
  if (!localStorage.getItem('mock_shortlisted_candidates')) {
    localStorage.setItem('mock_shortlisted_candidates', JSON.stringify([]))
  }

  if (!localStorage.getItem('mock_rejected_candidates')) {
    localStorage.setItem('mock_rejected_candidates', JSON.stringify([]))
  }
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

