import { MoreHorizontal, CheckCircle2, Circle, Clock, Eye, AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { mockUsers, mockProjects } from "@/data/mockData";
import { Task } from "@/data/types";
import { useTasks } from "@/hooks/useTasks";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function TaskList({ tasks, onEditTask }: TaskListProps) {
  const { updateTask, deleteTask } = useTasks();

  const statusIcons = {
    todo: Circle,
    in_progress: Clock,
    blocked: AlertCircle,
    done: CheckCircle2,
    canceled: XCircle,
  };

  const statusColors = {
    todo: "text-primary",
    in_progress: "text-blue-500",
    blocked: "text-amber-500",
    done: "text-green-500",
    canceled: "text-muted-foreground",
  };

  const priorityStyles = {
    urgent: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-blue-100 text-blue-700 border-blue-200",
    low: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const handleToggleComplete = (task: Task) => {
    updateTask.mutate({
      id: task.id,
      status: task.status === "done" ? "todo" : "done",
      completedAt: task.status === "done" ? undefined : new Date().toISOString()
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(id);
    }
  };

  return (
    <Card className="animate-fade-in border-none shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="hidden md:grid grid-cols-[auto_1fr_120px_120px_100px_80px_40px] gap-4 items-center px-6 py-4 border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <div className="w-5" />
          <div>Task</div>
          <div>Project</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Assignee</div>
          <div />
        </div>

        <div className="divide-y divide-border">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No tasks found.</p>
            </div>
          ) : (
            tasks.map((task, index) => {
              const assignee = mockUsers.find((u) => u.id === task.assigneeId);
              const project = mockProjects.find((p) => p.id === task.projectId);
              const StatusIcon = statusIcons[task.status] || Circle;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-[auto_1fr_120px_120px_100px_80px_40px] gap-4 items-center px-6 py-4",
                    "hover:bg-muted/30 transition-all cursor-pointer group animate-slide-up"
                  )}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <Checkbox
                    checked={task.status === "done"}
                    onCheckedChange={() => handleToggleComplete(task)}
                    className="w-5 h-5 rounded-md border-2"
                  />

                  <div className="flex items-center gap-3 min-w-0" onClick={() => onEditTask(task)}>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium text-sm truncate transition-colors",
                        task.status === "done" ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
                      )}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 md:hidden">
                        <span className="text-xs text-muted-foreground">{project?.name}</span>
                        <Badge variant="outline" className={cn("text-[10px] py-0", statusColors[task.status])}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color || "#cbd5e1" }} />
                    <span className="text-sm text-muted-foreground truncate">{project?.name || "No Project"}</span>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <StatusIcon className={cn("w-4 h-4", statusColors[task.status])} />
                    <span className="text-sm capitalize whitespace-nowrap">{task.status.replace("_", " ")}</span>
                  </div>

                  <div className="hidden md:block">
                    <Badge variant="outline" className={cn("text-[10px] font-semibold border-none px-2 py-0.5", priorityStyles[task.priority])}>
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="hidden md:block">
                    {assignee ? (
                      <Avatar className="w-8 h-8 ring-2 ring-background">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {assignee.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground opacity-50">+</span>
                      </div>
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask(task)}>Edit Task</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleComplete(task)}>
                        {task.status === "done" ? "Reopen Task" : "Complete Task"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
