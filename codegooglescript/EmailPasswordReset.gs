// =====================================================
// EMAILPASSWORDRESET.GS
// Password Reset Email System
// Registration System API
// =====================================================


// =====================================================
// PASSWORD RESET CONFIGURATION
// =====================================================

const EMAIL_PASSWORD_RESET_CONFIG = {

  ENABLED:
    true,

  CODE_LENGTH:
    6,

  CODE_EXPIRY_MINUTES:
    10,

  TOKEN_EXPIRY_MINUTES:
    15,

  MAX_ATTEMPTS:
    5,

  MAX_RESENDS:
    5,

  RESEND_COOLDOWN_SECONDS:
    60,

  MAX_DAILY_REQUESTS:
    5,

  HASH_CODES:
    true,

  HASH_TOKENS:
    true

};


// =====================================================
// PASSWORD RESET STATUSES
// =====================================================

const EMAIL_PASSWORD_RESET_STATUSES = {

  PENDING:
    "Pending",

  CODE_VERIFIED:
    "Code Verified",

  COMPLETED:
    "Completed",

  EXPIRED:
    "Expired",

  FAILED:
    "Failed",

  LOCKED:
    "Locked",

  CANCELLED:
    "Cancelled"

};


// =====================================================
// PASSWORD RESET SHEET
// =====================================================

const EMAIL_PASSWORD_RESET_SHEET =
  "EMAIL_PASSWORD_RESETS";


// =====================================================
// PASSWORD RESET COLUMNS
// =====================================================

const EMAIL_PASSWORD_RESET_COLUMNS = {

  ID: 1,

  USER_ID: 2,

  EMAIL: 3,

  CODE_HASH: 4,

  STATUS: 5,

  ATTEMPTS: 6,

  RESEND_COUNT: 7,

  CREATED_DATE: 8,

  CODE_EXPIRY: 9,

  CODE_VERIFIED_DATE: 10,

  RESET_TOKEN_HASH: 11,

  TOKEN_EXPIRY: 12,

  TOKEN_USED: 13,

  COMPLETED_DATE: 14,

  LAST_SENT_DATE: 15,

  IP_ADDRESS: 16,

  DEVICE_ID: 17,

  ERROR_MESSAGE: 18

};


// =====================================================
// GET PASSWORD RESET SHEET
// =====================================================

function getEmailPasswordResetSheet() {

  return getSheet(
    SHEETS.EMAIL_PASSWORD_RESETS ||
    EMAIL_PASSWORD_RESET_SHEET
  );

}


// =====================================================
// GENERATE RESET ID
// =====================================================

