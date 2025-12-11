'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
  type Holiday as ApiHoliday,
  updateOrganizationHoliday
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
  interface OrganizationHoliday {
    id: number
    name: string
    date: Date
    is_global: boolean
  }

  // All holidays associated with the organization (unified list)
  const [organizationHolidays, setOrganizationHolidays] = useState<OrganizationHoliday[]>([])

  // All available holidays from the system (for selection)
  const [availableHolidays, setAvailableHolidays] = useState<ApiHoliday[]>([])

  // Loading and error states
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true)
  const [holidaysError, setHolidaysError] = useState<string | null>(null)
  const [isSavingHolidays, setIsSavingHolidays] = useState(false)

  // Fetch holidays function (can be called on mount and after creating holidays)
  const fetchHolidaysData = async () => {
    try {
      setIsLoadingHolidays(true)
      setHolidaysError(null)

      // Fetch both all holidays and organization's selected holidays
      const [allHolidays, orgHolidays] = await Promise.all([
        getHolidays(),
        getOrganizationHolidays()
      ])

      setAvailableHolidays(allHolidays)

      // Get all holidays associated with the organization
      const orgHolidayIds = new Set(orgHolidays.map(oh => oh.fk_holiday_id))
      const orgHols = allHolidays
        .filter(h => orgHolidayIds.has(h.id))
        .map(h => ({
          id: h.id,
          name: h.name,
          date: new Date(h.date),
          is_global: h.is_global
        }))

      setOrganizationHolidays(orgHols)
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<OrganizationHoliday | null>(null)
  const [holidayName, setHolidayName] = useState('')
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [showHolidaySection, setShowHolidaySection] = useState(false)

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

  const toggleHoliday = (holidayId: number) => {
    const isSelected = organizationHolidays.some(h => h.id === holidayId)

    if (isSelected) {
      // Remove holiday from organization
      setOrganizationHolidays(prev => prev.filter(h => h.id !== holidayId))
    } else {
      // Add holiday to organization
      const holiday = availableHolidays.find(h => h.id === holidayId)
      if (holiday) {
        setOrganizationHolidays(prev => [...prev, {
          id: holiday.id,
          name: holiday.name,
          date: new Date(holiday.date),
          is_global: holiday.is_global
        }])
      }
    }
  }

  const handleDateSelect = (date: Date) => {
    setEditingHoliday(null)
    setHolidayName('')
    setSelectedDate(date)
    setShowHolidayForm(true)
  }

  const handleSaveHoliday = async () => {
    if (!selectedDate || !holidayName.trim()) return

    try {
      setIsSavingHolidays(true)
      setHolidaysError(null)

      // Format date as YYYY-MM-DD for API using local date components
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`

      let message = ''
      if (editingHoliday) {
        await updateOrganizationHoliday(editingHoliday.id, holidayName, formattedDate)
        message = 'Holiday updated successfully'
      } else {
        // Create new holiday via API
        await createCustomHoliday(holidayName, formattedDate)
        message = 'Holiday created successfully'
      }

      // Refetch all holidays to get the updated list
      await fetchHolidaysData()
      showToast(message, 'success')

      // Reset form
      setShowHolidayForm(false)
      setSelectedDate(null)
      setEditingHoliday(null)
      setHolidayName('')
    } catch (error) {
      console.error('Error saving holiday:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save holiday'
      setHolidaysError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSavingHolidays(false)
    }
  }

  const handleDeleteHoliday = (holidayId: number) => {
    setOrganizationHolidays(prev => prev.filter(h => h.id !== holidayId))
  }

  const handleCancelHolidayForm = () => {
    setShowHolidayForm(false)
    setShowHolidaySection(false)
    setSelectedDate(null)
    setEditingHoliday(null)
    setHolidayName('')
  }

  const handleSaveAllHolidays = async () => {
    try {
      setIsSavingHolidays(true)
      setHolidaysError(null)

      // Upsert organization holidays with all selected holiday IDs
      const holidayIds = organizationHolidays.map(h => h.id)
      await upsertOrganizationHolidays(holidayIds)

      // Refetch to ensure we have the latest data
      await fetchHolidaysData()

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

          {/* Available Holidays Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-700">Available Holidays</h3>
              {!isLoadingHolidays && availableHolidays.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const allSelected = availableHolidays.every(h =>
                      organizationHolidays.some(oh => oh.id === h.id)
                    )
                    if (allSelected) {
                      setOrganizationHolidays([])
                    } else {
                      setOrganizationHolidays(availableHolidays.map(h => ({
                        id: h.id,
                        name: h.name,
                        date: new Date(h.date),
                        is_global: h.is_global
                      })))
                    }
                  }}
                  className="text-xs"
                >
                  {availableHolidays.every(h => organizationHolidays.some(oh => oh.id === h.id))
                    ? 'Deselect All'
                    : 'Select All'}
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

            {/* Available Holidays List */}
            {!isLoadingHolidays && !holidaysError && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableHolidays.map((holiday) => {
                    const isSelected = organizationHolidays.some(oh => oh.id === holiday.id)
                    return (
                      <label
                        key={holiday.id}
                        htmlFor={`holiday-${holiday.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <Checkbox
                          id={`holiday-${holiday.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleHoliday(holiday.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{holiday.name}</p>
                          <p className="text-xs text-gray-500">{holiday.date}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  {organizationHolidays.length} {organizationHolidays.length === 1 ? 'holiday' : 'holidays'} selected
                </p>
              </>
            )}
          </div>

          <div className="border-t" />

          {/* Organization Holidays Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-gray-700">Your Organization Holidays</h3>
              {!showHolidaySection && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowHolidaySection(true)}
                  className="bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom Holiday
                </Button>
              )}
            </div>

            {/* Organization Holidays List */}
            {organizationHolidays.length > 0 && (
              <div className="space-y-2">
                {organizationHolidays
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
                      {
                        !holiday.is_global && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingHoliday(holiday)
                                setHolidayName(holiday.name)
                                setSelectedDate(holiday.date)
                                setShowHolidayForm(true)
                                setShowHolidaySection(true)
                              }}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteHoliday(holiday.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )
                      }
                    </div>
                  ))}
              </div>
            )}

            {/* Calendar & Form - Only show when button clicked */}
            {showHolidaySection && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">
                    {showHolidayForm ? (editingHoliday ? 'Edit Holiday' : 'Add Holiday') : 'Select a Date'}
                  </h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowHolidaySection(false)
                      handleCancelHolidayForm()
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Calendar */}
                  <div>
                    <p className="text-xs text-gray-500 mb-3">Click on a date to add a holiday</p>
                    <CalendarGrid
                      selectedRange={{ start: null, end: null }}
                      onDateSelect={handleDateSelect}
                      events={organizationHolidays.map(h => ({
                        id: h.id.toString(),
                        title: h.name,
                        startDate: h.date,
                        endDate: h.date,
                        type: 'campaign' as const,
                        status: 'active' as const
                      }))}
                    />
                  </div>

                  {/* Holiday Form - Only show after date selected */}
                  {showHolidayForm && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="holidayName">Holiday Name</Label>
                        <Input
                          id="holidayName"
                          value={holidayName}
                          onChange={(e) => setHolidayName(e.target.value)}
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
                          onClick={async () => {
                            await handleSaveHoliday()
                            setShowHolidaySection(false)
                          }}
                          disabled={!holidayName.trim() || !selectedDate}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {editingHoliday ? 'Update' : 'Add'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelHolidayForm}
                          className="bg-white hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {!showHolidayForm && (
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
      </Card>

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
