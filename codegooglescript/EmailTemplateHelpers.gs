// =====================================================
// EMAILTEMPLATEHELPERS.GS
// Email Template Utility Functions
// Registration System API
// =====================================================


// =====================================================
// TEMPLATE VARIABLE PATTERN
// =====================================================

const EMAIL_TEMPLATE_VARIABLE_PATTERN =
  /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;


// =====================================================
// TEMPLATE VALUE LIMITS
// =====================================================

const EMAIL_TEMPLATE_LIMITS = {

  MAX_VARIABLES:
    100,

  MAX_VARIABLE_NAME_LENGTH:
    100,

  MAX_RENDERED_SUBJECT_LENGTH:
    200,

  MAX_RENDERED_BODY_LENGTH:
    100000

};


// =====================================================
// NORMALIZE TEMPLATE VARIABLE NAME
// =====================================================

function normalizeEmailTemplateVariableName(
  name
) {

  if (
    name === null ||
    name === undefined
  ) {

    return "";

  }

  return String(name)
    .trim()
    .replace(
      /\s+/g,
      ""
    );

}


// =====================================================
// VALIDATE TEMPLATE VARIABLE NAME
// =====================================================

function isValidEmailTemplateVariableName(
  name
) {

  const normalized =
    normalizeEmailTemplateVariableName(
      name
    );

  if (
    !normalized ||
    normalized.length >
      EMAIL_TEMPLATE_LIMITS
        .MAX_VARIABLE_NAME_LENGTH
  ) {

    return false;

  }

  return /^[a-zA-Z0-9_.-]+$/.test(
    normalized
  );

}


// =====================================================
// EXTRACT TEMPLATE VARIABLES
// =====================================================

function extractEmailTemplateVariables(
  template
) {

  if (
    template === null ||
    template === undefined
  ) {

    return [];

  }

  const text =
    String(template);

  const variables = [];

  let match;

  const regex =
    new RegExp(
      EMAIL_TEMPLATE_VARIABLE_PATTERN.source,
      "g"
    );


  while (
    (match =
      regex.exec(text)) !== null
  ) {

    const variable =
      normalizeEmailTemplateVariableName(
        match[1]
      );


    if (
      !isValidEmailTemplateVariableName(
        variable
      )
    ) {

      continue;

    }


    if (
      variables.indexOf(
        variable
      ) === -1
    ) {

      variables.push(
        variable
      );

    }


    if (
      variables.length >=
      EMAIL_TEMPLATE_LIMITS
        .MAX_VARIABLES
    ) {

      break;

    }

  }


  return variables;

}


// =====================================================
// EXTRACT VARIABLES FROM TEMPLATE
// =====================================================

function extractEmailTemplateVariablesFromTemplate(
  template
) {

  if (
    !template ||
    typeof template !==
      "object"
  ) {

    return [];

  }


  const values = [];


  [
    template.subject,
    template.body,
    template.htmlBody
  ].forEach(
    function(value) {

      values.push(
        extractEmailTemplateVariables(
          value
        )
      );

    }
  );


  return uniqueEmailTemplateValues(
    values
  );

}


// =====================================================
// UNIQUE TEMPLATE VALUES
// =====================================================

function uniqueEmailTemplateValues(
  values
) {

  const result = [];


  if (
    !Array.isArray(values)
  ) {

    return result;

  }


  values.forEach(
    function(item) {

      if (
        Array.isArray(item)
      ) {

        item.forEach(
          function(value) {

            if (
              result.indexOf(
                value
              ) === -1
            ) {

              result.push(
                value
              );

            }

          }
        );

      } else {

        if (
          result.indexOf(
            item
          ) === -1
        ) {

          result.push(
            item
          );

        }

      }

    }
  );


  return result;

}


// =====================================================
// GET TEMPLATE VARIABLE VALUE
// =====================================================

