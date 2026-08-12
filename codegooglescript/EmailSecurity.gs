// =====================================================
// EMAILSECURITY.GS
// Email Security & Abuse Protection
// Registration System API
// =====================================================


// =====================================================
// EMAIL SECURITY CONFIGURATION
// =====================================================

const EMAIL_SECURITY_CONFIG = {

  ENABLED: true,

  // Maximum emails allowed per user
  MAX_USER_EMAILS_PER_HOUR: 20,

  // Maximum emails allowed per IP
  MAX_IP_EMAILS_PER_HOUR: 50,

  // Maximum broadcast emails
  MAX_BROADCAST_RECIPIENTS: 500,

  // Maximum recipients per individual email
  MAX_RECIPIENTS_PER_EMAIL: 20,

  // Maximum subject length
  MAX_SUBJECT_LENGTH: 200,

  // Maximum message length
  MAX_MESSAGE_LENGTH: 50000,

  // Block suspicious header characters
  BLOCK_HEADER_INJECTION: true,

  // Do not allow sensitive values in logs
  REDACT_SENSITIVE_DATA: true,

  // Security event logging
  LOG_SECURITY_EVENTS: true,

  // Password/reset codes should never be logged
  BLOCK_SENSITIVE_CONTENT: true,

  // Rate-limit window
  RATE_LIMIT_WINDOW_MS:
    60 * 60 * 1000

};


// =====================================================
// SECURITY EVENT TYPES
// =====================================================

const EMAIL_SECURITY_EVENTS = {

  INVALID_RECIPIENT:
    "Invalid Recipient",

  HEADER_INJECTION:
    "Header Injection Attempt",

  RATE_LIMIT:
    "Rate Limit Exceeded",

  UNAUTHORIZED:
    "Unauthorized Email Operation",

  BROADCAST_LIMIT:
    "Broadcast Limit Exceeded",

  INVALID_SUBJECT:
    "Invalid Subject",

  MESSAGE_TOO_LARGE:
    "Message Too Large",

  SENSITIVE_CONTENT:
    "Sensitive Content Detected",

  SUSPICIOUS_REQUEST:
    "Suspicious Email Request",

  BLOCKED:
    "Email Operation Blocked"

};


// =====================================================
// SECURITY LOG SHEET
// =====================================================

const EMAIL_SECURITY_SHEET =
  "EMAIL_SECURITY_LOGS";


// =====================================================
// SECURITY LOG COLUMNS
// =====================================================

const EMAIL_SECURITY_COLUMNS = {

  ID: 1,

  EVENT: 2,

  USER_ID: 3,

  EMAIL: 4,

  IP_ADDRESS: 5,

  DEVICE_ID: 6,

  ACTION: 7,

  REASON: 8,

  CREATED_DATE: 9,

  CREATED_BY: 10,

  METADATA: 11

};


// =====================================================
// GET SECURITY SHEET
// =====================================================

function getEmailSecuritySheet() {

  return getSheet(
    SHEETS.EMAIL_SECURITY_LOGS ||
    EMAIL_SECURITY_SHEET
  );

}


// =====================================================
// GENERATE SECURITY LOG ID
// =====================================================

