'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { 
  Key, 
  Save,
  Eye,
  EyeOff,
  Building2,
  Link2,
  X,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Phone,
  Plus
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

// Comprehensive list of Salesforce Lead object fields
const ALL_SALESFORCE_FIELDS = [
  'FirstName',
  'LastName',
  'Email',
  'Phone',
  'Company',
  'Title',
  'Description',
  'LeadSource',
  'Street',
  'City',
  'State',
  'PostalCode',
  'Country',
  'Website',
  'Industry',
  'NumberOfEmployees',
  'AnnualRevenue',
  'Rating',
  'Status',
  'MobilePhone',
  'Fax',
  'Salutation',
  'MiddleName',
  'Suffix',
  'EmailBouncedDate',
  'EmailBouncedReason',
  'Jigsaw',
  'JigsawContactId',
  'CleanStatus',
  'CompanyDunsNumber',
  'DandbCompanyId',
  'PhotoUrl',
  'IndividualId',
  'ConvertedDate',
  'ConvertedAccountId',
  'ConvertedContactId',
  'ConvertedOpportunityId',
  'IsConverted',
  'IsUnreadByOwner',
  'CurrentGenerators__c',
  'NumberofLocations__c',
  'Primary__c',
  'ProductInterest__c',
  'SICCode__c'
]

// Default selected fields matching current CRMMapping
const DEFAULT_SELECTED_FIELDS = [
  'FirstName',
  'LastName',
  'Email',
  'Phone',
  'Company',
  'Title',
  'Description',
  'LeadSource'
]

