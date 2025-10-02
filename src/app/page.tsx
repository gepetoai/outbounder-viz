/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: string;
  lastContact: string;
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch,
  PlayCircle,
  Database,
  Wand2,
  MessageSquareText,
  User,
  Bot,
  RefreshCw,
  Save,
  BookOpen,
  Search,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("leads");
  const [activeSubTab, setActiveSubTab] = useState("upload");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leadsExpanded, setLeadsExpanded] = useState(true);
  const [sequencerExpanded, setSequencerExpanded] = useState(false);
  const [messagingExpanded, setMessagingExpanded] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [promptText, setPromptText] = useState("You are a sales agent for TechCorp. Your goal is to schedule a demo call with potential customers. Be professional, friendly, and focus on understanding their needs.");
  const [promptVersions, setPromptVersions] = useState([
    { id: 1, name: "Version 1.0", content: "You are a sales agent for TechCorp. Your goal is to schedule a demo call with potential customers. Be professional, friendly, and focus on understanding their needs.", isActive: true },
    { id: 2, name: "Version 1.1", content: "You are a sales agent for TechCorp. Your goal is to schedule a demo call with potential customers. Be professional, friendly, and focus on understanding their needs. Use their company name and industry to personalize your approach.", isActive: false },
    { id: 3, name: "Version 1.2", content: "You are a sales agent for TechCorp. Your goal is to schedule a demo call with potential customers. Be professional, friendly, and focus on understanding their needs. Use their company name and industry to personalize your approach. If they seem hesitant, offer a free consultation instead.", isActive: false }
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.outbounder.com/webhooks/leads/abc123def456");
  const [recentWebhookActivity, setRecentWebhookActivity] = useState([
    { id: 1, timestamp: "2024-01-15 14:30:25", source: "CRM Integration", status: "success", leads: 3 },
    { id: 2, timestamp: "2024-01-15 14:25:12", source: "Website Form", status: "success", leads: 1 },
    { id: 3, timestamp: "2024-01-15 14:20:08", source: "API Partner", status: "success", leads: 5 },
    { id: 4, timestamp: "2024-01-15 14:15:33", source: "CRM Integration", status: "error", leads: 0 },
    { id: 5, timestamp: "2024-01-15 14:10:45", source: "Website Form", status: "success", leads: 2 }
  ]);

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
    { 
      id: "sequencer", 
      label: "Sequencer", 
      icon: Play,
      subItems: [
        { id: "email", label: "Email", icon: MessageSquare },
        { id: "voice", label: "Voice", icon: Users },
        { id: "sms", label: "SMS", icon: MessageSquare }
      ]
    },
    { 
      id: "messaging", 
      label: "Messaging", 
      icon: MessageSquare,
      subItems: [
        { id: "email", label: "Email", icon: Mail },
        { id: "voice", label: "Voice", icon: Phone },
        { id: "sms", label: "SMS", icon: MessageCircle }
      ]
    },
    { id: "reporting", label: "Reporting", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
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
            {activeSubTab === "email" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Sequence Workflow
                    </CardTitle>
                    <CardDescription>
                      Design your email automation workflow with drag-and-drop orchestration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[600px] border-2 border-dashed border-border rounded-lg p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Workflow Canvas */}
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="font-semibold text-lg">Workflow Canvas</h3>
                          <div className="min-h-[500px] bg-gray-50 rounded-lg p-4 space-y-4">
                            {/* Start Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <PlayCircle className="h-4 w-4" />
                                Start
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Day 1 Email Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Day 1: Initial Email
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Decision Branch */}
                            <div className="flex items-center justify-center">
                              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Lead Responded?
                              </div>
                            </div>
                            
                            {/* Branch Options */}
                            <div className="flex justify-center gap-8">
                              <div className="text-center">
                                <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                  Yes
                                </div>
                                <div className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
                                  Forward to Sales
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <XCircle className="h-4 w-4 inline mr-1" />
                                  No
                                </div>
                                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Follow-up in 2 days
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Node Palette */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Available Actions</h3>
                          <div className="space-y-2">
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 cursor-move hover:bg-blue-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Send Email</span>
                              </div>
                            </div>
                            <div className="bg-green-100 border border-green-200 rounded-lg p-3 cursor-move hover:bg-green-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Make Call</span>
                              </div>
                            </div>
                            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 cursor-move hover:bg-purple-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Send SMS</span>
                              </div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 cursor-move hover:bg-yellow-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium">Decision Point</span>
                              </div>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium">Wait/Delay</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSubTab === "voice" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Voice Call Workflow
                    </CardTitle>
                    <CardDescription>
                      Design your voice call automation workflow with intelligent routing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[600px] border-2 border-dashed border-border rounded-lg p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Workflow Canvas */}
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="font-semibold text-lg">Voice Workflow Canvas</h3>
                          <div className="min-h-[500px] bg-gray-50 rounded-lg p-4 space-y-4">
                            {/* Start Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <PlayCircle className="h-4 w-4" />
                                Start
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Initial Call Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Day 1: Initial Call
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Decision Branch */}
                            <div className="flex items-center justify-center">
                              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Call Outcome?
                              </div>
                            </div>
                            
                            {/* Branch Options */}
                            <div className="flex justify-center gap-8">
                              <div className="text-center">
                                <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                  Interested
                                </div>
                                <div className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
                                  Schedule Meeting
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <XCircle className="h-4 w-4 inline mr-1" />
                                  Not Interested
                                </div>
                                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Follow-up in 1 week
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Voice Actions Palette */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Voice Actions</h3>
                          <div className="space-y-2">
                            <div className="bg-green-100 border border-green-200 rounded-lg p-3 cursor-move hover:bg-green-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Make Call</span>
                              </div>
                            </div>
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 cursor-move hover:bg-blue-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Send Follow-up Email</span>
                              </div>
                            </div>
                            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 cursor-move hover:bg-purple-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Send SMS</span>
                              </div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 cursor-move hover:bg-yellow-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium">Call Outcome Decision</span>
                              </div>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium">Wait/Delay</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSubTab === "sms" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      SMS Workflow
                    </CardTitle>
                    <CardDescription>
                      Design your SMS automation workflow with smart messaging sequences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[600px] border-2 border-dashed border-border rounded-lg p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Workflow Canvas */}
                        <div className="lg:col-span-2 space-y-4">
                          <h3 className="font-semibold text-lg">SMS Workflow Canvas</h3>
                          <div className="min-h-[500px] bg-gray-50 rounded-lg p-4 space-y-4">
                            {/* Start Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <PlayCircle className="h-4 w-4" />
                                Start
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Initial SMS Node */}
                            <div className="flex items-center justify-center">
                              <div className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Day 1: Initial SMS
                              </div>
                            </div>
                            
                            {/* Arrow */}
                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Decision Branch */}
                            <div className="flex items-center justify-center">
                              <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                SMS Response?
                              </div>
                            </div>
                            
                            {/* Branch Options */}
                            <div className="flex justify-center gap-8">
                              <div className="text-center">
                                <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <CheckCircle2 className="h-4 w-4 inline mr-1" />
                                  Responded
                                </div>
                                <div className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm">
                                  Forward to Sales
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm mb-2">
                                  <XCircle className="h-4 w-4 inline mr-1" />
                                  No Response
                                </div>
                                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Follow-up in 3 days
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* SMS Actions Palette */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">SMS Actions</h3>
                          <div className="space-y-2">
                            <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 cursor-move hover:bg-purple-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Send SMS</span>
                              </div>
                            </div>
                            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 cursor-move hover:bg-blue-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Send Email</span>
                              </div>
                            </div>
                            <div className="bg-green-100 border border-green-200 rounded-lg p-3 cursor-move hover:bg-green-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Make Call</span>
                              </div>
                            </div>
                            <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3 cursor-move hover:bg-yellow-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <GitBranch className="h-4 w-4 text-yellow-600" />
                                <span className="text-sm font-medium">Response Decision</span>
                              </div>
                            </div>
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-200 transition-colors">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium">Wait/Delay</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );
      case "messaging":
        return (
          <div className="space-y-6">
            {activeSubTab === "email" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Message Creation
                    </CardTitle>
                    <CardDescription>
                      Create and version your email prompts, connect to knowledge base, and preview sample conversations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Prompt Creation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Agent Prompt</h3>
                        <Textarea
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="Enter your agent prompt here..."
                          className="min-h-[200px]"
                        />
                        <div className="flex gap-2">
                          <Button className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Version
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Prompt Versions</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {promptVersions.map((version) => (
                            <div key={version.id} className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                              version.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{version.name}</span>
                                {version.isActive && <Badge variant="default">Active</Badge>}
                              </div>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{version.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RAG Integration */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Knowledge Base Integration
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>RAG Database Connection</Label>
                          <div className="flex gap-2">
                            <Input placeholder="Database URL" />
                            <Button variant="outline" size="sm">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Knowledge Sources</Label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Add Document
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <RefreshCw className="h-4 w-4" />
                              Sync
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Conversation Generator */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquareText className="h-5 w-5" />
                        Sample Email Conversation
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lead Selection */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Select Lead</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {dummyLeads.map((lead) => (
                              <div 
                                key={lead.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                  selectedLead?.id === lead.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedLead(lead)}
                              >
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-gray-600">{lead.company}</div>
                                <div className="text-xs text-gray-500">{lead.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sample Conversation */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="font-medium">Sample Email Exchange</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent</div>
                                  <div className="text-sm">
                                    Hi {selectedLead?.name || 'John'},<br/><br/>
                                    I hope this email finds you well. I noticed that {selectedLead?.company || 'TechCorp'} is in the {selectedLead?.title?.includes('Engineering') ? 'engineering' : 'technology'} space, and I thought you might be interested in learning about our new solution that's helping similar companies increase their efficiency by 40%.<br/><br/>
                                    Would you be open to a brief 15-minute call this week to discuss how this might apply to your situation?<br/><br/>
                                    Best regards,<br/>
                                    Sarah
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">{selectedLead?.name || 'John'}</div>
                                  <div className="text-sm">
                                    Hi Sarah,<br/><br/>
                                    Thanks for reaching out. I'm actually quite busy right now, but I'd be interested in learning more. Could you send me some information about your solution?<br/><br/>
                                    Thanks,<br/>
                                    {selectedLead?.name || 'John'}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent</div>
                                  <div className="text-sm">
                                    Hi {selectedLead?.name || 'John'},<br/><br/>
                                    Absolutely! I've attached a brief overview of our solution. Since you're interested, would you be available for a quick 10-minute call next Tuesday or Wednesday? I can show you a quick demo that's specifically relevant to {selectedLead?.company || 'TechCorp'}'s needs.<br/><br/>
                                    Best,<br/>
                                    Sarah
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSubTab === "voice" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Voice Call Scripts
                    </CardTitle>
                    <CardDescription>
                      Create voice call scripts, practice conversations, and preview call transcripts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Voice Script Creation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Call Script</h3>
                        <Textarea
                          value="Hi [Name], this is Sarah from TechCorp. I'm calling because I noticed [Company] is in the [Industry] space, and I thought you might be interested in learning about our new solution that's helping similar companies increase their efficiency by 40%. Do you have a few minutes to chat?"
                          placeholder="Enter your call script here..."
                          className="min-h-[200px]"
                        />
                        <div className="flex gap-2">
                          <Button className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Script
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Script Versions</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          <div className="p-3 border border-blue-500 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Version 1.0</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Standard opening script for initial calls</p>
                          </div>
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Version 1.1</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Personalized script with company research</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample Call Transcript */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquareText className="h-5 w-5" />
                        Sample Call Transcript
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lead Selection */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Select Lead</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {dummyLeads.map((lead) => (
                              <div 
                                key={lead.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                  selectedLead?.id === lead.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedLead(lead)}
                              >
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-gray-600">{lead.company}</div>
                                <div className="text-xs text-gray-500">{lead.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Call Transcript */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="font-medium">Call Transcript</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent (Sarah)</div>
                                  <div className="text-sm">
                                    Hi {selectedLead?.name || 'John'}, this is Sarah from TechCorp. I'm calling because I noticed {selectedLead?.company || 'TechCorp'} is in the technology space, and I thought you might be interested in learning about our new solution that's helping similar companies increase their efficiency by 40%. Do you have a few minutes to chat?
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">{selectedLead?.name || 'John'}</div>
                                  <div className="text-sm">
                                    Hi Sarah, I'm actually quite busy right now. What exactly does your solution do?
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent (Sarah)</div>
                                  <div className="text-sm">
                                    I understand you're busy. Our solution automates your {selectedLead?.title?.toLowerCase().includes('engineering') ? 'development' : 'business'} processes, which typically saves companies like {selectedLead?.company || 'TechCorp'} about 10 hours per week. Would you be interested in a quick 5-minute demo next week?
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSubTab === "sms" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      SMS Message Templates
                    </CardTitle>
                    <CardDescription>
                      Create SMS templates, manage message versions, and preview SMS conversations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* SMS Template Creation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">SMS Template</h3>
                        <Textarea
                          value="Hi [Name], Sarah from TechCorp here. Quick question - would you be interested in a 5-min demo of our solution that's helping [Company] save 10hrs/week? Reply YES if interested."
                          placeholder="Enter your SMS template here..."
                          className="min-h-[150px]"
                        />
                        <div className="flex gap-2">
                          <Button className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Template
                          </Button>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Template Versions</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          <div className="p-3 border border-blue-500 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Version 1.0</span>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Standard SMS template for initial outreach</p>
                          </div>
                          <div className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">Version 1.1</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">Follow-up SMS template</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sample SMS Conversation */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <MessageSquareText className="h-5 w-5" />
                        Sample SMS Conversation
                      </h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lead Selection */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Select Lead</h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {dummyLeads.map((lead) => (
                              <div 
                                key={lead.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                  selectedLead?.id === lead.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedLead(lead)}
                              >
                                <div className="font-medium text-sm">{lead.name}</div>
                                <div className="text-xs text-gray-600">{lead.company}</div>
                                <div className="text-xs text-gray-500">{lead.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* SMS Conversation */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="font-medium">SMS Exchange</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent (Sarah)</div>
                                  <div className="text-sm">
                                    Hi {selectedLead?.name || 'John'}, Sarah from TechCorp here. Quick question - would you be interested in a 5-min demo of our solution that's helping {selectedLead?.company || 'TechCorp'} save 10hrs/week? Reply YES if interested.
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">{selectedLead?.name || 'John'}</div>
                                  <div className="text-sm">
                                    What kind of solution is this?
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <div className="text-sm font-medium mb-1">Agent (Sarah)</div>
                                  <div className="text-sm">
                                    It's an automation platform that streamlines your {selectedLead?.title?.toLowerCase().includes('engineering') ? 'development' : 'business'} workflows. Most companies see 40% efficiency gains. Still interested in that quick demo?
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
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
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure your Outbounder preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings content will go here...</p>
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
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">Outbounder</h1>
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isLeadsTab = tab.id === "leads";
            const isSequencerTab = tab.id === "sequencer";
            const isMessagingTab = tab.id === "messaging";
            const hasSubItems = tab.subItems && tab.subItems.length > 0;
            
            return (
              <div key={tab.id} className="space-y-1">
                <Button
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start ${sidebarOpen ? 'px-3' : 'px-2'}`}
                  onClick={() => {
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
