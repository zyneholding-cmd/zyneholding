import { Link, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home, Share2, Upload, Star, Plus, Smartphone, ListTodo, Calendar as CalendarIcon,
  Send, AlertTriangle, Moon, Sun, Search, Bell, Mail, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const sidebarItems = [
    { icon: Home, path: "/dashboard", label: "Home" },
    { icon: Share2, path: "#", label: "Share" },
    { icon: Upload, path: "/documents", label: "Upload" },
    { icon: Star, path: "#", label: "Favorites" },
    { icon: Plus, path: "#", label: "Add" },
    { icon: Smartphone, path: "#", label: "Mobile" },
    { icon: ListTodo, path: "/tasks", label: "Tasks" },
    { icon: CalendarIcon, path: "/calendar", label: "Calendar" },
    { icon: Send, path: "#", label: "Send" },
    { icon: AlertTriangle, path: "#", label: "Alerts" },
  ];

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
    <div className="flex h-screen bg-background">
      {/* Minimal Icon Sidebar */}
      <aside className="w-16 border-r bg-card flex flex-col items-center py-4 gap-2 shadow-sm">
        {/* Logo */}
        <div className="mb-4 p-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">Z</span>
          </div>
        </div>

        {/* Navigation Icons */}
        {sidebarItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`p-2 rounded-lg transition-colors ${
              currentPath === item.path
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </Link>
        ))}

        {/* Dark Mode Toggle at Bottom */}
        <div className="mt-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsDark(!isDark);
              document.documentElement.classList.toggle("dark");
            }}
            className="rounded-full"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b bg-card px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">Zyne Holding</h1>
            
            <nav className="flex items-center gap-1">
              {topNavItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    currentPath === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
