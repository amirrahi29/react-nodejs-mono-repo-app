const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
  override: true,
});

const express = require("express");
const { loadAppSecrets, getAppSecrets } = require("./keyvault");

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const isProd = process.env.NODE_ENV === "production";
const appEnv =
  process.env.APP_ENV ||
  (isProd ? "production" : "local");
const webBuildDir = path.join(__dirname, "..", "..", "web", "build");

const api = express.Router();

api.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    env: appEnv,
  });
});

api.get("/secret", (_req, res) => {
  try {
    const data = getAppSecrets();
    res.json(data);
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

app.use("/api", api);

if (isProd) {
  app.use(express.static(webBuildDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ error: "Not found" });
    }
    if (req.method !== "GET") {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(path.join(webBuildDir, "index.html"), (err) => (err ? next(err) : undefined));
  });
} else {
  app.get("/", (_req, res) => res.type("text").send("API /api/* — use web dev on :3000"));
}

loadAppSecrets()
  .then(() => {
    app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
