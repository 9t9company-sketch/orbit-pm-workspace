import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/data/types";
import { toast } from "sonner";

export function useTimeTracking(filters?: {
    taskId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
}) {
    const queryClient = useQueryClient();

    const { data: timeEntries, isLoading, error } = useQuery({
        queryKey: ["time_entries", filters],
        queryFn: async () => {
            let query = (supabase as any)
                .from("time_entries")
                .select(`
          *,
          tasks (
            title,
            projects (
              name,
              color
            )
          )
        `)
                .order("date", { ascending: false });

            if (filters?.taskId) query = query.eq("task_id", filters.taskId);
            if (filters?.userId) query = query.eq("user_id", filters.userId);
            if (filters?.startDate) query = query.gte("date", filters.startDate);
            if (filters?.endDate) query = query.lte("date", filters.endDate);

            const { data, error } = await query;

            if (error) throw error;
            return data as (TimeEntry & { tasks: { title: string, projects: { name: string, color: string } } })[];
        },
    });

    const createTimeEntry = useMutation({
        mutationFn: async (newEntry: Partial<TimeEntry>) => {
            const { data, error } = await (supabase as any)
                .from("time_entries")
                .insert([newEntry])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_entries"] });
            toast.success("Time logged successfully");
        },
        onError: (error: any) => {
            toast.error(`Error logging time: ${error.message}`);
        },
    });

    const updateTimeEntry = useMutation({
        mutationFn: async (entry: Partial<TimeEntry> & { id: string }) => {
            const { data, error } = await (supabase as any)
                .from("time_entries")
                .update(entry)
                .eq("id", entry.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_entries"] });
            toast.success("Time entry updated");
        },
        onError: (error: any) => {
            toast.error(`Error updating time entry: ${error.message}`);
        },
    });

    const deleteTimeEntry = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from("time_entries")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["time_entries"] });
            toast.success("Time entry deleted");
        },
    });

    return {
        timeEntries,
        isLoading,
        error,
        createTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
    };
}
