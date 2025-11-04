import { Link, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  ListTodo,
  MessageSquare,
  FileText,
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

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: ListTodo },
    { name: "Chat", path: "/chat", icon: MessageSquare, disabled: true },
    { name: "Notes", path: "/notes", icon: FileText, disabled: true },
  ];

  const teamMenuItem = { name: "Team", path: "/team", icon: Users };

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <aside className="w-64 border-r bg-card/50 backdrop-blur flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Zyne Holding
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.disabled ? "#" : item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                item.disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : currentPath === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
              {item.disabled && (
                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          ))}
          
          {canManageTeam && (
            <Link
              to={teamMenuItem.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPath === teamMenuItem.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <teamMenuItem.icon className="h-5 w-5" />
              <span className="font-medium">{teamMenuItem.name}</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
