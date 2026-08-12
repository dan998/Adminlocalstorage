// =====================================================
// EMAILLOGS.GS
// Email Logging & Audit System
// Registration System API
// =====================================================


// =====================================================
// EMAIL LOG SHEET
// =====================================================

const EMAIL_LOG_SHEET =
  "EMAIL_LOGS";


// =====================================================
// EMAIL LOG ACTIONS
// =====================================================

const EMAIL_LOG_ACTIONS = {

  CREATED:
    "Created",

  QUEUED:
    "Queued",

  PROCESSING:
    "Processing",

  SENT:
    "Sent",

  FAILED:
    "Failed",

  RETRY:
    "Retry",

  CANCELLED:
    "Cancelled",

  OPENED:
    "Opened",

  CLICKED:
    "Clicked",

  BOUNCED:
    "Bounced",

  COMPLAINT:
    "Complaint",

  UNSUBSCRIBED:
    "Unsubscribed"

};


// =====================================================
// EMAIL LOG SOURCES
// =====================================================

const EMAIL_LOG_SOURCES = {

  SYSTEM:
    "System",

  USER:
    "User",

  ADMIN:
    "Admin",

  QUEUE:
    "Queue",

  API:
    "API",

  CRON:
    "Cron",

  WEBHOOK:
    "Webhook"

};


// =====================================================
// EMAIL LOG COLUMNS
// =====================================================

const EMAIL_LOG_COLUMNS = {

  ID: 1,

  EMAIL_ID: 2,

  USER_ID: 3,

  RECIPIENT: 4,

  CC: 5,

  BCC: 6,

  TYPE: 7,

  SUBJECT: 8,

  ACTION: 9,

  STATUS: 10,

  ATTEMPTS: 11,

  MAX_ATTEMPTS: 12,

  CREATED_DATE: 13,

  UPDATED_DATE: 14,

  SENT_DATE: 15,

  OPENED_DATE: 16,

  CLICKED_DATE: 17,

  ERROR_MESSAGE: 18,

  ERROR_CODE: 19,

  PROVIDER: 20,

  PROVIDER_MESSAGE_ID: 21,

  QUEUE_ID: 22,

  IP_ADDRESS: 23,

  DEVICE_ID: 24,

  CREATED_BY: 25,

  METADATA: 26

};


// =====================================================
// LOG CONFIGURATION
// =====================================================

const EMAIL_LOG_CONFIG = {

  ENABLED:
    true,

  STORE_METADATA:
    true,

  STORE_MESSAGE_CONTENT:
    false,

  MAX_METADATA_LENGTH:
    5000,

  RETENTION_DAYS:
    90

};


// =====================================================
// GET EMAIL LOG SHEET
// =====================================================

function getEmailLogsSheet() {

  return getSheet(
    SHEETS.EMAIL_LOGS ||
    EMAIL_LOG_SHEET
  );

}


// =====================================================
// GENERATE EMAIL LOG ID
// =====================================================

