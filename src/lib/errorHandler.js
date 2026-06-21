/**
 * Centralized Error Handler — Phase 9.2
 * Handles: MongoDB, Groq/Gemini AI, Network, JWT, and File Upload errors
 */

// ─── Error Type Detection ─────────────────────────────────────────────────────

export function isMongoError(error) {
  return (
    error?.name === "MongoError" ||
    error?.name === "MongoServerError" ||
    error?.name === "MongoNetworkError" ||
    error?.name === "ValidationError" || // Mongoose
    error?.name === "CastError" || // Mongoose
    error?.code === 11000 // duplicate key
  );
}

export function isGroqError(error) {
  return (
    error?.constructor?.name === "APIError" ||
    error?.message?.toLowerCase().includes("groq") ||
    error?.message?.toLowerCase().includes("gemini") ||
    error?.message?.toLowerCase().includes("quota") ||
    error?.message?.toLowerCase().includes("rate limit") ||
    error?.status === 429 ||
    error?.status === 503
  );
}

export function isJwtError(error) {
  return (
    error?.name === "JsonWebTokenError" ||
    error?.name === "TokenExpiredError" ||
    error?.name === "NotBeforeError"
  );
}

export function isNetworkError(error) {
  return (
    error?.code === "ECONNREFUSED" ||
    error?.code === "ENOTFOUND" ||
    error?.code === "ETIMEDOUT" ||
    error?.message?.toLowerCase().includes("network") ||
    error?.message?.toLowerCase().includes("fetch failed") ||
    error?.message?.toLowerCase().includes("econnrefused")
  );
}

export function isFileError(error) {
  return (
    error?.code === "ENOENT" ||
    error?.code === "EACCES" ||
    error?.code === "EMFILE" ||
    error?.message?.toLowerCase().includes("file") ||
    error?.message?.toLowerCase().includes("upload") ||
    error?.message?.toLowerCase().includes("buffer")
  );
}

// ─── Error Messages ───────────────────────────────────────────────────────────

function getMongoErrorMessage(error) {
  if (error?.code === 11000) {
    const field = Object.keys(error?.keyValue || {})[0] || "field";
    return `A record with this ${field} already exists.`;
  }
  if (error?.name === "ValidationError") {
    const messages = Object.values(error?.errors || {})
      .map((e) => e.message)
      .join(", ");
    return messages || "Validation failed. Please check your input.";
  }
  if (error?.name === "CastError") {
    return `Invalid value for field "${error.path}".`;
  }
  if (error?.name === "MongoNetworkError") {
    return "Database connection failed. Please try again.";
  }
  return "A database error occurred. Please try again.";
}

function getGroqErrorMessage(error) {
  const provider =
    process.env.LLM_PROVIDER === "gemini" ? "Gemini" : "Groq";

  if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
    return `${provider} rate limit reached. Please try again in a few minutes.`;
  }
  if (error?.status === 404 || error?.message?.includes("not found")) {
    return `${provider} model not found. Check your model configuration.`;
  }
  if (error?.status === 401 || error?.message?.includes("unauthorized")) {
    return `${provider} API key is invalid. Please check your configuration.`;
  }
  if (error?.status === 503) {
    return `${provider} service is temporarily unavailable. Please try again.`;
  }
  return `AI processing failed. Please try again or contact support.`;
}

function getJwtErrorMessage(error) {
  if (error?.name === "TokenExpiredError") {
    return "Your session has expired. Please log in again.";
  }
  if (error?.name === "JsonWebTokenError") {
    return "Invalid authentication token. Please log in again.";
  }
  return "Authentication failed. Please log in again.";
}

function getNetworkErrorMessage() {
  return "Network error. Please check your connection and try again.";
}

function getFileErrorMessage(error) {
  if (error?.code === "ENOENT") {
    return "File not found. Please upload again.";
  }
  if (error?.code === "EACCES") {
    return "Permission denied while accessing the file.";
  }
  return "File upload failed. Please try again with a valid PDF or DOCX file.";
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

/**
 * Classifies an error and returns a structured { message, status, type } object.
 * @param {Error} error
 * @param {string} [context] - Optional context string for logging
 * @returns {{ message: string, status: number, type: string }}
 */
export function classifyError(error, context = "") {
  if (context) {
    console.error(`[ErrorHandler] ${context}:`, error?.message || error);
  }

  if (isJwtError(error)) {
    return { message: getJwtErrorMessage(error), status: 401, type: "JWT_ERROR" };
  }
  if (isMongoError(error)) {
    return { message: getMongoErrorMessage(error), status: 500, type: "MONGO_ERROR" };
  }
  if (isGroqError(error)) {
    return { message: getGroqErrorMessage(error), status: 502, type: "AI_ERROR" };
  }
  if (isNetworkError(error)) {
    return { message: getNetworkErrorMessage(), status: 503, type: "NETWORK_ERROR" };
  }
  if (isFileError(error)) {
    return { message: getFileErrorMessage(error), status: 422, type: "FILE_ERROR" };
  }

  return {
    message: error?.message || "An unexpected error occurred. Please try again.",
    status: 500,
    type: "UNKNOWN_ERROR",
  };
}

/**
 * Returns a Next.js Response with a JSON error body.
 * @param {Error} error
 * @param {string} [context]
 * @returns {Response}
 */
export function errorResponse(error, context = "") {
  const { message, status, type } = classifyError(error, context);
  return new Response(
    JSON.stringify({ success: false, message, errorType: type }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Wraps an async API route handler with centralized error handling.
 * @param {Function} handler - async (request, ...args) => Response
 * @param {string} [context]
 * @returns {Function}
 */
export function withErrorHandler(handler, context = "") {
  return async function (request, ...args) {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return errorResponse(error, context);
    }
  };
}

// ─── Client-side Error Formatter ─────────────────────────────────────────────

/**
 * Formats an axios/fetch error for display in the UI.
 * @param {any} error - axios error or fetch response data
 * @returns {string}
 */
export function formatClientError(error) {
  // Axios error
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  // Fetch response data
  if (error?.message) {
    return error.message;
  }
  // String
  if (typeof error === "string") {
    return error;
  }
  return "Something went wrong. Please try again.";
}
