'use client'

import { useState } from 'react'
import { StatCard } from '../cards/StatCard'
import { ContentCard } from '../cards/ContentCard'
import { MetricGrid } from '../cards/MetricGrid'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export function CardsDemo () {
  const [activeMetric, setActiveMetric] = useState<string | null>('metric1')

  return (
    <div className="space-y-8 pb-8">
      {/* StatCard Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          StatCard Component
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Display metrics, counts, and statistics with optional icons and progress bars
        </p>
        
        <MetricGrid columns={3}>
          <StatCard
            value={125}
            label="Total Items"
            icon={
              <Image
                src="/icons/bars-dark.svg"
                alt="Items"
                width={24}
                height={24}
              />
            }
            onClick={() => setActiveMetric('metric1')}
            isActive={activeMetric === 'metric1'}
          />
          <StatCard
            value="87%"
            label="Completion"
            icon={
              <Image
                src="/icons/check-dark.svg"
                alt="Check"
                width={24}
                height={24}
              />
            }
            onClick={() => setActiveMetric('metric2')}
            isActive={activeMetric === 'metric2'}
            showProgressBar
            progressPercent={87}
          />
          <StatCard
            value={42}
            label="Pending"
            icon={
              <Image
                src="/icons/circle-dark.svg"
                alt="Pending"
                width={24}
                height={24}
              />
            }
            onClick={() => setActiveMetric('metric3')}
            isActive={activeMetric === 'metric3'}
            variant="outlined"
          />
        </MetricGrid>
      </section>

      {/* ContentCard Examples */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          ContentCard Component
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Flexible content containers with optional headers and footers
        </p>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Default Card */}
          <ContentCard
            header={
              <h4 className="font-semibold" style={{ color: '#1C1B20' }}>
                Default Card
              </h4>
            }
          >
            <p className="text-sm" style={{ color: '#40404C' }}>
              This is a default content card with a header. It uses medium padding and default shadow.
            </p>
          </ContentCard>

          {/* Elevated Card with Footer */}
          <ContentCard
            variant="elevated"
            header={
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/briefcase-light.svg"
                  alt="Business"
                  width={20}
                  height={20}
                />
                <h4 className="font-semibold" style={{ color: '#1C1B20' }}>
                  Elevated Card
                </h4>
              </div>
            }
            footer={
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-[#1C1B20] hover:bg-[#40404C] text-white"
                >
                  Confirm
                </Button>
              </div>
            }
          >
            <p className="text-sm mb-4" style={{ color: '#40404C' }}>
              Elevated variant with header, content, and footer. Perfect for modals or important actions.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#777D8D' }}>Status:</span>
                <span style={{ color: '#40404C' }} className="font-medium">Active</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#777D8D' }}>Created:</span>
                <span style={{ color: '#40404C' }} className="font-medium">Nov 12, 2025</span>
              </div>
            </div>
          </ContentCard>
        </div>
      </section>

      {/* Combined Example */}
      <section className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: '#1C1B20' }}>
          Combined Example
        </h3>
        <p className="text-sm" style={{ color: '#777D8D' }}>
          Cards working together in a dashboard layout
        </p>
        
        <MetricGrid columns={4}>
          <StatCard
            value={1247}
            label="Users"
            icon={
              <Image
                src="/icons/users-dark.svg"
                alt="Users"
                width={24}
                height={24}
              />
            }
          />
          <StatCard
            value={89}
            label="Active"
            icon={
              <Image
                src="/icons/bolt-dark.svg"
                alt="Active"
                width={24}
                height={24}
              />
            }
            variant="filled"
          />
          <StatCard
            value={523}
            label="Tasks"
            icon={
              <Image
                src="/icons/list-dark.svg"
                alt="Tasks"
                width={24}
                height={24}
              />
            }
          />
          <StatCard
            value="95%"
            label="Success Rate"
            icon={
              <Image
                src="/icons/sparkles-dark.svg"
                alt="Success"
                width={24}
                height={24}
              />
            }
            showProgressBar
            progressPercent={95}
          />
        </MetricGrid>

        <ContentCard variant="flat" padding="lg">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/icons/grid-dark.svg"
                alt="Grid"
                width={48}
                height={48}
                className="opacity-40"
              />
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2" style={{ color: '#1C1B20' }}>
                Ready to Use
              </h4>
              <p className="text-sm" style={{ color: '#777D8D' }}>
                These components are ready to be imported and used in any application
              </p>
            </div>
            <div className="pt-4">
              <div className="inline-block px-4 py-2 rounded-md bg-gray-100 border border-gray-200">
                <code className="text-xs font-mono" style={{ color: '#40404C' }}>
                  import &#123; StatCard, ContentCard, MetricGrid &#125; from '@/components/cards'
                </code>
              </div>
            </div>
          </div>
        </ContentCard>
      </section>
    </div>
  )
}

