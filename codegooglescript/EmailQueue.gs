// =====================================================
// EMAILQUEUE.GS
// Email Queue Management
// Registration System API
// =====================================================


// =====================================================
// QUEUE STATUSES
// =====================================================

const EMAIL_QUEUE_STATUSES = {

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

  EXPIRED:
    "Expired"

};


// =====================================================
// QUEUE PRIORITIES
// =====================================================

const EMAIL_QUEUE_PRIORITIES = {

  LOW:
    1,

  NORMAL:
    5,

  HIGH:
    10,

  CRITICAL:
    20

};


// =====================================================
// QUEUE SHEET
// =====================================================

const EMAIL_QUEUE_SHEET =
  "EMAIL_QUEUE";


// =====================================================
// QUEUE COLUMNS
// =====================================================

const EMAIL_QUEUE_COLUMNS = {

  ID: 1,

  EMAIL_ID: 2,

  USER_ID: 3,

  TO: 4,

  CC: 5,

  BCC: 6,

  SUBJECT: 7,

  MESSAGE: 8,

  HTML_BODY: 9,

  TYPE: 10,

  PRIORITY: 11,

  STATUS: 12,

  ATTEMPTS: 13,

  MAX_ATTEMPTS: 14,

  NEXT_ATTEMPT: 15,

  CREATED_DATE: 16,

  QUEUED_DATE: 17,

  PROCESSING_DATE: 18,

  SENT_DATE: 19,

  FAILED_DATE: 20,

  ERROR_MESSAGE: 21,

  CREATED_BY: 22,

  LOCK_ID: 23,

  LOCK_DATE: 24

};


// =====================================================
// QUEUE CONFIGURATION
// =====================================================

const EMAIL_QUEUE_CONFIG = {

  ENABLED:
    true,

  MAX_ATTEMPTS:
    3,

  BATCH_SIZE:
    20,

  LOCK_TIMEOUT_MINUTES:
    10,

  RETRY_DELAY_MINUTES:
    5,

  MAX_QUEUE_SIZE:
    1000,

  PROCESSING_TIMEOUT_MINUTES:
    15

};


// =====================================================
// GET QUEUE SHEET
// =====================================================

function getEmailQueueSheet() {

  return getSheet(
    SHEETS.EMAIL_QUEUE ||
    EMAIL_QUEUE_SHEET
  );

}


// =====================================================
// GENERATE QUEUE ID
// =====================================================