export function SettingsTab () {
  const [aiProvider, setAiProvider] = useState<'248' | 'openai' | 'anthropic' | 'grok'>('248')
  const [aiTokens, setAiTokens] = useState({
    openai: '',
    anthropic: '',
    grok: ''
  })
  const [aiSettingsSaved, setAiSettingsSaved] = useState(false)
  
  const [crmConnections, setCrmConnections] = useState({
    salesforce: true, // Default to connected
    hubspot: false
  })
  
  const [salesforceSelectedFields, setSalesforceSelectedFields] = useState<string[]>(DEFAULT_SELECTED_FIELDS)
  const [salesforceConnectionStep, setSalesforceConnectionStep] = useState<'connect' | 'select-fields'>('connect')
  const [isFetchingFields, setIsFetchingFields] = useState(false)
  
  const [connectionDialog, setConnectionDialog] = useState<{
    open: boolean
    crm: 'salesforce' | 'hubspot' | null
  }>({
    open: false,
    crm: null
  })
  
  const [isConnecting, setIsConnecting] = useState(false)
  
  const [twilioConnected, setTwilioConnected] = useState(false)
  const [twilioDialog, setTwilioDialog] = useState(false)
  const [isConnectingTwilio, setIsConnectingTwilio] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCreatingNumber, setIsCreatingNumber] = useState(false)
  const [d10lcStatus, setD10lcStatus] = useState<'unverified' | 'verifying' | 'verified'>('unverified')
  
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

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSavePassword = () => {
    // Handle password save logic
    console.log('Saving password')
  }

  const handleAiProviderChange = (provider: '248' | 'openai' | 'anthropic' | 'grok') => {
    setAiProvider(provider)
    setAiSettingsSaved(false)
  }

  const handleAiTokenChange = (provider: 'openai' | 'anthropic' | 'grok', token: string) => {
    setAiTokens(prev => ({ ...prev, [provider]: token }))
    setAiSettingsSaved(false)
  }

  const handleSaveAiSettings = () => {
    // Handle AI settings save logic
    console.log('Saving AI settings:', { provider: aiProvider, tokens: aiTokens })
    setAiSettingsSaved(true)
  }

  const handleConnectCrm = (crm: 'salesforce' | 'hubspot') => {
    if (crm === 'salesforce') {
      setSalesforceConnectionStep('connect')
    }
    setConnectionDialog({ open: true, crm })
  }

  const handleDisconnectCrm = (crm: 'salesforce' | 'hubspot') => {
    setCrmConnections(prev => ({ ...prev, [crm]: false }))
    if (crm === 'salesforce') {
      setSalesforceConnectionStep('connect')
      setSalesforceSelectedFields(DEFAULT_SELECTED_FIELDS)
    }
  }

  const handleToggleSalesforceField = (field: string) => {
    setSalesforceSelectedFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const handleSelectAllSalesforceFields = () => {
    setSalesforceSelectedFields(ALL_SALESFORCE_FIELDS)
  }

  const handleDeselectAllSalesforceFields = () => {
    setSalesforceSelectedFields([])
  }

  const handleAuthorizeSalesforce = async () => {
    setIsConnecting(true)
    // Simulate OAuth/authorization process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
    
    // After successful authorization, fetch fields
    setIsFetchingFields(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsFetchingFields(false)
    
    // Move to field selection step
    setSalesforceConnectionStep('select-fields')
  }

  const handleCompleteSalesforceConnection = () => {
    if (salesforceSelectedFields.length === 0) return
    
    setCrmConnections(prev => ({ ...prev, salesforce: true }))
    setConnectionDialog({ open: false, crm: null })
    setSalesforceConnectionStep('connect')
  }

  const handleConfirmConnection = async () => {
    if (!connectionDialog.crm) return
    
    setIsConnecting(true)
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setCrmConnections(prev => ({ ...prev, [connectionDialog.crm!]: true }))
    setIsConnecting(false)
    setConnectionDialog({ open: false, crm: null })
  }

  const crmNames = {
    salesforce: 'Salesforce',
    hubspot: 'HubSpot'
  }

  const handleConnectTwilio = () => {
    setTwilioDialog(true)
  }

  const handleDisconnectTwilio = () => {
    setTwilioConnected(false)
    setPhoneNumber('')
    setD10lcStatus('unverified')
  }

  const handleConfirmTwilioConnection = async () => {
    setIsConnectingTwilio(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTwilioConnected(true)
    setIsConnectingTwilio(false)
    setTwilioDialog(false)
  }

  const handleCreateNumber = async () => {
    setIsCreatingNumber(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setPhoneNumber('+1 (555) 123-4567')
    setIsCreatingNumber(false)
  }

  const handleVerify10DLC = async () => {
    setD10lcStatus('verifying')
    await new Promise(resolve => setTimeout(resolve, 2000))
    setD10lcStatus('verified')
  }

  return (
    <div className="space-y-6">
      {/* AI Integration */}
      <Card className="border-border">
        <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* 248 Option */}
            <div
              onClick={() => handleAiProviderChange('248')}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                aiProvider === '248'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                aiProvider === '248'
                  ? 'border-gray-900'
                  : 'border-border'
              }`}>
                {aiProvider === '248' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">248</h3>
              </div>
            </div>

            {/* OpenAI Option */}
            <div
              onClick={() => handleAiProviderChange('openai')}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                aiProvider === 'openai'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                aiProvider === 'openai'
                  ? 'border-gray-900'
                  : 'border-border'
              }`}>
                {aiProvider === 'openai' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">OpenAI</h3>
              </div>
            </div>

            {/* Anthropic Option */}
            <div
              onClick={() => handleAiProviderChange('anthropic')}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                aiProvider === 'anthropic'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                aiProvider === 'anthropic'
                  ? 'border-gray-900'
                  : 'border-border'
              }`}>
                {aiProvider === 'anthropic' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Anthropic</h3>
              </div>
            </div>

            {/* Grok Option */}
            <div
              onClick={() => handleAiProviderChange('grok')}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                aiProvider === 'grok'
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-border hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                aiProvider === 'grok'
                  ? 'border-gray-900'
                  : 'border-border'
              }`}>
                {aiProvider === 'grok' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Grok</h3>
              </div>
            </div>
          </div>

          {/* Token Input Fields */}
          {aiProvider !== '248' && (
            <div className="space-y-2 pt-2">
              <Label htmlFor={`${aiProvider}-token`}>
                {aiProvider === 'openai' && 'OpenAI API Key'}
                {aiProvider === 'anthropic' && 'Anthropic API Key'}
                {aiProvider === 'grok' && 'Grok API Key'}
              </Label>
              <Input
                id={`${aiProvider}-token`}
                type="password"
                value={aiTokens[aiProvider]}
                onChange={(e) => handleAiTokenChange(aiProvider, e.target.value)}
                placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : aiProvider === 'anthropic' ? 'Anthropic' : 'Grok'} API key`}
                className="border-gray-900"
              />
            </div>
          )}

          <Button 
            onClick={handleSaveAiSettings}
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-900"
          >
            {aiSettingsSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* CRM Integration */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            CRM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Salesforce */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-border">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">Salesforce</h3>
                <p className="text-sm text-gray-500">
                  {crmConnections.salesforce ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {crmConnections.salesforce && (
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              )}
            </div>
            {crmConnections.salesforce ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnectCrm('salesforce')}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnectCrm('salesforce')}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </div>

          {/* HubSpot */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-border">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">HubSpot</h3>
                <p className="text-sm text-gray-500">
                  {crmConnections.hubspot ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {crmConnections.hubspot && (
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              )}
            </div>
            {crmConnections.hubspot ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnectCrm('hubspot')}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnectCrm('hubspot')}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Dialog */}
      <Dialog open={connectionDialog.open} onOpenChange={(open) => {
        setConnectionDialog({ open, crm: open ? connectionDialog.crm : null })
        if (!open && connectionDialog.crm === 'salesforce') {
          setSalesforceConnectionStep('connect')
        }
      }}>
        <DialogContent className="border-border max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {connectionDialog.crm === 'salesforce' 
                ? (salesforceConnectionStep === 'connect' ? 'Connect Salesforce' : 'Select Salesforce Fields')
                : `Connect ${connectionDialog.crm && crmNames[connectionDialog.crm]}`
              }
            </DialogTitle>
            <DialogDescription>
              {connectionDialog.crm === 'salesforce' 
                ? (salesforceConnectionStep === 'connect' 
                    ? 'Authorize access to your Salesforce account to fetch available Lead fields.'
                    : 'Select which Lead fields you want to make available for mapping.'
                  )
                : `You will be redirected to ${connectionDialog.crm && crmNames[connectionDialog.crm]} to authorize the connection.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {connectionDialog.crm === 'salesforce' ? (
              <>
                {/* Step 1: Connect/Authorize */}
                {salesforceConnectionStep === 'connect' && (
                  <div className="space-y-4">
                    <div className="p-6 border border-gray-300 rounded-lg bg-gray-50 text-center">
                      <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Authorize Salesforce</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        You'll be redirected to Salesforce to log in and authorize access. 
                        We'll then fetch your Lead object fields.
                      </p>
                      <Button
                        onClick={handleAuthorizeSalesforce}
                        disabled={isConnecting || isFetchingFields}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        {isConnecting ? (
                          'Authorizing...'
                        ) : isFetchingFields ? (
                          'Fetching Fields...'
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-2" />
                            Authorize with Salesforce
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Select Fields */}
                {salesforceConnectionStep === 'select-fields' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-800">
                          Successfully connected to Salesforce and fetched Lead fields
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Available Lead Fields</Label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAllSalesforceFields}
                          className="text-xs"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAllSalesforceFields}
                          className="text-xs"
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="h-[350px] border border-gray-300 rounded-lg p-4 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-3">
                        {ALL_SALESFORCE_FIELDS.map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <Checkbox
                              id={field}
                              checked={salesforceSelectedFields.includes(field)}
                              onCheckedChange={() => handleToggleSalesforceField(field)}
                            />
                            <label
                              htmlFor={field}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {field}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong>{salesforceSelectedFields.length}</strong> field{salesforceSelectedFields.length !== 1 ? 's' : ''} selected. 
                        These fields will be available for mapping in Lead Source configuration.
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSalesforceConnectionStep('connect')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleCompleteSalesforceConnection}
                        disabled={salesforceSelectedFields.length === 0}
                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                      >
                        Complete Connection
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg bg-gray-50">
                  <Button
                    onClick={handleConfirmConnection}
                    disabled={isConnecting}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-900"
                  >
                    {isConnecting ? (
                      <>
                        <span className="mr-2">Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Continue to {connectionDialog.crm && crmNames[connectionDialog.crm]}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Twilio Connection */}
          <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-border">
                <Phone className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">Twilio</h3>
                <p className="text-sm text-gray-500">
                  {twilioConnected ? 'Connected' : 'Not connected'}
                </p>
              </div>
              {twilioConnected && (
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
              )}
            </div>
            {twilioConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnectTwilio}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnectTwilio}
                className="bg-white hover:bg-gray-50 border-border"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </div>

          {twilioConnected && (
            <>
              {/* Create New Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    placeholder="No number assigned"
                    readOnly
                    className="border-gray-900"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNumber}
                    disabled={isCreatingNumber || !!phoneNumber}
                    className="bg-white hover:bg-gray-50 border-border"
                  >
                    {isCreatingNumber ? (
                      'Creating...'
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Number
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 10DLC Verification */}
              <div className="space-y-2">
                <Label>10DLC Status</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 border border-border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      {d10lcStatus === 'verified' && (
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="text-sm">
                        {d10lcStatus === 'unverified' && 'Not verified'}
                        {d10lcStatus === 'verifying' && 'Verifying...'}
                        {d10lcStatus === 'verified' && 'Verified'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVerify10DLC}
                    disabled={d10lcStatus === 'verifying' || d10lcStatus === 'verified'}
                    className="bg-white hover:bg-gray-50 border-border"
                  >
                    {d10lcStatus === 'verifying' ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Twilio Connection Dialog */}
      <Dialog open={twilioDialog} onOpenChange={setTwilioDialog}>
        <DialogContent className="border-border">
          <DialogHeader>
            <DialogTitle>Connect Twilio</DialogTitle>
            <DialogDescription>
              You will be redirected to Twilio to authorize the connection.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-gray-50">
                <Button
                  onClick={handleConfirmTwilioConnection}
                  disabled={isConnectingTwilio}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-900"
                >
                  {isConnectingTwilio ? (
                    <>
                      <span className="mr-2">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-2" />
                      Continue to Twilio
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change */}
      <Card className="border-border">
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
                className="border-gray-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50"
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
                className="border-gray-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50"
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
                className="border-gray-900"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-50"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleSavePassword}
            className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-900"
          >
            <Save className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

