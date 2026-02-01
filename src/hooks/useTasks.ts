import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, Subtask, Comment } from "@/data/types";
import { toast } from "sonner";

export function useTasks(filters?: {
    projectId?: string;
    status?: string;
    assigneeId?: string;
    search?: string;
}) {
    const queryClient = useQueryClient();

    const { data: tasks, isLoading, error } = useQuery({
        queryKey: ["tasks", filters],
        queryFn: async () => {
            let query = (supabase as any)
                .from("tasks")
                .select("*, subtasks(*), comments(*)");

            if (filters?.projectId) query = query.eq("project_id", filters.projectId);
            if (filters?.status) query = query.eq("status", filters.status);
            if (filters?.assigneeId) query = query.eq("assignee_id", filters.assigneeId);
            if (filters?.search) query = query.ilike("title", `%${filters.search}%`);

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            return data as Task[];
        },
    });

    const createTask = useMutation({
        mutationFn: async (newTask: Partial<Task>) => {
            const { data, error } = await (supabase as any)
                .from("tasks")
                .insert([newTask])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task created successfully");
        },
        onError: (error: any) => {
            toast.error(`Error creating task: ${error.message}`);
        },
    });

    const updateTask = useMutation({
        mutationFn: async (task: Partial<Task> & { id: string }) => {
            const { data, error } = await (supabase as any)
                .from("tasks")
                .update(task)
                .eq("id", task.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // toast.success("Task updated"); // Throttled to avoid toast spam during drags
        },
        onError: (error: any) => {
            toast.error(`Error updating task: ${error.message}`);
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any)
                .from("tasks")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task deleted");
        },
    });

    // Bulk actions
    const bulkUpdateStatus = useMutation({
        mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
            const { error } = await (supabase as any)
                .from("tasks")
                .update({ status })
                .in("id", ids);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success(`Updated ${queryClient.getQueryData(["tasks"]) ? "tasks" : "selected tasks"}`);
        },
    });

    return {
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        bulkUpdateStatus,
    };
}