function generateEmailPasswordResetId() {

  return (
    "RESET-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// GENERATE RESET CODE
// =====================================================

function generateEmailPasswordResetCode() {

  const length =
    EMAIL_PASSWORD_RESET_CONFIG
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
// HASH RESET CODE
// =====================================================

function hashEmailPasswordResetCode(
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
// GENERATE RESET TOKEN
// =====================================================

function generateEmailPasswordResetToken() {

  return (
    Utilities.getUuid() +
    "-" +
    Utilities.getUuid() +
    "-" +
    Utilities.getUuid()
  );

}


// =====================================================
// HASH RESET TOKEN
// =====================================================

function hashEmailPasswordResetToken(
  token
) {

  return hashEmailPasswordResetCode(
    token
  );

}


// =====================================================
// NORMALIZE EMAIL
// =====================================================

function normalizePasswordResetEmail(
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
// VALIDATE EMAIL
// =====================================================

function isValidPasswordResetEmail(
  email
) {

  if (!email) {

    return false;

  }


  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      normalizePasswordResetEmail(
        email
      )
    );

}


// =====================================================
// CREATE RESET RECORD
// =====================================================

function createEmailPasswordResetRecord(
  userId,
  email,
  code,
  options
) {

  options =
    options || {};


  const sheet =
    getEmailPasswordResetSheet();


  const now =
    new Date();


  const expiry =
    new Date(
      now.getTime() +
      EMAIL_PASSWORD_RESET_CONFIG
        .CODE_EXPIRY_MINUTES *
      60 *
      1000
    );


  const resetId =
    generateEmailPasswordResetId();


  const codeHash =
    EMAIL_PASSWORD_RESET_CONFIG
      .HASH_CODES
      ? hashEmailPasswordResetCode(
          code
        )
      : code;


  sheet.appendRow([

    resetId,

    userId ||
      "",

    normalizePasswordResetEmail(
      email
    ),

    codeHash,

    EMAIL_PASSWORD_RESET_STATUSES
      .PENDING,

    0,

    0,

    now,

    expiry,

    "",

    "",

    "",

    false,

    "",

    now,

    options.ipAddress ||
      "",

    options.deviceId ||
      "",

    ""

  ]);


  return {

    id:
      resetId,

    userId:
      userId,

    email:
      normalizePasswordResetEmail(
        email
      ),

    codeExpiry:
      expiry

  };

}


// =====================================================
// REQUEST PASSWORD RESET
// =====================================================

function requestEmailPasswordReset(
  userId,
  email,
  options
) {

  if (
    !EMAIL_PASSWORD_RESET_CONFIG
      .ENABLED
  ) {

    throw new Error(
      "Password reset by email is disabled"
    );

  }


  options =
    options || {};


  const normalizedEmail =
    normalizePasswordResetEmail(
      email
    );


  if (
    !isValidPasswordResetEmail(
      normalizedEmail
    )
  ) {

    throw new Error(
      "Invalid email address"
    );

  }


  const cooldown =
    getEmailPasswordResetCooldown(
      normalizedEmail
    );


  if (
    cooldown.remainingSeconds >
    0
  ) {

    throw new Error(
      "Please wait " +
      cooldown.remainingSeconds +
      " seconds before requesting another reset code"
    );

  }


  const code =
    generateEmailPasswordResetCode();


  const record =
    createEmailPasswordResetRecord(
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

      resetCode:
        code,

      resetExpiry:
        record.codeExpiry,

      expiresInMinutes:
        EMAIL_PASSWORD_RESET_CONFIG
          .CODE_EXPIRY_MINUTES

    });


  let subject =
    "Password reset request";


  let message =
    "Your password reset code is: " +
    code +
    "\n\nThis code expires in " +
    EMAIL_PASSWORD_RESET_CONFIG
      .CODE_EXPIRY_MINUTES +
    " minutes.";


  let htmlBody =
    "<p>Your password reset code is:</p>" +
    "<h2>" +
    code +
    "</h2>" +
    "<p>This code expires in " +
    EMAIL_PASSWORD_RESET_CONFIG
      .CODE_EXPIRY_MINUTES +
    " minutes.</p>";


  // ---------------------------------------------------
  // USE SYSTEM TEMPLATE IF AVAILABLE
  // ---------------------------------------------------

  if (
    typeof getSystemEmailTemplate ===
    "function"
  ) {

    const template =
      getSystemEmailTemplate(
        EMAIL_TYPES.PASSWORD_RESET
      );


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

  }


  // ---------------------------------------------------
  // QUEUE EMAIL
  // ---------------------------------------------------

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
          EMAIL_TYPES.PASSWORD_RESET,

        priority:
          typeof EMAIL_QUEUE_PRIORITIES !==
          "undefined"
            ? EMAIL_QUEUE_PRIORITIES
                .CRITICAL
            : 20,

        createdBy:
          "PASSWORD_RESET"

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

    resetId:
      record.id,

    email:
      normalizedEmail,

    codeExpiry:
      record.codeExpiry,

    result:
      sendResult

  };

}


// =====================================================
// FIND RESET RECORD
// =====================================================

function findEmailPasswordResetRecord(
  identifier
) {

  if (!identifier) {

    return null;

  }


  const sheet =
    getEmailPasswordResetSheet();


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
        EMAIL_PASSWORD_RESET_COLUMNS
          .ERROR_MESSAGE
      )
      .getValues();


  const value =
    String(identifier)
      .trim()
      .toLowerCase();


  for (
    let i =
      values.length - 1;
    i >= 0;
    i--
  ) {

    const row =
      values[i];


    const id =
      String(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .ID - 1
        ]
      )
      .toLowerCase();


    const email =
      String(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .EMAIL - 1
        ]
      )
      .toLowerCase();


    const userId =
      String(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .USER_ID - 1
        ]
      )
      .toLowerCase();


    if (
      id === value ||
      email === value ||
      userId === value
    ) {

      return {

        rowNumber:
          i + 2,

        data:
          emailPasswordResetRowToObject(
            row
          )

      };

    }

  }


  return null;

}


