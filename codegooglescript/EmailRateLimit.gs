// =====================================================
// EMAILRATELIMIT.GS
// Email Rate Limiting & Abuse Protection
// Registration System API
// =====================================================


// =====================================================
// RATE LIMIT CONFIGURATION
// =====================================================

const EMAIL_RATE_LIMIT_CONFIG = {

  ENABLED: true,

  // Time window
  WINDOW_SECONDS: 3600,

  // General limits
  GLOBAL_PER_HOUR: 500,

  // Per user
  USER_PER_HOUR: 20,

  // Per email address
  RECIPIENT_PER_HOUR: 10,

  // Per IP address
  IP_PER_HOUR: 50,

  // Verification emails
  VERIFICATION_PER_HOUR: 5,

  // Password reset requests
  PASSWORD_RESET_PER_HOUR: 5,

  // Login/security alerts
  SECURITY_ALERT_PER_HOUR: 20,

  // Notifications
  NOTIFICATION_PER_HOUR: 50,

  // Broadcasts
  BROADCAST_PER_HOUR: 2,

  // Retry protection
  MAX_RETRIES_PER_EMAIL: 3

};


// =====================================================
// RATE LIMIT TYPES
// =====================================================

const EMAIL_RATE_LIMIT_TYPES = {

  GLOBAL:
    "GLOBAL",

  USER:
    "USER",

  RECIPIENT:
    "RECIPIENT",

  IP:
    "IP",

  VERIFICATION:
    "VERIFICATION",

  PASSWORD_RESET:
    "PASSWORD_RESET",

  SECURITY_ALERT:
    "SECURITY_ALERT",

  NOTIFICATION:
    "NOTIFICATION",

  BROADCAST:
    "BROADCAST"

};


// =====================================================
// RATE LIMIT CACHE PREFIX
// =====================================================

const EMAIL_RATE_LIMIT_PREFIX =
  "EMAIL_RL_";


// =====================================================
// GENERATE RATE LIMIT KEY
// =====================================================

function generateEmailRateLimitKey(
  type,
  identifier
) {

  if (!type) {

    throw new Error(
      "Rate limit type is required"
    );

  }


  if (
    identifier === null ||
    identifier === undefined ||
    identifier === ""
  ) {

    throw new Error(
      "Rate limit identifier is required"
    );

  }


  const normalizedIdentifier =
    String(identifier)
      .trim()
      .toLowerCase();


  const rawKey =
    EMAIL_RATE_LIMIT_PREFIX +
    type +
    "_" +
    normalizedIdentifier;


  return Utilities
    .base64EncodeWebSafe(
      rawKey
    )
    .substring(0, 240);

}


// =====================================================
// GET CACHE
// =====================================================

function getEmailRateLimitCache() {

  return CacheService
    .getScriptCache();

}


// =====================================================
// GET CURRENT COUNT
// =====================================================

function getEmailRateLimitCount(
  type,
  identifier
) {

  const key =
    generateEmailRateLimitKey(
      type,
      identifier
    );


  const cache =
    getEmailRateLimitCache();


  const value =
    cache.get(key);


  if (!value) {

    return 0;

  }


  const count =
    Number(value);


  if (
    !isFinite(count) ||
    count < 0
  ) {

    return 0;

  }


  return count;

}


// =====================================================
// INCREMENT COUNT
// =====================================================

function incrementEmailRateLimit(
  type,
  identifier
) {

  const key =
    generateEmailRateLimitKey(
      type,
      identifier
    );


  const cache =
    getEmailRateLimitCache();


  const current =
    getEmailRateLimitCount(
      type,
      identifier
    );


  const next =
    current + 1;


  cache.put(
    key,
    String(next),
    EMAIL_RATE_LIMIT_CONFIG
      .WINDOW_SECONDS
  );


  return next;

}


// =====================================================
// CHECK LIMIT
// =====================================================