function generateEmailQueueId() {

  return (
    "QUEUE-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// GENERATE LOCK ID
// =====================================================

function generateEmailQueueLockId() {

  return (
    "LOCK-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// CHECK QUEUE ENABLED
// =====================================================

function isEmailQueueEnabled() {

  return (
    EMAIL_QUEUE_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// VALIDATE QUEUE STATUS
// =====================================================

function isValidEmailQueueStatus(
  status
) {

  return Object.values(
    EMAIL_QUEUE_STATUSES
  ).indexOf(
    status
  ) !== -1;

}


// =====================================================
// VALIDATE QUEUE PRIORITY
// =====================================================

function isValidEmailQueuePriority(
  priority
) {

  const value =
    Number(priority);

  return [
    EMAIL_QUEUE_PRIORITIES.LOW,
    EMAIL_QUEUE_PRIORITIES.NORMAL,
    EMAIL_QUEUE_PRIORITIES.HIGH,
    EMAIL_QUEUE_PRIORITIES.CRITICAL
  ].indexOf(value) !== -1;

}


// =====================================================
// COUNT QUEUED EMAILS
// =====================================================

function countQueuedEmails() {

  const sheet =
    getEmailQueueSheet();

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
        EMAIL_QUEUE_COLUMNS.STATUS,
        lastRow - 1,
        1
      )
      .getValues();


  let count = 0;


  values.forEach(
    function(row) {

      if (
        row[0] ===
        EMAIL_QUEUE_STATUSES.QUEUED
      ) {

        count++;

      }

    }
  );


  return count;

}


// =====================================================
// CREATE QUEUE RECORD
// =====================================================

function queueEmail(
  emailData
) {

  if (
    !isEmailQueueEnabled()
  ) {

    throw new Error(
      "Email queue is disabled"
    );

  }


  emailData =
    emailData || {};


  const recipients =
    validateEmailRecipientsForSend(
      emailData.recipients ||
      emailData.to
    );


  const cc =
    emailData.cc
      ? normalizeRecipientList(
          emailData.cc
        )
      : [];


  const bcc =
    emailData.bcc
      ? normalizeRecipientList(
          emailData.bcc
        )
      : [];


  const subject =
    String(
      emailData.subject ||
      ""
    ).trim();


  if (!subject) {

    throw new Error(
      "Email subject is required"
    );

  }


  if (
    !emailData.message &&
    !emailData.htmlBody
  ) {

    throw new Error(
      "Email message is required"
    );

  }


  const currentSize =
    countQueuedEmails();


  if (
    currentSize >=
    EMAIL_QUEUE_CONFIG.MAX_QUEUE_SIZE
  ) {

    throw new Error(
      "Email queue is full"
    );

  }


  const priority =
    Number(
      emailData.priority ||
      EMAIL_QUEUE_PRIORITIES.NORMAL
    );


  if (
    !isValidEmailQueuePriority(
      priority
    )
  ) {

    throw new Error(
      "Invalid email queue priority"
    );

  }


  const queueId =
    generateEmailQueueId();


  const now =
    new Date();


  const sheet =
    getEmailQueueSheet();


  sheet.appendRow([

    queueId,

    emailData.emailId ||
      "",

    emailData.userId ||
      "",

    recipients.join(","),

    cc.join(","),

    bcc.join(","),

    subject,

    emailData.message ||
      "",

    emailData.htmlBody ||
      "",

    emailData.type ||
      EMAIL_TYPES.NOTIFICATION,

    priority,

    EMAIL_QUEUE_STATUSES.QUEUED,

    0,

    emailData.maxAttempts ||
      EMAIL_QUEUE_CONFIG.MAX_ATTEMPTS,

    now,

    now,

    now,

    "",

    "",

    "",

    "",

    emailData.createdBy ||
      "SYSTEM",

    "",

    ""

  ]);


  return {

    success:
      true,

    queueId:
      queueId,

    emailId:
      emailData.emailId ||
      "",

    status:
      EMAIL_QUEUE_STATUSES.QUEUED

  };

}


// =====================================================
// GET QUEUE RECORD
// =====================================================

function getEmailQueueById(
  queueId
) {

  if (!queueId) {

    return null;

  }


  const sheet =
    getEmailQueueSheet();


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
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
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
          EMAIL_QUEUE_COLUMNS.ID - 1
        ]
      ) ===
      String(queueId)
    ) {

      return emailQueueRowToObject(
        values[i]
      );

    }

  }


  return null;

}


// =====================================================
// CONVERT QUEUE ROW TO OBJECT
// =====================================================

function emailQueueRowToObject(
  row
) {

  return {

    id:
      row[
        EMAIL_QUEUE_COLUMNS.ID - 1
      ],

    emailId:
      row[
        EMAIL_QUEUE_COLUMNS.EMAIL_ID - 1
      ],

    userId:
      row[
        EMAIL_QUEUE_COLUMNS.USER_ID - 1
      ],

    to:
      row[
        EMAIL_QUEUE_COLUMNS.TO - 1
      ],

    cc:
      row[
        EMAIL_QUEUE_COLUMNS.CC - 1
      ],

    bcc:
      row[
        EMAIL_QUEUE_COLUMNS.BCC - 1
      ],

    subject:
      row[
        EMAIL_QUEUE_COLUMNS.SUBJECT - 1
      ],

    message:
      row[
        EMAIL_QUEUE_COLUMNS.MESSAGE - 1
      ],

    htmlBody:
      row[
        EMAIL_QUEUE_COLUMNS.HTML_BODY - 1
      ],

    type:
      row[
        EMAIL_QUEUE_COLUMNS.TYPE - 1
      ],

    priority:
      row[
        EMAIL_QUEUE_COLUMNS.PRIORITY - 1
      ],

    status:
      row[
        EMAIL_QUEUE_COLUMNS.STATUS - 1
      ],

    attempts:
      Number(
        row[
          EMAIL_QUEUE_COLUMNS.ATTEMPTS - 1
        ] || 0
      ),

    maxAttempts:
      Number(
        row[
          EMAIL_QUEUE_COLUMNS.MAX_ATTEMPTS - 1
        ] ||
        EMAIL_QUEUE_CONFIG.MAX_ATTEMPTS
      ),

    nextAttempt:
      row[
        EMAIL_QUEUE_COLUMNS.NEXT_ATTEMPT - 1
      ],

    createdDate:
      row[
        EMAIL_QUEUE_COLUMNS.CREATED_DATE - 1
      ],

    queuedDate:
      row[
        EMAIL_QUEUE_COLUMNS.QUEUED_DATE - 1
      ],

    processingDate:
      row[
        EMAIL_QUEUE_COLUMNS.PROCESSING_DATE - 1
      ],

    sentDate:
      row[
        EMAIL_QUEUE_COLUMNS.SENT_DATE - 1
      ],

    failedDate:
      row[
        EMAIL_QUEUE_COLUMNS.FAILED_DATE - 1
      ],

    errorMessage:
      row[
        EMAIL_QUEUE_COLUMNS.ERROR_MESSAGE - 1
      ],

    createdBy:
      row[
        EMAIL_QUEUE_COLUMNS.CREATED_BY - 1
      ],

    lockId:
      row[
        EMAIL_QUEUE_COLUMNS.LOCK_ID - 1
      ],

    lockDate:
      row[
        EMAIL_QUEUE_COLUMNS.LOCK_DATE - 1
      ]

  };

}


// =====================================================
// GET QUEUED EMAILS
// =====================================================

function getQueuedEmails(
  limit
) {

  const sheet =
    getEmailQueueSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return [];

  }


  const max =
    Math.min(
      Number(
        limit ||
        EMAIL_QUEUE_CONFIG.BATCH_SIZE
      ),
      EMAIL_QUEUE_CONFIG.BATCH_SIZE
    );


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .getValues();


  const now =
    new Date();


  const queue = [];


  values.forEach(
    function(row) {

      const status =
        row[
          EMAIL_QUEUE_COLUMNS.STATUS - 1
        ];


      if (
        status !==
        EMAIL_QUEUE_STATUSES.QUEUED &&
        status !==
        EMAIL_QUEUE_STATUSES.RETRY
      ) {

        return;

      }


      const nextAttempt =
        row[
          EMAIL_QUEUE_COLUMNS.NEXT_ATTEMPT - 1
        ];


      if (
        nextAttempt &&
        new Date(
          nextAttempt
        ) > now
      ) {

        return;

      }


      queue.push(
        emailQueueRowToObject(
          row
        )
      );

    }
  );


  // Highest priority first
  queue.sort(
    function(a, b) {

      return (
        Number(b.priority) -
        Number(a.priority)
      );

    }
  );


  return queue.slice(
    0,
    max
  );

}


