'use client'

import { useState } from 'react'
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
  Shield
} from 'lucide-react'

export function SettingsTab() {
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
  
  const [exclusionSettings, setExclusionSettings] = useState({
    excludePastAtsApplications: false,
    excludeLinkedInConnections: false
  })

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

  const handleExclusionChange = (field: string, checked: boolean) => {
    setExclusionSettings(prev => ({ ...prev, [field]: checked }))
  }

  const handleSaveExclusions = () => {
    // Handle exclusion settings save logic
    console.log('Saving exclusion settings:', exclusionSettings)
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

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Exclusions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">
            Configure which candidates to exclude from outreach campaigns
          </p>

          {/* Exclude Past ATS Applications */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox 
              id="excludeAts"
              checked={exclusionSettings.excludePastAtsApplications}
              onCheckedChange={(checked) => handleExclusionChange('excludePastAtsApplications', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label 
                htmlFor="excludeAts" 
                className="text-base font-medium cursor-pointer"
              >
                Exclude past ATS applications
              </Label>
              <p className="text-sm text-gray-500">
                Automatically exclude candidates who have previously applied through your ATS
              </p>
            </div>
          </div>

          {/* Exclude LinkedIn Connections */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox 
              id="excludeLinkedIn"
              checked={exclusionSettings.excludeLinkedInConnections}
              onCheckedChange={(checked) => handleExclusionChange('excludeLinkedInConnections', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label 
                htmlFor="excludeLinkedIn" 
                className="text-base font-medium cursor-pointer"
              >
                Exclude existing LinkedIn connections
              </Label>
              <p className="text-sm text-gray-500">
                Automatically exclude people who are already connected to your LinkedIn account
              </p>
            </div>
          </div>

          <Button 
            onClick={handleSaveExclusions}
            className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Exclusions
          </Button>
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
