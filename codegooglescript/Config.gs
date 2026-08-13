// =====================================================
// CONFIG.GS
// Central Application Configuration
// Cloud Project Platform
// =====================================================


// =====================================================
// APPLICATION CONFIGURATION
// =====================================================

const APP_CONFIG = {

  // ---------------------------------------------------
  // APPLICATION
  // ---------------------------------------------------

  NAME:
    "Cloud Project Platform",

  VERSION:
    "1.0.0",

  ENVIRONMENT:
    "production",

  TIMEZONE:
    Session.getScriptTimeZone() ||
    "UTC",


  // ---------------------------------------------------
  // DATABASE
  // ---------------------------------------------------

  DATABASE: {

    USE_ACTIVE_SPREADSHEET:
      true,

    AUTO_CREATE_SHEETS:
      true,

    HEADER_ROW:
      1

  },


  // ---------------------------------------------------
  // API
  // ---------------------------------------------------

  API: {

    ENABLED:
      true,

    VERSION:
      "v1",

    DEFAULT_PAGE_SIZE:
      25,

    MAX_PAGE_SIZE:
      100,

    ENABLE_LOGGING:
      true,

    ENABLE_RATE_LIMIT:
      true

  },


  // ---------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------

  AUTH: {

    ENABLE_REGISTRATION:
      true,

    REQUIRE_EMAIL_VERIFICATION:
      true,

    REQUIRE_LOGIN:
      true,

    SESSION_DURATION_DAYS:
      30,

    MAX_LOGIN_ATTEMPTS:
      5,

    ACCOUNT_LOCK_MINUTES:
      30

  },


  // ---------------------------------------------------
  // PASSWORD
  // ---------------------------------------------------

  PASSWORD: {

    MIN_LENGTH:
      8,

    MAX_LENGTH:
      128,

    RESET_CODE_LENGTH:
      6,

    RESET_CODE_EXPIRY_MINUTES:
      10

  },


  // ---------------------------------------------------
  // FILES
  // ---------------------------------------------------

  FILES: {

    ENABLE_UPLOADS:
      true,

    ENABLE_DOWNLOADS:
      true,

    ENABLE_PREVIEWS:
      true,

    MAX_FILE_SIZE:
      100 * 1024 * 1024,

    MAX_FILENAME_LENGTH:
      255

  },


  // ---------------------------------------------------
  // STORAGE
  // ---------------------------------------------------

  STORAGE: {

    ENABLED:
      true,

    MULTI_STORAGE:
      true,

    MULTI_NODE:
      true,

    MULTI_ROOM:
      true,

    DEFAULT_ALLOCATION:
      "LEAST_USED",

    ENABLE_HEALTH_CHECK:
      true,

    ENABLE_AUTO_CLEANUP:
      true

  },


  // ---------------------------------------------------
  // EMAIL
  // ---------------------------------------------------

  EMAIL: {

    ENABLED:
      true,

    ENABLE_VERIFICATION:
      true,

    ENABLE_PASSWORD_RESET:
      true,

    ENABLE_NOTIFICATIONS:
      true,

    ENABLE_QUEUE:
      true,

    ENABLE_BROADCAST:
      true,

    MAX_RETRIES:
      3

  },


  // ---------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------

  NOTIFICATIONS: {

    ENABLED:
      true,

    EMAIL:
      true,

    IN_APP:
      true

  },


  // ---------------------------------------------------
  // SECURITY
  // ---------------------------------------------------

  SECURITY: {

    ENABLED:
      true,

    HASH_ALGORITHM:
      "SHA-256",

    ENABLE_RATE_LIMIT:
      true,

    ENABLE_SECURITY_LOG:
      true,

    ENABLE_AUDIT_LOG:
      true,

    ENABLE_DEVICE_TRACKING:
      true,

    ENABLE_IP_TRACKING:
      true

  },


  // ---------------------------------------------------
  // SESSIONS
  // ---------------------------------------------------

  SESSIONS: {

    ENABLED:
      true,

    MAX_CONCURRENT_SESSIONS:
      5,

    IDLE_TIMEOUT_MINUTES:
      60,

    ENABLE_TOKEN_ROTATION:
      true,

    ENABLE_SESSION_REVOCATION:
      true

  },


  // ---------------------------------------------------
  // LOGGING
  // ---------------------------------------------------

  LOGGING: {

    ENABLED:
      true,

    APPLICATION:
      true,

    SECURITY:
      true,

    AUDIT:
      true,

    LOGIN:
      true,

    FILE:
      true,

    PROJECT:
      true,

    EMAIL:
      true,

    STORAGE:
      true

  },


  // ---------------------------------------------------
  // BACKUPS
  // ---------------------------------------------------

  BACKUP: {

    ENABLED:
      true,

    AUTOMATIC:
      true,

    RETENTION_DAYS:
      30,

    INCLUDE_DATABASE:
      true,

    INCLUDE_CONFIGURATION:
      true

  },


  // ---------------------------------------------------
  // SEARCH
  // ---------------------------------------------------

  SEARCH: {

    ENABLED:
      true,

    MAX_RESULTS:
      100,

    CASE_INSENSITIVE:
      true

  },


  // ---------------------------------------------------
  // MAINTENANCE
  // ---------------------------------------------------

  MAINTENANCE: {

    ENABLED:
      false,

    ALLOW_ADMIN_ACCESS:
      true,

    MESSAGE:
      "System temporarily unavailable for maintenance."

  }

};


