// A global fetch wrapper to handle API calls for expired jwt errors.

export default async function apiFetch(endpoint, options = {}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.replace(/^\//, "")}`;

  const { redirectOnAuthError = false, ...fetchOptions } = options;

  const defaultHeaders = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, { ...fetchOptions, headers: defaultHeaders });

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    }

    const isAuthError =
      response.status === 401 ||
      data?.message === "jwt expired" ||
      data?.error === "jwt expired";

    if (isAuthError) {
      console.warn("Global Fetch Wrapper: Token expired or unauthorized.");

      // 1. Wipe out the dead token from local storage
      localStorage.removeItem("token"); 

      // 2. Check if the component actually sent an Authorization token
      const tokenWasSent = !!defaultHeaders["Authorization"];

      // Only trigger the alert/redirect if a token was sent and it expired.
      if (redirectOnAuthError && tokenWasSent && typeof window !== "undefined") {
        alert("Your session has expired. Please log in again.");
        window.location.href = "/login";
        return null;
      }

      const authError = new Error("UNAUTHORIZED_OR_EXPIRED");
      authError.status = 401;
      authError.isAuthError = true;
      throw authError;
    }

    if (!response.ok) {
      const errorObj = new Error(data?.message || `HTTP error! status: ${response.status}`);
      errorObj.status = response.status;
      throw errorObj;
    }

    return data;

  } catch (error) {
    throw error;
  }
}