function generateEmailLogId() {

  return (
    "ELOG-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// VALIDATE LOG ACTION
// =====================================================

function isValidEmailLogAction(
  action
) {

  return Object
    .values(
      EMAIL_LOG_ACTIONS
    )
    .indexOf(action) !== -1;

}


// =====================================================
// VALIDATE LOG SOURCE
// =====================================================

function isValidEmailLogSource(
  source
) {

  return Object
    .values(
      EMAIL_LOG_SOURCES
    )
    .indexOf(source) !== -1;

}


// =====================================================
// SERIALIZE METADATA
// =====================================================

function serializeEmailLogMetadata(
  metadata
) {

  if (
    !EMAIL_LOG_CONFIG
      .STORE_METADATA
  ) {

    return "";

  }


  if (
    metadata === null ||
    metadata === undefined
  ) {

    return "";

  }


  let result;


  try {

    result =
      typeof metadata === "string"
        ? metadata
        : JSON.stringify(
            metadata
          );

  } catch (error) {

    result =
      String(metadata);

  }


  if (
    result.length >
    EMAIL_LOG_CONFIG
      .MAX_METADATA_LENGTH
  ) {

    result =
      result.substring(
        0,
        EMAIL_LOG_CONFIG
          .MAX_METADATA_LENGTH
      );

  }


  return result;

}


// =====================================================
// CREATE EMAIL LOG
// =====================================================

function createEmailLog(
  data
) {

  if (
    !EMAIL_LOG_CONFIG.ENABLED
  ) {

    return null;

  }


  data =
    data || {};


  const sheet =
    getEmailLogsSheet();


  const now =
    new Date();


  const logId =
    generateEmailLogId();


  const action =
    isValidEmailLogAction(
      data.action
    )
      ? data.action
      : EMAIL_LOG_ACTIONS.CREATED;


  const status =
    data.status ||
    action;


  sheet.appendRow([

    logId,

    data.emailId ||
      "",

    data.userId ||
      "",

    data.recipient ||
      "",

    data.cc ||
      "",

    data.bcc ||
      "",

    data.type ||
      "",

    data.subject ||
      "",

    action,

    status,

    Number(
      data.attempts || 0
    ),

    Number(
      data.maxAttempts || 3
    ),

    data.createdDate ||
      now,

    now,

    data.sentDate ||
      "",

    data.openedDate ||
      "",

    data.clickedDate ||
      "",

    data.errorMessage ||
      "",

    data.errorCode ||
      "",

    data.provider ||
      "",

    data.providerMessageId ||
      "",

    data.queueId ||
      "",

    data.ipAddress ||
      "",

    data.deviceId ||
      "",

    data.createdBy ||
      "SYSTEM",

    serializeEmailLogMetadata(
      data.metadata
    )

  ]);


  return logId;

}


// =====================================================
// LOG EMAIL CREATED
// =====================================================

function logEmailCreated(
  emailData
) {

  emailData =
    emailData || {};


  return createEmailLog({

    emailId:
      emailData.emailId,

    userId:
      emailData.userId,

    recipient:
      emailData.recipient,

    cc:
      emailData.cc,

    bcc:
      emailData.bcc,

    type:
      emailData.type,

    subject:
      emailData.subject,

    action:
      EMAIL_LOG_ACTIONS.CREATED,

    status:
      "Created",

    createdBy:
      emailData.createdBy,

    metadata:
      emailData.metadata

  });

}


// =====================================================
// LOG EMAIL QUEUED
// =====================================================

function logEmailQueued(
  emailData
) {

  emailData =
    emailData || {};


  return createEmailLog({

    emailId:
      emailData.emailId,

    userId:
      emailData.userId,

    recipient:
      emailData.recipient,

    type:
      emailData.type,

    subject:
      emailData.subject,

    action:
      EMAIL_LOG_ACTIONS.QUEUED,

    status:
      "Queued",

    queueId:
      emailData.queueId,

    createdBy:
      "QUEUE",

    metadata:
      emailData.metadata

  });

}


// =====================================================
// LOG EMAIL PROCESSING
// =====================================================

function logEmailProcessing(
  emailId,
  queueId,
  attempts
) {

  return createEmailLog({

    emailId:
      emailId,

    queueId:
      queueId,

    action:
      EMAIL_LOG_ACTIONS.PROCESSING,

    status:
      "Processing",

    attempts:
      attempts,

    createdBy:
      "QUEUE"

  });

}


// =====================================================
// LOG EMAIL SENT
// =====================================================

function logEmailSent(
  emailData
) {

  emailData =
    emailData || {};


  return createEmailLog({

    emailId:
      emailData.emailId,

    userId:
      emailData.userId,

    recipient:
      emailData.recipient,

    type:
      emailData.type,

    subject:
      emailData.subject,

    action:
      EMAIL_LOG_ACTIONS.SENT,

    status:
      "Sent",

    attempts:
      emailData.attempts,

    sentDate:
      emailData.sentDate ||
      new Date(),

    provider:
      emailData.provider,

    providerMessageId:
      emailData.providerMessageId,

    queueId:
      emailData.queueId,

    createdBy:
      "SENDING_ENGINE",

    metadata:
      emailData.metadata

  });

}


// =====================================================
// LOG EMAIL FAILURE
// =====================================================

function logEmailFailed(
  emailData
) {

  emailData =
    emailData || {};


  return createEmailLog({

    emailId:
      emailData.emailId,

    userId:
      emailData.userId,

    recipient:
      emailData.recipient,

    type:
      emailData.type,

    subject:
      emailData.subject,

    action:
      EMAIL_LOG_ACTIONS.FAILED,

    status:
      "Failed",

    attempts:
      emailData.attempts,

    maxAttempts:
      emailData.maxAttempts,

    errorMessage:
      emailData.errorMessage,

    errorCode:
      emailData.errorCode,

    queueId:
      emailData.queueId,

    createdBy:
      "SENDING_ENGINE",

    metadata:
      emailData.metadata

  });

}


// =====================================================
// LOG EMAIL RETRY
// =====================================================

function logEmailRetry(
  emailData
) {

  emailData =
    emailData || {};


  return createEmailLog({

    emailId:
      emailData.emailId,

    userId:
      emailData.userId,

    recipient:
      emailData.recipient,

    type:
      emailData.type,

    subject:
      emailData.subject,

    action:
      EMAIL_LOG_ACTIONS.RETRY,

    status:
      "Retry",

    attempts:
      emailData.attempts,

    maxAttempts:
      emailData.maxAttempts,

    errorMessage:
      emailData.errorMessage,

    queueId:
      emailData.queueId,

    createdBy:
      "QUEUE",

    metadata:
      emailData.metadata

  });

}


// =====================================================
// LOG EMAIL CANCELLED
// =====================================================

function logEmailCancelled(
  emailId,
  reason,
  createdBy
) {

  return createEmailLog({

    emailId:
      emailId,

    action:
      EMAIL_LOG_ACTIONS.CANCELLED,

    status:
      "Cancelled",

    errorMessage:
      reason ||
      "",

    createdBy:
      createdBy ||
      "SYSTEM"

  });

}


// =====================================================
// LOG EMAIL OPENED
// =====================================================

function logEmailOpened(
  emailId,
  data
) {

  data =
    data || {};


  return createEmailLog({

    emailId:
      emailId,

    userId:
      data.userId,

    recipient:
      data.recipient,

    action:
      EMAIL_LOG_ACTIONS.OPENED,

    status:
      "Opened",

    openedDate:
      data.openedDate ||
      new Date(),

    ipAddress:
      data.ipAddress,

    deviceId:
      data.deviceId,

    createdBy:
      "WEBHOOK",

    metadata:
      data.metadata

  });

}


// =====================================================
// LOG EMAIL CLICKED
// =====================================================

function logEmailClicked(
  emailId,
  data
) {

  data =
    data || {};


  return createEmailLog({

    emailId:
      emailId,

    userId:
      data.userId,

    recipient:
      data.recipient,

    action:
      EMAIL_LOG_ACTIONS.CLICKED,

    status:
      "Clicked",

    clickedDate:
      data.clickedDate ||
      new Date(),

    ipAddress:
      data.ipAddress,

    deviceId:
      data.deviceId,

    createdBy:
      "WEBHOOK",

    metadata:
      data.metadata

  });

}


// =====================================================
// FIND EMAIL LOGS
// =====================================================

function findEmailLogs(
  emailId
) {

  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return [];

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


  const results =
    [];


  values.forEach(
    function(row) {

      if (
        String(
          row[
            EMAIL_LOG_COLUMNS
              .EMAIL_ID - 1
          ]
        ) ===
        String(emailId)
      ) {

        results.push(
          emailLogRowToObject(
            row
          )
        );

      }

    }
  );


  return results;

}


// =====================================================
// GET EMAIL LOG BY ID
// =====================================================

function getEmailLog(
  logId
) {

  if (!logId) {

    return null;

  }


  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return null;

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


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    if (
      String(
        values[i][
          EMAIL_LOG_COLUMNS
            .ID - 1
        ]
      ) ===
      String(logId)
    ) {

      return {

        rowNumber:
          i + 2,

        data:
          emailLogRowToObject(
            values[i]
          )

      };

    }

  }


  return null;

}


// =====================================================
// CONVERT LOG ROW TO OBJECT
// =====================================================

function emailLogRowToObject(
  row
) {

  return {

    id:
      row[
        EMAIL_LOG_COLUMNS
          .ID - 1
      ],

    emailId:
      row[
        EMAIL_LOG_COLUMNS
          .EMAIL_ID - 1
      ],

    userId:
      row[
        EMAIL_LOG_COLUMNS
          .USER_ID - 1
      ],

    recipient:
      row[
        EMAIL_LOG_COLUMNS
          .RECIPIENT - 1
      ],

    cc:
      row[
        EMAIL_LOG_COLUMNS
          .CC - 1
      ],

    bcc:
      row[
        EMAIL_LOG_COLUMNS
          .BCC - 1
      ],

    type:
      row[
        EMAIL_LOG_COLUMNS
          .TYPE - 1
      ],

    subject:
      row[
        EMAIL_LOG_COLUMNS
          .SUBJECT - 1
      ],

    action:
      row[
        EMAIL_LOG_COLUMNS
          .ACTION - 1
      ],

    status:
      row[
        EMAIL_LOG_COLUMNS
          .STATUS - 1
      ],

    attempts:
      Number(
        row[
          EMAIL_LOG_COLUMNS
            .ATTEMPTS - 1
        ] || 0
      ),

    maxAttempts:
      Number(
        row[
          EMAIL_LOG_COLUMNS
            .MAX_ATTEMPTS - 1
        ] || 0
      ),

    createdDate:
      row[
        EMAIL_LOG_COLUMNS
          .CREATED_DATE - 1
      ],

    updatedDate:
      row[
        EMAIL_LOG_COLUMNS
          .UPDATED_DATE - 1
      ],

    sentDate:
      row[
        EMAIL_LOG_COLUMNS
          .SENT_DATE - 1
      ],

    openedDate:
      row[
        EMAIL_LOG_COLUMNS
          .OPENED_DATE - 1
      ],

    clickedDate:
      row[
        EMAIL_LOG_COLUMNS
          .CLICKED_DATE - 1
      ],

    errorMessage:
      row[
        EMAIL_LOG_COLUMNS
          .ERROR_MESSAGE - 1
      ],

    errorCode:
      row[
        EMAIL_LOG_COLUMNS
          .ERROR_CODE - 1
      ],

    provider:
      row[
        EMAIL_LOG_COLUMNS
          .PROVIDER - 1
      ],

    providerMessageId:
      row[
        EMAIL_LOG_COLUMNS
          .PROVIDER_MESSAGE_ID - 1
      ],

    queueId:
      row[
        EMAIL_LOG_COLUMNS
          .QUEUE_ID - 1
      ],

    ipAddress:
      row[
        EMAIL_LOG_COLUMNS
          .IP_ADDRESS - 1
      ],

    deviceId:
      row[
        EMAIL_LOG_COLUMNS
          .DEVICE_ID - 1
      ],

    createdBy:
      row[
        EMAIL_LOG_COLUMNS
          .CREATED_BY - 1
      ],

    metadata:
      row[
        EMAIL_LOG_COLUMNS
          .METADATA - 1
      ]

  };

}


// =====================================================
// UPDATE EMAIL LOG STATUS
// =====================================================

function updateEmailLogStatus(
  logId,
  status,
  data
) {

  if (
    !isValidEmailLogAction(
      status
    )
  ) {

    throw new Error(
      "Invalid email log status"
    );

  }


  data =
    data || {};


  const found =
    getEmailLog(
      logId
    );


  if (!found) {

    return false;

  }


  const sheet =
    getEmailLogsSheet();


  const row =
    found.rowNumber;


  sheet
    .getRange(
      row,
      EMAIL_LOG_COLUMNS
        .ACTION
    )
    .setValue(
      status
    );


  sheet
    .getRange(
      row,
      EMAIL_LOG_COLUMNS
        .STATUS
    )
    .setValue(
      data.status ||
      status
    );


  sheet
    .getRange(
      row,
      EMAIL_LOG_COLUMNS
        .UPDATED_DATE
    )
    .setValue(
      new Date()
    );


  if (
    data.errorMessage
  ) {

    sheet
      .getRange(
        row,
        EMAIL_LOG_COLUMNS
          .ERROR_MESSAGE
      )
      .setValue(
        data.errorMessage
      );

  }


  if (
    data.errorCode
  ) {

    sheet
      .getRange(
        row,
        EMAIL_LOG_COLUMNS
          .ERROR_CODE
      )
      .setValue(
        data.errorCode
      );

  }


  if (
    data.providerMessageId
  ) {

    sheet
      .getRange(
        row,
        EMAIL_LOG_COLUMNS
          .PROVIDER_MESSAGE_ID
      )
      .setValue(
        data.providerMessageId
      );

  }


  return true;

}


// =====================================================
// GET EMAIL LOG STATISTICS
// =====================================================

function getEmailLogStatistics(
  options
) {

  options =
    options || {};


  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  const statistics = {

    total:
      0,

    created:
      0,

    queued:
      0,

    processing:
      0,

    sent:
      0,

    failed:
      0,

    retry:
      0,

    cancelled:
      0,

    opened:
      0,

    clicked:
      0,

    bounced:
      0,

    complaints:
      0,

    unsubscribed:
      0

  };


  if (
    lastRow <= 1
  ) {

    return statistics;

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


  const since =
    options.since
      ? new Date(
          options.since
        ).getTime()
      : 0;


  values.forEach(
    function(row) {

      const created =
        new Date(
          row[
            EMAIL_LOG_COLUMNS
              .CREATED_DATE - 1
          ]
        ).getTime();


      if (
        since &&
        (
          isNaN(created) ||
          created < since
        )
      ) {

        return;

      }


      statistics.total++;


      const action =
        row[
          EMAIL_LOG_COLUMNS
            .ACTION - 1
        ];


      switch (action) {

        case EMAIL_LOG_ACTIONS.CREATED:
          statistics.created++;
          break;

        case EMAIL_LOG_ACTIONS.QUEUED:
          statistics.queued++;
          break;

        case EMAIL_LOG_ACTIONS.PROCESSING:
          statistics.processing++;
          break;

        case EMAIL_LOG_ACTIONS.SENT:
          statistics.sent++;
          break;

        case EMAIL_LOG_ACTIONS.FAILED:
          statistics.failed++;
          break;

        case EMAIL_LOG_ACTIONS.RETRY:
          statistics.retry++;
          break;

        case EMAIL_LOG_ACTIONS.CANCELLED:
          statistics.cancelled++;
          break;

        case EMAIL_LOG_ACTIONS.OPENED:
          statistics.opened++;
          break;

        case EMAIL_LOG_ACTIONS.CLICKED:
          statistics.clicked++;
          break;

        case EMAIL_LOG_ACTIONS.BOUNCED:
          statistics.bounced++;
          break;

        case EMAIL_LOG_ACTIONS.COMPLAINT:
          statistics.complaints++;
          break;

        case EMAIL_LOG_ACTIONS.UNSUBSCRIBED:
          statistics.unsubscribed++;
          break;

      }

    }
  );


  // ---------------------------------------------------
  // CALCULATE RATES
  // ---------------------------------------------------

  statistics.deliveryRate =
    statistics.total > 0
      ? (
          statistics.sent /
          statistics.total
        ) * 100
      : 0;


  statistics.openRate =
    statistics.sent > 0
      ? (
          statistics.opened /
          statistics.sent
        ) * 100
      : 0;


  statistics.clickRate =
    statistics.sent > 0
      ? (
          statistics.clicked /
          statistics.sent
        ) * 100
      : 0;


  statistics.failureRate =
    statistics.total > 0
      ? (
          statistics.failed /
          statistics.total
        ) * 100
      : 0;


  return statistics;

}


// =====================================================
// GET USER EMAIL LOGS
// =====================================================

function getUserEmailLogs(
  userId,
  limit
) {

  if (!userId) {

    return [];

  }


  const maxResults =
    Number(
      limit || 50
    );


  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return [];

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


  const results =
    [];


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const row =
      values[i];


    if (
      String(
        row[
          EMAIL_LOG_COLUMNS
            .USER_ID - 1
        ]
      ) ===
      String(userId)
    ) {

      results.push(
        emailLogRowToObject(
          row
        )
      );


      if (
        results.length >=
        maxResults
      ) {

        break;

      }

    }

  }


  return results;

}


// =====================================================
// GET FAILED EMAIL LOGS
// =====================================================

function getFailedEmailLogs(
  limit
) {

  const maxResults =
    Number(
      limit || 100
    );


  const sheet =
    getEmailLogsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return [];

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


  const results =
    [];


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const row =
      values[i];


    if (
      row[
        EMAIL_LOG_COLUMNS
          .ACTION - 1
      ] ===
      EMAIL_LOG_ACTIONS.FAILED
    ) {

      results.push(
        emailLogRowToObject(
          row
        )
      );


      if (
        results.length >=
        maxResults
      ) {

        break;

      }

    }

  }


  return results;

}


// =====================================================
// CLEAN OLD EMAIL LOGS
// =====================================================

function cleanupOldEmailLogs(
  days
) {

  const retentionDays =
    Number(
      days ||
      EMAIL_LOG_CONFIG
        .RETENTION_DAYS
    );


  const cutoff =
    Date.now() -
    retentionDays *
    24 *
    60 *
    60 *
    1000;


  const sheet =
    getEmailLogsSheet();


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
        EMAIL_LOG_COLUMNS
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
          EMAIL_LOG_COLUMNS
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


// =====================================================
// EMAIL LOG CONFIGURATION
// =====================================================

function getEmailLogConfig() {

  return {

    enabled:
      EMAIL_LOG_CONFIG
        .ENABLED,

    storeMetadata:
      EMAIL_LOG_CONFIG
        .STORE_METADATA,

    storeMessageContent:
      EMAIL_LOG_CONFIG
        .STORE_MESSAGE_CONTENT,

    retentionDays:
      EMAIL_LOG_CONFIG
        .RETENTION_DAYS

  };

}