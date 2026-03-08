import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  assignee_id: string | null;
  created_by: string;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  created_at: string;
  assignee?: {
    id: string;
    email: string;
    full_name: string | null;
  };
  creator?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

const statusColumns = [
  { id: "todo", label: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  { id: "in_progress", label: "In Progress", color: "bg-blue-50 dark:bg-blue-950" },
  { id: "done", label: "Done", color: "bg-green-50 dark:bg-green-950" },
];

const priorityColors = {
  low: "bg-slate-200 text-slate-700",
  medium: "bg-yellow-200 text-yellow-800",
  high: "bg-red-200 text-red-800",
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks();
      subscribeToTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          assignee:profiles!tasks_assignee_id_fkey(id, email, full_name),
          creator:profiles!tasks_created_by_fkey(id, email, full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToTasks = () => {
    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedTask) return;

    // Optimistically update local state immediately
    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTask ? { ...task, status: newStatus as Task["status"] } : task
      )
    );
    setDraggedTask(null);

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", draggedTask);

      if (error) {
        // Revert on error
        fetchTasks();
        throw error;
      }
      toast.success("Task status updated");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && tasks.find(t => t.due_date === dueDate)?.status !== "done";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Task Board
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage tasks and track progress
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 hover-scale"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statusColumns.map((column) => (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 min-h-[500px]`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{column.label}</h2>
                <Badge variant="outline">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>

              <div className="space-y-3">
                {getTasksByStatus(column.id).map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className="p-4 cursor-move hover:shadow-lg transition-all bg-card border-border/50"
                  >
                    <div className="space-y-3">
                      {/* Title and Priority */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium flex-1">{task.title}</h3>
                        <Badge
                          className={priorityColors[task.priority]}
                          variant="secondary"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Assignee and Due Date */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 border">
                              <AvatarFallback className="text-xs">
                                {getInitials(
                                  task.assignee.full_name,
                                  task.assignee.email
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span>{task.assignee.full_name || task.assignee.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground/50">
                            <User className="h-3 w-3" />
                            <span>Unassigned</span>
                          </div>
                        )}

                        {task.due_date && (
                          <div
                            className={`flex items-center gap-1 ${
                              isOverdue(task.due_date) ? "text-destructive font-medium" : ""
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.due_date), "MMM d")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}

                {getTasksByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground/50">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={fetchTasks}
      />
    </div>
  );
}
