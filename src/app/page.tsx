"use client";
//test
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Building2,
  Database,
  Key,
  UserPlus,
  Camera,
  Check,
  XCircle,
  Filter,
  FileText,
  Folder,
  ChevronRight,
  Info,
} from "lucide-react";

// Configuration
const NUM_CANDIDATES = 20;

export default function Home() {
  const [activeApp, setActiveApp] = useState("outbounder");
  const [activeTab, setActiveTab] = useState("leads");
  const [activeSubTab, setActiveSubTab] = useState("upload");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leadsExpanded, setLeadsExpanded] = useState(true);
  const [sequencerExpanded, setSequencerExpanded] = useState(false);
  const [messagingExpanded, setMessagingExpanded] = useState(false);
  const [recruiterTab, setRecruiterTab] = useState("job-setup");
  const [researcherTab, setResearcherTab] = useState("finder");
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
  const [jobUrl, setJobUrl] = useState("https://job-boards.greenhouse.io/regionalspotonsales/jobs/7483840003");
  const [requiredQualifications, setRequiredQualifications] = useState<string[]>([
    "Be a former D1 athlete",
    "Worked in direct sales roles for at least 3 years",
    "President's club member in the last year",
    "Last experience longer than 2 years",
    "Lives in a 50-mile radius from Dallas"
  ]);
  const [disqualifyingFactors, setDisqualifyingFactors] = useState<string[]>([
    "Works in the following industries: Enterprise software, Medical, IT, Financial Services, Automotive, Retail, Cybersecurity",
    "Previously worked at SpotOn",
    "Currently works at IBM",
    "Has worked as a sales manager (must be individual contributor)"
  ]);
  const [exclusionListFile, setExclusionListFile] = useState<File | null>(null);
  const [editingQualificationIndex, setEditingQualificationIndex] = useState<number | null>(null);
  const [editingQualificationText, setEditingQualificationText] = useState("");
  const [editingDisqualifierIndex, setEditingDisqualifierIndex] = useState<number | null>(null);
  const [editingDisqualifierText, setEditingDisqualifierText] = useState("");
  const [expandedCandidates, setExpandedCandidates] = useState<{[key: number]: {fit: boolean, outreach: boolean}}>({});
  const [candidateApprovals, setCandidateApprovals] = useState<{[key: number]: 'approved' | 'rejected' | null}>({});

  // Researcher Settings State
  const [userName, setUserName] = useState("John Doe");
  const [userEmail, setUserEmail] = useState("john.doe@company.com");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("Acme Inc.");
  const [crmConnected, setCrmConnected] = useState(true);
  const [selectedCrm, setSelectedCrm] = useState<string>("salesforce");
  const [aiProvider, setAiProvider] = useState<string>("");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiConnected, setAiConnected] = useState(false);
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Jane Smith", email: "jane@company.com", role: "Admin", status: "Active" },
    { id: 2, name: "Bob Johnson", email: "bob@company.com", role: "User", status: "Active" },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("User");
  const [crmFields, setCrmFields] = useState([
    { id: 1, name: "first_name", type: "text", mapped: true },
    { id: 2, name: "last_name", type: "text", mapped: true },
    { id: 3, name: "email", type: "email", mapped: true },
    { id: 4, name: "phone", type: "phone", mapped: true },
    { id: 5, name: "company", type: "text", mapped: true },
    { id: 6, name: "title", type: "text", mapped: true },
    { id: 7, name: "industry", type: "text", mapped: false },
    { id: 8, name: "company_size", type: "number", mapped: false },
    { id: 9, name: "revenue", type: "number", mapped: false },
    { id: 10, name: "location", type: "text", mapped: false },
  ]);
  const [sampleLead] = useState({
    id: "LEAD-001",
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 234-5678",
    company: "TechCorp Industries",
    title: "VP of Sales",
    industry: "Technology",
    company_size: 250,
    revenue: "$50M-$100M",
    location: "San Francisco, CA",
    linkedin_url: "linkedin.com/in/sarahjohnson",
    last_contact_date: "2024-01-10",
    lead_score: 85,
    status: "Qualified",
    notes: "Interested in enterprise solutions. Follow up next quarter.",
    created_at: "2024-01-05",
    updated_at: "2024-01-15"
  });
  const [editingOutreach, setEditingOutreach] = useState<{[key: number]: boolean}>({});
  const [editedMessages, setEditedMessages] = useState<{[key: number]: string}>({});
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState<number | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState<{[key: number]: string}>({});
  const [currentRejectionText, setCurrentRejectionText] = useState("");

  // Finder State
  const [finderLeadType, setFinderLeadType] = useState<"individual" | "company">("individual");
  const [finderSource, setFinderSource] = useState<"crm" | "generate" | "integrate">("crm");
  const [finderCrmQuery, setFinderCrmQuery] = useState("");
  const [finderCriteria, setFinderCriteria] = useState("");
  const [sampleSize, setSampleSize] = useState(5);
  const [totalLeadPool, setTotalLeadPool] = useState(247);
  const [foundLeads, setFoundLeads] = useState<any[]>([
    { id: 1, name: "Sarah Johnson", email: "sarah.j@techcorp.com", company: "TechCorp Industries", title: "VP of Sales", location: "San Francisco, CA", phone: "+1 555-234-5678", linkedin: "linkedin.com/in/sarahjohnson", selected: false },
    { id: 2, name: "Michael Chen", email: "mchen@innovate.io", company: "Innovate Solutions", title: "Sales Director", location: "Austin, TX", phone: "+1 555-345-6789", linkedin: "linkedin.com/in/michaelchen", selected: false },
    { id: 3, name: "Emily Rodriguez", email: "emily.r@salesforce.com", company: "Salesforce", title: "Enterprise AE", location: "New York, NY", phone: "+1 555-456-7890", linkedin: "linkedin.com/in/emilyrodriguez", selected: false },
    { id: 4, name: "David Kim", email: "dkim@startupxyz.com", company: "StartupXYZ", title: "Head of Growth", location: "Seattle, WA", phone: "+1 555-567-8901", linkedin: "linkedin.com/in/davidkim", selected: false },
    { id: 5, name: "Jessica Williams", email: "jwilliams@enterprise.com", company: "Enterprise Corp", title: "Sales Manager", location: "Chicago, IL", phone: "+1 555-678-9012", linkedin: "linkedin.com/in/jessicawilliams", selected: false },
  ]);
  const [savedLists, setSavedLists] = useState<any[]>([
    { id: 1, name: "Florida Healthcare Leads", count: 45, created: "2024-01-10", type: "individual", query: "All leads in Florida working in the healthcare industry" },
    { id: 2, name: "Tech Companies West Coast", count: 128, created: "2024-01-08", type: "company", query: "B2B SaaS companies on the West Coast with 50-200 employees" },
    { id: 3, name: "Q1 Target Accounts", count: 67, created: "2024-01-05", type: "individual", query: "VP-level contacts at target accounts for Q1 outreach" },
  ]);
  const [expandedListId, setExpandedListId] = useState<number | null>(null);
  const [listDisplayCounts, setListDisplayCounts] = useState<{[key: number]: number}>({});
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [saveListDialogOpen, setSaveListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [addToExistingList, setAddToExistingList] = useState(false);
  const [selectedExistingList, setSelectedExistingList] = useState<string>("");

  // Enricher State
  const [enricherSelectedList, setEnricherSelectedList] = useState<number | null>(null);
  const [addColumnDialogOpen, setAddColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnQuery, setNewColumnQuery] = useState("");
  const [newColumnType, setNewColumnType] = useState("text");
  const [columnConstraints, setColumnConstraints] = useState("");
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>(["google"]);
  const [enrichedColumns, setEnrichedColumns] = useState<any[]>([
    { id: 1, name: "Has Free Trial", query: "Does this company offer a free trial?", type: "binary", constraint: "All rows" },
    { id: 2, name: "Recent Funding", query: "What funding has this company received in the last 6 months?", type: "text", constraint: "Only if LinkedIn present" },
  ]);
  const [enrichedData, setEnrichedData] = useState<{[key: string]: any}>({
    "1-1": { value: "Yes", confidence: 95, source: "Company Website", method: "Googled company name + 'free trial'", sourceUrl: "https://techcorp.com/pricing", reasoning: "Found 'Start Free Trial' button on homepage and pricing page indicates 14-day trial period with no credit card required." },
    "1-2": { value: "No", confidence: 90, source: "Google Search", method: "Searched company website and pricing pages", sourceUrl: "https://innovate.io/pricing", reasoning: "No free trial mentioned on website. Only paid plans available starting at $99/mo." },
    "1-3": { value: "Yes", confidence: 98, source: "Company Website", method: "Analyzed website content and CTAs", sourceUrl: "https://salesforce.com/trial", reasoning: "Clear 'Try for Free' CTA on homepage. Documentation confirms 30-day trial with full feature access." },
    "2-1": { value: "Series B - $50M", confidence: 92, source: "Crunchbase", method: "Googled company funding, found Crunchbase", sourceUrl: "https://crunchbase.com/organization/techcorp", reasoning: "Led by Sequoia Capital in March 2024. Previous funding: Series A $15M in 2022." },
    "2-2": { value: "Seed Round - $3M", confidence: 88, source: "TechCrunch", method: "Searched recent funding news, found TechCrunch article", sourceUrl: "https://techcrunch.com/2024/02/innovate-funding", reasoning: "Announced in February 2024. Led by Y Combinator with participation from angels." },
  });
  const [reasoningPopup, setReasoningPopup] = useState<{open: boolean, data: any}>({ open: false, data: null });
  const [enricherShowCount, setEnricherShowCount] = useState(3);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnVisibilityOpen, setColumnVisibilityOpen] = useState(false);

  // Generate random candidate data
  const generateCandidates = (count: number) => {
    const firstNames = ["Alex", "Marcus", "Jessica", "Brandon", "Amanda", "Sarah", "Michael", "Emily", "David", "Rachel", "James", "Lauren", "Chris", "Nicole", "Ryan", "Stephanie", "Kevin", "Michelle", "Daniel", "Ashley"];
    const lastNames = ["Thompson", "Williams", "Rodriguez", "Lee", "Chen", "Johnson", "Davis", "Martinez", "Brown", "Garcia", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin"];
    const roles = ["Account Executive", "Senior Sales Representative", "Sales Account Manager", "Territory Sales Rep", "Enterprise Sales Rep", "Business Development Rep", "Sales Specialist"];
    const companies = ["Tech Innovations Inc.", "CloudTech Solutions", "DataCore Systems", "Premier Solutions", "TechVision Corp", "SalesPro Group", "Growth Dynamics", "Revenue Labs", "Quantum Sales", "Peak Performance Co."];
    const locations = ["Dallas, TX", "Fort Worth, TX", "Plano, TX", "Irving, TX", "Richardson, TX", "Frisco, TX", "McKinney, TX", "Allen, TX"];
    const sports = ["Basketball", "Football", "Soccer", "Track & Field", "Volleyball", "Baseball", "Swimming", "Tennis"];
    const industries = ["SaaS B2B", "Technology Services", "B2B Technology", "Cloud Services", "Software Solutions"];
    const excludedIndustries = ["Enterprise software", "Financial Services", "Medical", "Cybersecurity"];
    
    return Array.from({ length: count }, (_, i) => {
      const id = i + 1;
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const sport = sports[Math.floor(Math.random() * sports.length)];
      const company = companies[Math.floor(Math.random() * companies.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const experience = Math.floor(Math.random() * 6) + 3; // 3-8 years
      const distance = Math.floor(Math.random() * 45) + 5; // 5-50 miles
      const clubYear = Math.random() > 0.5 ? "2024" : "2023";
      const roleYears = Math.floor(Math.random() * 3) + 2; // 2-4 years
      
      // Randomly decide if 6/7 or 7/7
      const criteriaMet = Math.random() > 0.5 ? 7 : 6;
      
      const criteriaList = [
        `Former D1 athlete (${sport})`,
        `${experience}+ years in direct sales`,
        `President's club member (${clubYear})`,
        `Last role lasted ${roleYears} years`,
        `Individual contributor role`,
        `Lives ${distance} miles from Dallas`
      ];
      
      const unmetCriteria = [];
      
      if (criteriaMet === 7) {
        const industry = industries[Math.floor(Math.random() * industries.length)];
        criteriaList.push(`Current industry: ${industry}`);
      } else {
        const excludedIndustry = excludedIndustries[Math.floor(Math.random() * excludedIndustries.length)];
        unmetCriteria.push({
          criterion: "Does not work in excluded industries",
          reason: `Currently works in ${excludedIndustry} industry`
        });
      }
      
      const highlights = [
        `President's Club achievement in ${clubYear}`,
        `D1 ${sport} background`,
        `${experience} years of sales experience`,
        `President's Club winner`,
        `competitive drive from D1 ${sport}`
      ];
      const highlight = highlights[Math.floor(Math.random() * highlights.length)];
      
      return {
        id,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
        phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        currentRole: role,
        currentCompany: company,
        location,
        experience: `${experience} years`,
        status: "New",
        linkedinUrl: "https://linkedin.com",
        criteriaMet,
        totalCriteria: 7,
        criteriaList,
        unmetCriteria,
        outreachMessage: `Hi ${firstName}! Your ${highlight} caught my eye. We're hiring a Regional Sales Rep at SpotOn in Dallas and would love to connect.`
      };
    });
  };

  const dummyCandidates = useMemo(() => generateCandidates(NUM_CANDIDATES), []);

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

  // Researcher tabs
  const researcherTabs = [
    { id: "finder", label: "Finder", icon: Search, subItems: [] },
    { id: "enricher", label: "Enricher", icon: Zap, subItems: [] },
    { id: "lists", label: "Lists", icon: Users, subItems: [] },
    { id: "settings", label: "Settings", icon: Settings, subItems: [] },
  ];

  const renderAppContent = () => {
    switch (activeApp) {
      case "outbounder":
        return renderOutbounderContent();
      case "inbounder":
        return renderOutbounderContent();
      case "researcher":
        return renderResearcherContent();
      case "recruiter":
        return renderRecruiterContent();
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
                <Button 
                  disabled={!jobUrl} 
                  className="flex items-center gap-2"
                  onClick={() => setRecruiterTab("checklist")}
                >
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
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {requiredQualifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No qualifications yet</p>
                      <p className="text-sm">Add criteria for ideal candidates</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {requiredQualifications.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          {editingQualificationIndex === index ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={editingQualificationText}
                                onChange={(e) => setEditingQualificationText(e.target.value)}
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newItems = [...requiredQualifications]
                                    newItems[index] = editingQualificationText
                                    setRequiredQualifications(newItems)
                                    setEditingQualificationIndex(null)
                                    setEditingQualificationText("")
                                  } else if (e.key === 'Escape') {
                                    setEditingQualificationIndex(null)
                                    setEditingQualificationText("")
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newItems = [...requiredQualifications]
                                  newItems[index] = editingQualificationText
                                  setRequiredQualifications(newItems)
                                  setEditingQualificationIndex(null)
                                  setEditingQualificationText("")
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingQualificationIndex(null)
                                  setEditingQualificationText("")
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
                                    setEditingQualificationIndex(index)
                                    setEditingQualificationText(item)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const newItems = requiredQualifications.filter((_, i) => i !== index)
                                    setRequiredQualifications(newItems)
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
                <Button 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                  onClick={() => {
                    setRequiredQualifications([...requiredQualifications, "New qualification"])
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </Button>
              </CardContent>
            </Card>

            {/* Disqualifiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Disqualifiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Disqualifying Criteria List */}
                <div className="space-y-3">
                  {disqualifyingFactors.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border rounded-lg">
                      <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No disqualifying factors set</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {disqualifyingFactors.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                          {editingDisqualifierIndex === index ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={editingDisqualifierText}
                                onChange={(e) => setEditingDisqualifierText(e.target.value)}
                                className="flex-1"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newItems = [...disqualifyingFactors]
                                    newItems[index] = editingDisqualifierText
                                    setDisqualifyingFactors(newItems)
                                    setEditingDisqualifierIndex(null)
                                    setEditingDisqualifierText("")
                                  } else if (e.key === 'Escape') {
                                    setEditingDisqualifierIndex(null)
                                    setEditingDisqualifierText("")
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const newItems = [...disqualifyingFactors]
                                  newItems[index] = editingDisqualifierText
                                  setDisqualifyingFactors(newItems)
                                  setEditingDisqualifierIndex(null)
                                  setEditingDisqualifierText("")
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingDisqualifierIndex(null)
                                  setEditingDisqualifierText("")
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
                                    setEditingDisqualifierIndex(index)
                                    setEditingDisqualifierText(item)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    const newItems = disqualifyingFactors.filter((_, i) => i !== index)
                                    setDisqualifyingFactors(newItems)
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
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={() => {
                      setDisqualifyingFactors([...disqualifyingFactors, "New disqualifying factor"])
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Disqualifier
                  </Button>
                </div>

                {/* Exclusion List Upload */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Do Not Contact List
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Upload a CSV file with candidates to exclude from outreach
                  </p>
                  
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <label htmlFor="exclusion-file-upload" className="cursor-pointer">
                      <div className="text-sm text-muted-foreground mb-2">
                        {exclusionListFile ? exclusionListFile.name : 'No file chosen'}
                      </div>
                      <Button variant="outline" size="sm" type="button" className="pointer-events-none">
                        Choose File
                      </Button>
                    </label>
                    <Input
                      id="exclusion-file-upload"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setExclusionListFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  
                  {exclusionListFile && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Exclusion list uploaded:</span>
                        <span className="text-sm">{exclusionListFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-red-600 hover:text-red-700"
                        onClick={() => setExclusionListFile(null)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button 
              className="w-full flex items-center gap-2"
              onClick={() => setRecruiterTab("candidates")}
            >
              <Users className="h-4 w-4" />
              Find Candidates
            </Button>
          </div>
        );
      case "candidates":
        // Sort candidates by criteria met (highest first)
        const sortedCandidates = [...dummyCandidates].sort((a, b) => b.criteriaMet - a.criteriaMet);
        
        return (
          <div className="space-y-3">
            {/* Header with total count */}
            <div className="flex items-center justify-end">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {NUM_CANDIDATES} out of 732 candidates
              </Badge>
            </div>

            {/* Candidate Cards */}
            <div className="space-y-2">
              {sortedCandidates.map((candidate) => {
                const isExpanded = expandedCandidates[candidate.id] || { fit: false, outreach: false };
                const approval = candidateApprovals[candidate.id];
                const isEditing = editingOutreach[candidate.id];
                const currentMessage = editedMessages[candidate.id] || candidate.outreachMessage;
                
                return (
                  <Card 
                    key={candidate.id} 
                    className={`transition-all ${
                      approval === 'approved' ? 'border-green-500 bg-green-50' :
                      approval === 'rejected' ? 'border-red-500 bg-red-50' :
                      'hover:shadow-md'
                    }`}
                  >
                    <CardContent className="px-6 pt-[0.1rem] pb-2">
                      <div className="space-y-1.5">
                        {/* Main Info Row */}
                        <div className="flex items-start justify-between gap-3">
                          {/* Left side - Name, LinkedIn, Score, Title, Company, Location */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-base font-semibold">{candidate.name}</h3>
                              <a 
                                href={candidate.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                              <Badge 
                                variant="secondary" 
                                className={`text-sm px-2 py-0.5 font-semibold flex-shrink-0 ${
                                  candidate.criteriaMet === candidate.totalCriteria 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {candidate.criteriaMet}/{candidate.totalCriteria}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              {candidate.currentRole} • <Building2 className="h-3 w-3 inline" /> {candidate.currentCompany} • <MapPin className="h-3 w-3 inline" /> {candidate.location}
                            </div>
                          </div>

                          {/* Right side - Approval Buttons */}
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant={approval === 'approved' ? 'default' : 'outline'}
                              className={`h-7 w-7 p-0 ${approval === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              onClick={() => {
                                setCandidateApprovals(prev => ({
                                  ...prev,
                                  [candidate.id]: prev[candidate.id] === 'approved' ? null : 'approved'
                                }));
                              }}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={approval === 'rejected' ? 'default' : 'outline'}
                              className={`h-7 w-7 p-0 ${approval === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                              onClick={() => {
                                if (approval === 'rejected') {
                                  // If already rejected, unreject
                                  setCandidateApprovals(prev => ({
                                    ...prev,
                                    [candidate.id]: null
                                  }));
                                  setRejectionFeedback(prev => ({
                                    ...prev,
                                    [candidate.id]: ''
                                  }));
                                } else {
                                  // Open dialog for rejection feedback
                                  setRejectionDialogOpen(candidate.id);
                                  setCurrentRejectionText(rejectionFeedback[candidate.id] || '');
                                }
                              }}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Expandable Sections */}
                        <div className="space-y-3 pt-2">
                          {/* Why Great Fit Section */}
                          <div>
                            <button
                              className="w-full flex items-center justify-between py-1 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setExpandedCandidates(prev => ({
                                  ...prev,
                                  [candidate.id]: {
                                    ...prev[candidate.id],
                                    fit: !isExpanded.fit,
                                    outreach: prev[candidate.id]?.outreach || false
                                  }
                                }));
                              }}
                            >
                              <span className="text-xs font-medium flex items-center gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                Why this candidate is a great fit
                              </span>
                              <ChevronDown 
                                className={`h-3.5 w-3.5 transition-transform ${
                                  isExpanded.fit ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            
                            {isExpanded.fit && (
                              <div className="pt-2 pb-1">
                                <ul className="space-y-1">
                                  {candidate.criteriaList.map((criteria, idx) => (
                                    <li key={idx} className="flex items-start gap-1.5">
                                      <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs">{criteria}</span>
                                    </li>
                                  ))}
                                  {candidate.unmetCriteria && candidate.unmetCriteria.map((unmet, idx) => (
                                    <li key={`unmet-${idx}`} className="flex items-start gap-1.5">
                                      <X className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                      <div className="text-xs">
                                        <span className="font-medium">{unmet.criterion}</span>
                                        <span className="text-muted-foreground"> - {unmet.reason}</span>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="border-b mt-2"></div>
                          </div>

                          {/* Personalized Outreach Message Section */}
                          <div>
                            <button
                              className="w-full flex items-center justify-between py-1 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setExpandedCandidates(prev => ({
                                  ...prev,
                                  [candidate.id]: {
                                    fit: prev[candidate.id]?.fit || false,
                                    outreach: !isExpanded.outreach
                                  }
                                }));
                              }}
                            >
                              <span className="text-xs font-medium flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                                Personalized outreach message
                              </span>
                              <ChevronDown 
                                className={`h-3.5 w-3.5 transition-transform ${
                                  isExpanded.outreach ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            
                            {isExpanded.outreach && (
                              <div className="pt-2 pb-1">
                                <div className="px-6">
                                  {isEditing ? (
                                    <textarea
                                      className="w-full min-h-[80px] p-2 border rounded-md font-sans text-xs resize-y"
                                      value={currentMessage}
                                      onChange={(e) => {
                                        setEditedMessages(prev => ({
                                          ...prev,
                                          [candidate.id]: e.target.value
                                        }));
                                      }}
                                    />
                                  ) : (
                                    <div className="prose prose-sm max-w-none">
                                      <pre className="whitespace-pre-wrap font-sans text-xs text-gray-700">
                                        {currentMessage}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1.5 mt-3 px-6 mb-2">
                                  {isEditing ? (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="default" 
                                        className="flex items-center gap-1 h-7 text-xs px-2.5"
                                        onClick={() => {
                                          setEditingOutreach(prev => ({
                                            ...prev,
                                            [candidate.id]: false
                                          }));
                                        }}
                                      >
                                        <Save className="h-3.5 w-3.5" />
                                        Save
                                      </Button>
                                    </>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="flex items-center gap-1 h-7 text-xs px-2.5"
                                      onClick={() => {
                                        setEditingOutreach(prev => ({
                                          ...prev,
                                          [candidate.id]: true
                                        }));
                                      }}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                      Edit
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="border-b mt-2"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Rejection Feedback Dialog */}
            <Dialog open={rejectionDialogOpen !== null} onOpenChange={(open) => {
              if (!open) {
                setRejectionDialogOpen(null);
                setCurrentRejectionText('');
              }
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejection Feedback</DialogTitle>
                  <DialogDescription>
                    Please provide feedback on why this candidate is not a good fit.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder="Enter your feedback here..."
                    value={currentRejectionText}
                    onChange={(e) => setCurrentRejectionText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectionDialogOpen(null);
                      setCurrentRejectionText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (rejectionDialogOpen !== null) {
                        setCandidateApprovals(prev => ({
                          ...prev,
                          [rejectionDialogOpen]: 'rejected'
                        }));
                        setRejectionFeedback(prev => ({
                          ...prev,
                          [rejectionDialogOpen]: currentRejectionText
                        }));
                        setRejectionDialogOpen(null);
                        setCurrentRejectionText('');
                      }
                    }}
                  >
                    Save Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Export Button */}
            <div className="flex justify-end pt-4">
              <Button
                disabled={Object.values(candidateApprovals).filter(v => v === 'approved').length < 19}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
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

  const renderResearcherContent = () => {
    switch (researcherTab) {
      case "finder":
        return (
          <div className="space-y-6">
            {/* Lead Source Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Lead Finder
                </CardTitle>
                <CardDescription>
                  Pull leads from your CRM or generate new prospects from scratch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Source Selection */}
                <div className="space-y-2">
                  <Label>Lead Source</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={finderSource === "integrate" ? "default" : "outline"}
                      onClick={() => setFinderSource("integrate")}
                      disabled={!crmConnected}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Integrate CRM
                    </Button>
                    <Button
                      variant={finderSource === "crm" ? "default" : "outline"}
                      onClick={() => setFinderSource("crm")}
                      disabled={!crmConnected}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Query CRM
                    </Button>
                    <Button
                      variant={finderSource === "generate" ? "default" : "outline"}
                      onClick={() => setFinderSource("generate")}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                  {!crmConnected && (finderSource === "crm" || finderSource === "integrate") && (
                    <p className="text-xs text-muted-foreground">
                      Connect your CRM in Settings to access these features
                    </p>
                  )}
                </div>

                {/* Integrate All CRM Leads */}
                {finderSource === "integrate" && crmConnected && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Import All CRM Leads</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Pull all leads from your connected CRM ({selectedCrm === "salesforce" ? "Salesforce" : selectedCrm === "hubspot" ? "HubSpot" : selectedCrm === "pipedrive" ? "Pipedrive" : "Zoho CRM"}) into a new list called "All Leads" for easy access and enrichment.
                        </p>
                        <Alert className="mb-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            This will create a comprehensive list of all contacts from your CRM. You can then use the Query feature to create filtered segments.
                          </AlertDescription>
                        </Alert>
                        <Button className="w-full" onClick={() => {
                          alert("Importing all leads from CRM...")
                        }}>
                          <Database className="h-4 w-4 mr-2" />
                          Import All Leads from CRM
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Query CRM with Natural Language */}
                {finderSource === "crm" && crmConnected && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">Query Your CRM Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Use natural language to search and filter your CRM leads
                    </p>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">What leads are you looking for?</Label>
                        <Textarea
                          placeholder="Examples:&#10;• All leads without a LinkedIn profile&#10;• Leads that work at TechCorp Industries&#10;• All VP-level contacts in the healthcare industry&#10;• Leads in Florida with no activity in the last 90 days&#10;• Companies with revenue over $10M"
                          value={finderCrmQuery}
                          onChange={(e) => setFinderCrmQuery(e.target.value)}
                          rows={5}
                        />
                      </div>

                      <Button className="w-full" onClick={() => {
                        setTotalLeadPool(Math.floor(Math.random() * 500) + 50)
                        alert("Searching CRM...")
                      }}>
                        <Search className="h-4 w-4 mr-2" />
                        Search CRM
                      </Button>
                    </div>
                  </div>
                )}

                {/* Generate from Scratch Options */}
                {finderSource === "generate" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium">Generate Lead List from Scratch</h4>
                    
                    {/* Lead Type Toggle */}
                    <div className="space-y-2">
                      <Label>Lead Type</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={finderLeadType === "individual" ? "default" : "outline"}
                          onClick={() => setFinderLeadType("individual")}
                          className="flex-1"
                          size="sm"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Individuals
                        </Button>
                        <Button
                          variant={finderLeadType === "company" ? "default" : "outline"}
                          onClick={() => setFinderLeadType("company")}
                          className="flex-1"
                          size="sm"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Companies
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Describe Your Ideal {finderLeadType === "individual" ? "Prospect" : "Company"}
                        </Label>
                        <Textarea
                          placeholder={
                            finderLeadType === "individual" 
                              ? "e.g., VP of Sales at SaaS companies in California with 50-200 employees"
                              : "e.g., B2B SaaS companies in the healthcare space with $10M-$50M revenue"
                          }
                          value={finderCriteria}
                          onChange={(e) => setFinderCriteria(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button className="w-full" onClick={() => {
                        setTotalLeadPool(Math.floor(Math.random() * 1000) + 100)
                        alert("Generating leads...")
                      }}>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Leads
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Found Leads Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Found Leads
                      </CardTitle>
                      <Badge variant="secondary" className="text-sm">
                        {totalLeadPool} total matches
                      </Badge>
                    </div>
                    <CardDescription>
                      Viewing {Math.min(sampleSize, foundLeads.length)} of {totalLeadPool} leads
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Show:</Label>
                      <select
                        value={sampleSize}
                        onChange={(e) => setSampleSize(Number(e.target.value))}
                        className="px-2 py-1 border rounded-md bg-background text-sm"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>LinkedIn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {foundLeads.slice(0, sampleSize).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell className="font-mono text-sm">{lead.email}</TableCell>
                          <TableCell>{lead.company}</TableCell>
                          <TableCell>{lead.title}</TableCell>
                          <TableCell>{lead.location}</TableCell>
                          <TableCell>
                            <a 
                              href={`https://${lead.linkedin}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Save Leads Button */}
                <div className="flex justify-center pt-2">
                  <Button 
                    size="lg"
                    onClick={() => setSaveListDialogOpen(true)}
                    className="min-w-[200px]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save These Leads
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save List Dialog */}
            <Dialog open={saveListDialogOpen} onOpenChange={setSaveListDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Lead List</DialogTitle>
                  <DialogDescription>
                    Save {totalLeadPool} leads to a list for later enrichment
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="list-name">List Name</Label>
                    <Input
                      id="list-name"
                      placeholder="e.g., Q1 Target Accounts, Florida Healthcare Leads"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveListDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (newListName) {
                        setSavedLists([
                          ...savedLists,
                          {
                            id: savedLists.length + 1,
                            name: newListName,
                            count: totalLeadPool,
                            created: new Date().toISOString().split('T')[0],
                            type: finderLeadType,
                            query: finderSource === "crm" ? finderCrmQuery : finderSource === "integrate" ? "All leads from CRM" : finderCriteria
                          }
                        ])
                        setNewListName("")
                        setSaveListDialogOpen(false)
                      }
                    }}
                    disabled={!newListName}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save List
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      case "enricher":
        return (
          <div className="space-y-6">
            {/* List Selection View */}
            {!enricherSelectedList ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Select a List to Enrich
                  </CardTitle>
                  <CardDescription>
                    Choose a lead list to add enrichment columns and AI-powered data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>List Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Lead Count</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {savedLists.map((list) => (
                          <TableRow key={list.id}>
                            <TableCell className="font-medium">{list.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {list.type === "individual" ? (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="capitalize">{list.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>{list.count} leads</TableCell>
                            <TableCell>{list.created}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => setEnricherSelectedList(list.id)}
                              >
                                <Zap className="h-4 w-4 mr-2" />
                                Enrich
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {savedLists.length === 0 && (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                      <p className="text-muted-foreground mb-2">No lists available</p>
                      <p className="text-sm text-muted-foreground">
                        Create lists in the Finder to start enriching
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Selected List Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {savedLists.find(l => l.id === enricherSelectedList)?.type === "individual" ? (
                          <User className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <h3 className="font-medium">
                            Currently Enriching: {savedLists.find(l => l.id === enricherSelectedList)?.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {savedLists.find(l => l.id === enricherSelectedList)?.count} leads
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEnricherSelectedList(null);
                          setEnricherShowCount(3);
                        }}
                      >
                        Change List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Enrichment Table */}
            {enricherSelectedList && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{savedLists.find(l => l.id === enricherSelectedList)?.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setColumnVisibilityOpen(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Columns
                      </Button>
                      <Button
                        onClick={() => setAddColumnDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                      </Button>
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Push to CRM
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-10">Name</TableHead>
                          {!hiddenColumns.includes("email") && <TableHead>Email</TableHead>}
                          {!hiddenColumns.includes("company") && <TableHead>Company</TableHead>}
                          {!hiddenColumns.includes("title") && <TableHead>Title</TableHead>}
                          {enrichedColumns.filter(c => !hiddenColumns.includes(`custom-${c.id}`)).map((column) => (
                            <TableHead key={column.id}>
                              <div className="flex items-center gap-2">
                                <span>{column.name}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    setEnrichedColumns(enrichedColumns.filter(c => c.id !== column.id))
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {foundLeads.slice(0, enricherShowCount).map((lead, leadIndex) => (
                          <TableRow key={lead.id}>
                            <TableCell className="sticky left-0 bg-background z-10 font-medium">
                              {lead.name}
                            </TableCell>
                            {!hiddenColumns.includes("email") && <TableCell className="font-mono text-sm">{lead.email}</TableCell>}
                            {!hiddenColumns.includes("company") && <TableCell>{lead.company}</TableCell>}
                            {!hiddenColumns.includes("title") && <TableCell>{lead.title}</TableCell>}
                            {enrichedColumns.filter(c => !hiddenColumns.includes(`custom-${c.id}`)).map((column) => {
                              const cellKey = `${column.id}-${lead.id}`;
                              const cellData = enrichedData[cellKey];
                              
                              return (
                                <TableCell key={column.id}>
                                  {cellData ? (
                                    <div 
                                      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded"
                                      onClick={() => setReasoningPopup({ open: true, data: cellData })}
                                    >
                                      <span className={column.type === "binary" ? "font-medium" : ""}>
                                        {cellData.value}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {cellData.confidence}%
                                      </Badge>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic text-sm">Pending...</span>
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Showing {enricherShowCount} of {savedLists.find(l => l.id === enricherSelectedList)?.count} leads
                    </span>
                    {enricherShowCount < (savedLists.find(l => l.id === enricherSelectedList)?.count || 0) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEnricherShowCount(Math.min(enricherShowCount + 10, savedLists.find(l => l.id === enricherSelectedList)?.count || 0))}
                      >
                        Show More
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Column Dialog */}
            <Dialog open={addColumnDialogOpen} onOpenChange={setAddColumnDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Enrichment Column</DialogTitle>
                  <DialogDescription>
                    Define a custom column with a natural language query to enrich your lead data
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Column Name */}
                  <div className="space-y-2">
                    <Label htmlFor="column-name">Column Name</Label>
                    <Input
                      id="column-name"
                      placeholder="e.g., Has Free Trial, Recent Funding"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                    />
                  </div>

                  {/* Natural Language Query */}
                  <div className="space-y-2">
                    <Label htmlFor="column-query">Enrichment Question</Label>
                    <Textarea
                      id="column-query"
                      placeholder="Examples:&#10;• Does this company offer a free trial?&#10;• What funding has this company received in the last 6 months?&#10;• How many employees does this company have?&#10;• Does the company have a contact us form on their website?"
                      value={newColumnQuery}
                      onChange={(e) => setNewColumnQuery(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Column Type */}
                  <div className="space-y-2">
                    <Label htmlFor="column-type">Column Type</Label>
                    <select
                      id="column-type"
                      value={newColumnType}
                      onChange={(e) => setNewColumnType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="binary">Binary (Yes/No)</option>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="url">URL</option>
                    </select>
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2">
                    <Label htmlFor="constraints">Constraints (Optional)</Label>
                    <Textarea
                      id="constraints"
                      placeholder="Examples:&#10;• Only run on first 10 rows&#10;• Only if LinkedIn profile is present&#10;• Skip if company field is empty&#10;• Run only for companies with >100 employees"
                      value={columnConstraints}
                      onChange={(e) => setColumnConstraints(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddColumnDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (newColumnName && newColumnQuery) {
                        setEnrichedColumns([
                          ...enrichedColumns,
                          {
                            id: enrichedColumns.length + 1,
                            name: newColumnName,
                            query: newColumnQuery,
                            type: newColumnType,
                            constraint: columnConstraints || "All rows"
                          }
                        ])
                        setNewColumnName("")
                        setNewColumnQuery("")
                        setNewColumnType("text")
                        setColumnConstraints("")
                        setAddColumnDialogOpen(false)
                      }
                    }}
                    disabled={!newColumnName || !newColumnQuery}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Add & Run Enrichment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reasoning Popup */}
            <Dialog open={reasoningPopup.open} onOpenChange={(open) => setReasoningPopup({ open, data: null })}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enrichment Details</DialogTitle>
                </DialogHeader>
                {reasoningPopup.data && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Result</Label>
                      <div className="p-3 bg-muted rounded-md font-medium">
                        {reasoningPopup.data.value}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Confidence</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500"
                              style={{ width: `${reasoningPopup.data.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{reasoningPopup.data.confidence}%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Source</Label>
                        <Badge variant="outline" className="w-fit">
                          {reasoningPopup.data.source}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Method</Label>
                      <div className="p-3 bg-muted/50 rounded-md text-sm border">
                        {reasoningPopup.data.method}
                      </div>
                    </div>

                    {reasoningPopup.data.sourceUrl && (
                      <div className="space-y-2">
                        <Label>Source URL</Label>
                        <a 
                          href={reasoningPopup.data.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all block p-3 bg-muted/50 rounded-md border"
                        >
                          {reasoningPopup.data.sourceUrl}
                        </a>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Reasoning</Label>
                      <div className="p-3 bg-muted/50 rounded-md text-sm border">
                        {reasoningPopup.data.reasoning}
                      </div>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setReasoningPopup({ open: false, data: null })}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Column Visibility Dialog */}
            <Dialog open={columnVisibilityOpen} onOpenChange={setColumnVisibilityOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Column Visibility</DialogTitle>
                  <DialogDescription>
                    Show or hide columns in the enrichment table
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Standard Columns</Label>
                    {["email", "company", "title"].map((col) => (
                      <div key={col} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`vis-${col}`}
                          checked={!hiddenColumns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setHiddenColumns(hiddenColumns.filter(c => c !== col))
                            } else {
                              setHiddenColumns([...hiddenColumns, col])
                            }
                          }}
                          className="cursor-pointer"
                        />
                        <label htmlFor={`vis-${col}`} className="text-sm cursor-pointer capitalize">
                          {col}
                        </label>
                      </div>
                    ))}
                  </div>

                  {enrichedColumns.length > 0 && (
                    <div className="space-y-2 pt-3 border-t">
                      <Label className="text-sm font-medium">Custom Columns</Label>
                      {enrichedColumns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`vis-custom-${column.id}`}
                            checked={!hiddenColumns.includes(`custom-${column.id}`)}
                            onChange={(e) => {
                              const colId = `custom-${column.id}`;
                              if (e.target.checked) {
                                setHiddenColumns(hiddenColumns.filter(c => c !== colId))
                              } else {
                                setHiddenColumns([...hiddenColumns, colId])
                              }
                            }}
                            className="cursor-pointer"
                          />
                          <label htmlFor={`vis-custom-${column.id}`} className="text-sm cursor-pointer">
                            {column.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setColumnVisibilityOpen(false)}>
                    Done
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      case "lists":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Lead Lists
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedLists.length === 0 ? (
                  <div className="text-center py-12">
                    <Folder className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                    <p className="text-muted-foreground mb-2">No lists yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create lists in the Finder to organize your leads
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedLists.map((list) => (
                      <div key={list.id} className="border rounded-lg">
                        {/* List Header */}
                        <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setExpandedListId(expandedListId === list.id ? null : list.id)}
                            >
                              <ChevronRight 
                                className={`h-5 w-5 transition-transform ${expandedListId === list.id ? 'rotate-90' : ''}`}
                              />
                            </Button>
                            {list.type === "individual" ? (
                              <User className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <h4 className="font-medium">{list.name}</h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>{list.count} leads</span>
                                <span>•</span>
                                <span>Created {list.created}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Leads
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSavedLists(savedLists.filter(l => l.id !== list.id))
                                if (expandedListId === list.id) {
                                  setExpandedListId(null)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {expandedListId === list.id && (
                          <div className="border-t bg-muted/20">
                            {/* Query Source Banner */}
                            <div className="p-3 bg-muted/50 border-b flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Query Source:</span>
                                <span className="text-sm text-muted-foreground">{list.query}</span>
                              </div>
                              <Button variant="outline" size="sm">
                                <Database className="h-4 w-4 mr-2" />
                                Send to CRM
                              </Button>
                            </div>

                            {/* Leads Table */}
                            <div className="p-4">
                              <div className="border rounded-lg bg-background">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Company</TableHead>
                                      <TableHead>Title</TableHead>
                                      <TableHead>Location</TableHead>
                                      <TableHead>LinkedIn</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Array.from({ length: Math.min(listDisplayCounts[list.id] || 5, list.count) }).map((_, index) => {
                                      const lead = foundLeads[index % foundLeads.length];
                                      return (
                                        <TableRow key={`${list.id}-${index}`}>
                                          <TableCell className="font-medium">{lead.name}</TableCell>
                                          <TableCell className="font-mono text-sm">{lead.email}</TableCell>
                                          <TableCell>{lead.company}</TableCell>
                                          <TableCell>{lead.title}</TableCell>
                                          <TableCell>{lead.location}</TableCell>
                                          <TableCell>
                                            <a 
                                              href={`https://${lead.linkedin}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline text-sm"
                                            >
                                              <Linkedin className="h-4 w-4" />
                                            </a>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="mt-3 flex items-center justify-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                  Showing {Math.min(listDisplayCounts[list.id] || 5, list.count)} of {list.count} leads
                                </span>
                                {(listDisplayCounts[list.id] || 5) < list.count && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const currentCount = listDisplayCounts[list.id] || 5;
                                      const newCount = Math.min(currentCount + 10, list.count);
                                      setListDisplayCounts({
                                        ...listDisplayCounts,
                                        [list.id]: newCount
                                      });
                                    }}
                                  >
                                    Show More
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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
                <CardDescription>Update your personal information and profile settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {userPhoto ? (
                      <img src={userPhoto} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-10 w-10 text-purple-600" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      onClick={() => {
                        // Placeholder for file upload
                        alert("Photo upload functionality coming soon")
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground">Upload a photo to personalize your profile</p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization Name</Label>
                  <Input
                    id="organization"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <Button className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>Manage your billing and payment methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                <Button variant="outline" className="w-full">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* AI Provider Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Provider Connection
                </CardTitle>
                <CardDescription>Connect your AI provider to enable enrichment features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Provider Selection */}
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">Select AI Provider</Label>
                  <select
                    id="ai-provider"
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">-- Select Provider --</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="groq">Groq</option>
                    <option value="248ai">248 AI (Premium)</option>
                  </select>
                </div>

                {/* API Key Input */}
                {aiProvider && aiProvider !== "248ai" && (
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-key"
                        type="password"
                        value={aiApiKey}
                        onChange={(e) => setAiApiKey(e.target.value)}
                        placeholder="Enter your API key"
                        className="font-mono"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>
                )}

                {aiProvider === "248ai" && (
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      248 AI is our premium AI service. No API key required - works out of the box with enhanced features.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Connection Status */}
                {aiConnected && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Connected to {aiProvider === "openai" ? "OpenAI" : aiProvider === "anthropic" ? "Anthropic" : aiProvider === "gemini" ? "Google Gemini" : aiProvider === "groq" ? "Groq" : "248 AI"}
                    </span>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (aiProvider && (aiApiKey || aiProvider === "248ai")) {
                      setAiConnected(true)
                    }
                  }}
                  disabled={!aiProvider || (aiProvider !== "248ai" && !aiApiKey)}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  {aiConnected ? "Update Connection" : "Connect AI Provider"}
                </Button>
              </CardContent>
            </Card>

            {/* CRM Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  CRM Integration
                </CardTitle>
                <CardDescription>Connect your CRM to sync and enrich contact data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CRM Selection */}
                <div className="space-y-2">
                  <Label htmlFor="crm-select">Select CRM</Label>
                  <select
                    id="crm-select"
                    value={selectedCrm}
                    onChange={(e) => setSelectedCrm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="">-- Select CRM --</option>
                    <option value="salesforce">Salesforce</option>
                    <option value="hubspot">HubSpot</option>
                    <option value="pipedrive">Pipedrive</option>
                    <option value="zoho">Zoho CRM</option>
                    <option value="custom">Custom Integration</option>
                  </select>
                </div>

                {/* Connection Status */}
                {crmConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Connected to {selectedCrm === "salesforce" ? "Salesforce" : selectedCrm === "hubspot" ? "HubSpot" : selectedCrm === "pipedrive" ? "Pipedrive" : selectedCrm === "zoho" ? "Zoho CRM" : "Custom CRM"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Test Connection
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCrmConnected(false)}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      if (selectedCrm) {
                        setCrmConnected(true)
                      }
                    }}
                    disabled={!selectedCrm}
                    className="flex items-center gap-2"
                  >
                    <Link className="h-4 w-4" />
                    Connect CRM
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* CRM Field Mapping */}
            {crmConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    CRM Field Mapping
                  </CardTitle>
                  <CardDescription>
                    View and manage fields available in your CRM for data mapping
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field Name</TableHead>
                          <TableHead>Field Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {crmFields.map((field) => (
                          <TableRow key={field.id}>
                            <TableCell className="font-mono text-sm">{field.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{field.type}</Badge>
                            </TableCell>
                            <TableCell>
                              {field.mapped ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  <Check className="h-3 w-3 mr-1" />
                                  Mapped
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Not Mapped</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCrmFields(crmFields.map(f =>
                                    f.id === field.id ? { ...f, mapped: !f.mapped } : f
                                  ))
                                }}
                              >
                                {field.mapped ? "Unmap" : "Map"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Lead Preview */}
            {crmConnected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Sample Lead Preview
                  </CardTitle>
                  <CardDescription>
                    View a sample lead with all available fields from your CRM
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lead Header */}
                  <div className="flex items-start justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {sampleLead.first_name} {sampleLead.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{sampleLead.title}</p>
                        <p className="text-sm text-muted-foreground">{sampleLead.company}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {sampleLead.status}
                    </Badge>
                  </div>

                  {/* Lead Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Contact Information
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-mono">{sampleLead.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-mono">{sampleLead.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">LinkedIn</p>
                            <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                              {sampleLead.linkedin_url}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Location</p>
                            <p className="text-sm">{sampleLead.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company & Lead Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Company & Lead Details
                      </h4>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Industry</p>
                            <p className="text-sm">{sampleLead.industry}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Company Size</p>
                            <p className="text-sm">{sampleLead.company_size} employees</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-sm">{sampleLead.revenue}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Lead Score</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500"
                                  style={{ width: `${sampleLead.lead_score}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{sampleLead.lead_score}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Additional Information
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm p-3 bg-muted rounded-md">{sampleLead.notes}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Lead ID</p>
                          <p className="text-sm font-mono">{sampleLead.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="text-sm">{sampleLead.created_at}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Updated</p>
                          <p className="text-sm">{sampleLead.updated_at}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Contact</p>
                          <p className="text-sm">{sampleLead.last_contact_date}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field Count Summary */}
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      This lead has <strong>{Object.keys(sampleLead).length} unique fields</strong> available from your CRM.
                      You can map these fields in the section above to use them for enrichment.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Management
                </CardTitle>
                <CardDescription>Invite and manage team member access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Invite New Member */}
                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Team Member
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="email@company.com"
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                      className="px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <Button
                      onClick={() => {
                        if (newMemberEmail) {
                          setTeamMembers([
                            ...teamMembers,
                            {
                              id: teamMembers.length + 1,
                              name: newMemberEmail.split("@")[0],
                              email: newMemberEmail,
                              role: newMemberRole,
                              status: "Pending"
                            }
                          ])
                          setNewMemberEmail("")
                        }
                      }}
                      disabled={!newMemberEmail}
                    >
                      Send Invite
                    </Button>
                  </div>
                </div>

                {/* Team Members List */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant={member.role === "Admin" ? "default" : "outline"}>
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={member.status === "Active" ? "default" : "secondary"}
                              className={member.status === "Active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTeamMembers(teamMembers.filter(m => m.id !== member.id))
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
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
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Main Applications Sidebar */}
      <div className="w-16 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border min-h-[72px] flex items-center justify-center">
          <h1 className="text-xl font-bold text-foreground">248</h1>
        </div>

        {/* Applications Navigation */}
        <nav className="flex-1 p-2 space-y-2">
          {applications.map((app) => {
            const Icon = app.icon;
            return (
              <Button
                key={app.id}
                variant={activeApp === app.id ? "default" : "ghost"}
                size="icon"
                className="w-full"
                onClick={() => setActiveApp(app.id)}
              >
                <Icon className="h-5 w-5" />
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Outbounder/Inbounder/Recruiter/Researcher Sidebar - Only show when these apps are active */}
      {(activeApp === "outbounder" || activeApp === "inbounder" || activeApp === "recruiter" || activeApp === "researcher") && (
        <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-border min-h-[72px] flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-foreground">
                {activeApp === "outbounder" ? "Outbounder" : activeApp === "inbounder" ? "Inbounder" : activeApp === "researcher" ? "Researcher" : "Recruiter"}
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

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-2">
            {(activeApp === "recruiter" ? recruiterTabs : activeApp === "researcher" ? researcherTabs : tabs).map((tab) => {
              const Icon = tab.icon;
              const isLeadsTab = tab.id === "leads";
              const isSequencerTab = tab.id === "sequencer";
              const isMessagingTab = tab.id === "messaging";
              const hasSubItems = tab.subItems && tab.subItems.length > 0;
              
              return (
                <div key={tab.id} className="space-y-1">
                  <Button
                    variant={activeApp === "recruiter" ? (recruiterTab === tab.id ? "default" : "ghost") : activeApp === "researcher" ? (researcherTab === tab.id ? "default" : "ghost") : (activeTab === tab.id ? "default" : "ghost")}
                    size={sidebarOpen ? "default" : "icon"}
                    className={`w-full justify-start ${sidebarOpen ? 'px-3' : 'px-2'}`}
                    onClick={() => {
                      if (activeApp === "recruiter") {
                        setRecruiterTab(tab.id);
                      } else if (activeApp === "researcher") {
                        setResearcherTab(tab.id);
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
                              size="default"
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
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
                              size="default"
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
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
                              size="default"
                              className="w-full justify-start px-3"
                              onClick={() => setActiveSubTab(subItem.id)}
                            >
                              <SubIcon className="h-4 w-4" />
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
                : activeApp === "researcher"
                ? researcherTabs.find(tab => tab.id === researcherTab)?.label
                : applications.find(app => app.id === activeApp)?.label
              }
            </h1>
            {activeApp !== "outbounder" && activeApp !== "inbounder" && activeApp !== "recruiter" && activeApp !== "researcher" && (
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

