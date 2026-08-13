// =====================================================
// ERRORHANDLER.GS
// Central Backend Error Handling
// Cloud Project Platform
// =====================================================


// =====================================================
// ERROR CODES
// =====================================================

const ERROR_CODES = {

  UNKNOWN_ERROR:
    "UNKNOWN_ERROR",

  VALIDATION_ERROR:
    "VALIDATION_ERROR",

  INVALID_REQUEST:
    "INVALID_REQUEST",

  AUTHENTICATION_ERROR:
    "AUTHENTICATION_ERROR",

  AUTHORIZATION_ERROR:
    "AUTHORIZATION_ERROR",

  NOT_FOUND:
    "NOT_FOUND",

  CONFLICT:
    "CONFLICT",

  RATE_LIMITED:
    "RATE_LIMITED",

  STORAGE_ERROR:
    "STORAGE_ERROR",

  DATABASE_ERROR:
    "DATABASE_ERROR",

  EMAIL_ERROR:
    "EMAIL_ERROR",

  SESSION_ERROR:
    "SESSION_ERROR",

  SECURITY_ERROR:
    "SECURITY_ERROR",

  CONFIGURATION_ERROR:
    "CONFIGURATION_ERROR",

  SERVICE_UNAVAILABLE:
    "SERVICE_UNAVAILABLE",

  INTERNAL_ERROR:
    "INTERNAL_ERROR"

};


// =====================================================
// CREATE APPLICATION ERROR
// =====================================================

function createAppError(
  code,
  message,
  details,
  originalError
) {

  const error =
    new Error(
      message ||
      "Application error"
    );


  error.code =
    code ||
    ERROR_CODES.INTERNAL_ERROR;


  error.details =
    details || null;


  error.originalError =
    originalError || null;


  error.timestamp =
    new Date();


  return error;

}


// =====================================================
// HANDLE ERROR
// =====================================================

function handleError(
  error,
  context
) {

  context =
    context || "UNKNOWN";


  const normalized =
    normalizeError(
      error
    );


  logApplicationError(
    normalized,
    context
  );


  return buildErrorResponse(
    normalized
  );

}


// =====================================================
// NORMALIZE ERROR
// =====================================================

function normalizeError(
  error
) {

  if (!error) {

    return {

      code:
        ERROR_CODES.UNKNOWN_ERROR,

      message:
        "Unknown error",

      details:
        null,

      stack:
        null

    };

  }


  if (
    typeof error ===
    "string"
  ) {

    return {

      code:
        ERROR_CODES.INTERNAL_ERROR,

      message:
        error,

      details:
        null,

      stack:
        null

    };

  }


  return {

    code:
      error.code ||
      ERROR_CODES.INTERNAL_ERROR,

    message:
      error.message ||
      "Internal server error",

    details:
      error.details ||
      null,

    stack:
      error.stack ||
      null

  };

}


// =====================================================
// BUILD ERROR RESPONSE
// =====================================================

function buildErrorResponse(
  error
) {

  if (
    typeof apiError ===
    "function"
  ) {

    return apiError(

      error.code,

      getSafeErrorMessage(
        error
      ),

      getSafeErrorDetails(
        error
      )

    );

  }


  return {

    success:
      false,

    code:
      error.code,

    message:
      getSafeErrorMessage(
        error
      ),

    data:
      null,

    meta: {},

    timestamp:
      new Date().toISOString()

  };

}


// =====================================================
// SAFE ERROR MESSAGE
// =====================================================

function getSafeErrorMessage(
  error
) {

  const safeCodes = [

    ERROR_CODES.VALIDATION_ERROR,

    ERROR_CODES.INVALID_REQUEST,

    ERROR_CODES.AUTHENTICATION_ERROR,

    ERROR_CODES.AUTHORIZATION_ERROR,

    ERROR_CODES.NOT_FOUND,

    ERROR_CODES.CONFLICT,

    ERROR_CODES.RATE_LIMITED,

    ERROR_CODES.STORAGE_ERROR,

    ERROR_CODES.DATABASE_ERROR,

    ERROR_CODES.EMAIL_ERROR,

    ERROR_CODES.SESSION_ERROR,

    ERROR_CODES.SECURITY_ERROR,

    ERROR_CODES.CONFIGURATION_ERROR,

    ERROR_CODES.SERVICE_UNAVAILABLE

  ];


  if (
    safeCodes.indexOf(
      error.code
    ) !== -1
  ) {

    return (
      error.message ||
      "Request could not be completed"
    );

  }


  return "Internal server error";

}


// =====================================================
// SAFE ERROR DETAILS
// =====================================================

function getSafeErrorDetails(
  error
) {

  if (!error) {
    return null;
  }


  // Never expose stack traces,
  // passwords, tokens or secrets.

  if (
    error.details &&
    typeof error.details ===
    "object"
  ) {

    if (
      typeof sanitizeApiData ===
      "function"
    ) {

      return sanitizeApiData(
        error.details
      );

    }

    return error.details;

  }


  return null;

}


