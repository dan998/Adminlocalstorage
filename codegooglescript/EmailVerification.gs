// =====================================================
// EMAILVERIFICATION.GS
// Email Address Verification System
// Registration System API
// =====================================================


// =====================================================
// VERIFICATION CONFIGURATION
// =====================================================

const EMAIL_VERIFICATION_CONFIG = {

  ENABLED:
    true,

  CODE_LENGTH:
    6,

  CODE_EXPIRY_MINUTES:
    10,

  MAX_ATTEMPTS:
    5,

  MAX_RESENDS:
    5,

  RESEND_COOLDOWN_SECONDS:
    60,

  TOKEN_EXPIRY_MINUTES:
    30,

  MAX_DAILY_CODES:
    10,

  HASH_CODES:
    true

};


// =====================================================
// VERIFICATION STATUSES
// =====================================================

const EMAIL_VERIFICATION_STATUSES = {

  PENDING:
    "Pending",

  VERIFIED:
    "Verified",

  EXPIRED:
    "Expired",

  FAILED:
    "Failed",

  LOCKED:
    "Locked"

};


// =====================================================
// VERIFICATION SHEET
// =====================================================

const EMAIL_VERIFICATION_SHEET =
  "EMAIL_VERIFICATIONS";


// =====================================================
// VERIFICATION COLUMNS
// =====================================================

const EMAIL_VERIFICATION_COLUMNS = {

  ID: 1,

  USER_ID: 2,

  EMAIL: 3,

  CODE_HASH: 4,

  STATUS: 5,

  ATTEMPTS: 6,

  RESEND_COUNT: 7,

  CREATED_DATE: 8,

  EXPIRY_DATE: 9,

  VERIFIED_DATE: 10,

  LAST_SENT_DATE: 11,

  TOKEN_HASH: 12,

  TOKEN_EXPIRY: 13,

  IP_ADDRESS: 14,

  DEVICE_ID: 15,

  ERROR_MESSAGE: 16

};


// =====================================================
// GET VERIFICATION SHEET
// =====================================================

function getEmailVerificationSheet() {

  return getSheet(
    SHEETS.EMAIL_VERIFICATIONS ||
    EMAIL_VERIFICATION_SHEET
  );

}


// =====================================================
// GENERATE VERIFICATION ID
// =====================================================

