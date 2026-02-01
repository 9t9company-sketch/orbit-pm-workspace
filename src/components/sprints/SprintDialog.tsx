import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sprint, Project } from "@/data/types";
import { useSprints } from "@/hooks/useSprints";
import { useProjects } from "@/hooks/useProjects";

const sprintSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    goal: z.string().optional(),
    projectId: z.string().min(1, "Project is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    status: z.enum(["planned", "active", "completed"]),
});

type SprintFormValues = z.infer<typeof sprintSchema>;

interface SprintDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sprint?: Sprint;
    projectId?: string;
}

export function SprintDialog({ open, onOpenChange, sprint, projectId }: SprintDialogProps) {
    const { createSprint, updateSprint } = useSprints();
    const { projects } = useProjects();

    const form = useForm<SprintFormValues>({
        resolver: zodResolver(sprintSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "",
            projectId: projectId || "",
            startDate: "",
            endDate: "",
            status: "planned",
        },
    });

    useEffect(() => {
        if (sprint) {
            form.reset({
                name: sprint.name,
                description: sprint.description || "",
                goal: sprint.goal || "",
                projectId: sprint.projectId,
                startDate: sprint.startDate,
                endDate: sprint.endDate,
                status: sprint.status,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                goal: "",
                projectId: projectId || "",
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: "planned",
            });
        }
    }, [sprint, form, open, projectId]);

    async function onSubmit(values: SprintFormValues) {
        if (sprint) {
            await updateSprint.mutateAsync({ ...values, id: sprint.id });
        } else {
            await createSprint.mutateAsync({
                ...values,
            });
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{sprint ? "Edit Sprint" : "Create New Sprint"}</DialogTitle>
                    <DialogDescription>
                        Defines a period of work for your team. Usually 2 weeks.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Sprint 1, Oct Sprint, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="projectId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projects?.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sprint Goal</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What are we trying to achieve?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={createSprint.isPending || updateSprint.isPending}>
                                {sprint ? "Save Changes" : "Create Sprint"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