function generateEmailSecurityLogId() {

  return (
    "ESEC-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// CHECK EMAIL SECURITY ENABLED
// =====================================================

function isEmailSecurityEnabled() {

  return (
    EMAIL_SECURITY_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// REMOVE HEADER INJECTION
// =====================================================

function containsEmailHeaderInjection(
  value
) {

  if (!value) {

    return false;

  }


  const text =
    String(value);


  return (
    text.indexOf("\r") !== -1 ||
    text.indexOf("\n") !== -1
  );

}


// =====================================================
// VALIDATE EMAIL ADDRESS
// =====================================================

function validateEmailSecurityRecipient(
  email
) {

  if (!email) {

    return {

      valid:
        false,

      reason:
        "Email address is required"

    };

  }


  const normalized =
    String(email)
      .trim()
      .toLowerCase();


  if (
    containsEmailHeaderInjection(
      normalized
    )
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .HEADER_INJECTION

    };

  }


  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(normalized)
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .INVALID_RECIPIENT

    };

  }


  return {

    valid:
      true,

    email:
      normalized

  };

}


// =====================================================
// VALIDATE RECIPIENT LIST
// =====================================================

function validateEmailRecipientsSecurity(
  recipients
) {

  if (
    !Array.isArray(
      recipients
    )
  ) {

    return {

      valid:
        false,

      reason:
        "Recipients must be an array"

    };

  }


  if (
    recipients.length === 0
  ) {

    return {

      valid:
        false,

      reason:
        "At least one recipient is required"

    };

  }


  if (
    recipients.length >
    EMAIL_SECURITY_CONFIG
      .MAX_RECIPIENTS_PER_EMAIL
  ) {

    return {

      valid:
        false,

      reason:
        "Maximum recipients per email exceeded"

    };

  }


  const normalized =
    [];


  for (
    let i = 0;
    i < recipients.length;
    i++
  ) {

    const result =
      validateEmailSecurityRecipient(
        recipients[i]
      );


    if (!result.valid) {

      return {

        valid:
          false,

        reason:
          result.reason,

        recipient:
          recipients[i]

      };

    }


    if (
      normalized.indexOf(
        result.email
      ) === -1
    ) {

      normalized.push(
        result.email
      );

    }

  }


  return {

    valid:
      true,

    recipients:
      normalized

  };

}


// =====================================================
// VALIDATE SUBJECT
// =====================================================

function validateEmailSubjectSecurity(
  subject
) {

  if (!subject) {

    return {

      valid:
        false,

      reason:
        "Email subject is required"

    };

  }


  const value =
    String(subject)
      .trim();


  if (
    containsEmailHeaderInjection(
      value
    )
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .HEADER_INJECTION

    };

  }


  if (
    value.length >
    EMAIL_SECURITY_CONFIG
      .MAX_SUBJECT_LENGTH
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .INVALID_SUBJECT

    };

  }


  return {

    valid:
      true,

    subject:
      value

  };

}


// =====================================================
// VALIDATE MESSAGE
// =====================================================

function validateEmailMessageSecurity(
  message
) {

  if (
    message === null ||
    message === undefined
  ) {

    return {

      valid:
        false,

      reason:
        "Email message is required"

    };

  }


  const value =
    String(message);


  if (
    value.length >
    EMAIL_SECURITY_CONFIG
      .MAX_MESSAGE_LENGTH
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .MESSAGE_TOO_LARGE

    };

  }


  return {

    valid:
      true

  };

}


// =====================================================
// DETECT SENSITIVE CONTENT
// =====================================================

function containsSensitiveEmailContent(
  value
) {

  if (
    !EMAIL_SECURITY_CONFIG
      .BLOCK_SENSITIVE_CONTENT
  ) {

    return false;

  }


  if (!value) {

    return false;

  }


  const text =
    String(value)
      .toLowerCase();


  const sensitivePatterns = [

    "password=",

    "password:",

    "password is",

    "passcode=",

    "passcode:",

    "verification code=",

    "verification code:",

    "reset code=",

    "reset code:",

    "otp=",

    "otp:",

    "secret=",

    "secret:",

    "token=",

    "private key"

  ];


  for (
    let i = 0;
    i < sensitivePatterns.length;
    i++
  ) {

    if (
      text.indexOf(
        sensitivePatterns[i]
      ) !== -1
    ) {

      return true;

    }

  }


  return false;

}


// =====================================================
// REDACT SENSITIVE VALUE
// =====================================================

function redactEmailSecurityValue(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  if (
    !EMAIL_SECURITY_CONFIG
      .REDACT_SENSITIVE_DATA
  ) {

    return String(value);

  }


  let text =
    String(value);


  // Password values
  text =
    text.replace(
      /(password|passcode|secret|token)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]"
    );


  // OTP / verification codes
  text =
    text.replace(
      /(otp|verification\s+code|reset\s+code)\s*[:=]\s*\d+/gi,
      "$1=[REDACTED]"
    );


  return text;

}