// =====================================================
// LOCK QUEUE ITEM
// =====================================================

function lockEmailQueueItem(
  queueId
) {

  const sheet =
    getEmailQueueSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    throw new Error(
      "Queue is empty"
    );

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .getValues();


  const now =
    new Date();


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const id =
      row[
        EMAIL_QUEUE_COLUMNS.ID - 1
      ];


    if (
      String(id) !==
      String(queueId)
    ) {

      continue;

    }


    const status =
      row[
        EMAIL_QUEUE_COLUMNS.STATUS - 1
      ];


    if (
      status !==
        EMAIL_QUEUE_STATUSES.QUEUED &&
      status !==
        EMAIL_QUEUE_STATUSES.RETRY
    ) {

      throw new Error(
        "Queue item is not available"
      );

    }


    const lockId =
      generateEmailQueueLockId();


    const rowNumber =
      i + 2;


    sheet
      .getRange(
        rowNumber,
        EMAIL_QUEUE_COLUMNS.STATUS
      )
      .setValue(
        EMAIL_QUEUE_STATUSES.PROCESSING
      );


    sheet
      .getRange(
        rowNumber,
        EMAIL_QUEUE_COLUMNS.PROCESSING_DATE
      )
      .setValue(
        now
      );


    sheet
      .getRange(
        rowNumber,
        EMAIL_QUEUE_COLUMNS.LOCK_ID
      )
      .setValue(
        lockId
      );


    sheet
      .getRange(
        rowNumber,
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .setValue(
        now
      );


    return {

      success:
        true,

      queueId:
        queueId,

      lockId:
        lockId

    };

  }


  throw new Error(
    "Queue item not found"
  );

}


