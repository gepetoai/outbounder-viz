import { ReactNode } from 'react'

// AppLayout Types
export interface AppLayoutProps {
  children: ReactNode
  className?: string
}

export interface AppMainProps {
  children: ReactNode
  className?: string
}

// AppSidebar Types
export interface AppSidebarProps {
  appName: string
  children: ReactNode
  defaultOpen?: boolean
  userIcon?: string
  showUser?: boolean
  onToggle?: (isOpen: boolean) => void
}

// SidebarNavItem Types
export interface SidebarNavItemProps {
  id: string
  label: string
  iconPath: string
  isActive?: boolean
  isCollapsed?: boolean
  onClick?: () => void
}

// AppTitle Types
export interface AppTitleProps {
  title: string
  subtitle?: string
  className?: string
}

// AppHeader Types
export interface AppHeaderProps {
  logoSrc?: string
  logoAlt?: string
  children?: ReactNode
  className?: string
}

// Component Declarations
export function AppLayout (props: AppLayoutProps): JSX.Element
export function AppMain (props: AppMainProps): JSX.Element
export function AppSidebar (props: AppSidebarProps): JSX.Element
export function SidebarNavItem (props: SidebarNavItemProps): JSX.Element
export function AppTitle (props: AppTitleProps): JSX.Element
export function AppHeader (props: AppHeaderProps): JSX.Element


