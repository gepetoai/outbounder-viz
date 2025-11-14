'use client'

import { useState } from 'react'
import { SequencerHorizontal } from './SequencerHorizontal'
import { SequencerD3 } from './SequencerD3'
import { Sequencer } from './Sequencer'
import { SequencerFlowise } from './SequencerFlowise'
import { SequencerSupabase } from './SequencerSupabase'

const sequencerVariants = [
  { id: 'h', label: 'H', component: SequencerHorizontal },
  { id: 'd3', label: 'D3', component: SequencerD3 },
  { id: 'og', label: 'OG', component: Sequencer },
  { id: 'flowise', label: 'Flowise', component: SequencerFlowise },
  { id: 'supabase', label: 'Supabase', component: SequencerSupabase }
]

export function SequencerContainer () {
  const [activeVariant, setActiveVariant] = useState('h')

  const ActiveComponent = sequencerVariants.find(v => v.id === activeVariant)?.component

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b" style={{ borderColor: '#EEEEEE' }}>
        {sequencerVariants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => setActiveVariant(variant.id)}
            className="px-4 py-2 text-sm font-medium transition-colors relative"
            style={{
              color: activeVariant === variant.id ? '#1C1B20' : '#777D8D',
              borderTop: activeVariant === variant.id ? '2px solid #1C1B20' : '2px solid transparent',
              borderLeft: activeVariant === variant.id ? '2px solid #1C1B20' : '2px solid transparent',
              borderRight: activeVariant === variant.id ? '2px solid #1C1B20' : '2px solid transparent',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              marginBottom: activeVariant === variant.id ? '-2px' : '0',
              backgroundColor: activeVariant === variant.id ? '#FFFFFF' : 'transparent'
            }}
          >
            {variant.label}
          </button>
        ))}
      </div>

      {/* Active variant component */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  )
}

