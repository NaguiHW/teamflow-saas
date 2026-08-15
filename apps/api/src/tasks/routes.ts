import type { FastifyInstance } from "fastify";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { recordAuditEvent } from "../audit.js";
import {
  authenticate,
  requireOrganizationMembership,
  requireOrganizationMembershipWithRoles,
} from "../auth/hooks.js";
import { db } from "../db/client.js";
import {
  comments,
  labels,
  memberships,
  projects,
  taskLabels,
  tasks,
} from "../db/schema.js";
import { ApiError } from "../errors.js";

const uuidSchema = z.string().uuid();
const organizationParams = z.object({ organizationId: uuidSchema });
const taskParams = organizationParams.extend({ taskId: uuidSchema });
const commentParams = taskParams.extend({ commentId: uuidSchema });
const labelParams = organizationParams.extend({ labelId: uuidSchema });
const taskInput = z.object({
  projectId: uuidSchema,
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  dueDate: z.coerce.date().nullable().optional(),
  assigneeId: uuidSchema.nullable().optional(),
});
const taskUpdate = taskInput.partial();
const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  projectId: uuidSchema.optional(),
  assigneeId: uuidSchema.optional(),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  sortBy: z.enum(["title", "createdAt", "dueDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
const simpleListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
const labelInput = z.object({
  name: z.string().trim().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
const commentInput = z.object({ body: z.string().trim().min(1).max(5000) });

const getOrganizationId = (request: { params: unknown }) =>
  organizationParams.parse(request.params).organizationId;
const getTaskParams = (request: { params: unknown }) =>
  taskParams.parse(request.params);
const getCommentParams = (request: { params: unknown }) =>
  commentParams.parse(request.params);
const getLabelParams = (request: { params: unknown }) =>
  labelParams.parse(request.params);

const ensureProject = async (organizationId: string, projectId: string) => {
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!project)
    throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
};

const ensureAssignee = async (
  organizationId: string,
  assigneeId?: string | null,
) => {
  if (!assigneeId) return;
  const [membership] = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, assigneeId),
      ),
    )
    .limit(1);
  if (!membership)
    throw new ApiError(
      400,
      "INVALID_ASSIGNEE",
      "Assignee is not a member of the organization.",
    );
};

const ensureTask = async (organizationId: string, taskId: string) => {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.organizationId, organizationId)))
    .limit(1);
  if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
  return task;
};

