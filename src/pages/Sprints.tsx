import { useState } from "react";
import { Plus, Calendar, ChevronRight, MoreHorizontal, Play, CheckCircle2, Loader2, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSprints } from "@/hooks/useSprints";
import { useProjects } from "@/hooks/useProjects";
import { SprintDialog } from "@/components/sprints/SprintDialog";
import { Sprint } from "@/data/types";
import { cn } from "@/lib/utils";

export default function Sprints() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | undefined>(undefined);

    const { sprints, isLoading, startSprint, completeSprint, deleteSprint } = useSprints();
    const { projects } = useProjects();

    const handleCreateNew = () => {
        setSelectedSprint(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (sprint: Sprint) => {
        setSelectedSprint(sprint);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this sprint?")) {
            deleteSprint.mutate(id);
        }
    };

    const getProjectName = (id: string) => {
        return projects?.find(p => p.id === id)?.name || "Unknown Project";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-500";
            case "completed": return "bg-blue-500";
            default: return "bg-slate-400";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sprints</h1>
                    <p className="text-muted-foreground">
                        Plan and execute focused periods of work.
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="orbit-gradient text-white border-0 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Sprint
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sprints?.map((sprint) => (
                        <Card key={sprint.id} className="group hover:border-primary/50 transition-all flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">
                                        {getProjectName(sprint.projectId)}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(sprint)}>Edit Sprint</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(sprint.id)} className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">{sprint.name}</CardTitle>
                                <CardDescription className="line-clamp-2 mt-1">
                                    {sprint.goal || "No goal defined for this sprint."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3 flex-1">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{sprint.startDate} - {sprint.endDate}</span>
                                        </div>
                                        <Badge className={cn("capitalize px-2 py-0", getStatusColor(sprint.status))}>
                                            {sprint.status}
                                        </Badge>
                                    </div>

                                    {sprint.status === "active" && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Sprint Progress</span>
                                                <span className="font-bold">65%</span>
                                            </div>
                                            <Progress value={65} className="h-1.5" />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t bg-muted/20">
                                {sprint.status === "planned" && (
                                    <Button
                                        className="w-full gap-2 variant-success"
                                        variant="outline"
                                        onClick={() => startSprint.mutate(sprint.id)}
                                    >
                                        <Play className="w-4 h-4" /> Start Sprint
                                    </Button>
                                )}
                                {sprint.status === "active" && (
                                    <Button
                                        className="w-full gap-2"
                                        onClick={() => completeSprint.mutate(sprint.id)}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Complete Sprint
                                    </Button>
                                )}
                                {sprint.status === "completed" && (
                                    <Button className="w-full gap-2" variant="ghost" disabled>
                                        <Target className="w-4 h-4" /> Sprint Completed
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}

                    {sprints?.length === 0 && (
                        <div className="col-span-full py-20 bg-muted/30 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                            <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold">No Sprints Found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Create your first sprint to start planning your bi-weekly work cycles.
                            </p>
                            <Button onClick={handleCreateNew} variant="outline" className="mt-6">
                                Create First Sprint
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <SprintDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                sprint={selectedSprint}
            />
        </div>
    );
}