function generateEmailVerificationId() {

  return (
    "VERIFY-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// GENERATE VERIFICATION CODE
// =====================================================

function generateEmailVerificationCode() {

  const length =
    EMAIL_VERIFICATION_CONFIG
      .CODE_LENGTH;


  let code = "";


  for (
    let i = 0;
    i < length;
    i++
  ) {

    code +=
      Math.floor(
        Math.random() * 10
      );

  }


  return code;

}


// =====================================================
// HASH VERIFICATION CODE
// =====================================================

function hashEmailVerificationCode(
  code
) {

  if (
    typeof hashPassword ===
    "function"
  ) {

    return hashPassword(
      String(code)
    );

  }


  const digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(code),
      Utilities.Charset.UTF_8
    );


  return digest
    .map(
      function(byte) {

        const value =
          byte < 0
            ? byte + 256
            : byte;

        return (
          "0" +
          value.toString(16)
        ).slice(-2);

      }
    )
    .join("");

}


// =====================================================
// GENERATE VERIFICATION TOKEN
// =====================================================

function generateEmailVerificationToken() {

  return (
    Utilities.getUuid() +
    "-" +
    Utilities.getUuid()
  );

}


// =====================================================
// HASH TOKEN
// =====================================================

function hashEmailVerificationToken(
  token
) {

  return hashEmailVerificationCode(
    token
  );

}


// =====================================================
// VALIDATE EMAIL
// =====================================================

function isValidVerificationEmail(
  email
) {

  if (!email) {

    return false;

  }


  const value =
    String(email)
      .trim()
      .toLowerCase();


  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(value);

}


// =====================================================
// NORMALIZE EMAIL
// =====================================================

function normalizeVerificationEmail(
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
// CREATE VERIFICATION RECORD
// =====================================================

function createEmailVerificationRecord(
  userId,
  email,
  code,
  options
) {

  options =
    options || {};


  const sheet =
    getEmailVerificationSheet();


  const now =
    new Date();


  const expiry =
    new Date(
      now.getTime() +
      EMAIL_VERIFICATION_CONFIG
        .CODE_EXPIRY_MINUTES *
      60 *
      1000
    );


  const verificationId =
    generateEmailVerificationId();


  const codeHash =
    EMAIL_VERIFICATION_CONFIG
      .HASH_CODES
      ? hashEmailVerificationCode(
          code
        )
      : code;


  sheet.appendRow([

    verificationId,

    userId ||
      "",

    normalizeVerificationEmail(
      email
    ),

    codeHash,

    EMAIL_VERIFICATION_STATUSES
      .PENDING,

    0,

    0,

    now,

    expiry,

    "",

    now,

    "",

    "",

    options.ipAddress ||
      "",

    options.deviceId ||
      "",

    ""

  ]);


  return {

    id:
      verificationId,

    email:
      normalizeVerificationEmail(
        email
      ),

    expires:
      expiry

  };

}


// =====================================================
// SEND VERIFICATION EMAIL
// =====================================================

function sendEmailVerification(
  userId,
  email,
  options
) {

  if (
    !EMAIL_VERIFICATION_CONFIG
      .ENABLED
  ) {

    throw new Error(
      "Email verification is disabled"
    );

  }


  options =
    options || {};


  const normalizedEmail =
    normalizeVerificationEmail(
      email
    );


  if (
    !isValidVerificationEmail(
      normalizedEmail
    )
  ) {

    throw new Error(
      "Invalid email address"
    );

  }


  const cooldown =
    getEmailVerificationCooldown(
      normalizedEmail
    );


  if (
    cooldown.remainingSeconds >
    0
  ) {

    throw new Error(
      "Please wait " +
      cooldown.remainingSeconds +
      " seconds before requesting another verification code"
    );

  }


  const code =
    generateEmailVerificationCode();


  const record =
    createEmailVerificationRecord(
      userId,
      normalizedEmail,
      code,
      options
    );


  const variables =
    prepareEmailTemplateVariables({

      userId:
        userId,

      email:
        normalizedEmail,

      verificationCode:
        code,

      verificationExpiry:
        record.expires,

      expiresInMinutes:
        EMAIL_VERIFICATION_CONFIG
          .CODE_EXPIRY_MINUTES

    });


  let template;


  if (
    typeof getSystemEmailTemplate ===
    "function"
  ) {

    template =
      getSystemEmailTemplate(
        EMAIL_TYPES.VERIFICATION
      );

  }


  let subject =
    "Verify your email address";


  let message =
    "Your verification code is: " +
    code;


  let htmlBody =
    "<p>Your verification code is:</p>" +
    "<h2>" +
    code +
    "</h2>" +
    "<p>This code expires in " +
    EMAIL_VERIFICATION_CONFIG
      .CODE_EXPIRY_MINUTES +
    " minutes.</p>";


  if (template) {

    const rendered =
      renderCompleteEmailTemplate(
        template,
        variables
      );


    subject =
      rendered.subject ||
      subject;

    message =
      rendered.body ||
      message;

    htmlBody =
      rendered.htmlBody ||
      htmlBody;

  }


  let sendResult;


  if (
    typeof queueEmail ===
    "function"
  ) {

    sendResult =
      queueEmail({

        emailId:
          record.id,

        userId:
          userId,

        recipients:
          [normalizedEmail],

        subject:
          subject,

        message:
          message,

        htmlBody:
          htmlBody,

        type:
          EMAIL_TYPES.VERIFICATION,

        priority:
          typeof EMAIL_QUEUE_PRIORITIES !==
          "undefined"
            ? EMAIL_QUEUE_PRIORITIES.HIGH
            : 10,

        createdBy:
          "EMAIL_VERIFICATION"

      });

  } else if (
    typeof sendHtmlEmail ===
    "function"
  ) {

    sendResult =
      sendHtmlEmail({

        to:
          normalizedEmail,

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

    verificationId:
      record.id,

    email:
      normalizedEmail,

    expiresAt:
      record.expires,

    result:
      sendResult

  };

}


// =====================================================
// FIND VERIFICATION RECORD
// =====================================================

function findEmailVerificationRecord(
  identifier
) {

  const sheet =
    getEmailVerificationSheet();


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
        EMAIL_VERIFICATION_COLUMNS
          .ERROR_MESSAGE
      )
      .getValues();


  for (
    let i = values.length - 1;
    i >= 0;
    i--
  ) {

    const row =
      values[i];


    const id =
      row[
        EMAIL_VERIFICATION_COLUMNS.ID - 1
      ];


    const email =
      row[
        EMAIL_VERIFICATION_COLUMNS.EMAIL - 1
      ];


    const userId =
      row[
        EMAIL_VERIFICATION_COLUMNS.USER_ID - 1
      ];


    if (
      String(id) ===
      String(identifier) ||

      String(email).toLowerCase() ===
      String(identifier).toLowerCase() ||

      String(userId) ===
      String(identifier)
    ) {

      return {

        rowNumber:
          i + 2,

        data:
          emailVerificationRowToObject(
            row
          )

      };

    }

  }


  return null;

}


// =====================================================
// CONVERT VERIFICATION ROW
// =====================================================

function emailVerificationRowToObject(
  row
) {

  return {

    id:
      row[
        EMAIL_VERIFICATION_COLUMNS.ID - 1
      ],

    userId:
      row[
        EMAIL_VERIFICATION_COLUMNS.USER_ID - 1
      ],

    email:
      row[
        EMAIL_VERIFICATION_COLUMNS.EMAIL - 1
      ],

    codeHash:
      row[
        EMAIL_VERIFICATION_COLUMNS.CODE_HASH - 1
      ],

    status:
      row[
        EMAIL_VERIFICATION_COLUMNS.STATUS - 1
      ],

    attempts:
      Number(
        row[
          EMAIL_VERIFICATION_COLUMNS
            .ATTEMPTS - 1
        ] || 0
      ),

    resendCount:
      Number(
        row[
          EMAIL_VERIFICATION_COLUMNS
            .RESEND_COUNT - 1
        ] || 0
      ),

    createdDate:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .CREATED_DATE - 1
      ],

    expiryDate:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .EXPIRY_DATE - 1
      ],

    verifiedDate:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .VERIFIED_DATE - 1
      ],

    lastSentDate:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .LAST_SENT_DATE - 1
      ],

    tokenHash:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .TOKEN_HASH - 1
      ],

    tokenExpiry:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .TOKEN_EXPIRY - 1
      ],

    ipAddress:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .IP_ADDRESS - 1
      ],

    deviceId:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .DEVICE_ID - 1
      ],

    errorMessage:
      row[
        EMAIL_VERIFICATION_COLUMNS
          .ERROR_MESSAGE - 1
      ]

  };

}