// =====================================================
// MARK QUEUE SENT
// =====================================================

function markEmailQueueSent(
  queueId,
  lockId
) {

  return updateEmailQueueStatus(
    queueId,
    EMAIL_QUEUE_STATUSES.SENT,
    {
      lockId:
        lockId
    }
  );

}


// =====================================================
// MARK QUEUE FAILED
// =====================================================

function markEmailQueueFailed(
  queueId,
  lockId,
  errorMessage
) {

  const queue =
    getEmailQueueById(
      queueId
    );


  if (!queue) {

    throw new Error(
      "Queue item not found"
    );

  }


  const attempts =
    queue.attempts + 1;


  if (
    attempts <
    queue.maxAttempts
  ) {

    return updateEmailQueueStatus(

      queueId,

      EMAIL_QUEUE_STATUSES.RETRY,

      {

        lockId:
          lockId,

        attempts:
          attempts,

        errorMessage:
          errorMessage,

        nextAttempt:
          new Date(
            Date.now() +
            EMAIL_QUEUE_CONFIG
              .RETRY_DELAY_MINUTES *
            60 *
            1000
          )

      }

    );

  }


  return updateEmailQueueStatus(

    queueId,

    EMAIL_QUEUE_STATUSES.FAILED,

    {

      lockId:
        lockId,

      attempts:
        attempts,

      errorMessage:
        errorMessage

    }

  );

}


// =====================================================
// UPDATE QUEUE STATUS
// =====================================================

function updateEmailQueueStatus(
  queueId,
  status,
  options
) {

  options =
    options || {};


  if (
    !isValidEmailQueueStatus(
      status
    )
  ) {

    throw new Error(
      "Invalid queue status"
    );

  }


  const sheet =
    getEmailQueueSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    throw new Error(
      "Queue item not found"
    );

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .getValues();


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const id =
      row[
        EMAIL_QUEUE_COLUMNS.ID - 1
      ];


    if (
      String(id) !==
      String(queueId)
    ) {

      continue;

    }


    const rowNumber =
      i + 2;


    if (
      options.lockId
    ) {

      const storedLock =
        row[
          EMAIL_QUEUE_COLUMNS.LOCK_ID - 1
        ];


      if (
        String(storedLock) !==
        String(options.lockId)
      ) {

        throw new Error(
          "Invalid queue lock"
        );

      }

    }


    const now =
      new Date();


    sheet
      .getRange(
        rowNumber,
        EMAIL_QUEUE_COLUMNS.STATUS
      )
      .setValue(
        status
      );


    if (
      options.attempts !==
      undefined
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.ATTEMPTS
        )
        .setValue(
          options.attempts
        );

    }


    if (
      options.errorMessage !==
      undefined
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.ERROR_MESSAGE
        )
        .setValue(
          options.errorMessage ||
          ""
        );

    }


    if (
      options.nextAttempt !==
      undefined
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.NEXT_ATTEMPT
        )
        .setValue(
          options.nextAttempt
        );

    }


    if (
      status ===
      EMAIL_QUEUE_STATUSES.SENT
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.SENT_DATE
        )
        .setValue(
          now
        );

    }


    if (
      status ===
      EMAIL_QUEUE_STATUSES.FAILED
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.FAILED_DATE
        )
        .setValue(
          now
        );

    }


    if (
      status ===
      EMAIL_QUEUE_STATUSES.SENT ||
      status ===
      EMAIL_QUEUE_STATUSES.FAILED ||
      status ===
      EMAIL_QUEUE_STATUSES.CANCELLED
    ) {

      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.LOCK_ID,
          1,
          2
        )
        .clearContent();

    }


    return {

      success:
        true,

      queueId:
        queueId,

      status:
        status

    };

  }


  throw new Error(
    "Queue item not found"
  );

}