function getEmailTemplateVariableValue(
  variables,
  path
) {

  if (
    !variables ||
    typeof variables !==
      "object"
  ) {

    return "";

  }


  if (!path) {

    return "";

  }


  const parts =
    String(path)
      .split(".")
      .filter(
        function(part) {

          return part !== "";

        }
      );


  let current =
    variables;


  for (
    let i = 0;
    i < parts.length;
    i++
  ) {

    if (
      current === null ||
      current === undefined
    ) {

      return "";

    }


    if (
      typeof current !==
        "object"
    ) {

      return "";

    }


    if (
      !Object.prototype
        .hasOwnProperty.call(
          current,
          parts[i]
        )
    ) {

      return "";

    }


    current =
      current[
        parts[i]
      ];

  }


  if (
    current === null ||
    current === undefined
  ) {

    return "";

  }


  return String(
    current
  );

}


// =====================================================
// BUILD TEMPLATE VARIABLE MAP
// =====================================================

function buildEmailTemplateVariableMap(
  variables
) {

  if (
    !variables ||
    typeof variables !==
      "object"
  ) {

    return {};

  }


  const result = {};


  Object.keys(
    variables
  ).forEach(
    function(key) {

      const normalized =
        normalizeEmailTemplateVariableName(
          key
        );


      if (
        !isValidEmailTemplateVariableName(
          normalized
        )
      ) {

        return;

      }


      result[normalized] =
        variables[key];

    }
  );


  return result;

}


// =====================================================
// REPLACE TEMPLATE VARIABLES
// =====================================================

function replaceEmailTemplateVariablesSafe(
  template,
  variables,
  options
) {

  options =
    options || {};


  if (
    template === null ||
    template === undefined
  ) {

    return "";

  }


  const variableMap =
    buildEmailTemplateVariableMap(
      variables
    );


  let result =
    String(template);


  result =
    result.replace(
      EMAIL_TEMPLATE_VARIABLE_PATTERN,
      function(
        fullMatch,
        variableName
      ) {

        const normalized =
          normalizeEmailTemplateVariableName(
            variableName
          );


        if (
          Object.prototype
            .hasOwnProperty.call(
              variableMap,
              normalized
            )
        ) {

          const value =
            variableMap[
              normalized
            ];


          if (
            value === null ||
            value === undefined
          ) {

            return "";

          }


          return String(
            value
          );

        }


        if (
          options.keepUnknown === true
        ) {

          return fullMatch;

        }


        return (
          options.defaultValue !==
          undefined
            ? String(
                options.defaultValue
              )
            : ""
        );

      }
    );


  return result;

}


// =====================================================
// ESCAPE HTML TEMPLATE VALUES
// =====================================================

function escapeEmailTemplateHtmlValue(
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
      "&#39;"
    );

}


// =====================================================
// BUILD SAFE HTML VARIABLES
// =====================================================

function buildSafeEmailTemplateVariables(
  variables
) {

  const source =
    buildEmailTemplateVariableMap(
      variables
    );


  const result = {};


  Object.keys(
    source
  ).forEach(
    function(key) {

      result[key] =
        escapeEmailTemplateHtmlValue(
          source[key]
        );

    }
  );


  return result;

}


// =====================================================
// RENDER TEXT TEMPLATE
// =====================================================

function renderEmailTextTemplate(
  template,
  variables,
  options
) {

  return replaceEmailTemplateVariablesSafe(
    template,
    variables,
    options || {}
  );

}


// =====================================================
// RENDER HTML TEMPLATE
// =====================================================

function renderEmailHtmlTemplate(
  template,
  variables,
  options
) {

  const safeVariables =
    buildSafeEmailTemplateVariables(
      variables
    );


  return replaceEmailTemplateVariablesSafe(
    template,
    safeVariables,
    options || {}
  );

}


// =====================================================
// RENDER COMPLETE TEMPLATE
// =====================================================

