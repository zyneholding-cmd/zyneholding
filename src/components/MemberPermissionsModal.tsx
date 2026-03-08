import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Shield, Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  currentRole: string;
}

const PERMISSIONS = [
  { key: "view_sales", label: "View Sales", group: "Sales" },
  { key: "edit_sales", label: "Edit Sales", group: "Sales" },
  { key: "delete_sales", label: "Delete Sales", group: "Sales" },
  { key: "view_products", label: "View Products", group: "Products" },
  { key: "edit_products", label: "Edit Products", group: "Products" },
  { key: "delete_products", label: "Delete Products", group: "Products" },
  { key: "view_customers", label: "View Customers", group: "Customers" },
  { key: "edit_customers", label: "Edit Customers", group: "Customers" },
  { key: "view_tasks", label: "View Tasks", group: "Tasks" },
  { key: "edit_tasks", label: "Edit Tasks", group: "Tasks" },
  { key: "view_documents", label: "View Documents", group: "Documents" },
  { key: "edit_documents", label: "Edit Documents", group: "Documents" },
  { key: "view_invoices", label: "View Invoices", group: "Invoices" },
  { key: "edit_invoices", label: "Edit Invoices", group: "Invoices" },
  { key: "view_calendar", label: "View Calendar", group: "Calendar" },
  { key: "edit_calendar", label: "Edit Calendar", group: "Calendar" },
  { key: "manage_team", label: "Manage Team", group: "Administration" },
  { key: "view_analytics", label: "View Analytics", group: "Administration" },
  { key: "manage_workflow", label: "Manage Workflow", group: "Administration" },
];

const JOB_TITLES = [
  "Owner", "CEO", "CTO", "CFO", "COO",
  "Manager", "Assistant Manager", "Team Lead",
  "Developer", "Designer", "Marketing Specialist",
  "Sales Representative", "Accountant", "HR Manager",
  "Operations Manager", "Support Agent", "Intern",
  "Consultant", "Analyst", "Coordinator",
];

export function MemberPermissionsModal({ open, onOpenChange, memberId, memberName, currentRole }: Props) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [jobTitle, setJobTitle] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && memberId) {
      fetchPermissions();
      fetchJobTitle();
    }
  }, [open, memberId]);

  const fetchPermissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("member_permissions")
      .select("permission_key, allowed")
      .eq("user_id", memberId);

    const perms: Record<string, boolean> = {};
    PERMISSIONS.forEach((p) => { perms[p.key] = false; });
    if (data) {
      (data as any[]).forEach((d) => { perms[d.permission_key] = d.allowed; });
    }
    setPermissions(perms);
    setLoading(false);
  };

  const fetchJobTitle = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("job_title")
      .eq("id", memberId)
      .single();
    if (data && (data as any).job_title) {
      const title = (data as any).job_title;
      if (JOB_TITLES.includes(title)) {
        setJobTitle(title);
      } else {
        setJobTitle("custom");
        setCustomTitle(title);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Save permissions
    const upserts = Object.entries(permissions).map(([key, allowed]) => ({
      user_id: memberId,
      permission_key: key,
      allowed,
      granted_by: user?.id,
    }));

    for (const upsert of upserts) {
      await supabase
        .from("member_permissions")
        .upsert(upsert as any, { onConflict: "user_id,permission_key" });
    }

    // Save job title
    const finalTitle = jobTitle === "custom" ? customTitle : jobTitle;
    if (finalTitle) {
      await supabase
        .from("profiles")
        .update({ job_title: finalTitle } as any)
        .eq("id", memberId);
    }

    toast.success("Permissions and title saved");
    setSaving(false);
    onOpenChange(false);
  };

  const toggleAll = (group: string, value: boolean) => {
    const keys = PERMISSIONS.filter((p) => p.group === group).map((p) => p.key);
    setPermissions((prev) => {
      const next = { ...prev };
      keys.forEach((k) => { next[k] = value; });
      return next;
    });
  };

  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permissions: {memberName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label className="font-semibold">Job Title</Label>
              <Select value={jobTitle} onValueChange={setJobTitle}>
                <SelectTrigger><SelectValue placeholder="Select a title" /></SelectTrigger>
                <SelectContent>
                  {JOB_TITLES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Title</SelectItem>
                </SelectContent>
              </Select>
              {jobTitle === "custom" && (
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter custom title"
                />
              )}
            </div>

            {/* Permissions */}
            {groups.map((group) => (
              <div key={group} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold text-sm">{group}</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => toggleAll(group, true)}>
                      All
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => toggleAll(group, false)}>
                      None
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pl-2">
                  {PERMISSIONS.filter((p) => p.group === group).map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between">
                      <Label className="text-sm text-muted-foreground cursor-pointer" htmlFor={perm.key}>
                        {perm.label}
                      </Label>
                      <Switch
                        id={perm.key}
                        checked={permissions[perm.key] || false}
                        onCheckedChange={(v) => setPermissions((p) => ({ ...p, [perm.key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
