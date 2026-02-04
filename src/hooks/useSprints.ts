import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sprint, Task } from "@/data/types";
import { toast } from "sonner";
import { mockSprints } from "@/data/mockData";

export function useSprints(projectId?: string) {
    const queryClient = useQueryClient();

    const { data: sprints, isLoading, error } = useQuery({
        queryKey: ["sprints", projectId],
        queryFn: async () => {
            try {
                let query = (supabase as any)
                    .from("sprints")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (projectId) {
                    query = query.eq("project_id", projectId);
                }

                const { data, error } = await query;

                if (error) throw error;
                return data as Sprint[];
            } catch (e) {
                console.warn("Supabase fetch failed, falling back to mock data", e);
                return projectId 
                    ? mockSprints.filter(s => s.projectId === projectId)
                    : mockSprints;
            }
        },
    });

    const createSprint = useMutation({
        mutationFn: async (newSprint: Partial<Sprint>) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("sprints")
                    .insert([newSprint])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase create failed, falling back to mock", e);
                const localSprint = { ...newSprint, id: `mock-sprint-${Date.now()}` } as Sprint;
                mockSprints.unshift(localSprint);
                return localSprint;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint created successfully");
        },
        onError: (error: any) => {
            toast.error(`Error creating sprint: ${error.message}`);
        },
    });

    const updateSprint = useMutation({
        mutationFn: async (sprint: Partial<Sprint> & { id: string }) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("sprints")
                    .update(sprint)
                    .eq("id", sprint.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to mock", e);
                const index = mockSprints.findIndex(s => s.id === sprint.id);
                if (index !== -1) {
                    mockSprints[index] = { ...mockSprints[index], ...sprint };
                }
                return sprint as Sprint;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint updated");
        },
        onError: (error: any) => {
            toast.error(`Error updating sprint: ${error.message}`);
        },
    });

    const deleteSprint = useMutation({
        mutationFn: async (id: string) => {
            try {
                const { error } = await (supabase as any)
                    .from("sprints")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
            } catch (e) {
                console.warn("Supabase delete failed, falling back to mock", e);
                const index = mockSprints.findIndex(s => s.id === id);
                if (index !== -1) {
                    mockSprints.splice(index, 1);
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint deleted");
        },
    });

    const startSprint = useMutation({
        mutationFn: async (id: string) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("sprints")
                    .update({ status: "active" })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to mock", e);
                const index = mockSprints.findIndex(s => s.id === id);
                if (index !== -1) {
                    mockSprints[index].status = "active";
                }
                return { id, status: "active" };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint started!");
        },
    });

    const completeSprint = useMutation({
        mutationFn: async (id: string) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("sprints")
                    .update({ status: "completed" })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to mock", e);
                const index = mockSprints.findIndex(s => s.id === id);
                if (index !== -1) {
                    mockSprints[index].status = "completed";
                }
                return { id, status: "completed" };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint completed!");
        },
    });

    return {
        sprints,
        isLoading,
        error,
        createSprint,
        updateSprint,
        deleteSprint,
        startSprint,
        completeSprint,
    };
}
