import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, MoreVertical, Shield, Crown, User as UserIcon, Mail, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { InviteTeamMemberModal } from "@/components/InviteTeamMemberModal";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  business_name: string | null;
  created_at: string;
  role: "owner" | "admin" | "member";
}

interface Invitation {
  id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: string;
  sent_at: string;
  expires_at: string;
}

export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchTeamMembers();
      fetchInvitations();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return;
    }

    setUserRole(data?.role || null);
  };

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      const membersWithRoles = profilesData.map((profile) => {
        const userRole = rolesData.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || "member",
        };
      });

      setMembers(membersWithRoles);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("status", "pending")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: "owner" | "admin" | "member") => {
    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", memberId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("user_id", memberId);

        if (error) throw error;
      }

      toast.success("Role updated successfully");
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", memberId);

      if (error) throw error;

      toast.success("Team member removed successfully");
      fetchTeamMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitationId);

      if (error) throw error;

      toast.success("Invitation cancelled");
      fetchInvitations();
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      toast.error("Failed to cancel invitation");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const canManageTeam = userRole === "owner" || userRole === "admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Team Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your team members and their roles
            </p>
          </div>
          {canManageTeam && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="gap-2 hover-scale"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && canManageTeam && (
          <Card className="p-6 bg-card/50 backdrop-blur border-primary/10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Pending Invitations
            </h2>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback>
                        {invitation.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getRoleBadgeVariant(invitation.role)}>
                      {invitation.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Team Members */}
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/10">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            Team Members ({members.length})
          </h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(member.full_name, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {member.full_name || member.email}
                      {member.id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.business_name && (
                      <p className="text-xs text-muted-foreground">
                        {member.business_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={getRoleBadgeVariant(member.role)}
                    className="gap-1 px-3 py-1"
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                  {canManageTeam && member.id !== user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(member.id, "owner")}
                          disabled={member.role === "owner"}
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Make Owner
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(member.id, "admin")}
                          disabled={member.role === "admin"}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleChangeRole(member.id, "member")}
                          disabled={member.role === "member"}
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          Make Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive"
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <InviteTeamMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSent={() => {
          fetchInvitations();
          setIsInviteModalOpen(false);
        }}
      />
    </div>
  );
}
