// =====================================================
// SESSION CONFIGURATION
// SessionConfig.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION CONFIGURATION
// =====================================================

const SESSION_CONFIG = {

  // ---------------------------------------------------
  // GENERAL SESSION SETTINGS
  // ---------------------------------------------------

  ENABLED: true,

  SESSION_VERSION: "1.0",

  DEFAULT_ROLE: "User",

  // ---------------------------------------------------
  // SESSION LIFETIME
  // ---------------------------------------------------

  DEFAULT_DURATION_MS:
    30 * 24 * 60 * 60 * 1000,

  MIN_DURATION_MS:
    5 * 60 * 1000,

  MAX_DURATION_MS:
    90 * 24 * 60 * 60 * 1000,

  // ---------------------------------------------------
  // IDLE TIMEOUT
  // ---------------------------------------------------

  IDLE_TIMEOUT_MS:
    30 * 60 * 1000,

  MIN_IDLE_TIMEOUT_MS:
    5 * 60 * 1000,

  MAX_IDLE_TIMEOUT_MS:
    24 * 60 * 60 * 1000,

  // ---------------------------------------------------
  // TOKEN SETTINGS
  // ---------------------------------------------------

  TOKEN_PREFIX: "sess_",

  TOKEN_BYTES: 32,

  TOKEN_LENGTH: 69,

  TOKEN_HASH_ALGORITHM:
    "SHA-256",

  // ---------------------------------------------------
  // TOKEN ROTATION
  // ---------------------------------------------------

  ENABLE_TOKEN_ROTATION: true,

  ROTATION_GRACE_PERIOD_MS:
    30 * 1000,

  MAX_ROTATIONS_PER_SESSION:
    100,

  // ---------------------------------------------------
  // REFRESH
  // ---------------------------------------------------

  ENABLE_REFRESH: true,

  REFRESH_THRESHOLD_MS:
    24 * 60 * 60 * 1000,

  MAX_REFRESH_COUNT:
    100,

  // ---------------------------------------------------
  // SESSION LIMITS
  // ---------------------------------------------------

  MAX_SESSIONS_PER_USER:
    5,

  MAX_SESSIONS_PER_DEVICE:
    2,

  MAX_SESSIONS_PER_IP:
    10,

  // ---------------------------------------------------
  // DEVICE SECURITY
  // ---------------------------------------------------

  ENABLE_DEVICE_TRACKING: true,

  ENABLE_DEVICE_BINDING: false,

  REQUIRE_DEVICE_ID:
    false,

  // ---------------------------------------------------
  // IP SECURITY
  // ---------------------------------------------------

  ENABLE_IP_TRACKING: true,

  ENABLE_IP_LOGGING: true,

  ENABLE_IP_BINDING: false,

  ALLOW_IP_CHANGE: true,

  // ---------------------------------------------------
  // ACTIVITY
  // ---------------------------------------------------

  ENABLE_ACTIVITY_TRACKING: true,

  ACTIVITY_UPDATE_INTERVAL_MS:
    30 * 1000,

  MAX_ACTIVITY_HISTORY:
    100,

  // ---------------------------------------------------
  // SESSION LOCKING
  // ---------------------------------------------------

  ENABLE_LOCKING: true,

  DEFAULT_LOCK_DURATION_MS:
    15 * 60 * 1000,

  MAX_LOCK_DURATION_MS:
    24 * 60 * 60 * 1000,

  MAX_UNLOCK_ATTEMPTS:
    5,

  // ---------------------------------------------------
  // REVOCATION
  // ---------------------------------------------------

  ENABLE_REVOCATION: true,

  KEEP_REVOKED_SESSIONS: true,

  // ---------------------------------------------------
  // LOGIN SECURITY
  // ---------------------------------------------------

  MAX_FAILED_ATTEMPTS:
    5,

  FAILED_ATTEMPT_WINDOW_MS:
    15 * 60 * 1000,

  ACCOUNT_LOCK_DURATION_MS:
    30 * 60 * 1000,

  // ---------------------------------------------------
  // CONCURRENT LOGIN SECURITY
  // ---------------------------------------------------

  REVOKE_OLD_SESSION_ON_LIMIT:
    false,

  REVOKE_OLDEST_SESSION:
    true,

  // ---------------------------------------------------
  // CLEANUP
  // ---------------------------------------------------

  CLEANUP_ENABLED: true,

  CLEANUP_INTERVAL_MS:
    60 * 60 * 1000,

  DELETE_EXPIRED_SESSIONS:
    true,

  DELETE_REVOKED_SESSIONS:
    false,

  REVOKED_SESSION_RETENTION_MS:
    30 * 24 * 60 * 60 * 1000,

  // ---------------------------------------------------
  // ACTIVITY HISTORY CLEANUP
  // ---------------------------------------------------

  ACTIVITY_RETENTION_MS:
    7 * 24 * 60 * 60 * 1000,

  IP_HISTORY_RETENTION_MS:
    30 * 24 * 60 * 60 * 1000,

  // ---------------------------------------------------
  // SECURITY LOGGING
  // ---------------------------------------------------

  ENABLE_SECURITY_LOGGING: true,

  LOG_TOKEN_EVENTS: true,

  LOG_LOGIN_EVENTS: true,

  LOG_LOGOUT_EVENTS: true,

  LOG_REFRESH_EVENTS: true,

  LOG_ROTATION_EVENTS: true,

  LOG_REVOCATION_EVENTS: true,

  LOG_LOCK_EVENTS: true,

  LOG_IP_CHANGES: true,

  LOG_DEVICE_CHANGES: true,

  // ---------------------------------------------------
  // ADMIN SESSION SETTINGS
  // ---------------------------------------------------

  ADMIN_MAX_SESSIONS:
    3,

  ADMIN_IDLE_TIMEOUT_MS:
    15 * 60 * 1000,

  ADMIN_SESSION_DURATION_MS:
    12 * 60 * 60 * 1000,

  ADMIN_REQUIRE_DEVICE:
    true,

  ADMIN_REQUIRE_IP_CHECK:
    false,

  // ---------------------------------------------------
  // API SETTINGS
  // ---------------------------------------------------

  REQUIRE_AUTHENTICATION:
    true,

  ALLOW_ANONYMOUS_SESSION:
    false,

  // ---------------------------------------------------
  // TIME SETTINGS
  // ---------------------------------------------------

  CLOCK_SKEW_TOLERANCE_MS:
    60 * 1000,

  // ---------------------------------------------------
  // STORAGE
  // ---------------------------------------------------

  SESSION_SHEET:
    "Sessions",

  ACTIVITY_PROPERTY_PREFIX:
    "SESSION_ACTIVITY_",

  IP_PROPERTY_PREFIX:
    "SESSION_IP_",

  // ---------------------------------------------------
  // ERROR MESSAGES
  // ---------------------------------------------------

  ERRORS: {

    DISABLED:
      "Sessions are currently disabled",

    INVALID_TOKEN:
      "Invalid session token",

    NOT_FOUND:
      "Session not found",

    EXPIRED:
      "Session has expired",

    REVOKED:
      "Session has been revoked",

    LOCKED:
      "Session is locked",

    IDLE:
      "Session has been idle for too long",

    DEVICE_MISMATCH:
      "Session device mismatch",

    IP_MISMATCH:
      "Session IP mismatch",

    SESSION_LIMIT:
      "Maximum session limit reached",

    REFRESH_DISABLED:
      "Session refresh is disabled",

    ROTATION_DISABLED:
      "Session rotation is disabled"

  }

};


