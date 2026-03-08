import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  X,
  Briefcase,
  Code,
  Palette,
  TrendingUp,
  Megaphone,
  PenTool,
  Database,
  Headphones,
  BarChart3,
  CheckCircle,
  Loader2,
} from "lucide-react";

const SKILL_SUGGESTIONS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "UI/UX Design", "Graphic Design", "Data Analysis", "Marketing",
  "Sales", "Customer Support", "Project Management", "Accounting",
  "Content Writing", "SEO", "Social Media", "Video Editing",
  "Photography", "Machine Learning", "DevOps", "Mobile Development",
];

const CATEGORIES = [
  { id: "development", label: "Development", icon: Code },
  { id: "design", label: "Design", icon: Palette },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "writing", label: "Writing", icon: PenTool },
  { id: "data", label: "Data & Analytics", icon: Database },
  { id: "support", label: "Support", icon: Headphones },
  { id: "management", label: "Management", icon: Briefcase },
];

export default function JoinUs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    purpose: "",
    experience_level: "intermediate",
    portfolio_link: "",
    hourly_rate: "",
    availability: "full-time",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.purpose) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (categories.length === 0) {
      toast({ title: "Select a category", description: "Please select at least one expertise category.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      let profile_photo_url: string | null = null;
      let resume_url: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `photos/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("application-files").upload(path, photoFile);
        if (!error) {
          const { data: urlData } = supabase.storage.from("application-files").getPublicUrl(path);
          profile_photo_url = urlData.publicUrl;
        }
      }

      if (resumeFile) {
        const ext = resumeFile.name.split(".").pop();
        const path = `resumes/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("application-files").upload(path, resumeFile);
        if (!error) {
          const { data: urlData } = supabase.storage.from("application-files").getPublicUrl(path);
          resume_url = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("job_applications" as any).insert({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        bio: form.bio || null,
        purpose: form.purpose,
        skills,
        categories,
        experience_level: form.experience_level,
        portfolio_link: form.portfolio_link || null,
        resume_url,
        profile_photo_url,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        availability: form.availability,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Application submitted!", description: "We'll review your application and get back to you soon." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to submit application", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Application Submitted!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your interest in joining Zyne Holding. Our team will review your application and get back to you shortly.
          </p>
          <Button onClick={() => navigate("/landing")} size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/landing")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Zyne Holding</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Join Our Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We're looking for talented people to join Zyne Holding. Tell us about yourself and how you can contribute.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo */}
          <div className="flex justify-center">
            <label className="cursor-pointer group">
              <div className="w-28 h-28 rounded-full border-2 border-dashed border-border group-hover:border-primary transition-colors flex items-center justify-center overflow-hidden bg-muted">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1 block">Photo</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          {/* Personal Info */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="Your full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+1 234 567 890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Portfolio Link</Label>
                <Input placeholder="https://your-portfolio.com" value={form.portfolio_link} onChange={(e) => setForm({ ...form, portfolio_link: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea placeholder="Tell us a bit about yourself..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Why do you want to join? *</h2>
            <Textarea
              placeholder="Tell us what motivates you, what you want to achieve, and how you can contribute to Zyne Holding..."
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              rows={4}
              required
            />
          </div>

          {/* Expertise Categories */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Areas of Expertise *</h2>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Skills</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>Add</Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="pl-3 pr-1 py-1.5 gap-1">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).slice(0, 12).map((s) => (
                <button key={s} type="button" onClick={() => addSkill(s)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Professional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={form.experience_level} onValueChange={(v) => setForm({ ...form, experience_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 yr)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (2-4 yr)</SelectItem>
                    <SelectItem value="expert">Expert (5+ yr)</SelectItem>
                    <SelectItem value="lead">Lead / Senior (8+ yr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input type="number" placeholder="e.g. 50" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Resume / CV</h2>
            <label className="cursor-pointer block">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary transition-colors">
                {resumeFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-medium">{resumeFile.name}</span>
                    <button type="button" onClick={(e) => { e.preventDefault(); setResumeFile(null); }}>
                      <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Click to upload your resume (PDF, DOC)</p>
                  </>
                )}
              </div>
              {!resumeFile && <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />}
            </label>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
