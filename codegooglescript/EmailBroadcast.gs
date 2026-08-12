// =====================================================
// EMAILBROADCAST.GS
// Email Broadcast / Mass Mailing System
// Registration System API
// =====================================================


// =====================================================
// BROADCAST STATUSES
// =====================================================

const EMAIL_BROADCAST_STATUSES = {

  DRAFT:
    "Draft",

  SCHEDULED:
    "Scheduled",

  PROCESSING:
    "Processing",

  SENT:
    "Sent",

  PARTIAL:
    "Partial",

  FAILED:
    "Failed",

  CANCELLED:
    "Cancelled",

  COMPLETED:
    "Completed"

};


// =====================================================
// BROADCAST SHEET
// =====================================================

const EMAIL_BROADCAST_SHEET =
  "EMAIL_BROADCASTS";


// =====================================================
// BROADCAST COLUMNS
// =====================================================

const EMAIL_BROADCAST_COLUMNS = {

  ID: 1,

  NAME: 2,

  SUBJECT: 3,

  MESSAGE: 4,

  HTML_BODY: 5,

  TYPE: 6,

  STATUS: 7,

  RECIPIENT_COUNT: 8,

  QUEUED_COUNT: 9,

  SENT_COUNT: 10,

  FAILED_COUNT: 11,

  CANCELLED_COUNT: 12,

  CREATED_BY: 13,

  CREATED_DATE: 14,

  SCHEDULED_DATE: 15,

  STARTED_DATE: 16,

  COMPLETED_DATE: 17,

  ERROR_MESSAGE: 18

};


// =====================================================
// BROADCAST CONFIGURATION
// =====================================================

const EMAIL_BROADCAST_CONFIG = {

  ENABLED:
    true,

  MAX_RECIPIENTS:
    500,

  BATCH_SIZE:
    50,

  DEFAULT_TYPE:
    EMAIL_TYPES.BROADCAST,

  ALLOW_SCHEDULED:
    true

};


// =====================================================
// GET BROADCAST SHEET
// =====================================================

function getEmailBroadcastSheet() {

  return getSheet(
    SHEETS.EMAIL_BROADCASTS ||
    EMAIL_BROADCAST_SHEET
  );

}


// =====================================================
// GENERATE BROADCAST ID
// =====================================================

function generateEmailBroadcastId() {

  return (
    "BROADCAST-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// CHECK BROADCAST ENABLED
// =====================================================

function isEmailBroadcastEnabled() {

  return (
    EMAIL_BROADCAST_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// VALIDATE BROADCAST STATUS
// =====================================================

function isValidEmailBroadcastStatus(
  status
) {

  return Object.values(
    EMAIL_BROADCAST_STATUSES
  ).indexOf(
    status
  ) !== -1;

}


// =====================================================
// VALIDATE BROADCAST DATA
// =====================================================

function validateEmailBroadcastData(
  data
) {

  data =
    data || {};


  if (!data.name) {

    throw new Error(
      "Broadcast name is required"
    );

  }


  if (!data.subject) {

    throw new Error(
      "Broadcast subject is required"
    );

  }


  if (
    !data.message &&
    !data.htmlBody
  ) {

    throw new Error(
      "Broadcast message is required"
    );

  }


  if (
    !data.recipients ||
    !data.recipients.length
  ) {

    throw new Error(
      "Broadcast recipients are required"
    );

  }


  return true;

}


// =====================================================
// CREATE BROADCAST
// =====================================================

function createEmailBroadcast(
  data
) {

  if (
    !isEmailBroadcastEnabled()
  ) {

    throw new Error(
      "Email broadcasting is disabled"
    );

  }


  data =
    data || {};


  validateEmailBroadcastData(
    data
  );


  const recipients =
    validateEmailRecipientList(
      data.recipients,
      {
        maxRecipients:
          EMAIL_BROADCAST_CONFIG
            .MAX_RECIPIENTS
      }
    );


  const broadcastId =
    generateEmailBroadcastId();


  const now =
    new Date();


  let status =
    EMAIL_BROADCAST_STATUSES.DRAFT;


  let scheduledDate =
    "";


  if (
    data.scheduledDate
  ) {

    if (
      EMAIL_BROADCAST_CONFIG
        .ALLOW_SCHEDULED !== true
    ) {

      throw new Error(
        "Scheduled broadcasts are disabled"
      );

    }


    scheduledDate =
      new Date(
        data.scheduledDate
      );


    if (
      isNaN(
        scheduledDate.getTime()
      )
    ) {

      throw new Error(
        "Invalid scheduled date"
      );

    }


    status =
      EMAIL_BROADCAST_STATUSES.SCHEDULED;

  }


  const sheet =
    getEmailBroadcastSheet();


  sheet.appendRow([

    broadcastId,

    data.name,

    data.subject,

    data.message ||
      "",

    data.htmlBody ||
      "",

    data.type ||
      EMAIL_BROADCAST_CONFIG
        .DEFAULT_TYPE,

    status,

    recipients.length,

    0,

    0,

    0,

    0,

    data.createdBy ||
      "SYSTEM",

    now,

    scheduledDate,

    "",

    "",

    ""

  ]);


  // Store recipients separately
  // in queue when the broadcast starts.

  return {

    success:
      true,

    broadcastId:
      broadcastId,

    status:
      status,

    recipientCount:
      recipients.length

  };

}


// =====================================================
// GET BROADCAST
// =====================================================

function getEmailBroadcastById(
  broadcastId
) {

  if (!broadcastId) {

    return null;

  }


  const sheet =
    getEmailBroadcastSheet();


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
        EMAIL_BROADCAST_COLUMNS
          .ERROR_MESSAGE
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
          EMAIL_BROADCAST_COLUMNS.ID - 1
        ]
      ) ===
      String(broadcastId)
    ) {

      return emailBroadcastRowToObject(
        values[i]
      );

    }

  }


  return null;

}


