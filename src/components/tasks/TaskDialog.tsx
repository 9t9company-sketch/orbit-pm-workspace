import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Task, Project, User } from "@/data/types";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useSprints } from "@/hooks/useSprints";
import { mockUsers } from "@/data/mockData";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional(),
    status: z.enum(["todo", "in_progress", "blocked", "done", "canceled"]),
    priority: z.enum(["low", "medium", "high", "urgent"]),
    projectId: z.string().optional(),
    sprintId: z.string().optional(),
    assigneeId: z.string().optional(),
    dueDate: z.string().optional(),
    subtasks: z.array(z.object({
        title: z.string().min(1, "Subtask title required"),
        completed: z.boolean().default(false),
    })).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task;
    projectId?: string;
}

export function TaskDialog({ open, onOpenChange, task, projectId }: TaskDialogProps) {
    const { createTask, updateTask } = useTasks();
    const { projects } = useProjects();
    const selectedProjectId = form.watch("projectId");
    const { sprints } = useSprints(selectedProjectId);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            projectId: projectId || "",
            sprintId: "",
            assigneeId: "",
            dueDate: "",
            subtasks: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subtasks",
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                projectId: task.projectId || "",
                sprintId: task.sprintId || "",
                assigneeId: task.assigneeId || "",
                dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
                subtasks: task.subtasks?.map(s => ({ title: s.title, completed: s.completed })) || [],
            });
        } else {
            form.reset({
                title: "",
                description: "",
                status: "todo",
                priority: "medium",
                projectId: projectId || "",
                sprintId: "",
                assigneeId: "",
                dueDate: "",
                subtasks: [],
            });
        }
    }, [task, form, open, projectId]);

    async function onSubmit(values: TaskFormValues) {
        if (task) {
            await updateTask.mutateAsync({ ...values, id: task.id });
        } else {
            await createTask.mutateAsync({
                ...values,
                creatorId: "user-1", // Demo user
                isRecurring: false,
                visibility: "team",
            });
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your task below. Support for subtasks and assignment included.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="What needs to be done?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add more details... (Markdown supported)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="blocked">Blocked</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                                <SelectItem value="canceled">Canceled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Assign someone" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {mockUsers.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sprintId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sprint</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedProjectId}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={selectedProjectId ? "Select sprint" : "Select project first"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="backlog">Backlog (No Sprint)</SelectItem>
                                                {sprints?.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Subtasks Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-sm font-medium">Subtasks</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ title: "", completed: false })}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Subtask
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <FormControl>
                                            <Input
                                                placeholder="Subtask title"
                                                {...form.register(`subtasks.${index}.title` as const)}
                                                className="flex-1"
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="text-destructive h-9 w-9"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={createTask.isPending || updateTask.isPending}>
                                {task ? "Save Changes" : "Create Task"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
