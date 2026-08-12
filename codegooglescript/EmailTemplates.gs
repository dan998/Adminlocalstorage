// =====================================================
// EMAILTEMPLATES.GS
// Central Email Template System
// Registration System API
// =====================================================


// =====================================================
// TEMPLATE TYPES
// =====================================================

const EMAIL_TEMPLATE_TYPES = {

  VERIFICATION:
    "Verification",

  PASSWORD_RESET:
    "Password Reset",

  WELCOME:
    "Welcome",

  LOGIN_ALERT:
    "Login Alert",

  SECURITY_ALERT:
    "Security Alert",

  DEPOSIT:
    "Deposit",

  WITHDRAWAL:
    "Withdrawal",

  ADMIN:
    "Admin",

  SUPPORT:
    "Support",

  NOTIFICATION:
    "Notification",

  BROADCAST:
    "Broadcast"

};


// =====================================================
// TEMPLATE STATUS
// =====================================================

const EMAIL_TEMPLATE_STATUS = {

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  DRAFT:
    "Draft",

  SYSTEM:
    "System"

};


// =====================================================
// TEMPLATE SHEET
// =====================================================

const EMAIL_TEMPLATE_SHEET =
  "EMAIL_TEMPLATES";


// =====================================================
// TEMPLATE COLUMNS
// =====================================================

const EMAIL_TEMPLATE_COLUMNS = {

  ID: 1,

  NAME: 2,

  TYPE: 3,

  SUBJECT: 4,

  BODY: 5,

  HTML_BODY: 6,

  STATUS: 7,

  VARIABLES: 8,

  DESCRIPTION: 9,

  CREATED_BY: 10,

  CREATED_DATE: 11,

  UPDATED_BY: 12,

  UPDATED_DATE: 13

};


// =====================================================
// SYSTEM TEMPLATES
// =====================================================

