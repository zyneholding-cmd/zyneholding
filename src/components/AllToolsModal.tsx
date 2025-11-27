import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { businessTools, categories } from "@/data/businessTools";
import { useState } from "react";
import { Search, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AllToolsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllToolsModal = ({ open, onOpenChange }: AllToolsModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const navigate = useNavigate();

  const filteredTools = businessTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToolClick = (tool: any) => {
    if (tool.isImplemented) {
      navigate(tool.path);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 backdrop-blur-glass border-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient" />
        
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                All Business Tools
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => navigate("/manage-tools")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search 200+ business tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg bg-card/50 backdrop-blur-sm border-border/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:scale-105 transition-transform"
                onClick={() => setSelectedCategory("all")}
              >
                All Tools ({businessTools.length})
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
          </div>

          {/* Tools Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    className={cn(
                      "group relative p-4 rounded-2xl backdrop-blur-sm border border-border/50 transition-all duration-300 animate-scale-in",
                      tool.isImplemented 
                        ? "bg-card/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 cursor-pointer" 
                        : "bg-card/30 opacity-60 cursor-not-allowed"
                    )}
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    {/* Glow effect */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10",
                      `bg-${tool.color}/20`
                    )} />

                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                        tool.isImplemented 
                          ? `bg-gradient-to-br from-${tool.color}/80 to-${tool.color} shadow-lg shadow-${tool.color}/30`
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

                      {/* Status Badge */}
                      {!tool.isImplemented && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
