// =====================================================
// EMAILNOTIFICATIONS.GS
// Email Notification System
// Registration System API
// =====================================================


// =====================================================
// NOTIFICATION CONFIGURATION
// =====================================================

const EMAIL_NOTIFICATION_CONFIG = {

  ENABLED: true,

  SEND_WELCOME_EMAIL: true,

  SEND_LOGIN_ALERTS: true,

  SEND_SECURITY_ALERTS: true,

  SEND_DEPOSIT_ALERTS: true,

  SEND_WITHDRAWAL_ALERTS: true,

  SEND_ADMIN_ALERTS: true,

  LOG_NOTIFICATIONS: true,

  MAX_RECIPIENTS: 100

};


// =====================================================
// NOTIFICATION TYPES
// =====================================================

const EMAIL_NOTIFICATION_TYPES = {

  WELCOME:
    "Welcome",

  LOGIN:
    "Login Alert",

  SECURITY:
    "Security Alert",

  DEPOSIT:
    "Deposit",

  WITHDRAWAL:
    "Withdrawal",

  ADMIN:
    "Admin",

  ACCOUNT:
    "Account",

  SYSTEM:
    "System",

  GENERAL:
    "Notification"

};


// =====================================================
// NOTIFICATION PRIORITIES
// =====================================================

const EMAIL_NOTIFICATION_PRIORITIES = {

  LOW:
    "Low",

  NORMAL:
    "Normal",

  HIGH:
    "High",

  CRITICAL:
    "Critical"

};


// =====================================================
// NOTIFICATION CHANNELS
// =====================================================

const EMAIL_NOTIFICATION_CHANNELS = {

  EMAIL:
    "Email",

  DASHBOARD:
    "Dashboard",

  BOTH:
    "Both"

};


// =====================================================
// GET NOTIFICATION CONFIG
// =====================================================

function getEmailNotificationConfig() {

  return {

    enabled:
      EMAIL_NOTIFICATION_CONFIG.ENABLED,

    welcome:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_WELCOME_EMAIL,

    loginAlerts:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_LOGIN_ALERTS,

    securityAlerts:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_SECURITY_ALERTS,

    depositAlerts:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_DEPOSIT_ALERTS,

    withdrawalAlerts:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_WITHDRAWAL_ALERTS,

    adminAlerts:
      EMAIL_NOTIFICATION_CONFIG
        .SEND_ADMIN_ALERTS

  };

}


// =====================================================
// VALIDATE NOTIFICATION TYPE
// =====================================================

function isValidEmailNotificationType(
  type
) {

  return Object
    .values(
      EMAIL_NOTIFICATION_TYPES
    )
    .indexOf(type) !== -1;

}


// =====================================================
// VALIDATE PRIORITY
// =====================================================

function isValidEmailNotificationPriority(
  priority
) {

  return Object
    .values(
      EMAIL_NOTIFICATION_PRIORITIES
    )
    .indexOf(priority) !== -1;

}


// =====================================================
// CHECK NOTIFICATION ENABLED
// =====================================================

function isEmailNotificationEnabled(
  type
) {

  if (
    !EMAIL_NOTIFICATION_CONFIG.ENABLED
  ) {

    return false;

  }


  switch (type) {

    case EMAIL_NOTIFICATION_TYPES.WELCOME:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_WELCOME_EMAIL
      );


    case EMAIL_NOTIFICATION_TYPES.LOGIN:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_LOGIN_ALERTS
      );


    case EMAIL_NOTIFICATION_TYPES.SECURITY:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_SECURITY_ALERTS
      );


    case EMAIL_NOTIFICATION_TYPES.DEPOSIT:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_DEPOSIT_ALERTS
      );


    case EMAIL_NOTIFICATION_TYPES.WITHDRAWAL:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_WITHDRAWAL_ALERTS
      );


    case EMAIL_NOTIFICATION_TYPES.ADMIN:

      return (
        EMAIL_NOTIFICATION_CONFIG
          .SEND_ADMIN_ALERTS
      );


    default:

      return true;

  }

}


