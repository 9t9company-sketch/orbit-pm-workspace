export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "manager" | "member" | "viewer";
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  ownerId: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  color: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: "lead" | "member";
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "on-hold" | "completed" | "archived";
  health: "on-track" | "at-risk" | "off-track";
  ownerId: string;
  teamId?: string;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
  taskCount: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "blocked" | "done" | "canceled";
  priority: "low" | "medium" | "high" | "urgent";
  projectId?: string;
  sprintId?: string;
  assigneeId?: string;
  creatorId: string;
  labels: string[];
  dueDate?: string;
  startDate?: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  comments?: Comment[];
  visibility: "private" | "team" | "project";
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  rule: string;
  nextOccurrence: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  orderIndex: number;
}

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  url: string;
  type: "file" | "link";
  size?: number;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: any;
  createdAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  description?: string;
  goal?: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "completed";
  taskIds: string[];
  velocity?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "mention" | "assignment" | "due-soon" | "status-change" | "comment";
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  duration: number; // in minutes
  date: string;
  description?: string;
  billable: boolean;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  reactions?: { emoji: string; userIds: string[] }[];
}
