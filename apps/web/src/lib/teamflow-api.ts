import type {
  Organization,
  PaginatedResponse,
  Project,
  Task,
  TaskStatus,
  WorkspaceResponse,
} from "@teamflow/types";

type ApiErrorBody = { error?: { code?: string; message?: string } };

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_API === "true";

const requestJson = async <T>(path: string, init?: RequestInit) => {
  const response = await fetch(`/api/teamflow${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiRequestError(
      response.status,
      body.error?.code,
      body.error?.message ?? "The API request failed.",
    );
  }
  return (await response.json()) as T;
};

type AuthUser = { id: string; email: string; displayName?: string | null };
type OrganizationMembership = {
  organization: Organization;
  role: "owner" | "admin" | "member" | "viewer";
};
type Member = { userId: string; displayName?: string | null; email: string };
type ApiProject = Omit<Project, "taskCount" | "completedTaskCount">;
type ApiTask = Omit<Task, "assignee" | "labels"> & {
  assigneeId: string | null;
};

const loadMockWorkspace = async () => {
  const workspace = await requestJson<WorkspaceResponse>("/mock-api/workspace");

  return {
    ...workspace,
    currentUser: workspace.currentUser ?? {
      id: "user_maya",
      email: "maya@northstar.example",
      displayName: "Maya Chen",
      role: "owner" as const,
    },
  };
};

const loadRealWorkspace = async (): Promise<WorkspaceResponse> => {
  const [{ user }, organizations] = await Promise.all([
    requestJson<{ user: AuthUser }>("/auth/me"),
    requestJson<OrganizationMembership[]>("/organizations"),
  ]);
  const membership = organizations[0];
  if (!membership)
    throw new ApiRequestError(
      404,
      "NO_ORGANIZATION",
      "No organization is available for this account.",
    );

  const organizationId = membership.organization.id;
  const [projectsResponse, tasksResponse, members] = await Promise.all([
    requestJson<{
      items: ApiProject[];
      pagination: { page: number; pageSize: number; total: number };
    }>(`/organizations/${organizationId}/projects?page=1&pageSize=100`),
    requestJson<PaginatedResponse<ApiTask>>(
      `/organizations/${organizationId}/tasks?page=1&pageSize=100`,
    ),
    requestJson<Member[]>(`/organizations/${organizationId}/members`),
  ]);

  const memberNames = new Map(
    members.map((member) => [
      member.userId,
      member.displayName ?? member.email,
    ]),
  );
  const tasks: Task[] = tasksResponse.items.map((task) => ({
    ...task,
    description: task.description ?? "",
    assignee: task.assigneeId
      ? (memberNames.get(task.assigneeId) ?? "Assigned member")
      : "Unassigned",
    labels: [],
  }));
  const projects: Project[] = projectsResponse.items.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    return {
      ...project,
      description: project.description ?? "",
      taskCount: projectTasks.length,
      completedTaskCount: projectTasks.filter((task) => task.status === "done")
        .length,
    };
  });
  const organization: Organization = {
    ...membership.organization,
    memberCount: members.length,
  };

  return {
    organization,
    projects,
    tasks: { ...tasksResponse, items: tasks },
    activity: [],
    currentUser: { ...user, role: membership.role },
  };
};

export const loadWorkspace = () =>
  isMockEnabled ? loadMockWorkspace() : loadRealWorkspace();

export const updateTaskStatus = (input: {
  organizationId: string;
  taskId: string;
  status: TaskStatus;
}) => {
  const path = isMockEnabled
    ? `/mock-api/tasks/${input.taskId}`
    : `/organizations/${input.organizationId}/tasks/${input.taskId}`;
  return requestJson<{ task: Task }>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: input.status }),
  });
};

export const login = (input: { email: string; password: string }) =>
  requestJson<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

export const getCurrentUser = () => requestJson<{ user: AuthUser }>("/auth/me");

export const logout = () =>
  isMockEnabled
    ? Promise.resolve()
    : requestJson<{ authenticated: false }>("/auth/logout", {
        method: "POST",
      });