// =====================================================
// VERIFY EMAIL CODE
// =====================================================

function verifyEmailCode(
  identifier,
  code
) {

  if (!code) {

    throw new Error(
      "Verification code is required"
    );

  }


  const found =
    findEmailVerificationRecord(
      identifier
    );


  if (!found) {

    throw new Error(
      "Verification request not found"
    );

  }


  const record =
    found.data;


  if (
    record.status ===
    EMAIL_VERIFICATION_STATUSES
      .VERIFIED
  ) {

    return {

      success:
        true,

      verified:
        true,

      message:
        "Email is already verified"

    };

  }


  if (
    record.status ===
    EMAIL_VERIFICATION_STATUSES
      .LOCKED
  ) {

    throw new Error(
      "Email verification is locked"
    );

  }


  if (
    record.attempts >=
    EMAIL_VERIFICATION_CONFIG
      .MAX_ATTEMPTS
  ) {

    updateEmailVerificationStatus(
      found.rowNumber,
      EMAIL_VERIFICATION_STATUSES
        .LOCKED,
      "Maximum verification attempts exceeded"
    );


    throw new Error(
      "Maximum verification attempts exceeded"
    );

  }


  const expiry =
    new Date(
      record.expiryDate
    );


  if (
    isNaN(
      expiry.getTime()
    ) ||
    expiry.getTime() <
    Date.now()
  ) {

    updateEmailVerificationStatus(
      found.rowNumber,
      EMAIL_VERIFICATION_STATUSES
        .EXPIRED,
      "Verification code expired"
    );


    throw new Error(
      "Verification code has expired"
    );

  }


  const suppliedHash =
    hashEmailVerificationCode(
      String(code)
        .trim()
    );


  if (
    suppliedHash !==
    record.codeHash
  ) {

    incrementEmailVerificationAttempt(
      found.rowNumber
    );


    throw new Error(
      "Invalid verification code"
    );

  }


  const now =
    new Date();


  const sheet =
    getEmailVerificationSheet();


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_VERIFICATION_COLUMNS
        .STATUS
    )
    .setValue(
      EMAIL_VERIFICATION_STATUSES
        .VERIFIED
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_VERIFICATION_COLUMNS
        .VERIFIED_DATE
    )
    .setValue(
      now
    );


  // ---------------------------------------------------
  // UPDATE USER VERIFY STATUS
  // ---------------------------------------------------

  markUserEmailAsVerified(
    record.userId,
    record.email
  );


  return {

    success:
      true,

    verified:
      true,

    verificationId:
      record.id,

    userId:
      record.userId,

    email:
      record.email,

    verifiedDate:
      now

  };

}


