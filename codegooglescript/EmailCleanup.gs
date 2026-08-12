// =====================================================
// EMAILCLEANUP.GS
// Email Cleanup & Maintenance
// Registration System API
// =====================================================


// =====================================================
// CLEANUP CONFIGURATION
// =====================================================

const EMAIL_CLEANUP_CONFIG = {

  ENABLED: true,

  // How long completed email records are kept
  EMAIL_RETENTION_DAYS: 90,

  // How long email logs are kept
  LOG_RETENTION_DAYS: 90,

  // How long security logs are kept
  SECURITY_LOG_RETENTION_DAYS: 180,

  // How long failed queue records are kept
  FAILED_QUEUE_RETENTION_DAYS: 30,

  // How long cancelled queue records are kept
  CANCELLED_QUEUE_RETENTION_DAYS: 30,

  // Maximum rows deleted in one execution
  MAX_DELETE_PER_RUN: 500,

  // Never automatically delete these records
  PROTECT_FAILED:
    true,

  PROTECT_PENDING:
    true,

  PROTECT_PROCESSING:
    true,

  PROTECT_CRITICAL:
    true

};


// =====================================================
// CLEANUP STATUS
// =====================================================

const EMAIL_CLEANUP_STATUS = {

  SUCCESS:
    "Success",

  PARTIAL:
    "Partial",

  FAILED:
    "Failed",

  DISABLED:
    "Disabled"

};


// =====================================================
// GET CLEANUP CONFIG
// =====================================================

function getEmailCleanupConfig() {

  return {

    enabled:
      EMAIL_CLEANUP_CONFIG.ENABLED,

    emailRetentionDays:
      EMAIL_CLEANUP_CONFIG
        .EMAIL_RETENTION_DAYS,

    logRetentionDays:
      EMAIL_CLEANUP_CONFIG
        .LOG_RETENTION_DAYS,

    securityLogRetentionDays:
      EMAIL_CLEANUP_CONFIG
        .SECURITY_LOG_RETENTION_DAYS,

    failedQueueRetentionDays:
      EMAIL_CLEANUP_CONFIG
        .FAILED_QUEUE_RETENTION_DAYS,

    cancelledQueueRetentionDays:
      EMAIL_CLEANUP_CONFIG
        .CANCELLED_QUEUE_RETENTION_DAYS,

    maxDeletePerRun:
      EMAIL_CLEANUP_CONFIG
        .MAX_DELETE_PER_RUN

  };

}


// =====================================================
// CHECK CLEANUP ENABLED
// =====================================================

