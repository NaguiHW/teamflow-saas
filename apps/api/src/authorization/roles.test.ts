import assert from "node:assert/strict";
import test from "node:test";
import {
  canManageLabels,
  canManageMembers,
  canManageProjects,
  canManageTasks,
  canReadAuditEvents,
} from "./roles.js";

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

test("project, task, and label policies preserve read-only viewer access", () => {
  assert.equal(canManageProjects("owner"), true);
  assert.equal(canManageProjects("admin"), true);
  assert.equal(canManageProjects("member"), false);
  assert.equal(canManageProjects("viewer"), false);
  assert.equal(canManageTasks("member"), true);
  assert.equal(canManageTasks("viewer"), false);
  assert.equal(canManageLabels("admin"), true);
  assert.equal(canManageLabels("member"), false);
});