// =====================================================
// URL CONFIGURATION
// =====================================================

const APP_URLS = {

  // Web application URL.
  // Can be overridden using Script Properties.

  WEB_APP:
    "",

  LOGIN:
    "/login",

  REGISTER:
    "/register",

  DASHBOARD:
    "/dashboard",

  RESET_PASSWORD:
    "/reset-password",

  VERIFY_EMAIL:
    "/verify-email",

  ADMIN:
    "/admin"

};


// =====================================================
// FEATURE FLAGS
// =====================================================

const FEATURE_FLAGS = {

  REGISTRATION:
    true,

  EMAIL_VERIFICATION:
    true,

  PASSWORD_RESET:
    true,

  PROJECTS:
    true,

  PROJECT_USERS:
    true,

  FILES:
    true,

  FOLDERS:
    true,

  FILE_VERSIONS:
    true,

  PROJECT_HISTORY:
    true,

  MULTI_STORAGE:
    true,

  GOOGLE_DRIVE_STORAGE:
    true,

  SHEETS:
    true,

  EMAIL:
    true,

  NOTIFICATIONS:
    true,

  ROLES:
    true,

  PERMISSIONS:
    true,

  DASHBOARD:
    true,

  SESSIONS:
    true,

  SEARCH:
    true,

  ANALYTICS:
    true,

  REPORTS:
    true,

  BACKUPS:
    true,

  WEBHOOKS:
    true,

  API_TOKENS:
    true,

  DEVICE_SECURITY:
    true

};


// =====================================================
// SCRIPT PROPERTIES
// =====================================================

function getScriptProperty(
  key,
  defaultValue
) {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);


  if (
    value === null ||
    value === undefined
  ) {

    return (
      defaultValue !== undefined
        ? defaultValue
        : ""
    );

  }


  return value;

}


// =====================================================
// SET SCRIPT PROPERTY
// =====================================================

function setScriptProperty(
  key,
  value
) {

  if (!key) {

    throwValidationError(
      "Property key is required"
    );

  }


  PropertiesService
    .getScriptProperties()
    .setProperty(
      key,
      String(value)
    );


  return true;

}


// =====================================================
// DELETE SCRIPT PROPERTY
// =====================================================

function deleteScriptProperty(
  key
) {

  if (!key) {
    return false;
  }


  PropertiesService
    .getScriptProperties()
    .deleteProperty(
      key
    );


  return true;

}


// =====================================================
// GET DATABASE SPREADSHEET ID
// =====================================================

function getConfiguredDatabaseId() {

  return getScriptProperty(
    "DATABASE_SPREADSHEET_ID",
    ""
  );

}


// =====================================================
// GET WEB APP URL
// =====================================================

function getWebAppUrl() {

  const configuredUrl =
    getScriptProperty(
      "WEB_APP_URL",
      ""
    );


  if (configuredUrl) {

    return configuredUrl;

  }


  return APP_URLS.WEB_APP || "";

}


