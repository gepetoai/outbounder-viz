'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useGenerateCustomMessage } from '@/hooks/useCustomMessages'
import { Loader2 } from 'lucide-react'

// Available variables from the API
const VARIABLE_OPTIONS = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'headline', label: 'Headline' },
  { key: 'current_job', label: 'Current Job' },
  { key: 'company', label: 'Company' },
  { key: 'location', label: 'Location' },
  { key: 'industry', label: 'Industry' },
  { key: 'experience_years', label: 'Experience Years' },
  { key: 'education', label: 'Education' },
  { key: 'skills', label: 'Skills' },
]

interface AgentPanelProps {
  initialMessage?: string
  campaignCandidateId?: string
  onMessageGenerated?: (message: string) => void
}

export function AgentPanel({ initialMessage, campaignCandidateId, onMessageGenerated }: AgentPanelProps) {
  const [instructions, setInstructions] = useState('')
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])
  const [generatedOutput, setGeneratedOutput] = useState('')

  const { mutate: generateMessage, isPending, error } = useGenerateCustomMessage()

  // Set the generated output to the initial message when the panel opens
  useEffect(() => {
    if (initialMessage) {
      setGeneratedOutput(initialMessage);
    }
  }, [initialMessage]);

  const handleVariableToggle = (variableKey: string) => {
    if (selectedVariables.includes(variableKey)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variableKey))
    } else {
      setSelectedVariables([...selectedVariables, variableKey])
    }
  }

  const handleGenerate = () => {
    const candidateId = campaignCandidateId ? parseInt(campaignCandidateId, 10) : NaN
    if (!campaignCandidateId || isNaN(candidateId) || !instructions.trim() || selectedVariables.length === 0) {
      return
    }

    // Build context_variables object with true for selected, false for unselected
    const contextVariables: Record<string, boolean> = {}
    VARIABLE_OPTIONS.forEach((variable) => {
      contextVariables[variable.key] = selectedVariables.includes(variable.key)
    })

    generateMessage(
      {
        user_instructions: instructions,
        campaign_candidate_id: candidateId,
        context_variables: contextVariables,
      },
      {
        onSuccess: (data) => {
          setGeneratedOutput(data.generated_message)
          onMessageGenerated?.(data.generated_message)
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full p-4">
      {/* Instructions Section */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Enter your instructions for message generation..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Variables Section */}
      <div className="flex flex-col gap-2">
        <Label>Available Variables</Label>
        <div className="flex flex-col gap-3">
          {VARIABLE_OPTIONS.map((variable) => (
            <div key={variable.key} className="flex items-center space-x-2">
              <Checkbox
                id={variable.key}
                checked={selectedVariables.includes(variable.key)}
                onCheckedChange={() => handleVariableToggle(variable.key)}
              />
              <label
                htmlFor={variable.key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {variable.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        className="w-full"
        disabled={!campaignCandidateId || !instructions.trim() || selectedVariables.length === 0 || isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate'
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
          Error: {error instanceof Error ? error.message : 'Failed to generate message'}
        </div>
      )}

      {/* Missing Campaign Candidate ID Warning */}
      {!campaignCandidateId && (
        <div className="text-sm text-amber-600 p-2 bg-amber-50 rounded">
          No candidate selected. Please select a candidate from the table view first.
        </div>
      )}

      {/* Generated Output (Read-only) */}
      <div className="flex flex-col gap-2 flex-1">
        <Label htmlFor="output">Generated Output</Label>
        <Textarea
          id="output"
          placeholder="Generated message will appear here..."
          value={generatedOutput}
          readOnly
          className="min-h-[150px] resize-none bg-muted"
        />
      </div>
    </div>
  )
}
