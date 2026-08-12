// =====================================================
// SESSION ACTIVITY
// SessionActivity.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION ACTIVITY CONFIGURATION
// =====================================================

const SESSION_ACTIVITY_CONFIG = {

  // Maximum idle time before session is considered idle
  DEFAULT_IDLE_TIMEOUT_MS:
    30 * 60 * 1000,

  // Maximum activity history records kept
  MAX_ACTIVITY_HISTORY:
    100,

  // Minimum interval between activity updates
  // Prevents excessive writes to Google Sheets
  MIN_UPDATE_INTERVAL_MS:
    30 * 1000

};


// =====================================================
// RECORD SESSION ACTIVITY
// =====================================================

function recordSessionActivity(
  token,
  activityType,
  metadata
) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    throw new Error(
      "Session not found"
    );

  }


  // ---------------------------------------------------
  // CHECK REVOCATION
  // ---------------------------------------------------

  if (
    typeof isSessionRevoked ===
    "function"
  ) {

    const revoked =
      isSessionRevoked(
        token
      );


    if (
      revoked.revoked
    ) {

      throw new Error(
        "Cannot record activity for revoked session"
      );

    }

  }


  // ---------------------------------------------------
  // CHECK LOCK
  // ---------------------------------------------------

  if (
    typeof isSessionLocked ===
    "function"
  ) {

    const locked =
      isSessionLocked(
        token
      );


    if (
      locked.locked
    ) {

      throw new Error(
        "Cannot record activity for locked session"
      );

    }

  }


  activityType =
    activityType ||
    "UNKNOWN";


  metadata =
    metadata ||
    {};


  const now =
    new Date();


  // ---------------------------------------------------
  // UPDATE LAST ACTIVITY
  // ---------------------------------------------------

  updateSessionLastActivity(
    token,
    now,
    activityType
  );


  // ---------------------------------------------------
  // STORE ACTIVITY EVENT
  // ---------------------------------------------------

  saveSessionActivityEvent(
    session,
    activityType,
    metadata,
    now
  );


  return {

    success: true,

    userId:
      session.userId,

    activity:
      activityType,

    timestamp:
      now.toISOString()

  };

}


// =====================================================
// UPDATE LAST ACTIVITY
// =====================================================

function updateSessionLastActivity(
  token,
  activityTime,
  activityType
) {

  const sheet =
    getSheet(
      SHEETS.SESSIONS
    );


  if (!sheet) {

    throw new Error(
      "Sessions sheet not found"
    );

  }


  const values =
    sheet.getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    throw new Error(
      "No sessions found"
    );

  }


  const headers =
    values[0];


  const tokenColumn =
    findHeaderColumn(
      headers,
      [
        "Session Token",
        "Token"
      ]
    );


  const activityColumn =
    findHeaderColumn(
      headers,
      [
        "Last Activity",
        "LastActivity"
      ]
    );


  const typeColumn =
    findHeaderColumn(
      headers,
      [
        "Last Activity Type",
        "Activity Type"
      ]
    );


  const updatedColumn =
    findHeaderColumn(
      headers,
      [
        "UpdatedAt",
        "Updated At"
      ]
    );


  if (
    tokenColumn === -1
  ) {

    throw new Error(
      "Session token column not found"
    );

  }


  if (
    activityColumn === -1
  ) {

    throw new Error(
      "Last Activity column not found"
    );

  }


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(
        values[i][tokenColumn]
      ) !==
      String(token)
    ) {

      continue;

    }


    // -----------------------------------------------
    // Last activity
    // -----------------------------------------------

    sheet
      .getRange(
        i + 1,
        activityColumn + 1
      )
      .setValue(
        activityTime
      );


    // -----------------------------------------------
    // Activity type
    // -----------------------------------------------

    if (
      typeColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          typeColumn + 1
        )
        .setValue(
          activityType
        );

    }


    // -----------------------------------------------
    // Updated timestamp
    // -----------------------------------------------

    if (
      updatedColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          updatedColumn + 1
        )
        .setValue(
          activityTime
        );

    }


    return true;

  }


  throw new Error(
    "Session not found"
  );

}


// =====================================================
// GET LAST ACTIVITY
// =====================================================

function getSessionLastActivity(
  token
) {

  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return null;

  }


  const value =
    session.lastActivity ||
    session.lastActivityAt ||
    session.last_activity;


  if (!value) {

    return null;

  }


  const date =
    new Date(
      value
    );


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
// GET IDLE TIME
// =====================================================

function getSessionIdleTime(
  token
) {

  const lastActivity =
    getSessionLastActivity(
      token
    );


  if (!lastActivity) {

    return null;

  }


  return Math.max(
    0,
    Date.now() -
    lastActivity.getTime()
  );

}


// =====================================================
// CHECK SESSION IDLE
// =====================================================