// =====================================================
// SESSION DURATION HELPERS
// =====================================================

function getSessionDuration() {

  return SESSION_CONFIG
    .DEFAULT_DURATION_MS;

}


// =====================================================
// GET ADMIN SESSION DURATION
// =====================================================

function getAdminSessionDuration() {

  return SESSION_CONFIG
    .ADMIN_SESSION_DURATION_MS;

}


// =====================================================
// GET IDLE TIMEOUT
// =====================================================

function getSessionIdleTimeout(
  role
) {

  if (
    role &&
    String(role).toLowerCase() ===
    "admin"
  ) {

    return SESSION_CONFIG
      .ADMIN_IDLE_TIMEOUT_MS;

  }


  return SESSION_CONFIG
    .IDLE_TIMEOUT_MS;

}


// =====================================================
// GET MAX SESSION LIMIT
// =====================================================

function getSessionLimit(
  role
) {

  if (
    role &&
    String(role).toLowerCase() ===
    "admin"
  ) {

    return SESSION_CONFIG
      .ADMIN_MAX_SESSIONS;

  }


  return SESSION_CONFIG
    .MAX_SESSIONS_PER_USER;

}


// =====================================================
// GET SESSION CONFIG
// =====================================================

function getSessionConfig() {

  return {

    enabled:
      SESSION_CONFIG.ENABLED,

    version:
      SESSION_CONFIG.SESSION_VERSION,

    defaultDuration:
      SESSION_CONFIG.DEFAULT_DURATION_MS,

    idleTimeout:
      SESSION_CONFIG.IDLE_TIMEOUT_MS,

    maxSessions:
      SESSION_CONFIG.MAX_SESSIONS_PER_USER,

    tokenRotation:
      SESSION_CONFIG.ENABLE_TOKEN_ROTATION,

    refresh:
      SESSION_CONFIG.ENABLE_REFRESH,

    deviceTracking:
      SESSION_CONFIG.ENABLE_DEVICE_TRACKING,

    ipTracking:
      SESSION_CONFIG.ENABLE_IP_TRACKING,

    activityTracking:
      SESSION_CONFIG.ENABLE_ACTIVITY_TRACKING,

    locking:
      SESSION_CONFIG.ENABLE_LOCKING,

    revocation:
      SESSION_CONFIG.ENABLE_REVOCATION

  };

}


// =====================================================
// CHECK SESSION SYSTEM
// =====================================================

