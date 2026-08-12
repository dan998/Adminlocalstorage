// =====================================================
// SESSION LOCK
// SessionLock.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION LOCK CONFIGURATION
// =====================================================

const SESSION_LOCK_CONFIG = {

  // Default lock duration
  DEFAULT_LOCK_DURATION_MS:
    15 * 60 * 1000,

  // Maximum lock duration
  MAX_LOCK_DURATION_MS:
    24 * 60 * 60 * 1000,

  // Maximum failed unlock attempts
  MAX_UNLOCK_ATTEMPTS:
    5

};


// =====================================================
// LOCK SESSION
// =====================================================

function lockSession(
  token,
  reason,
  durationMs
) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  // ---------------------------------------------------
  // FIND SESSION
  // ---------------------------------------------------

  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    throw new Error(
      "Session not found"
    );

  }


  const now =
    new Date();


  // ---------------------------------------------------
  // DETERMINE LOCK DURATION
  // ---------------------------------------------------

  durationMs =
    parseInt(
      durationMs,
      10
    );


  if (
    isNaN(durationMs) ||
    durationMs <= 0
  ) {

    durationMs =
      SESSION_LOCK_CONFIG.DEFAULT_LOCK_DURATION_MS;

  }


  durationMs =
    Math.min(
      durationMs,
      SESSION_LOCK_CONFIG.MAX_LOCK_DURATION_MS
    );


  const lockedUntil =
    new Date(
      now.getTime() +
      durationMs
    );


  // ---------------------------------------------------
  // UPDATE SESSION
  // ---------------------------------------------------

  updateSessionLock(
    token,
    true,
    lockedUntil,
    reason
  );


  // ---------------------------------------------------
  // SECURITY LOG
  // ---------------------------------------------------

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_LOCKED",
      {

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********",

        reason:
          reason ||
          "Session locked",

        lockedUntil:
          lockedUntil.toISOString()

      }
    );

  }


  return {

    success: true,

    locked: true,

    userId:
      session.userId,

    lockedUntil:
      lockedUntil.toISOString(),

    duration:
      durationMs,

    reason:
      reason ||
      "Session locked"

  };

}


// =====================================================
// LOCK SESSION PERMANENTLY
// =====================================================

function permanentlyLockSession(
  token,
  reason
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


  updateSessionLock(
    token,
    true,
    null,
    reason ||
    "Session permanently locked"
  );


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_PERMANENTLY_LOCKED",
      {

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********",

        reason:
          reason ||
          "Session permanently locked"

      }
    );

  }


  return {

    success: true,

    locked: true,

    permanent: true,

    userId:
      session.userId

  };

}


// =====================================================
// UPDATE SESSION LOCK
// =====================================================

function updateSessionLock(
  token,
  locked,
  lockedUntil,
  reason
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


  const lockedColumn =
    findHeaderColumn(
      headers,
      [
        "Locked",
        "Session Locked",
        "Is Locked"
      ]
    );


  const lockedUntilColumn =
    findHeaderColumn(
      headers,
      [
        "Locked Until",
        "Lock Expiry",
        "Lock Until"
      ]
    );


  const reasonColumn =
    findHeaderColumn(
      headers,
      [
        "Lock Reason",
        "Locked Reason"
      ]
    );


  const updatedColumn =
    findHeaderColumn(
      headers,
      [
        "UpdatedAt",
        "Last Activity",
        "LastActivity"
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
    lockedColumn === -1
  ) {

    throw new Error(
      "Session lock column not found"
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
    // Locked state
    // -----------------------------------------------

    sheet
      .getRange(
        i + 1,
        lockedColumn + 1
      )
      .setValue(
        locked
      );


    // -----------------------------------------------
    // Lock expiration
    // -----------------------------------------------

    if (
      lockedUntilColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          lockedUntilColumn + 1
        )
        .setValue(
          lockedUntil || ""
        );

    }


    // -----------------------------------------------
    // Lock reason
    // -----------------------------------------------

    if (
      reasonColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          reasonColumn + 1
        )
        .setValue(
          reason || ""
        );

    }


    // -----------------------------------------------
    // Updated time
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
          new Date()
        );

    }


    return true;

  }


  throw new Error(
    "Session not found"
  );

}


// =====================================================
// CHECK SESSION LOCK
// =====================================================

function isSessionLocked(
  token
) {

  if (!token) {

    return {

      locked: true,

      reason:
        "Missing session token"

    };

  }


  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return {

      locked: true,

      reason:
        "Session not found"

    };

  }


  const locked =
    session.locked === true ||
    String(
      session.locked
    ).toLowerCase() ===
    "true";


  if (!locked) {

    return {

      locked: false,

      userId:
        session.userId

    };

  }


  const lockedUntil =
    session.lockedUntil ||
    session.lockExpiry ||
    session.lockUntil;


  // ---------------------------------------------------
  // Permanent lock
  // ---------------------------------------------------

  if (!lockedUntil) {

    return {

      locked: true,

      permanent: true,

      userId:
        session.userId,

      reason:
        session.lockReason ||
        "Session permanently locked"

    };

  }


  const expiry =
    new Date(
      lockedUntil
    );


  if (
    isNaN(
      expiry.getTime()
    )
  ) {

    return {

      locked: true,

      permanent: true,

      userId:
        session.userId,

      reason:
        "Invalid lock expiration"

    };

  }


  // ---------------------------------------------------
  // Lock expired
  // ---------------------------------------------------

  if (
    expiry.getTime() <=
    Date.now()
  ) {

    unlockSession(
      token
    );


    return {

      locked: false,

      expired: true,

      userId:
        session.userId

    };

  }


  return {

    locked: true,

    permanent: false,

    userId:
      session.userId,

    lockedUntil:
      expiry.toISOString(),

    remaining:
      expiry.getTime() -
      Date.now(),

    reason:
      session.lockReason ||
      "Session locked"

  };

}