// =====================================================
// NORMALIZE RECIPIENT
// =====================================================

function normalizeNotificationEmail(
  email
) {

  if (!email) {

    return "";

  }


  return String(email)
    .trim()
    .toLowerCase();

}


// =====================================================
// VALIDATE RECIPIENT
// =====================================================

function isValidNotificationEmail(
  email
) {

  if (!email) {

    return false;

  }


  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      normalizeNotificationEmail(
        email
      )
    );

}


// =====================================================
// GET USER EMAIL
// =====================================================

function getNotificationUserEmail(
  userId
) {

  if (!userId) {

    return "";

  }


  // ---------------------------------------------------
  // Use project helper if available
  // ---------------------------------------------------

  if (
    typeof getUser ===
    "function"
  ) {

    try {

      const user =
        getUser(
          userId
        );


      if (
        user &&
        user.email
      ) {

        return normalizeNotificationEmail(
          user.email
        );

      }

    } catch (error) {

      console.error(
        error.message
      );

    }

  }


  // ---------------------------------------------------
  // Fallback USERS sheet
  // ---------------------------------------------------

  try {

    const sheet =
      getSheet(
        SHEETS.USERS ||
        "USERS"
      );


    const lastRow =
      sheet.getLastRow();


    if (
      lastRow <= 1
    ) {

      return "";

    }


    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          sheet.getLastColumn()
        )
        .getValues();


    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      if (
        String(
          values[i][0]
        ) ===
        String(userId)
      ) {

        return normalizeNotificationEmail(
          values[i][2]
        );

      }

    }

  } catch (error) {

    console.error(
      error.message
    );

  }


  return "";

}


// =====================================================
// GET USER NOTIFICATION PREFERENCE
// =====================================================

function getUserEmailNotificationPreference(
  userId,
  type
) {

  /*
   * If a dedicated preferences system exists,
   * use it.
   */

  if (
    typeof getNotificationPreference ===
    "function"
  ) {

    try {

      return getNotificationPreference(
        userId,
        type
      );

    } catch (error) {

      console.error(
        error.message
      );

    }

  }


  // Default: enabled

  return true;

}


// =====================================================
// SHOULD SEND USER NOTIFICATION
// =====================================================

function shouldSendUserEmailNotification(
  userId,
  type
) {

  if (
    !isEmailNotificationEnabled(
      type
    )
  ) {

    return false;

  }


  return getUserEmailNotificationPreference(
    userId,
    type
  ) === true;

}


// =====================================================
// PREPARE NOTIFICATION VARIABLES
// =====================================================

function prepareNotificationVariables(
  data
) {

  data =
    data || {};


  return {

    userId:
      data.userId ||
      "",

    username:
      data.username ||
      "",

    email:
      data.email ||
      "",

    siteName:
      data.siteName ||
      "CodingFamilySlop",

    date:
      data.date ||
      new Date(),

    ipAddress:
      data.ipAddress ||
      "",

    deviceId:
      data.deviceId ||
      "",

    amount:
      data.amount ||
      "",

    currency:
      data.currency ||
      "GYD",

    transactionId:
      data.transactionId ||
      "",

    transactionType:
      data.transactionType ||
      "",

    status:
      data.status ||
      "",

    reason:
      data.reason ||
      "",

    message:
      data.message ||
      "",

    actionUrl:
      data.actionUrl ||
      ""

  };

}


// =====================================================
// SEND USER NOTIFICATION
// =====================================================

