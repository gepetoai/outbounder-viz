export type ResponseType = 'no-reply' | 'positive' | 'negative'

export interface Email {
  id: string
  sender: {
    name: string
    email: string
  }
  recipient: string
  subject: string
  body: string
  timestamp: Date
  responseType: ResponseType
  read: boolean
}

export const mockEmails: Email[] = [
  {
    id: '1',
    sender: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Partnership Opportunity',
    body: 'Thank you for reaching out. I\'m very interested in learning more about how 248.AI can help streamline our outreach process. Could we schedule a call next week to discuss further?\n\nI\'ve shared this with our VP of Sales who would also like to join the conversation.\n\nBest regards,\nSarah',
    timestamp: new Date('2025-11-14T09:30:00'),
    responseType: 'positive',
    read: false
  },
  {
    id: '2',
    sender: {
      name: 'Michael Chen',
      email: 'mchen@innovationlabs.io'
    },
    recipient: 'you@248.ai',
    subject: 'Re: AI-Powered Sales Solutions',
    body: 'Hi there,\n\nWe\'re not currently looking for new solutions in this space. We have an existing vendor relationship that we\'re happy with.\n\nThanks for thinking of us though.\n\nMichael',
    timestamp: new Date('2025-11-14T08:15:00'),
    responseType: 'negative',
    read: true
  },
  {
    id: '3',
    sender: {
      name: 'Auto Reply',
      email: 'emily.rodriguez@designstudio.com'
    },
    recipient: 'you@248.ai',
    subject: 'Out of Office: Re: Transform Your Sales Process',
    body: 'Thank you for your email. I am currently out of office until November 18th with limited access to email. I will respond to your message when I return.\n\nFor urgent matters, please contact support@designstudio.com.\n\nBest,\nEmily Rodriguez',
    timestamp: new Date('2025-11-13T16:45:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '4',
    sender: {
      name: 'Mail Delivery System',
      email: 'mailer-daemon@analyticsinc.com'
    },
    recipient: 'you@248.ai',
    subject: 'Delivery Status Notification (Failure)',
    body: 'Delivery to the following recipient failed permanently:\n\n    david.kim@analyticsinc.com\n\nTechnical details of permanent failure:\nThe email account that you tried to reach does not exist.',
    timestamp: new Date('2025-11-13T14:20:00'),
    responseType: 'negative',
    read: false
  },
  {
    id: '5',
    sender: {
      name: 'Jessica Williams',
      email: 'j.williams@growthco.com'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Boost Your Team\'s Productivity',
    body: 'This looks really interesting! I\'d love to see a demo. Our team has been struggling with manual outreach and this could be exactly what we need.\n\nI\'m available most afternoons this week and all of next week. What works best for you?\n\nJessica Williams\nHead of Growth',
    timestamp: new Date('2025-11-13T11:00:00'),
    responseType: 'positive',
    read: false
  },
  {
    id: '6',
    sender: {
      name: 'James Anderson',
      email: 'janderson@cloudsystems.net'
    },
    recipient: 'you@248.ai',
    subject: 'Initial Outreach',
    body: '',
    timestamp: new Date('2025-11-12T15:30:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '7',
    sender: {
      name: 'Maria Garcia',
      email: 'maria.g@revenuelabs.com'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Scale Your Sales Operations',
    body: 'Please remove me from your mailing list. Not interested.\n\nMaria',
    timestamp: new Date('2025-11-12T10:15:00'),
    responseType: 'negative',
    read: true
  },
  {
    id: '8',
    sender: {
      name: 'Robert Taylor',
      email: 'rtaylor@apisolutions.dev'
    },
    recipient: 'you@248.ai',
    subject: 'Follow-up: AI Solutions Demo',
    body: '',
    timestamp: new Date('2025-11-11T16:00:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '9',
    sender: {
      name: 'Lisa Martinez',
      email: 'lisa@webinnovators.co'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Interested in Your Platform',
    body: 'Hi,\n\nYes, I\'m definitely interested. We\'re in the process of scaling our sales team and looking for tools that can help us be more efficient.\n\nCan you send over some pricing information and case studies?\n\nThanks,\nLisa',
    timestamp: new Date('2025-11-11T09:45:00'),
    responseType: 'positive',
    read: false
  },
  {
    id: '10',
    sender: {
      name: 'Auto Reply',
      email: 'thomas.brown@qualityfirst.com'
    },
    recipient: 'you@248.ai',
    subject: 'Automatic reply: Your Email',
    body: 'I am currently out of the office on vacation and will return on November 20th. During this time, I will have limited access to email.\n\nThomas Brown',
    timestamp: new Date('2025-11-10T13:30:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '11',
    sender: {
      name: 'Amanda Wilson',
      email: 'awilson@creativelabs.design'
    },
    recipient: 'you@248.ai',
    subject: 'Initial Contact',
    body: '',
    timestamp: new Date('2025-11-10T08:00:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '12',
    sender: {
      name: 'Kevin Lee',
      email: 'klee@aiventures.ai'
    },
    recipient: 'you@248.ai',
    subject: 'Re: AI-Powered Outreach Platform',
    body: 'Thanks for reaching out. We actually just signed with a competitor last month, so the timing isn\'t great.\n\nMaybe reach back out in 6 months when our contract is up for renewal?\n\nKevin',
    timestamp: new Date('2025-11-09T14:20:00'),
    responseType: 'negative',
    read: true
  },
  {
    id: '13',
    sender: {
      name: 'Mail Delivery System',
      email: 'postmaster@oldcompany.net'
    },
    recipient: 'you@248.ai',
    subject: 'Undelivered Mail Returned to Sender',
    body: 'This is the mail system at host mail.oldcompany.net.\n\nI\'m sorry to have to inform you that your message could not be delivered to one or more recipients. It\'s attached below.\n\nFor further assistance, please contact your postmaster.',
    timestamp: new Date('2025-11-09T11:00:00'),
    responseType: 'negative',
    read: true
  },
  {
    id: '14',
    sender: {
      name: 'Rachel Green',
      email: 'rgreen@startupinc.com'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Streamline Your Sales Process',
    body: 'This is exactly what we need! Our sales team is growing fast and we\'re struggling to keep up with personalized outreach.\n\nI\'d love to set up a call ASAP. Are you available tomorrow afternoon?\n\nRachel Green\nCEO, StartupInc',
    timestamp: new Date('2025-11-08T16:45:00'),
    responseType: 'positive',
    read: false
  },
  {
    id: '15',
    sender: {
      name: 'Daniel Park',
      email: 'dpark@techsolutions.com'
    },
    recipient: 'you@248.ai',
    subject: 'Introduction Email',
    body: '',
    timestamp: new Date('2025-11-08T10:30:00'),
    responseType: 'no-reply',
    read: true
  },
  {
    id: '16',
    sender: {
      name: 'Sophia Turner',
      email: 'sturner@enterprise.co'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Partnership Discussion',
    body: 'I appreciate you reaching out, but we\'re not taking on any new vendors at this time. Our budget is locked for the rest of the fiscal year.\n\nSophia',
    timestamp: new Date('2025-11-07T15:15:00'),
    responseType: 'negative',
    read: true
  },
  {
    id: '17',
    sender: {
      name: 'Chris Morgan',
      email: 'cmorgan@fastgrowth.io'
    },
    recipient: 'you@248.ai',
    subject: 'Re: Increase Sales Efficiency',
    body: 'Hey there,\n\nI saw your email and checked out your website. The platform looks solid. I\'m curious about the AI capabilities - how does it handle personalization at scale?\n\nWould love to chat more about this.\n\nChris',
    timestamp: new Date('2025-11-07T09:00:00'),
    responseType: 'positive',
    read: false
  },
  {
    id: '18',
    sender: {
      name: 'Auto Reply',
      email: 'alex.kumar@bizcorp.com'
    },
    recipient: 'you@248.ai',
    subject: 'Out of Office AutoReply',
    body: 'Thank you for your email. I am out of the office with no access to email until November 15th.\n\nAlex Kumar',
    timestamp: new Date('2025-11-06T12:30:00'),
    responseType: 'no-reply',
    read: true
  }
]

