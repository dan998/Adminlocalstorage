// =====================================================
// APIRESPONSE.GS
// Standard API Response Engine
// Cloud Project Platform
// =====================================================


// =====================================================
// API RESPONSE STATUS CODES
// =====================================================

const API_RESPONSE_CODES = {

  SUCCESS: "SUCCESS",

  CREATED: "CREATED",

  UPDATED: "UPDATED",

  DELETED: "DELETED",

  INVALID_REQUEST: "INVALID_REQUEST",

  VALIDATION_ERROR: "VALIDATION_ERROR",

  UNAUTHORIZED: "UNAUTHORIZED",

  FORBIDDEN: "FORBIDDEN",

  NOT_FOUND: "NOT_FOUND",

  CONFLICT: "CONFLICT",

  RATE_LIMITED: "RATE_LIMITED",

  SERVER_ERROR: "SERVER_ERROR",

  SERVICE_UNAVAILABLE:
    "SERVICE_UNAVAILABLE"

};


// =====================================================
// CREATE BASE RESPONSE
// =====================================================

function createApiResponse(
  success,
  code,
  message,
  data,
  meta
) {

  return {

    success:
      Boolean(success),

    code:
      code || null,

    message:
      message || "",

    data:
      data !== undefined
        ? data
        : null,

    meta:
      meta || {},

    timestamp:
      new Date().toISOString()

  };

}


// =====================================================
// SUCCESS RESPONSE
// =====================================================

function apiSuccess(
  message,
  data,
  meta
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.SUCCESS,

    message ||
      "Request completed successfully",

    data,

    meta

  );

}


// =====================================================
// CREATED RESPONSE
// =====================================================

function apiCreated(
  message,
  data,
  meta
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.CREATED,

    message ||
      "Resource created successfully",

    data,

    meta

  );

}


// =====================================================
// UPDATED RESPONSE
// =====================================================

function apiUpdated(
  message,
  data,
  meta
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.UPDATED,

    message ||
      "Resource updated successfully",

    data,

    meta

  );

}


// =====================================================
// DELETED RESPONSE
// =====================================================

function apiDeleted(
  message,
  data,
  meta
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.DELETED,

    message ||
      "Resource deleted successfully",

    data,

    meta

  );

}


// =====================================================
// ERROR RESPONSE
// =====================================================

function apiError(
  code,
  message,
  data,
  meta
) {

  return createApiResponse(

    false,

    code ||
      API_RESPONSE_CODES.SERVER_ERROR,

    message ||
      "Request failed",

    data,

    meta

  );

}


// =====================================================
// VALIDATION ERROR
// =====================================================

function apiValidationError(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.VALIDATION_ERROR,

    message ||
      "Validation failed",

    data,

    meta

  );

}


// =====================================================
// INVALID REQUEST
// =====================================================

function apiInvalidRequest(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.INVALID_REQUEST,

    message ||
      "Invalid request",

    data,

    meta

  );

}


// =====================================================
// UNAUTHORIZED
// =====================================================

function apiUnauthorized(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.UNAUTHORIZED,

    message ||
      "Authentication required",

    data,

    meta

  );

}


// =====================================================
// FORBIDDEN
// =====================================================

function apiForbidden(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.FORBIDDEN,

    message ||
      "You do not have permission to perform this action",

    data,

    meta

  );

}


// =====================================================
// NOT FOUND
// =====================================================

function apiNotFound(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.NOT_FOUND,

    message ||
      "Resource not found",

    data,

    meta

  );

}


// =====================================================
// CONFLICT
// =====================================================

function apiConflict(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.CONFLICT,

    message ||
      "Resource conflict",

    data,

    meta

  );

}


// =====================================================
// RATE LIMITED
// =====================================================

function apiRateLimited(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.RATE_LIMITED,

    message ||
      "Too many requests",

    data,

    meta

  );

}


// =====================================================
// SERVER ERROR
// =====================================================

function apiServerError(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.SERVER_ERROR,

    message ||
      "Internal server error",

    data,

    meta

  );

}


// =====================================================
// SERVICE UNAVAILABLE
// =====================================================

function apiServiceUnavailable(
  message,
  data,
  meta
) {

  return apiError(

    API_RESPONSE_CODES.SERVICE_UNAVAILABLE,

    message ||
      "Service temporarily unavailable",

    data,

    meta

  );

}


// =====================================================
// PAGINATED RESPONSE
// =====================================================