// =====================================================
// CONVERT ROW TO OBJECT
// =====================================================

function emailBroadcastRowToObject(
  row
) {

  return {

    id:
      row[
        EMAIL_BROADCAST_COLUMNS.ID - 1
      ],

    name:
      row[
        EMAIL_BROADCAST_COLUMNS.NAME - 1
      ],

    subject:
      row[
        EMAIL_BROADCAST_COLUMNS.SUBJECT - 1
      ],

    message:
      row[
        EMAIL_BROADCAST_COLUMNS.MESSAGE - 1
      ],

    htmlBody:
      row[
        EMAIL_BROADCAST_COLUMNS.HTML_BODY - 1
      ],

    type:
      row[
        EMAIL_BROADCAST_COLUMNS.TYPE - 1
      ],

    status:
      row[
        EMAIL_BROADCAST_COLUMNS.STATUS - 1
      ],

    recipientCount:
      Number(
        row[
          EMAIL_BROADCAST_COLUMNS
            .RECIPIENT_COUNT - 1
        ] || 0
      ),

    queuedCount:
      Number(
        row[
          EMAIL_BROADCAST_COLUMNS
            .QUEUED_COUNT - 1
        ] || 0
      ),

    sentCount:
      Number(
        row[
          EMAIL_BROADCAST_COLUMNS
            .SENT_COUNT - 1
        ] || 0
      ),

    failedCount:
      Number(
        row[
          EMAIL_BROADCAST_COLUMNS
            .FAILED_COUNT - 1
        ] || 0
      ),

    cancelledCount:
      Number(
        row[
          EMAIL_BROADCAST_COLUMNS
            .CANCELLED_COUNT - 1
        ] || 0
      ),

    createdBy:
      row[
        EMAIL_BROADCAST_COLUMNS
          .CREATED_BY - 1
      ],

    createdDate:
      row[
        EMAIL_BROADCAST_COLUMNS
          .CREATED_DATE - 1
      ],

    scheduledDate:
      row[
        EMAIL_BROADCAST_COLUMNS
          .SCHEDULED_DATE - 1
      ],

    startedDate:
      row[
        EMAIL_BROADCAST_COLUMNS
          .STARTED_DATE - 1
      ],

    completedDate:
      row[
        EMAIL_BROADCAST_COLUMNS
          .COMPLETED_DATE - 1
      ],

    errorMessage:
      row[
        EMAIL_BROADCAST_COLUMNS
          .ERROR_MESSAGE - 1
      ]

  };

}


