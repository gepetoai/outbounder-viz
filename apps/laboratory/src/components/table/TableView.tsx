'use client'

import { useState } from 'react'
import { DataTable, TableColumn } from './DataTable'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { BRAND_COLORS } from '@/lib/brand-colors'
import styles from './TableView.module.css'

// Define the data type
interface Candidate {
  id: string
  name: string
  photo: string
  title: string
  company: string
  location: string
  education: string
  status1: string
  status2: string
  [key: string]: any // Allow dynamic columns
}

// Extended mock data for pagination
const allMockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    photo: 'https://i.pravatar.cc/150?img=1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    education: 'Stanford University',
    status1: 'Active',
    status2: 'Qualified'
  },
  {
    id: '2',
    name: 'Michael Chen',
    photo: 'https://i.pravatar.cc/150?img=2',
    title: 'Product Manager',
    company: 'Innovation Labs',
    location: 'New York, NY',
    education: 'MIT',
    status1: 'Active',
    status2: 'Interviewed'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    photo: 'https://i.pravatar.cc/150?img=3',
    title: 'UX Designer',
    company: 'Design Studio',
    location: 'Austin, TX',
    education: 'UC Berkeley',
    status1: 'Pending',
    status2: 'Screening'
  },
  {
    id: '4',
    name: 'David Kim',
    photo: 'https://i.pravatar.cc/150?img=4',
    title: 'Data Scientist',
    company: 'Analytics Inc',
    location: 'Seattle, WA',
    education: 'Carnegie Mellon',
    status1: 'Inactive',
    status2: 'Archived'
  },
  {
    id: '5',
    name: 'Jessica Williams',
    photo: 'https://i.pravatar.cc/150?img=5',
    title: 'Marketing Lead',
    company: 'Growth Co',
    location: 'Boston, MA',
    education: 'Harvard University',
    status1: 'Active',
    status2: 'Offer Sent'
  },
  {
    id: '6',
    name: 'James Anderson',
    photo: 'https://i.pravatar.cc/150?img=6',
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    location: 'Portland, OR',
    education: 'Georgia Tech',
    status1: 'Active',
    status2: 'Qualified'
  },
  {
    id: '7',
    name: 'Maria Garcia',
    photo: 'https://i.pravatar.cc/150?img=7',
    title: 'Sales Director',
    company: 'Revenue Labs',
    location: 'Miami, FL',
    education: 'Northwestern',
    status1: 'Active',
    status2: 'Interviewed'
  },
  {
    id: '8',
    name: 'Robert Taylor',
    photo: 'https://i.pravatar.cc/150?img=8',
    title: 'Backend Developer',
    company: 'API Solutions',
    location: 'Denver, CO',
    education: 'UT Austin',
    status1: 'Pending',
    status2: 'Technical Test'
  },
  {
    id: '9',
    name: 'Lisa Martinez',
    photo: 'https://i.pravatar.cc/150?img=9',
    title: 'Frontend Developer',
    company: 'Web Innovators',
    location: 'Los Angeles, CA',
    education: 'UCLA',
    status1: 'Active',
    status2: 'Qualified'
  },
  {
    id: '10',
    name: 'Thomas Brown',
    photo: 'https://i.pravatar.cc/150?img=10',
    title: 'QA Engineer',
    company: 'Quality First',
    location: 'Chicago, IL',
    education: 'University of Illinois',
    status1: 'Active',
    status2: 'Screening'
  },
  {
    id: '11',
    name: 'Amanda Wilson',
    photo: 'https://i.pravatar.cc/150?img=11',
    title: 'Product Designer',
    company: 'Creative Labs',
    location: 'San Diego, CA',
    education: 'RISD',
    status1: 'Active',
    status2: 'Portfolio Review'
  },
  {
    id: '12',
    name: 'Kevin Lee',
    photo: 'https://i.pravatar.cc/150?img=12',
    title: 'Machine Learning Engineer',
    company: 'AI Ventures',
    location: 'Palo Alto, CA',
    education: 'Stanford University',
    status1: 'Active',
    status2: 'Final Round'
  }
]

