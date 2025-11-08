'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormBuilder } from './FormBuilder'
import { OutputFields } from './OutputFields'
import { CRMMapping } from './CRMMapping'
import { Copy, CheckCircle2 } from 'lucide-react'
import { IconPicker, type IconName } from './IconPicker'

type LeadSourceType = 'website-form' | 'landing-page' | 'instagram-ads' | 'linkedin-ads' | 'google-ads' | 'paid-lead-source'
type ConnectionMethod = 'form-fill' | 'webhook' | 'typeform' | 'zapier'

type FormField = {
  id: string
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

type OutputField = {
  id: string
  name: string
}

type LeadSource = {
  id: string
  name: string
  type: LeadSourceType
  icon: IconName
  connectionMethod: ConnectionMethod
  formFields?: FormField[]
  webhookUrl?: string
  outputFields: OutputField[]
  crmMappings: Record<string, string>
  createdAt: string
  updatedAt: string
}

interface LeadSourceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: LeadSource | null
  onSave: (source: LeadSource) => void
}

export function LeadSourceForm ({ open, onOpenChange, source, onSave }: LeadSourceFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [copied, setCopied] = useState(false)
  
  const getDefaultIcon = (type: LeadSourceType) => {
    switch (type) {
      case 'instagram-ads':
        return 'Instagram'
      case 'linkedin-ads':
        return 'Linkedin'
      case 'google-ads':
        return 'Target'
      case 'paid-lead-source':
        return 'TrendingUp'
      case 'landing-page':
        return 'FileText'
      default:
        return 'Globe'
    }
  }

  const [formData, setFormData] = useState<Partial<LeadSource>>({
    name: '',
    type: 'website-form',
    icon: 'Globe',
    connectionMethod: 'webhook',
    crmMappings: {}
  })

  const [formFields, setFormFields] = useState<FormField[]>([])
  const [outputFields, setOutputFields] = useState<OutputField[]>([])
  const [crmMappings, setCrmMappings] = useState<Record<string, string>>({})
  const [fetchedInputFields, setFetchedInputFields] = useState<string[]>([])
  const [isTesting, setIsTesting] = useState(false)
  const [hasTested, setHasTested] = useState(false)

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        type: source.type,
        icon: source.icon,
        connectionMethod: source.connectionMethod,
        webhookUrl: source.webhookUrl
      })
      setFormFields(source.formFields || [])
      setOutputFields(source.outputFields || [])
      setCrmMappings(source.crmMappings || {})
    } else {
      setFormData({
        name: '',
        type: 'website-form',
        icon: 'Globe',
        connectionMethod: 'webhook',
        crmMappings: {}
      })
      setFormFields([])
      setOutputFields([])
      setCrmMappings({})
    }
    setCurrentStep(1)
  }, [source, open])

  const generateWebhookUrl = (sourceId: string) => {
    return `https://api.inbounder.com/webhooks/${sourceId}`
  }

  const getWebhookPayloadFields = (type: LeadSourceType): string[] => {
    switch (type) {
      case 'instagram-ads':
        return ['full_name', 'email_address', 'phone_number', 'company', 'message']
      case 'linkedin-ads':
        return ['firstName', 'lastName', 'email', 'phone', 'companyName', 'jobTitle', 'comments']
      case 'google-ads':
        return ['name', 'email', 'phone', 'campaign_name', 'ad_group', 'keyword', 'gclid']
      case 'paid-lead-source':
        return ['first_name', 'last_name', 'email', 'phone', 'source_name', 'campaign_id', 'cost_per_lead']
      default:
        return ['name', 'email', 'phone', 'company', 'message']
    }
  }

  const getWebhookPayloadExample = (type: LeadSourceType): string => {
    switch (type) {
      case 'instagram-ads':
        return JSON.stringify({
          full_name: 'John Doe',
          email_address: 'john@example.com',
          phone_number: '+1234567890',
          company: 'Acme Corp',
          message: 'Interested in your services'
        }, null, 2)
      case 'linkedin-ads':
        return JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          companyName: 'Acme Corp',
          jobTitle: 'Marketing Director',
          comments: 'Looking for B2B solutions'
        }, null, 2)
      case 'google-ads':
        return JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          campaign_name: 'Search Campaign Q1',
          ad_group: 'Lead Gen Keywords',
          keyword: 'b2b software',
          gclid: 'abc123xyz'
        }, null, 2)
      case 'paid-lead-source':
        return JSON.stringify({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          source_name: 'Partner Referral',
          campaign_id: 'CAMP-2024-Q1',
          cost_per_lead: '25.00'
        }, null, 2)
      default:
        return JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          company: 'Acme Corp',
          message: 'Interested in your services'
        }, null, 2)
    }
  }

  const mockFetchTypeformFields = () => {
    setIsTesting(true)
    setTimeout(() => {
      setFetchedInputFields(['form_id', 'response_id', 'submitted_at', 'answers'])
      setIsTesting(false)
      setHasTested(true)
    }, 1000)
  }

  const mockFetchZapierFields = () => {
    setIsTesting(true)
    setTimeout(() => {
      setFetchedInputFields(['First Name', 'Last Name', 'Lead Source', 'Address', 'Email'])
      setIsTesting(false)
      setHasTested(true)
    }, 1000)
  }

  const mockFetchWebhookFields = () => {
    setIsTesting(true)
    setTimeout(() => {
      const fields = getWebhookPayloadFields(formData.type || 'website-form')
      setFetchedInputFields(fields)
      setIsTesting(false)
      setHasTested(true)
    }, 1000)
  }

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = () => {
    const sourceId = source?.id || `source-${Date.now()}`
    const webhookUrl = (formData.connectionMethod === 'webhook' || formData.connectionMethod === 'typeform' || formData.connectionMethod === 'zapier')
      ? (formData.webhookUrl || generateWebhookUrl(sourceId))
      : undefined

    const newSource: LeadSource = {
      id: sourceId,
      name: formData.name || 'Untitled Source',
      type: formData.type || 'website-form',
      icon: formData.icon || 'Globe',
      connectionMethod: formData.connectionMethod || 'webhook',
      formFields: formData.connectionMethod === 'form-fill' ? formFields : undefined,
      webhookUrl,
      outputFields,
      crmMappings,
      createdAt: source?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(newSource)
    onOpenChange(false)
  }

  const handleCopyWebhook = () => {
    if (formData.webhookUrl) {
      navigator.clipboard.writeText(formData.webhookUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.name
      case 2:
        return true
      case 3:
        if (formData.connectionMethod === 'form-fill') {
          return formFields.length > 0
        }
        // For webhook/typeform/zapier, require testing
        return hasTested && fetchedInputFields.length > 0
      case 4:
        return outputFields.length > 0
      case 5:
        return true
      default:
        return false
    }
  }


  useEffect(() => {
    if ((formData.connectionMethod === 'webhook' || formData.connectionMethod === 'typeform' || formData.connectionMethod === 'zapier') && !formData.webhookUrl) {
      const sourceId = source?.id || `source-${Date.now()}`
      const webhookUrl = generateWebhookUrl(sourceId)
      setFormData(prev => ({ ...prev, webhookUrl }))
    }
  }, [formData.connectionMethod, formData.webhookUrl, source?.id])

  useEffect(() => {
    setFetchedInputFields([])
    setHasTested(false)
  }, [formData.connectionMethod])

  const getInputFields = () => {
    if (formData.connectionMethod === 'form-fill') {
      return formFields.map(f => f.label)
    }
    // Use fetched fields if available
    if (hasTested && fetchedInputFields.length > 0) {
      return fetchedInputFields
    }
    // Fallback to hardcoded fields
    // For typeform
    if (formData.connectionMethod === 'typeform') {
      return ['form_id', 'response_id', 'submitted_at', 'answers']
    }
    // For zapier
    if (formData.connectionMethod === 'zapier') {
      return ['First Name', 'Last Name', 'Lead Source', 'Address', 'Email']
    }
    // For webhook, return common field names based on source type
    if (formData.type === 'instagram-ads') {
      return ['full_name', 'email_address', 'phone_number', 'company', 'message']
    }
    if (formData.type === 'linkedin-ads') {
      return ['firstName', 'lastName', 'email', 'phone', 'companyName', 'jobTitle', 'comments']
    }
    if (formData.type === 'google-ads') {
      return ['name', 'email', 'phone', 'campaign_name', 'ad_group', 'keyword', 'gclid']
    }
    if (formData.type === 'paid-lead-source') {
      return ['first_name', 'last_name', 'email', 'phone', 'source_name', 'campaign_id', 'cost_per_lead']
    }
    // Default fields for other source types
    return ['name', 'email', 'phone', 'company', 'message']
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-2 border-gray-900 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {source ? 'Edit Lead Source' : 'Add Lead Source'}
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                  step === currentStep
                    ? 'bg-black text-white border-gray-900'
                    : step < currentStep
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {step < currentStep ? <CheckCircle2 className="h-4 w-4" /> : step}
              </div>
              {step < 5 && (
                <div
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Source Name</Label>
                <Input
                  id="source-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Homepage Contact Form"
                  className="border-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source-type">Source Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: LeadSourceType) => {
                    const defaultIcon = getDefaultIcon(value)
                    setFormData(prev => ({ 
                      ...prev, 
                      type: value,
                      icon: prev.icon === 'Globe' || !prev.icon ? defaultIcon : prev.icon
                    }))
                  }}
                >
                  <SelectTrigger id="source-type" className="border-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website-form">Website Form</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="instagram-ads">Instagram Ads</SelectItem>
                    <SelectItem value="linkedin-ads">LinkedIn Ads</SelectItem>
                    <SelectItem value="google-ads">Google Ads</SelectItem>
                    <SelectItem value="paid-lead-source">Paid Lead Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <IconPicker
                selectedIcon={formData.icon || 'Globe'}
                onChange={(icon) => setFormData(prev => ({ ...prev, icon }))}
              />
            </div>
          )}

          {/* Step 2: Connection Method */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Connection Method</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, connectionMethod: 'form-fill' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.connectionMethod === 'form-fill'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium mb-1">Create Form</div>
                    <div className="text-sm text-gray-600">
                      Create a form that can be embedded on your website
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, connectionMethod: 'webhook' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.connectionMethod === 'webhook'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium mb-1">Webhook</div>
                    <div className="text-sm text-gray-600">
                      Connect external forms via webhook URL
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, connectionMethod: 'typeform' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.connectionMethod === 'typeform'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium mb-1">Typeform</div>
                    <div className="text-sm text-gray-600">
                      Connect your Typeform surveys and forms
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, connectionMethod: 'zapier' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      formData.connectionMethod === 'zapier'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium mb-1">Zapier</div>
                    <div className="text-sm text-gray-600">
                      Connect via Zapier automation workflows
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Form Configuration or Webhook */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {formData.connectionMethod === 'form-fill' ? (
                <FormBuilder
                  fields={formFields}
                  onChange={setFormFields}
                />
              ) : formData.connectionMethod === 'typeform' || formData.connectionMethod === 'zapier' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.webhookUrl || generateWebhookUrl(source?.id || `source-${Date.now()}`)}
                        readOnly
                        className="border-gray-900 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyWebhook}
                        className="bg-white hover:bg-gray-50 border-gray-900"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium mb-2">Setup Instructions</p>
                    <div className="text-sm text-gray-600 space-y-2">
                      {formData.connectionMethod === 'typeform' ? (
                        <>
                          <p>1. Go to your Typeform settings</p>
                          <p>2. Navigate to "Connect" → "Webhooks"</p>
                          <p>3. Add the webhook URL above</p>
                          <p>4. Test the connection to ensure data flows correctly</p>
                        </>
                      ) : (
                        <>
                          <p>1. Create a new Zap in Zapier</p>
                          <p>2. Set up your trigger (form submission, etc.)</p>
                          <p>3. Add "Webhooks by Zapier" action</p>
                          <p>4. Use the webhook URL above as the destination</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={formData.connectionMethod === 'typeform' ? mockFetchTypeformFields : mockFetchZapierFields}
                    disabled={isTesting}
                    className="bg-black hover:bg-gray-800 text-white w-full"
                  >
                    {isTesting ? 'Testing...' : hasTested ? 'Test Again' : 'Test Connection'}
                  </Button>
                  {hasTested && fetchedInputFields.length > 0 && (
                    <div className="p-4 border-2 border-gray-900 rounded-lg bg-white">
                      <Label className="text-sm font-semibold mb-3 block">Detected Input Fields</Label>
                      <div className="space-y-2">
                        {fetchedInputFields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <CheckCircle2 className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-mono">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.webhookUrl || generateWebhookUrl(source?.id || `source-${Date.now()}`)}
                        readOnly
                        className="border-gray-900 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyWebhook}
                        className="bg-white hover:bg-gray-50 border-gray-900"
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium mb-2">Webhook Payload Example</p>
                    <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
{getWebhookPayloadExample(formData.type || 'website-form')}
                    </pre>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      This is a generic webhook endpoint. Send POST requests with any JSON payload structure. Perfect for custom integrations or third-party services.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={mockFetchWebhookFields}
                    disabled={isTesting}
                    className="bg-black hover:bg-gray-800 text-white w-full"
                  >
                    {isTesting ? 'Testing...' : hasTested ? 'Test Again' : 'Test Webhook'}
                  </Button>
                  {hasTested && fetchedInputFields.length > 0 && (
                    <div className="p-4 border-2 border-gray-900 rounded-lg bg-white">
                      <Label className="text-sm font-semibold mb-3 block">Detected Input Fields</Label>
                      <div className="space-y-2">
                        {fetchedInputFields.map((field, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <CheckCircle2 className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-mono">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Output Fields */}
          {currentStep === 4 && (
            <OutputFields
              fields={outputFields}
              onChange={setOutputFields}
            />
          )}

          {/* Step 5: CRM Mapping */}
          {currentStep === 5 && (
            <CRMMapping
              inputFields={getInputFields()}
              outputFields={outputFields.map(f => f.name).filter(name => name.trim() !== '')}
              mappings={crmMappings}
              onChange={setCrmMappings}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="bg-white hover:bg-gray-50 border-gray-900 disabled:opacity-50"
          >
            Back
          </Button>
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-black hover:bg-gray-800 text-white disabled:opacity-50"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={!canProceed()}
              className="bg-black hover:bg-gray-800 text-white disabled:opacity-50"
            >
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