// =====================================================
// BUILD APPLICATION URL
// =====================================================

function buildAppUrl(
  path
) {

  const base =
    getWebAppUrl();


  if (!base) {

    return path || "";

  }


  if (!path) {

    return base;

  }


  return (

    base.replace(
      /\/+$/,
      ""
    ) +

    "/" +

    String(path)
      .replace(
        /^\/+/,
        ""
      )

  );

}


// =====================================================
// GET CONFIGURATION
// =====================================================

function getConfig() {

  return {

    name:
      APP_CONFIG.NAME,

    version:
      APP_CONFIG.VERSION,

    environment:
      APP_CONFIG.ENVIRONMENT,

    timezone:
      APP_CONFIG.TIMEZONE,

    databaseSpreadsheetId:
      getConfiguredDatabaseId(),

    webAppUrl:
      getWebAppUrl(),

    apiVersion:
      APP_CONFIG.API.VERSION,

    features:
      getEnabledFeatures()

  };

}


// =====================================================
// GET ENABLED FEATURES
// =====================================================

function getEnabledFeatures() {

  const enabled = {};


  Object.keys(
    FEATURE_FLAGS
  ).forEach(
    function(feature) {

      enabled[feature] =
        FEATURE_FLAGS[feature] === true;

    }
  );


  return enabled;

}


// =====================================================
// CHECK FEATURE
// =====================================================

function isFeatureEnabled(
  feature
) {

  if (!feature) {
    return false;
  }


  return (
    FEATURE_FLAGS[
      String(feature)
        .toUpperCase()
    ] === true
  );

}


// =====================================================
// REQUIRE FEATURE
// =====================================================

function requireFeature(
  feature
) {

  if (
    !isFeatureEnabled(
      feature
    )
  ) {

    throw createAppError(

      ERROR_CODES.SERVICE_UNAVAILABLE,

      "Feature is currently disabled"

    );

  }


  return true;

}


// =====================================================
// CHECK MAINTENANCE MODE
// =====================================================

function isMaintenanceMode() {

  return (
    APP_CONFIG
      .MAINTENANCE
      .ENABLED === true
  );

}


// =====================================================
// GET MAINTENANCE MESSAGE
// =====================================================

function getMaintenanceMessage() {

  return (
    APP_CONFIG
      .MAINTENANCE
      .MESSAGE
  );

}


// =====================================================
// CHECK ENVIRONMENT
// =====================================================

function isProduction() {

  return (
    String(
      APP_CONFIG.ENVIRONMENT
    ).toLowerCase() ===
    "production"
  );

}


function isDevelopment() {

  return (
    String(
      APP_CONFIG.ENVIRONMENT
    ).toLowerCase() ===
    "development"
  );

}


// =====================================================
// CONFIGURATION VALIDATION
// =====================================================

function validateConfiguration() {

  const errors = [];


  if (!APP_CONFIG.NAME) {

    errors.push(
      "Application name is missing"
    );

  }


  if (!APP_CONFIG.VERSION) {

    errors.push(
      "Application version is missing"
    );

  }


  if (
    APP_CONFIG.AUTH
      .MAX_LOGIN_ATTEMPTS <= 0
  ) {

    errors.push(
      "Invalid maximum login attempts"
    );

  }


  if (
    APP_CONFIG.PASSWORD
      .MIN_LENGTH < 6
  ) {

    errors.push(
      "Password minimum length is too low"
    );

  }


  if (
    APP_CONFIG.API
      .MAX_PAGE_SIZE <
    APP_CONFIG.API
      .DEFAULT_PAGE_SIZE
  ) {

    errors.push(
      "API page-size configuration is invalid"
    );

  }


  return {

    valid:
      errors.length === 0,

    errors:
      errors

  };

}


// =====================================================
// CONFIGURATION STATUS
// =====================================================

function getConfigurationStatus() {

  const validation =
    validateConfiguration();


  return {

    valid:
      validation.valid,

    errors:
      validation.errors,

    environment:
      APP_CONFIG.ENVIRONMENT,

    version:
      APP_CONFIG.VERSION,

    maintenance:
      isMaintenanceMode(),

    enabledFeatures:
      getEnabledFeatures(),

    timestamp:
      new Date()

  };

}