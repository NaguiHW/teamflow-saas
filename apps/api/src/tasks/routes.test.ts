import assert from "node:assert/strict";
import test from "node:test";
import createApp from "../app.js";

test("task routes reject unauthenticated requests", async () => {
  const app = createApp();
  const response = await app.inject({
    method: "GET",
    url: "/organizations/00000000-0000-0000-0000-000000000000/tasks",
  });

  assert.equal(response.statusCode, 401);
  assert.equal(response.json().error.code, "UNAUTHENTICATED");
  await app.close();
});