function isSessionIdle(
  token,
  idleTimeoutMs
) {

  idleTimeoutMs =
    parseInt(
      idleTimeoutMs,
      10
    );


  if (
    isNaN(idleTimeoutMs) ||
    idleTimeoutMs <= 0
  ) {

    idleTimeoutMs =
      SESSION_ACTIVITY_CONFIG.DEFAULT_IDLE_TIMEOUT_MS;

  }


  const idleTime =
    getSessionIdleTime(
      token
    );


  if (
    idleTime === null
  ) {

    return {

      idle: false,

      idleTime:
        null,

      timeout:
        idleTimeoutMs

    };

  }


  return {

    idle:
      idleTime >=
      idleTimeoutMs,

    idleTime:
      idleTime,

    timeout:
      idleTimeoutMs,

    remaining:
      Math.max(
        0,
        idleTimeoutMs -
        idleTime
      )

  };

}


// =====================================================
// REQUIRE RECENT ACTIVITY
// =====================================================

function requireRecentSessionActivity(
  token,
  idleTimeoutMs
) {

  const result =
    isSessionIdle(
      token,
      idleTimeoutMs
    );


  if (
    result.idle
  ) {

    throw new Error(
      "Session has been idle for too long"
    );

  }


  return true;

}


// =====================================================
// TOUCH SESSION
// =====================================================

function touchSession(
  token,
  activityType,
  metadata
) {

  const lastActivity =
    getSessionLastActivity(
      token
    );


  const now =
    Date.now();


  // ---------------------------------------------------
  // Avoid unnecessary sheet writes
  // ---------------------------------------------------

  if (
    lastActivity &&
    now -
    lastActivity.getTime() <
    SESSION_ACTIVITY_CONFIG.MIN_UPDATE_INTERVAL_MS
  ) {

    return {

      success: true,

      updated: false,

      timestamp:
        lastActivity.toISOString()

    };

  }


  return recordSessionActivity(
    token,
    activityType ||
    "TOUCH",
    metadata
  );

}


// =====================================================
// SAVE ACTIVITY EVENT
// =====================================================

function saveSessionActivityEvent(
  session,
  activityType,
  metadata,
  timestamp
) {

  const props =
    PropertiesService
      .getScriptProperties();


  const userId =
    session.userId ||
    "UNKNOWN";


  const token =
    session.token ||
    session.sessionToken ||
    "";


  const eventId =
    typeof generateId ===
    "function"
      ? generateId("ACT")
      : Utilities.getUuid();


  const event = {

    id:
      eventId,

    userId:
      userId,

    sessionId:
      session.id ||
      session.sessionId ||
      "",

    token:
      typeof maskSessionToken ===
      "function"
        ? maskSessionToken(token)
        : "",

    type:
      activityType,

    metadata:
      metadata,

    timestamp:
      timestamp.toISOString()

  };


  const key =
    getActivityPropertyKey(
      userId,
      eventId
    );


  props.setProperty(
    key,
    JSON.stringify(
      event
    )
  );


  trimUserActivityHistory(
    userId
  );


  return event;

}


// =====================================================
// GET ACTIVITY HISTORY
// =====================================================

function getSessionActivityHistory(
  userId,
  limit
) {

  if (!userId) {

    return [];

  }


  limit =
    parseInt(
      limit,
      10
    );


  if (
    isNaN(limit) ||
    limit <= 0
  ) {

    limit =
      SESSION_ACTIVITY_CONFIG.MAX_ACTIVITY_HISTORY;

  }


  limit =
    Math.min(
      limit,
      SESSION_ACTIVITY_CONFIG.MAX_ACTIVITY_HISTORY
    );


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getActivityUserPrefix(
      userId
    );


  const events =
    [];


  Object.keys(
    all
  ).forEach(
    function(key) {

      if (
        key.indexOf(
          prefix
        ) !== 0
      ) {

        return;

      }


      try {

        const event =
          JSON.parse(
            all[key]
          );


        if (
          event &&
          String(
            event.userId
          ) ===
          String(userId)
        ) {

          events.push(
            event
          );

        }

      } catch (error) {

        // Ignore malformed records.

      }

    }
  );


  events.sort(
    function(a, b) {

      return (
        new Date(
          b.timestamp
        ).getTime() -
        new Date(
          a.timestamp
        ).getTime()
      );

    }
  );


  return events.slice(
    0,
    limit
  );

}


// =====================================================
// GET SESSION ACTIVITY
// =====================================================

function getSessionActivity(
  token
) {

  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return null;

  }


  const lastActivity =
    getSessionLastActivity(
      token
    );


  const idle =
    isSessionIdle(
      token
    );


  return {

    userId:
      session.userId,

    sessionId:
      session.id ||
      session.sessionId ||
      null,

    lastActivity:
      lastActivity
        ? lastActivity.toISOString()
        : null,

    idleTime:
      idle.idleTime,

    idle:
      idle.idle,

    idleTimeout:
      idle.timeout

  };

}


// =====================================================
// ACTIVITY PROPERTY KEY
// =====================================================

function getActivityPropertyKey(
  userId,
  eventId
) {

  return (
    "SESSION_ACTIVITY_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_" +
    encodeURIComponent(
      String(eventId)
    )
  );

}


// =====================================================
// ACTIVITY USER PREFIX
// =====================================================