function renderCompleteEmailTemplate(
  template,
  variables,
  options
) {

  options =
    options || {};


  if (
    !template ||
    typeof template !==
      "object"
  ) {

    throw new Error(
      "Email template is required"
    );

  }


  const subject =
    renderEmailTextTemplate(
      template.subject || "",
      variables,
      {
        keepUnknown:
          options.keepUnknown === true,
        defaultValue:
          options.defaultValue || ""
      }
    );


  const body =
    renderEmailTextTemplate(
      template.body || "",
      variables,
      {
        keepUnknown:
          options.keepUnknown === true,
        defaultValue:
          options.defaultValue || ""
      }
    );


  const htmlBody =
    renderEmailHtmlTemplate(
      template.htmlBody || "",
      variables,
      {
        keepUnknown:
          options.keepUnknown === true,
        defaultValue:
          options.defaultValue || ""
      }
    );


  validateRenderedEmailTemplate(
    subject,
    body,
    htmlBody
  );


  return {

    name:
      template.name ||
      "",

    type:
      template.type ||
      "",

    subject:
      subject,

    body:
      body,

    htmlBody:
      htmlBody

  };

}


// =====================================================
// VALIDATE RENDERED TEMPLATE
// =====================================================

function validateRenderedEmailTemplate(
  subject,
  body,
  htmlBody
) {

  const config =
    getEmailConfiguration();


  if (
    !subject
  ) {

    throw new Error(
      "Rendered email subject is empty"
    );

  }


  if (
    subject.length >
      EMAIL_TEMPLATE_LIMITS
        .MAX_RENDERED_SUBJECT_LENGTH
  ) {

    throw new Error(
      "Rendered email subject is too long"
    );

  }


  const bodyLength =
    Math.max(
      String(body || "").length,
      String(htmlBody || "").length
    );


  const configuredLimit =
    config.MAX_MESSAGE_LENGTH ||
    EMAIL_TEMPLATE_LIMITS
      .MAX_RENDERED_BODY_LENGTH;


  if (
    bodyLength >
    configuredLimit
  ) {

    throw new Error(
      "Rendered email body is too long"
    );

  }


  return true;

}


// =====================================================
// CHECK MISSING VARIABLES
// =====================================================

function getMissingEmailTemplateVariables(
  template,
  variables
) {

  const required =
    extractEmailTemplateVariablesFromTemplate(
      template
    );


  const supplied =
    buildEmailTemplateVariableMap(
      variables
    );


  return required.filter(
    function(variable) {

      return !Object.prototype
        .hasOwnProperty.call(
          supplied,
          variable
        );

    }
  );

}


// =====================================================
// CHECK TEMPLATE VARIABLES
// =====================================================

function validateEmailTemplateVariables(
  template,
  variables,
  options
) {

  options =
    options || {};


  const missing =
    getMissingEmailTemplateVariables(
      template,
      variables
    );


  if (
    missing.length &&
    options.allowMissing !== true
  ) {

    throw new Error(
      "Missing email template variables: " +
      missing.join(", ")
    );

  }


  return {

    valid:
      missing.length === 0,

    missing:
      missing

  };

}


// =====================================================
// FORMAT DATE VARIABLE
// =====================================================

function formatEmailTemplateDate(
  date,
  format,
  timezone
) {

  const value =
    date
      ? new Date(date)
      : new Date();


  if (
    isNaN(
      value.getTime()
    )
  ) {

    throw new Error(
      "Invalid date"
    );

  }


  const zone =
    timezone ||
    Session.getScriptTimeZone();


  return Utilities.formatDate(
    value,
    zone,
    format ||
      "yyyy-MM-dd HH:mm:ss"
  );

}


// =====================================================
// FORMAT CURRENCY VARIABLE
// =====================================================

function formatEmailTemplateCurrency(
  amount,
  currency
) {

  const numeric =
    Number(amount);


  if (
    isNaN(numeric)
  ) {

    return "";

  }


  const code =
    currency ||
    "GYD";


  return (
    code +
    " " +
    numeric.toLocaleString(
      "en-US",
      {
        minimumFractionDigits:
          2,
        maximumFractionDigits:
          2
      }
    )
  );

}