// =====================================================
// CONVERT ROW TO OBJECT
// =====================================================

function emailPasswordResetRowToObject(
  row
) {

  return {

    id:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .ID - 1
      ],

    userId:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .USER_ID - 1
      ],

    email:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .EMAIL - 1
      ],

    codeHash:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .CODE_HASH - 1
      ],

    status:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .STATUS - 1
      ],

    attempts:
      Number(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .ATTEMPTS - 1
        ] || 0
      ),

    resendCount:
      Number(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .RESEND_COUNT - 1
        ] || 0
      ),

    createdDate:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .CREATED_DATE - 1
      ],

    codeExpiry:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .CODE_EXPIRY - 1
      ],

    codeVerifiedDate:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .CODE_VERIFIED_DATE - 1
      ],

    resetTokenHash:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .RESET_TOKEN_HASH - 1
      ],

    tokenExpiry:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .TOKEN_EXPIRY - 1
      ],

    tokenUsed:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .TOKEN_USED - 1
      ],

    completedDate:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .COMPLETED_DATE - 1
      ],

    lastSentDate:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .LAST_SENT_DATE - 1
      ],

    ipAddress:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .IP_ADDRESS - 1
      ],

    deviceId:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .DEVICE_ID - 1
      ],

    errorMessage:
      row[
        EMAIL_PASSWORD_RESET_COLUMNS
          .ERROR_MESSAGE - 1
      ]

  };

}


// =====================================================
// VERIFY PASSWORD RESET CODE
// =====================================================

function verifyEmailPasswordResetCode(
  identifier,
  code
) {

  if (!code) {

    throw new Error(
      "Password reset code is required"
    );

  }


  const found =
    findEmailPasswordResetRecord(
      identifier
    );


  if (!found) {

    throw new Error(
      "Password reset request not found"
    );

  }


  const record =
    found.data;


  if (
    record.status ===
    EMAIL_PASSWORD_RESET_STATUSES
      .COMPLETED
  ) {

    throw new Error(
      "Password reset has already been completed"
    );

  }


  if (
    record.status ===
      EMAIL_PASSWORD_RESET_STATUSES
        .LOCKED ||
    record.status ===
      EMAIL_PASSWORD_RESET_STATUSES
        .FAILED
  ) {

    throw new Error(
      "Password reset request is locked"
    );

  }


  if (
    record.attempts >=
    EMAIL_PASSWORD_RESET_CONFIG
      .MAX_ATTEMPTS
  ) {

    updateEmailPasswordResetStatus(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_STATUSES
        .LOCKED,
      "Maximum reset attempts exceeded"
    );


    throw new Error(
      "Maximum password reset attempts exceeded"
    );

  }


  const expiry =
    new Date(
      record.codeExpiry
    );


  if (
    isNaN(
      expiry.getTime()
    ) ||
    expiry.getTime() <
    Date.now()
  ) {

    updateEmailPasswordResetStatus(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_STATUSES
        .EXPIRED,
      "Password reset code expired"
    );


    throw new Error(
      "Password reset code has expired"
    );

  }


  const suppliedHash =
    hashEmailPasswordResetCode(
      String(code).trim()
    );


  if (
    suppliedHash !==
    record.codeHash
  ) {

    incrementEmailPasswordResetAttempt(
      found.rowNumber
    );


    throw new Error(
      "Invalid password reset code"
    );

  }


  const token =
    generateEmailPasswordResetToken();


  const tokenHash =
    EMAIL_PASSWORD_RESET_CONFIG
      .HASH_TOKENS
      ? hashEmailPasswordResetToken(
          token
        )
      : token;


  const tokenExpiry =
    new Date(
      Date.now() +
      EMAIL_PASSWORD_RESET_CONFIG
        .TOKEN_EXPIRY_MINUTES *
      60 *
      1000
    );


  const sheet =
    getEmailPasswordResetSheet();


  const now =
    new Date();


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .STATUS
    )
    .setValue(
      EMAIL_PASSWORD_RESET_STATUSES
        .CODE_VERIFIED
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .CODE_VERIFIED_DATE
    )
    .setValue(
      now
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .RESET_TOKEN_HASH
    )
    .setValue(
      tokenHash
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .TOKEN_EXPIRY
    )
    .setValue(
      tokenExpiry
    );


  return {

    success:
      true,

    verified:
      true,

    resetId:
      record.id,

    userId:
      record.userId,

    email:
      record.email,

    resetToken:
      token,

    tokenExpiry:
      tokenExpiry

  };

}


