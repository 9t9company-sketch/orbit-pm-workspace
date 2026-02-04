import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Grid3X3, List, Search, Filter, MoreHorizontal, Loader2, Columns } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { mockUsers, mockTeams, mockProjects } from "@/data/mockData";
import { useProjects } from "@/hooks/useProjects";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { ProjectKanbanBoard } from "@/components/projects/ProjectKanbanBoard";
import { Project } from "@/data/types";

type ViewMode = "grid" | "list" | "board";

export default function Projects() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);

  const { projects: dbProjects, isLoading, deleteProject } = useProjects();

  // Use DB projects if available, otherwise fallback to mock data for demo
  const allProjects = dbProjects && dbProjects.length > 0 ? dbProjects : mockProjects;

  const filteredProjects = allProjects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setSelectedProject(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place.
          </p>
        </div>
        <Button onClick={handleCreateNew} className="orbit-gradient text-white border-0 gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
          <Button
            variant={viewMode === "board" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("board")}
            className="gap-2"
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Board</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Projects Grid/List/Board */}
          {viewMode === "board" ? (
            <ProjectKanbanBoard projects={filteredProjects} onEditProject={handleEdit} />
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project, index) => {
                const owner = mockUsers.find((u) => u.id === project.ownerId);
                const team = mockTeams.find((t) => t.id === project.teamId);
                return (
                  <Card
                    key={project.id}
                    className="orbit-hover-lift cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.name.charAt(0)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {team?.name || "No team"}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/projects/${project.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(project)}>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(project.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            project.health === "on-track" && "orbit-status-success",
                            project.health === "at-risk" && "orbit-status-warning",
                            project.health === "off-track" &&
                            "bg-destructive/15 text-destructive border-destructive/30"
                          )}
                        >
                          {project.health === "on-track"
                            ? "On Track"
                            : project.health === "at-risk"
                              ? "At Risk"
                              : "Off Track"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {project.completedTasks || 0}/{project.taskCount || 0} tasks
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={owner?.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {owner?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{owner?.name || "Unassigned"}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Due {project.endDate}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredProjects.map((project, index) => {
                    const owner = mockUsers.find((u) => u.id === project.ownerId);
                    const team = mockTeams.find((t) => t.id === project.teamId);
                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{project.name}</p>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                project.health === "on-track" && "orbit-status-success",
                                project.health === "at-risk" && "orbit-status-warning"
                              )}
                            >
                              {project.health === "on-track" ? "On Track" : "At Risk"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {team?.name || "No team"} • {project.completedTasks || 0}/{project.taskCount || 0} tasks
                          </p>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                          <div className="w-32">
                            <Progress value={project.progress || 0} className="h-1.5" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={owner?.avatar} />
                              <AvatarFallback className="text-[10px]">
                                {owner?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <span className="text-sm text-muted-foreground w-24">
                            {project.endDate}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/projects/${project.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(project)}>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(project.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={selectedProject}
      />
    </div>
  );
}
