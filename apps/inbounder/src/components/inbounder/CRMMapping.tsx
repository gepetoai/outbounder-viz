'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CRMMappingProps {
  inputFields: string[]
  outputFields: string[]
  mappings: Record<string, string>
  onChange: (mappings: Record<string, string>) => void
}

// Mock CRM connection status - in real app, this would come from Settings
const CRM_CONNECTIONS = {
  salesforce: true, // Mock: assume connected (matches Settings default)
  hubspot: false
}

// In production, these fields would come from Settings based on user's field selection
// Using the default selected fields that match Settings
const SALESFORCE_FIELDS = [
  'FirstName',
  'LastName',
  'Email',
  'Phone',
  'Company',
  'Title',
  'Description',
  'LeadSource'
]

const HUBSPOT_FIELDS = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'company',
  'jobtitle',
  'message',
  'lead_source'
]

function getAvailableCRMFields () {
  const fields: string[] = []
  
  if (CRM_CONNECTIONS.salesforce) {
    fields.push(...SALESFORCE_FIELDS.map(f => `Salesforce: ${f}`))
  }
  
  if (CRM_CONNECTIONS.hubspot) {
    fields.push(...HUBSPOT_FIELDS.map(f => `HubSpot: ${f}`))
  }
  
  return fields
}

export function CRMMapping ({ inputFields, outputFields, mappings, onChange }: CRMMappingProps) {
  const availableCRMFields = getAvailableCRMFields()
  const hasCRMConnected = CRM_CONNECTIONS.salesforce || CRM_CONNECTIONS.hubspot

  const updateMapping = (inbounderField: string, crmField: string) => {
    onChange({ ...mappings, [inbounderField]: crmField })
  }

  const removeMapping = (inbounderField: string) => {
    const newMappings = { ...mappings }
    delete newMappings[inbounderField]
    onChange(newMappings)
  }

  if (!hasCRMConnected) {
    return (
      <Card className="border-gray-900 border-2">
        <CardContent className="p-8 text-center space-y-4">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto" />
          <div>
            <p className="text-base font-semibold text-gray-900 mb-2">
              Salesforce Connection Required
            </p>
            <p className="text-sm text-gray-600">
              Please connect your Salesforce account in the Settings tab to map CRM fields
            </p>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              Go to <strong>Settings → CRM → Connect Salesforce</strong>
            </p>
          </div>
          <p className="text-xs text-gray-500 pt-2">
            Note: You can still use webhooks without CRM mapping, but mapping allows automatic syncing to Salesforce
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Map Inbounder Fields to CRM Fields</Label>
        <p className="text-sm text-gray-600 mt-1">
          Connect each Inbounder field to the corresponding CRM field
        </p>
      </div>

      <div className="space-y-2 mb-4">
        {CRM_CONNECTIONS.salesforce && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">
              Salesforce connected · {SALESFORCE_FIELDS.length} fields available
            </span>
          </div>
        )}
        {CRM_CONNECTIONS.hubspot && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-gray-600" />
            <span className="text-gray-600">HubSpot connected</span>
          </div>
        )}
      </div>

      {inputFields.length === 0 && outputFields.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            No fields available. Complete previous steps first.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Input Fields Section */}
          {inputFields.length > 0 && (
            <div className="space-y-3">
              <div className="pb-2 border-b border-gray-200">
                <Label className="text-sm font-semibold text-gray-700">Input Fields</Label>
                <p className="text-xs text-gray-500 mt-1">Fields received from the lead source</p>
              </div>
              {inputFields.map((field) => {
                const mappedTo = mappings[field]
                const isMapped = !!mappedTo

                return (
                  <div
                    key={field}
                    className={`p-4 border-2 rounded-lg ${
                      isMapped ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{field}</span>
                          {isMapped && (
                            <CheckCircle2 className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <Select
                          value={mappedTo || '__unmapped__'}
                          onValueChange={(value) => {
                            if (value === '__unmapped__') {
                              removeMapping(field)
                            } else {
                              updateMapping(field, value)
                            }
                          }}
                        >
                          <SelectTrigger className={`border-gray-900 ${!isMapped ? 'border-gray-300' : ''}`}>
                            <SelectValue placeholder="Select CRM field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unmapped__">-- Not mapped --</SelectItem>
                            {availableCRMFields.map((crmField) => (
                              <SelectItem key={crmField} value={crmField}>
                                {crmField}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Output Fields Section */}
          {outputFields.length > 0 && (
            <div className="space-y-3">
              <div className="pb-2 border-b border-gray-200">
                <Label className="text-sm font-semibold text-gray-700">Output Fields</Label>
                <p className="text-xs text-gray-500 mt-1">Fields populated by AI agent after conversation review</p>
              </div>
              {outputFields.map((field) => {
                const mappedTo = mappings[field]
                const isMapped = !!mappedTo

                return (
                  <div
                    key={field}
                    className={`p-4 border-2 rounded-lg ${
                      isMapped ? 'border-gray-900 bg-gray-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{field}</span>
                          {isMapped && (
                            <CheckCircle2 className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1">
                        <Select
                          value={mappedTo || '__unmapped__'}
                          onValueChange={(value) => {
                            if (value === '__unmapped__') {
                              removeMapping(field)
                            } else {
                              updateMapping(field, value)
                            }
                          }}
                        >
                          <SelectTrigger className={`border-gray-900 ${!isMapped ? 'border-gray-300' : ''}`}>
                            <SelectValue placeholder="Select CRM field..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__unmapped__">-- Not mapped --</SelectItem>
                            {availableCRMFields.map((crmField) => (
                              <SelectItem key={crmField} value={crmField}>
                                {crmField}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {Object.keys(mappings).length > 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>{Object.keys(mappings).length}</strong> field{Object.keys(mappings).length !== 1 ? 's' : ''} mapped to CRM
          </p>
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Note:</strong> You can use webhooks without CRM mapping. CRM mapping is optional and allows automatic syncing to your connected CRM.
        </p>
      </div>
    </div>
  )
}