// =====================================================
// CREATE SECURITY LOG
// =====================================================

function logEmailSecurityEvent(
  event,
  data
) {

  if (
    !EMAIL_SECURITY_CONFIG
      .LOG_SECURITY_EVENTS
  ) {

    return null;

  }


  data =
    data || {};


  const sheet =
    getEmailSecuritySheet();


  const logId =
    generateEmailSecurityLogId();


  const metadata =
    redactEmailSecurityValue(
      data.metadata || ""
    );


  sheet.appendRow([

    logId,

    event ||
      EMAIL_SECURITY_EVENTS
        .SUSPICIOUS_REQUEST,

    data.userId ||
      "",

    data.email ||
      "",

    data.ipAddress ||
      "",

    data.deviceId ||
      "",

    data.action ||
      "",

    redactEmailSecurityValue(
      data.reason || ""
    ),

    new Date(),

    data.createdBy ||
      "SYSTEM",

    metadata

  ]);


  return logId;

}


// =====================================================
// CHECK RATE LIMIT
// =====================================================

function checkEmailRateLimit(
  key,
  maxAttempts
) {

  if (!key) {

    return {

      allowed:
        false,

      reason:
        "Rate-limit key is required"

    };

  }


  const cache =
    CacheService
      .getScriptCache();


  const cacheKey =
    "EMAIL_RATE_" +
    Utilities
      .base64EncodeWebSafe(
        String(key)
      )
      .substring(0, 80);


  const existing =
    cache.get(
      cacheKey
    );


  const attempts =
    existing
      ? Number(existing)
      : 0;


  if (
    attempts >=
    maxAttempts
  ) {

    return {

      allowed:
        false,

      attempts:
        attempts,

      remaining:
        0,

      reason:
        EMAIL_SECURITY_EVENTS
          .RATE_LIMIT

    };

  }


  cache.put(
    cacheKey,
    String(
      attempts + 1
    ),
    Math.ceil(
      EMAIL_SECURITY_CONFIG
        .RATE_LIMIT_WINDOW_MS /
      1000
    )
  );


  return {

    allowed:
      true,

    attempts:
      attempts + 1,

    remaining:
      Math.max(
        0,
        maxAttempts -
        (attempts + 1)
      )

  };

}


// =====================================================
// CHECK USER EMAIL RATE LIMIT
// =====================================================

function checkUserEmailRateLimit(
  userId
) {

  if (!userId) {

    return {

      allowed:
        false,

      reason:
        "User ID is required"

    };

  }


  return checkEmailRateLimit(
    "USER:" + userId,
    EMAIL_SECURITY_CONFIG
      .MAX_USER_EMAILS_PER_HOUR
  );

}


// =====================================================
// CHECK IP EMAIL RATE LIMIT
// =====================================================

function checkIpEmailRateLimit(
  ipAddress
) {

  if (!ipAddress) {

    return {

      allowed:
        true,

      reason:
        "IP address unavailable"

    };

  }


  return checkEmailRateLimit(
    "IP:" + ipAddress,
    EMAIL_SECURITY_CONFIG
      .MAX_IP_EMAILS_PER_HOUR
  );

}


// =====================================================
// CHECK BROADCAST SECURITY
// =====================================================

function validateBroadcastSecurity(
  recipients
) {

  if (
    !Array.isArray(
      recipients
    )
  ) {

    return {

      valid:
        false,

      reason:
        "Recipients must be an array"

    };

  }


  if (
    recipients.length >
    EMAIL_SECURITY_CONFIG
      .MAX_BROADCAST_RECIPIENTS
  ) {

    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .BROADCAST_LIMIT

    };

  }


  return {

    valid:
      true,

    count:
      recipients.length

  };

}


// =====================================================
// AUTHORIZE EMAIL OPERATION
// =====================================================

