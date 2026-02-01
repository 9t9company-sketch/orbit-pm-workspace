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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Team } from "@/data/types";
import { useTeams } from "@/hooks/useTeams";

const teamSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    team?: Team;
}

const PRESET_COLORS = ["#8B5CF6", "#F97316", "#0EA5E9", "#10B981", "#EF4444", "#F59E0B"];

export function TeamDialog({ open, onOpenChange, team }: TeamDialogProps) {
    const { createTeam, updateTeam } = useTeams();

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#8B5CF6",
        },
    });

    useEffect(() => {
        if (team) {
            form.reset({
                name: team.name,
                description: team.description || "",
                color: team.color,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                color: "#8B5CF6",
            });
        }
    }, [team, form, open]);

    async function onSubmit(values: TeamFormValues) {
        if (team) {
            await updateTeam.mutateAsync({ ...values, id: team.id });
        } else {
            await createTeam.mutateAsync({
                ...values,
                memberIds: ["user-1"], // Default to current user for demo
            });
        }
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{team ? "Edit Team" : "Create New Team"}</DialogTitle>
                    <DialogDescription>
                        Group users together for easier project and task management.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Engineering, Marketing, etc." {...field} />
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
                                        <Textarea placeholder="What does this team focus on?" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Color</FormLabel>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${field.value === color ? "border-primary scale-110" : "border-transparent hover:scale-105"}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => field.onChange(color)}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={createTeam.isPending || updateTeam.isPending}>
                                {team ? "Save Changes" : "Create Team"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