const SYSTEM_EMAIL_TEMPLATES = {

  VERIFICATION: {

    name:
      "Account Verification",

    type:
      EMAIL_TEMPLATE_TYPES.VERIFICATION,

    subject:
      "Verify your CodingFamilySlop account",

    body:
      "Hello {{username}},\n\n" +
      "Your verification code is: {{code}}\n\n" +
      "This code expires in {{expiresMinutes}} minutes.\n\n" +
      "If you did not request this code, please ignore this email.\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Verify Your Account</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>Your verification code is:</p>" +
      "<h1>{{code}}</h1>" +
      "<p>This code expires in {{expiresMinutes}} minutes.</p>" +
      "<p>If you did not request this code, please ignore this email.</p>" +
      "</div>"

  },


  PASSWORD_RESET: {

    name:
      "Password Reset",

    type:
      EMAIL_TEMPLATE_TYPES.PASSWORD_RESET,

    subject:
      "Password reset request",

    body:
      "Hello {{username}},\n\n" +
      "Your password reset code is: {{code}}\n\n" +
      "This code expires in {{expiresMinutes}} minutes.\n\n" +
      "If you did not request a password reset, secure your account immediately.\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Password Reset</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>Your password reset code is:</p>" +
      "<h1>{{code}}</h1>" +
      "<p>This code expires in {{expiresMinutes}} minutes.</p>" +
      "<p>If you did not request this reset, please secure your account.</p>" +
      "</div>"

  },


  WELCOME: {

    name:
      "Welcome Email",

    type:
      EMAIL_TEMPLATE_TYPES.WELCOME,

    subject:
      "Welcome to CodingFamilySlop",

    body:
      "Hello {{username}},\n\n" +
      "Welcome to CodingFamilySlop.\n\n" +
      "Your account has been created successfully.\n\n" +
      "We are happy to have you with us.\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Welcome to CodingFamilySlop</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>Your account has been created successfully.</p>" +
      "<p>We are happy to have you with us.</p>" +
      "</div>"

  },


  LOGIN_ALERT: {

    name:
      "Login Alert",

    type:
      EMAIL_TEMPLATE_TYPES.LOGIN_ALERT,

    subject:
      "New login to your account",

    body:
      "Hello {{username}},\n\n" +
      "A login was detected on your account.\n\n" +
      "Date: {{date}}\n" +
      "IP Address: {{ip}}\n" +
      "Device: {{device}}\n\n" +
      "If this was not you, secure your account immediately.\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>New Login Detected</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>A login was detected on your account.</p>" +
      "<ul>" +
      "<li>Date: {{date}}</li>" +
      "<li>IP Address: {{ip}}</li>" +
      "<li>Device: {{device}}</li>" +
      "</ul>" +
      "<p>If this was not you, secure your account immediately.</p>" +
      "</div>"

  },


  SECURITY_ALERT: {

    name:
      "Security Alert",

    type:
      EMAIL_TEMPLATE_TYPES.SECURITY_ALERT,

    subject:
      "Security alert for your account",

    body:
      "Hello {{username}},\n\n" +
      "A security event occurred on your account.\n\n" +
      "Event: {{event}}\n" +
      "Date: {{date}}\n" +
      "IP Address: {{ip}}\n\n" +
      "If you do not recognize this activity, please secure your account.\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Security Alert</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>A security event occurred on your account.</p>" +
      "<p><strong>Event:</strong> {{event}}</p>" +
      "<p><strong>Date:</strong> {{date}}</p>" +
      "<p><strong>IP:</strong> {{ip}}</p>" +
      "<p>If you do not recognize this activity, please secure your account.</p>" +
      "</div>"

  },


  DEPOSIT: {

    name:
      "Deposit Notification",

    type:
      EMAIL_TEMPLATE_TYPES.DEPOSIT,

    subject:
      "Deposit notification",

    body:
      "Hello {{username}},\n\n" +
      "Your deposit request has been processed.\n\n" +
      "Amount: {{amount}}\n" +
      "Currency: {{currency}}\n" +
      "Transaction ID: {{transactionId}}\n" +
      "Status: {{status}}\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Deposit Notification</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>Your deposit request has been processed.</p>" +
      "<p>Amount: {{amount}}</p>" +
      "<p>Currency: {{currency}}</p>" +
      "<p>Transaction ID: {{transactionId}}</p>" +
      "<p>Status: {{status}}</p>" +
      "</div>"

  },


  WITHDRAWAL: {

    name:
      "Withdrawal Notification",

    type:
      EMAIL_TEMPLATE_TYPES.WITHDRAWAL,

    subject:
      "Withdrawal notification",

    body:
      "Hello {{username}},\n\n" +
      "Your withdrawal request has been processed.\n\n" +
      "Amount: {{amount}}\n" +
      "Currency: {{currency}}\n" +
      "Transaction ID: {{transactionId}}\n" +
      "Status: {{status}}\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>Withdrawal Notification</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>Your withdrawal request has been processed.</p>" +
      "<p>Amount: {{amount}}</p>" +
      "<p>Currency: {{currency}}</p>" +
      "<p>Transaction ID: {{transactionId}}</p>" +
      "<p>Status: {{status}}</p>" +
      "</div>"

  },


  ADMIN: {

    name:
      "Admin Notification",

    type:
      EMAIL_TEMPLATE_TYPES.ADMIN,

    subject:
      "System administrator notification",

    body:
      "Hello Admin,\n\n" +
      "{{message}}\n\n" +
      "Date: {{date}}\n" +
      "System: {{systemName}}",

    htmlBody:
      "<div>" +
      "<h2>Administrator Notification</h2>" +
      "<p>{{message}}</p>" +
      "<p>Date: {{date}}</p>" +
      "<p>System: {{systemName}}</p>" +
      "</div>"

  },


  SUPPORT: {

    name:
      "Support Notification",

    type:
      EMAIL_TEMPLATE_TYPES.SUPPORT,

    subject:
      "Support request",

    body:
      "Hello Support,\n\n" +
      "A support request has been received.\n\n" +
      "User: {{username}}\n" +
      "Email: {{email}}\n" +
      "Subject: {{supportSubject}}\n\n" +
      "Message:\n{{message}}\n\n" +
      "Date: {{date}}",

    htmlBody:
      "<div>" +
      "<h2>Support Request</h2>" +
      "<p><strong>User:</strong> {{username}}</p>" +
      "<p><strong>Email:</strong> {{email}}</p>" +
      "<p><strong>Subject:</strong> {{supportSubject}}</p>" +
      "<p><strong>Message:</strong></p>" +
      "<p>{{message}}</p>" +
      "<p>Date: {{date}}</p>" +
      "</div>"

  },


  NOTIFICATION: {

    name:
      "General Notification",

    type:
      EMAIL_TEMPLATE_TYPES.NOTIFICATION,

    subject:
      "{{subject}}",

    body:
      "Hello {{username}},\n\n" +
      "{{message}}\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>{{subject}}</h2>" +
      "<p>Hello {{username}},</p>" +
      "<p>{{message}}</p>" +
      "</div>"

  },


  BROADCAST: {

    name:
      "Broadcast",

    type:
      EMAIL_TEMPLATE_TYPES.BROADCAST,

    subject:
      "{{subject}}",

    body:
      "{{message}}\n\n" +
      "CodingFamilySlop",

    htmlBody:
      "<div>" +
      "<h2>{{subject}}</h2>" +
      "<p>{{message}}</p>" +
      "</div>"

  }

};


