import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AllToolsModal } from "@/components/AllToolsModal";
import { getImplementedTools } from "@/data/businessTools";
import { cn } from "@/lib/utils";
import {
  Moon, Sun, Search, Bell, Mail, User, Grid3x3, Settings
} from "lucide-react";

export const MainLayout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const currentPath = location.pathname;
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setUserRole(data.role);
    }
  };

  const canManageTeam = userRole === "owner" || userRole === "admin";
  const [isDark, setIsDark] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [userTools, setUserTools] = useState(getImplementedTools());

  useEffect(() => {
    if (user) {
      loadUserTools();
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

  // Auth guard: redirect unauthenticated users (after all hooks)
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

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Minimal Professional Sidebar */}
        <aside className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-2">
          {/* Logo */}
          <Link to="/dashboard" className="mb-6 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <span className="text-primary-foreground font-bold text-lg">Z</span>
            </div>
          </Link>

          {/* Navigation Icons */}
          <div className="flex-1 flex flex-col gap-1 w-full px-2 overflow-y-auto">
            {userTools.slice(0, 8).map((tool, idx) => {
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
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 text-sm border">
                    {tool.name}
                  </div>
                </Link>
              );
            })}

            {/* More Tools Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAllTools(true)}
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground mt-2"
              title="All Tools"
            >
              <Grid3x3 className="h-5 w-5" />
            </Button>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-1 pt-2 border-t border-border w-full px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAllTools(true)}
              className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
              title="Manage Tools"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-foreground">
                Zyne Holding
              </h1>
              
              <nav className="flex items-center gap-1">
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-md"
              >
                <Mail className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-background">
            <Outlet />
          </main>
        </div>
      </div>

      {/* All Tools Modal */}
      <AllToolsModal open={showAllTools} onOpenChange={setShowAllTools} />
    </>
  );
};