export function TableView() {
  const [visibleCount, setVisibleCount] = useState(8)
  const [customColumns, setCustomColumns] = useState<Array<{ key: string; label: string }>>([])
  const [columnCounter, setColumnCounter] = useState(1)

  const visibleCandidates = allMockCandidates.slice(0, visibleCount)
  const hasMore = visibleCount < allMockCandidates.length

  const handleViewMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, allMockCandidates.length))
  }

  const handleAddColumn = () => {
    const newKey = `column_${columnCounter}`
    const newLabel = `Column ${columnCounter}`
    setCustomColumns(prev => [...prev, { key: newKey, label: newLabel }])
    setColumnCounter(prev => prev + 1)
  }

  const handleRenameColumn = (oldKey: string, newLabel: string) => {
    setCustomColumns(prev =>
      prev.map(col => (col.key === oldKey ? { ...col, label: newLabel } : col))
    )
  }

  const handleDownloadCSV = () => {
    console.log('Downloading CSV...')
    const headers = ['Name', 'Title', 'Company', 'Location', 'Education', 'Status 1', 'Status 2', ...customColumns.map(col => col.label)]
    const csv = [
      headers.join(','),
      ...visibleCandidates.map(c =>
        [c.name, c.title, c.company, c.location, c.education, c.status1, c.status2, ...customColumns.map(() => '')].join(',')
      )
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidates.csv'
    a.click()
  }

  const handleCandidateClick = (candidate: Candidate) => {
    console.log('Clicked candidate:', candidate)
  }

  // Base columns
  const baseColumns: TableColumn<Candidate>[] = [
    {
      key: 'photo',
      label: '',
      width: '60px',
      className: 'pl-2',
      render: (candidate) => (
        <div className={styles.photoCell}>
          <img
            src={candidate.photo}
            alt={candidate.name}
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (candidate) => (
        <span className={styles.nameCell}>
          {candidate.name}
        </span>
      )
    },
    {
      key: 'title',
      label: 'Title',
      render: (candidate) => (
        <span className={styles.textCell}>{candidate.title}</span>
      )
    },
    {
      key: 'company',
      label: 'Company',
      render: (candidate) => (
        <span className={styles.textCell}>{candidate.company}</span>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (candidate) => (
        <div className={styles.iconText}>
          <Image
            src="/icons/circle-light.svg"
            alt="Location"
            width={12}
            height={12}
          />
          <span>{candidate.location}</span>
        </div>
      )
    },
    {
      key: 'education',
      label: 'Education',
      render: (candidate) => (
        <div className={styles.iconText}>
          <Image
            src="/icons/book-light.svg"
            alt="Education"
            width={12}
            height={12}
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
        <span className={`${styles.statusBadge} ${styles.statusPrimary}`}>
          {candidate.status1}
        </span>
      )
    },
    {
      key: 'status2',
      label: 'Status 2',
      width: '120px',
      render: (candidate) => (
        <span className={`${styles.statusBadge} ${styles.statusSecondary}`}>
          {candidate.status2}
        </span>
      )
    }
  ]

  // Add custom columns
  const dynamicColumns: TableColumn<Candidate>[] = customColumns.map(col => ({
    key: col.key,
    label: col.label,
    width: '150px',
    editable: true,
    onRename: handleRenameColumn,
    render: (candidate) => (
      <span className="text-sm" style={{ color: BRAND_COLORS.sheen }}>
        -
      </span>
    )
  }))

  const allColumns = [...baseColumns, ...dynamicColumns]

  return (
    <div className="w-full space-y-4">
      {/* Table */}
      <DataTable
        data={visibleCandidates}
        columns={allColumns}
        getRowId={(candidate) => candidate.id}
        onRowClick={handleCandidateClick}
        selectable={false}
        bulkActions={[]}
        onDownload={handleDownloadCSV}
        showAddColumn={true}
        onAddColumn={handleAddColumn}
        emptyMessage="No candidates found"
      />

      {/* View More Button */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleViewMore}
            className={styles.viewMoreButton}
          >
            View More Rows ({allMockCandidates.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {!hasMore && visibleCandidates.length > 8 && (
        <div className="flex justify-center pt-2">
          <p className={styles.allLoadedText}>
            All {allMockCandidates.length} rows loaded
          </p>
        </div>
      )}
    </div>
  )
}