// =====================================================
// UPDATE VERIFICATION STATUS
// =====================================================

function updateEmailVerificationStatus(
  rowNumber,
  status,
  errorMessage
) {

  const sheet =
    getEmailVerificationSheet();


  sheet
    .getRange(
      rowNumber,
      EMAIL_VERIFICATION_COLUMNS
        .STATUS
    )
    .setValue(
      status
    );


  if (
    errorMessage
  ) {

    sheet
      .getRange(
        rowNumber,
        EMAIL_VERIFICATION_COLUMNS
          .ERROR_MESSAGE
      )
      .setValue(
        errorMessage
      );

  }

}


// =====================================================
// INCREMENT ATTEMPTS
// =====================================================

function incrementEmailVerificationAttempt(
  rowNumber
) {

  const sheet =
    getEmailVerificationSheet();


  const cell =
    sheet.getRange(
      rowNumber,
      EMAIL_VERIFICATION_COLUMNS
        .ATTEMPTS
    );


  const current =
    Number(
      cell.getValue() || 0
    );


  const next =
    current + 1;


  cell.setValue(
    next
  );


  if (
    next >=
    EMAIL_VERIFICATION_CONFIG
      .MAX_ATTEMPTS
  ) {

    updateEmailVerificationStatus(
      rowNumber,
      EMAIL_VERIFICATION_STATUSES
        .LOCKED,
      "Maximum verification attempts exceeded"
    );

  }

}


// =====================================================
// RESEND VERIFICATION CODE
// =====================================================

function resendEmailVerification(
  userId,
  email,
  options
) {

  const normalizedEmail =
    normalizeVerificationEmail(
      email
    );


  if (
    !isValidVerificationEmail(
      normalizedEmail
    )
  ) {

    throw new Error(
      "Invalid email address"
    );

  }


  const found =
    findEmailVerificationRecord(
      normalizedEmail
    );


  if (
    found &&
    found.data.resendCount >=
    EMAIL_VERIFICATION_CONFIG
      .MAX_RESENDS
  ) {

    throw new Error(
      "Maximum verification resends exceeded"
    );

  }


  const cooldown =
    getEmailVerificationCooldown(
      normalizedEmail
    );


  if (
    cooldown.remainingSeconds >
    0
  ) {

    throw new Error(
      "Please wait " +
      cooldown.remainingSeconds +
      " seconds before requesting another code"
    );

  }


  const result =
    sendEmailVerification(
      userId,
      normalizedEmail,
      options
    );


  if (found) {

    const sheet =
      getEmailVerificationSheet();


    const cell =
      sheet.getRange(
        found.rowNumber,
        EMAIL_VERIFICATION_COLUMNS
          .RESEND_COUNT
      );


    const count =
      Number(
        cell.getValue() || 0
      );


    cell.setValue(
      count + 1
    );

  }


  return result;

}


// =====================================================
// GET VERIFICATION COOLDOWN
// =====================================================

function getEmailVerificationCooldown(
  email
) {

  const found =
    findEmailVerificationRecord(
      normalizeVerificationEmail(
        email
      )
    );


  if (!found) {

    return {

      allowed:
        true,

      remainingSeconds:
        0

    };

  }


  const lastSent =
    new Date(
      found.data.lastSentDate
    );


  if (
    isNaN(
      lastSent.getTime()
    )
  ) {

    return {

      allowed:
        true,

      remainingSeconds:
        0

    };

  }


  const elapsed =
    Math.floor(
      (
        Date.now() -
        lastSent.getTime()
      ) / 1000
    );


  const remaining =
    Math.max(
      0,
      EMAIL_VERIFICATION_CONFIG
        .RESEND_COOLDOWN_SECONDS -
      elapsed
    );


  return {

    allowed:
      remaining === 0,

    remainingSeconds:
      remaining

  };

}


// =====================================================
// CHECK EMAIL VERIFICATION STATUS
// =====================================================

