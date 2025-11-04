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
  ShoppingCart,
  Package,
  TrendingUp,
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
    { name: "Overview", path: "/dashboard", icon: TrendingUp, description: "Analytics & Stats" },
    { name: "Products", path: "/dashboard", icon: Package, description: "Inventory" },
    { name: "Sales", path: "/dashboard", icon: ShoppingCart, description: "Orders & Revenue" },
    { name: "Tasks", path: "/tasks", icon: ListTodo, description: "Project Board" },
    { name: "Documents", path: "/documents", icon: FileText, disabled: true, description: "Files & Notes" },
    { name: "Chat", path: "/chat", icon: MessageSquare, disabled: true, description: "Team Messaging" },
  ];

  const teamMenuItem = { name: "Team", path: "/team", icon: Users };

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <aside className="w-56 border-r bg-card/50 backdrop-blur flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Zyne Holding
          </h1>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path + item.name}
              to={item.disabled ? "#" : item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                item.disabled
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : currentPath === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
              title={item.description}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
              {item.disabled && (
                <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </Link>
          ))}
          
          {canManageTeam && (
            <Link
              to={teamMenuItem.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                currentPath === teamMenuItem.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              }`}
              title="Team Management"
            >
              <teamMenuItem.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">{teamMenuItem.name}</span>
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
