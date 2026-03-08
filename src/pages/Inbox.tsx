import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function Inbox() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchAllMessages();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("inbox-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inbox_messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUser]);

  // Mark messages as read when selecting a user
  useEffect(() => {
    if (!user || !selectedUser) return;
    const unread = messages.filter(
      (m) => m.sender_id === selectedUser.id && m.receiver_id === user.id && !m.is_read
    );
    if (unread.length > 0) {
      supabase
        .from("inbox_messages")
        .update({ is_read: true } as any)
        .in("id", unread.map((m) => m.id))
        .then(() => {
          setMessages((prev) =>
            prev.map((m) => (unread.find((u) => u.id === m.id) ? { ...m, is_read: true } : m))
          );
        });
    }
  }, [selectedUser, messages, user]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("id, email, full_name");
    if (data) setProfiles(data.filter((p) => p.id !== user?.id));
  };

  const fetchAllMessages = async () => {
    const { data } = await supabase
      .from("inbox_messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) setMessages(data as any);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return;
    setSending(true);
    await supabase.from("inbox_messages").insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    } as any);
    setNewMessage("");
    setSending(false);
  };

  const getConversation = () => {
    if (!selectedUser || !user) return [];
    return messages.filter(
      (m) =>
        (m.sender_id === user.id && m.receiver_id === selectedUser.id) ||
        (m.sender_id === selectedUser.id && m.receiver_id === user.id)
    );
  };

  const getUnreadCount = (profileId: string) => {
    return messages.filter(
      (m) => m.sender_id === profileId && m.receiver_id === user?.id && !m.is_read
    ).length;
  };

  const getLastMessage = (profileId: string) => {
    const convo = messages.filter(
      (m) =>
        (m.sender_id === user?.id && m.receiver_id === profileId) ||
        (m.sender_id === profileId && m.receiver_id === user?.id)
    );
    return convo[convo.length - 1];
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      !searchQuery ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by last message time
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    const la = getLastMessage(a.id);
    const lb = getLastMessage(b.id);
    if (!la && !lb) return 0;
    if (!la) return 1;
    if (!lb) return -1;
    return new Date(lb.created_at).getTime() - new Date(la.created_at).getTime();
  });

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    return email.slice(0, 2).toUpperCase();
  };

  const conversation = getConversation();

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Contacts sidebar */}
      <div className="w-80 border-r flex flex-col bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Inbox
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {sortedProfiles.map((profile) => {
            const unread = getUnreadCount(profile.id);
            const last = getLastMessage(profile.id);
            return (
              <div
                key={profile.id}
                onClick={() => setSelectedUser(profile)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/30",
                  selectedUser?.id === profile.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(profile.full_name, profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{profile.full_name || profile.email}</p>
                    {unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                        {unread}
                      </Badge>
                    )}
                  </div>
                  {last && (
                    <p className="text-xs text-muted-foreground truncate">{last.content}</p>
                  )}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 bg-card">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(selectedUser.full_name, selectedUser.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedUser.full_name || selectedUser.email}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {conversation.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}>
                        <p>{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-card">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()} size="icon">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a team member to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
