import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  positions: any[];
  rating: number;
  created_at: string;
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

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(null);
  const [applyMode, setApplyMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [applyForm, setApplyForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    position: "",
    cover_letter: "",
    experience_level: "intermediate",
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchListings(), fetchMyApplications(), fetchProfile()]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      setProfile(data);
      setApplyForm(prev => ({
        ...prev,
        full_name: data.full_name || "",
        email: data.email || "",
      }));
    }
  };

  const fetchListings = async () => {
    const { data } = await supabase
      .from("business_listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    if (data) setListings(data as any);
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    const { data: apps } = await supabase
      .from("business_applications")
      .select("*")
      .eq("email", user.email || "")
      .order("created_at", { ascending: false });

    if (apps) {
      // Fetch business titles
      const bizIds = [...new Set(apps.map(a => a.business_id))];
      const { data: businesses } = await supabase
        .from("business_listings")
        .select("id, title")
        .in("id", bizIds.length > 0 ? bizIds : ["none"]);

      const bizMap = new Map(businesses?.map(b => [b.id, b.title]) || []);
      setMyApplications(apps.map(a => ({
        ...a,
        business_title: bizMap.get(a.business_id) || "Unknown Business",
      })) as any);
    }
  };

  const filtered = listings.filter((l) => {
    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const addSkill = () => {
    if (skillInput.trim() && !applyForm.skills.includes(skillInput.trim())) {
      setApplyForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const alreadyApplied = (bizId: string) =>
    myApplications.some(a => a.business_id === bizId);

  const handleApply = async () => {
    if (!selectedBusiness || !applyForm.full_name || !applyForm.email) {
      toast.error("Please fill in required fields");
      return;
    }
    if (alreadyApplied(selectedBusiness.id)) {
      toast.error("You've already applied to this business");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("business_applications").insert({
      business_id: selectedBusiness.id,
      full_name: applyForm.full_name,
      email: applyForm.email,
      phone: applyForm.phone || null,
      position: applyForm.position || null,
      cover_letter: applyForm.cover_letter || null,
      skills: applyForm.skills,
      experience_level: applyForm.experience_level,
    } as any);

    if (error) {
      toast.error("Failed to submit application");
    } else {
      toast.success("Application submitted successfully!");
      setSelectedBusiness(null);
      setApplyMode(false);
      fetchMyApplications();
    }
    setSubmitting(false);
  };

  const categories = [...new Set(listings.map(l => l.category).filter(Boolean))];

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "rejected": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    }
  };

  const pendingCount = myApplications.filter(a => a.status === "pending").length;
  const approvedCount = myApplications.filter(a => a.status === "approved").length;
  const rejectedCount = myApplications.filter(a => a.status === "rejected").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employee Hub</h1>
          <p className="text-muted-foreground mt-1">
            Discover opportunities and track your applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="flex items-center gap-2 px-4 py-2 border-border/50">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{pendingCount} Pending</span>
          </Card>
          <Card className="flex items-center gap-2 px-4 py-2 border-border/50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{approvedCount} Approved</span>
          </Card>
          <Card className="flex items-center gap-2 px-4 py-2 border-border/50">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{listings.length} Open</span>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="discover" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-1.5 relative">
            <FileText className="h-3.5 w-3.5" />
            My Applications
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            My Profile
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses, categories, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c!}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try adjusting your search" : "Check back soon for new opportunities!"}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(biz => {
                const applied = alreadyApplied(biz.id);
                return (
                  <Card
                    key={biz.id}
                    className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group border-border/50 hover:border-primary/30"
                    onClick={() => { setSelectedBusiness(biz); setApplyMode(false); }}
                  >
                    <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                      {biz.cover_image_url ? (
                        <img src={biz.cover_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building2 className="h-10 w-10 text-primary/20" />
                        </div>
                      )}
                      {biz.category && (
                        <Badge className={`absolute top-3 left-3 border ${CATEGORY_COLORS[biz.category] || CATEGORY_COLORS.other}`}>
                          {biz.category}
                        </Badge>
                      )}
                      {applied && (
                        <Badge className="absolute top-3 right-3 bg-green-500/90 text-white border-0">
                          Applied
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        {biz.logo_url ? (
                          <img src={biz.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{biz.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {biz.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.location}</span>}
                            {biz.team_size && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{biz.team_size}</span>}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {biz.description || "No description provided."}
                      </p>
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

        {/* My Applications Tab */}
        <TabsContent value="applications" className="space-y-4 mt-6">
          {myApplications.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">Start discovering businesses and submit your first application</p>
              <Button onClick={() => setActiveTab("discover")} className="gap-2">
                <Search className="h-4 w-4" /> Browse Opportunities
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => (
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
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`gap-1 ${statusColor(app.status)}`}>
                        {statusIcon(app.status)}
                        <span className="capitalize">{app.status}</span>
                      </Badge>
                    </div>
                  </div>
                  {app.status === "approved" && (
                    <div className="mt-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Congratulations! Your application has been approved. The business owner may reach out to you soon.
                      </p>
                    </div>
                  )}
                  {app.status === "rejected" && (
                    <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        This application was not selected. Keep exploring other opportunities!
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card className="p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Employee Profile</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={profile?.full_name || ""} readOnly className="bg-muted/50" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={profile?.email || ""} readOnly className="bg-muted/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Job Title</Label>
                  <Input value={profile?.job_title || ""} readOnly className="bg-muted/50" />
                </div>
                <div>
                  <Label>Business</Label>
                  <Input value={profile?.business_name || ""} readOnly className="bg-muted/50" />
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Application Stats
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{myApplications.length}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{approvedCount}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                To update your profile, go to Team & Profile from the main menu.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Business Detail / Apply Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={(o) => { if (!o) { setSelectedBusiness(null); setApplyMode(false); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedBusiness && !applyMode && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedBusiness.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {selectedBusiness.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{selectedBusiness.location}</span>
                  )}
                  {selectedBusiness.team_size && (
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{selectedBusiness.team_size}</span>
                  )}
                  {selectedBusiness.website && (
                    <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-4 w-4" />Website
                    </a>
                  )}
                  {selectedBusiness.salary_range && (
                    <span className="flex items-center gap-1 font-medium text-primary">
                      {selectedBusiness.salary_range}
                    </span>
                  )}
                </div>

                {selectedBusiness.description && (
                  <div>
                    <h4 className="font-semibold mb-1">About</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.description}</p>
                  </div>
                )}
                {selectedBusiness.requirements && (
                  <div>
                    <h4 className="font-semibold mb-1">Requirements</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.requirements}</p>
                  </div>
                )}
                {selectedBusiness.culture && (
                  <div>
                    <h4 className="font-semibold mb-1">Company Culture</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedBusiness.culture}</p>
                  </div>
                )}
                {selectedBusiness.benefits?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBusiness.benefits.map((b, i) => (
                        <Badge key={i} variant="secondary">{b}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {alreadyApplied(selectedBusiness.id) ? (
                  <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-600">You've already applied to this business</p>
                    <p className="text-sm text-muted-foreground mt-1">Check your applications tab for status updates</p>
                  </div>
                ) : (
                  <Button className="w-full gap-2" size="lg" onClick={() => setApplyMode(true)}>
                    <Send className="h-4 w-4" /> Apply Now
                  </Button>
                )}
              </div>
            </>
          )}

          {selectedBusiness && applyMode && (
            <>
              <DialogHeader>
                <DialogTitle>Apply to {selectedBusiness.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={applyForm.full_name}
                      onChange={e => setApplyForm(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={applyForm.email}
                      onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={applyForm.phone}
                      onChange={e => setApplyForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input placeholder="e.g. Frontend Developer" value={applyForm.position}
                      onChange={e => setApplyForm(p => ({ ...p, position: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Select value={applyForm.experience_level}
                    onValueChange={v => setApplyForm(p => ({ ...p, experience_level: v }))}>
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
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill" />
                    <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {applyForm.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {s}
                        <X className="h-3 w-3 cursor-pointer"
                          onClick={() => setApplyForm(p => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Cover Letter</Label>
                  <Textarea rows={4} value={applyForm.cover_letter}
                    onChange={e => setApplyForm(p => ({ ...p, cover_letter: e.target.value }))}
                    placeholder="Tell them why you're a great fit..." />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setApplyMode(false)} className="flex-1">Back</Button>
                  <Button onClick={handleApply} disabled={submitting} className="flex-1 gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Application
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
