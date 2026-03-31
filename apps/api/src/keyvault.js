const crypto = require("crypto");
const {
  DefaultAzureCredential,
  ManagedIdentityCredential,
  WorkloadIdentityCredential,
} = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

let secretCache = null;

function vaultHostFromUrl(vaultUrl) {
  try {
    return new URL(vaultUrl).hostname;
  } catch {
    return "invalid-url";
  }
}

function createAzureCredential() {
  // AKS Entra Workload Identity injects AZURE_FEDERATED_TOKEN_FILE (+ tenant/client id).
  // ManagedIdentityCredential(IMDS) is wrong for that path; use WorkloadIdentityCredential first.
  const federatedFile = (process.env.AZURE_FEDERATED_TOKEN_FILE || "").trim();
  if (federatedFile) {
    try {
      return new WorkloadIdentityCredential();
    } catch {
      /* incomplete WI env — fall through */
    }
  }
  const clientId = (process.env.AZURE_CLIENT_ID || "").trim();
  if (clientId) {
    return new ManagedIdentityCredential({ clientId });
  }
  return new DefaultAzureCredential();
}

function readPlaintextCreds() {
  const username = (
    process.env.APP_USERNAME ||
    process.env.username ||
    ""
  ).trim();
  const password = (
    process.env.APP_PASSWORD ||
    process.env.password ||
    ""
  ).trim();
  return { username, password };
}

function fingerprint(value) {
  if (!value) return null;
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function resolveVaultUrl() {
  return (
    process.env.AZURE_KEY_VAULT_URL ||
    process.env.AZURE_KEYVAULT_URI ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
}

async function loadAppSecrets() {
  if (secretCache) return secretCache;

  const vaultUrl = resolveVaultUrl();

  if (!vaultUrl) {
    const { username, password } = readPlaintextCreds();
    if (!username && !password) {
      console.log(
        JSON.stringify({
          msg: "keyvault_skipped",
          reason: "no_vault_url_and_no_app_creds",
          hint:
            "Set AZURE_KEY_VAULT_URL (Helm/GitHub secret) or APP_USERNAME/APP_PASSWORD (.env or credentialsSecret)",
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
      identity: (process.env.AZURE_FEDERATED_TOKEN_FILE || "").trim()
        ? "workload_identity"
        : (process.env.AZURE_CLIENT_ID || "").trim()
          ? "managed_identity_client_id"
          : "default_credential_chain",
    })
  );

  const client = new SecretClient(vaultUrl, createAzureCredential());
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
      `Key Vault failed (${code}): ${err.message}. Check URL, secret names (${userKey}, ${passKey}), AKS Workload Identity (AZURE_FEDERATED_TOKEN_FILE, AZURE_TENANT_ID, AZURE_CLIENT_ID), service account + federated credential, and Key Vault Secrets User RBAC.`
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
      `Key Vault returned empty value for ${which}. Check enabled secret versions in the vault.`
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

function secretDebugInfo() {
  const vaultUrl = resolveVaultUrl();
  const userKey = (process.env.KEY_VAULT_USERNAME_SECRET || "username").trim();
  const passKey = (process.env.KEY_VAULT_PASSWORD_SECRET || "password").trim();
  const cached = secretCache || readPlaintextCreds();

  return {
    ready: Boolean(secretCache),
    source: credentialsMode(),
    vaultHost: vaultUrl ? vaultHostFromUrl(vaultUrl) : null,
    secretNames: vaultUrl
      ? {
          username: userKey,
          password: passKey,
        }
      : null,
    identity: {
      azureClientIdPresent: Boolean((process.env.AZURE_CLIENT_ID || "").trim()),
      azureTenantIdPresent: Boolean((process.env.AZURE_TENANT_ID || "").trim()),
      federatedTokenFilePresent: Boolean(
        (process.env.AZURE_FEDERATED_TOKEN_FILE || "").trim()
      ),
    },
    username: {
      present: cached.username !== "",
      length: cached.username.length,
      fingerprint: fingerprint(cached.username),
    },
    password: {
      present: cached.password !== "",
      length: cached.password.length,
      fingerprint: fingerprint(cached.password),
    },
  };
}

/** For /api/health — no secret values. */
function credentialsMode() {
  if (resolveVaultUrl()) return "keyvault";
  const { username, password } = readPlaintextCreds();
  if (username || password) return "environment";
  return "none";
}

module.exports = {
  loadAppSecrets,
  getAppSecrets,
  secretDebugInfo,
  credentialsMode,
};