function isSessionSystemEnabled() {

  return (
    SESSION_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// REQUIRE SESSION SYSTEM
// =====================================================

function requireSessionSystem() {

  if (
    !isSessionSystemEnabled()
  ) {

    throw new Error(
      SESSION_CONFIG.ERRORS.DISABLED
    );

  }


  return true;

}


// =====================================================
// VALIDATE SESSION DURATION
// =====================================================

function validateSessionDuration(
  durationMs
) {

  durationMs =
    parseInt(
      durationMs,
      10
    );


  if (
    isNaN(durationMs)
  ) {

    return {

      valid: false,

      reason:
        "Invalid session duration"

    };

  }


  if (
    durationMs <
    SESSION_CONFIG.MIN_DURATION_MS
  ) {

    return {

      valid: false,

      reason:
        "Session duration is too short",

      minimum:
        SESSION_CONFIG.MIN_DURATION_MS

    };

  }


  if (
    durationMs >
    SESSION_CONFIG.MAX_DURATION_MS
  ) {

    return {

      valid: false,

      reason:
        "Session duration is too long",

      maximum:
        SESSION_CONFIG.MAX_DURATION_MS

    };

  }


  return {

    valid: true,

    duration:
      durationMs

  };

}


// =====================================================
// VALIDATE IDLE TIMEOUT
// =====================================================

function validateSessionIdleTimeout(
  timeoutMs
) {

  timeoutMs =
    parseInt(
      timeoutMs,
      10
    );


  if (
    isNaN(timeoutMs)
  ) {

    return {

      valid: false,

      reason:
        "Invalid idle timeout"

    };

  }


  if (
    timeoutMs <
    SESSION_CONFIG.MIN_IDLE_TIMEOUT_MS
  ) {

    return {

      valid: false,

      reason:
        "Idle timeout is too short"

    };

  }


  if (
    timeoutMs >
    SESSION_CONFIG.MAX_IDLE_TIMEOUT_MS
  ) {

    return {

      valid: false,

      reason:
        "Idle timeout is too long"

    };

  }


  return {

    valid: true,

    timeout:
      timeoutMs

  };

}


// =====================================================
// GET TOKEN SETTINGS
// =====================================================

function getSessionTokenConfig() {

  return {

    prefix:
      SESSION_CONFIG.TOKEN_PREFIX,

    bytes:
      SESSION_CONFIG.TOKEN_BYTES,

    length:
      SESSION_CONFIG.TOKEN_LENGTH,

    hashAlgorithm:
      SESSION_CONFIG.TOKEN_HASH_ALGORITHM

  };

}


// =====================================================
// GET SECURITY SETTINGS
// =====================================================

function getSessionSecurityConfig() {

  return {

    deviceTracking:
      SESSION_CONFIG.ENABLE_DEVICE_TRACKING,

    deviceBinding:
      SESSION_CONFIG.ENABLE_DEVICE_BINDING,

    ipTracking:
      SESSION_CONFIG.ENABLE_IP_TRACKING,

    ipBinding:
      SESSION_CONFIG.ENABLE_IP_BINDING,

    ipChangeAllowed:
      SESSION_CONFIG.ALLOW_IP_CHANGE,

    activityTracking:
      SESSION_CONFIG.ENABLE_ACTIVITY_TRACKING,

    locking:
      SESSION_CONFIG.ENABLE_LOCKING,

    revocation:
      SESSION_CONFIG.ENABLE_REVOCATION,

    securityLogging:
      SESSION_CONFIG.ENABLE_SECURITY_LOGGING

  };

}


// =====================================================
// GET CLEANUP CONFIG
// =====================================================

function getSessionCleanupConfig() {

  return {

    enabled:
      SESSION_CONFIG.CLEANUP_ENABLED,

    interval:
      SESSION_CONFIG.CLEANUP_INTERVAL_MS,

    deleteExpired:
      SESSION_CONFIG.DELETE_EXPIRED_SESSIONS,

    deleteRevoked:
      SESSION_CONFIG.DELETE_REVOKED_SESSIONS,

    revokedRetention:
      SESSION_CONFIG.REVOKED_SESSION_RETENTION_MS,

    activityRetention:
      SESSION_CONFIG.ACTIVITY_RETENTION_MS,

    ipRetention:
      SESSION_CONFIG.IP_HISTORY_RETENTION_MS

  };

}


// =====================================================
// CHECK SESSION FEATURE
// =====================================================

function isSessionFeatureEnabled(
  feature
) {

  const features = {

    refresh:
      SESSION_CONFIG.ENABLE_REFRESH,

    rotation:
      SESSION_CONFIG.ENABLE_TOKEN_ROTATION,

    activity:
      SESSION_CONFIG.ENABLE_ACTIVITY_TRACKING,

    device:
      SESSION_CONFIG.ENABLE_DEVICE_TRACKING,

    ip:
      SESSION_CONFIG.ENABLE_IP_TRACKING,

    locking:
      SESSION_CONFIG.ENABLE_LOCKING,

    revocation:
      SESSION_CONFIG.ENABLE_REVOCATION,

    cleanup:
      SESSION_CONFIG.CLEANUP_ENABLED,

    securityLogging:
      SESSION_CONFIG.ENABLE_SECURITY_LOGGING

  };


  return (
    features[
      String(feature)
        .trim()
        .toLowerCase()
    ] === true
  );

}