import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Timer,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  mockProjects,
  mockTasks,
  mockUsers,
  mockSprints,
  currentUser,
} from "@/data/mockData";

export default function Dashboard() {
  const activeTasks = mockTasks.filter((t) => t.status === "in_progress").length;
  const completedTasks = mockTasks.filter((t) => t.status === "done").length;
  const totalTasks = mockTasks.length;
  const activeSprint = mockSprints.find((s) => s.status === "active");

  const stats = [
    {
      title: "Active Projects",
      value: mockProjects.filter((p) => p.status === "active").length,
      icon: FolderKanban,
      change: "+2 this month",
      changeType: "positive" as const,
    },
    {
      title: "Tasks Completed",
      value: completedTasks,
      icon: CheckCircle2,
      change: `${Math.round((completedTasks / totalTasks) * 100)}% completion rate`,
      changeType: "neutral" as const,
    },
    {
      title: "In Progress",
      value: activeTasks,
      icon: Timer,
      change: "3 due this week",
      changeType: "warning" as const,
    },
    {
      title: "Team Members",
      value: mockUsers.length,
      icon: Users,
      change: "All active",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {currentUser.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="orbit-hover-lift animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={cn(
                  "text-xs mt-1",
                  stat.changeType === "positive" && "text-orbit-success",
                  stat.changeType === "warning" && "text-orbit-warning",
                  stat.changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Overview */}
        <Card className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
            <CardDescription>Track progress across all active projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProjects.map((project) => {
              const owner = mockUsers.find((u) => u.id === project.ownerId);
              return (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        project.health === "on-track" && "orbit-status-success",
                        project.health === "at-risk" && "orbit-status-warning",
                        project.health === "off-track" && "bg-destructive/15 text-destructive border-destructive/30"
                      )}
                    >
                      {project.health === "on-track" ? "On Track" : project.health === "at-risk" ? "At Risk" : "Off Track"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={owner?.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {owner?.name?.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-muted-foreground">{owner?.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {project.completedTasks}/{project.taskCount} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={project.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Sprint Progress */}
        <Card className="animate-slide-up" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle>Active Sprint</CardTitle>
            <CardDescription>{activeSprint?.name || "No active sprint"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {activeSprint && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {activeSprint.taskIds.filter(
                        (id) => mockTasks.find((t) => t.id === id)?.status === "done"
                      ).length}
                      /{activeSprint.taskIds.length} tasks
                    </span>
                  </div>
                  <Progress
                    value={
                      (activeSprint.taskIds.filter(
                        (id) => mockTasks.find((t) => t.id === id)?.status === "done"
                      ).length /
                        activeSprint.taskIds.length) *
                      100
                    }
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold">{activeSprint.velocity}</p>
                    <p className="text-xs text-muted-foreground">Story Points</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 text-center">
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-xs text-muted-foreground">Days Left</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Sprint Tasks</p>
                  {activeSprint.taskIds.slice(0, 3).map((taskId) => {
                    const task = mockTasks.find((t) => t.id === taskId);
                    if (!task) return null;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/20 text-sm"
                      >
                        <span className="truncate flex-1">{task.title}</span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs ml-2",
                            task.status === "done" && "orbit-status-success",
                            task.status === "in_progress" && "orbit-status-info",
                            task.status === "blocked" && "orbit-status-warning"
                          )}
                        >
                          {task.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & My Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockTasks
              .filter((t) => t.assigneeId === currentUser.id)
              .slice(0, 5)
              .map((task) => {
                const project = mockProjects.find((p) => p.id === task.projectId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        task.priority === "urgent" && "bg-destructive",
                        task.priority === "high" && "bg-orange-500",
                        task.priority === "medium" && "bg-amber-500",
                        task.priority === "low" && "bg-emerald-500"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project?.name} • {task.dueDate ? `Due ${task.dueDate}` : "No due date"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Team Activity */}
        <Card className="animate-slide-up" style={{ animationDelay: "350ms" }}>
          <CardHeader>
            <CardTitle>Team Activity</CardTitle>
            <CardDescription>Recent updates from your team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                user: mockUsers[1],
                action: "completed",
                target: "Database schema design",
                time: "2 hours ago",
              },
              {
                user: mockUsers[2],
                action: "commented on",
                target: "Build authentication module",
                time: "3 hours ago",
              },
              {
                user: mockUsers[3],
                action: "started",
                target: "Create component library",
                time: "5 hours ago",
              },
              {
                user: mockUsers[4],
                action: "moved to review",
                target: "Unit tests for auth service",
                time: "Yesterday",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user.avatar} />
                  <AvatarFallback className="text-xs">
                    {activity.user.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