// =====================================================
// BUILD COMMON TEMPLATE VARIABLES
// =====================================================

function buildCommonEmailTemplateVariables(
  data
) {

  data =
    data || {};


  const config =
    getEmailConfiguration();


  return {

    username:
      data.username ||
      "",

    email:
      data.email ||
      "",

    userId:
      data.userId ||
      "",

    date:
      data.date ||
      formatEmailTemplateDate(
        new Date()
      ),

    systemName:
      data.systemName ||
      config.FROM_NAME ||
      "CodingFamilySlop",

    supportEmail:
      data.supportEmail ||
      config.REPLY_TO ||
      "",

    backendEmail:
      data.backendEmail ||
      config.BACKEND_EMAIL ||
      "",

    currency:
      data.currency ||
      "GYD"

  };

}


// =====================================================
// MERGE TEMPLATE VARIABLES
// =====================================================

function mergeEmailTemplateVariables(
  base,
  additional
) {

  const result =
    {};


  if (
    base &&
    typeof base ===
      "object"
  ) {

    Object.keys(
      base
    ).forEach(
      function(key) {

        result[key] =
          base[key];

      }
    );

  }


  if (
    additional &&
    typeof additional ===
      "object"
  ) {

    Object.keys(
      additional
    ).forEach(
      function(key) {

        result[key] =
          additional[key];

      }
    );

  }


  return result;

}


// =====================================================
// PREPARE TEMPLATE VARIABLES
// =====================================================

function prepareEmailTemplateVariables(
  data
) {

  const common =
    buildCommonEmailTemplateVariables(
      data
    );


  return mergeEmailTemplateVariables(
    common,
    data
  );

}


// =====================================================
// PREVIEW TEMPLATE WITH VARIABLES
// =====================================================

function previewRenderedEmailTemplate(
  templateType,
  variables
) {

  const template =
    getSystemEmailTemplate(
      templateType
    );


  const prepared =
    prepareEmailTemplateVariables(
      variables || {}
    );


  return renderCompleteEmailTemplate(
    template,
    prepared
  );

}


// =====================================================
// SANITIZE SUBJECT
// =====================================================

function sanitizeEmailTemplateSubject(
  subject
) {

  if (
    subject === null ||
    subject === undefined
  ) {

    return "";

  }


  return String(subject)

    .replace(
      /[\r\n]+/g,
      " "
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();

}


// =====================================================
// SANITIZE TEXT BODY
// =====================================================

function sanitizeEmailTemplateText(
  text
) {

  if (
    text === null ||
    text === undefined
  ) {

    return "";

  }


  return String(text)
    .replace(
      /\u0000/g,
      ""
    )
    .trim();

}


// =====================================================
// CREATE TEMPLATE DATA
// =====================================================

function createEmailTemplateData(
  templateType,
  variables
) {

  const template =
    getSystemEmailTemplate(
      templateType
    );


  const prepared =
    prepareEmailTemplateVariables(
      variables || {}
    );


  const rendered =
    renderCompleteEmailTemplate(
      template,
      prepared
    );


  return {

    templateType:
      templateType,

    templateName:
      template.name,

    subject:
      sanitizeEmailTemplateSubject(
        rendered.subject
      ),

    message:
      sanitizeEmailTemplateText(
        rendered.body
      ),

    htmlBody:
      rendered.htmlBody,

    variables:
      prepared

  };

}


// =====================================================
// TEMPLATE HELPER CONFIG
// =====================================================

function getEmailTemplateHelperConfig() {

  return {

    variablePattern:
      EMAIL_TEMPLATE_VARIABLE_PATTERN
        .toString(),

    limits:
      EMAIL_TEMPLATE_LIMITS

  };

}