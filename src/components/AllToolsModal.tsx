import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { businessTools, categories } from "@/data/businessTools";
import { useState } from "react";
import { Search, Settings, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IconRenderer } from "./IconRenderer";

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
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 animate-gradient pointer-events-none" />
        
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/50 backdrop-blur-xl bg-card/30">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl shadow-primary/30 animate-float">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    All Business Tools
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {businessTools.length}+ tools to power your business
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:scale-110 transition-transform duration-300"
                  onClick={() => navigate("/manage-tools")}
                  title="Manage Tools"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all duration-300"
                  onClick={() => onOpenChange(false)}
                  title="Close"
                >
                  <X className="h-6 w-6" />
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
                className="pl-12 h-14 text-base bg-background/50 backdrop-blur-sm border-border/50 rounded-2xl transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedCategory("all")}
              >
                All ({businessTools.length})
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap px-4 py-2 text-sm hover:scale-105 transition-all duration-300"
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
                      "group relative p-6 rounded-3xl border border-border/50 transition-all duration-300 animate-scale-in overflow-hidden",
                      tool.isImplemented 
                        ? "bg-card/50 backdrop-blur-sm hover:scale-105 hover:shadow-2xl hover:border-primary/50 cursor-pointer" 
                        : "bg-card/30 opacity-60 cursor-not-allowed"
                    )}
                    style={{ animationDelay: `${index * 0.01}s` }}
                  >
                    {/* Gradient Background on Hover */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                      `from-${tool.color} to-${tool.color}/50`
                    )} />

                    <div className="relative flex flex-col items-center text-center gap-3">
                      {/* Icon with 3D Effect */}
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-6",
                        tool.isImplemented 
                          ? `bg-gradient-to-br from-${tool.color}/80 to-${tool.color} shadow-${tool.color}/30`
                          : "bg-muted"
                      )}>
                        <IconRenderer 
                          Icon={Icon} 
                          className="h-8 w-8 text-white" 
                          use3D={tool.isImplemented}
                        />
                      </div>

                      {/* Name & Description */}
                      <div>
                        <h3 className="font-bold text-base mb-1 group-hover:text-primary transition-colors duration-300">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {!tool.isImplemented && (
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
                          Coming Soon
                        </Badge>
                      )}
                    </div>

                    {/* Shimmer Effect */}
                    {tool.isImplemented && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="flex items-center justify-center h-full text-center py-20">
                <div>
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-lg text-muted-foreground">No tools found</p>
                  <p className="text-sm text-muted-foreground mt-2">Try a different search or category</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/50 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
            <p className="text-center text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredTools.filter(t => t.isImplemented).length}</span> tools ready • 
              <span className="font-semibold text-foreground ml-1">{filteredTools.filter(t => !t.isImplemented).length}</span> coming soon
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
