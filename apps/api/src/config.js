const path = require("path");

const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
    override: true,
  });
}

const appEnv =
  process.env.APP_ENV || (isProd ? "production" : "local");

const allowedEnvs = new Set(["local", "dev", "staging", "uat", "production"]);
if (!allowedEnvs.has(appEnv)) {
  throw new Error(
    `Invalid APP_ENV "${appEnv}". Allowed values: ${Array.from(allowedEnvs).join(", ")}.`
  );
}

const port = Number(process.env.PORT || 4000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT "${process.env.PORT}". Expected an integer between 1 and 65535.`);
}

module.exports = {
  port,
  isProd,
  appEnv,
  buildVersion: process.env.APP_BUILD_VERSION || "local",
  webBuildDir: path.join(__dirname, "..", "..", "web", "build"),
};
