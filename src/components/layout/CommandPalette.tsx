import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Clock,
  MessageSquare,
  Bell,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Search,
  FileText,
  Target,
} from "lucide-react";
import { mockProjects, mockTasks } from "@/data/mockData";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => console.log("Create task"))}>
            <Plus className="mr-2 h-4 w-4" />
            Create new task
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log("Create project"))}>
            <Plus className="mr-2 h-4 w-4" />
            Create new project
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log("Start timer"))}>
            <Clock className="mr-2 h-4 w-4" />
            Start time tracker
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/projects"))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/tasks"))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            Tasks
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/sprints"))}>
            <Target className="mr-2 h-4 w-4" />
            Sprints
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/team"))}>
            <Users className="mr-2 h-4 w-4" />
            Team
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/time"))}>
            <Clock className="mr-2 h-4 w-4" />
            Time Tracking
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/docs"))}>
            <FileText className="mr-2 h-4 w-4" />
            Docs & Wiki
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reports"))}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Projects">
          {mockProjects.slice(0, 3).map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => runCommand(() => navigate(`/projects/${project.id}`))}
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent Tasks">
          {mockTasks.slice(0, 3).map((task) => (
            <CommandItem
              key={task.id}
              onSelect={() => runCommand(() => navigate(`/tasks/${task.id}`))}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {task.title}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
