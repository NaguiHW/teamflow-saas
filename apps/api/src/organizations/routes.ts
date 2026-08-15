import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { Resend } from "resend";
import { db } from "../db/client.js";
import {
  auditEvents,
  invitations,
  memberships,
  organizations,
  userProfiles,
} from "../db/schema.js";
import { recordAuditEvent } from "../audit.js";
import {
  authenticate,
  requireOrganizationMembership,
  requireOrganizationMembershipWithRoles,
} from "../auth/hooks.js";
import { roles } from "../authorization/roles.js";
import { ApiError } from "../errors.js";
import { rateLimit } from "../security/rate-limit.js";

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,60}$/),
});
const invitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});
const roleSchema = z.object({ role: z.enum(roles) });
const acceptInvitationSchema = z.object({ token: z.string().min(32).max(256) });

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : undefined;

const sendInvitationEmail = async (input: {
  email: string;
  organizationName: string;
  token: string;
}) => {
  if (!resend || !process.env.RESEND_FROM_EMAIL) return false;
  const invitationUrl = `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/invitations/accept?token=${encodeURIComponent(input.token)}`;
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: input.email,
    subject: `Invitation to join ${input.organizationName} on TeamFlow`,
    text: `You have been invited to join ${input.organizationName}. Accept your invitation: ${invitationUrl}`,
  });
  return !error;
};

const getOrganizationId = (request: { params: unknown }) => {
  const organizationId = (request.params as { organizationId?: string })
    .organizationId;
  if (!organizationId)
    throw new ApiError(
      400,
      "INVALID_ORGANIZATION",
      "An organization is required.",
    );
  return organizationId;
};