function apiPaginated(
  message,
  data,
  pagination,
  meta
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.SUCCESS,

    message ||
      "Request completed successfully",

    data,

    Object.assign(

      {},

      meta || {},

      {
        pagination:
          pagination || {}
      }

    )

  );

}


// =====================================================
// EMPTY RESPONSE
// =====================================================

function apiEmpty(
  message
) {

  return createApiResponse(

    true,

    API_RESPONSE_CODES.SUCCESS,

    message ||
      "No data found",

    [],

    {
      empty: true
    }

  );

}


// =====================================================
// RESPONSE FROM BOOLEAN RESULT
// =====================================================

function apiFromBoolean(
  result,
  successMessage,
  failureMessage
) {

  if (result) {

    return apiSuccess(
      successMessage ||
        "Operation completed successfully",
      result
    );

  }

  return apiError(

    API_RESPONSE_CODES.SERVER_ERROR,

    failureMessage ||
      "Operation failed"

  );

}


// =====================================================
// RESPONSE FROM RESULT OBJECT
// =====================================================

function apiFromResult(
  result,
  successMessage
) {

  if (
    result &&
    result.success === false
  ) {

    return result;

  }


  return apiSuccess(

    successMessage ||
      "Operation completed successfully",

    result

  );

}


// =====================================================
// NORMALIZE EXISTING RESPONSE
// =====================================================

function normalizeApiResponse(
  response
) {

  if (
    response &&
    typeof response === "object" &&
    response.success !== undefined &&
    response.code !== undefined
  ) {

    return response;

  }


  return apiSuccess(
    "Request completed successfully",
    response
  );

}


// =====================================================
// PAGINATION BUILDER
// =====================================================

function createApiPagination(
  page,
  limit,
  total
) {

  page =
    Math.max(
      1,
      Number(page || 1)
    );

  limit =
    Math.max(
      1,
      Number(limit || 20)
    );

  total =
    Math.max(
      0,
      Number(total || 0)
    );

  const totalPages =
    Math.ceil(
      total / limit
    );


  return {

    page:
      page,

    limit:
      limit,

    total:
      total,

    totalPages:
      totalPages,

    hasNext:
      page < totalPages,

    hasPrevious:
      page > 1

  };

}


// =====================================================
// RESPONSE DATA SANITIZATION
// =====================================================

function sanitizeApiData(
  data
) {

  if (
    data === null ||
    data === undefined
  ) {

    return null;

  }


  if (
    Array.isArray(data)
  ) {

    return data.map(
      function(item) {

        return sanitizeApiData(
          item
        );

      }
    );

  }


  if (
    typeof data === "object"
  ) {

    const result = {};

    Object.keys(data)
      .forEach(
        function(key) {

          // Never expose sensitive backend fields.
          if (
            isSensitiveApiField(
              key
            )
          ) {

            return;

          }

          result[key] =
            sanitizeApiData(
              data[key]
            );

        }
      );

    return result;

  }


  return data;

}


// =====================================================
// SENSITIVE API FIELDS
// =====================================================

function isSensitiveApiField(
  field
) {

  const sensitiveFields = [

    "password",

    "passwordHash",

    "password_hash",

    "securityAnswer",

    "securityAnswerHash",

    "security_answer",

    "token",

    "sessionToken",

    "session_token",

    "resetToken",

    "reset_token",

    "resetCode",

    "resetCodeHash",

    "apiSecret",

    "api_secret",

    "secret",

    "privateKey",

    "private_key"

  ];


  const target =
    String(field || "")
      .toLowerCase();


  return sensitiveFields.some(
    function(item) {

      return (
        target ===
        String(item)
          .toLowerCase()
      );

    }
  );

}


// =====================================================
// SAFE API RESPONSE
// =====================================================

function safeApiResponse(
  response
) {

  const normalized =
    normalizeApiResponse(
      response
    );


  return {

    success:
      normalized.success,

    code:
      normalized.code,

    message:
      normalized.message,

    data:
      sanitizeApiData(
        normalized.data
      ),

    meta:
      normalized.meta || {},

    timestamp:
      normalized.timestamp ||
      new Date().toISOString()

  };

}


// =====================================================
// API RESPONSE TO JSON
// =====================================================

function apiResponseJson(
  response
) {

  return JSON.stringify(
    safeApiResponse(
      response
    )
  );

}


// =====================================================
// GOOGLE APPS SCRIPT JSON OUTPUT
// =====================================================

function apiJsonOutput(
  response
) {

  return ContentService
    .createTextOutput(
      apiResponseJson(
        response
      )
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}