function isEmailCleanupEnabled() {

  return (
    EMAIL_CLEANUP_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// CALCULATE CUTOFF DATE
// =====================================================

function getEmailCleanupCutoffDate(
  days
) {

  const retentionDays =
    Number(days);


  if (
    !isFinite(retentionDays) ||
    retentionDays < 1
  ) {

    throw new Error(
      "Invalid retention period"
    );

  }


  return new Date(
    Date.now() -
    (
      retentionDays *
      24 *
      60 *
      60 *
      1000
    )
  );

}


// =====================================================
// CHECK DATE
// =====================================================

function isEmailCleanupExpired(
  value,
  cutoffDate
) {

  if (!value) {

    return false;

  }


  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return false;

  }


  return (
    date.getTime() <
    cutoffDate.getTime()
  );

}


// =====================================================
// CLEAN EMAIL RECORDS
// =====================================================

function cleanupEmailRecords(
  days
) {

  if (
    !isEmailCleanupEnabled()
  ) {

    return {

      status:
        EMAIL_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  const retentionDays =
    Number(
      days ||
      EMAIL_CLEANUP_CONFIG
        .EMAIL_RETENTION_DAYS
    );


  const cutoff =
    getEmailCleanupCutoffDate(
      retentionDays
    );


  const sheet =
    getEmailsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return {

      status:
        EMAIL_CLEANUP_STATUS
          .SUCCESS,

      deleted:
        0

    };

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_COLUMNS
          ? Math.max(
              ...Object.values(
                EMAIL_COLUMNS
              )
            )
          : sheet.getLastColumn()
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

    if (
      deleted >=
      EMAIL_CLEANUP_CONFIG
        .MAX_DELETE_PER_RUN
    ) {

      break;

    }


    const row =
      values[i];


    const status =
      row[
        EMAIL_COLUMNS.STATUS - 1
      ];


    const createdDate =
      row[
        EMAIL_COLUMNS.CREATED_DATE - 1
      ];


    // -------------------------------------------------
    // Protect active records
    // -------------------------------------------------

    if (
      status ===
      "Pending" &&
      EMAIL_CLEANUP_CONFIG
        .PROTECT_PENDING
    ) {

      continue;

    }


    if (
      status ===
      "Processing" &&
      EMAIL_CLEANUP_CONFIG
        .PROTECT_PROCESSING
    ) {

      continue;

    }


    if (
      status ===
      "Failed" &&
      EMAIL_CLEANUP_CONFIG
        .PROTECT_FAILED
    ) {

      continue;

    }


    if (
      isEmailCleanupExpired(
        createdDate,
        cutoff
      )
    ) {

      sheet.deleteRow(
        i + 2
      );

      deleted++;

    }

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    deleted:
      deleted,

    retentionDays:
      retentionDays

  };

}


// =====================================================
// CLEAN EMAIL LOGS
// =====================================================

function cleanupEmailLogs(
  days
) {

  const retentionDays =
    Number(
      days ||
      EMAIL_CLEANUP_CONFIG
        .LOG_RETENTION_DAYS
    );


  if (
    typeof cleanupOldEmailLogs ===
    "function"
  ) {

    const deleted =
      cleanupOldEmailLogs(
        retentionDays
      );


    return {

      status:
        EMAIL_CLEANUP_STATUS
          .SUCCESS,

      deleted:
        deleted,

      retentionDays:
        retentionDays

    };

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .FAILED,

    deleted:
      0,

    error:
      "cleanupOldEmailLogs() is unavailable"

  };

}


// =====================================================
// CLEAN SECURITY LOGS
// =====================================================

function cleanupEmailSecurityLogsSafe(
  days
) {

  const retentionDays =
    Number(
      days ||
      EMAIL_CLEANUP_CONFIG
        .SECURITY_LOG_RETENTION_DAYS
    );


  if (
    typeof cleanupEmailSecurityLogs ===
    "function"
  ) {

    const deleted =
      cleanupEmailSecurityLogs(
        retentionDays
      );


    return {

      status:
        EMAIL_CLEANUP_STATUS
          .SUCCESS,

      deleted:
        deleted,

      retentionDays:
        retentionDays

    };

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .FAILED,

    deleted:
      0,

    error:
      "cleanupEmailSecurityLogs() is unavailable"

  };

}


// =====================================================
// CLEAN FAILED QUEUE RECORDS
// =====================================================

function cleanupFailedEmailQueue(
  days
) {

  const retentionDays =
    Number(
      days ||
      EMAIL_CLEANUP_CONFIG
        .FAILED_QUEUE_RETENTION_DAYS
    );


  const cutoff =
    getEmailCleanupCutoffDate(
      retentionDays
    );


  // ---------------------------------------------------
  // Use EmailQueue helper when available
  // ---------------------------------------------------

  if (
    typeof cleanupEmailQueueRecords ===
    "function"
  ) {

    return cleanupEmailQueueRecords({

      status:
        "Failed",

      cutoffDate:
        cutoff,

      maxDelete:
        EMAIL_CLEANUP_CONFIG
          .MAX_DELETE_PER_RUN

    });

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .FAILED,

    deleted:
      0,

    error:
      "Email queue cleanup helper unavailable"

  };

}


// =====================================================
// CLEAN CANCELLED QUEUE RECORDS
// =====================================================

function cleanupCancelledEmailQueue(
  days
) {

  const retentionDays =
    Number(
      days ||
      EMAIL_CLEANUP_CONFIG
        .CANCELLED_QUEUE_RETENTION_DAYS
    );


  const cutoff =
    getEmailCleanupCutoffDate(
      retentionDays
    );


  if (
    typeof cleanupEmailQueueRecords ===
    "function"
  ) {

    return cleanupEmailQueueRecords({

      status:
        "Cancelled",

      cutoffDate:
        cutoff,

      maxDelete:
        EMAIL_CLEANUP_CONFIG
          .MAX_DELETE_PER_RUN

    });

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .FAILED,

    deleted:
      0,

    error:
      "Email queue cleanup helper unavailable"

  };

}


// =====================================================
// CLEAN EXPIRED VERIFICATION RECORDS
// =====================================================

function cleanupExpiredEmailVerificationRecords() {

  if (
    typeof cleanupEmailVerificationRecords ===
    "function"
  ) {

    return cleanupEmailVerificationRecords();

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    deleted:
      0,

    message:
      "Verification cleanup helper not configured"

  };

}


// =====================================================
// CLEAN EXPIRED PASSWORD RESET RECORDS
// =====================================================

function cleanupExpiredPasswordResetRecords() {

  if (
    typeof cleanupEmailPasswordResetRecords ===
    "function"
  ) {

    return cleanupEmailPasswordResetRecords();

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    deleted:
      0,

    message:
      "Password reset cleanup helper not configured"

  };

}


// =====================================================
// CLEAN ORPHANED EMAIL RECORDS
// =====================================================

function cleanupOrphanedEmailRecords() {

  const sheet =
    getEmailsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return {

      status:
        EMAIL_CLEANUP_STATUS
          .SUCCESS,

      deleted:
        0

    };

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_COLUMNS
          .CREATED_BY
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

    if (
      deleted >=
      EMAIL_CLEANUP_CONFIG
        .MAX_DELETE_PER_RUN
    ) {

      break;

    }


    const emailId =
      values[i][
        EMAIL_COLUMNS.ID - 1
      ];


    const email =
      values[i][
        EMAIL_COLUMNS.EMAIL - 1
      ];


    if (
      !emailId &&
      !email
    ) {

      sheet.deleteRow(
        i + 2
      );

      deleted++;

    }

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    deleted:
      deleted

  };

}


// =====================================================
// CLEAN DUPLICATE EMAIL LOG RECORDS
// =====================================================

function cleanupDuplicateEmailLogs() {

  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return {

      status:
        EMAIL_CLEANUP_STATUS
          .SUCCESS,

      deleted:
        0

    };

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_LOG_COLUMNS
          .METADATA
      )
      .getValues();


  const seen =
    {};


  let deleted =
    0;


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    if (
      deleted >=
      EMAIL_CLEANUP_CONFIG
        .MAX_DELETE_PER_RUN
    ) {

      break;

    }


    const logId =
      String(
        values[i][
          EMAIL_LOG_COLUMNS.ID - 1
        ] ||
        ""
      );


    if (
      !logId
    ) {

      sheet.deleteRow(
        i + 2
      );

      deleted++;

      continue;

    }


    if (
      seen[logId]
    ) {

      sheet.deleteRow(
        i + 2
      );

      deleted++;

    } else {

      seen[logId] =
        true;

    }

  }


  return {

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    deleted:
      deleted

  };

}


