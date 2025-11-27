import { Link, useLocation, Outlet } from "react-router-dom";
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
  const { user } = useAuth();
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
        {/* Colorful Icon Sidebar */}
        <aside className="w-20 border-r border-border/50 bg-gradient-to-b from-card via-card/95 to-card/90 flex flex-col items-center py-6 gap-3 shadow-xl backdrop-blur-sm">
          {/* Logo */}
          <Link to="/dashboard" className="mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300 animate-float">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
          </Link>

          {/* User Tools */}
          <div className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto scrollbar-hide">
            {userTools.slice(0, 8).map((tool, idx) => {
              const Icon = tool.icon;
              const isActive = currentPath === tool.path;
              
              return (
                <Link
                  key={tool.id}
                  to={tool.path}
                  className={cn(
                    "group relative p-3 rounded-2xl transition-all duration-300 hover:scale-110",
                    isActive 
                      ? `bg-gradient-to-br from-${tool.color}/80 to-${tool.color} shadow-lg shadow-${tool.color}/40`
                      : "hover:bg-accent"
                  )}
                  title={tool.name}
                >
                  <Icon className={cn(
                    "h-6 w-6 transition-colors",
                    isActive ? "text-white" : "text-foreground group-hover:text-primary"
                  )} />
                  
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    <div className="text-sm font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </Link>
              );
            })}

            {/* More Tools Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAllTools(true)}
              className="p-3 rounded-2xl hover:bg-gradient-to-br hover:from-primary/20 hover:to-secondary/20 hover:scale-110 transition-all duration-300 mt-2"
              title="All Tools"
            >
              <Grid3x3 className="h-6 w-6" />
            </Button>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = "/manage-tools"}
              className="rounded-2xl hover:bg-accent hover:scale-110 transition-all duration-300"
              title="Manage Tools"
            >
              <Settings className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsDark(!isDark);
                document.documentElement.classList.toggle("dark");
              }}
              className="rounded-2xl hover:bg-accent hover:scale-110 transition-all duration-300"
              title={isDark ? "Light Mode" : "Dark Mode"}
            >
              {isDark ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-primary" />}
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="h-20 border-b border-border/50 bg-card/50 backdrop-blur-xl px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Zyne Holding
              </h1>
              
              <nav className="flex items-center gap-2">
                {topNavItems.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.path}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                      currentPath === item.path
                        ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 scale-105"
                        : "text-foreground hover:bg-accent/50 hover:scale-105"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-accent/50 hover:scale-110 transition-all duration-300"
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-accent/50 hover:scale-110 transition-all duration-300 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-accent/50 hover:scale-110 transition-all duration-300"
              >
                <Mail className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20">
            <Outlet />
          </main>
        </div>
      </div>

      {/* All Tools Modal */}
      <AllToolsModal open={showAllTools} onOpenChange={setShowAllTools} />
    </>
  );
};
