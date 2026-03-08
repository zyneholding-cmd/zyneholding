import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Eye, Users, MapPin, Briefcase, CheckCircle, XCircle, Loader2,
  Star, TrendingUp, Shield, Zap, Clock, Send, FileText, BarChart3,
  Calendar, ArrowRight, MessageSquare, X, BadgeCheck, Crown,
} from "lucide-react";
import { PublishBusinessModal } from "@/components/PublishBusinessModal";
import { toast } from "sonner";
import { format } from "date-fns";

interface BusinessListing {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  team_size: string | null;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  views_count: number;
  application_count: number;
  created_at: string;
}

interface BusinessApplication {
  id: string;
  business_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  cover_letter: string | null;
  skills: string[];
  experience_level: string;
  status: string;
  created_at: string;
}

interface BusinessPosition {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  salary_range: string | null;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  is_open: boolean;
  applications_count: number;
  created_at: string;
}

interface HiringPipelineEntry {
  id: string;
  application_id: string;
  business_id: string;
  stage: string;
  notes: string | null;
  interview_date: string | null;
  interview_type: string | null;
  interview_link: string | null;
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

const PIPELINE_STAGES = ["applied", "screening", "interview", "offer", "hired", "rejected"];

const stageColors: Record<string, string> = {
  applied: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  screening: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  interview: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  offer: "bg-green-500/10 text-green-600 border-green-500/20",
  hired: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyBusinesses() {
  const { user } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [positions, setPositions] = useState<BusinessPosition[]>([]);
  const [pipeline, setPipeline] = useState<HiringPipelineEntry[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<BusinessApplication | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Position modal
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [positionForm, setPositionForm] = useState({
    business_id: "",
    title: "",
    description: "",
    requirements: "",
    salary_range: "",
    employment_type: "full-time",
    experience_level: "intermediate",
    skills_required: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  // Offer modal
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    application_id: "",
    business_id: "",
    applicant_email: "",
    position_title: "",
    salary: "",
    start_date: "",
    terms: "",
    benefits: [] as string[],
  });
  const [benefitInput, setBenefitInput] = useState("");

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchListings(), fetchApplications(), fetchPositions(), fetchPipeline(), fetchOffers()]);
    setLoading(false);
  };

  const fetchListings = async () => {
    if (!user) return;
    const { data } = await supabase.from("business_listings").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    if (data) setListings(data as any);
  };

  const fetchApplications = async () => {
    const { data } = await supabase.from("business_applications").select("*").order("created_at", { ascending: false });
    if (data) setApplications(data as any);
  };

  const fetchPositions = async () => {
    const { data } = await supabase.from("business_positions").select("*").order("created_at", { ascending: false });
    if (data) setPositions(data as any);
  };

  const fetchPipeline = async () => {
    const { data } = await supabase.from("hiring_pipeline").select("*").order("created_at", { ascending: false });
    if (data) setPipeline(data as any);
  };

  const fetchOffers = async () => {
    const { data } = await supabase.from("job_offers").select("*").order("created_at", { ascending: false });
    if (data) setOffers(data as any);
  };