// =====================================================
// GET SYSTEM TEMPLATE
// =====================================================

function getSystemEmailTemplate(
  templateType
) {

  if (!templateType) {

    throw new Error(
      "Template type is required"
    );

  }


  const key =
    Object.keys(
      SYSTEM_EMAIL_TEMPLATES
    ).find(
      function(name) {

        return (
          SYSTEM_EMAIL_TEMPLATES[name]
            .type ===
          templateType
        );

      }
    );


  if (!key) {

    throw new Error(
      "Email template not found: " +
      templateType
    );

  }


  return SYSTEM_EMAIL_TEMPLATES[
    key
  ];

}


// =====================================================
// GET TEMPLATE BY NAME
// =====================================================

function getEmailTemplateByName(
  name
) {

  if (!name) {

    throw new Error(
      "Template name is required"
    );

  }


  const target =
    String(
      name
    )
      .trim()
      .toLowerCase();


  const templates =
    Object.values(
      SYSTEM_EMAIL_TEMPLATES
    );


  for (
    let i = 0;
    i < templates.length;
    i++
  ) {

    if (
      String(
        templates[i].name
      )
        .toLowerCase() ===
      target
    ) {

      return templates[i];

    }

  }


  return null;

}


// =====================================================
// GET ALL SYSTEM TEMPLATES
// =====================================================

function getAllSystemEmailTemplates() {

  return Object.values(
    SYSTEM_EMAIL_TEMPLATES
  );

}


// =====================================================
// CHECK TEMPLATE TYPE
// =====================================================

function isValidEmailTemplateType(
  type
) {

  return Object.values(
    EMAIL_TEMPLATE_TYPES
  ).indexOf(
    type
  ) !== -1;

}


// =====================================================
// RENDER TEMPLATE
// =====================================================

function renderEmailTemplate(
  templateType,
  variables
) {

  variables =
    variables || {};


  const template =
    getSystemEmailTemplate(
      templateType
    );


  return {

    type:
      template.type,

    name:
      template.name,

    subject:
      replaceEmailTemplateVariables(
        template.subject,
        variables
      ),

    body:
      replaceEmailTemplateVariables(
        template.body,
        variables
      ),

    htmlBody:
      replaceEmailTemplateVariables(
        template.htmlBody,
        variables
      )

  };

}


// =====================================================
// REPLACE TEMPLATE VARIABLES
// =====================================================

function replaceEmailTemplateVariables(
  template,
  variables
) {

  if (
    template === null ||
    template === undefined
  ) {

    return "";

  }


  let result =
    String(
      template
    );


  Object.keys(
    variables
  ).forEach(
    function(key) {

      const value =
        variables[key] === null ||
        variables[key] === undefined
          ? ""
          : String(
              variables[key]
            );


      const escapedKey =
        key.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );


      const regex =
        new RegExp(
          "\\{\\{" +
          escapedKey +
          "\\}\\}",
          "g"
        );


      result =
        result.replace(
          regex,
          value
        );

    }
  );


  return result;

}