// =====================================================
// PROCESS ONE QUEUE ITEM
// =====================================================

function processEmailQueueItem(
  queueId
) {

  const queue =
    getEmailQueueById(
      queueId
    );


  if (!queue) {

    throw new Error(
      "Queue item not found"
    );

  }


  const lock =
    lockEmailQueueItem(
      queueId
    );


  try {

    const result =
      emailSendingEngine({

        emailId:
          queue.emailId,

        recipients:
          queue.to,

        cc:
          queue.cc,

        bcc:
          queue.bcc,

        subject:
          queue.subject,

        message:
          queue.message,

        htmlBody:
          queue.htmlBody,

        type:
          queue.type,

        priority:
          queue.priority,

        userId:
          queue.userId,

        createdBy:
          queue.createdBy ||
          "QUEUE"

      });


    markEmailQueueSent(
      queueId,
      lock.lockId
    );


    return {

      success:
        true,

      queueId:
        queueId,

      result:
        result

    };


  } catch (error) {

    markEmailQueueFailed(

      queueId,

      lock.lockId,

      error.message

    );


    return {

      success:
        false,

      queueId:
        queueId,

      error:
        error.message

    };

  }

}


// =====================================================
// PROCESS EMAIL QUEUE
// =====================================================

function processEmailQueue() {

  if (
    !isEmailQueueEnabled()
  ) {

    return {

      success:
        false,

      message:
        "Email queue is disabled"

    };

  }


  const lock =
    LockService
      .getScriptLock();


  if (
    !lock.tryLock(5000)
  ) {

    return {

      success:
        false,

      message:
        "Another queue processor is running"

    };

  }


  try {

    const queue =
      getQueuedEmails(
        EMAIL_QUEUE_CONFIG.BATCH_SIZE
      );


    const results = [];


    queue.forEach(
      function(item) {

        results.push(
          processEmailQueueItem(
            item.id
          )
        );

      }
    );


    return {

      success:
        true,

      processed:
        results.length,

      results:
        results

    };


  } finally {

    lock.releaseLock();

  }

}


// =====================================================
// CANCEL QUEUED EMAIL
// =====================================================

function cancelQueuedEmail(
  queueId
) {

  const queue =
    getEmailQueueById(
      queueId
    );


  if (!queue) {

    throw new Error(
      "Queue item not found"
    );

  }


  if (
    queue.status !==
      EMAIL_QUEUE_STATUSES.QUEUED &&
    queue.status !==
      EMAIL_QUEUE_STATUSES.RETRY
  ) {

    throw new Error(
      "Only queued or retry emails can be cancelled"
    );

  }


  return updateEmailQueueStatus(

    queueId,

    EMAIL_QUEUE_STATUSES.CANCELLED

  );

}


// =====================================================
// RECOVER STALE QUEUE ITEMS
// =====================================================

