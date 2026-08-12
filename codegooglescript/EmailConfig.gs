// =====================================================
// EMAILCONFIG.GS
// Email Configuration & Administration
// Registration System API
// =====================================================


// =====================================================
// DEFAULT EMAIL CONFIGURATION
// =====================================================

const DEFAULT_EMAIL_CONFIG = {

  // ---------------------------------------------------
  // SYSTEM
  // ---------------------------------------------------

  ENABLED:
    true,

  QUEUE_ENABLED:
    true,

  BROADCAST_ENABLED:
    true,

  LOGGING_ENABLED:
    true,

  TRACKING_ENABLED:
    true,


  // ---------------------------------------------------
  // BACKEND / SENDING ACCOUNT
  // ---------------------------------------------------

  BACKEND_EMAIL:
    "entrepriseofliberties@gmail.com",

  FROM_NAME:
    "CodingFamilySlop",

  REPLY_TO:
    "entrepriseofliberties@gmail.com",


  // ---------------------------------------------------
  // ADMIN EMAILS
  // ---------------------------------------------------

  ADMIN_EMAILS: [

    "entrepriseofliberties@gmail.com",

    "danmaffia80@gmail.com"

  ],


  // ---------------------------------------------------
  // SUPPORT EMAILS
  // ---------------------------------------------------

  SUPPORT_EMAILS: [

    "entrepriseofliberties@gmail.com",

    "danmaffia80@gmail.com"

  ],


  // ---------------------------------------------------
  // EMAIL LIMITS
  // ---------------------------------------------------

  MAX_RECIPIENTS:
    500,

  MAX_BULK_RECIPIENTS:
    500,

  MAX_BROADCAST_RECIPIENTS:
    500,

  MAX_SUBJECT_LENGTH:
    200,

  MAX_MESSAGE_LENGTH:
    50000,


  // ---------------------------------------------------
  // RETRY
  // ---------------------------------------------------

  RETRY_ATTEMPTS:
    3,

  RETRY_DELAY_SECONDS:
    30,


  // ---------------------------------------------------
  // QUEUE
  // ---------------------------------------------------

  QUEUE_BATCH_SIZE:
    20,

  QUEUE_LOCK_MINUTES:
    10,


  // ---------------------------------------------------
  // RATE LIMITING
  // ---------------------------------------------------

  VERIFICATION_COOLDOWN_SECONDS:
    60,

  PASSWORD_RESET_COOLDOWN_SECONDS:
    60,

  MAX_VERIFICATION_ATTEMPTS:
    5,

  MAX_PASSWORD_RESET_ATTEMPTS:
    5,


  // ---------------------------------------------------
  // TOKEN EXPIRATION
  // ---------------------------------------------------

  VERIFICATION_EXPIRATION_MINUTES:
    30,

  PASSWORD_RESET_CODE_EXPIRATION_MINUTES:
    10,

  PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES:
    15,


  // ---------------------------------------------------
  // LOG RETENTION
  // ---------------------------------------------------

  LOG_RETENTION_DAYS:
    90,

  QUEUE_RETENTION_DAYS:
    30,


  // ---------------------------------------------------
  // SECURITY
  // ---------------------------------------------------

  ALLOW_EXTERNAL_RECIPIENTS:
    true,

  ALLOW_CC:
    true,

  ALLOW_BCC:
    true,

  REQUIRE_VALID_RECIPIENT:
    true,

  REQUIRE_AUTH_FOR_BROADCAST:
    true,

  REQUIRE_AUTH_FOR_ADMIN_EMAIL:
    true,


  // ---------------------------------------------------
  // PROVIDER
  // ---------------------------------------------------

  PROVIDER:
    EMAIL_PROVIDERS.MAILAPP

};


// =====================================================
// SCRIPT PROPERTY NAMES
// =====================================================

const EMAIL_CONFIG_KEYS = {

  ENABLED:
    "EMAIL_ENABLED",

  QUEUE_ENABLED:
    "EMAIL_QUEUE_ENABLED",

  BROADCAST_ENABLED:
    "EMAIL_BROADCAST_ENABLED",

  LOGGING_ENABLED:
    "EMAIL_LOGGING_ENABLED",

  TRACKING_ENABLED:
    "EMAIL_TRACKING_ENABLED",

  BACKEND_EMAIL:
    "EMAIL_BACKEND_EMAIL",

  FROM_NAME:
    "EMAIL_FROM_NAME",

  REPLY_TO:
    "EMAIL_REPLY_TO",

  ADMIN_EMAILS:
    "EMAIL_ADMIN_EMAILS",

  SUPPORT_EMAILS:
    "EMAIL_SUPPORT_EMAILS"

};


