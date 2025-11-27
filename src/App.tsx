import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PasswordProtection } from "@/components/PasswordProtection";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/MainLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import SalesDashboard from "./pages/SalesDashboard";
import ProductManagement from "./pages/ProductManagement";
import Insights from "./pages/Insights";
import Tasks from "./pages/Tasks";
import Customers from "./pages/Customers";
import Calendar from "./pages/Calendar";
import Documents from "./pages/Documents";
import Team from "./pages/Team";
import Workflow from "./pages/Workflow";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PasswordProtection>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/landing" replace />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes with main layout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Index />} />
                <Route path="/sales" element={<SalesDashboard />} />
                <Route path="/products" element={<ProductManagement />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/team" element={<Team />} />
                <Route path="/workflow" element={<Workflow />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </PasswordProtection>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
