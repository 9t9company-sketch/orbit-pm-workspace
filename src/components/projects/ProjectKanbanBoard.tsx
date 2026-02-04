import { useMemo } from "react";
import { MoreHorizontal, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { mockUsers, mockTeams } from "@/data/mockData";
import { Project } from "@/data/types";
import { useProjects } from "@/hooks/useProjects";

interface ProjectKanbanBoardProps {
  projects: Project[];
  onEditProject: (project: Project) => void;
}

const columns = [
  { id: "active", title: "Active", color: "bg-blue-500" },
  { id: "on-hold", title: "On Hold", color: "bg-amber-500" },
  { id: "completed", title: "Completed", color: "bg-green-500" },
  { id: "archived", title: "Archived", color: "bg-slate-500" },
];

export function ProjectKanbanBoard({ projects, onEditProject }: ProjectKanbanBoardProps) {
  const { deleteProject } = useProjects();

  const projectsByStatus = useMemo(() => {
    return columns.reduce((acc, column) => {
      acc[column.id] = projects.filter((project) => project.status === column.id);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject.mutate(id);
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
                {projectsByStatus[column.id]?.length || 0}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Projects Container */}
          <div className="flex-1 space-y-4 min-h-[500px] p-1">
            {projectsByStatus[column.id]?.map((project, projectIndex) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => onEditProject(project)}
                onDelete={() => handleDeleteProject(project.id)}
                style={{ animationDelay: `${colIndex * 50 + projectIndex * 30}ms` }}
              />
            ))}
            {projectsByStatus[column.id]?.length === 0 && (
              <div className="border-2 border-dashed border-muted rounded-xl h-24 flex items-center justify-center opacity-40">
                <span className="text-xs text-muted-foreground">Drop project here</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectCard({ project, onEdit, onDelete, style }: { project: Project; onEdit: () => void; onDelete: () => void; style?: React.CSSProperties }) {
  const owner = mockUsers.find((u) => u.id === project.ownerId);
  const team = mockTeams.find((t) => t.id === project.teamId);

  const healthStyles = {
    "on-track": "bg-green-50 text-green-600 border-green-100",
    "at-risk": "bg-orange-50 text-orange-600 border-orange-100",
    "off-track": "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div
      className="orbit-task-card group animate-scale-in p-4 rounded-xl shadow-sm border border-border bg-card hover:border-primary/50 transition-all duration-200"
      style={style}
      onClick={onEdit}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider py-0 px-2 rounded-md border-none", healthStyles[project.health])}>
          {project.health.replace("-", " ")}
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
            <DropdownMenuItem onClick={onEdit}>Edit Project</DropdownMenuItem>
            <DropdownMenuItem>Copy Project Link</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>Delete Project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className="text-sm font-semibold mb-2 leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
        {project.name}
      </h4>

      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
        {project.description}
      </p>

      {team && (
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <span className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-tight">
            {team.name}
          </span>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Progress</span>
            <span>{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-1" />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{project.endDate}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">{project.completedTasks}/{project.taskCount}</span>
          </div>
        </div>

        {owner && (
          <Avatar className="w-7 h-7 ring-2 ring-background">
            <AvatarImage src={owner.avatar} />
            <AvatarFallback className="text-[10px]">
              {owner.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