// =====================================================
// GET EMAIL CONFIG
// =====================================================

function getEmailConfiguration() {

  const properties =
    PropertiesService
      .getScriptProperties();

  const config =
    JSON.parse(
      JSON.stringify(
        DEFAULT_EMAIL_CONFIG
      )
    );


  // ---------------------------------------------------
  // BOOLEAN VALUES
  // ---------------------------------------------------

  config.ENABLED =
    getBooleanProperty(
      properties,
      EMAIL_CONFIG_KEYS.ENABLED,
      config.ENABLED
    );

  config.QUEUE_ENABLED =
    getBooleanProperty(
      properties,
      EMAIL_CONFIG_KEYS.QUEUE_ENABLED,
      config.QUEUE_ENABLED
    );

  config.BROADCAST_ENABLED =
    getBooleanProperty(
      properties,
      EMAIL_CONFIG_KEYS.BROADCAST_ENABLED,
      config.BROADCAST_ENABLED
    );

  config.LOGGING_ENABLED =
    getBooleanProperty(
      properties,
      EMAIL_CONFIG_KEYS.LOGGING_ENABLED,
      config.LOGGING_ENABLED
    );

  config.TRACKING_ENABLED =
    getBooleanProperty(
      properties,
      EMAIL_CONFIG_KEYS.TRACKING_ENABLED,
      config.TRACKING_ENABLED
    );


  // ---------------------------------------------------
  // EMAIL ADDRESSES
  // ---------------------------------------------------

  config.BACKEND_EMAIL =
    getStringProperty(
      properties,
      EMAIL_CONFIG_KEYS.BACKEND_EMAIL,
      config.BACKEND_EMAIL
    );

  config.FROM_NAME =
    getStringProperty(
      properties,
      EMAIL_CONFIG_KEYS.FROM_NAME,
      config.FROM_NAME
    );

  config.REPLY_TO =
    getStringProperty(
      properties,
      EMAIL_CONFIG_KEYS.REPLY_TO,
      config.REPLY_TO
    );


  // ---------------------------------------------------
  // ADMIN EMAILS
  // ---------------------------------------------------

  config.ADMIN_EMAILS =
    getEmailArrayProperty(
      properties,
      EMAIL_CONFIG_KEYS.ADMIN_EMAILS,
      config.ADMIN_EMAILS
    );


  // ---------------------------------------------------
  // SUPPORT EMAILS
  // ---------------------------------------------------

  config.SUPPORT_EMAILS =
    getEmailArrayProperty(
      properties,
      EMAIL_CONFIG_KEYS.SUPPORT_EMAILS,
      config.SUPPORT_EMAILS
    );


  return config;

}


// =====================================================
// GET STRING PROPERTY
// =====================================================

function getStringProperty(
  properties,
  key,
  fallback
) {

  const value =
    properties.getProperty(
      key
    );

  if (
    value === null ||
    value === ""
  ) {

    return fallback;

  }

  return value.trim();

}


// =====================================================
// GET BOOLEAN PROPERTY
// =====================================================

function getBooleanProperty(
  properties,
  key,
  fallback
) {

  const value =
    properties.getProperty(
      key
    );

  if (
    value === null ||
    value === ""
  ) {

    return fallback;

  }

  return (
    String(value)
      .toLowerCase() ===
    "true"
  );

}


// =====================================================
// GET EMAIL ARRAY PROPERTY
// =====================================================

function getEmailArrayProperty(
  properties,
  key,
  fallback
) {

  const value =
    properties.getProperty(
      key
    );

  if (
    value === null ||
    value === ""
  ) {

    return fallback.slice();

  }

  try {

    const parsed =
      JSON.parse(
        value
      );

    if (
      Array.isArray(
        parsed
      )
    ) {

      return validateConfiguredEmails(
        parsed
      );

    }

  } catch (error) {

    // Fall back to comma-separated values.

  }

  const emails =
    String(value)
      .split(",")
      .map(
        function(email) {

          return normalizeEmail(
            email
          );

        }
      )
      .filter(
        function(email) {

          return email !== "";

        }
      );

  return validateConfiguredEmails(
    emails
  );

}