function getActivityUserPrefix(
  userId
) {

  return (
    "SESSION_ACTIVITY_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_"
  );

}


// =====================================================
// TRIM ACTIVITY HISTORY
// =====================================================

function trimUserActivityHistory(
  userId
) {

  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getActivityUserPrefix(
      userId
    );


  const records =
    [];


  Object.keys(
    all
  ).forEach(
    function(key) {

      if (
        key.indexOf(
          prefix
        ) !== 0
      ) {

        return;

      }


      try {

        const event =
          JSON.parse(
            all[key]
          );


        records.push({

          key:
            key,

          timestamp:
            new Date(
              event.timestamp ||
              0
            ).getTime()

        });

      } catch (error) {

        records.push({

          key:
            key,

          timestamp:
            0

        });

      }

    }
  );


  if (
    records.length <=
    SESSION_ACTIVITY_CONFIG.MAX_ACTIVITY_HISTORY
  ) {

    return 0;

  }


  records.sort(
    function(a, b) {

      return (
        b.timestamp -
        a.timestamp
      );

    }
  );


  const remove =
    records.slice(
      SESSION_ACTIVITY_CONFIG.MAX_ACTIVITY_HISTORY
    );


  remove.forEach(
    function(record) {

      props.deleteProperty(
        record.key
      );

    }
  );


  return remove.length;

}


// =====================================================
// CLEAR SESSION ACTIVITY
// =====================================================

function clearSessionActivity(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getActivityUserPrefix(
      userId
    );


  let deleted =
    0;


  Object.keys(
    all
  ).forEach(
    function(key) {

      if (
        key.indexOf(
          prefix
        ) !== 0
      ) {

        return;

      }


      props.deleteProperty(
        key
      );


      deleted++;

    }
  );


  return {

    success: true,

    userId:
      userId,

    deleted:
      deleted

  };

}


// =====================================================
// RECORD LOGIN ACTIVITY
// =====================================================

function recordSessionLoginActivity(
  token,
  metadata
) {

  return recordSessionActivity(
    token,
    "LOGIN",
    metadata
  );

}


// =====================================================
// RECORD API ACTIVITY
// =====================================================

function recordSessionApiActivity(
  token,
  metadata
) {

  return touchSession(
    token,
    "API_REQUEST",
    metadata
  );

}


// =====================================================
// RECORD PAGE ACTIVITY
// =====================================================

function recordSessionPageActivity(
  token,
  page,
  metadata
) {

  metadata =
    metadata || {};


  metadata.page =
    page ||
    "";


  return touchSession(
    token,
    "PAGE_VIEW",
    metadata
  );

}


// =====================================================
// RECORD LOGOUT ACTIVITY
// =====================================================

function recordSessionLogoutActivity(
  token,
  metadata
) {

  return recordSessionActivity(
    token,
    "LOGOUT",
    metadata
  );

}


// =====================================================
// GET SESSION ACTIVITY SUMMARY
// =====================================================

function getSessionActivitySummary(
  userId
) {

  const events =
    getSessionActivityHistory(
      userId,
      SESSION_ACTIVITY_CONFIG.MAX_ACTIVITY_HISTORY
    );


  const summary = {

    total:
      events.length,

    logins:
      0,

    apiRequests:
      0,

    pageViews:
      0,

    logouts:
      0,

    lastActivity:
      null

  };


  events.forEach(
    function(event) {

      switch (
        String(
          event.type
        ).toUpperCase()
      ) {

        case "LOGIN":

          summary.logins++;
          break;

        case "API_REQUEST":

          summary.apiRequests++;
          break;

        case "PAGE_VIEW":

          summary.pageViews++;
          break;

        case "LOGOUT":

          summary.logouts++;
          break;

      }


      if (
        !summary.lastActivity ||
        new Date(
          event.timestamp
        ).getTime() >
        new Date(
          summary.lastActivity
        ).getTime()
      ) {

        summary.lastActivity =
          event.timestamp;

      }

    }
  );


  return summary;

}


// =====================================================
// CLEAN OLD ACTIVITY
// =====================================================

function cleanupSessionActivity(
  olderThanMs
) {

  olderThanMs =
    parseInt(
      olderThanMs,
      10
    );


  if (
    isNaN(olderThanMs) ||
    olderThanMs <= 0
  ) {

    olderThanMs =
      7 * 24 * 60 * 60 * 1000;

  }


  const cutoff =
    Date.now() -
    olderThanMs;


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  let deleted =
    0;


  Object.keys(
    all
  ).forEach(
    function(key) {

      if (
        key.indexOf(
          "SESSION_ACTIVITY_"
        ) !== 0
      ) {

        return;

      }


      try {

        const event =
          JSON.parse(
            all[key]
          );


        const timestamp =
          new Date(
            event.timestamp
          ).getTime();


        if (
          timestamp &&
          timestamp <
          cutoff
        ) {

          props.deleteProperty(
            key
          );

          deleted++;

        }

      } catch (error) {

        // Ignore malformed records.

      }

    }
  );


  return {

    success: true,

    deleted:
      deleted

  };

}