// =====================================================
// RENDER HTML TEMPLATE SAFELY
// =====================================================

function renderSafeEmailTemplate(
  templateType,
  variables
) {

  variables =
    variables || {};


  const safeVariables = {};


  Object.keys(
    variables
  ).forEach(
    function(key) {

      safeVariables[key] =
        escapeEmailHtml(
          variables[key]
        );

    }
  );


  const template =
    getSystemEmailTemplate(
      templateType
    );


  return {

    type:
      template.type,

    name:
      template.name,

    subject:
      replaceEmailTemplateVariables(
        template.subject,
        variables
      ),

    body:
      replaceEmailTemplateVariables(
        template.body,
        variables
      ),

    htmlBody:
      replaceEmailTemplateVariables(
        template.htmlBody,
        safeVariables
      )

  };

}


// =====================================================
// SEND TEMPLATE EMAIL
// =====================================================

function sendTemplateEmail(
  templateType,
  recipient,
  variables,
  options
) {

  options =
    options || {};


  const template =
    renderSafeEmailTemplate(
      templateType,
      variables
    );


  return sendEmail({

    to:
      recipient,

    subject:
      template.subject,

    message:
      template.body,

    htmlBody:
      template.htmlBody,

    type:
      template.type,

    priority:
      options.priority ||
      EMAIL_PRIORITIES.NORMAL,

    userId:
      options.userId ||
      "",

    queue:
      options.queue !== false,

    createdBy:
      options.createdBy ||
      "SYSTEM"

  });

}


// =====================================================
// SEND TEMPLATE TO USER
// =====================================================

function sendTemplateEmailToUser(
  templateType,
  userId,
  variables,
  options
) {

  const recipient =
    getUserEmailRecipient(
      userId
    );


  options =
    options || {};


  options.userId =
    userId;


  return sendTemplateEmail(

    templateType,

    recipient,

    variables,

    options

  );

}


// =====================================================
// SEND TEMPLATE TO ADMINS
// =====================================================

function sendTemplateEmailToAdmins(
  templateType,
  variables,
  options
) {

  const recipients =
    getEmailAdminRecipients();


  options =
    options || {};


  options.priority =
    options.priority ||
    EMAIL_PRIORITIES.HIGH;


  return sendTemplateEmail(

    templateType,

    recipients,

    variables,

    options

  );

}


// =====================================================
// SEND TEMPLATE TO SUPPORT
// =====================================================

function sendTemplateEmailToSupport(
  templateType,
  variables,
  options
) {

  const recipients =
    getEmailSupportRecipients();


  options =
    options || {};


  return sendTemplateEmail(

    templateType,

    recipients,

    variables,

    options

  );

}


// =====================================================
// GET TEMPLATE VARIABLES
// =====================================================

function getEmailTemplateVariables(
  templateType
) {

  const template =
    getSystemEmailTemplate(
      templateType
    );


  const text =
    [
      template.subject,
      template.body,
      template.htmlBody
    ].join(" ");


  const matches =
    text.match(
      /\{\{([^}]+)\}\}/g
    );


  if (!matches) {

    return [];

  }


  const variables = [];


  matches.forEach(
    function(match) {

      const name =
        match
          .replace(
            "{{",
            ""
          )
          .replace(
            "}}",
            ""
          )
          .trim();


      if (
        variables.indexOf(
          name
        ) === -1
      ) {

        variables.push(
          name
        );

      }

    }
  );


  return variables;

}


// =====================================================
// TEMPLATE PREVIEW
// =====================================================

function previewEmailTemplate(
  templateType,
  variables
) {

  return renderSafeEmailTemplate(
    templateType,
    variables || {}
  );

}


// =====================================================
// GET TEMPLATE CONFIGURATION
// =====================================================

function getEmailTemplateConfig() {

  return {

    types:
      EMAIL_TEMPLATE_TYPES,

    statuses:
      EMAIL_TEMPLATE_STATUS,

    templates:
      getAllSystemEmailTemplates()

  };

}