const taskRoutes = async (app: FastifyInstance) => {
  app.get(
    "/organizations/:organizationId/tasks",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const organizationId = getOrganizationId(request);
      const query = listQuery.parse(request.query);
      const filters = [eq(tasks.organizationId, organizationId)];
      if (query.projectId) filters.push(eq(tasks.projectId, query.projectId));
      if (query.assigneeId)
        filters.push(eq(tasks.assigneeId, query.assigneeId));
      if (query.status) filters.push(eq(tasks.status, query.status));
      if (query.search)
        filters.push(
          or(
            ilike(tasks.title, `%${query.search}%`),
            ilike(tasks.description, `%${query.search}%`),
          )!,
        );
      const orderColumn =
        query.sortBy === "title"
          ? tasks.title
          : query.sortBy === "dueDate"
            ? tasks.dueDate
            : tasks.createdAt;
      const order =
        query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);
      const offset = (query.page - 1) * query.pageSize;
      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(tasks)
          .where(and(...filters))
          .orderBy(order)
          .limit(query.pageSize)
          .offset(offset),
        db
          .select({ total: count() })
          .from(tasks)
          .where(and(...filters)),
      ]);
      return {
        items,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: Number(total),
        },
      };
    },
  );

  app.post(
    "/organizations/:organizationId/tasks",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request, reply) => {
      const organizationId = getOrganizationId(request);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
      const input = taskInput.parse(request.body);
      await ensureProject(organizationId, input.projectId);
      await ensureAssignee(organizationId, input.assigneeId);
      const [task] = await db
        .insert(tasks)
        .values({ ...input, organizationId, createdBy: user.id })
        .returning();
      await recordAuditEvent({
        organizationId,
        actorId: user.id,
        action: "task.created",
        entityType: "task",
        entityId: task.id,
      });
      return reply.code(201).send({ task });
    },
  );

  app.get(
    "/organizations/:organizationId/tasks/:taskId",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const { organizationId, taskId } = getTaskParams(request);
      return { task: await ensureTask(organizationId, taskId) };
    },
  );

  app.patch(
    "/organizations/:organizationId/tasks/:taskId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request) => {
      const { organizationId, taskId } = getTaskParams(request);
      const user = request.user;
      const input = taskUpdate.parse(request.body);
      if (Object.keys(input).length === 0)
        throw new ApiError(
          400,
          "EMPTY_UPDATE",
          "At least one field is required.",
        );
      await ensureTask(organizationId, taskId);
      if (input.projectId) await ensureProject(organizationId, input.projectId);
      if ("assigneeId" in input)
        await ensureAssignee(organizationId, input.assigneeId);
      const [task] = await db
        .update(tasks)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(eq(tasks.id, taskId), eq(tasks.organizationId, organizationId)),
        )
        .returning();
      if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
      await recordAuditEvent({
        organizationId,
        actorId: user?.id,
        action: "task.updated",
        entityType: "task",
        entityId: task.id,
      });
      return { task };
    },
  );

  app.delete(
    "/organizations/:organizationId/tasks/:taskId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request) => {
      const { organizationId, taskId } = getTaskParams(request);
      const [task] = await db
        .delete(tasks)
        .where(
          and(eq(tasks.id, taskId), eq(tasks.organizationId, organizationId)),
        )
        .returning({ id: tasks.id });
      if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found.");
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "task.deleted",
        entityType: "task",
        entityId: task.id,
      });
      return { deleted: true };
    },
  );

  app.get(
    "/organizations/:organizationId/labels",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const organizationId = getOrganizationId(request);
      const query = simpleListQuery.parse(request.query);
      const offset = (query.page - 1) * query.pageSize;
      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(labels)
          .where(eq(labels.organizationId, organizationId))
          .orderBy(asc(labels.name))
          .limit(query.pageSize)
          .offset(offset),
        db
          .select({ total: count() })
          .from(labels)
          .where(eq(labels.organizationId, organizationId)),
      ]);
      return {
        items,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: Number(total),
        },
      };
    },
  );

  app.post(
    "/organizations/:organizationId/labels",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request, reply) => {
      const organizationId = getOrganizationId(request);
      const input = labelInput.parse(request.body);
      const [existing] = await db
        .select({ id: labels.id })
        .from(labels)
        .where(
          and(
            eq(labels.organizationId, organizationId),
            eq(labels.name, input.name),
          ),
        )
        .limit(1);
      if (existing)
        throw new ApiError(409, "LABEL_CONFLICT", "Label already exists.");
      const [label] = await db
        .insert(labels)
        .values({ ...input, organizationId })
        .returning();
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "label.created",
        entityType: "label",
        entityId: label.id,
      });
      return reply.code(201).send({ label });
    },
  );

  app.patch(
    "/organizations/:organizationId/labels/:labelId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const { organizationId, labelId } = getLabelParams(request);
      const input = labelInput.parse(request.body);
      const [existing] = await db
        .select({ id: labels.id })
        .from(labels)
        .where(
          and(
            eq(labels.organizationId, organizationId),
            eq(labels.name, input.name),
          ),
        )
        .limit(1);
      if (existing && existing.id !== labelId)
        throw new ApiError(409, "LABEL_CONFLICT", "Label already exists.");
      const [label] = await db
        .update(labels)
        .set(input)
        .where(
          and(
            eq(labels.organizationId, organizationId),
            eq(labels.id, labelId),
          ),
        )
        .returning();
      if (!label)
        throw new ApiError(404, "LABEL_NOT_FOUND", "Label not found.");
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "label.updated",
        entityType: "label",
        entityId: label.id,
      });
      return { label };
    },
  );

  app.delete(
    "/organizations/:organizationId/labels/:labelId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const { organizationId, labelId } = getLabelParams(request);
      const [label] = await db
        .delete(labels)
        .where(
          and(
            eq(labels.organizationId, organizationId),
            eq(labels.id, labelId),
          ),
        )
        .returning({ id: labels.id });
      if (!label)
        throw new ApiError(404, "LABEL_NOT_FOUND", "Label not found.");
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "label.deleted",
        entityType: "label",
        entityId: label.id,
      });
      return { deleted: true };
    },
  );

  app.post(
    "/organizations/:organizationId/tasks/:taskId/labels/:labelId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request, reply) => {
      const { organizationId, taskId } = z
        .object({
          organizationId: uuidSchema,
          taskId: uuidSchema,
          labelId: uuidSchema,
        })
        .parse(request.params);
      const labelId = (request.params as { labelId: string }).labelId;
      await ensureTask(organizationId, taskId);
      const [label] = await db
        .select({ id: labels.id })
        .from(labels)
        .where(
          and(
            eq(labels.id, labelId),
            eq(labels.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!label)
        throw new ApiError(404, "LABEL_NOT_FOUND", "Label not found.");
      await db
        .insert(taskLabels)
        .values({ taskId, labelId, organizationId })
        .onConflictDoNothing();
      return reply.code(201).send({ attached: true });
    },
  );

  app.delete(
    "/organizations/:organizationId/tasks/:taskId/labels/:labelId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request) => {
      const { organizationId, taskId, labelId } = z
        .object({
          organizationId: uuidSchema,
          taskId: uuidSchema,
          labelId: uuidSchema,
        })
        .parse(request.params);
      await db
        .delete(taskLabels)
        .where(
          and(
            eq(taskLabels.organizationId, organizationId),
            eq(taskLabels.taskId, taskId),
            eq(taskLabels.labelId, labelId),
          ),
        );
      return { detached: true };
    },
  );

  app.get(
    "/organizations/:organizationId/tasks/:taskId/comments",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const { organizationId, taskId } = getTaskParams(request);
      await ensureTask(organizationId, taskId);
      const query = simpleListQuery.parse(request.query);
      const filters = and(
        eq(comments.organizationId, organizationId),
        eq(comments.taskId, taskId),
      );
      const offset = (query.page - 1) * query.pageSize;
      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(comments)
          .where(filters)
          .orderBy(asc(comments.createdAt))
          .limit(query.pageSize)
          .offset(offset),
        db.select({ total: count() }).from(comments).where(filters),
      ]);
      return {
        items,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total: Number(total),
        },
      };
    },
  );

  app.post(
    "/organizations/:organizationId/tasks/:taskId/comments",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request, reply) => {
      const { organizationId, taskId } = getTaskParams(request);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
      await ensureTask(organizationId, taskId);
      const input = commentInput.parse(request.body);
      const [comment] = await db
        .insert(comments)
        .values({ ...input, organizationId, taskId, authorId: user.id })
        .returning();
      await recordAuditEvent({
        organizationId,
        actorId: user.id,
        action: "comment.created",
        entityType: "comment",
        entityId: comment.id,
      });
      return reply.code(201).send({ comment });
    },
  );

  app.patch(
    "/organizations/:organizationId/tasks/:taskId/comments/:commentId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request) => {
      const { organizationId, taskId, commentId } = getCommentParams(request);
      const [existing] = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, commentId),
            eq(comments.taskId, taskId),
            eq(comments.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!existing)
        throw new ApiError(404, "COMMENT_NOT_FOUND", "Comment not found.");
      const isModerator = ["owner", "admin"].includes(
        request.organizationMembership?.role ?? "",
      );
      if (existing.authorId !== request.user?.id && !isModerator)
        throw new ApiError(
          403,
          "FORBIDDEN",
          "You do not have permission for this action.",
        );
      const [comment] = await db
        .update(comments)
        .set({ ...commentInput.parse(request.body), updatedAt: new Date() })
        .where(eq(comments.id, commentId))
        .returning();
      return { comment };
    },
  );

  app.delete(
    "/organizations/:organizationId/tasks/:taskId/comments/:commentId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin", "member"]),
      ],
    },
    async (request) => {
      const { organizationId, taskId, commentId } = getCommentParams(request);
      const [existing] = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.id, commentId),
            eq(comments.taskId, taskId),
            eq(comments.organizationId, organizationId),
          ),
        )
        .limit(1);
      if (!existing)
        throw new ApiError(404, "COMMENT_NOT_FOUND", "Comment not found.");
      const isModerator = ["owner", "admin"].includes(
        request.organizationMembership?.role ?? "",
      );
      if (existing.authorId !== request.user?.id && !isModerator)
        throw new ApiError(
          403,
          "FORBIDDEN",
          "You do not have permission for this action.",
        );
      await db.delete(comments).where(eq(comments.id, commentId));
      return { deleted: true };
    },
  );
};

export default taskRoutes;
