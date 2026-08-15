export const roles = ["owner", "admin", "member", "viewer"] as const;
export type Role = (typeof roles)[number];

export const canManageMembers = (role: Role) =>
  role === "owner" || role === "admin";

export const canReadAuditEvents = (role: Role) =>
  role === "owner" || role === "admin";
