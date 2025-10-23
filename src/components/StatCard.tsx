import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  className?: string;
  textClassName?: string;
}

export const StatCard = ({ label, value, prefix = "PKR", className, textClassName }: StatCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <Card className={`p-3 md:p-6 text-center animate-fade-in ${className || ""}`}>
      <div className="flex items-center justify-between mb-1 md:mb-2">
        <p className="text-xs md:text-sm text-muted-foreground flex-1">{label}</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 md:h-8 md:w-8"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <Eye className="h-3 w-3 md:h-4 md:w-4" />
          ) : (
            <EyeOff className="h-3 w-3 md:h-4 md:w-4" />
          )}
        </Button>
      </div>
      <p className={`text-lg md:text-3xl font-bold break-all transition-all duration-200 ${textClassName || ""}`}>
        {isVisible ? (
          <>
            {prefix} {value.toLocaleString()}
          </>
        ) : (
          <span className="text-muted-foreground">••••••</span>
        )}
      </p>
    </Card>
  );
};