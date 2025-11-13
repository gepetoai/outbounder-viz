'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from './card'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Badge } from './badge'
import { Switch } from './switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Modal } from './modal'
import { SearchParams, ProspectProfile, SearchFormProps } from './search-types'

interface IconProps {
  src: string
  alt: string
  size?: number
  className?: string
}

function Icon ({ src, alt, size = 20, className = '' }: IconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  )
}

export function SearchForm ({
  searchParams,
  setSearchParams,
  resultCount,
  setResultCount,
  stagingProfiles,
  setStagingProfiles,
  onGoToResults,
  contextId,
  currentSearchId,
  setCurrentSearchId,
  searchTitle,
  setSearchTitle,
  isSearchModified,
  setIsSearchModified,
  searchType = 'prospects',
  contextLabel = 'Context'
}: SearchFormProps) {
  const [tempTitleExclusionInput, setTempTitleExclusionInput] = useState('')
  const [tempKeywordExclusionInput, setTempKeywordExclusionInput] = useState('')
  const [tempJobTitleInclusionInput, setTempJobTitleInclusionInput] = useState('')
  const [tempProfileKeywordInput, setTempProfileKeywordInput] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<ProspectProfile | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSaveNewDialogOpen, setIsSaveNewDialogOpen] = useState(false)
  const [enrichLimit, setEnrichLimit] = useState<number>(10)
  const [isSearching, setIsSearching] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)

  // Track modification state
  const isInitialLoad = useRef(true)
  const skipNextModificationCheck = useRef(0)

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    if (skipNextModificationCheck.current > 0) {
      skipNextModificationCheck.current--
      return
    }

    if (currentSearchId) {
      setIsSearchModified(true)
    }
  }, [searchParams, currentSearchId])

  const addTitleExclusion = () => {
    if (tempTitleExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        titleExclusions: [...searchParams.titleExclusions, tempTitleExclusionInput.trim()]
      })
      setTempTitleExclusionInput('')
    }
  }

  const removeTitleExclusion = (index: number) => {
    const newExclusions = searchParams.titleExclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, titleExclusions: newExclusions })
  }

  const addKeywordExclusion = () => {
    if (tempKeywordExclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        keywordExclusions: [...searchParams.keywordExclusions, tempKeywordExclusionInput.trim()]
      })
      setTempKeywordExclusionInput('')
    }
  }

  const removeKeywordExclusion = (index: number) => {
    const newExclusions = searchParams.keywordExclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, keywordExclusions: newExclusions })
  }

  const addJobTitleInclusion = () => {
    if (tempJobTitleInclusionInput.trim()) {
      setSearchParams({
        ...searchParams,
        jobTitleInclusions: [...searchParams.jobTitleInclusions, tempJobTitleInclusionInput.trim()]
      })
      setTempJobTitleInclusionInput('')
    }
  }

  const removeJobTitleInclusion = (index: number) => {
    const newInclusions = searchParams.jobTitleInclusions.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, jobTitleInclusions: newInclusions })
  }

  const addProfileKeyword = () => {
    if (tempProfileKeywordInput.trim()) {
      setSearchParams({
        ...searchParams,
        profileKeywords: [...searchParams.profileKeywords, tempProfileKeywordInput.trim()]
      })
      setTempProfileKeywordInput('')
    }
  }

  const removeProfileKeyword = (index: number) => {
    const newKeywords = searchParams.profileKeywords.filter((_, i) => i !== index)
    setSearchParams({ ...searchParams, profileKeywords: newKeywords })
  }

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      // Simulate search - in real app, call API
      await new Promise(resolve => setTimeout(resolve, 1000))
      setResultCount(Math.floor(Math.random() * 500) + 50)
      setStagingProfiles([])
      setCurrentSearchId(Date.now())
      setIsSearchModified(false)
    } catch (error) {
      console.error('Search failed:', error)
      setResultCount(0)
      setStagingProfiles([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleEnrichProfiles = async () => {
    setIsEnriching(true)
    try {
      // Simulate enrichment - in real app, call API
      await new Promise(resolve => setTimeout(resolve, 1500))
      // Mock profiles would be generated here
      setStagingProfiles([])
    } catch (error) {
      console.error('Enrichment failed:', error)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleSendToReview = () => {
    setStagingProfiles([])
    onGoToResults()
  }

  const handleProfileClick = (profile: ProspectProfile) => {
    setSelectedProfile(profile)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    setSelectedProfile(null)
  }

  const handleSaveSearch = async () => {
    if (!currentSearchId || !searchTitle.trim()) return
    
    try {
      // In real app, save to API
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsSaveDialogOpen(false)
      setIsSearchModified(false)
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  const handleSaveNewSearch = async () => {
    if (!searchTitle.trim() || !contextId) return
    
    try {
      // In real app, create new search via API
      await new Promise(resolve => setTimeout(resolve, 500))
      setCurrentSearchId(Date.now())
      setIsSaveNewDialogOpen(false)
      setIsSearchModified(false)
    } catch (error) {
      console.error('Failed to create search:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-8 pt-2">

          {/* Education Section */}
          <div className="border-b pb-6" style={{ borderColor: '#EEEEEE' }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon src="/icons/book-light.svg" alt="Education" size={20} />
              <h3 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>Education</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>From year</Label>
                  <Input
                    type="number"
                    value={searchParams.graduationYearFrom || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, graduationYearFrom: parseInt(e.target.value) || 0 })}
                    min="1980"
                    max="2025"
                    placeholder="2018"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>To year</Label>
                  <Input
                    type="number"
                    value={searchParams.graduationYearTo || ''}
                    onChange={(e) => setSearchParams({ ...searchParams, graduationYearTo: parseInt(e.target.value) || 0 })}
                    min="1980"
                    max="2025"
                    placeholder="2022"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="border-b pb-6" style={{ borderColor: '#EEEEEE' }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon src="/icons/circle-light.svg" alt="Location" size={20} />
              <h3 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>Location</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>State</Label>
                  <Input
                    placeholder="Select state..."
                    value={searchParams.locationState}
                    onChange={(e) => setSearchParams({ ...searchParams, locationState: e.target.value, locationCity: '' })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>City</Label>
                  <Input
                    placeholder="Select city..."
                    value={searchParams.locationCity}
                    onChange={(e) => setSearchParams({ ...searchParams, locationCity: e.target.value })}
                    disabled={!searchParams.locationState}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>Radius (miles)</Label>
                  <Input
                    type="number"
                    value={searchParams.searchRadius || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, searchRadius: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="500"
                    placeholder="25"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="border-b pb-6" style={{ borderColor: '#EEEEEE' }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon src="/icons/briefcase-light.svg" alt="Experience" size={20} />
              <h3 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>Experience</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>
                    Minimum past positions
                  </Label>
                  <Input
                    type="number"
                    value={searchParams.numExperiences || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, numExperiences: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="10"
                    className="w-20"
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>Maximum years experience</Label>
                  <Input
                    type="number"
                    value={searchParams.maxExperience || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, maxExperience: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="30"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>Minimum connections</Label>
                  <Input
                    type="number"
                    value={searchParams.connections}
                    onChange={(e) => setSearchParams({ ...searchParams, connections: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="500"
                    className="w-20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>Max years at one job</Label>
                  <Input
                    type="number"
                    value={searchParams.maxJobDuration || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, maxJobDuration: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="20"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>Min years relevant experience</Label>
                  <Input
                    type="number"
                    value={searchParams.deptYears || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, deptYears: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="20"
                    className="w-20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#40404C' }}>Min months in current role</Label>
                  <Input
                    type="number"
                    value={searchParams.timeInRole || 0}
                    onChange={(e) => setSearchParams({ ...searchParams, timeInRole: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="60"
                    placeholder="6"
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inclusions Section */}
          <div className="border-b pb-6" style={{ borderColor: '#EEEEEE' }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon src="/icons/check-light.svg" alt="Inclusions" size={20} />
              <h3 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>Inclusions</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>Title Inclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., VP Sales, Account Executive..."
                      value={tempJobTitleInclusionInput}
                      onChange={(e) => setTempJobTitleInclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addJobTitleInclusion()
                        }
                      }}
                    />
                    <Button onClick={addJobTitleInclusion} variant="outline">
                      Add
                    </Button>
                  </div>
                  {searchParams.jobTitleInclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchParams.jobTitleInclusions.map((title, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                          {title}
                          <button
                            type="button"
                            aria-label={`Remove ${title}`}
                            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeJobTitleInclusion(index)
                            }}
                          >
                            <Icon src="/icons/xmark-light.svg" alt="Remove" size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>Profile Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Salesforce, B2B, SaaS..."
                      value={tempProfileKeywordInput}
                      onChange={(e) => setTempProfileKeywordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addProfileKeyword()
                        }
                      }}
                    />
                    <Button onClick={addProfileKeyword} variant="outline">
                      Add
                    </Button>
                  </div>
                  {searchParams.profileKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchParams.profileKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                          {keyword}
                          <button
                            type="button"
                            aria-label={`Remove ${keyword}`}
                            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeProfileKeyword(index)
                            }}
                          >
                            <Icon src="/icons/xmark-light.svg" alt="Remove" size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Exclusions Section */}
          <div className="border-b pb-6" style={{ borderColor: '#EEEEEE' }}>
            <div className="flex items-center gap-2 mb-4">
              <Icon src="/icons/xmark-light.svg" alt="Exclusions" size={20} />
              <h3 className="text-lg font-semibold" style={{ color: '#1C1B20' }}>Exclusions</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>Title Exclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., CEO, CFO, Intern..."
                      value={tempTitleExclusionInput}
                      onChange={(e) => setTempTitleExclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTitleExclusion()
                        }
                      }}
                    />
                    <Button onClick={addTitleExclusion} variant="outline">
                      Add
                    </Button>
                  </div>
                  {searchParams.titleExclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchParams.titleExclusions.map((exclusion, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="flex items-center gap-1"
                          style={{ backgroundColor: '#1C1B20', color: '#FFFFFF', borderColor: '#1C1B20' }}
                        >
                          {exclusion}
                          <button
                            type="button"
                            aria-label={`Remove ${exclusion}`}
                            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-white/10"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeTitleExclusion(index)
                            }}
                          >
                            <Icon src="/icons/xmark-light.svg" alt="Remove" size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" style={{ color: '#777D8D' }}>Keyword Exclusions</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., healthcare, retail..."
                      value={tempKeywordExclusionInput}
                      onChange={(e) => setTempKeywordExclusionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addKeywordExclusion()
                        }
                      }}
                    />
                    <Button onClick={addKeywordExclusion} variant="outline">
                      Add
                    </Button>
                  </div>
                  {searchParams.keywordExclusions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {searchParams.keywordExclusions.map((exclusion, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="flex items-center gap-1"
                          style={{ backgroundColor: '#1C1B20', color: '#FFFFFF', borderColor: '#1C1B20' }}
                        >
                          {exclusion}
                          <button
                            type="button"
                            aria-label={`Remove ${exclusion}`}
                            className="inline-flex items-center justify-center rounded p-0.5 hover:bg-white/10"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeKeywordExclusion(index)
                            }}
                          >
                            <Icon src="/icons/xmark-light.svg" alt="Remove" size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    checked={searchParams.managementLevelExclusions === 'C-Level, Director, Manager, VP, Owner, Founder'}
                    onCheckedChange={(checked) => {
                      const exclusions = checked 
                        ? 'C-Level, Director, Manager, VP, Owner, Founder'
                        : ''
                      setSearchParams({ ...searchParams, managementLevelExclusions: exclusions })
                    }}
                  />
                  <Label className="text-sm" style={{ color: '#40404C' }}>Exclude Current or Previous Managers & Executives</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {!contextId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon src="/icons/circle-light.svg" alt="Results" size={20} style={{ opacity: 0.4 }} />
                  <div>
                    <span className="text-2xl font-bold" style={{ color: '#B9B8C0' }}>
                      Select a {contextLabel.toLowerCase()} first
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="flex items-center gap-2"
                  onClick={handleSearch}
                  disabled={true}
                  style={{ backgroundColor: '#1C1B20', color: '#FFFFFF' }}
                >
                  <Icon src="/icons/magnifying-glass-dark.svg" alt="Search" size={16} />
                  Search {searchType === 'candidates' ? 'Candidates' : 'Prospects'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon src="/icons/circle-light.svg" alt="Results" size={20} />
                  <div>
                    <span className="text-2xl font-bold" style={{ color: '#1C1B20' }}>
                      {resultCount.toLocaleString()}
                    </span>
                    <span className="text-2xl font-bold" style={{ color: '#1C1B20' }}> {searchType} found</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button 
                    className="flex items-center gap-2"
                    onClick={handleSearch}
                    disabled={isSearching || !contextId}
                    style={{ backgroundColor: '#1C1B20', color: '#FFFFFF' }}
                  >
                    {isSearching ? (
                      <>
                        <Icon src="/icons/loader-light.svg" alt="Loading" size={16} className="animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Icon src="/icons/magnifying-glass-dark.svg" alt="Search" size={16} />
                        Search {searchType === 'candidates' ? 'Candidates' : 'Prospects'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sample Profiles */}
          {stagingProfiles.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {stagingProfiles.slice(0, 5).map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleProfileClick(profile)}
                    style={{ borderColor: '#EEEEEE' }}
                  >
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover grayscale"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold" style={{ color: '#1C1B20' }}>{profile.name}</h4>
                        <Badge variant="outline">{profile.title}</Badge>
                      </div>
                      <p className="text-sm" style={{ color: '#777D8D' }}>{profile.company} • {profile.location}</p>
                      <p className="text-sm" style={{ color: '#B9B8C0' }}>{profile.education}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentSearchId && (
            <div className="flex items-center gap-3 pt-4">
              <Button
                className="flex items-center gap-2"
                onClick={handleSendToReview}
                style={{ backgroundColor: '#1C1B20', color: '#FFFFFF' }}
              >
                <Icon src="/icons/paper-plane-light.svg" alt="Send" size={16} />
                Send All {resultCount.toLocaleString()} to Review
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <Label className="text-sm font-medium whitespace-nowrap" style={{ color: '#40404C' }}>Limit:</Label>
                <Input
                  type="number"
                  value={enrichLimit}
                  onChange={(e) => setEnrichLimit(parseInt(e.target.value) || 1)}
                  min="1"
                  max="100"
                  className="w-20"
                  placeholder="10"
                />
                <Button
                  className="flex items-center gap-2"
                  onClick={handleEnrichProfiles}
                  disabled={!currentSearchId || isEnriching}
                  style={{ backgroundColor: '#1C1B20', color: '#FFFFFF' }}
                >
                  {isEnriching ? (
                    <>
                      <Icon src="/icons/loader-light.svg" alt="Loading" size={16} className="animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Icon src="/icons/sparkles-light.svg" alt="Enrich" size={16} />
                      Enrich {searchType === 'candidates' ? 'Candidates' : 'Prospects'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Detail Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-[312px] sm:max-w-[312px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Profile Details</SheetTitle>
          </SheetHeader>
          
          {selectedProfile && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-4">
                <div className="flex items-start gap-3">
                  <img 
                    src={selectedProfile.photo} 
                    alt={selectedProfile.name}
                    className="w-16 h-16 rounded-full object-cover grayscale"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold" style={{ color: '#1C1B20' }}>{selectedProfile.name}</h2>
                    <p className="text-sm" style={{ color: '#777D8D' }}>{selectedProfile.title}</p>
                    <p className="text-xs" style={{ color: '#B9B8C0' }}>{selectedProfile.company} • {selectedProfile.location}</p>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => selectedProfile.linkedinUrl && window.open(selectedProfile.linkedinUrl, '_blank')}
                        disabled={!selectedProfile.linkedinUrl}
                      >
                        View LinkedIn Profile
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#1C1B20' }}>Summary</h3>
                  <p className="text-xs" style={{ color: '#40404C' }}>{selectedProfile.summary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#1C1B20' }}>Education</h3>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#F5F5F5' }}>
                    <p className="text-xs font-medium" style={{ color: '#40404C' }}>{selectedProfile.education}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#1C1B20' }}>Experience</h3>
                  <div className="space-y-2">
                    {selectedProfile.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 pl-3" style={{ borderColor: '#777D8D' }}>
                        <h4 className="text-xs font-medium" style={{ color: '#1C1B20' }}>{exp.title}</h4>
                        <p className="text-xs" style={{ color: '#777D8D' }}>{exp.company}</p>
                        <p className="text-xs" style={{ color: '#B9B8C0' }}>{exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Save Search Modals */}
      <Modal
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        title="Update Search"
        description="Update the name and parameters for this existing search."
        confirmText="Update"
        onConfirm={handleSaveSearch}
        onCancel={() => {
          setIsSaveDialogOpen(false)
          setSearchTitle('')
        }}
        confirmDisabled={!searchTitle.trim()}
      >
        <div className="space-y-2">
          <Label htmlFor="search-title">Search Title</Label>
          <Input
            id="search-title"
            placeholder="e.g., Enterprise Sales Prospects - West Coast"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTitle.trim()) {
                handleSaveSearch()
              }
            }}
          />
        </div>
      </Modal>

      <Modal
        open={isSaveNewDialogOpen}
        onOpenChange={setIsSaveNewDialogOpen}
        title="Save New Search"
        description="Enter a name for this new search to save it for future use."
        confirmText="Create Search"
        onConfirm={handleSaveNewSearch}
        onCancel={() => {
          setIsSaveNewDialogOpen(false)
          setSearchTitle('')
        }}
        confirmDisabled={!searchTitle.trim()}
      >
        <div className="space-y-2">
          <Label htmlFor="new-search-title">Search Title</Label>
          <Input
            id="new-search-title"
            placeholder="e.g., Enterprise Sales Prospects - West Coast"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTitle.trim()) {
                handleSaveNewSearch()
              }
            }}
          />
        </div>
      </Modal>
    </div>
  )
}

