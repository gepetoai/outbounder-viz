"use client";

import { useState, useMemo } from "react";
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Play, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Upload,
  Eye,
  Download,
  Trash2,
  Edit,
  Link,
  Copy,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Globe,
  ChevronDown,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  GitBranch,
  PlayCircle,
  User,
  Save,
  Search,
  CreditCard,
  Smartphone,
  Linkedin,
  Shield,
  EyeOff,
  Plus,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  const [activeApp, setActiveApp] = useState("outbounder");
  const [activeTab, setActiveTab] = useState("leads");
  const [activeSubTab, setActiveSubTab] = useState("upload");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appSidebarOpen, setAppSidebarOpen] = useState(true);
  const [leadsExpanded, setLeadsExpanded] = useState(true);
  const [sequencerExpanded, setSequencerExpanded] = useState(false);
  const [messagingExpanded, setMessagingExpanded] = useState(false);
  const [recruiterTab, setRecruiterTab] = useState("job-setup");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl] = useState("https://api.outbounder.com/webhooks/leads/abc123def456");
  const [recentWebhookActivity] = useState([
    { id: 1, timestamp: "2024-01-15 14:30:25", source: "CRM Integration", status: "success", leads: 3 },
    { id: 2, timestamp: "2024-01-15 14:25:12", source: "Website Form", status: "success", leads: 1 },
    { id: 3, timestamp: "2024-01-15 14:20:08", source: "API Partner", status: "success", leads: 5 },
    { id: 4, timestamp: "2024-01-15 14:15:33", source: "CRM Integration", status: "error", leads: 0 },
    { id: 5, timestamp: "2024-01-15 14:10:45", source: "Website Form", status: "success", leads: 2 }
  ]);

  // Settings state
  const [voicePhoneNumber, setVoicePhoneNumber] = useState("+1 (555) 123-4567");
  const [smsPhoneNumber, setSmsPhoneNumber] = useState("+1 (555) 123-4567");
  const [emailAccounts] = useState([
    { id: 1, email: "sarah@techcorp.com", provider: "Gmail", status: "connected", isPrimary: true },
    { id: 2, email: "sales@techcorp.com", provider: "Outlook", status: "connected", isPrimary: false }
  ]);
  const [paymentMethods] = useState([
    { id: 1, type: "Credit Card", last4: "4242", brand: "Visa", isDefault: true },
    { id: 2, type: "Bank Account", last4: "1234", brand: "Chase", isDefault: false }
  ]);
  const [linkedinConnected] = useState(false);
  const [linkedinProfile] = useState({
    name: "Sarah Johnson",
    title: "Sales Director",
    company: "TechCorp",
    profileUrl: "https://linkedin.com/in/sarah-johnson"
  });
  const [userProfile, setUserProfile] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp",
    title: "Sales Director",
    timezone: "America/New_York",
    language: "English"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailProvider, setNewEmailProvider] = useState("Gmail");
  const [jobUrl, setJobUrl] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [editingChecklistIndex, setEditingChecklistIndex] = useState<number | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");

  // Dummy candidate data
  const dummyCandidates = [
    {
      id: 1,
      name: "Alex Thompson",
      email: "alex.thompson@email.com",
      phone: "+1 (555) 234-5678",
      currentRole: "Senior Software Engineer",
      currentCompany: "Tech Innovations Inc.",
      experience: "8 years",
      status: "New",
      matchScore: "95%"
    },
    {
      id: 2,
      name: "Sarah Martinez",
      email: "sarah.m@email.com",
      phone: "+1 (555) 345-6789",
      currentRole: "Product Manager",
      currentCompany: "StartupCo",
      experience: "6 years",
      status: "Contacted",
      matchScore: "88%"
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "mchen@email.com",
      phone: "+1 (555) 456-7890",
      currentRole: "Engineering Manager",
      currentCompany: "Global Tech Solutions",
      experience: "10 years",
      status: "Interviewing",
      matchScore: "92%"
    },
    {
      id: 4,
      name: "Jessica Williams",
      email: "j.williams@email.com",
      phone: "+1 (555) 567-8901",
      currentRole: "Full Stack Developer",
      currentCompany: "Digital Ventures",
      experience: "5 years",
      status: "New",
      matchScore: "85%"
    },
    {
      id: 5,
      name: "David Park",
      email: "david.park@email.com",
      phone: "+1 (555) 678-9012",
      currentRole: "Senior Backend Engineer",
      currentCompany: "Cloud Systems Inc.",
      experience: "7 years",
      status: "Contacted",
      matchScore: "90%"
    }
  ];

  // Playbook state
  const [expandedPlays, setExpandedPlays] = useState<number[]>([]);
  
  // Outbounder playbook (email-focused)
  const outbounderPlays = [
    {
      id: 1,
      name: "Email Kellogg alumni who live in SF",
      description: "Targeted email campaign for Kellogg alumni in San Francisco to leverage shared educational background and local networking opportunities.",
      category: "Email",
      status: "Active",
      lastUsed: "2024-01-14",
      successRate: "65%",
      totalRuns: 89,
      sequence: [
        { id: "start", type: "startNode", label: "Alumni identified", position: { x: 0, y: 0 } },
        { id: "email1", type: "emailNode", label: "Personalized intro", position: { x: 200, y: 0 } },
        { id: "wait1", type: "waitNode", label: "Wait 3 days", position: { x: 400, y: 0 } },
        { id: "email2", type: "emailNode", label: "Kellogg connection", position: { x: 600, y: 0 } },
        { id: "wait2", type: "waitNode", label: "Wait 5 days", position: { x: 800, y: 0 } },
        { id: "email3", type: "emailNode", label: "SF networking", position: { x: 1000, y: 0 } },
        { id: "end", type: "endNode", label: "End", position: { x: 1200, y: 0 } }
      ],
      edges: [
        { id: "e1", source: "start", target: "email1" },
        { id: "e2", source: "email1", target: "wait1" },
        { id: "e3", source: "wait1", target: "email2" },
        { id: "e4", source: "email2", target: "wait2" },
        { id: "e5", source: "wait2", target: "email3" },
        { id: "e6", source: "email3", target: "end" }
      ]
    }
  ];

  // Inbounder playbook (text-focused)
  const inbounderPlays = [
    {
      id: 1,
      name: "Text leads who fill out the Contact Us form",
      description: "Automatically text leads who submit contact forms to engage them immediately while their interest is high.",
      category: "SMS",
      status: "Active",
      lastUsed: "2024-01-15",
      successRate: "78%",
      totalRuns: 156,
      sequence: [
        { id: "start", type: "startNode", label: "Lead submits form", position: { x: 0, y: 0 } },
        { id: "sms1", type: "smsNode", label: "Send welcome SMS", position: { x: 200, y: 0 } },
        { id: "wait1", type: "waitNode", label: "Wait 2 hours", position: { x: 400, y: 0 } },
        { id: "sms2", type: "smsNode", label: "Follow-up SMS", position: { x: 600, y: 0 } },
        { id: "decision", type: "decisionNode", label: "Response?", position: { x: 800, y: 0 } },
        { id: "email", type: "emailNode", label: "Send email", position: { x: 1000, y: 0 } },
        { id: "end", type: "endNode", label: "End", position: { x: 1200, y: 0 } }
      ],
      edges: [
        { id: "e1", source: "start", target: "sms1" },
        { id: "e2", source: "sms1", target: "wait1" },
        { id: "e3", source: "wait1", target: "sms2" },
        { id: "e4", source: "sms2", target: "decision" },
        { id: "e5", source: "decision", target: "email" },
        { id: "e6", source: "email", target: "end" }
      ]
    }
  ];

  // Get the appropriate playbook based on active app
  const salesPlays = activeApp === "outbounder" ? outbounderPlays : inbounderPlays;

  // React Flow state
  const [, ,] = useNodesState([]);
  const [, ,] = useEdgesState([]);
  const [, ,] = useNodesState([]);
  const [, ,] = useEdgesState([]);
  const [, ,] = useNodesState([]);
  const [, ,] = useEdgesState([]);

  // Custom node types
  const nodeTypes = useMemo(() => ({
    emailNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-blue-600">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    voiceNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-green-600">
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    smsNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-purple-600">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    decisionNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-yellow-600">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    startNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-600">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    endNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-red-600">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
    waitNode: ({ data }: { data: { label: string } }) => (
      <div className="bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-orange-600">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{data.label}</span>
        </div>
      </div>
    ),
  }), []);

  // Connection handlers (currently unused)
  // const onEmailConnect = useCallback((params: Connection) => {
  //   setEmailEdges((eds) => addEdge(params, eds));
  // }, [setEmailEdges]);

  // const onVoiceConnect = useCallback((params: Connection) => {
  //   setVoiceEdges((eds) => addEdge(params, eds));
  // }, [setVoiceEdges]);

  // const onSmsConnect = useCallback((params: Connection) => {
  //   setSmsEdges((eds) => addEdge(params, eds));
  // }, [setSmsEdges]);

  // Dummy lead data
  const dummyLeads = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@techcorp.com",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Inc.",
      title: "VP of Engineering",
      status: "New",
      lastContact: "2024-01-15"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@innovate.com",
      phone: "+1 (555) 234-5678",
      company: "Innovate Solutions",
      title: "CEO",
      status: "Contacted",
      lastContact: "2024-01-14"
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@startup.io",
      phone: "+1 (555) 345-6789",
      company: "StartupIO",
      title: "CTO",
      status: "Qualified",
      lastContact: "2024-01-13"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@enterprise.com",
      phone: "+1 (555) 456-7890",
      company: "Enterprise Corp",
      title: "Head of Sales",
      status: "New",
      lastContact: "2024-01-12"
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.w@growth.com",
      phone: "+1 (555) 567-8901",
      company: "Growth Labs",
      title: "Founder",
      status: "Contacted",
      lastContact: "2024-01-11"
    }
  ];

  // Main applications
  const applications = [
    { 
      id: "outbounder", 
      label: "Outbounder", 
      icon: Users,
      description: "Sales outreach automation",
      color: "blue"
    },
    { 
      id: "inbounder", 
      label: "Inbounder", 
      icon: Globe,
      description: "Lead capture and qualification",
      color: "green"
    },
    { 
      id: "researcher", 
      label: "Researcher", 
      icon: Search,
      description: "Lead research and enrichment",
      color: "purple"
    },
    { 
      id: "recruiter", 
      label: "Recruiter", 
      icon: User,
      description: "Talent acquisition tools",
      color: "orange"
    },
    { 
      id: "reporter", 
      label: "Reporter", 
      icon: BarChart3,
      description: "Analytics and reporting",
      color: "indigo"
    },
  ];

  // Outbounder tabs
  const tabs = [
    { 
      id: "leads", 
      label: "Leads", 
      icon: Users,
      subItems: [
        { id: "upload", label: "Upload", icon: Upload },
        { id: "view", label: "View", icon: Eye }
      ]
    },
    { id: "sequencer", label: "Playbook", icon: Play },
    { id: "messaging", label: "Messaging", icon: MessageSquare },
    { id: "reporting", label: "Reporting", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Recruiter tabs
  const recruiterTabs = [
    { id: "job-setup", label: "Job Setup", icon: Settings, subItems: [] },
    { id: "checklist", label: "Checklist", icon: CheckCircle, subItems: [] },
    { id: "candidates", label: "Candidates", icon: Users, subItems: [] },
    { id: "outreach", label: "Outreach", icon: MessageSquare, subItems: [] },
    { id: "analytics", label: "Analytics", icon: BarChart3, subItems: [] },
  ];

  const renderAppContent = () => {
    switch (activeApp) {
      case "outbounder":
        return renderOutbounderContent();
      case "inbounder":
        return renderOutbounderContent();
      case "researcher":
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                  <Search className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Researcher</CardTitle>
                <CardDescription>Lead research and enrichment tools</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Coming soon...</p>
                <Button disabled>Under Development</Button>
              </CardContent>
            </Card>
          </div>
        );
      case "recruiter":
        return renderRecruiterContent();
      case "reporter":
        return (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-indigo-100 rounded-full w-fit">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle>Reporter</CardTitle>
                <CardDescription>Advanced analytics and reporting</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">Coming soon...</p>
                <Button disabled>Under Development</Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderOutbounderContent = () => {
    switch (activeTab) {
      case "leads":
  return (
          <div className="space-y-6">
            {activeSubTab === "upload" && (
              <div className="space-y-6">
                {/* CSV Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      CSV Upload
                    </CardTitle>
                    <CardDescription>
                      Upload a CSV file with your prospect data. Include columns for name, email, phone, company, and title.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Drop your CSV file here</h3>
                        <p className="text-muted-foreground">or click to browse files</p>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>
                    
                    {uploadedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">File ready for upload:</span>
                          <span>{uploadedFile.name}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          Size: {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button disabled={!uploadedFile} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload CSV
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Webhook Integration Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Live Lead Pipeline
                    </CardTitle>
                    <CardDescription>
                      Set up webhook endpoints to receive leads in real-time from external sources like CRM systems, forms, and APIs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Webhook Toggle */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Link className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Webhook Integration</h3>
                          <p className="text-sm text-muted-foreground">Enable real-time lead ingestion</p>
                        </div>
                      </div>
                      <Switch
                        checked={webhookEnabled}
                        onCheckedChange={setWebhookEnabled}
                      />
        </div>

                    {webhookEnabled && (
                      <div className="space-y-4">
                        {/* Webhook URL */}
                        <div className="space-y-2">
                          <Label htmlFor="webhook-url">Webhook Endpoint</Label>
                          <div className="flex gap-2">
                            <Input
                              id="webhook-url"
                              value={webhookUrl}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <Copy className="h-4 w-4" />
                              Copy
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Send POST requests to this endpoint with lead data
                          </p>
                        </div>

                        {/* Webhook Status */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Webhook Active</span>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            <Activity className="h-3 w-3 mr-1" />
                            Live
                          </Badge>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Recent Activity
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {recentWebhookActivity.map((activity) => (
                              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${
                                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></div>
                                  <div>
                                    <p className="text-sm font-medium">{activity.source}</p>
                                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {activity.status === 'success' ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <Badge variant={activity.status === 'success' ? 'default' : 'destructive'}>
                                    {activity.leads} leads
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Webhook Documentation */}
                        <Alert>
                          <Globe className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Integration Guide:</strong> Send POST requests with JSON payload containing lead data. 
                            Expected fields: name, email, phone, company, title. 
                            <a href="#" className="text-blue-600 hover:underline ml-1">View full documentation →</a>
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSubTab === "view" && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lead Database</CardTitle>
                      <CardDescription>
                        View and manage your prospect database ({dummyLeads.length} leads)
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Add Leads
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dummyLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>{lead.email}</TableCell>
                            <TableCell>{lead.phone}</TableCell>
                            <TableCell>{lead.company}</TableCell>
                            <TableCell>{lead.title}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {lead.status}
                              </span>
                            </TableCell>
                            <TableCell>{lead.lastContact}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      case "sequencer":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Sales Playbook
                    </CardTitle>
                    <CardDescription>
                      Pre-built sales plays with proven sequences and templates
                    </CardDescription>
                  </div>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New Play
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesPlays.map((play) => (
                    <div key={play.id} className="border rounded-lg">
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setExpandedPlays(prev => 
                            prev.includes(play.id) 
                              ? prev.filter(id => id !== play.id)
                              : [...prev, play.id]
                          );
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              {play.category === "Email" && <Mail className="h-4 w-4 text-blue-600" />}
                              {play.category === "SMS" && <MessageCircle className="h-4 w-4 text-purple-600" />}
                              {play.category === "Voice" && <Phone className="h-4 w-4 text-green-600" />}
                              <span className="font-medium">{play.name}</span>
                            </div>
                            <Badge variant={play.status === "Active" ? "default" : "secondary"}>
                              {play.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Success: {play.successRate}</span>
                            <span>Runs: {play.totalRuns}</span>
                            <span>Last: {play.lastUsed}</span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                expandedPlays.includes(play.id) ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                      
                      {expandedPlays.includes(play.id) && (
                        <div className="border-t p-4 space-y-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-muted-foreground">{play.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Performance</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Success Rate:</span>
                                  <span className="ml-2 font-medium">{play.successRate}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Total Runs:</span>
                                  <span className="ml-2 font-medium">{play.totalRuns}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Last Used:</span>
                                  <span className="ml-2 font-medium">{play.lastUsed}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Category:</span>
                                  <span className="ml-2 font-medium">{play.category}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3">Sequence Flow</h4>
                            <div className="h-[300px] border rounded-lg">
                              <ReactFlow
                                nodes={play.sequence.map(node => ({
                                  id: node.id,
                                  type: node.type,
                                  position: node.position,
                                  data: { label: node.label }
                                }))}
                                edges={play.edges}
                                nodeTypes={nodeTypes}
                                fitView
                                className="bg-gray-50"
                                nodesDraggable={false}
                                nodesConnectable={false}
                                elementsSelectable={false}
                              >
                                <Background variant={BackgroundVariant.Dots} />
                              </ReactFlow>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4 mr-2" />
                              Run Play
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "messaging":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messaging Center
                </CardTitle>
                <CardDescription>
                  Create and manage your communication templates across email, voice, and SMS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Email Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Email</CardTitle>
                          <CardDescription>Create email templates and sequences</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Email templates</div>
                        <div>• A/B testing</div>
                        <div>• Personalization</div>
                        <div>• Analytics</div>
                      </div>
                      <Button className="w-full mt-4">
                        <Mail className="h-4 w-4 mr-2" />
                        Manage Email
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Voice Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Voice</CardTitle>
                          <CardDescription>Create call scripts and recordings</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• Call scripts</div>
                        <div>• Voice recordings</div>
                        <div>• Call analytics</div>
                        <div>• Training</div>
                      </div>
                      <Button className="w-full mt-4">
                        <Phone className="h-4 w-4 mr-2" />
                        Manage Voice
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SMS Messaging */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MessageCircle className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">SMS</CardTitle>
                          <CardDescription>Create SMS templates and campaigns</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>• SMS templates</div>
                        <div>• Quick responses</div>
                        <div>• Delivery tracking</div>
                        <div>• Compliance</div>
                      </div>
                      <Button className="w-full mt-4">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Manage SMS
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "reporting":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track your outbound performance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Reporting content will go here...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            {/* User Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Profile
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={userProfile.company}
                        onChange={(e) => setUserProfile({...userProfile, company: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={userProfile.title}
                        onChange={(e) => setUserProfile({...userProfile, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <select
                        id="timezone"
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        value={userProfile.timezone}
                        onChange={(e) => setUserProfile({...userProfile, timezone: e.target.value})}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communication Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Voice Configuration
                  </CardTitle>
                  <CardDescription>
                    Set up your phone number for voice calls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-phone">Phone Number</Label>
                    <Input
                      id="voice-phone"
                      value={voicePhoneNumber}
                      onChange={(e) => setVoicePhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Voice Provider</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                      <option value="twilio">Twilio</option>
                      <option value="vonage">Vonage</option>
                      <option value="ringcentral">RingCentral</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="voice-enabled" defaultChecked />
                    <Label htmlFor="voice-enabled">Enable voice calls</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Test Voice Connection
                  </Button>
                </CardContent>
              </Card>

              {/* SMS Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your SMS phone number
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-phone">Phone Number</Label>
                    <Input
                      id="sms-phone"
                      value={smsPhoneNumber}
                      onChange={(e) => setSmsPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMS Provider</Label>
                    <select className="w-full px-3 py-2 border border-input bg-background rounded-md">
                      <option value="twilio">Twilio</option>
                      <option value="messagebird">MessageBird</option>
                      <option value="sendgrid">SendGrid</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sms-enabled" defaultChecked />
                    <Label htmlFor="sms-enabled">Enable SMS</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Test SMS Connection
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Email Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Accounts
                </CardTitle>
                <CardDescription>
                  Manage your connected email accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {emailAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{account.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.provider} • {account.status}
                            {account.isPrimary && (
                              <Badge variant="secondary" className="ml-2">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Add New Email */}
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Enter email address"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                      />
                      <select
                        className="px-3 py-2 border border-input bg-background rounded-md"
                        value={newEmailProvider}
                        onChange={(e) => setNewEmailProvider(e.target.value)}
                      >
                        <option value="Gmail">Gmail</option>
                        <option value="Outlook">Outlook</option>
                        <option value="Yahoo">Yahoo</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <Button disabled={!newEmail}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LinkedIn Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  LinkedIn Integration
                </CardTitle>
                <CardDescription>
                  Connect your LinkedIn account for enhanced lead research
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {linkedinConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">LinkedIn Connected</div>
                        <div className="text-sm text-green-600">
                          {linkedinProfile.name} • {linkedinProfile.title} at {linkedinProfile.company}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                      <Button variant="outline" className="text-red-600">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Linkedin className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Connect LinkedIn</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your LinkedIn account to automatically enrich lead data and improve personalization
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Linkedin className="h-4 w-4 mr-2" />
                      Connect LinkedIn
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your billing and payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {method.type} •••• {method.last4}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.brand}
                            {method.isDefault && (
                              <Badge variant="secondary" className="ml-2">Default</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </div>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive email updates about your account
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRecruiterContent = () => {
    switch (recruiterTab) {
      case "job-setup":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-url">Job URL</Label>
                  <Input
                    id="job-url"
                    type="url"
                    placeholder="Paste job posting URL here..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button disabled={!jobUrl} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Generate Checklist
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      case "checklist":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4">
                {/* Checklist Items */}
                <div className="space-y-2">
                  {checklistItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No checklist items yet</p>
                      <p className="text-sm">Generate a checklist from a job posting to get started</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {checklistItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          {editingChecklistIndex === index ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={editingChecklistText}
                                onChange={(e) => setEditingChecklistText(e.target.value)}
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newItems = [...checklistItems];
                                    newItems[index] = editingChecklistText;
                                    setChecklistItems(newItems);
                                    setEditingChecklistIndex(null);
                                    setEditingChecklistText("");
                                  } else if (e.key === 'Escape') {
                                    setEditingChecklistIndex(null);
                                    setEditingChecklistText("");
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newItems = [...checklistItems];
                                  newItems[index] = editingChecklistText;
                                  setChecklistItems(newItems);
                                  setEditingChecklistIndex(null);
                                  setEditingChecklistText("");
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingChecklistIndex(null);
                                  setEditingChecklistText("");
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm flex-1">{item}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingChecklistIndex(index);
                                    setEditingChecklistText(item);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const newItems = checklistItems.filter((_, i) => i !== index);
                                    setChecklistItems(newItems);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      setChecklistItems([...checklistItems, "New checklist item"]);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add new checklist item
                  </Button>
                  <Button className="w-full flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Find Candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "candidates":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {dummyCandidates.length} candidates found
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Current Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dummyCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{candidate.name}</div>
                              <div className="text-xs text-muted-foreground">{candidate.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.currentRole}</TableCell>
                          <TableCell>{candidate.currentCompany}</TableCell>
                          <TableCell>{candidate.experience}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {candidate.matchScore}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              candidate.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              candidate.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {candidate.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "outreach":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent>
                <p className="text-muted-foreground">Outreach content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6">
            <Card>
              <CardContent>
                <p className="text-muted-foreground">Analytics content coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Applications Sidebar */}
      <div className={`${appSidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {appSidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">248</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAppSidebarOpen(!appSidebarOpen)}
              className="ml-auto"
            >
              {appSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Applications Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {applications.map((app) => {
            const Icon = app.icon;
            return (
              <Button
                key={app.id}
                variant={activeApp === app.id ? "default" : "ghost"}
                className={`w-full justify-start ${appSidebarOpen ? 'px-3' : 'px-2'}`}
                onClick={() => setActiveApp(app.id)}
              >
                <Icon className="h-4 w-4" />
                {appSidebarOpen && (
                  <span className="ml-2 font-medium">{app.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Outbounder/Inbounder/Recruiter Sidebar - Only show when these apps are active */}
      {(activeApp === "outbounder" || activeApp === "inbounder" || activeApp === "recruiter") && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h1 className="text-xl font-bold text-foreground">
                  {activeApp === "outbounder" ? "Outbounder" : activeApp === "inbounder" ? "Inbounder" : "Recruiter"}
                </h1>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="ml-auto"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {(activeApp === "recruiter" ? recruiterTabs : tabs).map((tab) => {
              const Icon = tab.icon;
              const isLeadsTab = tab.id === "leads";
              const isSequencerTab = tab.id === "sequencer";
              const isMessagingTab = tab.id === "messaging";
              const hasSubItems = tab.subItems && tab.subItems.length > 0;
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={activeApp === "recruiter" ? (recruiterTab === tab.id ? "default" : "ghost") : (activeTab === tab.id ? "default" : "ghost")}
                    className={`w-full justify-start ${sidebarOpen ? 'px-3' : 'px-2'}`}
                    onClick={() => {
                      if (activeApp === "recruiter") {
                        setRecruiterTab(tab.id);
                      } else {
                        setActiveTab(tab.id);
                        if (isLeadsTab) {
                          setActiveSubTab("upload");
                          setLeadsExpanded(!leadsExpanded);
                        } else if (isSequencerTab) {
                          setActiveSubTab("email");
                          setSequencerExpanded(!sequencerExpanded);
                        } else if (isMessagingTab) {
                          setActiveSubTab("email");
                          setMessagingExpanded(!messagingExpanded);
                        }
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && (
                      <>
                        <span className="ml-2">{tab.label}</span>
                        {hasSubItems && (
                          <ChevronDown 
                            className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                              (isLeadsTab && leadsExpanded) || (isSequencerTab && sequencerExpanded) || (isMessagingTab && messagingExpanded) ? 'rotate-180' : ''
                            }`} 
                          />
                        )}
                      </>
                    )}
                  </Button>
                  
                  {/* Sub-items for leads with animation */}
                  {activeTab === "leads" && isLeadsTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        leadsExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for sequencer with animation */}
                  {activeTab === "sequencer" && isSequencerTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        sequencerExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sub-items for messaging with animation */}
                  {activeTab === "messaging" && isMessagingTab && tab.subItems && sidebarOpen && (
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        messagingExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="ml-6 space-y-1">
                        {tab.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <Button
                              key={subItem.id}
                              variant={activeSubTab === subItem.id ? "secondary" : "ghost"}
                              size="sm"
                              className="w-full justify-start px-3 text-sm"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-3 w-3" />
                              <span className="ml-2">{subItem.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {(activeApp === "outbounder" || activeApp === "inbounder")
                ? tabs.find(tab => tab.id === activeTab)?.label
                : activeApp === "recruiter"
                ? recruiterTabs.find(tab => tab.id === recruiterTab)?.label
                : applications.find(app => app.id === activeApp)?.label
              }
            </h1>
            {activeApp !== "outbounder" && activeApp !== "inbounder" && activeApp !== "recruiter" && (
              <p className="text-muted-foreground mt-2 text-lg">
                {applications.find(app => app.id === activeApp)?.description}
              </p>
            )}
          </div>
          {renderAppContent()}
        </main>
      </div>
    </div>
  );
}