function sendUserEmailNotification(
  userId,
  type,
  subject,
  message,
  htmlBody,
  options
) {

  options =
    options || {};


  if (
    !shouldSendUserEmailNotification(
      userId,
      type
    )
  ) {

    return {

      success:
        false,

      skipped:
        true,

      reason:
        "Notification disabled"

    };

  }


  const email =
    normalizeNotificationEmail(
      options.email ||
      getNotificationUserEmail(
        userId
      )
    );


  if (
    !isValidNotificationEmail(
      email
    )
  ) {

    throw new Error(
      "User email address is invalid"
    );

  }


  const priority =
    isValidEmailNotificationPriority(
      options.priority
    )
      ? options.priority
      : EMAIL_NOTIFICATION_PRIORITIES
          .NORMAL;


  const notificationData = {

    emailId:
      typeof generateEmailId ===
      "function"
        ? generateEmailId()
        : "NOTIFY-" +
          Utilities.getUuid()
            .substring(0, 8)
            .toUpperCase(),

    userId:
      userId,

    email:
      email,

    type:
      type,

    subject:
      subject,

    message:
      message,

    htmlBody:
      htmlBody,

    priority:
      priority

  };


  // ---------------------------------------------------
  // QUEUE EMAIL
  // ---------------------------------------------------

  let result;


  if (
    typeof queueEmail ===
    "function"
  ) {

    result =
      queueEmail({

        emailId:
          notificationData.emailId,

        userId:
          userId,

        recipients:
          [email],

        subject:
          subject,

        message:
          message,

        htmlBody:
          htmlBody,

        type:
          type,

        priority:
          priority,

        createdBy:
          options.createdBy ||
          "EMAIL_NOTIFICATIONS"

      });

  } else if (
    typeof sendHtmlEmail ===
    "function"
  ) {

    result =
      sendHtmlEmail({

        to:
          email,

        subject:
          subject,

        message:
          message,

        htmlBody:
          htmlBody

      });

  } else {

    throw new Error(
      "No email sending engine is available"
    );

  }


  return {

    success:
      true,

    emailId:
      notificationData.emailId,

    userId:
      userId,

    email:
      email,

    type:
      type,

    priority:
      priority,

    result:
      result

  };

}


// =====================================================
// WELCOME EMAIL
// =====================================================

function sendWelcomeEmail(
  userId,
  userData
) {

  userData =
    userData || {};


  if (
    !EMAIL_NOTIFICATION_CONFIG
      .SEND_WELCOME_EMAIL
  ) {

    return {

      success:
        false,

      skipped:
        true

    };

  }


  const email =
    normalizeNotificationEmail(
      userData.email ||
      getNotificationUserEmail(
        userId
      )
    );


  const username =
    userData.username ||
    "User";


  const siteName =
    userData.siteName ||
    "CodingFamilySlop";


  const subject =
    "Welcome to " +
    siteName;


  const message =
    "Hello " +
    username +
    ",\n\n" +
    "Welcome to " +
    siteName +
    ". Your account has been created successfully.";


  const htmlBody =
    "<h2>Welcome to " +
    siteName +
    "</h2>" +

    "<p>Hello " +
    escapeNotificationHtml(
      username
    ) +
    ",</p>" +

    "<p>Your account has been created successfully.</p>" +

    "<p>Thank you for joining us.</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.WELCOME,
    subject,
    message,
    htmlBody,
    {
      email:
        email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .NORMAL
    }
  );

}


// =====================================================
// LOGIN ALERT
// =====================================================

function sendLoginAlertEmail(
  userId,
  loginData
) {

  loginData =
    loginData || {};


  const variables =
    prepareNotificationVariables({

      userId:
        userId,

      username:
        loginData.username,

      email:
        loginData.email,

      ipAddress:
        loginData.ipAddress,

      deviceId:
        loginData.deviceId,

      date:
        loginData.date

    });


  const subject =
    "New login to your account";


  const message =
    "A new login was detected on your account.\n\n" +

    "Date: " +
    variables.date +
    "\n" +

    "IP Address: " +
    variables.ipAddress +
    "\n" +

    "Device ID: " +
    variables.deviceId;


  const htmlBody =
    "<h2>New Login Detected</h2>" +

    "<p>A new login was detected on your account.</p>" +

    "<p><strong>Date:</strong> " +
    escapeNotificationHtml(
      variables.date
    ) +
    "</p>" +

    "<p><strong>IP Address:</strong> " +
    escapeNotificationHtml(
      variables.ipAddress
    ) +
    "</p>" +

    "<p><strong>Device ID:</strong> " +
    escapeNotificationHtml(
      variables.deviceId
    ) +
    "</p>" +

    "<p>If this was not you, please secure your account immediately.</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.LOGIN,
    subject,
    message,
    htmlBody,
    {
      email:
        variables.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .HIGH
    }
  );

}