function recoverStaleEmailQueueItems() {

  const sheet =
    getEmailQueueSheet();


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
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .getValues();


  const now =
    Date.now();


  let recovered = 0;


  values.forEach(
    function(row, index) {

      const status =
        row[
          EMAIL_QUEUE_COLUMNS.STATUS - 1
        ];


      if (
        status !==
        EMAIL_QUEUE_STATUSES.PROCESSING
      ) {

        return;

      }


      const lockDate =
        row[
          EMAIL_QUEUE_COLUMNS.LOCK_DATE - 1
        ];


      if (!lockDate) {

        return;

      }


      const age =
        now -
        new Date(
          lockDate
        ).getTime();


      const timeout =
        EMAIL_QUEUE_CONFIG
          .PROCESSING_TIMEOUT_MINUTES *
        60 *
        1000;


      if (
        age <= timeout
      ) {

        return;

      }


      const rowNumber =
        index + 2;


      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.STATUS
        )
        .setValue(
          EMAIL_QUEUE_STATUSES.RETRY
        );


      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.NEXT_ATTEMPT
        )
        .setValue(
          new Date()
        );


      sheet
        .getRange(
          rowNumber,
          EMAIL_QUEUE_COLUMNS.LOCK_ID,
          1,
          2
        )
        .clearContent();


      recovered++;

    }
  );


  return recovered;

}


// =====================================================
// CLEAN OLD QUEUE RECORDS
// =====================================================

function cleanupEmailQueue(
  days
) {

  const retentionDays =
    Number(days || 30);


  const cutoff =
    Date.now() -
    retentionDays *
    24 *
    60 *
    60 *
    1000;


  const sheet =
    getEmailQueueSheet();


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
        EMAIL_QUEUE_COLUMNS.LOCK_DATE
      )
      .getValues();


  let removed = 0;


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const status =
      values[i][
        EMAIL_QUEUE_COLUMNS.STATUS - 1
      ];


    if (
      status !==
        EMAIL_QUEUE_STATUSES.SENT &&
      status !==
        EMAIL_QUEUE_STATUSES.FAILED &&
      status !==
        EMAIL_QUEUE_STATUSES.CANCELLED &&
      status !==
        EMAIL_QUEUE_STATUSES.EXPIRED
    ) {

      continue;

    }


    const created =
      values[i][
        EMAIL_QUEUE_COLUMNS.CREATED_DATE - 1
      ];


    if (!created) {

      continue;

    }


    if (
      new Date(
        created
      ).getTime() <
      cutoff
    ) {

      sheet.deleteRow(
        i + 2
      );

      removed++;

    }

  }


  return removed;

}


// =====================================================
// GET QUEUE STATISTICS
// =====================================================

function getEmailQueueStatistics() {

  const sheet =
    getEmailQueueSheet();


  const lastRow =
    sheet.getLastRow();


  const stats = {

    total:
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

    expired:
      0

  };


  if (
    lastRow <= 1
  ) {

    return stats;

  }


  const values =
    sheet
      .getRange(
        2,
        EMAIL_QUEUE_COLUMNS.STATUS,
        lastRow - 1,
        1
      )
      .getValues();


  values.forEach(
    function(row) {

      const status =
        row[0];


      stats.total++;


      switch (status) {

        case EMAIL_QUEUE_STATUSES.QUEUED:
          stats.queued++;
          break;

        case EMAIL_QUEUE_STATUSES.PROCESSING:
          stats.processing++;
          break;

        case EMAIL_QUEUE_STATUSES.SENT:
          stats.sent++;
          break;

        case EMAIL_QUEUE_STATUSES.FAILED:
          stats.failed++;
          break;

        case EMAIL_QUEUE_STATUSES.RETRY:
          stats.retry++;
          break;

        case EMAIL_QUEUE_STATUSES.CANCELLED:
          stats.cancelled++;
          break;

        case EMAIL_QUEUE_STATUSES.EXPIRED:
          stats.expired++;
          break;

      }

    }
  );


  return stats;

}