const path = require("path");
const express = require("express");
const helmet = require("helmet");

function createApp(config) {
  const app = express();
  const notFound = { error: "Not found" };
  const api = express.Router();

  app.disable("x-powered-by");
  if (config.isProd) {
    app.use(helmet({ contentSecurityPolicy: false }));
  }

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

  app.use((err, _req, res, _next) => {
    console.error(JSON.stringify({ msg: "request_error", error: err.message }));
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = { createApp };
