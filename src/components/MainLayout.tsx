import { Link, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp, Package, ShoppingCart, UserCog, Users, ListTodo,
  Calendar, Clock, FolderOpen, MessageSquare, Video, Bell,
  Mail, Book, Upload, DollarSign, FileText, CreditCard,
  Wallet, PieChart, Target, TrendingDown, BarChart3,
  Megaphone, Star, Gift, Briefcase, Award, Timer,
  Settings, Shield, Activity, Wrench, Box, Truck,
  MapPin, RefreshCw, QrCode, Store, HeadphonesIcon,
  LifeBuoy, MessageCircle, Zap, PenTool, Search,
  Link2, Calculator, Globe, BellRing, FileImage,
  Palette, Languages, Bot
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

  const toolCategories = [
    {
      category: "Core Business",
      items: [
        { name: "Overview", path: "/dashboard", icon: TrendingUp },
        { name: "Products", path: "/dashboard", icon: Package },
        { name: "Sales", path: "/dashboard", icon: ShoppingCart },
        { name: "Customers", path: "/customers", icon: UserCog },
        { name: "Tasks", path: "/tasks", icon: ListTodo },
      ]
    },
    {
      category: "Team & HR",
      items: [
        { name: "Calendar", path: "/calendar", icon: Calendar },
        { name: "Time Track", path: "/time-tracking", icon: Clock, disabled: true },
        { name: "Documents", path: "/documents", icon: FolderOpen },
      ]
    },
    {
      category: "Communication",
      items: [
        { name: "Chat", path: "/chat", icon: MessageSquare, disabled: true },
        { name: "Video Call", path: "/video", icon: Video, disabled: true },
        { name: "Announcements", path: "/announcements", icon: Bell, disabled: true },
        { name: "Email", path: "/email", icon: Mail, disabled: true },
      ]
    },
    {
      category: "Finance",
      items: [
        { name: "Expenses", path: "/expenses", icon: DollarSign, disabled: true },
        { name: "Invoices", path: "/invoices", icon: FileText, disabled: true },
        { name: "Billing", path: "/billing", icon: CreditCard, disabled: true },
        { name: "Budget", path: "/budget", icon: Wallet, disabled: true },
        { name: "Reports", path: "/finance-reports", icon: PieChart, disabled: true },
      ]
    },
    {
      category: "Sales & Marketing",
      items: [
        { name: "Leads", path: "/leads", icon: Target, disabled: true },
        { name: "Campaigns", path: "/campaigns", icon: Megaphone, disabled: true },
        { name: "Reviews", path: "/reviews", icon: Star, disabled: true },
        { name: "Coupons", path: "/coupons", icon: Gift, disabled: true },
      ]
    },
    {
      category: "Operations",
      items: [
        { name: "Suppliers", path: "/suppliers", icon: Briefcase, disabled: true },
        { name: "Warehouse", path: "/warehouse", icon: Box, disabled: true },
        { name: "Delivery", path: "/delivery", icon: Truck, disabled: true },
        { name: "Returns", path: "/returns", icon: RefreshCw, disabled: true },
      ]
    },
    {
      category: "Support",
      items: [
        { name: "Tickets", path: "/tickets", icon: HeadphonesIcon, disabled: true },
        { name: "Live Chat", path: "/live-chat", icon: MessageCircle, disabled: true },
        { name: "Help Center", path: "/help", icon: LifeBuoy, disabled: true },
      ]
    },
    {
      category: "Automation & AI",
      items: [
        { name: "Workflows", path: "/workflows", icon: Zap, disabled: true },
        { name: "AI Assistant", path: "/ai-assistant", icon: Bot, disabled: true },
        { name: "Reports AI", path: "/ai-reports", icon: FileText, disabled: true },
      ]
    },
    {
      category: "Settings",
      items: [
        { name: "Security", path: "/security", icon: Shield, disabled: true },
        { name: "Integrations", path: "/integrations", icon: Link2, disabled: true },
        { name: "Customization", path: "/customization", icon: Palette, disabled: true },
      ]
    },
  ];

  const teamMenuItem = { name: "Team", path: "/team", icon: Users };

  return (
    <div className="flex h-screen bg-background">
      {/* Navigation Sidebar */}
      <aside className="w-56 border-r bg-card/50 backdrop-blur flex flex-col">
        <div className="p-3 border-b">
          <h1 className="text-base font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Zyne Holding
          </h1>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-4">
            {toolCategories.map((category) => (
              <div key={category.category}>
                <h3 className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.category}
                </h3>
                <div className="space-y-0.5">
                  {category.items.map((item) => (
                    <Link
                      key={item.path + item.name}
                      to={item.disabled ? "#" : item.path}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm ${
                        item.disabled
                          ? "text-muted-foreground/40 cursor-not-allowed"
                          : currentPath === item.path
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:text-primary hover:bg-accent"
                      }`}
                      onClick={(e) => item.disabled && e.preventDefault()}
                    >
                      <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                      {item.disabled && (
                        <span className="ml-auto text-[10px] bg-muted px-1 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            {canManageTeam && (
              <>
                <Separator className="my-2" />
                <div>
                  <h3 className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admin
                  </h3>
                  <Link
                    to={teamMenuItem.path}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm ${
                      currentPath === teamMenuItem.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-primary hover:bg-accent"
                    }`}
                  >
                    <teamMenuItem.icon className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{teamMenuItem.name}</span>
                  </Link>
                </div>
              </>
            )}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
