const path = require("path");
const express = require("express");
const helmet = require("helmet");
const { loadAppSecrets, getAppSecrets, credentialsMode } = require("./keyvault");
const config = require("./config");

const app = express();
let secretsReady = false;

app.disable("x-powered-by");
if (config.isProd) {
  app.use(helmet({ contentSecurityPolicy: false }));
}

const api = express.Router();

api.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: config.appEnv,
    version: config.buildVersion,
    credentials: credentialsMode(),
  });
});

api.get("/ready", (_req, res) => {
  if (!secretsReady) {
    return res.status(503).json({ ready: false });
  }
  res.json({ ready: true });
});

api.get("/secret", (_req, res) => {
  if (!secretsReady) {
    return res.status(503).json({ error: "Secrets not ready" });
  }
  try {
    res.json(getAppSecrets());
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

app.use("/api", api);

if (config.isProd) {
  app.use(express.static(config.webBuildDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    if (req.method !== "GET") {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(
      path.join(config.webBuildDir, "index.html"),
      (err) => (err ? next(err) : undefined)
    );
  });
} else {
  app.get("/", (_req, res) =>
    res.type("text").send("API /api/* — run web app dev server on :3000")
  );
}

const server = app.listen(config.port, () => {
  console.log(JSON.stringify({
    msg: "listening",
    port: config.port,
    env: config.appEnv,
    version: config.buildVersion,
  }));
});

function shutdown(signal) {
  console.log(JSON.stringify({ msg: "shutdown", signal }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

loadAppSecrets()
  .then(() => {
    secretsReady = true;
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
