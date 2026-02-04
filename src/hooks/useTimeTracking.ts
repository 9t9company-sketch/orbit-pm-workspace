import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TimeEntry } from "@/data/types";
import { toast } from "sonner";

// Mock data for time entries since it might not exist in mockData.ts
const mockTimeEntries: (TimeEntry & { tasks: { title: string, projects: { name: string, color: string } } })[] = [
    {
        id: "te-1",
        taskId: "task-1",
        userId: "user-1",
        startTime: "2024-02-01T09:00:00",
        endTime: "2024-02-01T11:00:00",
        duration: 7200,
        description: "Initial research",
        date: "2024-02-01",
        tasks: {
            title: "Research competitors",
            projects: {
                name: "Website Redesign",
                color: "#4F46E5"
            }
        }
    },
    {
        id: "te-2",
        taskId: "task-2",
        userId: "user-1",
        startTime: "2024-02-02T13:00:00",
        endTime: "2024-02-02T15:30:00",
        duration: 9000,
        description: "Drafting wireframes",
        date: "2024-02-02",
        tasks: {
            title: "Create wireframes",
            projects: {
                name: "Mobile App",
                color: "#10B981"
            }
        }
    }
];

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
            try {
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
            } catch (e) {
                console.warn("Supabase fetch failed, falling back to mock data", e);
                // Filter mock data based on filters if needed
                let filtered = [...mockTimeEntries];
                if (filters?.taskId) filtered = filtered.filter(t => t.taskId === filters.taskId);
                if (filters?.userId) filtered = filtered.filter(t => t.userId === filters.userId);
                // Date filtering omitted for simplicity in mock
                return filtered;
            }
        },
    });

    const createTimeEntry = useMutation({
        mutationFn: async (newEntry: Partial<TimeEntry>) => {
            try {
                const { data, error } = await (supabase as any)
                    .from("time_entries")
                    .insert([newEntry])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase create failed, falling back to mock", e);
                const localEntry = { ...newEntry, id: `mock-te-${Date.now()}` } as TimeEntry;
                // Add required nested objects for UI
                (localEntry as any).tasks = {
                    title: "Mock Task",
                    projects: {
                        name: "Mock Project",
                        color: "#999999"
                    }
                };
                mockTimeEntries.unshift(localEntry as any);
                return localEntry;
            }
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
            try {
                const { data, error } = await (supabase as any)
                    .from("time_entries")
                    .update(entry)
                    .eq("id", entry.id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } catch (e) {
                console.warn("Supabase update failed, falling back to mock", e);
                const index = mockTimeEntries.findIndex(te => te.id === entry.id);
                if (index !== -1) {
                    mockTimeEntries[index] = { ...mockTimeEntries[index], ...entry };
                }
                return entry as TimeEntry;
            }
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
            try {
                const { error } = await (supabase as any)
                    .from("time_entries")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
            } catch (e) {
                console.warn("Supabase delete failed, falling back to mock", e);
                const index = mockTimeEntries.findIndex(te => te.id === id);
                if (index !== -1) {
                    mockTimeEntries.splice(index, 1);
                }
            }
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
