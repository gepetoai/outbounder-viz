'use client'

export function ComponentsShowcase () {
  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #EEEEEE',
    padding: '24px',
    marginBottom: '24px'
  }

  const titleStyle = {
    color: '#1C1B20',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px'
  }

  const descriptionStyle = {
    color: '#777D8D',
    fontSize: '14px',
    marginBottom: '16px'
  }

  const codeBlockStyle = {
    backgroundColor: '#F5F5F5',
    padding: '16px',
    borderRadius: '8px',
    overflowX: 'auto' as const,
    fontSize: '14px',
    fontFamily: 'monospace',
    color: '#40404C'
  }

  const listStyle = {
    color: '#40404C',
    fontSize: '14px',
    lineHeight: '1.6'
  }
  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Introduction */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ color: '#1C1B20', fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
          248.AI Application Components
        </h2>
        <p style={{ color: '#777D8D', fontSize: '16px' }}>
          Generalized, reusable components for building consistent 248.AI applications.
        </p>
      </div>

      {/* AppLayout & AppMain */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>AppLayout & AppMain</h3>
        <p style={descriptionStyle}>
          Full-screen container and main content wrapper
        </p>
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Usage</h4>
          <pre style={codeBlockStyle}>
{`import { AppLayout, AppMain } from '@248/ui'

<AppLayout>
  <AppSidebar>...</AppSidebar>
  <AppMain>
    <YourContent />
  </AppMain>
</AppLayout>`}
          </pre>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Features</h4>
          <ul style={{ ...listStyle, paddingLeft: '20px' }}>
            <li>Full-screen flex container</li>
            <li>248.AI background color (#FAFAFA)</li>
            <li>Handles overflow and scrolling</li>
            <li>24px padding on main content</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Visual Structure</h4>
          <div style={{ border: '1px solid #EEEEEE', borderRadius: '8px', padding: '16px', backgroundColor: '#FAFAFA' }}>
            <div style={{ display: 'flex', gap: '8px', height: '120px' }}>
              <div style={{ 
                width: '80px', 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #EEEEEE', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#777D8D'
              }}>
                Sidebar
              </div>
              <div style={{ 
                flex: 1, 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #EEEEEE', 
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#777D8D'
              }}>
                Main Content (AppMain)
              </div>
            </div>
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#777D8D', textAlign: 'center' }}>
              AppLayout structure
            </p>
          </div>
        </div>
      </div>

      {/* AppSidebar */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>AppSidebar</h3>
        <p style={descriptionStyle}>
          Collapsible navigation sidebar with header and user section
        </p>
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Usage</h4>
          <pre style={codeBlockStyle}>
{`import { AppSidebar } from '@248/ui'

<AppSidebar
  appName="My App"
  defaultOpen={true}
  onToggle={(isOpen) => setSidebarOpen(isOpen)}
  showUser={true}
>
  {/* SidebarNavItem components */}
</AppSidebar>`}
          </pre>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Props</h4>
          <ul style={{ ...listStyle, paddingLeft: '20px' }}>
            <li><code>appName: string</code> - Required: Application name in header</li>
            <li><code>children: ReactNode</code> - Required: Navigation items</li>
            <li><code>defaultOpen?: boolean</code> - Optional: Initial open state (default: true)</li>
            <li><code>onToggle?: (isOpen: boolean) =&gt; void</code> - Optional: Toggle callback</li>
            <li><code>showUser?: boolean</code> - Optional: Show user section (default: true)</li>
            <li><code>userIcon?: string</code> - Optional: User icon path</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Features</h4>
          <ul style={{ ...listStyle, paddingLeft: '20px' }}>
            <li>Smooth collapse animation (256px → 48px)</li>
            <li>Auto-switching hamburger/close icons</li>
            <li>User avatar section at bottom</li>
            <li>White background with subtle borders</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Example</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Open State */}
            <div>
              <p style={{ fontSize: '12px', color: '#777D8D', marginBottom: '8px' }}>Open (256px)</p>
              <div style={{ 
                maxWidth: '400px',
                backgroundColor: '#FFFFFF', 
                border: '1px solid #EEEEEE', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #EEEEEE',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1C1B20' }}>Laboratory</span>
                  <span style={{ fontSize: '12px', color: '#777D8D' }}>✕</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {['Dashboard', 'Search', 'Settings'].map((item, i) => (
                    <div key={i} style={{ 
                      padding: '8px 12px',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      backgroundColor: i === 0 ? '#1C1B20' : 'transparent',
                      color: i === 0 ? '#FFFFFF' : '#40404C',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>✦</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Collapsed State */}
            <div>
              <p style={{ fontSize: '12px', color: '#777D8D', marginBottom: '8px' }}>Collapsed (48px)</p>
              <div style={{ 
                width: '80px',
                backgroundColor: '#FFFFFF', 
                border: '1px solid #EEEEEE', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '12px', 
                  borderBottom: '1px solid #EEEEEE',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: '#777D8D' }}>☰</span>
                </div>
                <div style={{ padding: '8px' }}>
                  {['✦', '🔍', '⚙'].map((icon, i) => (
                    <div key={i} style={{ 
                      padding: '8px',
                      marginBottom: '4px',
                      borderRadius: '4px',
                      backgroundColor: i === 0 ? '#1C1B20' : 'transparent',
                      color: i === 0 ? '#FFFFFF' : '#40404C',
                      fontSize: '13px',
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SidebarNavItem */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>SidebarNavItem</h3>
        <p style={descriptionStyle}>
          Individual navigation button with icon and label
        </p>
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Usage</h4>
          <pre style={codeBlockStyle}>
{`import { SidebarNavItem } from '@248/ui'

<SidebarNavItem
  id="dashboard"
  label="Dashboard"
  iconPath="/icons/sparkles-dark.svg"
  isActive={activeTab === 'dashboard'}
  isCollapsed={!sidebarOpen}
  onClick={() => setActiveTab('dashboard')}
/>`}
          </pre>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Props</h4>
          <ul style={{ ...listStyle, paddingLeft: '20px' }}>
            <li><code>id: string</code> - Required: Unique identifier</li>
            <li><code>label: string</code> - Required: Display text</li>
            <li><code>iconPath: string</code> - Required: Path to icon SVG (e.g., "/icons/sparkles-dark.svg")</li>
            <li><code>isActive?: boolean</code> - Optional: Active state (default: false)</li>
            <li><code>isCollapsed?: boolean</code> - Optional: Collapsed state (default: false)</li>
            <li><code>onClick?: () =&gt; void</code> - Optional: Click handler</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Smart Icon Switching</h4>
          <div style={{ padding: '12px', backgroundColor: '#F5F5F5', borderRadius: '6px' }}>
            <p style={{ ...listStyle, marginBottom: '8px' }}>
              Icons automatically switch between dark and light versions based on the active state:
            </p>
            <ul style={{ ...listStyle, paddingLeft: '20px', fontSize: '13px' }}>
              <li><strong>Inactive:</strong> Uses dark icon (e.g., <code>sparkles-dark.svg</code>) on light background</li>
              <li><strong>Active:</strong> Automatically switches to light icon (e.g., <code>sparkles-light.svg</code>) on dark background</li>
            </ul>
            <p style={{ ...listStyle, marginTop: '8px', fontSize: '13px', fontStyle: 'italic' }}>
              Simply provide the dark icon path - the component handles the rest!
            </p>
          </div>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Available Icons</h4>
          <p style={{ color: '#777D8D', fontSize: '14px', marginBottom: '8px' }}>
            From <code>/Branding Assets/Custom Icons/Dark/SVGs/</code>:
          </p>
          <ul style={{ ...listStyle, paddingLeft: '20px', fontSize: '14px' }}>
            <li><code>sparkles-dark.svg</code> - AI/Magic features</li>
            <li><code>address-book-dark.svg</code> - Contacts/Inbox</li>
            <li><code>magnifying-glass-dark.svg</code> - Search</li>
            <li><code>sliders-dark.svg</code> - Controls/Settings</li>
            <li><code>bars-dark.svg</code> - List/Table view</li>
            <li><code>grid-dark.svg</code> - Card/Grid view</li>
            <li><code>bolt-dark.svg</code> - Power/Speed</li>
            <li><code>gear-dark.svg</code> - Settings</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Examples</h4>
          <div style={{ border: '1px solid #EEEEEE', borderRadius: '8px', padding: '16px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Active Item */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: '#1C1B20',
                color: '#FFFFFF',
                fontSize: '14px'
              }}>
                <span>✦</span>
                <span>Dashboard (Active)</span>
              </div>
              {/* Inactive Items */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#40404C',
                fontSize: '14px'
              }}>
                <span>🔍</span>
                <span>Search</span>
              </div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: '#40404C',
                fontSize: '14px'
              }}>
                <span>⚙</span>
                <span>Settings</span>
              </div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#777D8D', textAlign: 'center' }}>
              Active state uses Midnight background
            </p>
          </div>
        </div>
      </div>

      {/* AppTitle */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>AppTitle</h3>
        <p style={descriptionStyle}>
          Page title with optional subtitle
        </p>
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Usage</h4>
          <pre style={codeBlockStyle}>
{`import { AppTitle } from '@248/ui'

<AppTitle 
  title="Dashboard"
  subtitle="Overview of your workspace"
/>`}
          </pre>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Example</h4>
          <div style={{ border: '1px solid #EEEEEE', borderRadius: '8px', padding: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1C1B20' }}>
              Dashboard
            </h1>
            <p style={{ marginTop: '4px', fontSize: '14px', color: '#777D8D' }}>
              Overview of your workspace
            </p>
          </div>
        </div>
      </div>

      {/* AppHeader */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>AppHeader (Optional)</h3>
        <p style={descriptionStyle}>
          Top navigation bar with logo and actions
        </p>
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Usage</h4>
          <pre style={codeBlockStyle}>
{`import { AppHeader } from '@248/ui'

<AppHeader 
  logoSrc="/icons/248ai-logo-light.svg"
  logoAlt="248.AI"
>
  <Button>Settings</Button>
  <UserMenu />
</AppHeader>`}
          </pre>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Features</h4>
          <ul style={{ ...listStyle, paddingLeft: '20px' }}>
            <li>Fixed 64px height</li>
            <li>White background with subtle border</li>
            <li>Logo on left, custom content on right</li>
            <li>Follows 248.AI header pattern</li>
          </ul>
        </div>
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ color: '#1C1B20', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Example</h4>
          <div style={{ border: '1px solid #EEEEEE', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
            <div style={{ 
              height: '64px',
              borderBottom: '1px solid #EEEEEE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px'
            }}>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#1C1B20',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>◉</span>
                <span>248.AI</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button style={{ 
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #EEEEEE',
                  backgroundColor: 'transparent',
                  color: '#1C1B20',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}>
                  Settings
                </button>
                <div style={{ 
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#EEEEEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  👤
                </div>
              </div>
            </div>
            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#777D8D' }}>
              Optional top navigation bar
            </div>
          </div>
        </div>
      </div>

      {/* Branding Colors */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>248.AI Color Palette</h3>
        <p style={descriptionStyle}>
          Monochromatic grayscale system used throughout components
        </p>
        <div style={{ marginTop: '16px' }}>
          {[
            { color: '#1C1B20', name: 'Midnight', desc: '#1C1B20 - Headers, active states' },
            { color: '#40404C', name: 'Shadow', desc: '#40404C - Body text' },
            { color: '#777D8D', name: 'Sky', desc: '#777D8D - Supporting text' },
            { color: '#B9B8C0', name: 'Sheen', desc: '#B9B8C0 - Subtle elements' },
            { color: '#EEEEEE', name: 'Glare', desc: '#EEEEEE - Borders, backgrounds' },
            { color: '#FFFFFF', name: 'White', desc: '#FFFFFF - Main backgrounds' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                backgroundColor: item.color,
                border: '1px solid #EEEEEE',
                flexShrink: 0
              }} />
              <div>
                <p style={{ fontWeight: '600', color: '#1C1B20', fontSize: '14px' }}>{item.name}</p>
                <p style={{ color: '#777D8D', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Links */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Documentation</h3>
        <p style={descriptionStyle}>
          Complete guides and resources
        </p>
        <ul style={{ color: '#40404C', fontSize: '14px', lineHeight: '2' }}>
          {[
            { file: '/packages/ui/QUICK_START.md', desc: '5-minute setup guide' },
            { file: '/packages/ui/APP_COMPONENTS_README.md', desc: 'Complete API documentation' },
            { file: '/packages/ui/COMPONENT_HIERARCHY.md', desc: 'Architecture and structure' },
            { file: '/Branding Assets/248-BRANDING-GUIDE.md', desc: 'Complete branding guidelines' }
          ].map((doc, i) => (
            <li key={i} style={{ marginBottom: '8px' }}>
              <code style={{ fontSize: '13px', backgroundColor: '#F5F5F5', padding: '4px 8px', borderRadius: '4px' }}>
                {doc.file}
              </code>
              <span style={{ marginLeft: '8px', color: '#777D8D' }}>
                - {doc.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Live Example */}
      <div style={cardStyle}>
        <h3 style={titleStyle}>Live Example</h3>
        <p style={descriptionStyle}>
          This Laboratory app uses these components!
        </p>
        <p style={{ color: '#40404C', fontSize: '14px', marginTop: '16px' }}>
          The layout you're viewing right now is built with:
        </p>
        <ul style={{ ...listStyle, paddingLeft: '20px', marginTop: '12px' }}>
          <li><code>AppLayout</code> - The full-screen container</li>
          <li><code>AppSidebar</code> - The collapsible left sidebar</li>
          <li><code>SidebarNavItem</code> - Each navigation button</li>
          <li><code>AppMain</code> - This content area</li>
          <li><code>AppTitle</code> - The "Components" heading above</li>
        </ul>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#777D8D' }}>
          View the source at: <code style={{ backgroundColor: '#F5F5F5', padding: '2px 6px', borderRadius: '4px' }}>apps/laboratory/src/app/page.tsx</code>
        </p>
      </div>
    </div>
  )
}

