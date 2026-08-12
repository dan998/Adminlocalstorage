// =====================================================
// EMAILRECIPIENTS.GS
// Email Recipient Management
// Registration System API
// =====================================================


// =====================================================
// GET ADMIN RECIPIENTS
// =====================================================

function getEmailAdminRecipients() {

  const recipients =
    getAdminRecipients();

  return normalizeEmailRecipients(
    recipients
  );

}


// =====================================================
// GET SUPPORT RECIPIENTS
// =====================================================

function getEmailSupportRecipients() {

  const recipients =
    getSupportRecipients();

  return normalizeEmailRecipients(
    recipients
  );

}


// =====================================================
// GET BACKEND RECIPIENT
// =====================================================

function getEmailBackendRecipient() {

  const email =
    getBackendEmail();

  if (
    !email ||
    !isValidEmailAddress(email)
  ) {

    throw new Error(
      "Invalid backend email configuration"
    );

  }

  return normalizeEmail(
    email
  );

}


// =====================================================
// GET REPLY-TO RECIPIENT
// =====================================================

function getEmailReplyToRecipient() {

  const email =
    getReplyToEmail();

  if (
    !email ||
    !isValidEmailAddress(email)
  ) {

    throw new Error(
      "Invalid reply-to email configuration"
    );

  }

  return normalizeEmail(
    email
  );

}


// =====================================================
// GET USER EMAIL
// =====================================================

function getUserEmailRecipient(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  // ---------------------------------------------------
  // Uses existing user helper when available
  // ---------------------------------------------------

  if (
    typeof getUserById ===
    "function"
  ) {

    const user =
      getUserById(
        userId
      );

    if (!user) {

      throw new Error(
        "User not found"
      );

    }

    const email =
      user.email ||
      user.EMAIL ||
      "";

    if (
      !email
    ) {

      throw new Error(
        "User does not have an email address"
      );

    }

    if (
      !isValidEmailAddress(email)
    ) {

      throw new Error(
        "User email address is invalid"
      );

    }

    return normalizeEmail(
      email
    );

  }


  throw new Error(
    "getUserById() is not available"
  );

}


// =====================================================
// GET USER EMAIL BY EMAIL
// =====================================================

function getEmailRecipient(
  email
) {

  if (!email) {

    throw new Error(
      "Email address is required"
    );

  }


  const normalized =
    normalizeEmail(
      email
    );


  if (
    !isValidEmailAddress(
      normalized
    )
  ) {

    throw new Error(
      "Invalid email address"
    );

  }


  return normalized;

}


// =====================================================
// NORMALIZE RECIPIENT LIST
// =====================================================