// =====================================================
// VALIDATE CONFIGURED EMAILS
// =====================================================

function validateConfiguredEmails(
  emails
) {

  const result = [];

  emails.forEach(
    function(email) {

      const normalized =
        normalizeEmail(
          email
        );

      if (
        !normalized
      ) {

        return;

      }

      if (
        !isValidEmailAddress(
          normalized
        )
      ) {

        throw new Error(
          "Invalid configured email: " +
          normalized
        );

      }

      if (
        result.indexOf(
          normalized
        ) === -1
      ) {

        result.push(
          normalized
        );

      }

    }
  );

  return result;

}


// =====================================================
// GET BACKEND EMAIL
// =====================================================

function getBackendEmail() {

  return getEmailConfiguration()
    .BACKEND_EMAIL;

}


// =====================================================
// GET FROM NAME
// =====================================================

function getFromName() {

  return getEmailConfiguration()
    .FROM_NAME;

}


// =====================================================
// GET REPLY-TO EMAIL
// =====================================================

function getReplyToEmail() {

  return getEmailConfiguration()
    .REPLY_TO;

}


// =====================================================
// GET ADMIN RECIPIENTS
// =====================================================

function getAdminRecipients() {

  return getEmailConfiguration()
    .ADMIN_EMAILS;

}


// =====================================================
// GET SUPPORT RECIPIENTS
// =====================================================

function getSupportRecipients() {

  return getEmailConfiguration()
    .SUPPORT_EMAILS;

}


// =====================================================
// CHECK EMAIL SYSTEM
// =====================================================

function isEmailSystemEnabled() {

  const config =
    getEmailConfiguration();

  return (
    config.ENABLED === true
  );

}


// =====================================================
// CHECK QUEUE
// =====================================================

function isEmailQueueSystemEnabled() {

  const config =
    getEmailConfiguration();

  return (
    config.ENABLED === true &&
    config.QUEUE_ENABLED === true
  );

}


// =====================================================
// CHECK BROADCAST
// =====================================================

function isEmailBroadcastSystemEnabled() {

  const config =
    getEmailConfiguration();

  return (
    config.ENABLED === true &&
    config.BROADCAST_ENABLED === true
  );

}


// =====================================================
// GET EMAIL LIMIT
// =====================================================

function getEmailLimit(
  type
) {

  const config =
    getEmailConfiguration();

  switch (
    String(type || "")
      .toLowerCase()
  ) {

    case "bulk":

      return config.MAX_BULK_RECIPIENTS;

    case "broadcast":

      return config.MAX_BROADCAST_RECIPIENTS;

    default:

      return config.MAX_RECIPIENTS;

  }

}


// =====================================================
// GET RETRY CONFIGURATION
// =====================================================

function getEmailRetryConfig() {

  const config =
    getEmailConfiguration();

  return {

    attempts:
      config.RETRY_ATTEMPTS,

    delaySeconds:
      config.RETRY_DELAY_SECONDS

  };

}


// =====================================================
// GET VERIFICATION CONFIGURATION
// =====================================================

function getEmailVerificationConfig() {

  const config =
    getEmailConfiguration();

  return {

    cooldownSeconds:
      config.VERIFICATION_COOLDOWN_SECONDS,

    maxAttempts:
      config.MAX_VERIFICATION_ATTEMPTS,

    expirationMinutes:
      config.VERIFICATION_EXPIRATION_MINUTES

  };

}


// =====================================================
// GET PASSWORD RESET CONFIGURATION
// =====================================================

function getEmailPasswordResetConfig() {

  const config =
    getEmailConfiguration();

  return {

    cooldownSeconds:
      config.PASSWORD_RESET_COOLDOWN_SECONDS,

    maxAttempts:
      config.MAX_PASSWORD_RESET_ATTEMPTS,

    codeExpirationMinutes:
      config.PASSWORD_RESET_CODE_EXPIRATION_MINUTES,

    tokenExpirationMinutes:
      config.PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES

  };

}