function checkEmailRateLimitLimit(
  type,
  identifier,
  maximum
) {

  if (
    !EMAIL_RATE_LIMIT_CONFIG
      .ENABLED
  ) {

    return {

      allowed:
        true,

      count:
        0,

      limit:
        maximum,

      remaining:
        maximum

    };

  }


  const limit =
    Number(maximum);


  if (
    !isFinite(limit) ||
    limit < 1
  ) {

    throw new Error(
      "Invalid email rate limit"
    );

  }


  const count =
    getEmailRateLimitCount(
      type,
      identifier
    );


  return {

    allowed:
      count < limit,

    count:
      count,

    limit:
      limit,

    remaining:
      Math.max(
        0,
        limit - count
      ),

    resetSeconds:
      EMAIL_RATE_LIMIT_CONFIG
        .WINDOW_SECONDS

  };

}


// =====================================================
// CONSUME RATE LIMIT
// =====================================================

function consumeEmailRateLimit(
  type,
  identifier,
  maximum
) {

  const check =
    checkEmailRateLimitLimit(
      type,
      identifier,
      maximum
    );


  if (
    !check.allowed
  ) {

    return {

      allowed:
        false,

      count:
        check.count,

      limit:
        check.limit,

      remaining:
        0,

      reason:
        "Email rate limit exceeded"

    };

  }


  const count =
    incrementEmailRateLimit(
      type,
      identifier
    );


  return {

    allowed:
      true,

    count:
      count,

    limit:
      check.limit,

    remaining:
      Math.max(
        0,
        check.limit - count
      )

  };

}


// =====================================================
// GLOBAL RATE LIMIT
// =====================================================

function consumeGlobalEmailRateLimit() {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES.GLOBAL,
    "ALL",
    EMAIL_RATE_LIMIT_CONFIG
      .GLOBAL_PER_HOUR
  );

}


// =====================================================
// USER RATE LIMIT
// =====================================================

function consumeUserEmailRateLimit(
  userId
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES.USER,
    userId,
    EMAIL_RATE_LIMIT_CONFIG
      .USER_PER_HOUR
  );

}


// =====================================================
// RECIPIENT RATE LIMIT
// =====================================================

function consumeRecipientEmailRateLimit(
  email
) {

  const normalized =
    String(email || "")
      .trim()
      .toLowerCase();


  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES.RECIPIENT,
    normalized,
    EMAIL_RATE_LIMIT_CONFIG
      .RECIPIENT_PER_HOUR
  );

}


// =====================================================
// IP RATE LIMIT
// =====================================================

function consumeIpEmailRateLimit(
  ipAddress
) {

  if (!ipAddress) {

    return {

      allowed:
        true,

      skipped:
        true

    };

  }


  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES.IP,
    ipAddress,
    EMAIL_RATE_LIMIT_CONFIG
      .IP_PER_HOUR
  );

}


// =====================================================
// VERIFICATION RATE LIMIT
// =====================================================

function consumeVerificationEmailRateLimit(
  identifier
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES
      .VERIFICATION,
    identifier,
    EMAIL_RATE_LIMIT_CONFIG
      .VERIFICATION_PER_HOUR
  );

}


// =====================================================
// PASSWORD RESET RATE LIMIT
// =====================================================

function consumePasswordResetEmailRateLimit(
  identifier
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES
      .PASSWORD_RESET,
    identifier,
    EMAIL_RATE_LIMIT_CONFIG
      .PASSWORD_RESET_PER_HOUR
  );

}


// =====================================================
// SECURITY ALERT RATE LIMIT
// =====================================================

function consumeSecurityAlertEmailRateLimit(
  userId
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES
      .SECURITY_ALERT,
    userId,
    EMAIL_RATE_LIMIT_CONFIG
      .SECURITY_ALERT_PER_HOUR
  );

}


// =====================================================
// NOTIFICATION RATE LIMIT
// =====================================================

function consumeNotificationEmailRateLimit(
  userId
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES
      .NOTIFICATION,
    userId,
    EMAIL_RATE_LIMIT_CONFIG
      .NOTIFICATION_PER_HOUR
  );

}


