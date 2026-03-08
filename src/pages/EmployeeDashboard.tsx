import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, MapPin, Users, Star, Globe, Briefcase,
  Send, Loader2, CheckCircle, X, Clock, FileText,
  TrendingUp, Building2, Eye, XCircle, AlertCircle,
  Image, Link, Plus, Folder, BadgeCheck, Crown,
  Calendar, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BusinessListing {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  team_size: string | null;
  website: string | null;
  requirements: string | null;
  salary_range: string | null;
  benefits: string[];
  culture: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  rating: number;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
}

interface BusinessPosition {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  salary_range: string | null;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  is_open: boolean;
}

interface MyApplication {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  position: string | null;
  status: string;
  created_at: string;
  business_title?: string;
}

interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  project_url: string | null;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

interface JobOffer {
  id: string;
  business_id: string;
  application_id: string;
  applicant_email: string;
  position_title: string;
  salary: string | null;
  start_date: string | null;
  terms: string | null;
  benefits: string[];
  status: string;
  sent_at: string;
}

interface PipelineEntry {
  id: string;
  application_id: string;
  stage: string;
  interview_date: string | null;
  interview_type: string | null;
  interview_link: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  technology: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  finance: "bg-green-500/10 text-green-500 border-green-500/20",
  marketing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  design: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  healthcare: "bg-red-500/10 text-red-500 border-red-500/20",
  education: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  retail: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

const stageLabels: Record<string, string> = {
  applied: "Applied",
  screening: "Under Review",
  interview: "Interview Stage",
  offer: "Offer Received",
  hired: "Hired!",
  rejected: "Not Selected",
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [positions, setPositions] = useState<BusinessPosition[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [pipelineEntries, setPipelineEntries] = useState<PipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(null);
  const [applyMode, setApplyMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Portfolio modal
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: "", description: "", image_url: "", project_url: "", category: "", tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const [applyForm, setApplyForm] = useState({
    full_name: "", email: "", phone: "", position: "", cover_letter: "",
    experience_level: "intermediate", skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchListings(), fetchPositions(), fetchMyApplications(), fetchProfile(), fetchPortfolio(), fetchOffers(), fetchPipeline()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      setProfile(data);
      setApplyForm(prev => ({ ...prev, full_name: data.full_name || "", email: data.email || "" }));
    }
  };

  const fetchListings = async () => {
    const { data } = await supabase.from("business_listings").select("*").eq("status", "published").order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    if (data) setListings(data as any);
  };

  const fetchPositions = async () => {
    const { data } = await supabase.from("business_positions").select("*").eq("is_open", true);
    if (data) setPositions(data as any);
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    const { data: apps } = await supabase.from("business_applications").select("*").eq("email", user.email || "").order("created_at", { ascending: false });
    if (apps) {
      const bizIds = [...new Set(apps.map(a => a.business_id))];
      const { data: businesses } = await supabase.from("business_listings").select("id, title").in("id", bizIds.length > 0 ? bizIds : ["none"]);
      const bizMap = new Map(businesses?.map(b => [b.id, b.title]) || []);
      setMyApplications(apps.map(a => ({ ...a, business_title: bizMap.get(a.business_id) || "Unknown" })) as any);
    }
  };

  const fetchPortfolio = async () => {
    if (!user) return;
    const { data } = await supabase.from("portfolio_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setPortfolio(data as any);
  };

  const fetchOffers = async () => {
    if (!user) return;
    const { data } = await supabase.from("job_offers").select("*").eq("applicant_email", user.email || "").order("created_at", { ascending: false });
    if (data) setOffers(data as any);
  };

  const fetchPipeline = async () => {
    if (!user) return;
    const { data } = await supabase.from("hiring_pipeline").select("*");
    if (data) setPipelineEntries(data as any);
  };

  const filtered = listings.filter(l => {
    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const alreadyApplied = (bizId: string) => myApplications.some(a => a.business_id === bizId);

  const addSkill = () => {
    if (skillInput.trim() && !applyForm.skills.includes(skillInput.trim())) {
      setApplyForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const handleApply = async () => {
    if (!selectedBusiness || !applyForm.full_name || !applyForm.email) {
      toast.error("Please fill required fields"); return;
    }
    if (alreadyApplied(selectedBusiness.id)) {
      toast.error("Already applied"); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("business_applications").insert({
      business_id: selectedBusiness.id,
      full_name: applyForm.full_name, email: applyForm.email,
      phone: applyForm.phone || null, position: applyForm.position || null,
      cover_letter: applyForm.cover_letter || null,
      skills: applyForm.skills, experience_level: applyForm.experience_level,
    } as any);
    if (error) toast.error("Failed to submit");
    else { toast.success("Application submitted!"); setSelectedBusiness(null); setApplyMode(false); fetchMyApplications(); }
    setSubmitting(false);
  };

  const addPortfolio = async () => {
    if (!portfolioForm.title || !user) { toast.error("Title required"); return; }
    const { error } = await supabase.from("portfolio_items").insert({
      user_id: user.id,
      ...portfolioForm,
    } as any);
    if (error) toast.error("Failed to add");
    else { toast.success("Portfolio item added!"); setPortfolioModalOpen(false); setPortfolioForm({ title: "", description: "", image_url: "", project_url: "", category: "", tags: [] }); fetchPortfolio(); }
  };

  const respondToOffer = async (offerId: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("job_offers").update({ status, responded_at: new Date().toISOString() } as any).eq("id", offerId);
    if (error) toast.error("Failed to respond");
    else { toast.success(`Offer ${status}!`); fetchOffers(); }
  };

  const deletePortfolio = async (id: string) => {
    await supabase.from("portfolio_items").delete().eq("id", id);
    fetchPortfolio();
  };

  const getStageForApp = (appId: string) => {
    const entry = pipelineEntries.find(p => p.application_id === appId);
    return entry?.stage || "applied";
  };

  const getInterviewForApp = (appId: string) => pipelineEntries.find(p => p.application_id === appId && p.stage === "interview");

  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))];
  const pendingCount = myApplications.filter(a => a.status === "pending").length;
  const approvedCount = myApplications.filter(a => a.status === "approved").length;
  const pendingOffers = offers.filter(o => o.status === "pending").length;

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Hub</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities, manage applications & portfolio</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Card className="flex items-center gap-2 px-3 py-2 border-border/50">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{pendingCount} Pending</span>
          </Card>
          <Card className="flex items-center gap-2 px-3 py-2 border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{approvedCount} Approved</span>
          </Card>
          {pendingOffers > 0 && (
            <Card className="flex items-center gap-2 px-3 py-2 border-primary/30 bg-primary/5">
              <Send className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">{pendingOffers} Offer{pendingOffers > 1 ? "s" : ""}!</span>
            </Card>
          )}
          <Card className="flex items-center gap-2 px-3 py-2 border-border/50">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{listings.length} Open</span>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="discover" className="gap-1 text-xs"><Search className="h-3.5 w-3.5" />Discover</TabsTrigger>
          <TabsTrigger value="applications" className="gap-1 text-xs relative">
            <FileText className="h-3.5 w-3.5" />Applications
            {pendingCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{pendingCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-1 text-xs relative">
            <Send className="h-3.5 w-3.5" />Offers
            {pendingOffers > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{pendingOffers}</span>}
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1 text-xs"><Image className="h-3.5 w-3.5" />Portfolio</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1 text-xs"><Users className="h-3.5 w-3.5" />Profile</TabsTrigger>
        </TabsList>

        {/* Discover */}
        <TabsContent value="discover" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search businesses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">{searchQuery ? "Try adjusting your search" : "Check back soon!"}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(biz => {
                const applied = alreadyApplied(biz.id);
                const bizPositions = positions.filter(p => p.business_id === biz.id);
                return (
                  <Card key={biz.id} className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/50 hover:border-primary/30 ${biz.is_featured ? "ring-1 ring-yellow-500/30" : ""}`}
                    onClick={() => { setSelectedBusiness(biz); setApplyMode(false); }}>
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      {biz.cover_image_url ? <img src={biz.cover_image_url} alt="" className="w-full h-full object-cover" /> :
                        <div className="flex items-center justify-center h-full"><Building2 className="h-10 w-10 text-primary/20" /></div>}
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {biz.category && <Badge className={`border ${CATEGORY_COLORS[biz.category] || CATEGORY_COLORS.other}`}>{biz.category}</Badge>}
                        {biz.is_featured && <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 gap-0.5 text-[10px]"><Crown className="h-2.5 w-2.5" />Featured</Badge>}
                      </div>
                      {applied && <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0">Applied</Badge>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{biz.title}</h3>
                            {biz.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {biz.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.location}</span>}
                            {biz.team_size && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{biz.team_size}</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{biz.description || "No description"}</p>
                      {bizPositions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {bizPositions.slice(0, 3).map(p => (
                            <Badge key={p.id} variant="outline" className="text-[10px]">{p.title}</Badge>
                          ))}
                          {bizPositions.length > 3 && <Badge variant="outline" className="text-[10px]">+{bizPositions.length - 3} more</Badge>}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        {biz.salary_range && <span className="text-sm font-medium text-primary">{biz.salary_range}</span>}
                        <div className="flex items-center gap-1 ml-auto">
                          <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{biz.rating || "New"}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications" className="space-y-4 mt-6">
          {myApplications.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <Button onClick={() => setActiveTab("discover")} className="gap-2"><Search className="h-4 w-4" /> Browse</Button>
            </Card>
          ) : (
            myApplications.map(app => {
              const stage = getStageForApp(app.id);
              const interview = getInterviewForApp(app.id);
              return (
                <Card key={app.id} className="p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{app.business_title}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {app.position && <span>Position: {app.position}</span>}
                          <span>Applied {format(new Date(app.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{stageLabels[stage] || stage}</Badge>
                  </div>

                  {/* Pipeline progress */}
                  <div className="mt-3 flex items-center gap-1">
                    {["applied", "screening", "interview", "offer", "hired"].map((s, i) => (
                      <div key={s} className="flex items-center gap-1 flex-1">
                        <div className={`h-1.5 flex-1 rounded-full ${["applied", "screening", "interview", "offer", "hired"].indexOf(stage) >= i ? "bg-primary" : "bg-muted"}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>Applied</span><span>Review</span><span>Interview</span><span>Offer</span><span>Hired</span>
                  </div>

                  {interview?.interview_date && (
                    <div className="mt-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">Interview Scheduled:</span>
                        {format(new Date(interview.interview_date), "MMM d, yyyy 'at' h:mm a")}
                        {interview.interview_type && <Badge variant="outline" className="text-[10px] capitalize">{interview.interview_type}</Badge>}
                      </p>
                      {interview.interview_link && (
                        <a href={interview.interview_link} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 flex items-center gap-1">
                          <Link className="h-3 w-3" /> Join Link
                        </a>
                      )}
                    </div>
                  )}

                  {stage === "hired" && (
                    <div className="mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Congratulations! You've been hired!
                      </p>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Offers */}
        <TabsContent value="offers" className="space-y-4 mt-6">
          {offers.length === 0 ? (
            <Card className="p-12 text-center">
              <Send className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offers yet</h3>
              <p className="text-muted-foreground">Once a business extends an offer, it will appear here</p>
            </Card>
          ) : (
            offers.map(offer => (
              <Card key={offer.id} className={`p-5 ${offer.status === "pending" ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">{offer.position_title}</h4>
                    <p className="text-sm text-muted-foreground">Sent {format(new Date(offer.sent_at), "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant={offer.status === "accepted" ? "default" : offer.status === "declined" ? "destructive" : "secondary"} className="capitalize">
                    {offer.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {offer.salary && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-semibold text-primary">{offer.salary}</p>
                    </div>
                  )}
                  {offer.start_date && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-semibold">{format(new Date(offer.start_date), "MMM d, yyyy")}</p>
                    </div>
                  )}
                </div>

                {offer.benefits?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {offer.benefits.map((b, i) => <Badge key={i} variant="secondary" className="text-xs">{b}</Badge>)}
                  </div>
                )}

                {offer.terms && <p className="text-sm text-muted-foreground mb-3">{offer.terms}</p>}

                {offer.status === "pending" && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-1" onClick={() => respondToOffer(offer.id, "accepted")}>
                      <CheckCircle className="h-4 w-4" /> Accept Offer
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1" onClick={() => respondToOffer(offer.id, "declined")}>
                      <XCircle className="h-4 w-4" /> Decline
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Portfolio */}
        <TabsContent value="portfolio" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">My Portfolio</h3>
            <Button size="sm" className="gap-1" onClick={() => setPortfolioModalOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </div>

          {portfolio.length === 0 ? (
            <Card className="p-12 text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No portfolio items</h3>
              <p className="text-muted-foreground mb-4">Showcase your work to stand out to employers</p>
              <Button onClick={() => setPortfolioModalOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Your First Project</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map(item => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                    {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> :
                      <div className="flex items-center justify-center h-full"><Folder className="h-10 w-10 text-primary/20" /></div>}
                    {item.category && <Badge className="absolute top-3 left-3" variant="secondary">{item.category}</Badge>}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold group-hover:text-primary transition-colors">{item.title}</h4>
                    {item.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>}
                    {item.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {item.project_url && (
                        <a href={item.project_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="gap-1 text-xs"><Link className="h-3 w-3" />View</Button>
                        </a>
                      )}
                      <Button variant="ghost" size="sm" className="text-xs text-destructive ml-auto" onClick={() => deletePortfolio(item.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Employee Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Full Name</Label><Input value={profile?.full_name || ""} readOnly className="bg-muted/50" /></div>
                <div><Label>Email</Label><Input value={profile?.email || ""} readOnly className="bg-muted/50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Job Title</Label><Input value={profile?.job_title || ""} readOnly className="bg-muted/50" /></div>
                <div><Label>Business</Label><Input value={profile?.business_name || ""} readOnly className="bg-muted/50" /></div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Stats</h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><p className="text-2xl font-bold text-primary">{myApplications.length}</p><p className="text-xs text-muted-foreground">Applied</p></div>
                  <div><p className="text-2xl font-bold text-green-500">{approvedCount}</p><p className="text-xs text-muted-foreground">Approved</p></div>
                  <div><p className="text-2xl font-bold text-blue-500">{portfolio.length}</p><p className="text-xs text-muted-foreground">Portfolio</p></div>
                  <div><p className="text-2xl font-bold text-purple-500">{offers.length}</p><p className="text-xs text-muted-foreground">Offers</p></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">To update your profile, go to Team & Profile from the main menu.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Business Detail / Apply Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={o => { if (!o) { setSelectedBusiness(null); setApplyMode(false); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBusiness && !applyMode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  {selectedBusiness.title}
                  {selectedBusiness.is_verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                  {selectedBusiness.is_featured && <Crown className="h-5 w-5 text-yellow-500" />}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {selectedBusiness.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedBusiness.location}</span>}
                  {selectedBusiness.team_size && <span className="flex items-center gap-1"><Users className="h-4 w-4" />{selectedBusiness.team_size}</span>}
                  {selectedBusiness.website && <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-4 w-4" />Website</a>}
                  {selectedBusiness.salary_range && <span className="font-medium text-primary">{selectedBusiness.salary_range}</span>}
                </div>

                {/* Open Positions */}
                {positions.filter(p => p.business_id === selectedBusiness.id).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Open Positions</h4>
                    <div className="space-y-2">
                      {positions.filter(p => p.business_id === selectedBusiness.id).map(pos => (
                        <Card key={pos.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{pos.title}</p>
                              <div className="flex gap-2 text-xs text-muted-foreground">
                                <span className="capitalize">{pos.employment_type}</span>
                                <span className="capitalize">{pos.experience_level}</span>
                                {pos.salary_range && <span className="text-primary font-medium">{pos.salary_range}</span>}
                              </div>
                            </div>
                            {pos.skills_required?.length > 0 && (
                              <div className="flex gap-1">
                                {pos.skills_required.slice(0, 2).map((s, i) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBusiness.description && (
                  <div><h4 className="font-semibold mb-1">About</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.description}</p></div>
                )}
                {selectedBusiness.requirements && (
                  <div><h4 className="font-semibold mb-1">Requirements</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.requirements}</p></div>
                )}
                {selectedBusiness.culture && (
                  <div><h4 className="font-semibold mb-1">Culture</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.culture}</p></div>
                )}
                {selectedBusiness.benefits?.length > 0 && (
                  <div><h4 className="font-semibold mb-1">Benefits</h4><div className="flex flex-wrap gap-2">{selectedBusiness.benefits.map((b, i) => <Badge key={i} variant="secondary">{b}</Badge>)}</div></div>
                )}

                {alreadyApplied(selectedBusiness.id) ? (
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-600">You've already applied</p>
                  </div>
                ) : (
                  <Button className="w-full gap-2" size="lg" onClick={() => setApplyMode(true)}><Send className="h-4 w-4" /> Apply Now</Button>
                )}
              </div>
            </>
          )}

          {selectedBusiness && applyMode && (
            <>
              <DialogHeader><DialogTitle>Apply to {selectedBusiness.title}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Full Name *</Label><Input value={applyForm.full_name} onChange={e => setApplyForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                  <div><Label>Email *</Label><Input type="email" value={applyForm.email} onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Phone</Label><Input value={applyForm.phone} onChange={e => setApplyForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>Position</Label>
                    {positions.filter(p => p.business_id === selectedBusiness.id).length > 0 ? (
                      <Select value={applyForm.position} onValueChange={v => setApplyForm(p => ({ ...p, position: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                        <SelectContent>
                          {positions.filter(p => p.business_id === selectedBusiness.id).map(pos => (
                            <SelectItem key={pos.id} value={pos.title}>{pos.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="e.g. Developer" value={applyForm.position} onChange={e => setApplyForm(p => ({ ...p, position: e.target.value }))} />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Experience</Label>
                  <Select value={applyForm.experience_level} onValueChange={v => setApplyForm(p => ({ ...p, experience_level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Add skill" />
                    <Button variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {applyForm.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">{s}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setApplyForm(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div><Label>Cover Letter</Label><Textarea rows={4} value={applyForm.cover_letter} onChange={e => setApplyForm(p => ({ ...p, cover_letter: e.target.value }))} placeholder="Why you're a great fit..." /></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setApplyMode(false)} className="flex-1">Back</Button>
                  <Button onClick={handleApply} disabled={submitting} className="flex-1 gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Portfolio Modal */}
      <Dialog open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Portfolio Project</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input value={portfolioForm.title} onChange={e => setPortfolioForm(p => ({ ...p, title: e.target.value }))} placeholder="Project name" /></div>
            <div><Label>Description</Label><Textarea rows={3} value={portfolioForm.description} onChange={e => setPortfolioForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Image URL</Label><Input value={portfolioForm.image_url} onChange={e => setPortfolioForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..." /></div>
              <div><Label>Project URL</Label><Input value={portfolioForm.project_url} onChange={e => setPortfolioForm(p => ({ ...p, project_url: e.target.value }))} placeholder="https://..." /></div>
            </div>
            <div><Label>Category</Label><Input value={portfolioForm.category} onChange={e => setPortfolioForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Web Design" /></div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setPortfolioForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } } }}
                  placeholder="Add tag" />
                <Button variant="outline" onClick={() => { if (tagInput.trim()) { setPortfolioForm(p => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {portfolioForm.tags.map((t, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{t}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPortfolioForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} />
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={addPortfolio} className="w-full">Add to Portfolio</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
