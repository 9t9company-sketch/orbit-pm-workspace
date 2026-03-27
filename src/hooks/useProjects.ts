import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/data/types";
import { mockProjects } from "@/data/mockData";
import { toast } from "sonner";

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Project[];
      } catch (e) {
        console.warn("Supabase fetch failed, falling back to mock data", e);
        return mockProjects;
      }
    },
  });

  const createProject = useMutation({
    mutationFn: async (newProject: Omit<Project, "id" | "taskCount" | "completedTasks">) => {
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .insert([{
            ...newProject,
            taskCount: 0,
            completedTasks: 0,
            status: "active",
            health: "on-track",
            progress: 0
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (e) {
                console.warn("Supabase create failed, falling back to local", e);
                const localProject = {
                    id: crypto.randomUUID(),
                    ...newProject,
                    taskCount: 0,
                    completedTasks: 0,
                    status: "active",
                    health: "on-track",
                    progress: 0,
                    created_at: new Date().toISOString()
                } as Project;

                mockProjects.unshift(localProject);
                return localProject;
            }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return [data, ...(old || [])];
      });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating project: ${error.message}`);
    },
  });

  const updateProject = useMutation({
    mutationFn: async (project: Partial<Project> & { id: string }) => {
      try {
        const { data, error } = await (supabase as any)
          .from("projects")
          .update(project)
          .eq("id", project.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (e) {
                console.warn("Supabase update failed, falling back to local", e);
                const updatedProject = {
                    ...project,
                    updated_at: new Date().toISOString()
                } as any;

                const index = mockProjects.findIndex(p => p.id === project.id);
                if (index !== -1) {
                    mockProjects[index] = { ...mockProjects[index], ...updatedProject };
                }
                return updatedProject;
            }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return (old || []).map((p) => (p.id === data.id ? { ...p, ...data } : p));
      });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating project: ${error.message}`);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await (supabase as any)
          .from("projects")
          .delete()
          .eq("id", id);

        if (error) throw error;
      } catch (e) {
                console.warn("Supabase delete failed, falling back to local", e);
                const index = mockProjects.findIndex(p => p.id === id);
                if (index !== -1) {
                    mockProjects.splice(index, 1);
                }
                return id;
            }
    },
    onSuccess: (_, variables) => {
      const id = typeof _ === 'string' ? _ : variables;
      queryClient.setQueryData(["projects"], (old: Project[] | undefined) => {
        return (old || []).filter((p) => p.id !== id);
      });
      toast.success("Project deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Error deleting project: ${error.message}`);
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
}
