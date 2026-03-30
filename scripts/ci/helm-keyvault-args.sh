#!/usr/bin/env bash
# Source from repo root after checkout: sets HELM_KV_ARGS for helm template|upgrade.
# Env: VAULT_URL, KV_USER_KEY, KV_PASS_KEY, WI_CLIENT_ID, WI_SERVICE_ACCOUNT
# (No `set -u` here — avoid leaking strict mode into the parent workflow shell.)

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
