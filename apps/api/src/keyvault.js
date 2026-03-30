const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

let secretCache = null;

async function loadAppSecrets() {
  if (secretCache) return secretCache;

  const vaultUrl = (process.env.AZURE_KEY_VAULT_URL || "").trim().replace(/\/+$/, "");

  if (!vaultUrl) {
    console.log("[keyvault] skipped (.env credentials)");
    secretCache = {
      username: process.env.APP_USERNAME || "",
      password: process.env.APP_PASSWORD || "",
    };
    return secretCache;
  }

  const user = (process.env.KEY_VAULT_USERNAME_SECRET || "username").trim();
  const pass = (process.env.KEY_VAULT_PASSWORD_SECRET || "password").trim();
  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
  const [u, p] = await Promise.all([client.getSecret(user), client.getSecret(pass)]);

  secretCache = { username: u.value ?? "", password: p.value ?? "" };
  console.log("[keyvault] Azure Key Vault OK");
  return secretCache;
}

function getAppSecrets() {
  if (!secretCache) throw new Error("Secrets not loaded");
  return secretCache;
}

module.exports = { loadAppSecrets, getAppSecrets };
