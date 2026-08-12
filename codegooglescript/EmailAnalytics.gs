// =====================================================
// EMAILANALYTICS.GS
// Email Analytics & Reporting
// Registration System API
// =====================================================


// =====================================================
// ANALYTICS CONFIGURATION
// =====================================================

const EMAIL_ANALYTICS_CONFIG = {

  ENABLED: true,

  DEFAULT_DAYS: 30,

  MAX_DAYS: 365,

  CACHE_SECONDS: 300,

  INCLUDE_RECIPIENT_EMAIL:
    false,

  INCLUDE_MESSAGE_CONTENT:
    false

};


// =====================================================
// ANALYTICS PERIODS
// =====================================================

const EMAIL_ANALYTICS_PERIODS = {

  TODAY:
    "TODAY",

  LAST_7_DAYS:
    "LAST_7_DAYS",

  LAST_30_DAYS:
    "LAST_30_DAYS",

  LAST_90_DAYS:
    "LAST_90_DAYS",

  THIS_MONTH:
    "THIS_MONTH",

  CUSTOM:
    "CUSTOM"

};


// =====================================================
// GET EMAIL ANALYTICS SHEET
// =====================================================

function getEmailAnalyticsSheet() {

  const sheetName =
    "EMAIL_ANALYTICS";

  return getSheet(
    SHEETS.EMAIL_ANALYTICS ||
    sheetName
  );

}


// =====================================================
// ANALYTICS COLUMNS
// =====================================================

const EMAIL_ANALYTICS_COLUMNS = {

  ID: 1,

  DATE: 2,

  TYPE: 3,

  STATUS: 4,

  SENT: 5,

  FAILED: 6,

  PENDING: 7,

  OPENED: 8,

  CLICKED: 9,

  RECIPIENTS: 10,

  CREATED_DATE: 11

};


// =====================================================
// GENERATE ANALYTICS ID
// =====================================================

