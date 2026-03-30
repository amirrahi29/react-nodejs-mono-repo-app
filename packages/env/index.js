"use strict";

/** Display names for APP_ENV (Helm extraEnv) and local dev. */
const DISPLAY_LABELS = {
  production: "Production",
  dev: "Dev",
  staging: "Staging",
  uat: "UAT",
  local: "Local",
};

function displayLabelForEnv(env) {
  if (!env) return "Local";
  return DISPLAY_LABELS[env] || env.charAt(0).toUpperCase() + env.slice(1);
}

/** React shell title from /api/health payload. */
function formatFrontendTitle(health) {
  if (!health || health.error) return "Chat app";
  return `Frontend · ${displayLabelForEnv(health.env)}`;
}

module.exports = {
  DISPLAY_LABELS,
  displayLabelForEnv,
  formatFrontendTitle,
};
