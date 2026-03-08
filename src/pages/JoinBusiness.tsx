import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, Search, MapPin, Users, Star, Globe, Briefcase,
  Send, Loader2, CheckCircle, X, BarChart3,
} from "lucide-react";
import { toast } from "sonner";

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

const CATEGORY_COLORS: Record<string, string> = {
  technology: "bg-blue-500/10 text-blue-500",
  finance: "bg-green-500/10 text-green-500",
  marketing: "bg-purple-500/10 text-purple-500",
  design: "bg-pink-500/10 text-pink-500",
  healthcare: "bg-red-500/10 text-red-500",
  education: "bg-yellow-500/10 text-yellow-500",
  retail: "bg-orange-500/10 text-orange-500",
  other: "bg-muted text-muted-foreground",
};

export default function JoinBusiness() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessListing | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("business_listings")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data) setListings(data as any);
    setLoading(false);
  };

  const filtered = listings.filter((l) => {
    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || l.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const addSkill = () => {
    if (skillInput.trim() && !applyForm.skills.includes(skillInput.trim())) {
      setApplyForm((p) => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const handleApply = async () => {
    if (!selectedBusiness || !applyForm.full_name || !applyForm.email) {
      toast.error("Please fill in required fields");
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
      setSubmitted(true);
      toast.success("Application submitted!");
    }
    setSubmitting(false);
  };

  const categories = [...new Set(listings.map((l) => l.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/landing")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join Zyne's Business
              </span>
            </div>
          </div>
          <Button onClick={() => navigate("/auth")} variant="outline">Sign In</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find Your Next <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Opportunity</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Browse businesses on Zyne Holding and apply to join the ones that match your skills and passion.
        </p>
        <div className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c!}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No businesses listed yet</h3>
            <p className="text-muted-foreground">Check back soon for new opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((biz) => (
              <Card
                key={biz.id}
                className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group border-border/50 hover:border-primary/30"
                onClick={() => { setSelectedBusiness(biz); setSubmitted(false); }}
              >
                {/* Cover */}
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                  {biz.cover_image_url ? (
                    <img src={biz.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Briefcase className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  {biz.category && (
                    <Badge className={`absolute top-3 left-3 ${CATEGORY_COLORS[biz.category] || CATEGORY_COLORS.other}`}>
                      {biz.category}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {biz.logo_url ? (
                      <img src={biz.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {biz.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {biz.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{biz.location}</span>
                        )}
                        {biz.team_size && (
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{biz.team_size}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {biz.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between">
                    {biz.salary_range && (
                      <span className="text-sm font-medium text-primary">{biz.salary_range}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{biz.rating || "New"}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Business Detail / Apply Dialog */}
      <Dialog open={!!selectedBusiness} onOpenChange={(o) => { if (!o) setSelectedBusiness(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBusiness && !applyDialogOpen && !submitted && (
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
                    <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="h-4 w-4" />Website
                    </a>
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

                {selectedBusiness.salary_range && (
                  <div>
                    <h4 className="font-semibold mb-1">Salary Range</h4>
                    <p className="text-sm font-medium text-primary">{selectedBusiness.salary_range}</p>
                  </div>
                )}

                <Button className="w-full gap-2" size="lg" onClick={() => setApplyDialogOpen(true)}>
                  <Send className="h-4 w-4" /> Apply Now
                </Button>
              </div>
            </>
          )}

          {selectedBusiness && applyDialogOpen && !submitted && (
            <>
              <DialogHeader>
                <DialogTitle>Apply to {selectedBusiness.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={applyForm.full_name} onChange={(e) => setApplyForm((p) => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={applyForm.email} onChange={(e) => setApplyForm((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={applyForm.phone} onChange={(e) => setApplyForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input placeholder="e.g. Frontend Developer" value={applyForm.position} onChange={(e) => setApplyForm((p) => ({ ...p, position: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Experience Level</Label>
                  <Select value={applyForm.experience_level} onValueChange={(v) => setApplyForm((p) => ({ ...p, experience_level: v }))}>
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
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill"
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {applyForm.skills.map((s, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {s}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setApplyForm((p) => ({ ...p, skills: p.skills.filter((_, j) => j !== i) }))} />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Cover Letter</Label>
                  <Textarea rows={4} value={applyForm.cover_letter} onChange={(e) => setApplyForm((p) => ({ ...p, cover_letter: e.target.value }))} placeholder="Tell them why you're a great fit..." />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setApplyDialogOpen(false)} className="flex-1">Back</Button>
                  <Button onClick={handleApply} disabled={submitting} className="flex-1 gap-2">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Application
                  </Button>
                </div>
              </div>
            </>
          )}

          {submitted && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold">Application Submitted!</h3>
              <p className="text-muted-foreground">The business owner will review your application and get back to you.</p>
              <Button onClick={() => { setSelectedBusiness(null); setApplyDialogOpen(false); setSubmitted(false); }}>
                Browse More
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
