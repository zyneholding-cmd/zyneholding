import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, UserCheck, Briefcase, ArrowRight, ArrowLeft, Loader2,
  Sparkles, Users, Target, Coffee, ShoppingCart, Laptop, Heart,
  GraduationCap, Hammer, Truck, Camera, Utensils, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getImplementedTools, businessTools } from "@/data/businessTools";
import { cn } from "@/lib/utils";

const BUSINESS_TYPES = [
  { id: "cafe", label: "Café / Restaurant", icon: Coffee, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { id: "retail", label: "Retail / E-commerce", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { id: "technology", label: "Technology / SaaS", icon: Laptop, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { id: "healthcare", label: "Healthcare", icon: Heart, color: "bg-red-500/10 text-red-600 border-red-500/20" },
  { id: "education", label: "Education", icon: GraduationCap, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { id: "construction", label: "Construction", icon: Hammer, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  { id: "logistics", label: "Logistics / Delivery", icon: Truck, color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  { id: "creative", label: "Creative Agency", icon: Camera, color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  { id: "food", label: "Food & Beverage", icon: Utensils, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { id: "other", label: "Other", icon: Briefcase, color: "bg-muted text-muted-foreground border-border" },
];

const BUSINESS_GOALS = [
  "Track sales & revenue",
  "Manage inventory",
  "Handle invoicing & billing",
  "Manage team & employees",
  "Track customer relationships",
  "Schedule & calendar management",
  "Document management",
  "Task & project management",
  "Marketing & campaigns",
  "Analytics & reporting",
];

const TEAM_SIZES = ["Just me", "2-5", "6-15", "16-50", "50+"];

// AI-like tool suggestion based on business type and goals
function suggestTools(bizType: string, goals: string[]): string[] {
  const suggestions = new Set<string>();
  // Always include overview
  suggestions.add("overview");

  const goalToolMap: Record<string, string[]> = {
    "Track sales & revenue": ["sales", "customers"],
    "Manage inventory": ["products"],
    "Handle invoicing & billing": ["invoices"],
    "Manage team & employees": ["team"],
    "Track customer relationships": ["customers"],
    "Schedule & calendar management": ["calendar"],
    "Document management": ["documents"],
    "Task & project management": ["tasks"],
    "Marketing & campaigns": ["analytics"],
    "Analytics & reporting": ["analytics"],
  };

  goals.forEach(g => {
    goalToolMap[g]?.forEach(t => suggestions.add(t));
  });

  // Business type specifics
  if (["cafe", "food", "retail"].includes(bizType)) {
    suggestions.add("products");
    suggestions.add("sales");
    suggestions.add("invoices");
  }
  if (["technology", "creative"].includes(bizType)) {
    suggestions.add("tasks");
    suggestions.add("documents");
    suggestions.add("team");
  }

  return Array.from(suggestions);
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<"business" | "employee" | null>(null);
  const [businessType, setBusinessType] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [suggestedToolIds, setSuggestedToolIds] = useState<string[]>([]);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = userType === "business" ? 5 : 1;

  const handleChooseType = (type: "business" | "employee") => {
    setUserType(type);
    if (type === "employee") {
      completeOnboarding("employee");
    } else {
      setStep(1);
    }
  };

  const handleGoalsNext = () => {
    const suggested = suggestTools(businessType, goals);
    setSuggestedToolIds(suggested);
    setSelectedToolIds(suggested);
    setStep(4);
  };

  const toggleTool = (id: string) => {
    setSelectedToolIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const completeOnboarding = async (type: "business" | "employee") => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      await supabase.from("profiles").update({
        onboarding_completed: true,
        user_type: type,
        business_name: type === "business" ? businessName || null : null,
      } as any).eq("id", user.id);

      // Save selected tools for business owners
      if (type === "business" && selectedToolIds.length > 0) {
        // Clear existing tools
        await supabase.from("user_business_tools").delete().eq("user_id", user.id);
        // Insert selected
        const inserts = selectedToolIds.map((tool_id, i) => ({
          user_id: user.id,
          tool_id,
          position: i,
        }));
        await supabase.from("user_business_tools").insert(inserts);
      }

      toast.success("Welcome to Zyne Holding!");
      navigate(type === "business" ? "/dashboard" : "/employee");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const implementedTools = getImplementedTools();
  const allToolsForDisplay = businessTools.filter(t => t.isImplemented);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-primary-foreground font-bold text-2xl">Z</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome to Zyne Holding</h1>
          <p className="text-muted-foreground mt-1">Let's set up your account</p>
        </div>

        {/* Step 0: Choose type */}
        {step === 0 && !userType && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">What are you looking for?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group text-center"
                onClick={() => handleChooseType("business")}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Build My Business</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage your own business with powerful tools, team management, and analytics
                </p>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group text-center"
                onClick={() => handleChooseType("employee")}
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Hired</h3>
                <p className="text-sm text-muted-foreground">
                  Discover businesses, apply for positions, build your portfolio, and grow your career
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Step 1: Business Type */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">What kind of business?</h2>
              <Badge variant="outline">Step 1 of 4</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {BUSINESS_TYPES.map(bt => {
                const Icon = bt.icon;
                return (
                  <Card
                    key={bt.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all text-center hover:shadow-md",
                      businessType === bt.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"
                    )}
                    onClick={() => setBusinessType(bt.id)}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 border", bt.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">{bt.label}</p>
                  </Card>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => { setStep(0); setUserType(null); }} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 gap-1" disabled={!businessType} onClick={() => setStep(2)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Business Name & Team Size */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Tell us about your business</h2>
              <Badge variant="outline">Step 2 of 4</Badge>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  placeholder="e.g. My Awesome Cafe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Team Size</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {TEAM_SIZES.map(size => (
                    <Card
                      key={size}
                      className={cn(
                        "p-3 text-center cursor-pointer transition-all text-sm",
                        teamSize === size ? "ring-2 ring-primary border-primary" : "hover:border-primary/30"
                      )}
                      onClick={() => setTeamSize(size)}
                    >
                      {size}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 gap-1" onClick={() => setStep(3)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">What are your goals?</h2>
              <Badge variant="outline">Step 3 of 4</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Select all that apply. We'll suggest the best tools for you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {BUSINESS_GOALS.map(goal => (
                <Card
                  key={goal}
                  className={cn(
                    "p-3 cursor-pointer transition-all flex items-center gap-3",
                    goals.includes(goal) ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/30"
                  )}
                  onClick={() => setGoals(prev => prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal])}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    goals.includes(goal) ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {goals.includes(goal) && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="text-sm font-medium">{goal}</span>
                </Card>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 gap-1" disabled={goals.length === 0} onClick={handleGoalsNext}>
                <Sparkles className="h-4 w-4" /> Get AI Suggestions
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: AI-Suggested Tools */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Recommended Tools</h2>
              <Badge variant="outline">Step 4 of 4</Badge>
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary shrink-0" />
              <p className="text-sm">Based on your business type and goals, we recommend these tools. You can customize later.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {allToolsForDisplay.map(tool => {
                const Icon = tool.icon;
                const isSelected = selectedToolIds.includes(tool.id);
                const isSuggested = suggestedToolIds.includes(tool.id);
                return (
                  <Card
                    key={tool.id}
                    className={cn(
                      "p-3 cursor-pointer transition-all flex items-center gap-3",
                      isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/30"
                    )}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{tool.name}</p>
                      {isSuggested && <Badge variant="secondary" className="text-[9px] h-4 mt-0.5">AI Pick</Badge>}
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 gap-2" disabled={saving} onClick={() => completeOnboarding("business")}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Complete Setup
              </Button>
            </div>
          </div>
        )}

        {/* Skip button */}
        {step > 0 && (
          <div className="text-center mt-4">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              onClick={() => completeOnboarding("business")}
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
