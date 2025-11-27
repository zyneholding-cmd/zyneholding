import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { businessTools, categories, getImplementedTools } from "@/data/businessTools";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ManageTools() {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUserTools();
    }
  }, [user]);

  const loadUserTools = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_business_tools")
      .select("tool_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading tools:", error);
      return;
    }

    if (data && data.length > 0) {
      setSelectedTools(data.map(t => t.tool_id));
    } else {
      // Default to implemented tools
      setSelectedTools(getImplementedTools().map(t => t.id));
    }
  };

  const toggleTool = async (toolId: string) => {
    if (!user) return;

    const isSelected = selectedTools.includes(toolId);

    if (isSelected) {
      // Remove tool
      const { error } = await supabase
        .from("user_business_tools")
        .delete()
        .eq("user_id", user.id)
        .eq("tool_id", toolId);

      if (error) {
        toast.error("Failed to remove tool");
        return;
      }

      setSelectedTools(prev => prev.filter(id => id !== toolId));
      toast.success("Tool removed from your business");
    } else {
      // Add tool
      const { error } = await supabase
        .from("user_business_tools")
        .insert({
          user_id: user.id,
          tool_id: toolId,
          position: selectedTools.length
        });

      if (error) {
        toast.error("Failed to add tool");
        return;
      }

      setSelectedTools(prev => [...prev, toolId]);
      toast.success("Tool added to your business");
    }
  };

  const filteredTools = businessTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Manage Your Business Tools
          </h1>
          <p className="text-muted-foreground text-lg">
            Customize which tools appear in your navigation. Select only what you need for your business.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-3xl font-bold text-primary mb-1">
              {selectedTools.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Tools</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="text-3xl font-bold text-secondary mb-1">
              {businessTools.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Available</div>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="text-3xl font-bold text-accent mb-1">
              {businessTools.filter(t => t.isImplemented).length}
            </div>
            <div className="text-sm text-muted-foreground">Ready to Use</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Badge
              variant={selectedCategory === "all" ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:scale-105 transition-transform"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:scale-105 transition-transform"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            const isSelected = selectedTools.includes(tool.id);
            
            return (
              <Card
                key={tool.id}
                onClick={() => tool.isImplemented && toggleTool(tool.id)}
                className={cn(
                  "group relative p-4 transition-all duration-300 animate-scale-in cursor-pointer",
                  tool.isImplemented 
                    ? isSelected
                      ? "border-primary shadow-lg shadow-primary/20 bg-primary/5"
                      : "hover:shadow-lg hover:-translate-y-1"
                    : "opacity-50 cursor-not-allowed"
                )}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Selection Indicator */}
                {tool.isImplemented && (
                  <div className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isSelected 
                      ? `border-primary bg-primary`
                      : "border-border group-hover:border-primary"
                  )}>
                    {isSelected ? (
                      <X className="h-4 w-4 text-white" />
                    ) : (
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    )}
                  </div>
                )}

                <div className="flex flex-col items-center text-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                    tool.isImplemented 
                      ? `bg-gradient-to-br from-${tool.color}/80 to-${tool.color} shadow-lg`
                      : "bg-muted"
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Name */}
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Status */}
                  {!tool.isImplemented && (
                    <Badge variant="secondary" className="text-xs">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
