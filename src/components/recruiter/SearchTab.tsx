'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { User, Briefcase, MapPin, GraduationCap, X, Search, Target, Code, Upload, RefreshCw, Send } from 'lucide-react'

export interface SearchParams {
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
  connections: { min: number; max: number }
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
}

interface SearchTabProps {
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  candidateYield: number
  setCandidateYield: (candidateYield: number) => void
  stagingCandidates: Candidate[]
  setStagingCandidates: (candidates: Candidate[]) => void
  approvedCandidates: string[]
  setApprovedCandidates: (candidates: string[]) => void
  rejectedCandidates: string[]
  setRejectedCandidates: (candidates: string[]) => void
  reviewCandidates: Candidate[]
  setReviewCandidates: (candidates: Candidate[]) => void
  onGoToCandidates: () => void
}

export function SearchTab({
  searchParams,
  setSearchParams,
  candidateYield,
  setCandidateYield,
  stagingCandidates,
  setStagingCandidates,
  approvedCandidates,
  setApprovedCandidates,
  rejectedCandidates,
  setRejectedCandidates,
  reviewCandidates,
  setReviewCandidates,
  onGoToCandidates
}: SearchTabProps) {
  const [tempJobTitleInput, setTempJobTitleInput] = useState('')
  const [tempSkillInput, setTempSkillInput] = useState('')
  const [tempExclusionInput, setTempExclusionInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const isValidLinkedInUrl = (url: string): boolean => {
    return url.includes('linkedin.com/company/') || url.includes('linkedin.com/in/')
  }

  const validateAndProcessUrls = (urls: string[]): { valid: string[], invalid: string[] } => {
    const valid: string[] = []
    const invalid: string[] = []
    
    urls.forEach(url => {
      if (isValidLinkedInUrl(url)) {
        valid.push(url)
      } else {
        invalid.push(url)
      }
    })
    
    return { valid, invalid }
  }

  const addJobTitle = () => {
    if (tempJobTitleInput.trim()) {
      setSearchParams({
        ...searchParams,
        jobTitles: [...searchParams.jobTitles, tempJobTitleInput.trim()]
      })
      setTempJobTitleInput('')
    }
  }

  const removeJobTitle = (index: number) => {
    const newTitles = searchParams.jobTitles.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, jobTitles: newTitles })
  }

  const addSkill = () => {
    if (tempSkillInput.trim()) {
      setSearchParams({
        ...searchParams,
        skills: [...searchParams.skills, tempSkillInput.trim()]
      })
      setTempSkillInput('')
    }
  }

  const removeSkill = (index: number) => {
    const newSkills = searchParams.skills.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, skills: newSkills })
  }

  const addExclusionKeyword = () => {
    if (tempExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        exclusions: {
          ...searchParams.exclusions,
          keywords: [...searchParams.exclusions.keywords, tempExclusionInput.trim()]
        }
      })
      setTempExclusionInput('')
    }
  }

  const removeExclusionKeyword = (index: number) => {
    const newKeywords = searchParams.exclusions.keywords.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, keywords: newKeywords }
    })
  }

  const handleCompanyCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const urls = lines.map(line => line.trim()).filter(url => url)
        const { valid, invalid } = validateAndProcessUrls(urls)
        
        if (invalid.length > 0) {
          setInputError(`Invalid LinkedIn URLs found: ${invalid.join(', ')}`)
          setTimeout(() => setInputError(''), 5000)
        } else {
          setInputError('')
        }
        
        if (valid.length > 0) {
          setSearchParams({
            ...searchParams,
            exclusions: {
              ...searchParams.exclusions,
              excludeCompanies: [...searchParams.exclusions.excludeCompanies, ...valid]
            }
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const removeExcludeCompany = (index: number) => {
    const newCompanies = searchParams.exclusions.excludeCompanies.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, excludeCompanies: newCompanies }
    })
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        const urls = lines.map(line => line.trim()).filter(url => url)
        const { valid, invalid } = validateAndProcessUrls(urls)
        
        if (invalid.length > 0) {
          setInputError(`Invalid LinkedIn URLs found: ${invalid.join(', ')}`)
          setTimeout(() => setInputError(''), 5000)
        } else {
          setInputError('')
        }
        
        if (valid.length > 0) {
          setSearchParams({
            ...searchParams,
            exclusions: {
              ...searchParams.exclusions,
              excludePeople: [...searchParams.exclusions.excludePeople, ...valid]
            }
          })
        }
      }
      reader.readAsText(file)
    }
  }

  const removeExcludePerson = (index: number) => {
    const newPeople = searchParams.exclusions.excludePeople.filter((_, i) => i !== index)
    setSearchParams({
      ...searchParams,
      exclusions: { ...searchParams.exclusions, excludePeople: newPeople }
    })
  }

  const generateMockCandidates = (count: number, startIndex: number = 0): Candidate[] => {
    const names = [
      'Sarah Chen', 'Marcus Rodriguez', 'Emily Johnson', 'David Kim', 'Jessica Martinez',
      'Alex Thompson', 'Rachel Green', 'Michael Brown', 'Lisa Wang', 'James Wilson',
      'Amanda Davis', 'Christopher Lee', 'Jennifer Taylor', 'Robert Garcia', 'Michelle Anderson',
      'Daniel White', 'Ashley Thomas', 'Matthew Jackson', 'Stephanie Harris', 'Andrew Clark',
      'Nicole Adams', 'Kevin Park', 'Samantha Lee', 'Brandon Wright', 'Olivia Torres',
      'Ryan Murphy', 'Isabella Chen', 'Tyler Johnson', 'Maya Patel', 'Ethan Davis'
    ]
    
    const companies = [
      'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb',
      'Tesla', 'SpaceX', 'Stripe', 'Shopify', 'Slack', 'Zoom', 'Salesforce',
      'Oracle', 'IBM', 'Intel', 'NVIDIA', 'Adobe', 'PayPal', 'Square', 'Twilio'
    ]
    
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA',
      'Los Angeles, CA', 'Chicago, IL', 'Denver, CO', 'Portland, OR', 'Miami, FL'
    ]
    
    const educationLevels = [
      'Bachelor of Computer Science', 'Master of Computer Science', 'PhD in Computer Science',
      'Bachelor of Software Engineering', 'Master of Software Engineering', 'Bachelor of Information Technology'
    ]
    
    // Shuffle the arrays to get random selection
    const shuffledNames = [...names].sort(() => Math.random() - 0.5)
    const shuffledCompanies = [...companies].sort(() => Math.random() - 0.5)
    const shuffledLocations = [...locations].sort(() => Math.random() - 0.5)
    const shuffledEducation = [...educationLevels].sort(() => Math.random() - 0.5)
    
    return Array.from({ length: count }, (_, i) => {
      // Use selected job titles if available, otherwise use default
      const selectedTitle = searchParams.jobTitles.length > 0 
        ? searchParams.jobTitles[i % searchParams.jobTitles.length]
        : 'Software Engineer'
      
      // Use selected skills if available, otherwise use default
      const selectedSkills = searchParams.skills.length > 0 
        ? searchParams.skills.join(', ')
        : 'React, Node.js, TypeScript'
      
      return {
        id: `candidate-${startIndex + i}`,
        name: shuffledNames[i % shuffledNames.length],
        photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${startIndex + i}`,
        title: selectedTitle,
        company: shuffledCompanies[i % shuffledCompanies.length],
        location: shuffledLocations[i % shuffledLocations.length],
        education: shuffledEducation[i % shuffledEducation.length],
        experience: [
          { title: selectedTitle, company: shuffledCompanies[i % shuffledCompanies.length], duration: '2 years' },
          { title: `Junior ${selectedTitle}`, company: 'Startup Inc', duration: '1 year' }
        ],
        linkedinUrl: `https://linkedin.com/in/candidate-${startIndex + i}`,
        summary: `Experienced ${selectedTitle.toLowerCase()} with expertise in ${selectedSkills}`
      }
    })
  }

  const handleSearch = () => {
    // Simulate search and update yield
    const mockYield = Math.floor(Math.random() * 5000) + 1000
    setCandidateYield(mockYield)
    
    // Generate mock candidates
    const mockCandidates = generateMockCandidates(10)
    setStagingCandidates(mockCandidates)
  }

  const handleRefreshCandidates = () => {
    // Generate 5 new candidates from the same pool (different IDs)
    const currentCount = stagingCandidates.length
    const newCandidates = generateMockCandidates(5, currentCount)
    setStagingCandidates(newCandidates)
  }

  const handleSendToReview = () => {
    // Generate the full number of candidates for review (same as candidateYield)
    const fullCandidateList = generateMockCandidates(candidateYield)
    
    // Set the review candidates to the full list
    setReviewCandidates(fullCandidateList)
    
    // Clear staging candidates
    setStagingCandidates([])
    
    // Redirect to candidates tab
    onGoToCandidates()
  }

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedCandidate(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-8 pt-6">
          {/* Education Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Education</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="education"
                  placeholder="Education Level (e.g., Bachelor's, Master's, PhD)"
                  value={searchParams.education}
                  onChange={(e) => setSearchParams({ ...searchParams, education: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="graduation-year"
                  placeholder="Graduation Year (e.g., 2020, 2021)"
                  value={searchParams.graduationYear}
                  onChange={(e) => setSearchParams({ ...searchParams, graduationYear: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  id="geography"
                  placeholder="Location (e.g., San Francisco, CA)"
                  value={searchParams.geography}
                  onChange={(e) => setSearchParams({ ...searchParams, geography: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Input
                  id="radius"
                  type="number"
                  placeholder="Radius (miles)"
                  value={searchParams.radius}
                  onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) || 25 })}
                />
              </div>
            </div>
          </div>

          {/* Job Titles Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Job Titles</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {searchParams.jobTitles.map((title, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {title}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeJobTitle(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add job title..."
                  value={tempJobTitleInput}
                  onChange={(e) => setTempJobTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addJobTitle()
                    }
                  }}
                />
                <Button onClick={addJobTitle} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Skills</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-3">
                {searchParams.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSkill(index)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={tempSkillInput}
                  onChange={(e) => setTempSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addSkill()
                    }
                  }}
                />
                <Button onClick={addSkill} variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Exclusion Section */}
          <div className="border-b pb-6">
            <div className="flex items-center gap-2 mb-4">
              <X className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Exclusion</h3>
            </div>
            <div className="space-y-4">
              {/* Error Display */}
              {inputError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{inputError}</p>
                </div>
              )}

              {/* Keywords Exclusions */}
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {searchParams.exclusions.keywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeExclusionKeyword(index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add exclusion keyword..."
                    value={tempExclusionInput}
                    onChange={(e) => setTempExclusionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addExclusionKeyword()
                      }
                    }}
                  />
                  <Button onClick={addExclusionKeyword} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              {/* Company Exclusions */}
              <div className="space-y-2">
                <Label>Companies</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {searchParams.exclusions.excludeCompanies.map((company, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {company}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeExcludeCompany(index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCompanyCSVUpload}
                    className="hidden"
                    id="company-csv-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('company-csv-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </Button>
                </div>
              </div>

              {/* People Exclusions */}
              <div className="space-y-2">
                <Label>People</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {searchParams.exclusions.excludePeople.map((person, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {person}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeExcludePerson(index)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5" />
                <div>
                  <span className="text-2xl font-bold">
                    {candidateYield.toLocaleString()}
                  </span>
                  <span className="text-2xl font-bold"> candidates found</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                  Search Candidates
                </Button>
              </div>
            </div>
            
            {/* Search Criteria Display */}
            {(searchParams.jobTitles.length > 0 || searchParams.skills.length > 0) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Search Criteria:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchParams.jobTitles.map((title, index) => (
                    <Badge key={`title-${index}`} variant="secondary" className="text-xs">
                      Job: {title}
                    </Badge>
                  ))}
                  {searchParams.skills.map((skill, index) => (
                    <Badge key={`skill-${index}`} variant="outline" className="text-xs">
                      Skill: {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sample Candidates */}
          {stagingCandidates.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {stagingCandidates.slice(0, 5).map((candidate) => (
                  <div 
                    key={candidate.id} 
                    className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <img 
                      src={candidate.photo} 
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover grayscale"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <Badge variant="outline">{candidate.title}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{candidate.company} • {candidate.location}</p>
                      <p className="text-sm text-gray-500">{candidate.education}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleRefreshCandidates}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleSendToReview}
                >
                  <Send className="h-4 w-4" />
                  Send All {candidateYield.toLocaleString()} to Review
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate Detail Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-[312px] sm:max-w-[312px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Candidate Profile</SheetTitle>
          </SheetHeader>
          
          {selectedCandidate && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                {/* Profile Header */}
                <div className="flex items-start gap-3">
                  <img 
                    src={selectedCandidate.photo} 
                    alt={selectedCandidate.name}
                    className="w-16 h-16 rounded-full object-cover grayscale"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">{selectedCandidate.name}</h2>
                    <p className="text-sm text-gray-600">{selectedCandidate.title}</p>
                    <p className="text-xs text-gray-500">{selectedCandidate.company} • {selectedCandidate.location}</p>
                    <div className="mt-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        View LinkedIn Profile
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Summary</h3>
                  <p className="text-xs text-gray-700">{selectedCandidate.summary}</p>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Education</h3>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs font-medium">{selectedCandidate.education}</p>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Experience</h3>
                  <div className="space-y-2">
                    {selectedCandidate.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-500 pl-3">
                        <h4 className="text-xs font-medium">{exp.title}</h4>
                        <p className="text-xs text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Git', 'Agile'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Experience */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Experience</h3>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Senior Frontend Developer</h4>
                      <p className="text-gray-600">Tech Startup Inc</p>
                      <p className="text-sm text-gray-500">2020 - 2022</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Led frontend development team of 5 developers. Implemented micro-frontend architecture 
                        and improved application performance by 40%. Mentored junior developers and established 
                        coding standards.
                      </p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-medium">Full Stack Developer</h4>
                      <p className="text-gray-600">Digital Agency</p>
                      <p className="text-sm text-gray-500">2018 - 2020</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Developed full-stack web applications using React, Node.js, and PostgreSQL. 
                        Collaborated with design team to implement responsive UIs and optimized database queries.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">AWS Certified Solutions Architect</Badge>
                      <span className="text-sm text-gray-500">2023</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Google Cloud Professional Developer</Badge>
                      <span className="text-sm text-gray-500">2022</span>
                    </div>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Languages</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>English</span>
                      <span className="text-sm text-gray-500">Native</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spanish</span>
                      <span className="text-sm text-gray-500">Fluent</span>
                    </div>
                    <div className="flex justify-between">
                      <span>French</span>
                      <span className="text-sm text-gray-500">Conversational</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
