'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

const VARIABLE_OPTIONS = [
  'First Name',
  'Last Name',
  'Headline',
  'Current Job',
  'Summary'
]

interface AgentPanelProps {
  initialMessage?: string
}

export function AgentPanel({ initialMessage }: AgentPanelProps) {
  const [instructions, setInstructions] = useState('')
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])
  const [generatedOutput, setGeneratedOutput] = useState('')

  // Set the generated output to the initial message when the panel opens
  useEffect(() => {
    if (initialMessage) {
      setGeneratedOutput(initialMessage)
    }
  }, [initialMessage])

  const handleVariableToggle = (variable: string) => {
    if (selectedVariables.includes(variable)) {
      setSelectedVariables(selectedVariables.filter(v => v !== variable))
    } else {
      setSelectedVariables([...selectedVariables, variable])
    }
  }

  const handleGenerate = () => {
    // Mock generation - in real implementation, this would call your AI agent
    const mockOutput = `Generated message based on:\nInstructions: ${instructions}\nVariables: ${selectedVariables.join(', ')}\n\nThis is a mock generated output. Connect to your AI agent for real generation.`
    setGeneratedOutput(mockOutput)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto px-4 py-2">
      {/* Instructions Input */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Enter instructions for the agent..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      {/* Variables Checkboxes */}
      <div className="flex flex-col gap-2">
        <Label>Variables</Label>
        <div className="space-y-3 pl-4">
          {VARIABLE_OPTIONS.map((variable) => (
            <div key={variable} className="flex items-center space-x-2">
              <Checkbox
                id={variable}
                checked={selectedVariables.includes(variable)}
                onCheckedChange={() => handleVariableToggle(variable)}
              />
              <label
                htmlFor={variable}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {variable}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        className="w-full"
        disabled={!instructions.trim() || selectedVariables.length === 0}
      >
        Generate
      </Button>

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
