'use client'

import { useState, useMemo } from 'react'
import { mockEmails, Email, ResponseType } from './mock-emails'
import { BRAND_COLORS } from '@/lib/brand-colors'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import styles from './InboxView.module.css'

const RESPONSE_TYPE_CONFIG = {
  'no-reply': { label: 'No Reply', icon: '/icons/circle-light.svg' },
  positive: { label: 'Positive', icon: '/icons/check-light.svg' },
  negative: { label: 'Negative', icon: '/icons/xmark-light.svg' }
}

export function InboxView () {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(mockEmails[0]?.id || null)
  const [selectedResponseTypes, setSelectedResponseTypes] = useState<ResponseType[]>([])
  const [senderNameFilter, setSenderNameFilter] = useState('')
  const [senderEmailFilter, setSenderEmailFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')

  // Filter emails based on all active filters
  const filteredEmails = useMemo(() => {
    return mockEmails.filter(email => {
      // Response type filter
      if (selectedResponseTypes.length > 0 && !selectedResponseTypes.includes(email.responseType)) {
        return false
      }

      // Sender name filter
      if (senderNameFilter && !email.sender.name.toLowerCase().includes(senderNameFilter.toLowerCase())) {
        return false
      }

      // Sender email filter
      if (senderEmailFilter && !email.sender.email.toLowerCase().includes(senderEmailFilter.toLowerCase())) {
        return false
      }

      // Date range filter
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter)
        if (email.timestamp < fromDate) {
          return false
        }
      }

      if (dateToFilter) {
        const toDate = new Date(dateToFilter)
        toDate.setHours(23, 59, 59, 999)
        if (email.timestamp > toDate) {
          return false
        }
      }

      return true
    })
  }, [selectedResponseTypes, senderNameFilter, senderEmailFilter, dateFromFilter, dateToFilter])

  const selectedEmail = filteredEmails.find(e => e.id === selectedEmailId) || filteredEmails[0]

  const toggleResponseType = (type: ResponseType) => {
    setSelectedResponseTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const clearAllFilters = () => {
    setSelectedResponseTypes([])
    setSenderNameFilter('')
    setSenderEmailFilter('')
    setDateFromFilter('')
    setDateToFilter('')
  }

  const hasActiveFilters = selectedResponseTypes.length > 0 || senderNameFilter || senderEmailFilter || dateFromFilter || dateToFilter

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (days === 1) {
      return 'Yesterday'
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getEmailSnippet = (body: string) => {
    if (!body) return 'No message content'
    return body.length > 100 ? body.substring(0, 100) + '...' : body
  }

  return (
    <div className={styles.container}>
      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <Image src="/icons/sliders-light.svg" alt="Filter" width={16} height={16} />
            Response Type
          </div>
          <div className={styles.filterChips}>
            {(Object.keys(RESPONSE_TYPE_CONFIG) as ResponseType[]).map(type => {
              const config = RESPONSE_TYPE_CONFIG[type]
              const isSelected = selectedResponseTypes.includes(type)
              return (
                <button
                  key={type}
                  onClick={() => toggleResponseType(type)}
                  className={`${styles.filterChip} ${isSelected ? styles.filterChipActive : ''}`}
                >
                  <Image src={config.icon} alt={config.label} width={14} height={14} />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.filterSection}>
          <div className={styles.filterLabel}>
            <Image src="/icons/user-light.svg" alt="User" width={16} height={16} />
            User Details
          </div>
          <div className={styles.userFilters}>
            <Input
              type="text"
              placeholder="Sender name..."
              value={senderNameFilter}
              onChange={(e) => setSenderNameFilter(e.target.value)}
              className={styles.filterInput}
            />
            <Input
              type="text"
              placeholder="Sender email..."
              value={senderEmailFilter}
              onChange={(e) => setSenderEmailFilter(e.target.value)}
              className={styles.filterInput}
            />
            <Input
              type="date"
              placeholder="From date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className={styles.filterInput}
            />
            <Input
              type="date"
              placeholder="To date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className={styles.filterInput}
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button onClick={clearAllFilters} className={styles.clearFilters}>
            <Image src="/icons/xmark-light.svg" alt="Clear" width={14} height={14} />
            Clear All Filters
          </button>
        )}
      </div>

      {/* Split Layout */}
      <div className={styles.splitLayout}>
        {/* Email List */}
        <div className={styles.emailList}>
          <div className={styles.emailListHeader}>
            <span className={styles.emailCount}>
              {filteredEmails.length} {filteredEmails.length === 1 ? 'email' : 'emails'}
            </span>
          </div>

          {filteredEmails.length === 0 ? (
            <div className={styles.emptyState}>
              <Image src="/icons/envelope-light.svg" alt="No emails" width={48} height={48} />
              <p>No emails match your filters</p>
            </div>
          ) : (
            <div className={styles.emailItems}>
              {filteredEmails.map(email => {
                const isSelected = email.id === selectedEmailId
                const config = RESPONSE_TYPE_CONFIG[email.responseType]
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmailId(email.id)}
                    className={`${styles.emailItem} ${isSelected ? styles.emailItemSelected : ''} ${!email.read ? styles.emailItemUnread : ''}`}
                  >
                    <div className={styles.emailItemHeader}>
                      <span className={styles.emailSender}>{email.sender.name}</span>
                      <span className={styles.emailTimestamp}>
                        {formatTimestamp(email.timestamp)}
                      </span>
                    </div>
                    <div className={styles.emailSubject}>
                      {!email.read && <span className={styles.unreadDot} />}
                      {email.subject}
                    </div>
                    <div className={styles.emailSnippet}>
                      {getEmailSnippet(email.body)}
                    </div>
                    <div className={styles.emailItemFooter}>
                      <div className={styles.responseBadge}>
                        <Image src={config.icon} alt={config.label} width={12} height={12} />
                        {config.label}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Email Preview */}
        <div className={styles.emailPreview}>
          {selectedEmail ? (
            <>
              <div className={styles.previewHeader}>
                <h2 className={styles.previewSubject}>{selectedEmail.subject}</h2>
                <div className={styles.previewMeta}>
                  <div className={styles.previewSender}>
                    <Image src="/icons/user-light.svg" alt="From" width={16} height={16} />
                    <div>
                      <div className={styles.senderName}>{selectedEmail.sender.name}</div>
                      <div className={styles.senderEmail}>{selectedEmail.sender.email}</div>
                    </div>
                  </div>
                  <div className={styles.previewRecipient}>
                    <Image src="/icons/envelope-light.svg" alt="To" width={16} height={16} />
                    <span>{selectedEmail.recipient}</span>
                  </div>
                  <div className={styles.previewTimestamp}>
                    <Image src="/icons/alarm-clock-light.svg" alt="Time" width={16} height={16} />
                    <span>{selectedEmail.timestamp.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className={styles.previewBadge}>
                    <Image
                      src={RESPONSE_TYPE_CONFIG[selectedEmail.responseType].icon}
                      alt={RESPONSE_TYPE_CONFIG[selectedEmail.responseType].label}
                      width={14}
                      height={14}
                    />
                    {RESPONSE_TYPE_CONFIG[selectedEmail.responseType].label}
                  </div>
                </div>
              </div>
              <div className={styles.previewBody}>
                {selectedEmail.body || <span className={styles.noContent}>No message content</span>}
              </div>
            </>
          ) : (
            <div className={styles.noSelection}>
              <Image src="/icons/envelope-light.svg" alt="Select email" width={64} height={64} />
              <p>Select an email to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