// =====================================================
// SECURITY ALERT
// =====================================================

function sendSecurityAlertEmail(
  userId,
  securityData
) {

  securityData =
    securityData || {};


  const variables =
    prepareNotificationVariables(
      securityData
    );


  const subject =
    securityData.subject ||
    "Security alert";


  const message =
    securityData.message ||
    (
      "A security event was detected on your account."
    );


  const htmlBody =
    "<h2>Security Alert</h2>" +

    "<p>" +
    escapeNotificationHtml(
      message
    ) +
    "</p>" +

    (
      variables.ipAddress
        ? "<p><strong>IP Address:</strong> " +
          escapeNotificationHtml(
            variables.ipAddress
          ) +
          "</p>"
        : ""
    ) +

    (
      variables.date
        ? "<p><strong>Date:</strong> " +
          escapeNotificationHtml(
            variables.date
          ) +
          "</p>"
        : ""
    );


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.SECURITY,
    subject,
    message,
    htmlBody,
    {
      email:
        variables.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .CRITICAL
    }
  );

}


// =====================================================
// DEPOSIT NOTIFICATION
// =====================================================

function sendDepositNotificationEmail(
  userId,
  depositData
) {

  depositData =
    depositData || {};


  const variables =
    prepareNotificationVariables({

      userId:
        userId,

      email:
        depositData.email,

      amount:
        depositData.amount,

      currency:
        depositData.currency,

      transactionId:
        depositData.transactionId,

      status:
        depositData.status,

      date:
        depositData.date,

      message:
        depositData.message

    });


  const subject =
    "Deposit " +
    (
      variables.status ||
      "notification"
    );


  const message =
    "A deposit transaction has been recorded.\n\n" +

    "Amount: " +
    variables.amount +
    " " +
    variables.currency +
    "\n" +

    "Status: " +
    variables.status +
    "\n" +

    "Transaction ID: " +
    variables.transactionId;


  const htmlBody =
    "<h2>Deposit Notification</h2>" +

    "<p><strong>Amount:</strong> " +
    escapeNotificationHtml(
      variables.amount
    ) +
    " " +
    escapeNotificationHtml(
      variables.currency
    ) +
    "</p>" +

    "<p><strong>Status:</strong> " +
    escapeNotificationHtml(
      variables.status
    ) +
    "</p>" +

    "<p><strong>Transaction ID:</strong> " +
    escapeNotificationHtml(
      variables.transactionId
    ) +
    "</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.DEPOSIT,
    subject,
    message,
    htmlBody,
    {
      email:
        variables.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .HIGH
    }
  );

}


// =====================================================
// WITHDRAWAL NOTIFICATION
// =====================================================

