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
import { Switch } from "@/components/ui/switch";
import { TimeEntry, Task } from "@/data/types";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useTasks } from "@/hooks/useTasks";

const timeEntrySchema = z.object({
    taskId: z.string().min(1, "Task is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
    billable: z.boolean().default(true),
});

type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;

interface TimeEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    timeEntry?: TimeEntry;
}

export function TimeEntryDialog({ open, onOpenChange, timeEntry }: TimeEntryDialogProps) {
    const { createTimeEntry, updateTimeEntry } = useTimeTracking();
    const { tasks } = useTasks();

    const form = useForm<TimeEntryFormValues>({
        resolver: zodResolver(timeEntrySchema),
        defaultValues: {
            taskId: "",
            duration: 0,
            date: new Date().toISOString().split('T')[0],
            description: "",
            billable: true,
        },
    });

    useEffect(() => {
        if (timeEntry) {
            form.reset({
                taskId: timeEntry.taskId,
                duration: timeEntry.duration,
                date: timeEntry.date,
                description: timeEntry.description || "",
                billable: timeEntry.billable,
            });
        } else {
            form.reset({
                taskId: "",
                duration: 0,
                date: new Date().toISOString().split('T')[0],
                description: "",
                billable: true,
            });
        }
    }, [timeEntry, form, open]);

    async function onSubmit(values: TimeEntryFormValues) {
        if (timeEntry) {
            await updateTimeEntry.mutateAsync({ ...values, id: timeEntry.id });
        } else {
            await createTimeEntry.mutateAsync({
                ...values,
                userId: "user-1", // Demo user
            });
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{timeEntry ? "Edit Time Entry" : "Log Time"}</DialogTitle>
                    <DialogDescription>
                        Record the time you spent on a specific task.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="taskId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select task" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {tasks?.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
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
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
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
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="What did you work on?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="billable"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Billable</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={createTimeEntry.isPending || updateTimeEntry.isPending}>
                                {timeEntry ? "Save Changes" : "Log Time"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
