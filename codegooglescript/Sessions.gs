// =====================================================
// SESSIONS.GS
// Core Session Management
// Cloud Project Platform
// =====================================================


// =====================================================
// SESSION COLUMNS
// =====================================================

const SESSION_COLUMNS = {

  ID: 1,

  USER_ID: 2,

  TOKEN_HASH: 3,

  ROLE: 4,

  DEVICE_ID: 5,

  IP_ADDRESS: 6,

  USER_AGENT: 7,

  CREATED_AT: 8,

  LAST_ACTIVITY: 9,

  EXPIRES_AT: 10,

  STATUS: 11,

  LOGGED_OUT_AT: 12

};


// =====================================================
// SESSION DEFAULTS
// =====================================================

const DEFAULT_SESSION_STATUS =
  "Active";

const DEFAULT_SESSION_DURATION =
  30 * 24 * 60 * 60 * 1000;


// =====================================================
// GET SESSION DATABASE
// =====================================================

function getSessionsDatabase() {

  return getSheet(
    SHEETS.SESSIONS
  );

}


// =====================================================
// FIND SESSION BY ID
// =====================================================

function findSessionById(
  sessionId
) {

  if (!sessionId) {

    return null;

  }

  const sheet =
    getSessionsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SESSION_COLUMNS.ID - 1
        ]
      ) ===
      String(
        sessionId
      )
    ) {

      return sessionRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND SESSION BY TOKEN HASH
// =====================================================

function findSessionByTokenHash(
  tokenHash
) {

  if (!tokenHash) {

    return null;

  }

  const sheet =
    getSessionsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SESSION_COLUMNS.TOKEN_HASH - 1
        ]
      ) ===
      String(
        tokenHash
      )
    ) {

      return sessionRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND ACTIVE SESSIONS BY USER
// =====================================================

function findUserSessions(
  userId
) {

  const sessions =
    [];

  if (!userId) {

    return sessions;

  }

  const sheet =
    getSessionsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SESSION_COLUMNS.USER_ID - 1
        ]
      ) !==
      String(
        userId
      )
    ) {

      continue;

    }

    sessions.push(
      sessionRowToObject(
        row,
        i + 1
      )
    );

  }

  return sessions;

}


// =====================================================
// FIND ACTIVE USER SESSIONS
// =====================================================

function findActiveUserSessions(
  userId
) {

  return findUserSessions(
    userId
  )
    .filter(
      function(session) {

        return String(
          session.status || ""
        )
          .toLowerCase() ===
          "active";

      }
    );

}


// =====================================================
// CONVERT ROW TO SESSION OBJECT
// =====================================================

function sessionRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber || null,

    id:
      row[
        SESSION_COLUMNS.ID - 1
      ],

    userId:
      row[
        SESSION_COLUMNS.USER_ID - 1
      ],

    tokenHash:
      row[
        SESSION_COLUMNS.TOKEN_HASH - 1
      ],

    role:
      row[
        SESSION_COLUMNS.ROLE - 1
      ],

    deviceId:
      row[
        SESSION_COLUMNS.DEVICE_ID - 1
      ],

    ipAddress:
      row[
        SESSION_COLUMNS.IP_ADDRESS - 1
      ],

    userAgent:
      row[
        SESSION_COLUMNS.USER_AGENT - 1
      ],

    createdAt:
      row[
        SESSION_COLUMNS.CREATED_AT - 1
      ],

    lastActivity:
      row[
        SESSION_COLUMNS.LAST_ACTIVITY - 1
      ],

    expiresAt:
      row[
        SESSION_COLUMNS.EXPIRES_AT - 1
      ],

    status:
      row[
        SESSION_COLUMNS.STATUS - 1
      ],

    loggedOutAt:
      row[
        SESSION_COLUMNS.LOGGED_OUT_AT - 1
      ]

  };

}


// =====================================================
// CHECK SESSION ACTIVE
// =====================================================

function isSessionActive(
  session
) {

  if (!session) {

    return false;

  }

  if (
    String(
      session.status || ""
    )
      .toLowerCase() !==
    "active"
  ) {

    return false;

  }

  if (
    session.expiresAt
  ) {

    const expiry =
      new Date(
        session.expiresAt
      ).getTime();

    if (
      !isNaN(expiry) &&
      expiry <= Date.now()
    ) {

      return false;

    }

  }

  return true;

}