function sendWithdrawalNotificationEmail(
  userId,
  withdrawalData
) {

  withdrawalData =
    withdrawalData || {};


  const variables =
    prepareNotificationVariables({

      userId:
        userId,

      email:
        withdrawalData.email,

      amount:
        withdrawalData.amount,

      currency:
        withdrawalData.currency,

      transactionId:
        withdrawalData.transactionId,

      status:
        withdrawalData.status,

      date:
        withdrawalData.date,

      message:
        withdrawalData.message

    });


  const subject =
    "Withdrawal " +
    (
      variables.status ||
      "notification"
    );


  const message =
    "A withdrawal transaction has been recorded.\n\n" +

    "Amount: " +
    variables.amount +
    " " +
    variables.currency +
    "\n" +

    "Status: " +
    variables.status +
    "\n" +

    "Transaction ID: " +
    variables.transactionId;


  const htmlBody =
    "<h2>Withdrawal Notification</h2>" +

    "<p><strong>Amount:</strong> " +
    escapeNotificationHtml(
      variables.amount
    ) +
    " " +
    escapeNotificationHtml(
      variables.currency
    ) +
    "</p>" +

    "<p><strong>Status:</strong> " +
    escapeNotificationHtml(
      variables.status
    ) +
    "</p>" +

    "<p><strong>Transaction ID:</strong> " +
    escapeNotificationHtml(
      variables.transactionId
    ) +
    "</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.WITHDRAWAL,
    subject,
    message,
    htmlBody,
    {
      email:
        variables.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .HIGH
    }
  );

}


// =====================================================
// ADMIN NOTIFICATION TO USER
// =====================================================

function sendAdminNotificationEmail(
  userId,
  adminData
) {

  adminData =
    adminData || {};


  const variables =
    prepareNotificationVariables({

      userId:
        userId,

      email:
        adminData.email,

      message:
        adminData.message,

      date:
        adminData.date

    });


  const subject =
    adminData.subject ||
    "Message from Administration";


  const message =
    variables.message;


  const htmlBody =
    "<h2>Administration Message</h2>" +

    "<p>" +
    escapeNotificationHtml(
      message
    ) +
    "</p>" +

    "<p><strong>Date:</strong> " +
    escapeNotificationHtml(
      variables.date
    ) +
    "</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.ADMIN,
    subject,
    message,
    htmlBody,
    {
      email:
        variables.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .HIGH,

      createdBy:
        adminData.createdBy ||
        "ADMIN"

    }
  );

}


// =====================================================
// GENERIC SYSTEM NOTIFICATION
// =====================================================

function sendSystemNotificationEmail(
  userId,
  notificationData
) {

  notificationData =
    notificationData || {};


  const type =
    notificationData.type ||
    EMAIL_NOTIFICATION_TYPES.SYSTEM;


  const subject =
    notificationData.subject ||
    "System notification";


  const message =
    notificationData.message ||
    "";


  const htmlBody =
    notificationData.htmlBody ||
    (
      "<p>" +
      escapeNotificationHtml(
        message
      ) +
      "</p>"
    );


  return sendUserEmailNotification(
    userId,
    type,
    subject,
    message,
    htmlBody,
    {
      email:
        notificationData.email,

      priority:
        notificationData.priority ||
        EMAIL_NOTIFICATION_PRIORITIES
          .NORMAL,

      createdBy:
        notificationData.createdBy ||
        "SYSTEM"

    }
  );

}


// =====================================================
// SECURITY PASSWORD CHANGED
// =====================================================

function sendPasswordChangedNotificationEmail(
  userId,
  data
) {

  data =
    data || {};


  const subject =
    "Your password was changed";


  const message =
    "Your account password was changed successfully.\n\n" +
    "If you did not make this change, secure your account immediately.";


  const htmlBody =
    "<h2>Password Changed</h2>" +

    "<p>Your account password was changed successfully.</p>" +

    "<p><strong>If you did not make this change, secure your account immediately.</strong></p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.SECURITY,
    subject,
    message,
    htmlBody,
    {
      email:
        data.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .CRITICAL
    }
  );

}


// =====================================================
// ACCOUNT LOCKED
// =====================================================

function sendAccountLockedNotificationEmail(
  userId,
  data
) {

  data =
    data || {};


  const subject =
    "Your account has been locked";


  const message =
    "Your account has been temporarily locked because of suspicious or repeated failed login attempts.";


  const htmlBody =
    "<h2>Account Locked</h2>" +

    "<p>Your account has been temporarily locked.</p>" +

    "<p>This can happen after repeated failed login attempts.</p>" +

    "<p>If you believe this was not you, please contact support.</p>";


  return sendUserEmailNotification(
    userId,
    EMAIL_NOTIFICATION_TYPES.SECURITY,
    subject,
    message,
    htmlBody,
    {
      email:
        data.email,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .CRITICAL
    }
  );

}


