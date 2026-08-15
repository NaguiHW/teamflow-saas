import type { FastifyInstance } from "fastify";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { recordAuditEvent } from "../audit.js";
import {
  authenticate,
  requireOrganizationMembership,
  requireOrganizationMembershipWithRoles,
} from "../auth/hooks.js";
import { projects } from "../db/schema.js";
import { ApiError } from "../errors.js";

const uuidSchema = z.string().uuid();
const organizationParams = z.object({ organizationId: uuidSchema });
const projectParams = organizationParams.extend({ projectId: uuidSchema });
const projectInput = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,60}$/),
  description: z.string().trim().max(2000).nullable().optional(),
});
const projectUpdate = projectInput.partial().extend({
  status: z.enum(["active", "archived"]).optional(),
});
const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["active", "archived"]).optional(),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const getParams = (request: { params: unknown }) =>
  organizationParams.parse(request.params);
const getProjectParams = (request: { params: unknown }) =>
  projectParams.parse(request.params);

const projectRoutes = async (app: FastifyInstance) => {
  app.get(
    "/organizations/:organizationId/projects",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const { organizationId } = getParams(request);
      const query = listQuery.parse(request.query);
      const filters = [eq(projects.organizationId, organizationId)];
      if (query.status) filters.push(eq(projects.status, query.status));
      if (query.search) {
        filters.push(
          or(
            ilike(projects.name, `%${query.search}%`),
            ilike(projects.description, `%${query.search}%`),
          )!,
        );
      }
      const orderColumn =
        query.sortBy === "name" ? projects.name : projects.createdAt;
      const order =
        query.sortOrder === "asc" ? asc(orderColumn) : desc(orderColumn);
      const offset = (query.page - 1) * query.pageSize;
      const [items, [{ total }]] = await Promise.all([
        db
          .select()
          .from(projects)
          .where(and(...filters))
          .orderBy(order)
          .limit(query.pageSize)
          .offset(offset),
        db
          .select({ total: count() })
          .from(projects)
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
    "/organizations/:organizationId/projects",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request, reply) => {
      const { organizationId } = getParams(request);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
      const input = projectInput.parse(request.body);
      const [existing] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.organizationId, organizationId),
            eq(projects.slug, input.slug),
          ),
        )
        .limit(1);
      if (existing)
        throw new ApiError(
          409,
          "PROJECT_SLUG_CONFLICT",
          "Project slug already exists.",
        );
      const [project] = await db
        .insert(projects)
        .values({ ...input, organizationId, createdBy: user.id })
        .returning();
      await recordAuditEvent({
        organizationId,
        actorId: user.id,
        action: "project.created",
        entityType: "project",
        entityId: project.id,
      });
      return reply.code(201).send({ project });
    },
  );

  app.get(
    "/organizations/:organizationId/projects/:projectId",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const { organizationId, projectId } = getProjectParams(request);
      const [project] = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.organizationId, organizationId),
            eq(projects.id, projectId),
          ),
        )
        .limit(1);
      if (!project)
        throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
      return { project };
    },
  );

  app.patch(
    "/organizations/:organizationId/projects/:projectId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const { organizationId, projectId } = getProjectParams(request);
      const input = projectUpdate.parse(request.body);
      if (Object.keys(input).length === 0)
        throw new ApiError(
          400,
          "EMPTY_UPDATE",
          "At least one field is required.",
        );
      if (input.slug) {
        const [existing] = await db
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(
              eq(projects.organizationId, organizationId),
              eq(projects.slug, input.slug),
            ),
          )
          .limit(1);
        if (existing && existing.id !== projectId)
          throw new ApiError(
            409,
            "PROJECT_SLUG_CONFLICT",
            "Project slug already exists.",
          );
      }
      const [project] = await db
        .update(projects)
        .set({ ...input, updatedAt: new Date() })
        .where(
          and(
            eq(projects.organizationId, organizationId),
            eq(projects.id, projectId),
          ),
        )
        .returning();
      if (!project)
        throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "project.updated",
        entityType: "project",
        entityId: project.id,
      });
      return { project };
    },
  );

  app.delete(
    "/organizations/:organizationId/projects/:projectId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const { organizationId, projectId } = getProjectParams(request);
      const [project] = await db
        .delete(projects)
        .where(
          and(
            eq(projects.organizationId, organizationId),
            eq(projects.id, projectId),
          ),
        )
        .returning({ id: projects.id });
      if (!project)
        throw new ApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "project.deleted",
        entityType: "project",
        entityId: project.id,
      });
      return { deleted: true };
    },
  );
};

export default projectRoutes;
