import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const projectStatusSchema = z.enum(["active", "archived"]);

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.enum(["free", "pro", "business"]),
  memberCount: z.number().int().nonnegative(),
});

export const labelSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  color: z.string(),
});

export const projectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  status: projectStatusSchema,
  taskCount: z.number().int().nonnegative(),
  completedTaskCount: z.number().int().nonnegative(),
});

export const taskSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  dueDate: z.string().nullable(),
  assignee: z.string(),
  labels: z.array(labelSchema),
});

export const activityEventSchema = z.object({
  id: z.string(),
  actor: z.string(),
  action: z.string(),
  target: z.string(),
  createdAt: z.string(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const workspaceResponseSchema = z.object({
  organization: organizationSchema,
  projects: z.array(projectSchema),
  tasks: z.object({ items: z.array(taskSchema), pagination: paginationSchema }),
  activity: z.array(activityEventSchema),
  currentUser: z
    .object({
      id: z.string(),
      email: z.string().email(),
      displayName: z.string().nullable().optional(),
      role: z.enum(["owner", "admin", "member", "viewer"]).optional(),
    })
    .optional(),
});