  const updateAppStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("business_applications").update({ status } as any).eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(`Application ${status}`);
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      setSelectedApp(null);
    }
  };

  const moveToStage = async (appId: string, bizId: string, stage: string) => {
    const existing = pipeline.find(p => p.application_id === appId);
    if (existing) {
      await supabase.from("hiring_pipeline").update({ stage, updated_by: user?.id } as any).eq("id", existing.id);
    } else {
      await supabase.from("hiring_pipeline").insert({
        application_id: appId,
        business_id: bizId,
        stage,
        updated_by: user?.id,
      } as any);
    }

    // When hired, automatically add the applicant to the team
    if (stage === "hired") {
      const app = applications.find(a => a.id === appId);
      if (app) {
        await addHiredApplicantToTeam(app);
      }
    }

    fetchPipeline();
    toast.success(`Moved to ${stage}`);
  };

  const addHiredApplicantToTeam = async (app: BusinessApplication) => {
    try {
      // Find the user by email in profiles
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", app.email)
        .maybeSingle();

      if (profileData) {
        // Check if they already have a role
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id, role")
          .eq("user_id", profileData.id)
          .maybeSingle();

        if (!existingRole) {
          // Add member role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: profileData.id,
            role: "member",
            created_by: user?.id,
          } as any);
          if (roleError) console.error("Role insert error:", roleError);
        }

        // Update the application status to approved
        await supabase.from("business_applications").update({ status: "approved" } as any).eq("id", app.id);

        toast.success(`${app.full_name} has been added to your team!`);
      } else {
        toast.info(`${app.full_name} hasn't signed up yet — they'll join the team once they create an account.`);
      }
    } catch (err) {
      console.error("Failed to add to team:", err);
      toast.error("Failed to add to team");
    }
    }
  };

  const toggleListingStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    await supabase.from("business_listings").update({ status: newStatus } as any).eq("id", id);
    toast.success(`Listing ${newStatus}`);
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const addPosition = async () => {
    if (!positionForm.title || !positionForm.business_id) {
      toast.error("Title is required");
      return;
    }
    const { error } = await supabase.from("business_positions").insert({
      ...positionForm,
      skills_required: positionForm.skills_required,
    } as any);
    if (error) toast.error("Failed to add position");
    else {
      toast.success("Position added!");
      setPositionModalOpen(false);
      setPositionForm({ business_id: "", title: "", description: "", requirements: "", salary_range: "", employment_type: "full-time", experience_level: "intermediate", skills_required: [] });
      fetchPositions();
    }
  };

  const sendOffer = async () => {
    if (!offerForm.position_title || !offerForm.applicant_email) {
      toast.error("Fill required fields");
      return;
    }
    const { error } = await supabase.from("job_offers").insert({
      ...offerForm,
      start_date: offerForm.start_date || null,
    } as any);
    if (error) toast.error("Failed to send offer");
    else {
      toast.success("Offer sent!");
      setOfferModalOpen(false);
      fetchOffers();
      // Also update pipeline stage
      moveToStage(offerForm.application_id, offerForm.business_id, "offer");
    }
  };

  const togglePosition = async (id: string, isOpen: boolean) => {
    await supabase.from("business_positions").update({ is_open: !isOpen } as any).eq("id", id);
    fetchPositions();
  };

  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === "pending").length;
  const approvedApps = applications.filter(a => a.status === "approved").length;
  const totalViews = listings.reduce((s, l) => s + (l.views_count || 0), 0);

  const getStageForApp = (appId: string) => pipeline.find(p => p.application_id === appId)?.stage || "applied";

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Businesses</h1>
          <p className="text-muted-foreground mt-1">Manage listings, positions, applicants, and offers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPublishOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Business
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { icon: Briefcase, label: "Listings", value: listings.length, color: "text-primary" },
          { icon: Users, label: "Applications", value: totalApps, color: "text-blue-500" },
          { icon: Clock, label: "Pending", value: pendingApps, color: "text-yellow-500" },
          { icon: CheckCircle, label: "Approved", value: approvedApps, color: "text-green-500" },
          { icon: Eye, label: "Total Views", value: totalViews, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="p-4 flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-5">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><Briefcase className="h-3.5 w-3.5" />Listings</TabsTrigger>
          <TabsTrigger value="positions" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Positions</TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5 text-xs relative">
            <TrendingUp className="h-3.5 w-3.5" />Pipeline
            {pendingApps > 0 && <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">{pendingApps}</span>}
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-1.5 text-xs"><Send className="h-3.5 w-3.5" />Offers</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" />Analytics</TabsTrigger>
        </TabsList>

        {/* Listings Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(listing => {
              const appCount = applications.filter(a => a.business_id === listing.id).length;
              const pendCount = applications.filter(a => a.business_id === listing.id && a.status === "pending").length;
              const posCount = positions.filter(p => p.business_id === listing.id).length;
              return (
                <Card key={listing.id} className="p-5 hover:shadow-lg transition-all relative">
                  {listing.is_featured && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 gap-1">
                        <Crown className="h-3 w-3" /> Featured
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold truncate">{listing.title}</h3>
                        {listing.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {listing.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>}
                        <Badge variant={listing.status === "published" ? "default" : "secondary"} className="text-[10px] h-5">
                          {listing.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{posCount}</p>
                      <p className="text-[10px] text-muted-foreground">Positions</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{appCount}</p>
                      <p className="text-[10px] text-muted-foreground">Applicants</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold">{listing.views_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                  </div>

                  {pendCount > 0 && (
                    <Badge variant="destructive" className="mb-3 text-xs">{pendCount} pending review</Badge>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs"
                      onClick={() => { setPositionForm(p => ({ ...p, business_id: listing.id })); setPositionModalOpen(true); }}>
                      <Plus className="h-3 w-3" /> Position
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs"
                      onClick={() => { setSelectedListing(listing.id); setActiveTab("pipeline"); }}>
                      <Eye className="h-3 w-3" /> Pipeline
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs"
                      onClick={() => toggleListingStatus(listing.id, listing.status)}>
                      {listing.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </Card>
              );
            })}

            {listings.length === 0 && (
              <Card className="col-span-full p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses yet</h3>
                <p className="text-muted-foreground mb-4">Publish your first business to start receiving applications</p>
                <Button onClick={() => setPublishOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Publish Business</Button>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Open Positions</h3>
            {listings.length > 0 && (
              <Button size="sm" className="gap-1" onClick={() => {
                setPositionForm(p => ({ ...p, business_id: listings[0].id }));
                setPositionModalOpen(true);
              }}>
                <Plus className="h-3.5 w-3.5" /> Add Position
              </Button>
            )}
          </div>

          {positions.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No positions created yet. Add positions to your business listings.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {positions.map(pos => {
                const biz = listings.find(l => l.id === pos.business_id);
                return (
                  <Card key={pos.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{pos.title}</h4>
                            <Badge variant={pos.is_open ? "default" : "secondary"} className="text-[10px]">
                              {pos.is_open ? "Open" : "Closed"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{biz?.title || "Unknown"}</span>
                            <span className="capitalize">{pos.employment_type}</span>
                            <span className="capitalize">{pos.experience_level}</span>
                            {pos.salary_range && <span className="text-primary font-medium">{pos.salary_range}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pos.skills_required?.length > 0 && (
                          <div className="hidden md:flex gap-1">
                            {pos.skills_required.slice(0, 3).map((s, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                            ))}
                            {pos.skills_required.length > 3 && (
                              <Badge variant="outline" className="text-[10px]">+{pos.skills_required.length - 3}</Badge>
                            )}
                          </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => togglePosition(pos.id, pos.is_open)}>
                          {pos.is_open ? "Close" : "Reopen"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Hiring Pipeline Tab */}
        <TabsContent value="pipeline" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Hiring Pipeline</h3>
            {selectedListing && (
              <Badge variant="outline" className="gap-1">
                Showing: {listings.find(l => l.id === selectedListing)?.title}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedListing(null)} />
              </Badge>
            )}
          </div>

          {/* Stage columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {PIPELINE_STAGES.map(stage => {
              const stageApps = applications.filter(a => {
                const appStage = getStageForApp(a.id);
                const matchesBiz = !selectedListing || a.business_id === selectedListing;
                return appStage === stage && matchesBiz;
              });
              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`capitalize text-xs ${stageColors[stage] || ""}`}>
                      {stage}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">{stageApps.length}</span>
                  </div>
                  <div className="space-y-2 min-h-[100px]">
                    {stageApps.map(app => (
                      <Card key={app.id} className="p-3 cursor-pointer hover:shadow-md transition-all"
                        onClick={() => setSelectedApp(app)}>
                        <p className="font-medium text-sm truncate">{app.full_name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{app.position || "General"}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(app.created_at), "MMM d")}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Offers Tab */}
        <TabsContent value="offers" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Job Offers</h3>
          </div>

          {offers.length === 0 ? (
            <Card className="p-8 text-center">
              <Send className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No offers sent yet. Move applicants through the pipeline and send offers.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {offers.map(offer => (
                <Card key={offer.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Send className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{offer.position_title}</h4>
                        <p className="text-xs text-muted-foreground">{offer.applicant_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {offer.salary && <span className="text-sm font-medium text-primary">{offer.salary}</span>}
                      <Badge variant={offer.status === "accepted" ? "default" : offer.status === "declined" ? "destructive" : "secondary"} className="capitalize">
                        {offer.status}
                      </Badge>
                    </div>
                  </div>
                  {offer.start_date && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Start: {format(new Date(offer.start_date), "MMM d, yyyy")}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-6 space-y-6">
          <h3 className="text-lg font-semibold">Business Analytics</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map(listing => {
              const appCount = applications.filter(a => a.business_id === listing.id).length;
              const pendCount = applications.filter(a => a.business_id === listing.id && a.status === "pending").length;
              const approvedCount = applications.filter(a => a.business_id === listing.id && a.status === "approved").length;
              const rejectedCount = applications.filter(a => a.business_id === listing.id && a.status === "rejected").length;
              const posCount = positions.filter(p => p.business_id === listing.id).length;
              const offerCount = offers.filter(o => o.business_id === listing.id).length;
              const conversionRate = appCount > 0 ? Math.round((approvedCount / appCount) * 100) : 0;

              return (
                <Card key={listing.id} className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold">{listing.title}</h4>
                    {listing.is_verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                    {listing.is_featured && <Crown className="h-4 w-4 text-yellow-500" />}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold">{listing.views_count || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold">{appCount}</p>
                      <p className="text-[10px] text-muted-foreground">Applicants</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-xl font-bold">{conversionRate}%</p>
                      <p className="text-[10px] text-muted-foreground">Conversion</p>
                    </div>
                  </div>

                  {/* Funnel */}
                  <div className="space-y-1.5">
                    {[
                      { label: "Applied", count: appCount, color: "bg-blue-500" },
                      { label: "Screening", count: pipeline.filter(p => p.business_id === listing.id && p.stage === "screening").length, color: "bg-yellow-500" },
                      { label: "Interview", count: pipeline.filter(p => p.business_id === listing.id && p.stage === "interview").length, color: "bg-purple-500" },
                      { label: "Offered", count: offerCount, color: "bg-green-500" },
                      { label: "Hired", count: pipeline.filter(p => p.business_id === listing.id && p.stage === "hired").length, color: "bg-emerald-500" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16">{item.label}</span>
                        <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`}
                            style={{ width: `${appCount > 0 ? Math.max((item.count / appCount) * 100, item.count > 0 ? 8 : 0) : 0}%` }} />
                        </div>
                        <span className="text-xs font-medium w-6 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={o => { if (!o) setSelectedApp(null); }}>
        <DialogContent className="max-w-lg">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApp.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p><strong>Email:</strong> {selectedApp.email}</p>
                {selectedApp.phone && <p><strong>Phone:</strong> {selectedApp.phone}</p>}
                {selectedApp.position && <p><strong>Position:</strong> {selectedApp.position}</p>}
                <p><strong>Experience:</strong> <span className="capitalize">{selectedApp.experience_level}</span></p>
                <p><strong>Pipeline Stage:</strong>
                  <Badge variant="outline" className={`ml-2 capitalize ${stageColors[getStageForApp(selectedApp.id)] || ""}`}>
                    {getStageForApp(selectedApp.id)}
                  </Badge>
                </p>
                {selectedApp.skills?.length > 0 && (
                  <div>
                    <strong>Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApp.skills.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {selectedApp.cover_letter && (
                  <div>
                    <strong>Cover Letter:</strong>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-1">{selectedApp.cover_letter}</p>
                  </div>
                )}

                {/* Pipeline Actions */}
                <div className="pt-2">
                  <Label className="text-xs text-muted-foreground mb-2 block">Move to Stage</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PIPELINE_STAGES.map(stage => (
                      <Button key={stage} variant={getStageForApp(selectedApp.id) === stage ? "default" : "outline"}
                        size="sm" className="capitalize text-xs h-7"
                        onClick={() => moveToStage(selectedApp.id, selectedApp.business_id, stage)}>
                        {stage}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selectedApp.status === "pending" && (
                    <>
                      <Button onClick={() => { updateAppStatus(selectedApp.id, "approved"); moveToStage(selectedApp.id, selectedApp.business_id, "screening"); }}
                        className="flex-1 gap-1" size="sm">
                        <CheckCircle className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button variant="destructive" onClick={() => { updateAppStatus(selectedApp.id, "rejected"); moveToStage(selectedApp.id, selectedApp.business_id, "rejected"); }}
                        className="flex-1 gap-1" size="sm">
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm" className="gap-1"
                    onClick={() => {
                      setOfferForm({
                        application_id: selectedApp.id,
                        business_id: selectedApp.business_id,
                        applicant_email: selectedApp.email,
                        position_title: selectedApp.position || "",
                        salary: "", start_date: "", terms: "", benefits: [],
                      });
                      setOfferModalOpen(true);
                      setSelectedApp(null);
                    }}>
                    <Send className="h-3.5 w-3.5" /> Send Offer
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Position Modal */}
      <Dialog open={positionModalOpen} onOpenChange={setPositionModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Position</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Business</Label>
              <Select value={positionForm.business_id} onValueChange={v => setPositionForm(p => ({ ...p, business_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select business" /></SelectTrigger>
                <SelectContent>
                  {listings.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position Title *</Label>
              <Input value={positionForm.title} onChange={e => setPositionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Senior Developer" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Employment Type</Label>
                <Select value={positionForm.employment_type} onValueChange={v => setPositionForm(p => ({ ...p, employment_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["full-time", "part-time", "contract", "freelance", "internship"].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Salary Range</Label>
                <Input value={positionForm.salary_range} onChange={e => setPositionForm(p => ({ ...p, salary_range: e.target.value }))} placeholder="$50k-$80k" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={positionForm.description} onChange={e => setPositionForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <Label>Skills Required</Label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (skillInput.trim()) { setPositionForm(p => ({ ...p, skills_required: [...p.skills_required, skillInput.trim()] })); setSkillInput(""); } } }}
                  placeholder="Add skill" />
                <Button variant="outline" onClick={() => { if (skillInput.trim()) { setPositionForm(p => ({ ...p, skills_required: [...p.skills_required, skillInput.trim()] })); setSkillInput(""); } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {positionForm.skills_required.map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPositionForm(p => ({ ...p, skills_required: p.skills_required.filter((_, j) => j !== i) }))} />
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={addPosition} className="w-full">Add Position</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Offer Modal */}
      <Dialog open={offerModalOpen} onOpenChange={setOfferModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Send Job Offer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>To</Label>
              <Input value={offerForm.applicant_email} readOnly className="bg-muted/50" />
            </div>
            <div>
              <Label>Position Title *</Label>
              <Input value={offerForm.position_title} onChange={e => setOfferForm(p => ({ ...p, position_title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Salary</Label>
                <Input value={offerForm.salary} onChange={e => setOfferForm(p => ({ ...p, salary: e.target.value }))} placeholder="$60,000/year" />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={offerForm.start_date} onChange={e => setOfferForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Terms & Conditions</Label>
              <Textarea rows={3} value={offerForm.terms} onChange={e => setOfferForm(p => ({ ...p, terms: e.target.value }))} placeholder="Employment terms..." />
            </div>
            <div>
              <Label>Benefits</Label>
              <div className="flex gap-2">
                <Input value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (benefitInput.trim()) { setOfferForm(p => ({ ...p, benefits: [...p.benefits, benefitInput.trim()] })); setBenefitInput(""); } } }}
                  placeholder="Add benefit" />
                <Button variant="outline" onClick={() => { if (benefitInput.trim()) { setOfferForm(p => ({ ...p, benefits: [...p.benefits, benefitInput.trim()] })); setBenefitInput(""); } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {offerForm.benefits.map((b, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{b}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOfferForm(p => ({ ...p, benefits: p.benefits.filter((_, j) => j !== i) }))} />
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={sendOffer} className="w-full gap-2"><Send className="h-4 w-4" /> Send Offer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <PublishBusinessModal open={publishOpen} onOpenChange={setPublishOpen} onPublished={fetchAll} />
    </div>
  );
}
