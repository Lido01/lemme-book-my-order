import axios from "axios";

import { normaliseApiError } from "../utils/apiError";
import { tokensForScope } from "../utils/tokenStore";

const configuredApiRoot = (import.meta.env.VITE_API_BASE_URL || "").trim();
const ROOT = configuredApiRoot.replace(/\/+$/, "");

/** Root of the Django server when one is configured. */
export const API_ROOT = ROOT;

const api = axios.create({
  baseURL: ROOT ? `${ROOT}/api/v1` : "/api/v1",
  timeout: 20000,

  // Accept is safe to pin. Content-Type is deliberately NOT set:
  // Axios picks application/json for plain objects and lets the
  // browser attach the multipart boundary for FormData uploads.
  headers: {
    Accept: "application/json",
  },
});

// -----------------------------------------------------------------
// REQUEST: attach credentials only where they are required
// -----------------------------------------------------------------
//
// A request opts in with `requiresAuth: true`. The audience it
// authenticates as is `config.authScope`, which selects which stored
// token is sent: "customer" for the account area, the staff session
// for everything else.

api.interceptors.request.use((config) => {
  if (config.requiresAuth) {
    const token = tokensForScope(
      config.authScope
    ).getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// -----------------------------------------------------------------
// RESPONSE: refresh an expired token once, then normalise
// -----------------------------------------------------------------
/**
 * Refresh whichever audience `authScope` is authenticated as.
 *
 * A single in-flight promise is shared, but only between requests for
 * the same audience: a customer session must never be refreshed with
 * the staff refresh token, so the two scopes keep separate slots.
 */
const refreshInFlightByScope = new Map();

async function refreshAccessToken(authScope) {
  const tokens = tokensForScope(authScope);
  const refresh = tokens.getRefreshToken();

  if (!refresh) {
    return null;
  }

  if (refreshInFlightByScope.has(authScope)) {
    return refreshInFlightByScope.get(authScope);
  }

  const pending = axios
    .post(`${ROOT}/api/v1/accounts/token/refresh/`, { refresh })
    .then((response) => {
      const access = response.data?.access;

      if (access) {
        tokens.setTokens({ access });
      }

      return access || null;
    })
    .catch(() => {
      tokens.clearTokens();
      return null;
    })
    .finally(() => {
      refreshInFlightByScope.delete(authScope);
    });

  refreshInFlightByScope.set(authScope, pending);

  return pending;
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const config = error.config || {};
    const tokens = tokensForScope(config.authScope);

    const canRetry =
      error.response?.status === 401 &&
      config.requiresAuth &&
      !config.__retried &&
      tokens.getRefreshToken();

    if (canRetry) {
      const access = await refreshAccessToken(config.authScope);

      if (access) {
        config.__retried = true;
        return api(config);
      }

      tokens.clearTokens();
    }

    return Promise.reject(normaliseApiError(error));
  }
);

export const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?auto=format&fit=crop&w=800&q=80";

/**
 * Resolve a media path returned by Django (`/media/...`) or standalone
 * store into a clean, working image URL.
 * Already-absolute URLs, data URIs and blob URIs pass through untouched.
 */
export function mediaUrl(path) {
  if (!path || typeof path !== "string") {
    return DEFAULT_FALLBACK_IMAGE;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // Base64 data images or object blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // Absolute http/https URLs
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);

      if (
        ROOT &&
        url.pathname.startsWith("/media/") &&
        ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)
      ) {
        return `${ROOT}${url.pathname}${url.search}${url.hash}`;
      }
    } catch (_) {}

    return trimmed;
  }

  // Legacy mock media paths without backend
  if (trimmed.startsWith("/media/") && !ROOT) {
    return DEFAULT_FALLBACK_IMAGE;
  }

  if (!ROOT) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }

  return `${ROOT}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}

export default api;
