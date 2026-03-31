#!/usr/bin/env bash
# Source from repo root after checkout: sets HELM_KV_ARGS for helm template|upgrade.
# Env: VAULT_URL, KV_USER_KEY, KV_PASS_KEY, WI_CLIENT_ID, WI_SERVICE_ACCOUNT
# (No `set -u` here — avoid leaking strict mode into the parent workflow shell.)
#
# Key Vault is only enabled in Helm when ALL of: VAULT_URL, WI_CLIENT_ID, WI_SERVICE_ACCOUNT.
# If only AZURE_KEY_VAULT_URL is set in GitHub, pods would enable KV at runtime, fail auth,
# and exit — deploy never becomes Ready. Partial config → deploy without KV (optional K8s creds still work).

HELM_KV_ARGS=()

kv_complete=false
if [[ -n "${VAULT_URL:-}" && -n "${WI_CLIENT_ID:-}" && -n "${WI_SERVICE_ACCOUNT:-}" ]]; then
  kv_complete=true
fi

if [[ -n "${VAULT_URL:-}" && "$kv_complete" != true ]]; then
  echo "::warning title=Key Vault not applied in this deploy::AZURE_KEY_VAULT_URL is set but Workload Identity is incomplete (need GitHub secrets AZURE_WORKLOAD_CLIENT_ID and AKS_WORKLOAD_SERVICE_ACCOUNT). Using keyVault.enabled=false so the app can start. Add both WI secrets (and Key Vault RBAC for that identity) or remove AZURE_KEY_VAULT_URL to avoid this warning."
fi

if [[ "$kv_complete" == true ]]; then
  HELM_KV_ARGS+=(--set-string "keyVault.enabled=true" --set-string "keyVault.vaultUrl=${VAULT_URL}")
  if [[ -n "${KV_USER_KEY:-}" ]]; then
    HELM_KV_ARGS+=(--set-string "keyVault.usernameSecretName=${KV_USER_KEY}")
  fi
  if [[ -n "${KV_PASS_KEY:-}" ]]; then
    HELM_KV_ARGS+=(--set-string "keyVault.passwordSecretName=${KV_PASS_KEY}")
  fi
  HELM_KV_ARGS+=(--set-string "keyVault.azureClientId=${WI_CLIENT_ID}")
  HELM_KV_ARGS+=(--set-string "serviceAccount.name=${WI_SERVICE_ACCOUNT}")
elif [[ -n "${WI_SERVICE_ACCOUNT:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "serviceAccount.name=${WI_SERVICE_ACCOUNT}")
fi
