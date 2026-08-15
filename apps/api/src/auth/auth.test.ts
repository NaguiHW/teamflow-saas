import assert from "node:assert/strict";
import test from "node:test";
import createApp from "../app.js";

test("protected organization routes reject unauthenticated requests", async () => {
  const app = createApp();
  const response = await app.inject({ method: "GET", url: "/organizations" });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json().error.code, "UNAUTHENTICATED");
  await app.close();
});
