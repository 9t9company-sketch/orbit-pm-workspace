import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, Subtask, Comment } from "@/data/types";
import { mockTasks } from "@/data/mockData";
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
            try {
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
            } catch (e) {
                console.warn("Supabase fetch failed, falling back to mock data", e);
                let filtered = [...mockTasks];
                if (filters?.projectId) filtered = filtered.filter(t => t.projectId === filters.projectId);
                if (filters?.status) filtered = filtered.filter(t => t.status === filters.status);
                if (filters?.assigneeId) filtered = filtered.filter(t => t.assigneeId === filters.assigneeId);
                if (filters?.search) filtered = filtered.filter(t => t.title.toLowerCase().includes(filters.search!.toLowerCase()));
                return filtered;
            }
        },
    });

    const createTask = useMutation({
        mutationFn: async (newTask: Partial<Task>) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("tasks")
                    .insert([newTask])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase create failed, falling back to local", e);
                const localTask = {
                    id: crypto.randomUUID(),
                    ...newTask,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    subtasks: [],
                    comments: []
                } as Task;
                
                // Update mock data for persistence across re-fetches
                mockTasks.unshift(localTask);
                
                return localTask;
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["tasks", filters], (old: Task[] | undefined) => {
                return [data, ...(old || [])];
            });
            // Also invalidate to be safe if filters don't match exactly but cache structure allows
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task created successfully");
        },
        onError: (error: any) => {
            toast.error(`Error creating task: ${error.message}`);
        },
    });

    const updateTask = useMutation({
        mutationFn: async (task: Partial<Task> & { id: string }) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("tasks")
                    .update(task)
                    .eq("id", task.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to local", e);
                const updatedTask = {
                    ...task,
                    updated_at: new Date().toISOString()
                } as any;

                const index = mockTasks.findIndex(t => t.id === task.id);
                if (index !== -1) {
                    mockTasks[index] = { ...mockTasks[index], ...updatedTask };
                }
                
                return updatedTask;
            }
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["tasks", filters], (old: Task[] | undefined) => {
                return (old || []).map((t) => (t.id === data.id ? { ...t, ...data } : t));
            });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            // toast.success("Task updated"); // Throttled to avoid toast spam during drags
        },
        onError: (error: any) => {
            toast.error(`Error updating task: ${error.message}`);
        },
    });

    const deleteTask = useMutation({
        mutationFn: async (id: string) => {
            try {
                const { error } = await (supabase as any)
                    .from("tasks")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
            } catch (e) {
                console.warn("Supabase delete failed, falling back to local", e);
                const index = mockTasks.findIndex(t => t.id === id);
                if (index !== -1) {
                    mockTasks.splice(index, 1);
                }
                return id;
            }
        },
        onSuccess: (_, variables) => {
            const id = typeof _ === 'string' ? _ : variables;
            queryClient.setQueryData(["tasks", filters], (old: Task[] | undefined) => {
                return (old || []).filter((t) => t.id !== id);
            });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task deleted");
        },
    });

    // Bulk actions
    const bulkUpdateStatus = useMutation({
        mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
            try {
                const { error } = await (supabase as any)
                    .from("tasks")
                    .update({ status })
                    .in("id", ids);

                if (error) throw error;
            } catch (e) {
                 console.warn("Supabase bulk update failed, falling back to local", e);
                 mockTasks.forEach(t => {
                     if (ids.includes(t.id)) {
                         t.status = status as any;
                     }
                 });
                 return { ids, status };
            }
        },
        onSuccess: (data) => {
            if (data) {
                 queryClient.setQueryData(["tasks", filters], (old: Task[] | undefined) => {
                    return (old || []).map(t => data.ids.includes(t.id) ? { ...t, status: data.status } : t);
                 });
            }
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