// =====================================================
// START BROADCAST
// =====================================================

function startEmailBroadcast(
  broadcastId,
  recipients
) {

  const broadcast =
    getEmailBroadcastById(
      broadcastId
    );


  if (!broadcast) {

    throw new Error(
      "Broadcast not found"
    );

  }


  if (
    broadcast.status !==
      EMAIL_BROADCAST_STATUSES.DRAFT &&
    broadcast.status !==
      EMAIL_BROADCAST_STATUSES.SCHEDULED
  ) {

    throw new Error(
      "Broadcast cannot be started"
    );

  }


  const recipientList =
    validateEmailRecipientList(
      recipients,
      {
        maxRecipients:
          EMAIL_BROADCAST_CONFIG
            .MAX_RECIPIENTS
      }
    );


  const sheet =
    getEmailBroadcastSheet();


  const rowNumber =
    findEmailBroadcastRow(
      broadcastId
    );


  if (!rowNumber) {

    throw new Error(
      "Broadcast row not found"
    );

  }


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS.STATUS
    )
    .setValue(
      EMAIL_BROADCAST_STATUSES
        .PROCESSING
    );


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS
        .STARTED_DATE
    )
    .setValue(
      new Date()
    );


  let queued =
    0;


  let failed =
    0;


  // ---------------------------------------------------
  // CREATE QUEUE ITEMS
  // ---------------------------------------------------

  for (
    let i = 0;
    i < recipientList.length;
    i++
  ) {

    try {

      const result =
        queueEmail({

          emailId:
            "",

          recipients:
            [recipientList[i]],

          subject:
            broadcast.subject,

          message:
            broadcast.message,

          htmlBody:
            broadcast.htmlBody,

          type:
            broadcast.type,

          priority:
            EMAIL_PRIORITIES.NORMAL,

          createdBy:
            "BROADCAST:" +
            broadcastId

        });


      if (
        result &&
        result.success
      ) {

        queued++;

      }


    } catch (error) {

      failed++;

    }

  }


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS
        .QUEUED_COUNT
    )
    .setValue(
      queued
    );


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS
        .FAILED_COUNT
    )
    .setValue(
      failed
    );


  if (
    failed > 0 &&
    queued > 0
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS.STATUS
      )
      .setValue(
        EMAIL_BROADCAST_STATUSES.PARTIAL
      );

  } else if (
    failed > 0 &&
    queued === 0
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS.STATUS
      )
      .setValue(
        EMAIL_BROADCAST_STATUSES.FAILED
      );

  }


  return {

    success:
      queued > 0,

    broadcastId:
      broadcastId,

    queued:
      queued,

    failed:
      failed,

    total:
      recipientList.length

  };

}


// =====================================================
// FIND BROADCAST ROW
// =====================================================

function findEmailBroadcastRow(
  broadcastId
) {

  const sheet =
    getEmailBroadcastSheet();


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
        EMAIL_BROADCAST_COLUMNS.ID,
        lastRow - 1,
        1
      )
      .getValues();


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(broadcastId)
    ) {

      return i + 2;

    }

  }


  return null;

}


// =====================================================
// CANCEL BROADCAST
// =====================================================

function cancelEmailBroadcast(
  broadcastId
) {

  const rowNumber =
    findEmailBroadcastRow(
      broadcastId
    );


  if (!rowNumber) {

    throw new Error(
      "Broadcast not found"
    );

  }


  const sheet =
    getEmailBroadcastSheet();


  const broadcast =
    getEmailBroadcastById(
      broadcastId
    );


  if (
    broadcast.status ===
      EMAIL_BROADCAST_STATUSES.COMPLETED ||
    broadcast.status ===
      EMAIL_BROADCAST_STATUSES.CANCELLED
  ) {

    throw new Error(
      "Broadcast has already finished"
    );

  }


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS.STATUS
    )
    .setValue(
      EMAIL_BROADCAST_STATUSES
        .CANCELLED
    );


  return {

    success:
      true,

    broadcastId:
      broadcastId,

    status:
      EMAIL_BROADCAST_STATUSES
        .CANCELLED

  };

}