// =====================================================
// CHECK SESSION EXPIRATION
// =====================================================

function isSessionExpired(
  session
) {

  if (!session) {

    return true;

  }

  if (!session.expiresAt) {

    return false;

  }

  const expiry =
    new Date(
      session.expiresAt
    ).getTime();

  if (isNaN(expiry)) {

    return true;

  }

  return expiry <= Date.now();

}


// =====================================================
// UPDATE LAST ACTIVITY
// =====================================================

function updateSessionActivity(
  sessionId
) {

  if (!sessionId) {

    return false;

  }

  const session =
    findSessionById(
      sessionId
    );

  if (!session) {

    return false;

  }

  const sheet =
    getSessionsDatabase();

  sheet
    .getRange(
      session.row,
      SESSION_COLUMNS.LAST_ACTIVITY
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// UPDATE SESSION STATUS
// =====================================================

function updateSessionStatus(
  sessionId,
  status
) {

  if (!sessionId) {

    return false;

  }

  const session =
    findSessionById(
      sessionId
    );

  if (!session) {

    return false;

  }

  const sheet =
    getSessionsDatabase();

  sheet
    .getRange(
      session.row,
      SESSION_COLUMNS.STATUS
    )
    .setValue(
      String(
        status || ""
      ).trim()
    );

  return true;

}


// =====================================================
// EXPIRE SESSION
// =====================================================

function expireSession(
  sessionId
) {

  if (!sessionId) {

    return false;

  }

  const session =
    findSessionById(
      sessionId
    );

  if (!session) {

    return false;

  }

  const sheet =
    getSessionsDatabase();

  sheet
    .getRange(
      session.row,
      SESSION_COLUMNS.STATUS
    )
    .setValue(
      "Expired"
    );

  return true;

}


// =====================================================
// LOGOUT SESSION
// =====================================================

function markSessionLoggedOut(
  sessionId
) {

  if (!sessionId) {

    return false;

  }

  const session =
    findSessionById(
      sessionId
    );

  if (!session) {

    return false;

  }

  const sheet =
    getSessionsDatabase();

  sheet
    .getRange(
      session.row,
      SESSION_COLUMNS.STATUS
    )
    .setValue(
      "LoggedOut"
    );

  sheet
    .getRange(
      session.row,
      SESSION_COLUMNS.LOGGED_OUT_AT
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// DELETE SESSION
// =====================================================

function deleteSessionRecord(
  sessionId
) {

  if (!sessionId) {

    return false;

  }

  const session =
    findSessionById(
      sessionId
    );

  if (!session) {

    return false;

  }

  const sheet =
    getSessionsDatabase();

  sheet.deleteRow(
    session.row
  );

  return true;

}


// =====================================================
// COUNT ACTIVE SESSIONS
// =====================================================

function countActiveSessions() {

  const sheet =
    getSessionsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  let count =
    0;

  const now =
    Date.now();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const status =
      String(
        values[i][
          SESSION_COLUMNS.STATUS - 1
        ] || ""
      )
        .toLowerCase();

    if (
      status !== "active"
    ) {

      continue;

    }

    const expiresAt =
      values[i][
        SESSION_COLUMNS.EXPIRES_AT - 1
      ];

    if (expiresAt) {

      const expiry =
        new Date(
          expiresAt
        ).getTime();

      if (
        !isNaN(expiry) &&
        expiry <= now
      ) {

        continue;

      }

    }

    count++;

  }

  return count;

}


// =====================================================
// COUNT USER ACTIVE SESSIONS
// =====================================================

function countUserActiveSessions(
  userId
) {

  return findActiveUserSessions(
    userId
  ).filter(
    function(session) {

      return isSessionActive(
        session
      );

    }
  ).length;

}


// =====================================================
// GET SESSION CONFIGURATION
// =====================================================

function getSessionConfiguration() {

  return {

    status:
      DEFAULT_SESSION_STATUS,

    duration:
      DEFAULT_SESSION_DURATION,

    durationDays:
      DEFAULT_SESSION_DURATION /
      (
        24 *
        60 *
        60 *
        1000
      )

  };

}