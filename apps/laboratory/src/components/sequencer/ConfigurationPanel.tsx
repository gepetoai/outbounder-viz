import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Node } from 'reactflow'

interface ConfigurationPanelProps {
  nodeId: string
  node?: Node
  onClose: () => void
  onSave: (config: any) => void
}

export function ConfigurationPanel ({ nodeId, node, onClose, onSave }: ConfigurationPanelProps) {
  const [config, setConfig] = useState<any>(node?.data?.config || {})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setConfig(node?.data?.config || {})
    setHasChanges(false)
  }, [node])

  const handleChange = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(config)
    setHasChanges(false)
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }

  const renderConfigForm = () => {
    const actionType = node?.data?.actionType || node?.type

    switch (actionType) {
      case 'connection-request':
        return <ConnectionRequestConfig config={config} onChange={handleChange} />
      
      case 'send-message':
        return <SendMessageConfig config={config} onChange={handleChange} />
      
      case 'wait':
        return <WaitConfig config={config} onChange={handleChange} />
      
      case 'if-then':
        return <ConditionalConfig config={config} onChange={handleChange} />
      
      case 'update-salesforce':
        return <SalesforceConfig config={config} onChange={handleChange} />
      
      case 'webhook':
        return <WebhookConfig config={config} onChange={handleChange} />
      
      case 'like-post':
        return <LikePostConfig config={config} onChange={handleChange} />
      
      case 'view-profile':
        return <ViewProfileConfig config={config} onChange={handleChange} />
      
      case 'rescind-connection':
        return <RescindConnectionConfig config={config} onChange={handleChange} />
      
      case 'action':
        return <GenericActionConfig config={config} onChange={handleChange} />
      
      case 'conditional':
        return <GenericConditionalConfig config={config} onChange={handleChange} />
      
      case 'test':
        return <TestNodeConfig config={config} onChange={handleChange} />
      
      case 'wait':
        return <WaitConfig config={config} onChange={handleChange} />
      
      default:
        return (
          <div className="text-center py-8 text-gray-600">
            No configuration available for this action type.
          </div>
        )
    }
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-300 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-300 p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{node?.data?.label || 'Configure'}</h2>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderConfigForm()}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-300 p-4 flex gap-2">
        <Button onClick={handleSave} className="flex-1">
          Save
        </Button>
        <Button onClick={handleCancel} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}

// Individual config components for each action type

function ConnectionRequestConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>AI Instructions</Label>
        <Textarea
          value={config.instructions || ''}
          onChange={(e) => onChange('instructions', e.target.value)}
          placeholder="Enter instructions for the AI to generate personalized connection requests..."
          className="h-24"
        />
      </div>
      <div>
        <Label>Variables (click to select)</Label>
        <div className="text-xs text-gray-600 mb-2">Select profile fields to personalize the message</div>
        <div className="border border-gray-300 rounded p-2 space-y-1">
          {['Name', 'Job Title', 'Company', 'University', 'Location', 'Seniority'].map(v => (
            <label key={v} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.variables?.includes(v) || false}
                onChange={(e) => {
                  const vars = config.variables || []
                  onChange('variables', e.target.checked 
                    ? [...vars, v]
                    : vars.filter((x: string) => x !== v)
                  )
                }}
              />
              <span className="text-sm">{v}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Sample Outputs</Label>
        <Textarea
          value={config.samples || ''}
          onChange={(e) => onChange('samples', e.target.value)}
          placeholder="Example messages that AI can generate..."
          className="h-32"
        />
      </div>
      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-300">
        ℹ️ LinkedIn character limit: 300 characters
      </div>
    </div>
  )
}

function SendMessageConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Channel</Label>
        <Select value={config.channel || 'linkedin'} onValueChange={(v) => onChange('channel', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">LinkedIn Message</SelectItem>
            <SelectItem value="instagram">Instagram DM</SelectItem>
            <SelectItem value="messenger">Facebook Messenger</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>AI Instructions</Label>
        <Textarea
          value={config.instructions || ''}
          onChange={(e) => onChange('instructions', e.target.value)}
          placeholder="Instructions for generating the message..."
          className="h-24"
        />
      </div>
      <div>
        <Label>Variables</Label>
        <div className="border border-gray-300 rounded p-2 space-y-1">
          {['Name', 'Job Title', 'Company', 'University', 'Location'].map(v => (
            <label key={v} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.variables?.includes(v) || false}
                onChange={(e) => {
                  const vars = config.variables || []
                  onChange('variables', e.target.checked 
                    ? [...vars, v]
                    : vars.filter((x: string) => x !== v)
                  )
                }}
              />
              <span className="text-sm">{v}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Sample Outputs</Label>
        <Textarea
          value={config.samples || ''}
          onChange={(e) => onChange('samples', e.target.value)}
          placeholder="Example messages..."
          className="h-32"
        />
      </div>
    </div>
  )
}


function WaitConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Wait Duration</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            max="99"
            value={config.duration || 1}
            onChange={(e) => onChange('duration', parseInt(e.target.value))}
            className="flex-1"
          />
          <Select value={config.unit || 'minutes'} onValueChange={(v) => onChange('unit', v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">Minutes</SelectItem>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function ConditionalConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Condition</Label>
        <Select value={config.condition || ''} onValueChange={(v) => onChange('condition', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select condition..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message-replied">Message Replied</SelectItem>
            <SelectItem value="message-not-replied">Message Not Replied</SelectItem>
            <SelectItem value="connection-accepted">Connection Accepted</SelectItem>
            <SelectItem value="connection-ignored">Connection Ignored</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function SalesforceConfig ({ config, onChange }: any) {
  const placeholderFields = [
    'Lead Status',
    'Contact Owner',
    'Lead Source',
    'Company',
    'Industry',
    'Annual Revenue'
  ]

  return (
    <div className="space-y-4">
      <div>
        <Label>Output Mappings</Label>
        <div className="text-xs text-gray-600 mb-2">Map outputs to Salesforce fields</div>
        {placeholderFields.map(field => (
          <div key={field} className="flex gap-2 items-center mb-2">
            <Input
              placeholder="Output value..."
              value={config[`mapping_${field}`] || ''}
              onChange={(e) => onChange(`mapping_${field}`, e.target.value)}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-32">→ {field}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebhookConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>URL</Label>
        <Input
          value={config.url || ''}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://api.example.com/webhook"
        />
      </div>
      <div>
        <Label>Method</Label>
        <Select value={config.method || 'POST'} onValueChange={(v) => onChange('method', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Headers (JSON)</Label>
        <Textarea
          value={config.headers || ''}
          onChange={(e) => onChange('headers', e.target.value)}
          placeholder='{"Authorization": "Bearer token"}'
          className="h-20"
        />
      </div>
      <div>
        <Label>Payload (JSON)</Label>
        <Textarea
          value={config.payload || ''}
          onChange={(e) => onChange('payload', e.target.value)}
          placeholder='{"key": "value"}'
          className="h-32"
        />
      </div>
    </div>
  )
}

function LikePostConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Post Selection</Label>
        <Select value={config.postSelection || 'last-one'} onValueChange={(v) => onChange('postSelection', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-one">Last Post</SelectItem>
            <SelectItem value="specific-topic">Specific Topic</SelectItem>
            <SelectItem value="random">Random from Last X</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {config.postSelection === 'specific-topic' && (
        <div>
          <Label>Topic</Label>
          <Input
            value={config.topic || ''}
            onChange={(e) => onChange('topic', e.target.value)}
            placeholder="e.g., AI, technology, hiring..."
          />
        </div>
      )}
      {config.postSelection === 'random' && (
        <div>
          <Label>Number of Posts</Label>
          <Input
            type="number"
            min="1"
            max="50"
            value={config.postCount || 5}
            onChange={(e) => onChange('postCount', parseInt(e.target.value))}
          />
        </div>
      )}
    </div>
  )
}

function ViewProfileConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Time of Day</Label>
        <Input
          type="time"
          value={config.timeOfDay || '09:00'}
          onChange={(e) => onChange('timeOfDay', e.target.value)}
        />
      </div>
    </div>
  )
}

function RescindConnectionConfig ({ config, onChange }: any) {
  return (
    <div className="text-center py-8 text-gray-600">
      No configuration needed. This action will rescind the connection request.
    </div>
  )
}

function GenericActionConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Action Name</Label>
        <Input
          value={config.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Send email, Update database..."
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={config.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe what this action does..."
          className="h-24"
        />
      </div>
      <div>
        <Label>Parameters</Label>
        <Textarea
          value={config.parameters || ''}
          onChange={(e) => onChange('parameters', e.target.value)}
          placeholder="Enter parameters (JSON format)..."
          className="h-32"
        />
      </div>
      <div>
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          min="1"
          max="300"
          value={config.timeout || 30}
          onChange={(e) => onChange('timeout', parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}

function GenericConditionalConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Condition Name</Label>
        <Input
          value={config.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., Check response status..."
        />
      </div>
      <div>
        <Label>Condition Type</Label>
        <Select value={config.conditionType || 'equals'} onValueChange={(v) => onChange('conditionType', v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not-equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater-than">Greater Than</SelectItem>
            <SelectItem value="less-than">Less Than</SelectItem>
            <SelectItem value="exists">Exists</SelectItem>
            <SelectItem value="not-exists">Does Not Exist</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Field to Check</Label>
        <Input
          value={config.field || ''}
          onChange={(e) => onChange('field', e.target.value)}
          placeholder="e.g., response.status, user.age..."
        />
      </div>
      <div>
        <Label>Value to Compare</Label>
        <Input
          value={config.value || ''}
          onChange={(e) => onChange('value', e.target.value)}
          placeholder="Enter comparison value..."
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={config.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe this condition..."
          className="h-20"
        />
      </div>
    </div>
  )
}

function TestNodeConfig ({ config, onChange }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Test Action Name</Label>
        <Input
          value={config.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="e.g., API Call, Database Query..."
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={config.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe what this test action does..."
          className="h-24"
        />
      </div>
      <div>
        <Label>Test Parameters</Label>
        <Textarea
          value={config.parameters || ''}
          onChange={(e) => onChange('parameters', e.target.value)}
          placeholder="Enter test parameters (JSON format)..."
          className="h-32"
        />
      </div>
      <div>
        <Label>Expected Outcome</Label>
        <Input
          value={config.expectedOutcome || ''}
          onChange={(e) => onChange('expectedOutcome', e.target.value)}
          placeholder="What should happen?"
        />
      </div>
      <div>
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          min="1"
          max="300"
          value={config.timeout || 30}
          onChange={(e) => onChange('timeout', parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}

