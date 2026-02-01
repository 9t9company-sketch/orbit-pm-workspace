import { useMemo } from "react";
import { MoreHorizontal, Plus, MessageSquare, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const columns = [
  { id: "todo", title: "To Do", color: "bg-primary" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-500" },
  { id: "blocked", title: "Blocked", color: "bg-amber-500" },
  { id: "done", title: "Done", color: "bg-green-500" },
  { id: "canceled", title: "Canceled", color: "bg-muted-foreground" },
];

export function KanbanBoard({ tasks, onEditTask }: KanbanBoardProps) {
  const { deleteTask } = useTasks();

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = tasks.filter((task) => task.status === column.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDeleteTask = (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(id);
    }
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
      {columns.map((column, colIndex) => (
        <div
          key={column.id}
          className="w-[320px] flex-shrink-0 flex flex-col h-full animate-slide-up"
          style={{ animationDelay: `${colIndex * 50}ms` }}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", column.color)} />
              <h3 className="font-semibold text-sm text-foreground/80 tracking-tight capitalize">
                {column.title}
              </h3>
              <Badge variant="secondary" className="bg-muted/50 text-muted-foreground font-normal rounded-full px-2 py-0">
                {tasksByStatus[column.id]?.length || 0}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Tasks Container */}
          <div className="flex-1 space-y-4 min-h-[500px] p-1">
            {tasksByStatus[column.id]?.map((task, taskIndex) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => handleDeleteTask(task.id)}
                style={{ animationDelay: `${colIndex * 50 + taskIndex * 30}ms` }}
              />
            ))}
            {tasksByStatus[column.id]?.length === 0 && (
              <div className="border-2 border-dashed border-muted rounded-xl h-24 flex items-center justify-center opacity-40">
                <span className="text-xs text-muted-foreground">Drop task here</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, style }: { task: Task; onEdit: () => void; onDelete: () => void; style?: React.CSSProperties }) {
  const assignee = mockUsers.find((u) => u.id === task.assigneeId);
  const project = mockProjects.find((p) => p.id === task.projectId);

  const priorityStyles = {
    urgent: "bg-red-50 text-red-600 border-red-100",
    high: "bg-orange-50 text-orange-600 border-orange-100",
    medium: "bg-blue-50 text-blue-600 border-blue-100",
    low: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div
      className="orbit-task-card group animate-scale-in p-4 rounded-xl shadow-sm border border-border bg-card hover:border-primary/50 transition-all duration-200"
      style={style}
      onClick={onEdit}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider py-0 px-2 rounded-md border-none", priorityStyles[task.priority])}>
          {task.priority}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-muted"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Edit Task</DropdownMenuItem>
            <DropdownMenuItem>Copy Task Link</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>Delete Task</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className={cn(
        "text-sm font-semibold mb-3 leading-snug line-clamp-2 transition-colors",
        task.status === "done" ? "text-muted-foreground line-through" : "text-foreground group-hover:text-primary"
      )}>
        {task.title}
      </h4>

      {project && (
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-tight">
            {project.name}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{task.dueDate.split('T')[0]}</span>
            </div>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
            </div>
          )}
        </div>

        {assignee && (
          <Avatar className="w-7 h-7 ring-2 ring-background">
            <AvatarImage src={assignee.avatar} />
            <AvatarFallback className="text-[10px]">
              {assignee.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
