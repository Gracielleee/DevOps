export const parseApiError = (error) => {
  // Default values
  let summary = "Something went wrong.";
  const fieldErrors = {};

  // Network error
  if (!error.data) {
    return { summary: "Network error. Please check your connection.", fieldErrors };
  }

  const { status, data } = error;

  // Handle Validation Errors (400 Bad Request)
  if (status === 400 && Array.isArray(data.errors)) {
    data.errors.forEach((err) => {
      fieldErrors[err.path] = err.msg;
    });
    
    summary = data.errors[0]?.msg || "Please fix the errors below.";
    return { summary, fieldErrors };
  }

  // Handle Duplicate Key (409 Conflict)
  if (status === 409) {
    return { summary: data.message || "This value already exists.", fieldErrors };
  }

  // Handle Auth Errors (401)
  if (status === 401) {
    return { summary: "Session expired. Please log in again.", fieldErrors };
  }

  // Handle Generic Server Errors (500, etc.)
  return { summary: data.message || summary, fieldErrors };
};