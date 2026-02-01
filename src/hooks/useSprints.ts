import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sprint, Task } from "@/data/types";
import { toast } from "sonner";

export function useSprints(projectId?: string) {
    const queryClient = useQueryClient();

    const { data: sprints, isLoading, error } = useQuery({
        queryKey: ["sprints", projectId],
        queryFn: async () => {
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
        },
    });

    const createSprint = useMutation({
        mutationFn: async (newSprint: Partial<Sprint>) => {
            const { data, error } = await (supabase as any)
                .from("sprints")
                .insert([newSprint])
                .select()
                .single();

            if (error) throw error;
            return data;
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
            const { data, error } = await (supabase as any)
                .from("sprints")
                .update(sprint)
                .eq("id", sprint.id)
                .select()
                .single();

            if (error) throw error;
            return data;
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
            const { error } = await (supabase as any)
                .from("sprints")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint deleted");
        },
    });

    const startSprint = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await (supabase as any)
                .from("sprints")
                .update({ status: "active" })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints"] });
            toast.success("Sprint started!");
        },
    });

    const completeSprint = useMutation({
        mutationFn: async (id: string) => {
            const { data, error } = await (supabase as any)
                .from("sprints")
                .update({ status: "completed" })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
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
