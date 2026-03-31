const config = require("./config");
const { createApp } = require("./app");

const app = createApp(config);

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

module.exports = { app, server };
