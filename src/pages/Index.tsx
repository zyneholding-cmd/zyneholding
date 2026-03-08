import { useDatabase } from "@/hooks/useDatabase";
import { OverviewDashboard } from "@/components/OverviewDashboard";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data, isLoading } = useDatabase();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <OverviewDashboard products={data.products} />
      <ChatAssistant />
    </>
  );
};

export default Index;