// =====================================================
// GET EMAIL PROVIDER
// =====================================================

function getEmailProvider() {

  return getEmailConfiguration()
    .PROVIDER;

}


// =====================================================
// SET EMAIL CONFIGURATION
// ADMIN USE
// =====================================================

function setEmailConfiguration(
  updates
) {

  if (
    !updates ||
    typeof updates !== "object"
  ) {

    throw new Error(
      "Email configuration is required"
    );

  }

  const properties =
    PropertiesService
      .getScriptProperties();


  // ---------------------------------------------------
  // BOOLEAN SETTINGS
  // ---------------------------------------------------

  const booleanKeys = [

    "ENABLED",
    "QUEUE_ENABLED",
    "BROADCAST_ENABLED",
    "LOGGING_ENABLED",
    "TRACKING_ENABLED"

  ];

  booleanKeys.forEach(
    function(key) {

      if (
        Object.prototype
          .hasOwnProperty.call(
            updates,
            key
          )
      ) {

        properties.setProperty(
          EMAIL_CONFIG_KEYS[key],
          String(
            updates[key] === true
          )
        );

      }

    }
  );


  // ---------------------------------------------------
  // STRING SETTINGS
  // ---------------------------------------------------

  const stringKeys = [

    "BACKEND_EMAIL",
    "FROM_NAME",
    "REPLY_TO"

  ];

  stringKeys.forEach(
    function(key) {

      if (
        Object.prototype
          .hasOwnProperty.call(
            updates,
            key
          )
      ) {

        const value =
          String(
            updates[key] || ""
          ).trim();

        if (
          key !== "FROM_NAME" &&
          !isValidEmailAddress(
            value
          )
        ) {

          throw new Error(
            "Invalid email configuration: " +
            key
          );

        }

        properties.setProperty(
          EMAIL_CONFIG_KEYS[key],
          value
        );

      }

    }
  );


  // ---------------------------------------------------
  // ADMIN EMAILS
  // ---------------------------------------------------

  if (
    Object.prototype
      .hasOwnProperty.call(
        updates,
        "ADMIN_EMAILS"
      )
  ) {

    const admins =
      validateConfiguredEmails(
        updates.ADMIN_EMAILS
      );

    properties.setProperty(
      EMAIL_CONFIG_KEYS.ADMIN_EMAILS,
      JSON.stringify(
        admins
      )
    );

  }


  // ---------------------------------------------------
  // SUPPORT EMAILS
  // ---------------------------------------------------

  if (
    Object.prototype
      .hasOwnProperty.call(
        updates,
        "SUPPORT_EMAILS"
      )
  ) {

    const support =
      validateConfiguredEmails(
        updates.SUPPORT_EMAILS
      );

    properties.setProperty(
      EMAIL_CONFIG_KEYS.SUPPORT_EMAILS,
      JSON.stringify(
        support
      )
    );

  }


  return getEmailConfiguration();

}


// =====================================================
// RESET EMAIL CONFIGURATION
// =====================================================

function resetEmailConfiguration() {

  const properties =
    PropertiesService
      .getScriptProperties();

  Object.keys(
    EMAIL_CONFIG_KEYS
  ).forEach(
    function(key) {

      properties.deleteProperty(
        EMAIL_CONFIG_KEYS[key]
      );

    }
  );

  return getEmailConfiguration();

}


// =====================================================
// EMAIL CONFIGURATION SUMMARY
// =====================================================

function getEmailConfigurationSummary() {

  const config =
    getEmailConfiguration();

  return {

    enabled:
      config.ENABLED,

    queueEnabled:
      config.QUEUE_ENABLED,

    broadcastEnabled:
      config.BROADCAST_ENABLED,

    loggingEnabled:
      config.LOGGING_ENABLED,

    trackingEnabled:
      config.TRACKING_ENABLED,

    backendEmail:
      config.BACKEND_EMAIL,

    fromName:
      config.FROM_NAME,

    replyTo:
      config.REPLY_TO,

    adminCount:
      config.ADMIN_EMAILS.length,

    supportCount:
      config.SUPPORT_EMAILS.length,

    provider:
      config.PROVIDER,

    maxRecipients:
      config.MAX_RECIPIENTS,

    retryAttempts:
      config.RETRY_ATTEMPTS

  };

}