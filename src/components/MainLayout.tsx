import { Link, useLocation, Outlet, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AllToolsModal } from "@/components/AllToolsModal";
import { getImplementedTools } from "@/data/businessTools";
import { cn } from "@/lib/utils";
import { usePermissions, getPermissionForPath } from "@/hooks/usePermissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Moon, Sun, Search, Bell, Mail, User, Grid3x3, Settings,
  LogOut, UserCircle, AlertTriangle, CheckCircle, Calendar, Inbox, Briefcase,
  Building2, UserCheck, Home, Send, FolderOpen, Star,
} from "lucide-react";

export const MainLayout = () => {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; email: string; avatar_url: string | null } | null>(null);
  const [mode, setMode] = useState<'business' | 'employee'>(() => {
    return (localStorage.getItem('zyne_mode') as 'business' | 'employee') || 'business';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchProfile();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) setUserRole(data.role);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single();
    if (!error && data) setProfile(data);
  };

  const canManageTeam = userRole === "owner" || userRole === "admin";
  const [isDark, setIsDark] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [userTools, setUserTools] = useState(getImplementedTools());
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; description: string; type: string; read: boolean; time: string }>>([]);

  useEffect(() => {
    if (user) {
      loadUserTools();
      loadNotifications();
    }
  }, [user]);

  const loadUserTools = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_business_tools")
      .select("tool_id")
      .eq("user_id", user.id);
    if (data && data.length > 0) {
      const toolIds = data.map(t => t.tool_id);
      const selectedTools = getImplementedTools().filter(t => toolIds.includes(t.id));
      setUserTools(selectedTools);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    const notifs: typeof notifications = [];

    // Tasks due soon
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, due_date, status")
      .or(`created_by.eq.${user.id},assignee_id.eq.${user.id}`)
      .neq("status", "done")
      .not("due_date", "is", null)
      .order("due_date", { ascending: true })
      .limit(5);

    if (tasks) {
      const now = new Date();
      tasks.forEach(task => {
        const due = new Date(task.due_date!);
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff <= 3) {
          notifs.push({
            id: task.id,
            title: diff < 0 ? "Task Overdue" : diff === 0 ? "Task Due Today" : `Task Due in ${diff}d`,
            description: task.title,
            type: diff < 0 ? "warning" : "info",
            read: false,
            time: due.toLocaleDateString(),
          });
        }
      });
    }

    // Low stock products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, stock, min_stock")
      .eq("user_id", user.id);

    if (products) {
      products.forEach(p => {
        if (p.stock !== null && p.min_stock !== null && p.stock <= p.min_stock) {
          notifs.push({
            id: `stock-${p.id}`,
            title: "Low Stock Alert",
            description: `${p.name}: ${p.stock} remaining (min: ${p.min_stock})`,
            type: "warning",
            read: false,
            time: "Now",
          });
        }
      });
    }

    // Business applications - check if user owns any businesses with new applications
    const { data: ownedListings } = await supabase
      .from("business_listings")
      .select("id, title")
      .eq("owner_id", user.id);

    if (ownedListings && ownedListings.length > 0) {
      const listingIds = ownedListings.map(l => l.id);
      const { data: applications } = await supabase
        .from("business_applications")
        .select("id, full_name, business_id, position, created_at, status")
        .in("business_id", listingIds)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(10);

      if (applications) {
        applications.forEach(app => {
          const listing = ownedListings.find(l => l.id === app.business_id);
          notifs.push({
            id: `app-${app.id}`,
            title: "New Application",
            description: `${app.full_name} applied${app.position ? ` for ${app.position}` : ''} at ${listing?.title || 'your business'}`,
            type: "info",
            read: false,
            time: new Date(app.created_at!).toLocaleDateString(),
          });
        });
      }
    }

    // Inbox unread messages
    const { data: unreadMessages } = await supabase
      .from("inbox_messages")
      .select("id, sender_id, content, created_at")
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (unreadMessages) {
      for (const msg of unreadMessages) {
        notifs.push({
          id: `msg-${msg.id}`,
          title: "New Message",
          description: msg.content.length > 60 ? msg.content.slice(0, 60) + '...' : msg.content,
          type: "info",
          read: false,
          time: new Date(msg.created_at!).toLocaleDateString(),
        });
      }
    }

    setNotifications(notifs);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const topNavItems = [
    { name: "Relationship", path: "/customers" },
    { name: "Opportunities", path: "#" },
    { name: "Leads", path: "#" },
    { name: "Calendar", path: "/calendar" },
    { name: "Cases", path: "/tasks" },
    { name: "Reports", path: "#" },
    { name: "Quotes", path: "#" },
  ];

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-2">
          <Link to={mode === 'employee' ? "/employee" : "/dashboard"} className="mb-6 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <span className="text-primary-foreground font-bold text-lg">Z</span>
            </div>
          </Link>

          <div className="flex-1 flex flex-col gap-1 w-full px-2 overflow-y-auto">
            {mode === 'employee' ? (
              <>
                {/* Employee-specific sidebar */}
                {[
                  { id: "hub", name: "Employee Hub", icon: Home, path: "/employee" },
                  { id: "inbox", name: "Inbox", icon: Mail, path: "/inbox" },
                  { id: "calendar", name: "Calendar", icon: Calendar, path: "/calendar" },
                  { id: "tasks", name: "My Tasks", icon: CheckCircle, path: "/tasks" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={cn(
                        "group relative p-2.5 rounded-md transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={item.name}
                    >
                      <Icon className="h-5 w-5 mx-auto" strokeWidth={isActive ? 2.5 : 2} />
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-sm border">
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </>
            ) : (
              <>
                {/* Business tools sidebar */}
                {userTools.slice(0, 8).map((tool) => {
                  const Icon = tool.icon;
                  const isActive = currentPath === tool.path;
                  return (
                    <Link
                      key={tool.id}
                      to={tool.path}
                      className={cn(
                        "group relative p-2.5 rounded-md transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={tool.name}
                    >
                      <Icon className="h-5 w-5 mx-auto" strokeWidth={isActive ? 2.5 : 2} />
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-sm border">
                        {tool.name}
                      </div>
                    </Link>
                  );
                })}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAllTools(true)}
                  className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground mt-2"
                  title="All Tools"
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1 pt-2 border-t border-border w-full px-2">
            {mode === 'business' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAllTools(true)}
                className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
                title="Manage Tools"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsDark(!isDark);
                document.documentElement.classList.toggle("dark");
              }}
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-foreground">Zyne Holding</h1>

              {/* Business / Employee Mode Switch */}
              <div className="hidden md:flex items-center bg-muted/80 rounded-lg p-0.5 border border-border/50">
                <button
                  onClick={() => {
                    setMode('business');
                    localStorage.setItem('zyne_mode', 'business');
                    navigate('/dashboard');
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all",
                    mode === 'business'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Business
                </button>
                <button
                  onClick={() => {
                    setMode('employee');
                    localStorage.setItem('zyne_mode', 'employee');
                    navigate('/employee');
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all",
                    mode === 'employee'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Employee
                </button>
              </div>
              <nav className="hidden lg:flex items-center gap-1">
                {topNavItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      currentPath === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-md">
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-md relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "flex gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors",
                            !notif.read && "bg-primary/5"
                          )}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {notif.type === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            ) : (
                              <Bell className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{notif.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Mail / Inbox */}
              <Button variant="ghost" size="icon" className="rounded-md" asChild>
                <Link to="/inbox">
                  <Mail className="h-5 w-5" />
                </Link>
              </Button>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile?.email || user?.email}</p>
                      {userRole && (
                        <Badge variant="secondary" className="w-fit text-[10px] mt-1 capitalize">
                          {userRole}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/team" className="flex items-center cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Team & Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-businesses" className="flex items-center cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      My Businesses
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/inbox" className="flex items-center cursor-pointer">
                      <Mail className="mr-2 h-4 w-4" />
                      Inbox
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/calendar" className="flex items-center cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>
      </div>

      <AllToolsModal open={showAllTools} onOpenChange={setShowAllTools} />
    </>
  );
};