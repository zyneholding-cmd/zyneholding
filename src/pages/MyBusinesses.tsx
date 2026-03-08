import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Eye, Users, MapPin, Briefcase, CheckCircle, XCircle, Loader2, Globe,
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

export default function MyBusinesses() {
  const { user } = useAuth();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [applications, setApplications] = useState<BusinessApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishOpen, setPublishOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<BusinessApplication | null>(null);

  useEffect(() => {
    if (user) {
      fetchListings();
      fetchApplications();
    }
  }, [user]);

  const fetchListings = async () => {
    const { data } = await supabase
      .from("business_listings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setListings(data as any);
    setLoading(false);
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("business_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApplications(data as any);
  };

  const updateAppStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("business_applications")
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(`Application ${status}`);
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      setSelectedApp(null);
    }
  };

  const toggleListingStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("business_listings")
      .update({ status: newStatus } as any)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success(`Listing ${newStatus === "published" ? "published" : "unpublished"}`);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    }
  };

  const appsForListing = selectedListing
    ? applications.filter((a) => a.business_id === selectedListing)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Businesses
          </h1>
          <p className="text-muted-foreground mt-1">Manage your published businesses and review applications</p>
        </div>
        <Button onClick={() => setPublishOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Publish Business
        </Button>
      </div>

      {/* Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => {
          const appCount = applications.filter((a) => a.business_id === listing.id).length;
          const pendingCount = applications.filter((a) => a.business_id === listing.id && a.status === "pending").length;
          return (
            <Card key={listing.id} className="p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{listing.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {listing.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{listing.location}</span>}
                    </div>
                  </div>
                </div>
                <Badge variant={listing.status === "published" ? "default" : "secondary"}>
                  {listing.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {listing.description || "No description"}
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{appCount} applicants</span>
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="text-xs">{pendingCount} pending</Badge>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setSelectedListing(listing.id)}>
                  <Eye className="h-3 w-3" /> Applications
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleListingStatus(listing.id, listing.status)}
                >
                  {listing.status === "published" ? "Unpublish" : "Publish"}
                </Button>
              </div>
            </Card>
          );
        })}

        {listings.length === 0 && (
          <Card className="col-span-full p-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No businesses published yet</h3>
            <p className="text-muted-foreground mb-4">Publish your business to start receiving applications</p>
            <Button onClick={() => setPublishOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Publish Your First Business
            </Button>
          </Card>
        )}
      </div>

      {/* Applications Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={(o) => { if (!o) setSelectedListing(null); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Applications for {listings.find((l) => l.id === selectedListing)?.title}
            </DialogTitle>
          </DialogHeader>
          {appsForListing.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No applications yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appsForListing.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.position || "-"}</TableCell>
                    <TableCell className="capitalize">{app.experience_level}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{format(new Date(app.created_at), "MMM d")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail */}
      <Dialog open={!!selectedApp} onOpenChange={(o) => { if (!o) setSelectedApp(null); }}>
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
                {selectedApp.skills?.length > 0 && (
                  <div>
                    <strong>Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApp.skills.map((s, i) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedApp.cover_letter && (
                  <div>
                    <strong>Cover Letter:</strong>
                    <p className="text-muted-foreground whitespace-pre-wrap mt-1">{selectedApp.cover_letter}</p>
                  </div>
                )}
                {selectedApp.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => updateAppStatus(selectedApp.id, "approved")} className="flex-1 gap-1">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateAppStatus(selectedApp.id, "rejected")} className="flex-1 gap-1">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PublishBusinessModal open={publishOpen} onOpenChange={setPublishOpen} onPublished={fetchListings} />
    </div>
  );
}