// =====================================================
// RUN EMAIL CLEANUP
// =====================================================

function runEmailCleanup() {

  if (
    !isEmailCleanupEnabled()
  ) {

    return {

      status:
        EMAIL_CLEANUP_STATUS
          .DISABLED,

      message:
        "Email cleanup is disabled"

    };

  }


  const results = {

    started:
      new Date(),

    status:
      EMAIL_CLEANUP_STATUS
        .SUCCESS,

    emails:
      null,

    logs:
      null,

    securityLogs:
      null,

    failedQueue:
      null,

    cancelledQueue:
      null,

    verification:
      null,

    passwordReset:
      null,

    orphaned:
      null

  };


  try {

    results.emails =
      cleanupEmailRecords();


  } catch (error) {

    results.emails = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.logs =
      cleanupEmailLogs();


  } catch (error) {

    results.logs = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.securityLogs =
      cleanupEmailSecurityLogsSafe();


  } catch (error) {

    results.securityLogs = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.failedQueue =
      cleanupFailedEmailQueue();


  } catch (error) {

    results.failedQueue = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.cancelledQueue =
      cleanupCancelledEmailQueue();


  } catch (error) {

    results.cancelledQueue = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.verification =
      cleanupExpiredEmailVerificationRecords();


  } catch (error) {

    results.verification = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.passwordReset =
      cleanupExpiredPasswordResetRecords();


  } catch (error) {

    results.passwordReset = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  try {

    results.orphaned =
      cleanupOrphanedEmailRecords();


  } catch (error) {

    results.orphaned = {

      status:
        EMAIL_CLEANUP_STATUS
          .FAILED,

      error:
        error.message

    };

  }


  results.finished =
    new Date();


  // ---------------------------------------------------
  // Detect partial failures
  // ---------------------------------------------------

  Object.keys(
    results
  ).forEach(
    function(key) {

      const value =
        results[key];


      if (
        value &&
        typeof value === "object" &&
        value.status ===
          EMAIL_CLEANUP_STATUS.FAILED
      ) {

        results.status =
          EMAIL_CLEANUP_STATUS
            .PARTIAL;

      }

    }
  );


  return results;

}


// =====================================================
// CREATE DAILY CLEANUP TRIGGER
// =====================================================

function createEmailCleanupTrigger() {

  const functionName =
    "runEmailCleanup";


  const triggers =
    ScriptApp
      .getProjectTriggers();


  // ---------------------------------------------------
  // Avoid duplicate triggers
  // ---------------------------------------------------

  for (
    let i = 0;
    i < triggers.length;
    i++
  ) {

    if (
      triggers[i]
        .getHandlerFunction() ===
      functionName
    ) {

      return {

        success:
          true,

        message:
          "Email cleanup trigger already exists"

      };

    }

  }


  ScriptApp
    .newTrigger(
      functionName
    )
    .timeBased()
    .everyDays(1)
    .atHour(3)
    .create();


  return {

    success:
      true,

    message:
      "Daily email cleanup trigger created"

  };

}


// =====================================================
// REMOVE CLEANUP TRIGGERS
// =====================================================

function removeEmailCleanupTriggers() {

  const triggers =
    ScriptApp
      .getProjectTriggers();


  let removed =
    0;


  triggers.forEach(
    function(trigger) {

      if (
        trigger
          .getHandlerFunction() ===
        "runEmailCleanup"
      ) {

        ScriptApp
          .deleteTrigger(
            trigger
          );

        removed++;

      }

    }
  );


  return {

    success:
      true,

    removed:
      removed

  };

}


// =====================================================
// EMAIL CLEANUP HEALTH CHECK
// =====================================================

function getEmailCleanupHealth() {

  const health = {

    enabled:
      isEmailCleanupEnabled(),

    timestamp:
      new Date(),

    emailSheet:
      false,

    logSheet:
      false,

    securitySheet:
      false,

    queueAvailable:
      false

  };


  try {

    getEmailsSheet();

    health.emailSheet =
      true;

  } catch (error) {

    health.emailSheet =
      false;

  }


  try {

    getEmailLogsSheet();

    health.logSheet =
      true;

  } catch (error) {

    health.logSheet =
      false;

  }


  try {

    getEmailSecuritySheet();

    health.securitySheet =
      true;

  } catch (error) {

    health.securitySheet =
      false;

  }


  health.queueAvailable =
    typeof cleanupEmailQueueRecords ===
    "function";


  health.healthy =
    health.enabled &&
    health.emailSheet &&
    health.logSheet &&
    health.securitySheet;


  return health;

}