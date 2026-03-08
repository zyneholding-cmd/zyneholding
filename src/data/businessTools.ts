import { 
  Home, Package, TrendingUp, Users, Calendar, FileText, MessageSquare,
  DollarSign, CreditCard, Receipt, PieChart, BarChart3, LineChart,
  ShoppingCart, Truck, Warehouse, BoxIcon, Tag, Gift,
  UserCheck, UserPlus, UsersIcon, Award, Target, Briefcase,
  Mail, Phone, Video, Send, MessageCircle, Bell,
  Settings, Shield, Lock, Key, Database, Server,
  FileSpreadsheet, FileBarChart, FileLineChart, FilePieChart, FileCode,
  Clock, Timer, Hourglass, Calendar as CalendarIcon, CalendarDays,
  Clipboard, ClipboardCheck, ClipboardList, CheckSquare, ListTodo,
  Heart, ThumbsUp, Star, Zap, Sparkles, TrendingDown,
  MapPin, Map, Globe, Navigation, Compass,
  Camera, Image, Film, Music, Headphones,
  Laptop, Smartphone, Tablet, Monitor, HardDrive,
  Wifi, Cloud, CloudUpload, CloudDownload, Share2,
  Edit, Pencil, Trash2, Copy, Download, Upload,
  Search, Filter, SortAsc, SortDesc, Sliders,
  Plus, Minus, X, Check, AlertCircle,
  Info, HelpCircle, BookOpen, GraduationCap, Lightbulb,
  Flag, Bookmark, Archive, Folder, FolderOpen,
  Link, ExternalLink, Anchor, Code, Terminal,
  Cpu, Activity, TrendingUpIcon, Layers, Package2, Workflow
} from "lucide-react";

export interface BusinessTool {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: string;
  path: string;
  isImplemented: boolean;
}