// =====================================================
// BROADCAST RATE LIMIT
// =====================================================

function consumeBroadcastEmailRateLimit(
  adminId
) {

  return consumeEmailRateLimit(
    EMAIL_RATE_LIMIT_TYPES
      .BROADCAST,
    adminId,
    EMAIL_RATE_LIMIT_CONFIG
      .BROADCAST_PER_HOUR
  );

}


// =====================================================
// CHECK COMPLETE SEND LIMIT
// =====================================================

function checkCompleteEmailRateLimit(
  data
) {

  data =
    data || {};


  const results = {

    allowed:
      true,

    checks:
      [],

    failures:
      []

  };


  // ---------------------------------------------------
  // Global
  // ---------------------------------------------------

  const global =
    consumeGlobalEmailRateLimit();


  results.checks.push({
    type:
      EMAIL_RATE_LIMIT_TYPES.GLOBAL,

    result:
      global

  });


  if (
    !global.allowed
  ) {

    results.allowed =
      false;

    results.failures.push(
      "Global email limit exceeded"
    );

  }


  // ---------------------------------------------------
  // User
  // ---------------------------------------------------

  if (
    data.userId
  ) {

    const user =
      consumeUserEmailRateLimit(
        data.userId
      );


    results.checks.push({
      type:
        EMAIL_RATE_LIMIT_TYPES.USER,

      result:
        user

    });


    if (
      !user.allowed
    ) {

      results.allowed =
        false;

      results.failures.push(
        "User email limit exceeded"
      );

    }

  }


  // ---------------------------------------------------
  // IP
  // ---------------------------------------------------

  if (
    data.ipAddress
  ) {

    const ip =
      consumeIpEmailRateLimit(
        data.ipAddress
      );


    results.checks.push({
      type:
        EMAIL_RATE_LIMIT_TYPES.IP,

      result:
        ip

    });


    if (
      !ip.allowed
    ) {

      results.allowed =
        false;

      results.failures.push(
        "IP email limit exceeded"
      );

    }

  }


  // ---------------------------------------------------
  // Recipient
  // ---------------------------------------------------

  if (
    data.email
  ) {

    const recipient =
      consumeRecipientEmailRateLimit(
        data.email
      );


    results.checks.push({
      type:
        EMAIL_RATE_LIMIT_TYPES.RECIPIENT,

      result:
        recipient

    });


    if (
      !recipient.allowed
    ) {

      results.allowed =
        false;

      results.failures.push(
        "Recipient email limit exceeded"
      );

    }

  }


  return results;

}


// =====================================================
// RATE LIMIT BY EMAIL TYPE
// =====================================================

function checkEmailTypeRateLimit(
  type,
  identifier
) {

  let limit;


  switch (
    type
  ) {

    case EMAIL_TYPES.VERIFICATION:

      limit =
        EMAIL_RATE_LIMIT_CONFIG
          .VERIFICATION_PER_HOUR;

      type =
        EMAIL_RATE_LIMIT_TYPES
          .VERIFICATION;

      break;


    case EMAIL_TYPES.PASSWORD_RESET:

      limit =
        EMAIL_RATE_LIMIT_CONFIG
          .PASSWORD_RESET_PER_HOUR;

      type =
        EMAIL_RATE_LIMIT_TYPES
          .PASSWORD_RESET;

      break;


    case EMAIL_TYPES.SECURITY_ALERT:

      limit =
        EMAIL_RATE_LIMIT_CONFIG
          .SECURITY_ALERT_PER_HOUR;

      type =
        EMAIL_RATE_LIMIT_TYPES
          .SECURITY_ALERT;

      break;


    case EMAIL_TYPES.NOTIFICATION:

      limit =
        EMAIL_RATE_LIMIT_CONFIG
          .NOTIFICATION_PER_HOUR;

      type =
        EMAIL_RATE_LIMIT_TYPES
          .NOTIFICATION;

      break;


    case EMAIL_TYPES.BULK:

      limit =
        EMAIL_RATE_LIMIT_CONFIG
          .BROADCAST_PER_HOUR;

      type =
        EMAIL_RATE_LIMIT_TYPES
          .BROADCAST;

      break;


    default:

      return {

        allowed:
          true,

        skipped:
          true

      };

  }


  return consumeEmailRateLimit(
    type,
    identifier,
    limit
  );

}


