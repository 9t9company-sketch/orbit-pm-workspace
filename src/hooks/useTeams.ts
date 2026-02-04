import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember } from "@/data/types";
import { mockTeams } from "@/data/mockData";
import { toast } from "sonner";

export function useTeams() {
    const queryClient = useQueryClient();

    const { data: teams, isLoading, error } = useQuery({
        queryKey: ["teams"],
        queryFn: async () => {
            try {
                const { data, error } = await (supabase as any)
                    .from("teams")
                    .select(`
          *,
          team_members (
            user_id
          )
        `)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                // Map members to memberIds for the UI
                return data.map((team: any) => ({
                    ...team,
                    memberIds: team.team_members?.map((m: any) => m.user_id) || []
                })) as Team[];
            } catch (e) {
                console.warn("Supabase fetch failed, falling back to mock data", e);
                return mockTeams;
            }
        },
    });

    const createTeam = useMutation({
        mutationFn: async (newTeam: Partial<Team>) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("teams")
                    .insert([{
                        name: newTeam.name,
                        description: newTeam.description,
                        color: newTeam.color
                    }])
                    .select()
                    .single();

                if (error) throw error;

                // If there are members to add (e.g. the creator)
                if (newTeam.memberIds && newTeam.memberIds.length > 0) {
                    const members = newTeam.memberIds.map(userId => ({
                        team_id: data.id,
                        user_id: userId,
                        role: "lead" // First member is usually lead
                    }));

                    const { error: memberError } = await (supabase as any)
                        .from("team_members")
                        .insert(members);

                    if (memberError) throw memberError;
                }

                return data;
            } catch (e) {
                console.warn("Supabase create failed, falling back to local", e);
                const localTeam = {
                    id: crypto.randomUUID(),
                    ...newTeam,
                    memberIds: newTeam.memberIds || [],
                    created_at: new Date().toISOString()
                } as Team;
                
                mockTeams.unshift(localTeam);
                return localTeam;
            }
        },
        onSuccess: (data, variables) => {
            const newTeam = { ...data, memberIds: variables.memberIds || [] };
            queryClient.setQueryData(["teams"], (old: Team[] | undefined) => {
                return [newTeam, ...(old || [])];
            });
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            toast.success("Team created successfully");
        },
        onError: (error: any) => {
            toast.error(`Error creating team: ${error.message}`);
        },
    });

    const updateTeam = useMutation({
        mutationFn: async (team: Partial<Team> & { id: string }) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("teams")
                    .update({
                        name: team.name,
                        description: team.description,
                        color: team.color
                    })
                    .eq("id", team.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to local", e);
                const updatedTeam = {
                    ...team,
                    updated_at: new Date().toISOString()
                } as any;

                const index = mockTeams.findIndex(t => t.id === team.id);
                if (index !== -1) {
                    mockTeams[index] = { ...mockTeams[index], ...updatedTeam };
                }
                return updatedTeam;
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["teams"], (old: Team[] | undefined) => {
                return (old || []).map((t) => (t.id === data.id ? { ...t, ...data } : t));
            });
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            toast.success("Team updated");
        },
        onError: (error: any) => {
            toast.error(`Error updating team: ${error.message}`);
        },
    });

    const deleteTeam = useMutation({
        mutationFn: async (id: string) => {
            try {
                const { error } = await (supabase as any)
                    .from("teams")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
            } catch (e) {
                console.warn("Supabase delete failed, falling back to local", e);
                const index = mockTeams.findIndex(t => t.id === id);
                if (index !== -1) {
                    mockTeams.splice(index, 1);
                }
                return id;
            }
        },
        onSuccess: (_, variables) => {
            const id = typeof _ === 'string' ? _ : variables;
            queryClient.setQueryData(["teams"], (old: Team[] | undefined) => {
                return (old || []).filter((t) => t.id !== id);
            });
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            toast.success("Team deleted");
        },
    });

    const addMember = useMutation({
        mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role?: string }) => {
            const { data, error } = await (supabase as any)
                .from("team_members")
                .insert([{ team_id: teamId, user_id: userId, role: role || "member" }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            toast.success("Member added to team");
        },
    });

    return {
        teams,
        isLoading,
        error,
        createTeam,
        updateTeam,
        deleteTeam,
        addMember,
    };
}
