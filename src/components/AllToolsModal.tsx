import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { businessTools, categories } from "@/data/businessTools";
import { useState } from "react";
import { Search, X } from "lucide-react";
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
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  All Business Tools
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {businessTools.length}+ tools to manage your business
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search business tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap px-3 py-1 text-xs"
                onClick={() => setSelectedCategory("all")}
              >
                All ({businessTools.length})
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap px-3 py-1 text-xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tools Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool)}
                    disabled={!tool.isImplemented}
                    className={cn(
                      "group p-4 rounded-lg border bg-card transition-all text-left",
                      tool.isImplemented 
                        ? "hover:border-primary hover:shadow-sm cursor-pointer" 
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        tool.isImplemented 
                          ? `bg-${tool.color}/10`
                          : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-6 w-6",
                          tool.isImplemented ? `text-${tool.color}` : "text-muted-foreground"
                        )} />
                      </div>

                      {/* Name & Description */}
                      <div>
                        <h3 className="font-medium text-sm mb-1">
                          {tool.name}
                        </h3>
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
                  </button>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="flex items-center justify-center h-full text-center py-20">
                <div>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No tools found</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 bg-muted/30">
            <p className="text-center text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{filteredTools.filter(t => t.isImplemented).length}</span> ready • 
              <span className="font-medium text-foreground ml-1">{filteredTools.filter(t => !t.isImplemented).length}</span> coming soon
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
