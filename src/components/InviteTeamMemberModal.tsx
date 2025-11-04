import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";

interface InviteTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSent: () => void;
}

export function InviteTeamMemberModal({
  isOpen,
  onClose,
  onInviteSent,
}: InviteTeamMemberModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "admin" | "member">("member");
  const [isLoading, setIsLoading] = useState(false);

  const generateInviteToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email) return;

    setIsLoading(true);

    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .single();

      if (existingProfile) {
        toast.error("This user is already a team member");
        setIsLoading(false);
        return;
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from("invitations")
        .select("*")
        .eq("email", email)
        .eq("status", "pending")
        .single();

      if (existingInvite) {
        toast.error("An invitation has already been sent to this email");
        setIsLoading(false);
        return;
      }

      // Create invitation
      const inviteToken = generateInviteToken();
      const { error } = await supabase.from("invitations").insert({
        email,
        role,
        invite_token: inviteToken,
        invited_by: user.id,
      });

      if (error) throw error;

      // In a production app, you would send an email here
      // For now, we'll just show the invite link
      const inviteLink = `${window.location.origin}/auth?invite=${inviteToken}`;
      
      toast.success(
        <div className="flex flex-col gap-2">
          <p>Invitation created successfully!</p>
          <p className="text-xs text-muted-foreground">
            Share this link with {email}:
          </p>
          <code className="text-xs bg-muted p-2 rounded break-all">
            {inviteLink}
          </code>
        </div>,
        { duration: 10000 }
      );

      setEmail("");
      setRole("member");
      onInviteSent();
    } catch (error) {
      console.error("Error creating invitation:", error);
      toast.error("Failed to create invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite Team Member
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They'll receive an email with
            instructions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member - Basic access</SelectItem>
                <SelectItem value="admin">Admin - Can manage team</SelectItem>
                <SelectItem value="owner">Owner - Full control</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "owner" && "Full access to all features and settings"}
              {role === "admin" && "Can manage team members and settings"}
              {role === "member" && "Can view and manage own tasks"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
