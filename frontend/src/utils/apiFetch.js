// Global fetch wrapper for API calls with expired/invalid JWT handling.

const SESSION_EXPIRED_KEY = "sessionExpired";

let sessionExpiredHandler = null;
let isHandlingAuthError = false;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

export function wasSessionExpired() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_EXPIRED_KEY) === "true";
}

export function clearSessionExpiredFlag() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_EXPIRED_KEY);
}

function getAuthHeader(headers = {}) {
  return headers.Authorization || headers.authorization || null;
}

function isAuthErrorResponse(status, data) {
  if (status === 401) return true;

  const message = String(data?.message || data?.error || "").toLowerCase();
  return (
    message.includes("jwt expired") ||
    message.includes("invalid or expired token") ||
    message.includes("token expired")
  );
}

function handleSessionExpired() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");

  if (typeof sessionExpiredHandler === "function") {
    sessionExpiredHandler();
  }

  if (isHandlingAuthError) return;
  isHandlingAuthError = true;

  sessionStorage.setItem(SESSION_EXPIRED_KEY, "true");
  window.location.href = "/login";
}

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function buildApiUrl(base, endpoint) {
  const rawBase = base || DEFAULT_API_BASE_URL;
  if (!rawBase) {
    throw new Error(
      "apiFetch: NEXT_PUBLIC_API_URL is missing/empty. Set it to your backend base URL (e.g. https://<backend-domain>/api/)."
    );
  }

  const baseClean = String(rawBase).replace(/\/+$/, "");
  const pathClean = String(endpoint).replace(/^\/+/, "");
  return `${baseClean}/${pathClean}`;
}

export default async function apiFetch(endpoint, options = {}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
  const url = endpoint.startsWith("http") ? endpoint : buildApiUrl(API_BASE_URL, endpoint);

  const { redirectOnAuthError = true, allowAnonymous = false, softFail = false, ...fetchOptions } = options;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const authHeader = getAuthHeader(defaultHeaders);
  const tokenWasSent = !!authHeader;

  try {
    const response = await fetch(url, { ...fetchOptions, headers: defaultHeaders });

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    if (isAuthErrorResponse(response.status, data)) {
      console.warn("Global Fetch Wrapper: Token expired or unauthorized.");

      if (tokenWasSent && redirectOnAuthError) {
        handleSessionExpired();
        return null;
      }

      if (allowAnonymous && !tokenWasSent) {
      return data; 
      }

      const authError = new Error(
        data?.message || "UNAUTHORIZED_OR_EXPIRED",
      );
      authError.status = 401;
      authError.isAuthError = true;
      authError.data = data;
      throw authError;
    }

    if (!response.ok) {
      if (softFail) {
        console.warn(`apiFetch softFail: ${response.status} ${url}`);
        return null;
      }
      const errorObj = new Error(
        data?.message || `HTTP error! status: ${response.status}`,
      );
      errorObj.status = response.status;
      errorObj.data = data;
      throw errorObj;
    }

    return data;
  } catch (error) {
    if (error.isAuthError && tokenWasSent && redirectOnAuthError) {
      handleSessionExpired();
      return null;
    }
    throw error;
  }
}
