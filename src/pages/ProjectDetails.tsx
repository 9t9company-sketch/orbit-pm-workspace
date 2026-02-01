import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useProjects } from "@/hooks/useProjects";
import { mockProjects } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function ProjectDetails() {
    const { id } = useParams<{ id: string }>();
    const { projects } = useProjects();

    const project = projects?.find(p => p.id === id) || mockProjects.find(p => p.id === id);

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold">Project not found</h2>
                <Button asChild variant="link" className="mt-4">
                    <Link to="/projects">Back to Projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/projects">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{project.description}</p>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Created: {project.startDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Deadline: {project.endDate}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-bold">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">Health</p>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        "text-xs font-semibold",
                                        project.health === "on-track" && "orbit-status-success",
                                        project.health === "at-risk" && "orbit-status-warning",
                                        project.health === "off-track" && "bg-destructive/15 text-destructive"
                                    )}
                                >
                                    {project.health.replace("-", " ")}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground uppercase">Status</p>
                                <Badge variant="outline" className="capitalize">
                                    {project.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for Tasks/Team */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{project.completedTasks} / {project.taskCount}</div>
                        <p className="text-xs text-muted-foreground">Completed tasks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Urgent issues</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Active owners</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
