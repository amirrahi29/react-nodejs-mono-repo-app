const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("./app");

const config = {
  isProd: false,
  appEnv: "test",
  buildVersion: "test-build",
  webBuildDir: "",
};

test("GET /api/health returns app metadata", async () => {
  const app = createApp(config);
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    env: "test",
    version: "test-build",
  });
});

test("GET /api/ready returns readiness state", async () => {
  const app = createApp(config);
  const response = await request(app).get("/api/ready");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ready: true });
});