// =====================================================
// REQUIRE UNLOCKED SESSION
// =====================================================

function requireUnlockedSession(
  token
) {

  const result =
    isSessionLocked(
      token
    );


  if (
    result.locked
  ) {

    throw new Error(
      result.reason ||
      "Session is locked"
    );

  }


  return true;

}


// =====================================================
// UNLOCK SESSION
// =====================================================

function unlockSession(
  token,
  reason
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


  updateSessionLock(
    token,
    false,
    null,
    ""
  );


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_UNLOCKED",
      {

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********",

        reason:
          reason ||
          "Session unlocked"

      }
    );

  }


  return {

    success: true,

    locked: false,

    userId:
      session.userId

  };

}


// =====================================================
// LOCK ALL USER SESSIONS
// =====================================================

function lockAllUserSessions(
  userId,
  reason,
  durationMs
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  if (
    typeof getUserSessions !==
    "function"
  ) {

    throw new Error(
      "Session reader is unavailable"
    );

  }


  const sessions =
    getUserSessions(
      userId
    ) || [];


  let locked =
    0;


  sessions.forEach(
    function(session) {

      const token =
        session.token ||
        session.sessionToken ||
        session.session_token;


      if (!token) {

        return;

      }


      try {

        lockSession(
          token,
          reason ||
          "All user sessions locked",
          durationMs
        );

        locked++;

      } catch (error) {

        // Continue with remaining sessions.

      }

    }
  );


  return {

    success: true,

    userId:
      userId,

    locked:
      locked

  };

}


// =====================================================
// UNLOCK ALL USER SESSIONS
// =====================================================

function unlockAllUserSessions(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  if (
    typeof getUserSessions !==
    "function"
  ) {

    throw new Error(
      "Session reader is unavailable"
    );

  }


  const sessions =
    getUserSessions(
      userId
    ) || [];


  let unlocked =
    0;


  sessions.forEach(
    function(session) {

      const token =
        session.token ||
        session.sessionToken ||
        session.session_token;


      if (!token) {

        return;

      }


      try {

        unlockSession(
          token,
          "All user sessions unlocked"
        );

        unlocked++;

      } catch (error) {

        // Continue with remaining sessions.

      }

    }
  );


  return {

    success: true,

    userId:
      userId,

    unlocked:
      unlocked

  };

}


// =====================================================
// LOCK SESSION FROM REQUEST
// =====================================================

function lockSessionFromRequest(
  request
) {

  request =
    request || {};


  const token =
    request.token ||
    request.sessionToken ||
    request.session_token;


  const reason =
    request.reason ||
    "Session locked";


  const duration =
    request.durationMs ||
    request.duration ||
    SESSION_LOCK_CONFIG.DEFAULT_LOCK_DURATION_MS;


  return lockSession(
    token,
    reason,
    duration
  );

}


// =====================================================
// GET LOCK STATUS
// =====================================================

function getSessionLockStatus(
  token
) {

  return isSessionLocked(
    token
  );

}


// =====================================================
// CLEAR EXPIRED SESSION LOCKS
// =====================================================

function clearExpiredSessionLocks() {

  const sheet =
    getSheet(
      SHEETS.SESSIONS
    );


  if (!sheet) {

    return 0;

  }


  const values =
    sheet.getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    return 0;

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


  const lockedColumn =
    findHeaderColumn(
      headers,
      [
        "Locked",
        "Session Locked",
        "Is Locked"
      ]
    );


  const lockedUntilColumn =
    findHeaderColumn(
      headers,
      [
        "Locked Until",
        "Lock Expiry",
        "Lock Until"
      ]
    );


  if (
    tokenColumn === -1 ||
    lockedColumn === -1 ||
    lockedUntilColumn === -1
  ) {

    return 0;

  }


  const now =
    Date.now();


  let cleared =
    0;


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const locked =
      String(
        values[i][lockedColumn]
      ).toLowerCase() ===
      "true";


    if (!locked) {

      continue;

    }


    const lockExpiry =
      new Date(
        values[i][lockedUntilColumn]
      );


    if (
      isNaN(
        lockExpiry.getTime()
      )
    ) {

      continue;

    }


    if (
      lockExpiry.getTime() <=
      now
    ) {

      sheet
        .getRange(
          i + 1,
          lockedColumn + 1
        )
        .setValue(
          false
        );


      sheet
        .getRange(
          i + 1,
          lockedUntilColumn + 1
        )
        .setValue(
          ""
        );


      cleared++;

    }

  }


  return cleared;

}