'use client'

import { Settings } from '@248/ui'

export function SettingsTab () {
  const handleSaveProfile = (data: any) => {
    // Handle profile save logic
    console.log('Saving profile:', data)
  }

  const handleSavePassword = (data: any) => {
    // Handle password save logic
    console.log('Saving password:', data)
  }

  const handleSaveIntegrations = (data: any) => {
    // Handle integrations save logic
    console.log('Saving integrations:', data)
  }

  const handleSaveExclusions = (data: any) => {
    // Handle exclusions save logic
    console.log('Saving exclusions:', data)
  }

  const handlePhotoUpload = () => {
    // Handle photo upload logic
    console.log('Uploading photo')
  }

  return (
    <Settings
      onSaveProfile={handleSaveProfile}
      onSavePassword={handleSavePassword}
      onSaveIntegrations={handleSaveIntegrations}
      onSaveExclusions={handleSaveExclusions}
      onPhotoUpload={handlePhotoUpload}
      initialProfileData={{
        name: 'John Doe',
        company: 'Tech Corp',
        email: 'john.doe@techcorp.com'
      }}
      initialIntegrationData={{
        linkedinConnected: false,
        linkedinUrl: '',
        twilioConnected: false,
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioPhoneNumber: ''
      }}
      initialExclusionData={{
        excludePastApplications: false,
        excludeLinkedInConnections: false
      }}
    />
  )
}
