import { http, HttpResponse } from "msw";
import { workspaceResponseSchema, type TaskStatus } from "@teamflow/types";
import {
  demoActivity,
  demoOrganization,
  demoProjects,
  demoTasks,
} from "./fixtures";

const tasks = [...demoTasks];

const getProject = (projectId: string) =>
  demoProjects.find((project) => project.id === projectId);

export const handlers = [
  http.get("*/mock-api/workspace", () => {
    const response = {
      organization: demoOrganization,
      currentUser: {
        id: "user_maya",
        email: "maya@northstar.example",
        displayName: "Maya Chen",
        role: "owner" as const,
      },
      projects: demoProjects,
      tasks: {
        items: tasks,
        pagination: { page: 1, pageSize: 100, total: tasks.length },
      },
      activity: demoActivity,
    };
    return HttpResponse.json(workspaceResponseSchema.parse(response));
  }),
  http.get("*/mock-api/projects/:projectId/tasks", ({ params }) => {
    const project = getProject(String(params.projectId));
    if (!project)
      return HttpResponse.json(
        { error: { code: "PROJECT_NOT_FOUND" } },
        { status: 404 },
      );
    const items = tasks.filter((task) => task.projectId === project.id);
    return HttpResponse.json({
      items,
      pagination: { page: 1, pageSize: 100, total: items.length },
    });
  }),
  http.patch("*/mock-api/tasks/:taskId", async ({ params, request }) => {
    const task = tasks.find((item) => item.id === params.taskId);
    if (!task)
      return HttpResponse.json(
        { error: { code: "TASK_NOT_FOUND" } },
        { status: 404 },
      );
    const input = (await request.json()) as { status?: TaskStatus };
    if (input.status) task.status = input.status;
    return HttpResponse.json({ task });
  }),
];
