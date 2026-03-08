import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Eye, CheckCircle, XCircle, ExternalLink, User } from "lucide-react";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  purpose: string;
  skills: string[];
  categories: string[];
  experience_level: string;
  portfolio_link: string | null;
  resume_url: string | null;
  profile_photo_url: string | null;
  hourly_rate: number | null;
  availability: string;
  status: string;
  created_at: string;
}

export default function Applications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("job_applications" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setApplications(data as any);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("job_applications" as any)
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      toast({ title: `Application ${status}` });
    }
  };

  const statusColor = (s: string) => {
    if (s === "approved") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">{applications.length} total applications</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No applications yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {app.profile_photo_url ? (
                        <img src={app.profile_photo_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {app.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{app.full_name}</p>
                        <p className="text-xs text-muted-foreground">{app.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {app.categories?.slice(0, 2).map((c) => (
                        <Badge key={c} variant="outline" className="text-[10px] capitalize">{c}</Badge>
                      ))}
                      {(app.categories?.length || 0) > 2 && (
                        <Badge variant="outline" className="text-[10px]">+{app.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{app.experience_level}</TableCell>
                  <TableCell className="capitalize">{app.availability}</TableCell>
                  <TableCell>
                    <Badge variant={statusColor(app.status)} className="capitalize">{app.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(app)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.profile_photo_url ? (
                    <img src={selected.profile_photo_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                      {selected.full_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p>{selected.full_name}</p>
                    <p className="text-sm text-muted-foreground font-normal">{selected.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {selected.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Bio</h3>
                    <p className="text-sm">{selected.bio}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Purpose</h3>
                  <p className="text-sm">{selected.purpose}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Experience</h3>
                    <p className="text-sm capitalize">{selected.experience_level}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Availability</h3>
                    <p className="text-sm capitalize">{selected.availability}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Rate</h3>
                    <p className="text-sm">{selected.hourly_rate ? `$${selected.hourly_rate}/hr` : "N/A"}</p>
                  </div>
                </div>

                {selected.categories?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.categories.map((c) => (
                        <Badge key={c} variant="secondary" className="capitalize">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selected.skills?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {selected.portfolio_link && (
                    <a href={selected.portfolio_link} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" /> Portfolio
                      </Button>
                    </a>
                  )}
                  {selected.resume_url && (
                    <a href={selected.resume_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" /> Resume
                      </Button>
                    </a>
                  )}
                </div>

                {selected.status === "pending" && (
                  <div className="flex gap-3 pt-2 border-t">
                    <Button className="flex-1" onClick={() => updateStatus(selected.id, "approved")}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => updateStatus(selected.id, "rejected")}>
                      <XCircle className="h-4 w-4 mr-2" /> Reject
                    </Button>
                  </div>
                )}

                {selected.status !== "pending" && (
                  <div className="pt-2 border-t">
                    <Badge variant={statusColor(selected.status)} className="capitalize text-sm px-4 py-1">
                      {selected.status}
                    </Badge>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
