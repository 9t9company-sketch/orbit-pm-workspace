import { useState } from "react";
import { Plus, Search, Filter, LayoutGrid, List as ListIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasks } from "@/hooks/useTasks";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Task } from "@/data/types";
import { mockTasks } from "@/data/mockData";

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"board" | "list">("board");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusTab, setStatusTab] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { tasks: dbTasks, isLoading } = useTasks({
    search: searchQuery,
  });

  // Use DB tasks if available, otherwise fallback to mock for demo
  const allTasks = (dbTasks && dbTasks.length > 0) ? dbTasks : (mockTasks as any as Task[]);

  const filteredTasks = allTasks.filter(task => {
    if (statusTab === "all") return true;
    if (statusTab === "completed") return task.status === "done";
    if (statusTab === "today") {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate?.startsWith(today);
    }
    if (statusTab === "upcoming") {
      const today = new Date().toISOString().split('T')[0];
      return task.dueDate && task.dueDate > today && task.status !== "done";
    }
    return true;
  });

  const handleCreateNew = () => {
    setSelectedTask(undefined);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and organize all your tasks across projects.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="orbit-gradient text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Tabs & View Toggle Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
          <Button
            variant={statusTab === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusTab("all")}
            className="px-4 h-8 text-xs font-semibold"
          >
            All
          </Button>
          <Button
            variant={statusTab === "today" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusTab("today")}
            className="px-4 h-8 text-xs font-semibold"
          >
            Today
          </Button>
          <Button
            variant={statusTab === "upcoming" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusTab("upcoming")}
            className="px-4 h-8 text-xs font-semibold"
          >
            Upcoming
          </Button>
          <Button
            variant={statusTab === "completed" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setStatusTab("completed")}
            className="px-4 h-8 text-xs font-semibold"
          >
            Completed
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            <Button
              variant={view === "board" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("board")}
              className="h-8 px-3"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
              className="h-8 px-3"
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Task Views */}
          {view === "board" ? (
            <KanbanBoard tasks={filteredTasks} onEditTask={handleEditTask} />
          ) : (
            <TaskList tasks={filteredTasks} onEditTask={handleEditTask} />
          )}
        </>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
      />
    </div>
  );
}