function authorizeEmailOperation(
  operation,
  user
) {

  user =
    user || {};


  // ---------------------------------------------------
  // Public operations
  // ---------------------------------------------------

  const publicOperations = [

    "verification",

    "passwordReset",

    "welcome"

  ];


  if (
    publicOperations.indexOf(
      operation
    ) !== -1
  ) {

    return true;

  }


  // ---------------------------------------------------
  // Admin-only operations
  // ---------------------------------------------------

  const adminOperations = [

    "broadcast",

    "admin",

    "bulk",

    "securityBroadcast"

  ];


  if (
    adminOperations.indexOf(
      operation
    ) !== -1
  ) {

    const role =
      String(
        user.role || ""
      ).toLowerCase();


    if (
      role !== "admin" &&
      role !== "superadmin"
    ) {

      logEmailSecurityEvent(
        EMAIL_SECURITY_EVENTS
          .UNAUTHORIZED,
        {

          userId:
            user.id ||
            user.userId,

          email:
            user.email,

          action:
            operation,

          reason:
            "Admin permission required"

        }
      );


      return false;

    }

  }


  return true;

}


// =====================================================
// VALIDATE EMAIL REQUEST
// =====================================================

function validateEmailSecurityRequest(
  request
) {

  request =
    request || {};


  // ---------------------------------------------------
  // Recipients
  // ---------------------------------------------------

  const recipientResult =
    validateEmailRecipientsSecurity(
      request.recipients ||
      []
    );


  if (
    !recipientResult.valid
  ) {

    logEmailSecurityEvent(
      EMAIL_SECURITY_EVENTS
        .INVALID_RECIPIENT,
      {

        userId:
          request.userId,

        email:
          request.email,

        ipAddress:
          request.ipAddress,

        reason:
          recipientResult.reason,

        metadata:
          {
            recipient:
              request.recipients
          }

      }
    );


    return {

      valid:
        false,

      reason:
        recipientResult.reason

    };

  }


  // ---------------------------------------------------
  // Subject
  // ---------------------------------------------------

  const subjectResult =
    validateEmailSubjectSecurity(
      request.subject
    );


  if (
    !subjectResult.valid
  ) {

    logEmailSecurityEvent(
      subjectResult.reason,
      {

        userId:
          request.userId,

        ipAddress:
          request.ipAddress,

        reason:
          subjectResult.reason

      }
    );


    return {

      valid:
        false,

      reason:
        subjectResult.reason

    };

  }


  // ---------------------------------------------------
  // Message
  // ---------------------------------------------------

  const messageResult =
    validateEmailMessageSecurity(
      request.message ||
      ""
    );


  if (
    !messageResult.valid
  ) {

    logEmailSecurityEvent(
      messageResult.reason,
      {

        userId:
          request.userId,

        ipAddress:
          request.ipAddress,

        reason:
          messageResult.reason

      }
    );


    return {

      valid:
        false,

      reason:
        messageResult.reason

    };

  }


  // ---------------------------------------------------
  // Sensitive data
  // ---------------------------------------------------

  if (
    containsSensitiveEmailContent(
      request.message
    )
  ) {

    logEmailSecurityEvent(
      EMAIL_SECURITY_EVENTS
        .SENSITIVE_CONTENT,
      {

        userId:
          request.userId,

        ipAddress:
          request.ipAddress,

        reason:
          "Sensitive content detected"

      }
    );


    return {

      valid:
        false,

      reason:
        EMAIL_SECURITY_EVENTS
          .SENSITIVE_CONTENT

    };

  }


  return {

    valid:
      true,

    recipients:
      recipientResult.recipients,

    subject:
      subjectResult.subject

  };

}


// =====================================================
// SECURE EMAIL REQUEST
// =====================================================

