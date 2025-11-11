import { 
  UserPlus, 
  Eye, 
  Heart, 
  MessageSquare, 
  Mail,
  Clock, 
  GitBranch, 
  UserMinus,
  Database,
  Webhook as WebhookIcon,
  X,
  LucideIcon
} from 'lucide-react'

export interface ActionType {
  id: string
  label: string
  icon: LucideIcon
  category: 'linkedin' | 'messaging' | 'delay' | 'logic' | 'integration'
}

export const actionTypes: ActionType[] = [
  // LinkedIn Actions
  {
    id: 'connection-request',
    label: 'Connection Request',
    icon: UserPlus,
    category: 'linkedin'
  },
  {
    id: 'view-profile',
    label: 'View Profile',
    icon: Eye,
    category: 'linkedin'
  },
  {
    id: 'like-post',
    label: 'Like Post',
    icon: Heart,
    category: 'linkedin'
  },
  {
    id: 'rescind-connection',
    label: 'Rescind Request',
    icon: UserMinus,
    category: 'linkedin'
  },
  
  // Messaging
  {
    id: 'send-message',
    label: 'Send Message',
    icon: MessageSquare,
    category: 'messaging'
  },
  
  // Delay
  {
    id: 'wait',
    label: 'Wait',
    icon: Clock,
    category: 'delay'
  },
  
  // Logic
  {
    id: 'if-then',
    label: 'If/Then',
    icon: GitBranch,
    category: 'logic'
  },
  
  // Integrations
  {
    id: 'update-salesforce',
    label: 'Update Salesforce',
    icon: Database,
    category: 'integration'
  },
  {
    id: 'webhook',
    label: 'Webhook',
    icon: WebhookIcon,
    category: 'integration'
  },
  
  // End
  {
    id: 'end-sequence',
    label: 'End Sequence',
    icon: X,
    category: 'logic'
  }
]

export const getActionById = (id: string): ActionType | undefined => {
  return actionTypes.find(action => action.id === id)
}

