'use client'

import { DataTable, TableColumn, TableAction } from './DataTable'
import Image from 'next/image'

// Example: Candidate type (can be any data structure)
export interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  education: string
  status1: string
  status2: string
}

interface CandidateTableProps {
  candidates: Candidate[]
  onCandidateClick?: (candidate: Candidate) => void
  onDownloadCSV?: () => void
  additionalColumns?: { key: string; label: string; render?: (candidate: Candidate) => React.ReactNode }[]
}

export function CandidateTable({
  candidates,
  onCandidateClick,
  onDownloadCSV,
  additionalColumns = []
}: CandidateTableProps) {
  // Define columns with custom renderers
  const columns: TableColumn<Candidate>[] = [
    {
      key: 'photo',
      label: '',
      width: '60px',
      className: 'pl-2',
      render: (candidate) => (
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors">
          <img
            src={candidate.photo}
            alt={candidate.name}
            className="w-full h-full object-cover grayscale"
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (candidate) => (
        <span className="font-medium" style={{ color: '#1C1B20' }}>
          {candidate.name}
        </span>
      )
    },
    {
      key: 'title',
      label: 'Title',
      render: (candidate) => (
        <span style={{ color: '#40404C' }}>{candidate.title}</span>
      )
    },
    {
      key: 'company',
      label: 'Company',
      render: (candidate) => (
        <span style={{ color: '#40404C' }}>{candidate.company}</span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (candidate) => (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#777D8D' }}>
          <Image
            src="/icons/circle-light.svg"
            alt="Location"
            width={12}
            height={12}
            className="flex-shrink-0"
          />
          <span>{candidate.location}</span>
        </div>
      )
    },
    {
      key: 'education',
      label: 'Education',
      render: (candidate) => (
        <div className="flex items-center gap-1.5 text-sm" style={{ color: '#777D8D' }}>
          <Image
            src="/icons/book-light.svg"
            alt="Education"
            width={12}
            height={12}
            className="flex-shrink-0"
          />
          <span className="truncate max-w-[200px]">{candidate.education}</span>
        </div>
      )
    },
    {
      key: 'status1',
      label: 'Status 1',
      width: '120px',
      render: (candidate) => (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: '#F5F5F5', color: '#40404C' }}
        >
          {candidate.status1}
        </span>
      )
    },
    {
      key: 'status2',
      label: 'Status 2',
      width: '120px',
      render: (candidate) => (
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: '#EEEEEE', color: '#777D8D' }}
        >
          {candidate.status2}
        </span>
      )
    }
  ]

  // Add any additional columns
  const allColumns = [...columns, ...additionalColumns]

  return (
    <DataTable
      data={candidates}
      columns={allColumns}
      getRowId={(candidate) => candidate.id}
      onRowClick={onCandidateClick}
      selectable={false}
      bulkActions={[]}
      onDownload={onDownloadCSV}
      emptyMessage="No candidates found"
    />
  )
}

