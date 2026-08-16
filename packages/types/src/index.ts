export type TaskStatus = "todo" | "in_progress" | "done";

export type ProjectStatus = "active" | "archived";

export type Organization = {
  id: string;
  name: string;
  plan: "free" | "pro" | "business";
  memberCount: number;
};

export type Project = {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  taskCount: number;
  completedTaskCount: number;
};

export type Label = {
  id: string;
  organizationId: string;
  name: string;
  color: string;
};

export type Task = {
  id: string;
  organizationId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  assignee: string;
  labels: Label[];
};

export type ActivityEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
};

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: Pagination;
};

export type WorkspaceResponse = {
  organization: Organization;
  projects: Project[];
  tasks: PaginatedResponse<Task>;
  activity: ActivityEvent[];
  currentUser?: {
    id: string;
    email: string;
    displayName?: string | null;
    role?: "owner" | "admin" | "member" | "viewer";
  };
};

export * from "./schemas";

export type TaskSummary = {
  id: string;
  title: string;
  status: TaskStatus;
};