// =====================================================
// APPLICATION ERROR LOGGING
// =====================================================

function logApplicationError(
  error,
  context
) {

  try {

    console.error(

      "[APPLICATION ERROR]",

      JSON.stringify({

        context:
          context,

        code:
          error.code,

        message:
          error.message,

        timestamp:
          new Date().toISOString()

      })

    );


    // If centralized logging exists,
    // send the error there.

    if (
      typeof createLog ===
      "function"
    ) {

      createLog({

        type:
          "ERROR",

        category:
          "APPLICATION",

        context:
          context,

        code:
          error.code,

        message:
          error.message

      });

    }

  } catch (loggingError) {

    console.error(
      "Error logging failed:",
      loggingError
    );

  }

}


// =====================================================
// VALIDATION ERROR
// =====================================================

function throwValidationError(
  message,
  details
) {

  throw createAppError(

    ERROR_CODES.VALIDATION_ERROR,

    message ||
      "Validation failed",

    details

  );

}


// =====================================================
// AUTHENTICATION ERROR
// =====================================================

function throwAuthenticationError(
  message
) {

  throw createAppError(

    ERROR_CODES.AUTHENTICATION_ERROR,

    message ||
      "Authentication required"

  );

}


// =====================================================
// AUTHORIZATION ERROR
// =====================================================

function throwAuthorizationError(
  message
) {

  throw createAppError(

    ERROR_CODES.AUTHORIZATION_ERROR,

    message ||
      "Access denied"

  );

}


// =====================================================
// NOT FOUND ERROR
// =====================================================

function throwNotFoundError(
  message
) {

  throw createAppError(

    ERROR_CODES.NOT_FOUND,

    message ||
      "Resource not found"

  );

}


// =====================================================
// CONFLICT ERROR
// =====================================================

function throwConflictError(
  message,
  details
) {

  throw createAppError(

    ERROR_CODES.CONFLICT,

    message ||
      "Resource conflict",

    details

  );

}


// =====================================================
// DATABASE ERROR
// =====================================================

function throwDatabaseError(
  message,
  originalError
) {

  throw createAppError(

    ERROR_CODES.DATABASE_ERROR,

    message ||
      "Database operation failed",

    null,

    originalError

  );

}


// =====================================================
// STORAGE ERROR
// =====================================================

function throwStorageError(
  message,
  details
) {

  throw createAppError(

    ERROR_CODES.STORAGE_ERROR,

    message ||
      "Storage operation failed",

    details

  );

}


// =====================================================
// EMAIL ERROR
// =====================================================

function throwEmailError(
  message,
  details
) {

  throw createAppError(

    ERROR_CODES.EMAIL_ERROR,

    message ||
      "Email operation failed",

    details

  );

}


// =====================================================
// SESSION ERROR
// =====================================================

function throwSessionError(
  message
) {

  throw createAppError(

    ERROR_CODES.SESSION_ERROR,

    message ||
      "Session operation failed"

  );

}


// =====================================================
// SECURITY ERROR
// =====================================================

function throwSecurityError(
  message
) {

  throw createAppError(

    ERROR_CODES.SECURITY_ERROR,

    message ||
      "Security validation failed"

  );

}


// =====================================================
// RATE LIMIT ERROR
// =====================================================

function throwRateLimitError(
  message,
  details
) {

  throw createAppError(

    ERROR_CODES.RATE_LIMITED,

    message ||
      "Too many requests",

    details

  );

}


// =====================================================
// CONFIGURATION ERROR
// =====================================================

function throwConfigurationError(
  message
) {

  throw createAppError(

    ERROR_CODES.CONFIGURATION_ERROR,

    message ||
      "System configuration error"

  );

}


// =====================================================
// SERVICE UNAVAILABLE
// =====================================================

function throwServiceUnavailableError(
  message
) {

  throw createAppError(

    ERROR_CODES.SERVICE_UNAVAILABLE,

    message ||
      "Service temporarily unavailable"

  );

}


// =====================================================
// SAFE EXECUTION
// =====================================================

function executeSafely(
  callback,
  context
) {

  try {

    return callback();

  } catch (error) {

    return handleError(
      error,
      context
    );

  }

}


// =====================================================
// ASYNC-LIKE SAFE EXECUTION
// =====================================================

function tryExecute(
  callback,
  context,
  fallback
) {

  try {

    return callback();

  } catch (error) {

    handleError(
      error,
      context
    );

    return fallback;

  }

}


// =====================================================
// ERROR RESPONSE CHECK
// =====================================================

function isErrorResponse(
  response
) {

  return (

    response &&
    response.success === false

  );

}


// =====================================================
// REQUIRE SUCCESS
// =====================================================

function requireSuccess(
  response
) {

  if (
    isErrorResponse(
      response
    )
  ) {

    throw createAppError(

      response.code ||
        ERROR_CODES.INTERNAL_ERROR,

      response.message ||
        "Operation failed",

      response.data || null

    );

  }


  return response;

}