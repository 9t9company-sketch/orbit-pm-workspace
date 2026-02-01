import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/data/types";
import { toast } from "sonner";

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async (newProject: Omit<Project, "id" | "taskCount" | "completedTasks">) => {
      const { data, error } = await supabase
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating project: ${error.message}`);
    },
  });

  const updateProject = useMutation({
    mutationFn: async (project: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", project.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating project: ${error.message}`);
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
