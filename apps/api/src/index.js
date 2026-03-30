require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
  override: true,
});
const express = require("express");
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

let secretCache = null;

async function loadAppSecrets() {
  if (secretCache) return secretCache;
  const vaultUrl = (process.env.AZURE_KEY_VAULT_URL || "").trim().replace(/\/+$/, "");
  if (!vaultUrl) throw new Error("AZURE_KEY_VAULT_URL is not set");
  const user = (process.env.KEY_VAULT_USERNAME_SECRET || "username").trim();
  const pass = (process.env.KEY_VAULT_PASSWORD_SECRET || "password").trim();
  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
  const [u, p] = await Promise.all([client.getSecret(user), client.getSecret(pass)]);
  secretCache = { username: u.value, password: p.value };
  return secretCache;
}

function getAppSecrets() {
  if (!secretCache) throw new Error("Secrets not loaded");
  return secretCache;
}

const app = express();
const PORT = +process.env.PORT || 4000;

app.get("/", (_, r) => r.send("OK"));

app.get("/secret", (_, r) => {
  try { 
    const data = getAppSecrets();
    console.log("username: ", data.username);
    console.log("password: ", data.password);
    r.json(getAppSecrets());
  } catch (e) {
    r.status(503).json({ error: e.message });
  }
});

loadAppSecrets()
  .then(() => app.listen(PORT, () => console.log("http://localhost:" + PORT)))
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });