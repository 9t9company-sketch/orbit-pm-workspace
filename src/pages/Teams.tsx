import { useState } from "react";
import { Plus, Users, UserPlus, MoreHorizontal, Settings, Trash2, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTeams } from "@/hooks/useTeams";
import { TeamDialog } from "@/components/teams/TeamDialog";
import { Team } from "@/data/types";
import { mockUsers } from "@/data/mockData";
import { cn } from "@/lib/utils";

export default function Teams() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(undefined);

    const { teams, isLoading, deleteTeam } = useTeams();

    const handleCreateNew = () => {
        setSelectedTeam(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (team: Team) => {
        setSelectedTeam(team);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this team? All members will be removed from the team group.")) {
            deleteTeam.mutate(id);
        }
    };

    const getMemberData = (id: string) => {
        return mockUsers.find(u => u.id === id);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                    <p className="text-muted-foreground">
                        Manage your organization's departments and collaborative groups.
                    </p>
                </div>
                <Button onClick={handleCreateNew} className="orbit-gradient text-white border-0 gap-2">
                    <Plus className="w-4 h-4" />
                    Create Team
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-64 bg-muted/20" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {teams?.map((team) => (
                        <Card key={team.id} className="group hover:border-primary/50 transition-all flex flex-col">
                            <CardHeader className="pb-3 border-b bg-muted/5 relative">
                                <div
                                    className="absolute top-0 left-0 w-full h-1"
                                    style={{ backgroundColor: team.color }}
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                            style={{ backgroundColor: team.color }}
                                        >
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {team.memberIds.length} members
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => handleEdit(team)}>
                                                <Settings className="w-4 h-4 mr-2" /> Team Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <UserPlus className="w-4 h-4 mr-2" /> Invite Member
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(team.id)} className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete Team
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                                    {team.description || "No description provided for this team."}
                                </p>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Key Members</h4>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {team.memberIds.slice(0, 5).map((memberId, idx) => {
                                            const user = getMemberData(memberId);
                                            return (
                                                <Avatar key={memberId} className="inline-block border-2 border-background w-8 h-8">
                                                    <AvatarImage src={user?.avatar} />
                                                    <AvatarFallback className="text-[10px] bg-muted">
                                                        {user?.name.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                            );
                                        })}
                                        {team.memberIds.length > 5 && (
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-[10px] font-bold">
                                                +{team.memberIds.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 border-t">
                                <Button variant="ghost" className="w-full text-xs gap-2 text-muted-foreground hover:text-primary">
                                    View Full Roster <ChevronRight className="w-3 h-3" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {teams?.length === 0 && (
                        <div className="col-span-full py-20 bg-muted/30 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center">
                            <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold">No Teams Found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                Organize your workspace by creating teams for different departments or projects.
                            </p>
                            <Button onClick={handleCreateNew} variant="outline" className="mt-6">
                                Create First Team
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <TeamDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                team={selectedTeam}
            />
        </div>
    );
}

function ChevronRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
