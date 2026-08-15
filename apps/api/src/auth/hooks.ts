import type { FastifyReply, FastifyRequest } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/client.js";
import { memberships } from "../db/schema.js";
import { ApiError } from "../errors.js";
import { getUserFromAccessToken } from "./supabase.js";
import type { Role } from "../authorization/roles.js";

const getAccessToken = (request: FastifyRequest) => {
  const header = request.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return request.cookies.teamflow_access_token;
};

export const authenticate = async (
  request: FastifyRequest,
  _reply: FastifyReply,
) => {
  const token = getAccessToken(request);
  if (!token)
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");

  try {
    const user = await getUserFromAccessToken(token);
    request.user = { id: user.id, email: user.email ?? "" };
  } catch {
    throw new ApiError(
      401,
      "INVALID_SESSION",
      "The session is invalid or expired.",
    );
  }
};

const resolveOrganizationMembership = async (
  request: FastifyRequest,
  _reply: FastifyReply,
  allowedRoles?: Role[],
) => {
  if (!request.user)
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication required.");
  const organizationId = (request.params as { organizationId?: string })
    .organizationId;
  if (!organizationId)
    throw new ApiError(
      400,
      "INVALID_ORGANIZATION",
      "An organization is required.",
    );

  const [membership] = await db
    .select({
      organizationId: memberships.organizationId,
      userId: memberships.userId,
      role: memberships.role,
    })
    .from(memberships)
    .where(
      and(
        eq(memberships.organizationId, organizationId),
        eq(memberships.userId, request.user.id),
      ),
    )
    .limit(1);

  if (!membership)
    throw new ApiError(
      404,
      "ORGANIZATION_NOT_FOUND",
      "Organization not found.",
    );
  if (allowedRoles && !allowedRoles.includes(membership.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission for this action.",
    );
  }
  request.organizationMembership = membership;
};

export const requireOrganizationMembership = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => resolveOrganizationMembership(request, reply);

export const requireOrganizationMembershipWithRoles =
  (allowedRoles: Role[]) =>
  async (request: FastifyRequest, reply: FastifyReply) =>
    resolveOrganizationMembership(request, reply, allowedRoles);
