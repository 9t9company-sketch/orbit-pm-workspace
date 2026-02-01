import { useState } from "react";
import { Plus, Clock, Calendar, MoreHorizontal, Trash2, Edit2, Download, BarChart2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { TimeEntryDialog } from "@/components/time/TimeEntryDialog";
import { TimeEntry } from "@/data/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function TimeTracking() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<TimeEntry | undefined>(undefined);

    const { timeEntries, isLoading, deleteTimeEntry } = useTimeTracking();

    const handleLogTime = () => {
        setSelectedEntry(undefined);
        setIsDialogOpen(true);
    };

    const handleEditEntry = (entry: TimeEntry) => {
        setSelectedEntry(entry);
        setIsDialogOpen(true);
    };

    const handleDeleteEntry = (id: string) => {
        if (confirm("Are you sure you want to delete this time entry?")) {
            deleteTimeEntry.mutate(id);
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    const totalMinutes = timeEntries?.reduce((acc, entry) => acc + entry.duration, 0) || 0;
    const billableMinutes = timeEntries?.filter(e => e.billable).reduce((acc, entry) => acc + entry.duration, 0) || 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
                    <p className="text-muted-foreground">
                        Monitor and log time spent on your tasks and projects.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button onClick={handleLogTime} className="orbit-gradient text-white border-0 gap-2">
                        <Plus className="w-4 h-4" />
                        Log Time
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider">Total Time logged</CardDescription>
                        <CardTitle className="text-3xl">{formatDuration(totalMinutes)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <BarChart2 className="w-3 h-3" />
                            <span>Across all projects</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider">Billable Time</CardDescription>
                        <CardTitle className="text-3xl text-green-600">{formatDuration(billableMinutes)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{((billableMinutes / (totalMinutes || 1)) * 100).toFixed(1)}% of total time</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs uppercase font-bold tracking-wider">Active Projects</CardDescription>
                        <CardTitle className="text-3xl">4</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>This month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                    <h2 className="font-semibold">Recent Logs</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="divide-y">
                        {timeEntries?.map((entry: any) => (
                            <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="font-semibold text-sm truncate">{entry.tasks?.title || "Unknown Task"}</h4>
                                            {entry.billable && (
                                                <Badge variant="outline" className="text-[10px] uppercase h-4 px-1 bg-green-50 text-green-700 border-green-200">Billable</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.tasks?.projects?.color || "#ccc" }} />
                                                <span>{entry.tasks?.projects?.name || "No Project"}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {entry.date}</span>
                                        </div>
                                        {entry.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">"{entry.description}"</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{formatDuration(entry.duration)}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Duration</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditEntry(entry)}>
                                                <Edit2 className="w-3 h-3 mr-2" /> Edit Log
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteEntry(entry.id)} className="text-destructive">
                                                <Trash2 className="w-3 h-3 mr-2" /> Delete Log
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}

                        {timeEntries?.length === 0 && (
                            <div className="py-20 text-center">
                                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <h3 className="text-lg font-semibold">No time logs yet</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                                    Keep track of your productivity by logging your first work session.
                                </p>
                                <Button onClick={handleLogTime} variant="outline" className="mt-6">Log First Session</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <TimeEntryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                timeEntry={selectedEntry}
            />
        </div>
    );
}
