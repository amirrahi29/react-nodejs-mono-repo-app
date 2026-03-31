const path = require("path");
const express = require("express");
const helmet = require("helmet");
const config = require("./config");

const app = express();
const notFound = { error: "Not found" };

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
  });
});

api.get("/ready", (_req, res) => {
  res.json({ ready: true });
});

app.use("/api", api);

if (config.isProd) {
  app.use(express.static(config.webBuildDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json(notFound);
    }
    if (req.method !== "GET") {
      return res.status(404).json(notFound);
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