// =====================================================
// UPDATE BROADCAST COUNTERS
// =====================================================

function updateEmailBroadcastCounters(
  broadcastId,
  counters
) {

  counters =
    counters || {};


  const rowNumber =
    findEmailBroadcastRow(
      broadcastId
    );


  if (!rowNumber) {

    throw new Error(
      "Broadcast not found"
    );

  }


  const sheet =
    getEmailBroadcastSheet();


  if (
    counters.queued !==
    undefined
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS
          .QUEUED_COUNT
      )
      .setValue(
        counters.queued
      );

  }


  if (
    counters.sent !==
    undefined
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS
          .SENT_COUNT
      )
      .setValue(
        counters.sent
      );

  }


  if (
    counters.failed !==
    undefined
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS
          .FAILED_COUNT
      )
      .setValue(
        counters.failed
      );

  }


  if (
    counters.cancelled !==
    undefined
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_BROADCAST_COLUMNS
          .CANCELLED_COUNT
      )
      .setValue(
        counters.cancelled
      );

  }


  return getEmailBroadcastById(
    broadcastId
  );

}


// =====================================================
// COMPLETE BROADCAST
// =====================================================

function completeEmailBroadcast(
  broadcastId
) {

  const broadcast =
    getEmailBroadcastById(
      broadcastId
    );


  if (!broadcast) {

    throw new Error(
      "Broadcast not found"
    );

  }


  const rowNumber =
    findEmailBroadcastRow(
      broadcastId
    );


  const sheet =
    getEmailBroadcastSheet();


  let status =
    EMAIL_BROADCAST_STATUSES
      .COMPLETED;


  if (
    broadcast.failedCount > 0 &&
    broadcast.sentCount === 0
  ) {

    status =
      EMAIL_BROADCAST_STATUSES
        .FAILED;

  } else if (
    broadcast.failedCount > 0
  ) {

    status =
      EMAIL_BROADCAST_STATUSES
        .PARTIAL;

  }


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS.STATUS
    )
    .setValue(
      status
    );


  sheet
    .getRange(
      rowNumber,
      EMAIL_BROADCAST_COLUMNS
        .COMPLETED_DATE
    )
    .setValue(
      new Date()
    );


  return {

    success:
      true,

    broadcastId:
      broadcastId,

    status:
      status

  };

}


// =====================================================
// GET BROADCAST STATISTICS
// =====================================================

function getEmailBroadcastStatistics(
  broadcastId
) {

  const broadcast =
    getEmailBroadcastById(
      broadcastId
    );


  if (!broadcast) {

    throw new Error(
      "Broadcast not found"
    );

  }


  const total =
    broadcast.recipientCount;


  const sent =
    broadcast.sentCount;


  const failed =
    broadcast.failedCount;


  const pending =
    Math.max(
      0,
      total -
      sent -
      failed -
      broadcast.cancelledCount
    );


  const sentRate =
    total > 0
      ? (
          sent /
          total
        ) *
        100
      : 0;


  const failureRate =
    total > 0
      ? (
          failed /
          total
        ) *
        100
      : 0;


  return {

    broadcastId:
      broadcastId,

    total:
      total,

    queued:
      broadcast.queuedCount,

    sent:
      sent,

    failed:
      failed,

    cancelled:
      broadcast.cancelledCount,

    pending:
      pending,

    sentRate:
      Number(
        sentRate.toFixed(2)
      ),

    failureRate:
      Number(
        failureRate.toFixed(2)
      ),

    status:
      broadcast.status

  };

}


// =====================================================
// GET BROADCAST CONFIG
// =====================================================

function getEmailBroadcastConfig() {

  return {

    enabled:
      EMAIL_BROADCAST_CONFIG
        .ENABLED,

    maxRecipients:
      EMAIL_BROADCAST_CONFIG
        .MAX_RECIPIENTS,

    batchSize:
      EMAIL_BROADCAST_CONFIG
        .BATCH_SIZE,

    allowScheduled:
      EMAIL_BROADCAST_CONFIG
        .ALLOW_SCHEDULED

  };

}