function getEmailVerificationStatus(
  identifier
) {

  const found =
    findEmailVerificationRecord(
      identifier
    );


  if (!found) {

    return {

      exists:
        false,

      verified:
        false,

      status:
        EMAIL_VERIFICATION_STATUSES
          .PENDING

    };

  }


  const record =
    found.data;


  return {

    exists:
      true,

    verified:
      record.status ===
      EMAIL_VERIFICATION_STATUSES
        .VERIFIED,

    status:
      record.status,

    email:
      record.email,

    userId:
      record.userId,

    expiresAt:
      record.expiryDate,

    attempts:
      record.attempts,

    resendCount:
      record.resendCount

  };

}


// =====================================================
// MARK USER EMAIL AS VERIFIED
// =====================================================

function markUserEmailAsVerified(
  userId,
  email
) {

  if (
    !userId
  ) {

    return false;

  }


  // ---------------------------------------------------
  // Preferred project helper
  // ---------------------------------------------------

  if (
    typeof updateUserVerifyStatus ===
    "function"
  ) {

    updateUserVerifyStatus(
      userId,
      true
    );

    return true;

  }


  // ---------------------------------------------------
  // Fallback: locate USERS sheet
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

      return false;

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

      const row =
        values[i];


      const id =
        row[0];


      if (
        String(id) ===
        String(userId)
      ) {

        // Based on the user's
        // current Users schema:
        //
        // Verify Status = column 12

        sheet
          .getRange(
            i + 2,
            12
          )
          .setValue(
            "Verified"
          );


        return true;

      }

    }

  } catch (error) {

    console.error(
      error.message
    );

  }


  return false;

}


// =====================================================
// CLEAN EXPIRED VERIFICATIONS
// =====================================================

function cleanupExpiredEmailVerifications() {

  const sheet =
    getEmailVerificationSheet();


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
        EMAIL_VERIFICATION_COLUMNS
          .ERROR_MESSAGE
      )
      .getValues();


  const now =
    Date.now();


  let cleaned =
    0;


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const status =
      values[i][
        EMAIL_VERIFICATION_COLUMNS
          .STATUS - 1
      ];


    if (
      status ===
      EMAIL_VERIFICATION_STATUSES
        .VERIFIED
    ) {

      continue;

    }


    const expiry =
      values[i][
        EMAIL_VERIFICATION_COLUMNS
          .EXPIRY_DATE - 1
      ];


    if (!expiry) {

      continue;

    }


    if (
      new Date(
        expiry
      ).getTime() < now
    ) {

      sheet
        .getRange(
          i + 2,
          EMAIL_VERIFICATION_COLUMNS
            .STATUS
        )
        .setValue(
          EMAIL_VERIFICATION_STATUSES
            .EXPIRED
        );


      cleaned++;

    }

  }


  return cleaned;

}


// =====================================================
// DELETE OLD VERIFICATION RECORDS
// =====================================================

function deleteOldEmailVerificationRecords(
  days
) {

  const retentionDays =
    Number(
      days || 30
    );


  const cutoff =
    Date.now() -
    retentionDays *
    24 *
    60 *
    60 *
    1000;


  const sheet =
    getEmailVerificationSheet();


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
        EMAIL_VERIFICATION_COLUMNS
          .ERROR_MESSAGE
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
      values[i][
        EMAIL_VERIFICATION_COLUMNS
          .CREATED_DATE - 1
      ];


    if (!created) {

      continue;

    }


    const status =
      values[i][
        EMAIL_VERIFICATION_COLUMNS
          .STATUS - 1
      ];


    if (
      status ===
      EMAIL_VERIFICATION_STATUSES
        .PENDING
    ) {

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

      deleted++;

    }

  }


  return deleted;

}


// =====================================================
// VERIFICATION CONFIG
// =====================================================

function getEmailVerificationConfig() {

  return {

    enabled:
      EMAIL_VERIFICATION_CONFIG
        .ENABLED,

    codeLength:
      EMAIL_VERIFICATION_CONFIG
        .CODE_LENGTH,

    codeExpiryMinutes:
      EMAIL_VERIFICATION_CONFIG
        .CODE_EXPIRY_MINUTES,

    maxAttempts:
      EMAIL_VERIFICATION_CONFIG
        .MAX_ATTEMPTS,

    maxResends:
      EMAIL_VERIFICATION_CONFIG
        .MAX_RESENDS,

    resendCooldownSeconds:
      EMAIL_VERIFICATION_CONFIG
        .RESEND_COOLDOWN_SECONDS,

    tokenExpiryMinutes:
      EMAIL_VERIFICATION_CONFIG
        .TOKEN_EXPIRY_MINUTES

  };

}