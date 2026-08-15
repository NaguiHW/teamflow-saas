import type { Role } from "../authorization/roles.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user: AuthenticatedUser | undefined;
    organizationMembership:
      { organizationId: string; userId: string; role: Role } | undefined;
  }
}
