const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

let secretCache = null;

function vaultHostFromUrl(vaultUrl) {
  try {
    return new URL(vaultUrl).hostname;
  } catch {
    return "invalid-url";
  }
}

async function loadAppSecrets() {
  if (secretCache) return secretCache;

  const vaultUrl = (process.env.AZURE_KEY_VAULT_URL || "").trim().replace(/\/+$/, "");

  if (!vaultUrl) {
    const username = process.env.APP_USERNAME || "";
    const password = process.env.APP_PASSWORD || "";
    if (!username && !password) {
      console.log(
        JSON.stringify({
          msg: "keyvault_skipped",
          reason: "no_vault_url_and_no_app_creds",
          hint:
            "Set AZURE_KEY_VAULT_URL on the pod (Helm keyVault) or APP_USERNAME/APP_PASSWORD via .env or credentialsSecret",
        })
      );
    } else {
      console.log(JSON.stringify({ msg: "app_creds_from_env" }));
    }
    secretCache = { username, password };
    return secretCache;
  }

  const userKey = (process.env.KEY_VAULT_USERNAME_SECRET || "username").trim();
  const passKey = (process.env.KEY_VAULT_PASSWORD_SECRET || "password").trim();
  const host = vaultHostFromUrl(vaultUrl);

  console.log(
    JSON.stringify({
      msg: "keyvault_fetch_start",
      vaultHost: host,
      usernameSecret: userKey,
      passwordSecret: passKey,
    })
  );

  const client = new SecretClient(vaultUrl, new DefaultAzureCredential());
  let u;
  let p;
  try {
    [u, p] = await Promise.all([client.getSecret(userKey), client.getSecret(passKey)]);
  } catch (err) {
    const code = err.code || err.name;
    console.error(
      JSON.stringify({
        msg: "keyvault_fetch_failed",
        error: err.message,
        code,
      })
    );
    throw new Error(
      `Key Vault failed (${code}): ${err.message}. Check URL, secret names (${userKey}, ${passKey}), and identity (AZURE_CLIENT_ID + Workload Identity, or node/pod MI) plus Key Vault Secrets User RBAC.`
    );
  }

  const username = u.value != null ? String(u.value) : "";
  const password = p.value != null ? String(p.value) : "";

  if (username === "" || password === "") {
    const which =
      username === "" && password === ""
        ? `both "${userKey}" and "${passKey}"`
        : username === ""
          ? `"${userKey}"`
          : `"${passKey}"`;
    throw new Error(
      `Key Vault returned empty value for ${which}. Confirm secret names match Key Vault, latest version is enabled, and values are not blank.`
    );
  }

  secretCache = { username, password };
  console.log(JSON.stringify({ msg: "keyvault_ok", vaultHost: host }));
  return secretCache;
}

function getAppSecrets() {
  if (!secretCache) throw new Error("Secrets not loaded");
  return secretCache;
}

module.exports = { loadAppSecrets, getAppSecrets };
