import assert from "node:assert/strict";
import test from "node:test";
import { canManageMembers, canReadAuditEvents } from "./roles.js";

test("only owners and admins can manage members or read audit events", () => {
  assert.equal(canManageMembers("owner"), true);
  assert.equal(canManageMembers("admin"), true);
  assert.equal(canManageMembers("member"), false);
  assert.equal(canManageMembers("viewer"), false);
  assert.equal(canReadAuditEvents("owner"), true);
  assert.equal(canReadAuditEvents("admin"), true);
  assert.equal(canReadAuditEvents("member"), false);
  assert.equal(canReadAuditEvents("viewer"), false);
});
