import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, XCircle, Clock, Database } from "lucide-react";

export type NodeStatus = "idle" | "waiting" | "processing" | "completed" | "error";

interface NodeDataPreviewProps {
  data: Record<string, any> | null;
  status: NodeStatus;
}

export const NodeDataPreview = ({ data, status }: NodeDataPreviewProps) => {
  if (status === "idle" && !data) return null;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      {status === "processing" && (
        <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Processing data...</span>
        </div>
      )}
      {status === "waiting" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Waiting...</span>
        </div>
      )}
      {status === "completed" && data && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-primary mb-1.5">
            <CheckCircle2 className="h-3 w-3" />
            <span className="font-medium">Completed</span>
          </div>
          <div className="bg-muted/60 rounded-md p-2 space-y-0.5">
            {Object.entries(data).slice(0, 4).map(([key, value]) => (
              <div key={key} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                <span className="font-medium font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <XCircle className="h-3 w-3" />
          <span>Execution failed</span>
        </div>
      )}
    </div>
  );
};

interface NodeStatusIndicatorProps {
  status: NodeStatus;
}

export const NodeStatusIndicator = ({ status }: NodeStatusIndicatorProps) => {
  if (status === "idle") return null;

  const styles: Record<NodeStatus, string> = {
    idle: "",
    waiting: "bg-muted-foreground",
    processing: "bg-primary animate-pulse",
    completed: "bg-green-500",
    error: "bg-destructive",
  };

  return (
    <div className={cn("absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card", styles[status])} />
  );
};