export const businessTools: BusinessTool[] = [
  // Workflow Builder
  { id: "workflow", name: "Workflow Builder", description: "Connect tools visually", icon: Workflow, color: "tool-purple", category: "Dashboard & Analytics", path: "/workflow", isImplemented: true },
  
  // Dashboard & Analytics (8 tools)
  { id: "overview", name: "Overview Dashboard", description: "Main business overview", icon: Home, color: "tool-blue", category: "Dashboard & Analytics", path: "/dashboard", isImplemented: true },
  { id: "analytics", name: "Advanced Analytics", description: "Deep business insights", icon: BarChart3, color: "tool-purple", category: "Dashboard & Analytics", path: "/insights", isImplemented: true },
  { id: "reports", name: "Reports", description: "Generate business reports", icon: FileBarChart, color: "tool-pink", category: "Dashboard & Analytics", path: "#", isImplemented: false },
  { id: "kpi", name: "KPI Dashboard", description: "Track key metrics", icon: Target, color: "tool-orange", category: "Dashboard & Analytics", path: "#", isImplemented: false },
  { id: "forecasting", name: "Forecasting", description: "Predict trends", icon: TrendingUpIcon, color: "tool-green", category: "Dashboard & Analytics", path: "#", isImplemented: false },
  { id: "metrics", name: "Business Metrics", description: "Performance tracking", icon: Activity, color: "tool-cyan", category: "Dashboard & Analytics", path: "#", isImplemented: false },
  { id: "insights", name: "AI Insights", description: "Smart recommendations", icon: Lightbulb, color: "tool-yellow", category: "Dashboard & Analytics", path: "#", isImplemented: false },
  { id: "dashboard-custom", name: "Custom Dashboard", description: "Build your own", icon: Layers, color: "tool-red", category: "Dashboard & Analytics", path: "#", isImplemented: false },

  // Sales & CRM (12 tools)
  { id: "sales", name: "Sales Tracking", description: "Monitor all sales", icon: TrendingUp, color: "tool-green", category: "Sales & CRM", path: "/sales", isImplemented: true },
  { id: "customers", name: "Customer Management", description: "CRM system", icon: Users, color: "tool-blue", category: "Sales & CRM", path: "/customers", isImplemented: true },
  { id: "leads", name: "Lead Management", description: "Track potential customers", icon: UserPlus, color: "tool-purple", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "pipeline", name: "Sales Pipeline", description: "Visualize sales stages", icon: TrendingUp, color: "tool-pink", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "quotes", name: "Quotes", description: "Create sales quotes", icon: FileText, color: "tool-orange", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "proposals", name: "Proposals", description: "Business proposals", icon: FileCode, color: "tool-cyan", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "deals", name: "Deals", description: "Manage opportunities", icon: Target, color: "tool-yellow", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "contacts", name: "Contact Database", description: "All business contacts", icon: UserCheck, color: "tool-red", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "follow-ups", name: "Follow-ups", description: "Customer touchpoints", icon: Bell, color: "tool-blue", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "campaigns", name: "Campaigns", description: "Marketing campaigns", icon: Zap, color: "tool-purple", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "loyalty", name: "Loyalty Programs", description: "Customer rewards", icon: Award, color: "tool-pink", category: "Sales & CRM", path: "#", isImplemented: false },
  { id: "referrals", name: "Referrals", description: "Referral tracking", icon: Share2, color: "tool-green", category: "Sales & CRM", path: "#", isImplemented: false },

  // Products & Inventory (10 tools)
  { id: "products", name: "Product Management", description: "Manage inventory", icon: Package, color: "tool-orange", category: "Products & Inventory", path: "/products", isImplemented: true },
  { id: "inventory", name: "Inventory Tracking", description: "Stock management", icon: Warehouse, color: "tool-blue", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "suppliers", name: "Suppliers", description: "Vendor management", icon: Truck, color: "tool-purple", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "purchase-orders", name: "Purchase Orders", description: "Order from suppliers", icon: ShoppingCart, color: "tool-pink", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "stock-alerts", name: "Stock Alerts", description: "Low stock notifications", icon: AlertCircle, color: "tool-orange", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "barcode", name: "Barcode Scanner", description: "Quick product lookup", icon: BoxIcon, color: "tool-cyan", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "pricing", name: "Pricing Rules", description: "Dynamic pricing", icon: Tag, color: "tool-yellow", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "bundles", name: "Product Bundles", description: "Bundle products", icon: Gift, color: "tool-red", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "variants", name: "Product Variants", description: "Size, color options", icon: Package2, color: "tool-green", category: "Products & Inventory", path: "#", isImplemented: false },
  { id: "catalog", name: "Product Catalog", description: "Digital catalog", icon: BookOpen, color: "tool-blue", category: "Products & Inventory", path: "#", isImplemented: false },

  // Finance & Accounting (15 tools)
  { id: "invoices", name: "Invoicing", description: "Create invoices", icon: Receipt, color: "tool-green", category: "Finance & Accounting", path: "/invoices", isImplemented: true },
  { id: "payments", name: "Payment Processing", description: "Accept payments", icon: CreditCard, color: "tool-blue", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "expenses", name: "Expense Tracking", description: "Track business costs", icon: DollarSign, color: "tool-purple", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "budgeting", name: "Budgeting", description: "Financial planning", icon: PieChart, color: "tool-pink", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "accounting", name: "Accounting", description: "Bookkeeping system", icon: FileSpreadsheet, color: "tool-orange", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "payroll", name: "Payroll", description: "Employee payments", icon: DollarSign, color: "tool-cyan", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "taxes", name: "Tax Management", description: "Tax calculations", icon: Receipt, color: "tool-yellow", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "bills", name: "Bill Payment", description: "Manage bills", icon: FileText, color: "tool-red", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "statements", name: "Financial Statements", description: "P&L, Balance Sheet", icon: FileLineChart, color: "tool-green", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "reconciliation", name: "Bank Reconciliation", description: "Match transactions", icon: Check, color: "tool-blue", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "cashflow", name: "Cash Flow", description: "Money in/out tracking", icon: TrendingUp, color: "tool-purple", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "assets", name: "Asset Management", description: "Track company assets", icon: Briefcase, color: "tool-pink", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "subscriptions", name: "Subscriptions", description: "Recurring billing", icon: Calendar, color: "tool-orange", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "credits", name: "Credit Notes", description: "Issue refunds", icon: FileText, color: "tool-cyan", category: "Finance & Accounting", path: "#", isImplemented: false },
  { id: "financial-reports", name: "Financial Reports", description: "Custom reports", icon: FilePieChart, color: "tool-yellow", category: "Finance & Accounting", path: "#", isImplemented: false },

  // Team & HR (12 tools)
  { id: "team", name: "Team Management", description: "Manage team members", icon: UsersIcon, color: "tool-blue", category: "Team & HR", path: "/team", isImplemented: true },
  { id: "attendance", name: "Attendance", description: "Track work hours", icon: Clock, color: "tool-purple", category: "Team & HR", path: "#", isImplemented: false },
  { id: "leave", name: "Leave Management", description: "Time-off requests", icon: Calendar, color: "tool-pink", category: "Team & HR", path: "#", isImplemented: false },
  { id: "recruitment", name: "Recruitment", description: "Hiring pipeline", icon: UserPlus, color: "tool-orange", category: "Team & HR", path: "#", isImplemented: false },
  { id: "onboarding", name: "Onboarding", description: "New employee setup", icon: GraduationCap, color: "tool-green", category: "Team & HR", path: "#", isImplemented: false },
  { id: "performance", name: "Performance Review", description: "Employee evaluations", icon: Award, color: "tool-cyan", category: "Team & HR", path: "#", isImplemented: false },
  { id: "training", name: "Training", description: "Employee development", icon: BookOpen, color: "tool-yellow", category: "Team & HR", path: "#", isImplemented: false },
  { id: "timesheets", name: "Timesheets", description: "Track work time", icon: Timer, color: "tool-red", category: "Team & HR", path: "#", isImplemented: false },
  { id: "shifts", name: "Shift Scheduling", description: "Plan work shifts", icon: CalendarDays, color: "tool-blue", category: "Team & HR", path: "#", isImplemented: false },
  { id: "benefits", name: "Benefits", description: "Employee benefits", icon: Heart, color: "tool-purple", category: "Team & HR", path: "#", isImplemented: false },
  { id: "policies", name: "HR Policies", description: "Company policies", icon: FileText, color: "tool-pink", category: "Team & HR", path: "#", isImplemented: false },
  { id: "org-chart", name: "Org Chart", description: "Company structure", icon: Layers, color: "tool-orange", category: "Team & HR", path: "#", isImplemented: false },

  // Tasks & Projects (10 tools)
  { id: "tasks", name: "Task Management", description: "Track to-dos", icon: ListTodo, color: "tool-purple", category: "Tasks & Projects", path: "/tasks", isImplemented: true },
  { id: "projects", name: "Project Management", description: "Manage projects", icon: Briefcase, color: "tool-blue", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "kanban", name: "Kanban Board", description: "Visual task board", icon: Clipboard, color: "tool-pink", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "gantt", name: "Gantt Chart", description: "Timeline view", icon: BarChart3, color: "tool-orange", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "milestones", name: "Milestones", description: "Project goals", icon: Flag, color: "tool-green", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "workload", name: "Workload", description: "Team capacity", icon: Activity, color: "tool-cyan", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "dependencies", name: "Dependencies", description: "Task relationships", icon: Link, color: "tool-yellow", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "sprints", name: "Sprints", description: "Agile sprints", icon: Zap, color: "tool-red", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "roadmap", name: "Roadmap", description: "Product roadmap", icon: Map, color: "tool-blue", category: "Tasks & Projects", path: "#", isImplemented: false },
  { id: "time-tracking", name: "Time Tracking", description: "Track project time", icon: Hourglass, color: "tool-purple", category: "Tasks & Projects", path: "#", isImplemented: false },

  // Communication (10 tools)
  { id: "chat", name: "Team Chat", description: "Internal messaging", icon: MessageSquare, color: "tool-cyan", category: "Communication", path: "#", isImplemented: false },
  { id: "email", name: "Email", description: "Email management", icon: Mail, color: "tool-blue", category: "Communication", path: "#", isImplemented: false },
  { id: "video-calls", name: "Video Calls", description: "Video conferencing", icon: Video, color: "tool-purple", category: "Communication", path: "#", isImplemented: false },
  { id: "phone", name: "Phone System", description: "VoIP calling", icon: Phone, color: "tool-pink", category: "Communication", path: "#", isImplemented: false },
  { id: "announcements", name: "Announcements", description: "Company updates", icon: Bell, color: "tool-orange", category: "Communication", path: "#", isImplemented: false },
  { id: "forums", name: "Forums", description: "Discussion boards", icon: MessageCircle, color: "tool-green", category: "Communication", path: "#", isImplemented: false },
  { id: "feedback", name: "Feedback", description: "Collect opinions", icon: ThumbsUp, color: "tool-yellow", category: "Communication", path: "#", isImplemented: false },
  { id: "surveys", name: "Surveys", description: "Create surveys", icon: ClipboardList, color: "tool-red", category: "Communication", path: "#", isImplemented: false },
  { id: "newsletter", name: "Newsletter", description: "Email campaigns", icon: Send, color: "tool-cyan", category: "Communication", path: "#", isImplemented: false },
  { id: "notifications", name: "Notifications", description: "Alert system", icon: Bell, color: "tool-blue", category: "Communication", path: "#", isImplemented: false },

  // Documents & Files (8 tools)
  { id: "documents", name: "Document Manager", description: "File storage", icon: FileText, color: "tool-blue", category: "Documents & Files", path: "/documents", isImplemented: true },
  { id: "file-sharing", name: "File Sharing", description: "Share files securely", icon: Share2, color: "tool-purple", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "templates", name: "Templates", description: "Document templates", icon: Copy, color: "tool-pink", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "contracts", name: "Contracts", description: "Legal documents", icon: FileText, color: "tool-orange", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "signatures", name: "E-Signatures", description: "Digital signing", icon: Edit, color: "tool-green", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "wiki", name: "Knowledge Base", description: "Internal wiki", icon: BookOpen, color: "tool-cyan", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "archives", name: "Archives", description: "Long-term storage", icon: Archive, color: "tool-yellow", category: "Documents & Files", path: "#", isImplemented: false },
  { id: "version-control", name: "Version Control", description: "Track document versions", icon: Clock, color: "tool-red", category: "Documents & Files", path: "#", isImplemented: false },

  // Calendar & Scheduling (8 tools)
  { id: "calendar", name: "Calendar", description: "Event scheduling", icon: Calendar, color: "tool-green", category: "Calendar & Scheduling", path: "/calendar", isImplemented: true },
  { id: "appointments", name: "Appointments", description: "Book meetings", icon: CalendarDays, color: "tool-blue", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "booking", name: "Booking System", description: "Online bookings", icon: CalendarIcon, color: "tool-purple", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "reminders", name: "Reminders", description: "Smart alerts", icon: Bell, color: "tool-pink", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "availability", name: "Availability", description: "Share free time", icon: Clock, color: "tool-orange", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "recurring", name: "Recurring Events", description: "Repeat schedules", icon: CalendarDays, color: "tool-cyan", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "timezone", name: "Time Zone Sync", description: "Multi-zone planning", icon: Globe, color: "tool-yellow", category: "Calendar & Scheduling", path: "#", isImplemented: false },
  { id: "meeting-rooms", name: "Meeting Rooms", description: "Room booking", icon: MapPin, color: "tool-red", category: "Calendar & Scheduling", path: "#", isImplemented: false },

  // Marketing & Social (10 tools)
  { id: "social-media", name: "Social Media", description: "Manage social accounts", icon: Share2, color: "tool-pink", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "seo", name: "SEO Tools", description: "Search optimization", icon: Search, color: "tool-blue", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "ads", name: "Ad Manager", description: "Run ad campaigns", icon: Target, color: "tool-purple", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "landing-pages", name: "Landing Pages", description: "Create pages", icon: Globe, color: "tool-orange", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "email-marketing", name: "Email Marketing", description: "Email campaigns", icon: Mail, color: "tool-green", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "analytics-web", name: "Web Analytics", description: "Website insights", icon: BarChart3, color: "tool-cyan", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "content", name: "Content Calendar", description: "Plan content", icon: Calendar, color: "tool-yellow", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "influencers", name: "Influencer Management", description: "Partner tracking", icon: Star, color: "tool-red", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "brand", name: "Brand Assets", description: "Logo, colors, fonts", icon: Sparkles, color: "tool-pink", category: "Marketing & Social", path: "#", isImplemented: false },
  { id: "competitors", name: "Competitor Analysis", description: "Market research", icon: TrendingDown, color: "tool-blue", category: "Marketing & Social", path: "#", isImplemented: false },

  // E-commerce (12 tools)
  { id: "storefront", name: "Online Store", description: "E-commerce site", icon: ShoppingCart, color: "tool-blue", category: "E-commerce", path: "#", isImplemented: false },
  { id: "orders", name: "Order Management", description: "Track orders", icon: Package, color: "tool-purple", category: "E-commerce", path: "#", isImplemented: false },
  { id: "shipping", name: "Shipping", description: "Delivery management", icon: Truck, color: "tool-pink", category: "E-commerce", path: "#", isImplemented: false },
  { id: "returns", name: "Returns", description: "Handle refunds", icon: TrendingDown, color: "tool-orange", category: "E-commerce", path: "#", isImplemented: false },
  { id: "abandoned-cart", name: "Abandoned Cart", description: "Recover lost sales", icon: ShoppingCart, color: "tool-green", category: "E-commerce", path: "#", isImplemented: false },
  { id: "reviews", name: "Product Reviews", description: "Customer feedback", icon: Star, color: "tool-cyan", category: "E-commerce", path: "#", isImplemented: false },
  { id: "coupons", name: "Coupons", description: "Discount codes", icon: Tag, color: "tool-yellow", category: "E-commerce", path: "#", isImplemented: false },
  { id: "gift-cards", name: "Gift Cards", description: "Digital gift cards", icon: Gift, color: "tool-red", category: "E-commerce", path: "#", isImplemented: false },
  { id: "upsells", name: "Upsells", description: "Cross-sell products", icon: TrendingUp, color: "tool-blue", category: "E-commerce", path: "#", isImplemented: false },
  { id: "marketplace", name: "Marketplace", description: "Multi-vendor platform", icon: ShoppingCart, color: "tool-purple", category: "E-commerce", path: "#", isImplemented: false },
  { id: "dropshipping", name: "Dropshipping", description: "Supplier integration", icon: Truck, color: "tool-pink", category: "E-commerce", path: "#", isImplemented: false },
  { id: "pos", name: "POS System", description: "Point of sale", icon: CreditCard, color: "tool-orange", category: "E-commerce", path: "#", isImplemented: false },

  // Automation & Integration (10 tools)
  { id: "workflows", name: "Workflows", description: "Automate tasks", icon: Zap, color: "tool-yellow", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "zapier", name: "Integrations", description: "Connect apps", icon: Link, color: "tool-blue", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "api", name: "API Access", description: "Developer tools", icon: Code, color: "tool-purple", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "webhooks", name: "Webhooks", description: "Real-time events", icon: Send, color: "tool-pink", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "automation-rules", name: "Automation Rules", description: "If-then logic", icon: Settings, color: "tool-orange", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "ai-assistant", name: "AI Assistant", description: "Smart automation", icon: Sparkles, color: "tool-green", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "data-sync", name: "Data Sync", description: "Keep data in sync", icon: CloudUpload, color: "tool-cyan", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "import-export", name: "Import/Export", description: "Bulk data transfer", icon: Upload, color: "tool-yellow", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "scheduling-auto", name: "Scheduled Tasks", description: "Automated jobs", icon: Clock, color: "tool-red", category: "Automation & Integration", path: "#", isImplemented: false },
  { id: "triggers", name: "Event Triggers", description: "Custom triggers", icon: Zap, color: "tool-blue", category: "Automation & Integration", path: "#", isImplemented: false },

  // Security & Compliance (8 tools)
  { id: "permissions", name: "Permissions", description: "Access control", icon: Shield, color: "tool-red", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "audit-logs", name: "Audit Logs", description: "Activity tracking", icon: FileText, color: "tool-blue", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "2fa", name: "Two-Factor Auth", description: "Enhanced security", icon: Lock, color: "tool-purple", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "backups", name: "Backups", description: "Data protection", icon: Database, color: "tool-pink", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "gdpr", name: "GDPR Compliance", description: "Data privacy", icon: Shield, color: "tool-orange", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "encryption", name: "Encryption", description: "Secure data", icon: Lock, color: "tool-green", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "sso", name: "Single Sign-On", description: "Unified login", icon: Key, color: "tool-cyan", category: "Security & Compliance", path: "#", isImplemented: false },
  { id: "compliance", name: "Compliance Reports", description: "Regulatory reports", icon: FileBarChart, color: "tool-yellow", category: "Security & Compliance", path: "#", isImplemented: false },

  // Support & Service (8 tools)
  { id: "helpdesk", name: "Help Desk", description: "Support tickets", icon: HelpCircle, color: "tool-blue", category: "Support & Service", path: "#", isImplemented: false },
  { id: "live-chat", name: "Live Chat", description: "Customer chat", icon: MessageCircle, color: "tool-purple", category: "Support & Service", path: "#", isImplemented: false },
  { id: "faq", name: "FAQ Builder", description: "Self-service help", icon: HelpCircle, color: "tool-pink", category: "Support & Service", path: "#", isImplemented: false },
  { id: "chatbot", name: "AI Chatbot", description: "Automated support", icon: MessageSquare, color: "tool-orange", category: "Support & Service", path: "#", isImplemented: false },
  { id: "ticket-routing", name: "Ticket Routing", description: "Auto-assign tickets", icon: Navigation, color: "tool-green", category: "Support & Service", path: "#", isImplemented: false },
  { id: "sla", name: "SLA Management", description: "Service agreements", icon: Clock, color: "tool-cyan", category: "Support & Service", path: "#", isImplemented: false },
  { id: "satisfaction", name: "Customer Satisfaction", description: "CSAT surveys", icon: Heart, color: "tool-yellow", category: "Support & Service", path: "#", isImplemented: false },
  { id: "knowledge-base", name: "Knowledge Base", description: "Help articles", icon: BookOpen, color: "tool-red", category: "Support & Service", path: "#", isImplemented: false },

  // Mobile & Location (6 tools)
  { id: "mobile-app", name: "Mobile App", description: "iOS & Android", icon: Smartphone, color: "tool-blue", category: "Mobile & Location", path: "#", isImplemented: false },
  { id: "gps-tracking", name: "GPS Tracking", description: "Location tracking", icon: MapPin, color: "tool-purple", category: "Mobile & Location", path: "#", isImplemented: false },
  { id: "geofencing", name: "Geofencing", description: "Location alerts", icon: Compass, color: "tool-pink", category: "Mobile & Location", path: "#", isImplemented: false },
  { id: "field-service", name: "Field Service", description: "Mobile workforce", icon: Map, color: "tool-orange", category: "Mobile & Location", path: "#", isImplemented: false },
  { id: "check-in", name: "Check-in/Out", description: "Location check-ins", icon: MapPin, color: "tool-green", category: "Mobile & Location", path: "#", isImplemented: false },
  { id: "route-optimization", name: "Route Planning", description: "Optimize routes", icon: Navigation, color: "tool-cyan", category: "Mobile & Location", path: "#", isImplemented: false },

  // Media & Content (6 tools)
  { id: "media-library", name: "Media Library", description: "Asset management", icon: Image, color: "tool-purple", category: "Media & Content", path: "#", isImplemented: false },
  { id: "video", name: "Video Hosting", description: "Stream videos", icon: Film, color: "tool-blue", category: "Media & Content", path: "#", isImplemented: false },
  { id: "audio", name: "Audio", description: "Podcasts & music", icon: Headphones, color: "tool-pink", category: "Media & Content", path: "#", isImplemented: false },
  { id: "photo-editor", name: "Photo Editor", description: "Edit images", icon: Camera, color: "tool-orange", category: "Media & Content", path: "#", isImplemented: false },
  { id: "cms", name: "Content Management", description: "Website CMS", icon: FileText, color: "tool-green", category: "Media & Content", path: "#", isImplemented: false },
  { id: "blog", name: "Blog Platform", description: "Publishing system", icon: Edit, color: "tool-cyan", category: "Media & Content", path: "#", isImplemented: false },

  // Advanced Features (20 tools)
  { id: "ai-predictions", name: "AI Predictions", description: "Predictive analytics", icon: Sparkles, color: "tool-blue", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "machine-learning", name: "Machine Learning", description: "Custom ML models", icon: Cpu, color: "tool-purple", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "blockchain", name: "Blockchain", description: "Distributed ledger", icon: Link, color: "tool-pink", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "iot", name: "IoT Integration", description: "Connect devices", icon: Wifi, color: "tool-orange", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "virtual-assistant", name: "Virtual Assistant", description: "AI helper", icon: Sparkles, color: "tool-green", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "sentiment", name: "Sentiment Analysis", description: "Emotion detection", icon: Heart, color: "tool-cyan", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "ocr", name: "OCR Scanner", description: "Text recognition", icon: Camera, color: "tool-yellow", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "voice", name: "Voice Commands", description: "Voice control", icon: Headphones, color: "tool-red", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "ar", name: "AR Features", description: "Augmented reality", icon: Monitor, color: "tool-blue", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "vr", name: "VR Experience", description: "Virtual reality", icon: Tablet, color: "tool-purple", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "biometrics", name: "Biometric Auth", description: "Face/fingerprint", icon: Lock, color: "tool-pink", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "quantum", name: "Quantum Computing", description: "Advanced computing", icon: Cpu, color: "tool-orange", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "edge-computing", name: "Edge Computing", description: "Distributed processing", icon: Server, color: "tool-green", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "5g", name: "5G Integration", description: "Ultra-fast connectivity", icon: Wifi, color: "tool-cyan", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "satellite", name: "Satellite Data", description: "Space tech", icon: Globe, color: "tool-yellow", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "drone", name: "Drone Control", description: "UAV management", icon: Navigation, color: "tool-red", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "robotics", name: "Robotics", description: "Robot integration", icon: Cpu, color: "tool-blue", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "smart-contracts", name: "Smart Contracts", description: "Blockchain contracts", icon: FileCode, color: "tool-purple", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "nft", name: "NFT Platform", description: "Digital assets", icon: Sparkles, color: "tool-pink", category: "Advanced Features", path: "#", isImplemented: false },
  { id: "metaverse", name: "Metaverse", description: "Virtual world", icon: Globe, color: "tool-orange", category: "Advanced Features", path: "#", isImplemented: false },
];

export const categories = [...new Set(businessTools.map(tool => tool.category))];

export const getToolsByCategory = (category: string) => 
  businessTools.filter(tool => tool.category === category);

export const getImplementedTools = () => 
  businessTools.filter(tool => tool.isImplemented);

export const getUserSelectedTools = async (userId: string) => {
  // This will be implemented with Supabase query
  return getImplementedTools(); // Default to implemented tools
};
