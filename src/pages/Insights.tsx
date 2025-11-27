import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDatabase } from "@/hooks/useDatabase";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { ProductsComparisonChart } from "@/components/ProductsComparisonChart";
import { SalesTimelineChart } from "@/components/SalesTimelineChart";
import { BusinessTips } from "@/components/BusinessTips";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Insights = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useDatabase();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Insights</h1>
        <p className="text-muted-foreground mt-1">
          Deep analytics and intelligence for your business
        </p>
      </div>

      <SalesTimelineChart products={data.products} />
      <AdvancedAnalytics products={data.products} />
      {data.products.length > 0 && <ProductsComparisonChart products={data.products} />}
      <BusinessTips />
    </div>
  );
};

export default Insights;
