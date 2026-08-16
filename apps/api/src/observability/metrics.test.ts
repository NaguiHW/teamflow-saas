import assert from "node:assert/strict";
import test from "node:test";
import createApp from "../app.js";

test("responses expose a correlation request ID and metrics endpoint", async () => {
  const app = createApp();
  const healthResponse = await app.inject({
    method: "GET",
    url: "/health",
    headers: { "x-request-id": "phase7-test-request" },
  });
  const metricsResponse = await app.inject({
    method: "GET",
    url: "/health/metrics",
  });

  assert.equal(healthResponse.statusCode, 200);
  assert.equal(healthResponse.headers["x-request-id"], "phase7-test-request");
  assert.equal(metricsResponse.statusCode, 200);
  assert.equal(metricsResponse.json().status, "ok");
  assert.ok(metricsResponse.json().metrics.requestsTotal >= 1);
  await app.close();
});