// =====================================================
// EMAIL NOTIFICATION HTML ESCAPER
// =====================================================

function escapeNotificationHtml(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {

    return "";

  }


  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// =====================================================
// NOTIFICATION EVENT ROUTER
// =====================================================

function handleEmailNotificationEvent(
  eventType,
  userId,
  data
) {

  data =
    data || {};


  switch (
    eventType
  ) {

    case EMAIL_NOTIFICATION_TYPES
      .WELCOME:

      return sendWelcomeEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .LOGIN:

      return sendLoginAlertEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .SECURITY:

      return sendSecurityAlertEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .DEPOSIT:

      return sendDepositNotificationEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .WITHDRAWAL:

      return sendWithdrawalNotificationEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .ADMIN:

      return sendAdminNotificationEmail(
        userId,
        data
      );


    case EMAIL_NOTIFICATION_TYPES
      .SYSTEM:

      return sendSystemNotificationEmail(
        userId,
        data
      );


    default:

      throw new Error(
        "Unsupported email notification type: " +
        eventType
      );

  }

}


// =====================================================
// SEND SECURITY ALERT TO MULTIPLE USERS
// =====================================================

function broadcastSecurityNotificationEmail(
  userIds,
  subject,
  message,
  htmlBody,
  options
) {

  options =
    options || {};


  if (
    !Array.isArray(
      userIds
    )
  ) {

    throw new Error(
      "userIds must be an array"
    );

  }


  if (
    userIds.length >
    EMAIL_NOTIFICATION_CONFIG
      .MAX_RECIPIENTS
  ) {

    throw new Error(
      "Maximum notification recipients exceeded"
    );

  }


  const results =
    [];


  userIds.forEach(
    function(userId) {

      try {

        results.push(
          sendUserEmailNotification(
            userId,
            EMAIL_NOTIFICATION_TYPES
              .SECURITY,
            subject,
            message,
            htmlBody,
            options
          )
        );

      } catch (error) {

        results.push({

          success:
            false,

          userId:
            userId,

          error:
            error.message

        });

      }

    }
  );


  return {

    success:
      true,

    total:
      results.length,

    results:
      results

  };

}


// =====================================================
// TEST NOTIFICATION
// =====================================================

function testEmailNotification(
  email
) {

  const normalizedEmail =
    normalizeNotificationEmail(
      email
    );


  if (
    !isValidNotificationEmail(
      normalizedEmail
    )
  ) {

    throw new Error(
      "Invalid test email address"
    );

  }


  const subject =
    "Email notification test";


  const message =
    "This is a test notification from the email system.";


  const htmlBody =
    "<h2>Email System Test</h2>" +

    "<p>This is a test notification from your email system.</p>" +

    "<p>If you received this message, the email notification system is working.</p>";


  if (
    typeof queueEmail ===
    "function"
  ) {

    return queueEmail({

      emailId:
        "TEST-" +
        Utilities.getUuid()
          .substring(0, 8)
          .toUpperCase(),

      userId:
        "",

      recipients:
        [normalizedEmail],

      subject:
        subject,

      message:
        message,

      htmlBody:
        htmlBody,

      type:
        EMAIL_NOTIFICATION_TYPES
          .SYSTEM,

      priority:
        EMAIL_NOTIFICATION_PRIORITIES
          .NORMAL,

      createdBy:
        "EMAIL_NOTIFICATION_TEST"

    });

  }


  if (
    typeof sendHtmlEmail ===
    "function"
  ) {

    return sendHtmlEmail({

      to:
        normalizedEmail,

      subject:
        subject,

      message:
        message,

      htmlBody:
        htmlBody

    });

  }


  throw new Error(
    "No email sending engine is available"
  );

}