// =====================================================
// CHANGE PASSWORD WITH RESET TOKEN
// =====================================================

function resetPasswordWithEmailToken(
  resetToken,
  newPassword
) {

  if (!resetToken) {

    throw new Error(
      "Password reset token is required"
    );

  }


  if (!newPassword) {

    throw new Error(
      "New password is required"
    );

  }


  if (
    String(newPassword).length <
    8
  ) {

    throw new Error(
      "Password must contain at least 8 characters"
    );

  }


  const tokenHash =
    hashEmailPasswordResetToken(
      resetToken
    );


  const sheet =
    getEmailPasswordResetSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    throw new Error(
      "Invalid password reset token"
    );

  }


  const values =
    sheet
      .getRange(
        2,
        1,
        lastRow - 1,
        EMAIL_PASSWORD_RESET_COLUMNS
          .ERROR_MESSAGE
      )
      .getValues();


  let found =
    null;


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const storedHash =
      String(
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .RESET_TOKEN_HASH - 1
        ]
      );


    if (
      storedHash ===
      tokenHash
    ) {

      found = {

        rowNumber:
          i + 2,

        data:
          emailPasswordResetRowToObject(
            row
          )

      };


      break;

    }

  }


  if (!found) {

    throw new Error(
      "Invalid password reset token"
    );

  }


  const record =
    found.data;


  if (
    record.tokenUsed ===
    true ||
    String(
      record.tokenUsed
    ).toLowerCase() ===
    "true"
  ) {

    throw new Error(
      "Password reset token has already been used"
    );

  }


  if (
    record.status !==
    EMAIL_PASSWORD_RESET_STATUSES
      .CODE_VERIFIED
  ) {

    throw new Error(
      "Password reset code has not been verified"
    );

  }


  const tokenExpiry =
    new Date(
      record.tokenExpiry
    );


  if (
    isNaN(
      tokenExpiry.getTime()
    ) ||
    tokenExpiry.getTime() <
    Date.now()
  ) {

    updateEmailPasswordResetStatus(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_STATUSES
        .EXPIRED,
      "Password reset token expired"
    );


    throw new Error(
      "Password reset token has expired"
    );

  }


  // ---------------------------------------------------
  // HASH NEW PASSWORD
  // ---------------------------------------------------

  let passwordHash;


  if (
    typeof hashPassword ===
    "function"
  ) {

    passwordHash =
      hashPassword(
        String(newPassword)
      );

  } else {

    passwordHash =
      hashEmailPasswordResetCode(
        String(newPassword)
      );

  }


  // ---------------------------------------------------
  // UPDATE USER PASSWORD
  // ---------------------------------------------------

  const updated =
    updateUserPasswordFromReset(
      record.userId,
      record.email,
      passwordHash
    );


  if (!updated) {

    throw new Error(
      "Unable to update user password"
    );

  }


  const now =
    new Date();


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .STATUS
    )
    .setValue(
      EMAIL_PASSWORD_RESET_STATUSES
        .COMPLETED
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .TOKEN_USED
    )
    .setValue(
      true
    );


  sheet
    .getRange(
      found.rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
        .COMPLETED_DATE
    )
    .setValue(
      now
    );


  // ---------------------------------------------------
  // INVALIDATE OTHER RESET REQUESTS
  // ---------------------------------------------------

  invalidateOtherPasswordResetRequests(
    record.userId,
    record.id
  );


  // ---------------------------------------------------
  // OPTIONAL SESSION INVALIDATION
  // ---------------------------------------------------

  if (
    typeof deleteUserSessions ===
    "function"
  ) {

    try {

      deleteUserSessions(
        record.userId
      );

    } catch (error) {

      console.error(
        error.message
      );

    }

  }


  return {

    success:
      true,

    passwordChanged:
      true,

    resetId:
      record.id,

    userId:
      record.userId,

    email:
      record.email,

    completedDate:
      now

  };

}