function generateEmailAnalyticsId() {

  return (
    "EAN-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// CHECK ANALYTICS ENABLED
// =====================================================

function isEmailAnalyticsEnabled() {

  return (
    EMAIL_ANALYTICS_CONFIG
      .ENABLED === true
  );

}


// =====================================================
// CREATE ANALYTICS RECORD
// =====================================================

function createEmailAnalyticsRecord(
  data
) {

  if (
    !isEmailAnalyticsEnabled()
  ) {

    return null;

  }


  data =
    data || {};


  const sheet =
    getEmailAnalyticsSheet();


  const now =
    new Date();


  const date =
    data.date ||
    now;


  const recordId =
    generateEmailAnalyticsId();


  sheet.appendRow([

    recordId,

    date,

    data.type ||
      "",

    data.status ||
      "",

    Number(
      data.sent || 0
    ),

    Number(
      data.failed || 0
    ),

    Number(
      data.pending || 0
    ),

    Number(
      data.opened || 0
    ),

    Number(
      data.clicked || 0
    ),

    Number(
      data.recipients || 0
    ),

    now

  ]);


  return recordId;

}


// =====================================================
// RECORD EMAIL SENT
// =====================================================

function recordEmailAnalyticsSent(
  data
) {

  data =
    data || {};


  return createEmailAnalyticsRecord({

    type:
      data.type,

    status:
      EMAIL_STATUSES.SENT,

    sent:
      1,

    recipients:
      data.recipients || 1,

    date:
      data.date

  });

}


// =====================================================
// RECORD EMAIL FAILED
// =====================================================

function recordEmailAnalyticsFailed(
  data
) {

  data =
    data || {};


  return createEmailAnalyticsRecord({

    type:
      data.type,

    status:
      EMAIL_STATUSES.FAILED,

    failed:
      1,

    recipients:
      data.recipients || 1,

    date:
      data.date

  });

}


// =====================================================
// RECORD EMAIL OPENED
// =====================================================

function recordEmailAnalyticsOpened(
  data
) {

  data =
    data || {};


  return createEmailAnalyticsRecord({

    type:
      data.type,

    status:
      EMAIL_STATUSES.OPENED,

    opened:
      1,

    recipients:
      data.recipients || 1,

    date:
      data.date

  });

}


// =====================================================
// RECORD EMAIL CLICKED
// =====================================================

function recordEmailAnalyticsClicked(
  data
) {

  data =
    data || {};


  return createEmailAnalyticsRecord({

    type:
      data.type,

    status:
      EMAIL_STATUSES.CLICKED,

    clicked:
      1,

    recipients:
      data.recipients || 1,

    date:
      data.date

  });

}


// =====================================================
// GET EMAIL LOG DATA
// =====================================================

function getEmailAnalyticsSourceData() {

  const sheet =
    getEmailsSheet();


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <= 1
  ) {

    return [];

  }


  const lastColumn =
    Math.max(
      ...Object.values(
        EMAIL_COLUMNS
      )
    );


  return sheet
    .getRange(
      2,
      1,
      lastRow - 1,
      lastColumn
    )
    .getValues();

}


// =====================================================
// NORMALIZE ANALYTICS DATE
// =====================================================

function normalizeAnalyticsDate(
  value
) {

  if (!value) {

    return null;

  }


  const date =
    new Date(value);


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return date;

}


// =====================================================
// GET DATE RANGE
// =====================================================

function getEmailAnalyticsDateRange(
  days
) {

  const numberOfDays =
    Math.min(
      Math.max(
        Number(
          days ||
          EMAIL_ANALYTICS_CONFIG
            .DEFAULT_DAYS
        ),
        1
      ),
      EMAIL_ANALYTICS_CONFIG
        .MAX_DAYS
    );


  const endDate =
    new Date();


  const startDate =
    new Date(
      endDate.getTime() -
      (
        numberOfDays *
        24 *
        60 *
        60 *
        1000
      )
    );


  return {

    start:
      startDate,

    end:
      endDate,

    days:
      numberOfDays

  };

}


// =====================================================
// GET EMAIL STATISTICS
// =====================================================

function getEmailStatistics(
  options
) {

  if (
    !isEmailAnalyticsEnabled()
  ) {

    return {

      enabled:
        false

    };

  }


  options =
    options || {};


  const range =
    options.startDate &&
    options.endDate

      ? {

          start:
            new Date(
              options.startDate
            ),

          end:
            new Date(
              options.endDate
            )

        }

      : getEmailAnalyticsDateRange(
          options.days
        );


  const data =
    getEmailAnalyticsSourceData();


  const statistics = {

    total:
      0,

    sent:
      0,

    failed:
      0,

    pending:
      0,

    opened:
      0,

    clicked:
      0,

    recipients:
      0,

    verification:
      0,

    passwordReset:
      0,

    welcome:
      0,

    loginAlert:
      0,

    securityAlert:
      0,

    deposit:
      0,

    withdrawal:
      0,

    notification:
      0,

    admin:
      0,

    bulk:
      0,

    other:
      0

  };


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      data[i];


    const createdDate =
      normalizeAnalyticsDate(
        row[
          EMAIL_COLUMNS
            .CREATED_DATE - 1
        ]
      );


    if (
      !createdDate
    ) {

      continue;

    }


    if (
      createdDate <
      range.start ||
      createdDate >
      range.end
    ) {

      continue;

    }


    statistics.total++;


    const status =
      String(
        row[
          EMAIL_COLUMNS
            .STATUS - 1
        ] ||
        ""
      );


    const type =
      String(
        row[
          EMAIL_COLUMNS
            .TYPE - 1
        ] ||
        ""
      );


    const recipients =
      row[
        EMAIL_COLUMNS
          .EMAIL - 1
      ];


    if (
      status ===
      EMAIL_STATUSES.SENT
    ) {

      statistics.sent++;

    }


    if (
      status ===
      EMAIL_STATUSES.FAILED
    ) {

      statistics.failed++;

    }


    if (
      status ===
      EMAIL_STATUSES.PENDING
    ) {

      statistics.pending++;

    }


    if (
      status ===
      EMAIL_STATUSES.OPENED
    ) {

      statistics.opened++;

    }


    if (
      status ===
      EMAIL_STATUSES.CLICKED
    ) {

      statistics.clicked++;

    }


    if (type === EMAIL_TYPES.VERIFICATION) {

      statistics.verification++;

    }

    else if (
      type ===
      EMAIL_TYPES.PASSWORD_RESET
    ) {

      statistics.passwordReset++;

    }

    else if (
      type ===
      EMAIL_TYPES.WELCOME
    ) {

      statistics.welcome++;

    }

    else if (
      type ===
      EMAIL_TYPES.LOGIN_ALERT
    ) {

      statistics.loginAlert++;

    }

    else if (
      type ===
      EMAIL_TYPES.SECURITY_ALERT
    ) {

      statistics.securityAlert++;

    }

    else if (
      type ===
      EMAIL_TYPES.DEPOSIT
    ) {

      statistics.deposit++;

    }

    else if (
      type ===
      EMAIL_TYPES.WITHDRAWAL
    ) {

      statistics.withdrawal++;

    }

    else if (
      type ===
      EMAIL_TYPES.NOTIFICATION
    ) {

      statistics.notification++;

    }

    else if (
      type ===
      EMAIL_TYPES.ADMIN
    ) {

      statistics.admin++;

    }

    else if (
      type ===
      EMAIL_TYPES.BULK
    ) {

      statistics.bulk++;

    }

    else {

      statistics.other++;

    }

  }


  statistics.recipients =
    data.length;


  statistics.deliveryRate =
    statistics.total > 0

      ? (
          statistics.sent /
          statistics.total
        ) * 100

      : 0;


  statistics.failureRate =
    statistics.total > 0

      ? (
          statistics.failed /
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


  statistics.startDate =
    range.start;

  statistics.endDate =
    range.end;


  return statistics;

}


// =====================================================
// GET EMAIL STATISTICS BY TYPE
// =====================================================

function getEmailStatisticsByType(
  options
) {

  const data =
    getEmailAnalyticsSourceData();


  const range =
    options &&
    options.startDate &&
    options.endDate

      ? {

          start:
            new Date(
              options.startDate
            ),

          end:
            new Date(
              options.endDate
            )

        }

      : getEmailAnalyticsDateRange(
          options &&
          options.days
        );


  const result =
    {};


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      data[i];


    const date =
      normalizeAnalyticsDate(
        row[
          EMAIL_COLUMNS
            .CREATED_DATE - 1
        ]
      );


    if (
      !date ||
      date < range.start ||
      date > range.end
    ) {

      continue;

    }


    const type =
      String(
        row[
          EMAIL_COLUMNS
            .TYPE - 1
        ] ||
        "Unknown"
      );


    if (
      !result[type]
    ) {

      result[type] = {

        total:
          0,

        sent:
          0,

        failed:
          0,

        pending:
          0,

        opened:
          0,

        clicked:
          0

      };

    }


    result[type].total++;


    const status =
      row[
        EMAIL_COLUMNS
          .STATUS - 1
      ];


    if (
      status ===
      EMAIL_STATUSES.SENT
    ) {

      result[type].sent++;

    }

    else if (
      status ===
      EMAIL_STATUSES.FAILED
    ) {

      result[type].failed++;

    }

    else if (
      status ===
      EMAIL_STATUSES.PENDING
    ) {

      result[type].pending++;

    }

    else if (
      status ===
      EMAIL_STATUSES.OPENED
    ) {

      result[type].opened++;

    }

    else if (
      status ===
      EMAIL_STATUSES.CLICKED
    ) {

      result[type].clicked++;

    }

  }


  return result;

}


// =====================================================
// GET DAILY EMAIL STATISTICS
// =====================================================

function getDailyEmailStatistics(
  days
) {

  const range =
    getEmailAnalyticsDateRange(
      days
    );


  const data =
    getEmailAnalyticsSourceData();


  const daily =
    {};


  for (
    let i = 0;
    i < data.length;
    i++
  ) {

    const row =
      data[i];


    const date =
      normalizeAnalyticsDate(
        row[
          EMAIL_COLUMNS
            .CREATED_DATE - 1
        ]
      );


    if (
      !date ||
      date < range.start ||
      date > range.end
    ) {

      continue;

    }


    const key =
      Utilities.formatDate(
        date,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );


    if (
      !daily[key]
    ) {

      daily[key] = {

        date:
          key,

        total:
          0,

        sent:
          0,

        failed:
          0,

        pending:
          0,

        opened:
          0,

        clicked:
          0

      };

    }


    daily[key].total++;


    const status =
      row[
        EMAIL_COLUMNS
          .STATUS - 1
      ];


    switch (
      status
    ) {

      case EMAIL_STATUSES.SENT:

        daily[key].sent++;

        break;


      case EMAIL_STATUSES.FAILED:

        daily[key].failed++;

        break;


      case EMAIL_STATUSES.PENDING:

        daily[key].pending++;

        break;


      case EMAIL_STATUSES.OPENED:

        daily[key].opened++;

        break;


      case EMAIL_STATUSES.CLICKED:

        daily[key].clicked++;

        break;

    }

  }


  return Object
    .keys(daily)
    .sort()
    .map(
      function(key) {

        return daily[key];

      }
    );

}


