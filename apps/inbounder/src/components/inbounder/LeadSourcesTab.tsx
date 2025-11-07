'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  Instagram,
  Linkedin,
  Globe,
  FileText,
  Pencil,
  Link2
} from 'lucide-react'
import { LeadSourceForm } from './LeadSourceForm'
import { AVAILABLE_ICONS, type IconName } from './IconPicker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

function getDefaultLeadSources (): LeadSource[] {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const twentyFiveDaysAgo = new Date()
  twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25)

  return [
    {
      id: 'instagram-ads-default',
      name: 'Instagram Ads',
      type: 'instagram-ads',
      icon: 'Instagram',
      connectionMethod: 'webhook',
      webhookUrl: 'https://api.inbounder.com/webhooks/instagram-ads-default',
      outputFields: [
        { id: 'qualification-score', name: 'Qualification Score' },
        { id: 'lead-quality', name: 'Lead Quality' },
        { id: 'interest-level', name: 'Interest Level' }
      ],
      crmMappings: {
        'Qualification Score': 'Description',
        'Lead Quality': 'LeadSource'
      },
      createdAt: thirtyDaysAgo.toISOString(),
      updatedAt: thirtyDaysAgo.toISOString()
    },
    {
      id: 'linkedin-ads-default',
      name: 'LinkedIn Ads',
      type: 'linkedin-ads',
      icon: 'Linkedin',
      connectionMethod: 'webhook',
      webhookUrl: 'https://api.inbounder.com/webhooks/linkedin-ads-default',
      outputFields: [
        { id: 'qualification-score', name: 'Qualification Score' },
        { id: 'lead-quality', name: 'Lead Quality' },
        { id: 'budget-range', name: 'Budget Range' },
        { id: 'decision-timeline', name: 'Decision Timeline' }
      ],
      crmMappings: {
        'Qualification Score': 'Description',
        'Lead Quality': 'LeadSource',
        'Budget Range': 'Description',
        'Decision Timeline': 'Description'
      },
      createdAt: twentyFiveDaysAgo.toISOString(),
      updatedAt: twentyFiveDaysAgo.toISOString()
    }
  ]
}

function getSourceIcon (iconName: IconName) {
  return AVAILABLE_ICONS[iconName] || Globe
}

function getSourceTypeLabel (type: LeadSourceType) {
  switch (type) {
    case 'instagram-ads':
      return 'Instagram Ads'
    case 'linkedin-ads':
      return 'LinkedIn Ads'
    case 'google-ads':
      return 'Google Ads'
    case 'website-form':
      return 'Website Form'
    case 'landing-page':
      return 'Landing Page'
    case 'paid-lead-source':
      return 'Paid Lead Source'
    default:
      return 'Lead Source'
  }
}

function formatDate (dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 30) return `${diffInDays} days ago`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths === 1) return '1 month ago'
  return `${diffInMonths} months ago`
}

export function LeadSourcesTab () {
  const [leadSources, setLeadSources] = useState<LeadSource[]>(getDefaultLeadSources())
  const [editingSource, setEditingSource] = useState<LeadSource | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; source: LeadSource | null }>({
    open: false,
    source: null
  })
  const [renameName, setRenameName] = useState('')
  const [renameIcon, setRenameIcon] = useState<IconName>('Globe')
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; sourceId: string | null }>({
    open: false,
    sourceId: null
  })

  const handleAddSource = () => {
    setEditingSource(null)
    setShowFormDialog(true)
  }

  const handleEditSource = (source: LeadSource) => {
    setEditingSource(source)
    setShowFormDialog(true)
  }

  const handleRenameSource = (source: LeadSource) => {
    setRenameName(source.name)
    setRenameIcon(source.icon)
    setRenameDialog({ open: true, source })
  }

  const confirmRename = () => {
    if (renameDialog.source) {
      setLeadSources(prev => prev.map(s =>
        s.id === renameDialog.source?.id
          ? { ...s, name: renameName, icon: renameIcon, updatedAt: new Date().toISOString() }
          : s
      ))
      setRenameDialog({ open: false, source: null })
    }
  }

  const handleDeleteSource = (sourceId: string) => {
    setDeleteConfirm({ open: true, sourceId })
  }

  const confirmDelete = () => {
    if (deleteConfirm.sourceId) {
      setLeadSources(prev => prev.filter(source => source.id !== deleteConfirm.sourceId))
      setDeleteConfirm({ open: false, sourceId: null })
    }
  }

  const handleSaveSource = (source: LeadSource) => {
    if (editingSource) {
      setLeadSources(prev => prev.map(s => s.id === source.id ? { ...source, updatedAt: new Date().toISOString() } : s))
    } else {
      setLeadSources(prev => [...prev, source])
    }
    setShowFormDialog(false)
    setEditingSource(null)
  }

  return (
    <div className="space-y-6">
      {/* Lead Sources List */}
      {leadSources.length === 0 ? (
        <Card className="border-gray-300">
          <CardContent className="p-16 text-center">
            <p className="text-gray-500 mb-2">No lead sources configured</p>
            <p className="text-sm text-gray-400 mb-8">
              Add your first lead source to get started
            </p>
            <Button
              onClick={handleAddSource}
              size="lg"
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 px-6 py-6 text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Lead Source
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {leadSources.map((source) => {
            const Icon = getSourceIcon(source.icon)
            
            return (
              <Card key={source.id} className="border-gray-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{source.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenameSource(source)}
                        className="hover:bg-gray-50"
                        title="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSource(source)}
                        className="hover:bg-gray-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSource(source.id)}
                        className="hover:bg-gray-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {source.connectionMethod === 'webhook' && source.webhookUrl && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <Link2 className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <p className="text-sm font-mono text-gray-900 truncate flex-1">
                        {source.webhookUrl}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
          
          {/* Add Lead Source Button */}
          <Card className="border-gray-300">
            <CardContent className="p-12 text-center">
              <Button
                onClick={handleAddSource}
                size="lg"
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 px-6 py-6 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Lead Source
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Form Dialog */}
      <LeadSourceForm
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        source={editingSource}
        onSave={handleSaveSource}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ open, source: null })}>
        <DialogContent className="bg-white border-2 border-gray-900">
          <DialogHeader>
            <DialogTitle>Rename Lead Source</DialogTitle>
            <DialogDescription>
              Change the name and icon for this lead source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">Source Name</Label>
              <Input
                id="rename-input"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                placeholder="e.g., Website Homepage Form"
                className="border-gray-900"
              />
            </div>
            <div className="space-y-3">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => {
                  const isSelected = renameIcon === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setRenameIcon(name as IconName)}
                      className={`p-3 rounded-lg border-2 transition-colors hover:bg-gray-50 ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-300'
                      }`}
                      title={name}
                    >
                      <Icon className="h-5 w-5 text-gray-700" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, source: null })}
              className="bg-white hover:bg-gray-50 border-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRename}
              disabled={!renameName.trim()}
              className="bg-black hover:bg-gray-800 text-white disabled:opacity-50"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, sourceId: null })}>
        <DialogContent className="bg-white border-2 border-gray-900">
          <DialogHeader>
            <DialogTitle>Delete Lead Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead source? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, sourceId: null })}
              className="bg-white hover:bg-gray-50 border-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