// =====================================================
// SECURE EMAIL RATE LIMIT CHECK
// =====================================================

function enforceEmailRateLimit(
  data
) {

  data =
    data || {};


  const identifier =
    data.userId ||
    data.email ||
    data.ipAddress ||
    "anonymous";


  const result =
    checkCompleteEmailRateLimit({

      userId:
        data.userId,

      email:
        data.email,

      ipAddress:
        data.ipAddress

    });


  if (
    data.type
  ) {

    const typeResult =
      checkEmailTypeRateLimit(
        data.type,
        identifier
      );


    result.checks.push({
      type:
        data.type,

      result:
        typeResult

    });


    if (
      !typeResult.allowed
    ) {

      result.allowed =
        false;

      result.failures.push(
        "Email type rate limit exceeded"
      );

    }

  }


  if (
    !result.allowed
  ) {

    if (
      typeof logEmailSecurityEvent ===
      "function"
    ) {

      logEmailSecurityEvent(
        EMAIL_SECURITY_EVENTS
          .RATE_LIMIT,
        {

          userId:
            data.userId,

          email:
            data.email,

          ipAddress:
            data.ipAddress,

          action:
            "sendEmail",

          reason:
            result.failures
              .join("; ")

        }
      );

    }

  }


  return result;

}


// =====================================================
// RESET RATE LIMIT
// =====================================================

function resetEmailRateLimit(
  type,
  identifier
) {

  const key =
    generateEmailRateLimitKey(
      type,
      identifier
    );


  getEmailRateLimitCache()
    .remove(
      key
    );


  return {

    success:
      true,

    type:
      type,

    identifier:
      identifier

  };

}


// =====================================================
// GET RATE LIMIT STATUS
// =====================================================

function getEmailRateLimitStatus(
  type,
  identifier,
  maximum
) {

  return checkEmailRateLimitLimit(
    type,
    identifier,
    maximum
  );

}


// =====================================================
// GET USER RATE LIMIT STATUS
// =====================================================

function getUserEmailRateLimitStatus(
  userId
) {

  return getEmailRateLimitStatus(
    EMAIL_RATE_LIMIT_TYPES.USER,
    userId,
    EMAIL_RATE_LIMIT_CONFIG
      .USER_PER_HOUR
  );

}


// =====================================================
// GET IP RATE LIMIT STATUS
// =====================================================

function getIpEmailRateLimitStatus(
  ipAddress
) {

  return getEmailRateLimitStatus(
    EMAIL_RATE_LIMIT_TYPES.IP,
    ipAddress,
    EMAIL_RATE_LIMIT_CONFIG
      .IP_PER_HOUR
  );

}


// =====================================================
// GET EMAIL RATE LIMIT CONFIG
// =====================================================

function getEmailRateLimitConfig() {

  return {

    enabled:
      EMAIL_RATE_LIMIT_CONFIG
        .ENABLED,

    windowSeconds:
      EMAIL_RATE_LIMIT_CONFIG
        .WINDOW_SECONDS,

    globalPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .GLOBAL_PER_HOUR,

    userPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .USER_PER_HOUR,

    recipientPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .RECIPIENT_PER_HOUR,

    ipPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .IP_PER_HOUR,

    verificationPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .VERIFICATION_PER_HOUR,

    passwordResetPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .PASSWORD_RESET_PER_HOUR,

    securityAlertPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .SECURITY_ALERT_PER_HOUR,

    notificationPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .NOTIFICATION_PER_HOUR,

    broadcastPerHour:
      EMAIL_RATE_LIMIT_CONFIG
        .BROADCAST_PER_HOUR

  };

}