function normalizeRecipientList(
  recipients
) {

  if (!recipients) {
    return [];
  }


  let list;


  if (
    Array.isArray(
      recipients
    )
  ) {

    list =
      recipients;

  } else {

    list =
      String(
        recipients
      ).split(",");

  }


  const result = [];


  list.forEach(
    function(email) {

      if (
        email === null ||
        email === undefined
      ) {

        return;

      }


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
          "Invalid recipient email: " +
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
// REMOVE DUPLICATE RECIPIENTS
// =====================================================

function removeDuplicateEmailRecipients(
  recipients
) {

  return normalizeRecipientList(
    recipients
  );

}


// =====================================================
// VALIDATE RECIPIENTS
// =====================================================

function validateEmailRecipientList(
  recipients,
  options
) {

  options =
    options || {};


  const result =
    normalizeRecipientList(
      recipients
    );


  if (
    options.required !== false &&
    result.length === 0
  ) {

    throw new Error(
      "At least one email recipient is required"
    );

  }


  const config =
    getEmailConfiguration();


  const maxRecipients =
    options.maxRecipients ||
    config.MAX_RECIPIENTS;


  if (
    result.length >
    maxRecipients
  ) {

    throw new Error(
      "Email recipient limit exceeded"
    );

  }


  return result;

}


// =====================================================
// VALIDATE SINGLE RECIPIENT
// =====================================================

function validateSingleEmailRecipient(
  email
) {

  const recipients =
    validateEmailRecipientList(
      [email],
      {
        maxRecipients:
          1
      }
    );


  if (
    recipients.length !== 1
  ) {

    throw new Error(
      "Exactly one recipient is required"
    );

  }


  return recipients[0];

}


// =====================================================
// RESOLVE ADMIN RECIPIENTS
// =====================================================

function resolveAdminEmailRecipients() {

  return validateEmailRecipientList(
    getEmailAdminRecipients()
  );

}


// =====================================================
// RESOLVE SUPPORT RECIPIENTS
// =====================================================

function resolveSupportEmailRecipients() {

  return validateEmailRecipientList(
    getEmailSupportRecipients()
  );

}


// =====================================================
// RESOLVE USER RECIPIENT
// =====================================================

function resolveUserEmailRecipient(
  userId
) {

  return validateSingleEmailRecipient(
    getUserEmailRecipient(
      userId
    )
  );

}


// =====================================================
// BUILD EMAIL RECIPIENTS
// =====================================================

function buildEmailRecipients(
  data
) {

  data =
    data || {};


  let to =
    [];


  // ---------------------------------------------------
  // DIRECT RECIPIENTS
  // ---------------------------------------------------

  if (
    data.to
  ) {

    to =
      to.concat(
        normalizeRecipientList(
          data.to
        )
      );

  }


  // ---------------------------------------------------
  // USER ID
  // ---------------------------------------------------

  if (
    data.userId
  ) {

    to.push(
      getUserEmailRecipient(
        data.userId
      )
    );

  }


  // ---------------------------------------------------
  // ADMIN
  // ---------------------------------------------------

  if (
    data.admin === true
  ) {

    to =
      to.concat(
        getEmailAdminRecipients()
      );

  }


  // ---------------------------------------------------
  // SUPPORT
  // ---------------------------------------------------

  if (
    data.support === true
  ) {

    to =
      to.concat(
        getEmailSupportRecipients()
      );

  }


  // ---------------------------------------------------
  // BACKEND
  // ---------------------------------------------------

  if (
    data.backend === true
  ) {

    to.push(
      getEmailBackendRecipient()
    );

  }


  return validateEmailRecipientList(
    to
  );

}


// =====================================================
// BUILD CC RECIPIENTS
// =====================================================

function buildEmailCcRecipients(
  recipients
) {

  const config =
    getEmailConfiguration();


  if (
    !recipients
  ) {

    return [];

  }


  if (
    config.ALLOW_CC !== true
  ) {

    throw new Error(
      "CC recipients are disabled"
    );

  }


  return validateEmailRecipientList(
    recipients,
    {
      required:
        false
    }
  );

}


// =====================================================
// BUILD BCC RECIPIENTS
// =====================================================

function buildEmailBccRecipients(
  recipients
) {

  const config =
    getEmailConfiguration();


  if (
    !recipients
  ) {

    return [];

  }


  if (
    config.ALLOW_BCC !== true
  ) {

    throw new Error(
      "BCC recipients are disabled"
    );

  }


  return validateEmailRecipientList(
    recipients,
    {
      required:
        false
    }
  );

}


// =====================================================
// REMOVE TO/CC/BCC DUPLICATES
// =====================================================

function removeEmailRecipientDuplicates(
  to,
  cc,
  bcc
) {

  const toList =
    normalizeRecipientList(
      to
    );


  const toSet = {};


  toList.forEach(
    function(email) {

      toSet[email] =
        true;

    }
  );


  const ccList =
    normalizeRecipientList(
      cc
    ).filter(
      function(email) {

        return !toSet[email];

      }
    );


  ccList.forEach(
    function(email) {

      toSet[email] =
        true;

    }
  );


  const bccList =
    normalizeRecipientList(
      bcc
    ).filter(
      function(email) {

        return !toSet[email];

      }
    );


  return {

    to:
      toList,

    cc:
      ccList,

    bcc:
      bccList

  };

}


// =====================================================
// PREPARE EMAIL RECIPIENTS
// =====================================================

function prepareEmailRecipients(
  data
) {

  data =
    data || {};


  let to =
    buildEmailRecipients(
      data
    );


  let cc =
    buildEmailCcRecipients(
      data.cc
    );


  let bcc =
    buildEmailBccRecipients(
      data.bcc
    );


  const cleaned =
    removeEmailRecipientDuplicates(
      to,
      cc,
      bcc
    );


  return {

    to:
      cleaned.to,

    cc:
      cleaned.cc,

    bcc:
      cleaned.bcc,

    total:
      cleaned.to.length +
      cleaned.cc.length +
      cleaned.bcc.length

  };

}


// =====================================================
// CHECK IF EMAIL IS ADMIN
// =====================================================

function isAdminEmailRecipient(
  email
) {

  const normalized =
    normalizeEmail(
      email
    );


  return (
    getEmailAdminRecipients()
      .indexOf(
        normalized
      ) !== -1
  );

}


// =====================================================
// CHECK IF EMAIL IS SUPPORT
// =====================================================

function isSupportEmailRecipient(
  email
) {

  const normalized =
    normalizeEmail(
      email
    );


  return (
    getEmailSupportRecipients()
      .indexOf(
        normalized
      ) !== -1
  );

}


// =====================================================
// CHECK IF EMAIL IS BACKEND
// =====================================================

function isBackendEmailRecipient(
  email
) {

  const normalized =
    normalizeEmail(
      email
    );


  return (
    normalized ===
    getEmailBackendRecipient()
  );

}


// =====================================================
// CHECK AUTHORIZED ADMIN RECIPIENT
// =====================================================

function isAuthorizedAdminEmail(
  email
) {

  return isAdminEmailRecipient(
    email
  );

}


// =====================================================
// CHECK AUTHORIZED SUPPORT RECIPIENT
// =====================================================

function isAuthorizedSupportEmail(
  email
) {

  return isSupportEmailRecipient(
    email
  );

}


// =====================================================
// GET ALL SYSTEM EMAILS
// =====================================================

function getAllSystemEmailRecipients() {

  const recipients = [];

  recipients.push(
    getEmailBackendRecipient()
  );

  recipients.push(
    getEmailAdminRecipients()
  );

  recipients.push(
    getEmailSupportRecipients()
  );


  return normalizeRecipientList(
    recipients
  );

}


// =====================================================
// GET EMAIL RECIPIENT SUMMARY
// =====================================================

function getEmailRecipientSummary() {

  const admins =
    getEmailAdminRecipients();

  const support =
    getEmailSupportRecipients();

  const backend =
    getEmailBackendRecipient();


  return {

    backend:
      backend,

    admins:
      admins,

    support:
      support,

    adminCount:
      admins.length,

    supportCount:
      support.length,

    totalUniqueRecipients:
      normalizeRecipientList(
        admins.concat(
          support,
          [backend]
        )
      ).length

  };

}