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

module.exports = {
  port: Number(process.env.PORT) || 4000,
  isProd,
  appEnv,
  buildVersion: process.env.APP_BUILD_VERSION || "local",
  webBuildDir: path.join(__dirname, "..", "..", "web", "build"),
};
