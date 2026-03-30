const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
  override: true,
});

const express = require("express");
const { loadAppSecrets, getAppSecrets } = require("./keyvault");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.get("/", (_req, res) => res.send("OK"));

app.get("/secret", (_req, res) => {
  try {
    const data = getAppSecrets();
    res.json(data);
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});

loadAppSecrets()
  .then(() => app.listen(PORT, () => console.log(`http://localhost:${PORT}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