// =====================================================
// GET EMAIL DASHBOARD
// =====================================================

function getEmailAnalyticsDashboard() {

  const statistics =
    getEmailStatistics({

      days:
        30

    });


  const byType =
    getEmailStatisticsByType({

      days:
        30

    });


  const daily =
    getDailyEmailStatistics(
      30
    );


  return {

    success:
      true,

    period:
      "30 days",

    statistics:
      statistics,

    byType:
      byType,

    daily:
      daily,

    generatedAt:
      new Date()

  };

}


// =====================================================
// GET EMAIL PERFORMANCE
// =====================================================

function getEmailPerformance(
  days
) {

  const statistics =
    getEmailStatistics({

      days:
        days || 30

    });


  return {

    sent:
      statistics.sent,

    failed:
      statistics.failed,

    pending:
      statistics.pending,

    opened:
      statistics.opened,

    clicked:
      statistics.clicked,

    deliveryRate:
      Number(
        statistics.deliveryRate
          .toFixed(2)
      ),

    failureRate:
      Number(
        statistics.failureRate
          .toFixed(2)
      ),

    openRate:
      Number(
        statistics.openRate
          .toFixed(2)
      ),

    clickRate:
      Number(
        statistics.clickRate
          .toFixed(2)
      )

  };

}


// =====================================================
// GET EMAIL ANALYTICS SUMMARY
// =====================================================

function getEmailAnalyticsSummary() {

  const statistics =
    getEmailStatistics({

      days:
        EMAIL_ANALYTICS_CONFIG
          .DEFAULT_DAYS

    });


  return {

    total:
      statistics.total,

    sent:
      statistics.sent,

    failed:
      statistics.failed,

    pending:
      statistics.pending,

    opened:
      statistics.opened,

    clicked:
      statistics.clicked,

    deliveryRate:
      Number(
        statistics.deliveryRate
          .toFixed(2)
      ),

    failureRate:
      Number(
        statistics.failureRate
          .toFixed(2)
      ),

    openRate:
      Number(
        statistics.openRate
          .toFixed(2)
      ),

    clickRate:
      Number(
        statistics.clickRate
          .toFixed(2)
      )

  };

}


// =====================================================
// GET ANALYTICS CONFIG
// =====================================================

function getEmailAnalyticsConfig() {

  return {

    enabled:
      EMAIL_ANALYTICS_CONFIG
        .ENABLED,

    defaultDays:
      EMAIL_ANALYTICS_CONFIG
        .DEFAULT_DAYS,

    maxDays:
      EMAIL_ANALYTICS_CONFIG
        .MAX_DAYS,

    cacheSeconds:
      EMAIL_ANALYTICS_CONFIG
        .CACHE_SECONDS,

    includeRecipientEmail:
      EMAIL_ANALYTICS_CONFIG
        .INCLUDE_RECIPIENT_EMAIL,

    includeMessageContent:
      EMAIL_ANALYTICS_CONFIG
        .INCLUDE_MESSAGE_CONTENT

  };

}


// =====================================================
// CLEAR ANALYTICS CACHE
// =====================================================

function clearEmailAnalyticsCache() {

  const cache =
    CacheService
      .getScriptCache();


  cache.remove(
    "EMAIL_ANALYTICS_DASHBOARD"
  );

  cache.remove(
    "EMAIL_ANALYTICS_SUMMARY"
  );

  cache.remove(
    "EMAIL_ANALYTICS_STATISTICS"
  );


  return {

    success:
      true

  };

}