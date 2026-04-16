function normalizeUrl(url: string | undefined) {
  const trimmed = (url ?? "").trim();
  if (!trimmed) {
    return "";
  }

  try {
    return new URL(trimmed).toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function getModeDefaultBaseUrl(mode: string) {
  if (mode === "production") {
    return "https://api.quizpulse.app/api/v1";
  }

  if (mode === "staging") {
    return "https://staging-api.quizpulse.app/api/v1";
  }

  return "http://localhost:3333/api/v1";
}

export function getApiBaseUrl() {
  const mode = import.meta.env.MODE;
  const preferred = import.meta.env.VITE_API_BASE_URL;
  const modeScoped =
    mode === "production"
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : mode === "staging"
        ? import.meta.env.VITE_API_BASE_URL_STAGING
        : import.meta.env.VITE_API_BASE_URL_DEV;

  const validated = normalizeUrl(preferred) || normalizeUrl(modeScoped);
  if (validated) {
    return validated;
  }

  return getModeDefaultBaseUrl(mode);
}
