#!/usr/bin/env bash
# Build extra `helm` args from GitHub Actions env. Source and expand HELM_KV_ARGS.
# Required env for Key Vault: VAULT_URL (maps to keyVault.vaultUrl).
set -euo pipefail

HELM_KV_ARGS=()

if [[ -n "${VAULT_URL:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "keyVault.enabled=true" --set-string "keyVault.vaultUrl=${VAULT_URL}")
fi
if [[ -n "${KV_USER_KEY:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "keyVault.usernameSecretName=${KV_USER_KEY}")
fi
if [[ -n "${KV_PASS_KEY:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "keyVault.passwordSecretName=${KV_PASS_KEY}")
fi
if [[ -n "${WI_CLIENT_ID:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "keyVault.azureClientId=${WI_CLIENT_ID}")
fi
if [[ -n "${WI_SERVICE_ACCOUNT:-}" ]]; then
  HELM_KV_ARGS+=(--set-string "serviceAccount.name=${WI_SERVICE_ACCOUNT}")
fi
