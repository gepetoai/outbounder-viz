'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  User,
  Building2,
  Camera,
  Key,
  Link,
  Upload,
  Save,
  Eye,
  EyeOff,
  Calendar,
  X,
  Edit2,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { CalendarGrid } from '@/components/calendar'
import { formatDate } from '@/components/calendar/calendar-utils'
import { useToast } from '@/components/ui/toast'
import {
  getHolidays,
  getOrganizationHolidays,
  upsertOrganizationHolidays,
  createCustomHoliday,
  type Holiday as ApiHoliday
} from '@/lib/holidays-api'

export function SettingsTab() {
  const { showToast } = useToast()

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    company: 'Tech Corp',
    email: 'john.doe@techcorp.com',
    linkedinUrl: '',
    atsConnected: false,
    atsName: ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Holidays state
  interface CustomHoliday {
    id: string
    name: string
    date: Date
  }

  // Predefined holidays from API
  const [predefinedHolidays, setPredefinedHolidays] = useState<ApiHoliday[]>([])
  const [selectedPredefinedHolidays, setSelectedPredefinedHolidays] = useState<number[]>([])

  // Loading and error states
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true)
  const [holidaysError, setHolidaysError] = useState<string | null>(null)
  const [isSavingHolidays, setIsSavingHolidays] = useState(false)

  // Fetch holidays function (can be called on mount and after creating custom holidays)
  const fetchHolidaysData = async () => {
    try {
      setIsLoadingHolidays(true)
      setHolidaysError(null)

      // Fetch both all holidays and organization's selected holidays
      const [allHolidays, orgHolidays] = await Promise.all([
        getHolidays(),
        getOrganizationHolidays()
      ])

      setPredefinedHolidays(allHolidays)

      // Extract the selected holiday IDs from organization holidays
      const selectedIds = orgHolidays.map(oh => oh.fk_holiday_id)
      setSelectedPredefinedHolidays(selectedIds)
    } catch (error) {
      console.error('Error fetching holidays:', error)
      setHolidaysError(error instanceof Error ? error.message : 'Failed to load holidays')
    } finally {
      setIsLoadingHolidays(false)
    }
  }

  // Fetch holidays on component mount
  useEffect(() => {
    fetchHolidaysData()
  }, [])

  // Custom holidays added by organization
  const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingCustomHoliday, setEditingCustomHoliday] = useState<CustomHoliday | null>(null)
  const [customHolidayName, setCustomHolidayName] = useState('')
  const [showCustomHolidayForm, setShowCustomHolidayForm] = useState(false)
  const [showCustomHolidaySection, setShowCustomHolidaySection] = useState(false)

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleAtsConnect = () => {
    setProfileData(prev => ({ ...prev, atsConnected: !prev.atsConnected }))
  }

  const handleSaveProfile = () => {
    // Handle profile save logic
    console.log('Saving profile:', profileData)
  }

  const handleSavePassword = () => {
    // Handle password save logic
    console.log('Saving password')
  }

  const handlePhotoUpload = () => {
    // Handle photo upload logic
    console.log('Uploading photo')
  }

  const togglePredefinedHoliday = (holidayId: number) => {
    setSelectedPredefinedHolidays(prev =>
      prev.includes(holidayId)
        ? prev.filter(id => id !== holidayId)
        : [...prev, holidayId]
    )
  }

  const handleDateSelect = (date: Date) => {
    // Check if this date already has a custom holiday
    const existingCustomHoliday = customHolidays.find(h =>
      h.date.toDateString() === date.toDateString()
    )

    if (existingCustomHoliday) {
      // Edit existing custom holiday
      setEditingCustomHoliday(existingCustomHoliday)
      setCustomHolidayName(existingCustomHoliday.name)
      setSelectedDate(date)
      setShowCustomHolidayForm(true)
    } else {
      // Add new custom holiday
      setEditingCustomHoliday(null)
      setCustomHolidayName('')
      setSelectedDate(date)
      setShowCustomHolidayForm(true)
    }
  }

  const handleSaveCustomHoliday = async () => {
    if (!selectedDate || !customHolidayName.trim()) return

    try {
      setIsSavingHolidays(true)
      setHolidaysError(null)

      // Format date as YYYY-MM-DD for API
      const formattedDate = selectedDate.toISOString().split('T')[0]

      if (editingCustomHoliday) {
        // Update existing custom holiday (local state only for now)
        // TODO: Implement update endpoint if needed
        setCustomHolidays(prev => prev.map(h =>
          h.id === editingCustomHoliday.id
            ? { ...h, name: customHolidayName, date: selectedDate }
            : h
        ))
        showToast('Custom holiday updated', 'success')
      } else {
        // Create new custom holiday via API
        await createCustomHoliday(customHolidayName, formattedDate)

        // Refetch all holidays to get the updated list
        await fetchHolidaysData()

        showToast('Custom holiday created successfully', 'success')
      }

      // Reset form
      setShowCustomHolidayForm(false)
      setSelectedDate(null)
      setEditingCustomHoliday(null)
      setCustomHolidayName('')
    } catch (error) {
      console.error('Error saving custom holiday:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save custom holiday'
      setHolidaysError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSavingHolidays(false)
    }
  }

  const handleDeleteCustomHoliday = (holidayId: string) => {
    setCustomHolidays(prev => prev.filter(h => h.id !== holidayId))
  }

  const handleCancelCustomHolidayForm = () => {
    setShowCustomHolidayForm(false)
    setShowCustomHolidaySection(false)
    setSelectedDate(null)
    setEditingCustomHoliday(null)
    setCustomHolidayName('')
  }

  const handleSaveAllHolidays = async () => {
    try {
      setIsSavingHolidays(true)
      setHolidaysError(null)

      // Upsert organization holidays
      await upsertOrganizationHolidays(selectedPredefinedHolidays)

      showToast('Holidays saved successfully', 'success')
    } catch (error) {
      console.error('Error saving holidays:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save holidays'
      setHolidaysError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSavingHolidays(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-gray-50"
                onClick={handlePhotoUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
            </div>
          </div>

          {/* Name and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => handleProfileChange('company', e.target.value)}
                placeholder="Enter your company name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="Enter your email address"
            />
          </div>

          {/* LinkedIn Profile */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <div className="flex gap-2">
              <Input
                id="linkedin"
                value={profileData.linkedinUrl}
                onChange={(e) => handleProfileChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-gray-50"
              >
                <Link className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSaveProfile}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* ATS Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            ATS Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">Connect to ATS</h3>
              <p className="text-sm text-gray-500">Integrate with your Applicant Tracking System</p>
            </div>
            <Button 
              variant={profileData.atsConnected ? "default" : "outline"}
              onClick={handleAtsConnect}
              className={profileData.atsConnected ? "bg-green-600 hover:bg-green-700" : "bg-white hover:bg-gray-50"}
            >
              {profileData.atsConnected ? 'Connected' : 'Connect'}
            </Button>
          </div>
          
          {profileData.atsConnected && (
            <div className="space-y-2">
              <Label htmlFor="atsName">ATS Name</Label>
              <Input
                id="atsName"
                value={profileData.atsName}
                onChange={(e) => handleProfileChange('atsName', e.target.value)}
                placeholder="e.g., Workday, BambooHR, Greenhouse"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Holidays - V1: Detailed Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Organization Holidays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            Select common holidays or add custom dates. Campaign actions will not be scheduled on these days.
          </p>

          {/* Common Holidays Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-700">Common Holidays</h3>
              {!isLoadingHolidays && predefinedHolidays.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (selectedPredefinedHolidays.length === predefinedHolidays.length) {
                      setSelectedPredefinedHolidays([])
                    } else {
                      setSelectedPredefinedHolidays(predefinedHolidays.map(h => h.id))
                    }
                  }}
                  className="text-xs"
                >
                  {selectedPredefinedHolidays.length === predefinedHolidays.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {/* Loading State */}
            {isLoadingHolidays && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading holidays...</span>
              </div>
            )}

            {/* Error State */}
            {holidaysError && !isLoadingHolidays && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{holidaysError}</p>
              </div>
            )}

            {/* Holidays List */}
            {!isLoadingHolidays && !holidaysError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {predefinedHolidays.map((holiday) => (
                    <label
                      key={holiday.id}
                      htmlFor={`holiday-${holiday.id}`}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        id={`holiday-${holiday.id}`}
                        checked={selectedPredefinedHolidays.includes(holiday.id)}
                        onCheckedChange={() => togglePredefinedHoliday(holiday.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{holiday.name}</p>
                        <p className="text-xs text-gray-500">{holiday.date}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {selectedPredefinedHolidays.length} common {selectedPredefinedHolidays.length === 1 ? 'holiday' : 'holidays'} selected
                </p>
              </>
            )}
          </div>

          <div className="border-t" />

          {/* Custom Holidays Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-700">Holidays</h3>
              {!showCustomHolidaySection && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCustomHolidaySection(true)}
                  className="bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Holiday
                </Button>
              )}
            </div>

            {/* Custom Holidays List */}
            {customHolidays.length > 0 && (
              <div className="space-y-2">
                {customHolidays
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{holiday.name}</p>
                        <p className="text-xs text-gray-500">{formatDate(holiday.date)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCustomHoliday(holiday)
                            setCustomHolidayName(holiday.name)
                            setSelectedDate(holiday.date)
                            setShowCustomHolidayForm(true)
                            setShowCustomHolidaySection(true)
                          }}
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCustomHoliday(holiday.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Calendar & Form - Only show when button clicked */}
            {showCustomHolidaySection && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    {showCustomHolidayForm ? (editingCustomHoliday ? 'Edit Custom Holiday' : 'Add Custom Holiday') : 'Select a Date'}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCustomHolidaySection(false)
                      handleCancelCustomHolidayForm()
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Calendar */}
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Click on a date to add a custom holiday</p>
                    <CalendarGrid
                      selectedRange={{ start: null, end: null }}
                      onDateSelect={handleDateSelect}
                      events={customHolidays.map(h => ({
                        id: h.id,
                        title: h.name,
                        startDate: h.date,
                        endDate: h.date,
                        type: 'campaign' as const,
                        status: 'active' as const
                      }))}
                    />
                  </div>

                  {/* Holiday Form - Only show after date selected */}
                  {showCustomHolidayForm && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="customHolidayName">Holiday Name</Label>
                        <Input
                          id="customHolidayName"
                          value={customHolidayName}
                          onChange={(e) => setCustomHolidayName(e.target.value)}
                          placeholder="e.g., Company Founders Day"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Date</Label>
                        <p className="text-sm text-gray-600">
                          {selectedDate ? formatDate(selectedDate) : 'No date selected'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            handleSaveCustomHoliday()
                            setShowCustomHolidaySection(false)
                          }}
                          disabled={!customHolidayName.trim() || !selectedDate}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {editingCustomHoliday ? 'Update' : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelCustomHolidayForm}
                          className="bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showCustomHolidayForm && (
                    <div className="flex items-center justify-center text-sm text-gray-500">
                      Click a date on the calendar to continue
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end pt-4 border-t">
            <Button
              onClick={handleSaveAllHolidays}
              disabled={isSavingHolidays || isLoadingHolidays}
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 disabled:opacity-50"
            >
              {isSavingHolidays ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Holidays
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>``

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSavePassword}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