const organizationRoutes = async (app: FastifyInstance) => {
  app.post(
    "/organizations",
    { preHandler: authenticate },
    async (request, reply) => {
      const input = organizationSchema.parse(request.body);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");

      await db
        .insert(userProfiles)
        .values({ id: user.id, email: user.email })
        .onConflictDoUpdate({
          target: userProfiles.id,
          set: { email: user.email },
        });
      const [organization] = await db
        .insert(organizations)
        .values(input)
        .returning();
      await db.insert(memberships).values({
        organizationId: organization.id,
        userId: user.id,
        role: "owner",
      });
      await recordAuditEvent({
        organizationId: organization.id,
        actorId: user.id,
        action: "organization.created",
        entityType: "organization",
        entityId: organization.id,
      });
      return reply.code(201).send({ organization, role: "owner" });
    },
  );

  app.get("/organizations", { preHandler: authenticate }, async (request) => {
    const user = request.user;
    if (!user)
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
    return db
      .select({ organization: organizations, role: memberships.role })
      .from(memberships)
      .innerJoin(
        organizations,
        eq(organizations.id, memberships.organizationId),
      )
      .where(eq(memberships.userId, user.id));
  });

  app.get(
    "/organizations/:organizationId",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const organizationId = getOrganizationId(request);
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);
      if (!organization)
        throw new ApiError(
          404,
          "ORGANIZATION_NOT_FOUND",
          "Organization not found.",
        );
      return { organization, role: request.organizationMembership?.role };
    },
  );

  app.get(
    "/organizations/:organizationId/members",
    { preHandler: [authenticate, requireOrganizationMembership] },
    async (request) => {
      const organizationId = getOrganizationId(request);
      return db
        .select({
          id: memberships.id,
          userId: memberships.userId,
          email: userProfiles.email,
          displayName: userProfiles.displayName,
          role: memberships.role,
          createdAt: memberships.createdAt,
        })
        .from(memberships)
        .innerJoin(userProfiles, eq(userProfiles.id, memberships.userId))
        .where(eq(memberships.organizationId, organizationId));
    },
  );

  app.post(
    "/organizations/:organizationId/invitations",
    {
      preHandler: [
        rateLimit("invitation-create", 20, 60),
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request, reply) => {
      const organizationId = getOrganizationId(request);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
      const input = invitationSchema.parse(request.body);
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);
      if (!organization)
        throw new ApiError(
          404,
          "ORGANIZATION_NOT_FOUND",
          "Organization not found.",
        );
      const token = randomBytes(32).toString("base64url");
      const [invitation] = await db
        .insert(invitations)
        .values({
          organizationId,
          email: input.email.toLowerCase(),
          role: input.role,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdBy: user.id,
        })
        .returning({
          id: invitations.id,
          expiresAt: invitations.expiresAt,
          email: invitations.email,
          role: invitations.role,
        });
      const emailSent = await sendInvitationEmail({
        email: input.email,
        organizationName: organization.name,
        token,
      });
      await recordAuditEvent({
        organizationId,
        actorId: user.id,
        action: "invitation.created",
        entityType: "invitation",
        entityId: invitation.id,
        metadata: { email: input.email, role: input.role, emailSent },
      });
      return reply.code(201).send({ invitation, emailSent });
    },
  );

  app.post(
    "/invitations/accept",
    { preHandler: [rateLimit("invitation-accept", 10, 60), authenticate] },
    async (request) => {
      const input = acceptInvitationSchema.parse(request.body);
      const user = request.user;
      if (!user)
        throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.tokenHash, hashToken(input.token)),
            eq(invitations.status, "pending"),
          ),
        )
        .limit(1);
      if (
        !invitation ||
        invitation.expiresAt <= new Date() ||
        invitation.email.toLowerCase() !== user.email.toLowerCase()
      ) {
        throw new ApiError(
          404,
          "INVITATION_NOT_FOUND",
          "Invitation not found or expired.",
        );
      }
      await db
        .insert(userProfiles)
        .values({ id: user.id, email: user.email })
        .onConflictDoUpdate({
          target: userProfiles.id,
          set: { email: user.email },
        });
      await db
        .insert(memberships)
        .values({
          organizationId: invitation.organizationId,
          userId: user.id,
          role: invitation.role,
        })
        .onConflictDoNothing();
      await db
        .update(invitations)
        .set({ status: "accepted", acceptedAt: new Date() })
        .where(eq(invitations.id, invitation.id));
      await recordAuditEvent({
        organizationId: invitation.organizationId,
        actorId: user.id,
        action: "invitation.accepted",
        entityType: "invitation",
        entityId: invitation.id,
      });
      return {
        organizationId: invitation.organizationId,
        role: invitation.role,
      };
    },
  );

  app.patch(
    "/organizations/:organizationId/members/:userId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const organizationId = getOrganizationId(request);
      const targetUserId = (request.params as { userId: string }).userId;
      const input = roleSchema.parse(request.body);
      if (
        input.role === "owner" &&
        request.organizationMembership?.role !== "owner"
      )
        throw new ApiError(
          403,
          "FORBIDDEN",
          "Only the owner can transfer ownership.",
        );
      const [target] = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, targetUserId),
          ),
        )
        .limit(1);
      if (!target)
        throw new ApiError(404, "MEMBER_NOT_FOUND", "Member not found.");
      if (target.role === "owner" && input.role !== "owner")
        throw new ApiError(
          403,
          "FORBIDDEN",
          "The owner must transfer ownership explicitly.",
        );
      await db
        .update(memberships)
        .set({ role: input.role })
        .where(eq(memberships.id, target.id));
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "membership.role_changed",
        entityType: "membership",
        entityId: target.id,
        metadata: { role: input.role },
      });
      return { userId: targetUserId, role: input.role };
    },
  );

  app.delete(
    "/organizations/:organizationId/members/:userId",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const organizationId = getOrganizationId(request);
      const targetUserId = (request.params as { userId: string }).userId;
      const [target] = await db
        .select()
        .from(memberships)
        .where(
          and(
            eq(memberships.organizationId, organizationId),
            eq(memberships.userId, targetUserId),
          ),
        )
        .limit(1);
      if (!target)
        throw new ApiError(404, "MEMBER_NOT_FOUND", "Member not found.");
      if (target.role === "owner")
        throw new ApiError(403, "FORBIDDEN", "The owner cannot be removed.");
      await db.delete(memberships).where(eq(memberships.id, target.id));
      await recordAuditEvent({
        organizationId,
        actorId: request.user?.id,
        action: "membership.removed",
        entityType: "membership",
        entityId: target.id,
      });
      return { removed: true };
    },
  );

  app.get(
    "/organizations/:organizationId/audit-events",
    {
      preHandler: [
        authenticate,
        requireOrganizationMembershipWithRoles(["owner", "admin"]),
      ],
    },
    async (request) => {
      const organizationId = getOrganizationId(request);
      return db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.organizationId, organizationId))
        .orderBy(desc(auditEvents.createdAt));
    },
  );
};

export default organizationRoutes;
