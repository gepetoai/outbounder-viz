'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Checkbox } from './checkbox'

interface SettingsProps {
  onSaveProfile?: (data: ProfileData) => void
  onSavePassword?: (data: PasswordData) => void
  onSaveIntegrations?: (data: IntegrationData) => void
  onSaveExclusions?: (data: ExclusionData) => void
  onPhotoUpload?: () => void
  initialProfileData?: Partial<ProfileData>
  initialIntegrationData?: Partial<IntegrationData>
  initialExclusionData?: Partial<ExclusionData>
}

interface ProfileData {
  name: string
  company: string
  email: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface IntegrationData {
  linkedinConnected: boolean
  linkedinUrl: string
  twilioConnected: boolean
  twilioAccountSid: string
  twilioAuthToken: string
  twilioPhoneNumber: string
}

interface ExclusionData {
  excludePastApplications: boolean
  excludeLinkedInConnections: boolean
}

export function Settings ({
  onSaveProfile,
  onSavePassword,
  onSaveIntegrations,
  onSaveExclusions,
  onPhotoUpload,
  initialProfileData = {},
  initialIntegrationData = {},
  initialExclusionData = {}
}: SettingsProps) {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: initialProfileData.name || '',
    company: initialProfileData.company || '',
    email: initialProfileData.email || ''
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [integrationData, setIntegrationData] = useState<IntegrationData>({
    linkedinConnected: initialIntegrationData.linkedinConnected || false,
    linkedinUrl: initialIntegrationData.linkedinUrl || '',
    twilioConnected: initialIntegrationData.twilioConnected || false,
    twilioAccountSid: initialIntegrationData.twilioAccountSid || '',
    twilioAuthToken: initialIntegrationData.twilioAuthToken || '',
    twilioPhoneNumber: initialIntegrationData.twilioPhoneNumber || ''
  })

  const [exclusionData, setExclusionData] = useState<ExclusionData>({
    excludePastApplications: initialExclusionData.excludePastApplications || false,
    excludeLinkedInConnections: initialExclusionData.excludeLinkedInConnections || false
  })

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleIntegrationChange = (field: keyof IntegrationData, value: string | boolean) => {
    setIntegrationData(prev => ({ ...prev, [field]: value }))
  }

  const handleExclusionChange = (field: keyof ExclusionData, value: boolean) => {
    setExclusionData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleLinkedInToggle = () => {
    const newState = !integrationData.linkedinConnected
    handleIntegrationChange('linkedinConnected', newState)
  }

  const handleTwilioToggle = () => {
    const newState = !integrationData.twilioConnected
    handleIntegrationChange('twilioConnected', newState)
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#1C1B20' }}>
            <Image
              src="/icons/user-light.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEEEEE' }}>
              <Image
                src="/icons/camera-light.svg"
                alt="Profile photo"
                width={32}
                height={32}
                className="opacity-40"
              />
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-50 border"
                style={{ borderColor: '#B9B8C0', color: '#1C1B20' }}
                onClick={onPhotoUpload}
              >
                <Image
                  src="/icons/cloud-arrow-up-light.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="mr-2 opacity-70"
                />
                Upload Photo
              </Button>
              <p className="text-xs mt-1" style={{ color: '#777D8D' }}>
                JPG, PNG up to 2MB
              </p>
            </div>
          </div>

          {/* Name and Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" style={{ color: '#40404C' }}>Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" style={{ color: '#40404C' }}>
                <span className="flex items-center gap-2">
                  <Image
                    src="/icons/briefcase-light.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="opacity-60"
                  />
                  Company
                </span>
              </Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => handleProfileChange('company', e.target.value)}
                placeholder="Enter your company name"
                className="bg-white"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: '#40404C' }}>
              <span className="flex items-center gap-2">
                <Image
                  src="/icons/envelope-light.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="opacity-60"
                />
                Email Address
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="Enter your email address"
              className="bg-white"
            />
          </div>

          <Button
            onClick={() => onSaveProfile?.(profileData)}
            className="border"
            style={{ 
              backgroundColor: '#1C1B20',
              color: '#FFFFFF',
              borderColor: '#1C1B20'
            }}
          >
            <Image
              src="/icons/check-light.svg"
              alt=""
              width={16}
              height={16}
              className="mr-2 brightness-0 invert"
            />
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#1C1B20' }}>
            <Image
              src="/icons/link-light.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* LinkedIn Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#B9B8C0' }}>
              <div>
                <h3 className="font-medium" style={{ color: '#1C1B20' }}>LinkedIn</h3>
                <p className="text-sm" style={{ color: '#777D8D' }}>
                  Connect your LinkedIn account
                </p>
              </div>
              <Button
                variant={integrationData.linkedinConnected ? 'default' : 'outline'}
                onClick={handleLinkedInToggle}
                className="border"
                style={
                  integrationData.linkedinConnected
                    ? { backgroundColor: '#1C1B20', color: '#FFFFFF', borderColor: '#1C1B20' }
                    : { backgroundColor: 'white', color: '#1C1B20', borderColor: '#B9B8C0' }
                }
              >
                {integrationData.linkedinConnected ? 'Connected' : 'Connect'}
              </Button>
            </div>

            {integrationData.linkedinConnected && (
              <div className="space-y-2 pl-4">
                <Label htmlFor="linkedin" style={{ color: '#40404C' }}>LinkedIn Profile URL</Label>
                <Input
                  id="linkedin"
                  value={integrationData.linkedinUrl}
                  onChange={(e) => handleIntegrationChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="bg-white"
                />
              </div>
            )}
          </div>

          {/* Twilio Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#B9B8C0' }}>
              <div>
                <h3 className="font-medium flex items-center gap-2" style={{ color: '#1C1B20' }}>
                  <Image
                    src="/icons/headphones-light.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="opacity-70"
                  />
                  Twilio
                </h3>
                <p className="text-sm" style={{ color: '#777D8D' }}>
                  Connect your Twilio account for SMS/voice
                </p>
              </div>
              <Button
                variant={integrationData.twilioConnected ? 'default' : 'outline'}
                onClick={handleTwilioToggle}
                className="border"
                style={
                  integrationData.twilioConnected
                    ? { backgroundColor: '#1C1B20', color: '#FFFFFF', borderColor: '#1C1B20' }
                    : { backgroundColor: 'white', color: '#1C1B20', borderColor: '#B9B8C0' }
                }
              >
                {integrationData.twilioConnected ? 'Connected' : 'Connect'}
              </Button>
            </div>

            {integrationData.twilioConnected && (
              <div className="space-y-4 pl-4">
                <div className="space-y-2">
                  <Label htmlFor="twilioSid" style={{ color: '#40404C' }}>Account SID</Label>
                  <Input
                    id="twilioSid"
                    value={integrationData.twilioAccountSid}
                    onChange={(e) => handleIntegrationChange('twilioAccountSid', e.target.value)}
                    placeholder="Enter your Twilio Account SID"
                    className="bg-white font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilioToken" style={{ color: '#40404C' }}>Auth Token</Label>
                  <Input
                    id="twilioToken"
                    type="password"
                    value={integrationData.twilioAuthToken}
                    onChange={(e) => handleIntegrationChange('twilioAuthToken', e.target.value)}
                    placeholder="Enter your Twilio Auth Token"
                    className="bg-white font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilioPhone" style={{ color: '#40404C' }}>Phone Number</Label>
                  <Input
                    id="twilioPhone"
                    value={integrationData.twilioPhoneNumber}
                    onChange={(e) => handleIntegrationChange('twilioPhoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => onSaveIntegrations?.(integrationData)}
            className="border"
            style={{ 
              backgroundColor: '#1C1B20',
              color: '#FFFFFF',
              borderColor: '#1C1B20'
            }}
          >
            <Image
              src="/icons/check-light.svg"
              alt=""
              width={16}
              height={16}
              className="mr-2 brightness-0 invert"
            />
            Save Integrations
          </Button>
        </CardContent>
      </Card>

      {/* Exclusions */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#1C1B20' }}>
            <Image
              src="/icons/signal-bars-light.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Exclusions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm" style={{ color: '#777D8D' }}>
            Configure which contacts to exclude from outreach campaigns
          </p>

          {/* Exclude Past Applications */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#B9B8C0' }}>
            <Checkbox
              id="excludeApplications"
              checked={exclusionData.excludePastApplications}
              onCheckedChange={(checked) => handleExclusionChange('excludePastApplications', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="excludeApplications"
                className="text-base font-medium cursor-pointer"
                style={{ color: '#1C1B20' }}
              >
                Exclude past applications
              </Label>
              <p className="text-sm" style={{ color: '#777D8D' }}>
                Automatically exclude people who have previously applied
              </p>
            </div>
          </div>

          {/* Exclude LinkedIn Connections */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#B9B8C0' }}>
            <Checkbox
              id="excludeLinkedIn"
              checked={exclusionData.excludeLinkedInConnections}
              onCheckedChange={(checked) => handleExclusionChange('excludeLinkedInConnections', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label
                htmlFor="excludeLinkedIn"
                className="text-base font-medium cursor-pointer"
                style={{ color: '#1C1B20' }}
              >
                Exclude existing LinkedIn connections
              </Label>
              <p className="text-sm" style={{ color: '#777D8D' }}>
                Automatically exclude people already connected on LinkedIn
              </p>
            </div>
          </div>

          <Button
            onClick={() => onSaveExclusions?.(exclusionData)}
            className="border"
            style={{ 
              backgroundColor: '#1C1B20',
              color: '#FFFFFF',
              borderColor: '#1C1B20'
            }}
          >
            <Image
              src="/icons/check-light.svg"
              alt=""
              width={16}
              height={16}
              className="mr-2 brightness-0 invert"
            />
            Save Exclusions
          </Button>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ color: '#1C1B20' }}>
            <Image
              src="/icons/lock-light.svg"
              alt=""
              width={20}
              height={20}
              className="opacity-70"
            />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" style={{ color: '#40404C' }}>Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                className="bg-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                <Image
                  src={showPasswords.current ? '/icons/eye-slash-light.svg' : '/icons/eye-light.svg'}
                  alt={showPasswords.current ? 'Hide password' : 'Show password'}
                  width={16}
                  height={16}
                  className="opacity-60"
                />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" style={{ color: '#40404C' }}>New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="bg-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                <Image
                  src={showPasswords.new ? '/icons/eye-slash-light.svg' : '/icons/eye-light.svg'}
                  alt={showPasswords.new ? 'Hide password' : 'Show password'}
                  width={16}
                  height={16}
                  className="opacity-60"
                />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: '#40404C' }}>Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                className="bg-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                <Image
                  src={showPasswords.confirm ? '/icons/eye-slash-light.svg' : '/icons/eye-light.svg'}
                  alt={showPasswords.confirm ? 'Hide password' : 'Show password'}
                  width={16}
                  height={16}
                  className="opacity-60"
                />
              </Button>
            </div>
          </div>

          <Button
            onClick={() => onSavePassword?.(passwordData)}
            className="border"
            style={{ 
              backgroundColor: '#1C1B20',
              color: '#FFFFFF',
              borderColor: '#1C1B20'
            }}
          >
            <Image
              src="/icons/check-light.svg"
              alt=""
              width={16}
              height={16}
              className="mr-2 brightness-0 invert"
            />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