// =====================================================
// UPDATE USER PASSWORD
// =====================================================

function updateUserPasswordFromReset(
  userId,
  email,
  passwordHash
) {

  // ---------------------------------------------------
  // Preferred project function
  // ---------------------------------------------------

  if (
    typeof updateUserPassword ===
    "function"
  ) {

    try {

      updateUserPassword(
        userId,
        passwordHash
      );

      return true;

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

      return false;

    }


    const lastColumn =
      sheet.getLastColumn();


    const values =
      sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          lastColumn
        )
        .getValues();


    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      const row =
        values[i];


      const rowUserId =
        String(
          row[0]
        );


      const rowEmail =
        String(
          row[2] ||
          ""
        )
        .toLowerCase();


      if (
        rowUserId ===
          String(userId) ||
        rowEmail ===
          normalizePasswordResetEmail(
            email
          )
      ) {

        // User schema:
        // Password Hash = column 8

        sheet
          .getRange(
            i + 2,
            8
          )
          .setValue(
            passwordHash
          );


        // Reset security fields if
        // they exist in the current schema.

        // Failed Login Attempts = column 27
        if (
          lastColumn >= 27
        ) {

          sheet
            .getRange(
              i + 2,
              27
            )
            .setValue(
              0
            );

        }


        // Account Locked = column 28
        if (
          lastColumn >= 28
        ) {

          sheet
            .getRange(
              i + 2,
              28
            )
            .setValue(
              false
            );

        }


        // Locked Expiry = column 29
        if (
          lastColumn >= 29
        ) {

          sheet
            .getRange(
              i + 2,
              29
          )
            .clearContent();

        }


        // Reset Code Hash = column 18
        if (
          lastColumn >= 18
        ) {

          sheet
            .getRange(
              i + 2,
              18
            )
            .clearContent();

        }


        // Reset Expiry = column 19
        if (
          lastColumn >= 19
        ) {

          sheet
            .getRange(
              i + 2,
              19
            )
            .clearContent();

        }


        // Reset Used = column 20
        if (
          lastColumn >= 20
        ) {

          sheet
            .getRange(
              i + 2,
              20
            )
            .setValue(
              true
            );

        }


        // Reset Attempts = column 21
        if (
          lastColumn >= 21
        ) {

          sheet
            .getRange(
              i + 2,
              21
            )
            .setValue(
              0
            );

        }


        // Reset Token = column 30
        if (
          lastColumn >= 30
        ) {

          sheet
            .getRange(
              i + 2,
              30
            )
            .clearContent();

        }


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
// INCREMENT RESET ATTEMPT
// =====================================================

function incrementEmailPasswordResetAttempt(
  rowNumber
) {

  const sheet =
    getEmailPasswordResetSheet();


  const cell =
    sheet.getRange(
      rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
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
    EMAIL_PASSWORD_RESET_CONFIG
      .MAX_ATTEMPTS
  ) {

    updateEmailPasswordResetStatus(
      rowNumber,
      EMAIL_PASSWORD_RESET_STATUSES
        .LOCKED,
      "Maximum password reset attempts exceeded"
    );

  }

}


// =====================================================
// UPDATE RESET STATUS
// =====================================================

function updateEmailPasswordResetStatus(
  rowNumber,
  status,
  errorMessage
) {

  const sheet =
    getEmailPasswordResetSheet();


  sheet
    .getRange(
      rowNumber,
      EMAIL_PASSWORD_RESET_COLUMNS
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
        EMAIL_PASSWORD_RESET_COLUMNS
          .ERROR_MESSAGE
      )
      .setValue(
        errorMessage
      );

  }

}


// =====================================================
// RESET CODE COOLDOWN
// =====================================================

function getEmailPasswordResetCooldown(
  email
) {

  const found =
    findEmailPasswordResetRecord(
      normalizePasswordResetEmail(
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
      EMAIL_PASSWORD_RESET_CONFIG
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
// RESEND PASSWORD RESET CODE
// =====================================================

function resendEmailPasswordResetCode(
  userId,
  email,
  options
) {

  const normalizedEmail =
    normalizePasswordResetEmail(
      email
    );


  if (
    !isValidPasswordResetEmail(
      normalizedEmail
    )
  ) {

    throw new Error(
      "Invalid email address"
    );

  }


  const found =
    findEmailPasswordResetRecord(
      normalizedEmail
    );


  if (
    found &&
    found.data.resendCount >=
    EMAIL_PASSWORD_RESET_CONFIG
      .MAX_RESENDS
  ) {

    throw new Error(
      "Maximum password reset resends exceeded"
    );

  }


  const cooldown =
    getEmailPasswordResetCooldown(
      normalizedEmail
    );


  if (
    cooldown.remainingSeconds >
    0
  ) {

    throw new Error(
      "Please wait " +
      cooldown.remainingSeconds +
      " seconds before requesting another reset code"
    );

  }


  const result =
    requestEmailPasswordReset(
      userId,
      normalizedEmail,
      options
    );


  if (found) {

    const sheet =
      getEmailPasswordResetSheet();


    const cell =
      sheet.getRange(
        found.rowNumber,
        EMAIL_PASSWORD_RESET_COLUMNS
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
// INVALIDATE OTHER RESET REQUESTS
// =====================================================

function invalidateOtherPasswordResetRequests(
  userId,
  completedResetId
) {

  if (!userId) {

    return 0;

  }


  const sheet =
    getEmailPasswordResetSheet();


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
        EMAIL_PASSWORD_RESET_COLUMNS
          .ERROR_MESSAGE
      )
      .getValues();


  let count =
    0;


  values.forEach(
    function(row, index) {

      const rowUserId =
        String(
          row[
            EMAIL_PASSWORD_RESET_COLUMNS
              .USER_ID - 1
          ]
        );


      const rowId =
        String(
          row[
            EMAIL_PASSWORD_RESET_COLUMNS
              .ID - 1
          ]
        );


      const status =
        row[
          EMAIL_PASSWORD_RESET_COLUMNS
            .STATUS - 1
        ];


      if (
        rowUserId ===
          String(userId) &&
        rowId !==
          String(completedResetId) &&
        (
          status ===
          EMAIL_PASSWORD_RESET_STATUSES
            .PENDING ||
          status ===
          EMAIL_PASSWORD_RESET_STATUSES
            .CODE_VERIFIED
        )
      ) {

        sheet
          .getRange(
            index + 2,
            EMAIL_PASSWORD_RESET_COLUMNS
              .STATUS
          )
          .setValue(
            EMAIL_PASSWORD_RESET_STATUSES
              .CANCELLED
          );


        count++;

      }

    }
  );


  return count;

}


// =====================================================
// GET PASSWORD RESET STATUS
// =====================================================

function getEmailPasswordResetStatus(
  identifier
) {

  const found =
    findEmailPasswordResetRecord(
      identifier
    );


  if (!found) {

    return {

      exists:
        false,

      status:
        EMAIL_PASSWORD_RESET_STATUSES
          .PENDING

    };

  }


  const record =
    found.data;


  return {

    exists:
      true,

    resetId:
      record.id,

    userId:
      record.userId,

    email:
      record.email,

    status:
      record.status,

    attempts:
      record.attempts,

    resendCount:
      record.resendCount,

    codeExpiry:
      record.codeExpiry,

    tokenExpiry:
      record.tokenExpiry,

    tokenUsed:
      record.tokenUsed

  };

}


// =====================================================
// CLEAN EXPIRED RESET REQUESTS
// =====================================================

function cleanupExpiredEmailPasswordResets() {

  const sheet =
    getEmailPasswordResetSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1