function secureEmailRequest(
  request
) {

  request =
    request || {};


  if (
    !isEmailSecurityEnabled()
  ) {

    return {

      allowed:
        true,

      request:
        request

    };

  }


  // ---------------------------------------------------
  // Validate request
  // ---------------------------------------------------

  const validation =
    validateEmailSecurityRequest(
      request
    );


  if (
    !validation.valid
  ) {

    return {

      allowed:
        false,

      reason:
        validation.reason

    };

  }


  // ---------------------------------------------------
  // User rate limit
  // ---------------------------------------------------

  if (
    request.userId
  ) {

    const userLimit =
      checkUserEmailRateLimit(
        request.userId
      );


    if (
      !userLimit.allowed
    ) {

      logEmailSecurityEvent(
        EMAIL_SECURITY_EVENTS
          .RATE_LIMIT,
        {

          userId:
            request.userId,

          ipAddress:
            request.ipAddress,

          reason:
            "User email rate limit exceeded"

        }
      );


      return {

        allowed:
          false,

        reason:
          EMAIL_SECURITY_EVENTS
            .RATE_LIMIT

      };

    }

  }


  // ---------------------------------------------------
  // IP rate limit
  // ---------------------------------------------------

  if (
    request.ipAddress
  ) {

    const ipLimit =
      checkIpEmailRateLimit(
        request.ipAddress
      );


    if (
      !ipLimit.allowed
    ) {

      logEmailSecurityEvent(
        EMAIL_SECURITY_EVENTS
          .RATE_LIMIT,
        {

          userId:
            request.userId,

          ipAddress:
            request.ipAddress,

          reason:
            "IP email rate limit exceeded"

        }
      );


      return {

        allowed:
          false,

        reason:
          EMAIL_SECURITY_EVENTS
            .RATE_LIMIT

      };

    }

  }


  return {

    allowed:
      true,

    request: {

      recipients:
        validation.recipients,

      subject:
        validation.subject,

      message:
        request.message ||
        "",

      htmlBody:
        request.htmlBody ||
        "",

      userId:
        request.userId ||
        "",

      ipAddress:
        request.ipAddress ||
        "",

      deviceId:
        request.deviceId ||
        ""

    }

  };

}


// =====================================================
// SECURITY WRAPPER FOR SEND
// =====================================================

function secureEmailSend(
  request
) {

  const secured =
    secureEmailRequest(
      request
    );


  if (
    !secured.allowed
  ) {

    throw new Error(
      "Email blocked: " +
      secured.reason
    );

  }


  if (
    typeof sendHtmlEmail ===
    "function"
  ) {

    return sendHtmlEmail(
      secured.request
    );

  }


  if (
    typeof sendEmail ===
    "function"
  ) {

    return sendEmail(
      secured.request
    );

  }


  throw new Error(
    "Email sending engine is unavailable"
  );

}


// =====================================================
// GET EMAIL SECURITY CONFIG
// =====================================================

function getEmailSecurityConfig() {

  return {

    enabled:
      EMAIL_SECURITY_CONFIG
        .ENABLED,

    maxUserEmailsPerHour:
      EMAIL_SECURITY_CONFIG
        .MAX_USER_EMAILS_PER_HOUR,

    maxIpEmailsPerHour:
      EMAIL_SECURITY_CONFIG
        .MAX_IP_EMAILS_PER_HOUR,

    maxBroadcastRecipients:
      EMAIL_SECURITY_CONFIG
        .MAX_BROADCAST_RECIPIENTS,

    maxRecipientsPerEmail:
      EMAIL_SECURITY_CONFIG
        .MAX_RECIPIENTS_PER_EMAIL,

    maxSubjectLength:
      EMAIL_SECURITY_CONFIG
        .MAX_SUBJECT_LENGTH,

    maxMessageLength:
      EMAIL_SECURITY_CONFIG
        .MAX_MESSAGE_LENGTH

  };

}


// =====================================================
// CLEAN OLD SECURITY LOGS
// =====================================================

function cleanupEmailSecurityLogs(
  days
) {

  const retentionDays =
    Number(
      days || 90
    );


  const cutoff =
    Date.now() -
    (
      retentionDays *
      24 *
      60 *
      60 *
      1000
    );


  const sheet =
    getEmailSecuritySheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return 0;

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_SECURITY_COLUMNS
          .METADATA
      )
      .getValues();


  let deleted =
    0;


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const created =
      new Date(
        values[i][
          EMAIL_SECURITY_COLUMNS
            .CREATED_DATE - 1
        ]
      ).getTime();


    if (
      !isNaN(created) &&
      created < cutoff
    ) {

      sheet.deleteRow(
        i + 2
      );

      deleted++;

    }

  }


  return deleted;

}