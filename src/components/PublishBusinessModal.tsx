import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}

const CATEGORIES = [
  "technology", "finance", "marketing", "design",
  "healthcare", "education", "retail", "other",
];

export function PublishBusinessModal({ open, onOpenChange, onPublished }: Props) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [benefitInput, setBenefitInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "technology",
    location: "",
    team_size: "",
    website: "",
    requirements: "",
    salary_range: "",
    benefits: [] as string[],
    culture: "",
  });

  const addBenefit = () => {
    if (benefitInput.trim() && !form.benefits.includes(benefitInput.trim())) {
      setForm((p) => ({ ...p, benefits: [...p.benefits, benefitInput.trim()] }));
      setBenefitInput("");
    }
  };

  const handleSubmit = async () => {
    if (!user || !form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from("business_listings").insert({
      owner_id: user.id,
      title: form.title,
      description: form.description || null,
      category: form.category,
      location: form.location || null,
      team_size: form.team_size || null,
      website: form.website || null,
      requirements: form.requirements || null,
      salary_range: form.salary_range || null,
      benefits: form.benefits,
      culture: form.culture || null,
      status: "published",
    } as any);

    if (error) {
      toast.error("Failed to publish: " + error.message);
    } else {
      toast.success("Business published successfully!");
      onPublished();
      onOpenChange(false);
      setForm({
        title: "", description: "", category: "technology", location: "",
        team_size: "", website: "", requirements: "", salary_range: "",
        benefits: [], culture: "",
      });
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish Your Business</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Business Title *</Label>
            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Zyne Tech Solutions" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Tell potential applicants about your business..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="e.g. New York, Remote" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team Size</Label>
              <Input value={form.team_size} onChange={(e) => setForm((p) => ({ ...p, team_size: e.target.value }))} placeholder="e.g. 10-50" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label>Salary Range</Label>
            <Input value={form.salary_range} onChange={(e) => setForm((p) => ({ ...p, salary_range: e.target.value }))} placeholder="e.g. $50k - $80k / year" />
          </div>

          <div>
            <Label>Requirements</Label>
            <Textarea rows={3} value={form.requirements} onChange={(e) => setForm((p) => ({ ...p, requirements: e.target.value }))} placeholder="What skills or qualifications are needed?" />
          </div>

          <div>
            <Label>Company Culture</Label>
            <Textarea rows={3} value={form.culture} onChange={(e) => setForm((p) => ({ ...p, culture: e.target.value }))} placeholder="Describe your work environment..." />
          </div>

          <div>
            <Label>Benefits</Label>
            <div className="flex gap-2">
              <Input value={benefitInput} onChange={(e) => setBenefitInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())} placeholder="e.g. Health insurance" />
              <Button type="button" variant="outline" size="icon" onClick={addBenefit}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {form.benefits.map((b, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {b}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setForm((p) => ({ ...p, benefits: p.benefits.filter((_, j) => j !== i) }))} />
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2" size="lg">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Publish Business
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
