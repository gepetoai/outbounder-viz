'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  setRejectedCandidates
}: SearchTabProps) {
  const [tempInput, setTempInput] = useState('')
  const [inputError, setInputError] = useState('')

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
    if (tempInput.trim()) {
      setSearchParams({
        ...searchParams,
        jobTitles: [...searchParams.jobTitles, tempInput.trim()]
      })
      setTempInput('')
    }
  }

  const removeJobTitle = (index: number) => {
    const newTitles = searchParams.jobTitles.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, jobTitles: newTitles })
  }

  const addSkill = () => {
    if (tempInput.trim()) {
      setSearchParams({
        ...searchParams,
        skills: [...searchParams.skills, tempInput.trim()]
      })
      setTempInput('')
    }
  }

  const removeSkill = (index: number) => {
    const newSkills = searchParams.skills.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, skills: newSkills })
  }

  const addExclusionKeyword = () => {
    if (tempInput.trim()) {
      setSearchParams({
        ...searchParams,
        exclusions: {
          ...searchParams.exclusions,
          keywords: [...searchParams.exclusions.keywords, tempInput.trim()]
        }
      })
      setTempInput('')
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
    return Array.from({ length: count }, (_, i) => ({
      id: `candidate-${startIndex + i}`,
      name: `Candidate ${startIndex + i + 1}`,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${startIndex + i}`,
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      education: 'Bachelor of Computer Science',
      experience: [
        { title: 'Software Engineer', company: 'Tech Company', duration: '2 years' },
        { title: 'Junior Developer', company: 'Startup Inc', duration: '1 year' }
      ],
      linkedinUrl: `https://linkedin.com/in/candidate-${startIndex + i}`,
      summary: 'Experienced software engineer with expertise in React and Node.js'
    }))
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
    // Add current staging candidates to approved candidates
    const candidateIds = stagingCandidates.map(candidate => candidate.id)
    setApprovedCandidates([...approvedCandidates, ...candidateIds])
    
    // Clear staging candidates
    setStagingCandidates([])
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
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
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
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
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
            <div className="space-y-6">
              {/* Error Display */}
              {inputError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{inputError}</p>
                </div>
              )}

              {/* Company Exclusions */}
              <div className="space-y-3">
                <Label>Companies</Label>
                <div className="flex flex-wrap gap-2 mb-3">
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
              <div className="space-y-3">
                <Label>People</Label>
                <div className="flex flex-wrap gap-2 mb-3">
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
          </div>

          {/* Sample Candidates */}
          {stagingCandidates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sample Candidates</h3>
              <div className="grid gap-4">
                {stagingCandidates.slice(0, 5).map((candidate) => (
                  <div key={candidate.id} className="flex items-center gap-4 p-4 border rounded-lg">
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                      <Button size="sm">
                        Add to List
                      </Button>
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
                  Send to Review
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
