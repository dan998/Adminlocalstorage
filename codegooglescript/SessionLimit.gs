// =====================================================
// SESSION LIMIT
// SessionLimit.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION LIMIT CONFIGURATION
// =====================================================

const SESSION_LIMIT_CONFIG = {

  // Default maximum active sessions
  DEFAULT_MAX_SESSIONS: 5,

  // Maximum allowed configuration value
  ABSOLUTE_MAX_SESSIONS: 20,

  // Automatically remove oldest session
  AUTO_REVOKE_OLDEST: false

};


// =====================================================
// GET MAX SESSION LIMIT
// =====================================================

function getMaxSessionLimit(userId) {

  if (!userId) {

    return SESSION_LIMIT_CONFIG.DEFAULT_MAX_SESSIONS;

  }


  // ---------------------------------------------------
  // User-specific limit
  // ---------------------------------------------------

  if (
    typeof getUserById ===
    "function"
  ) {

    const user =
      getUserById(
        userId
      );


    if (
      user &&
      user.maxSessions !== undefined &&
      user.maxSessions !== ""
    ) {

      const limit =
        parseInt(
          user.maxSessions,
          10
        );


      if (
        !isNaN(limit) &&
        limit > 0
      ) {

        return Math.min(
          limit,
          SESSION_LIMIT_CONFIG.ABSOLUTE_MAX_SESSIONS
        );

      }

    }

  }


  // ---------------------------------------------------
  // Global setting
  // ---------------------------------------------------

  if (
    typeof getSetting ===
    "function"
  ) {

    const setting =
      getSetting(
        "Max Sessions"
      );


    if (
      setting !== undefined &&
      setting !== null &&
      setting !== ""
    ) {

      const limit =
        parseInt(
          setting,
          10
        );


      if (
        !isNaN(limit) &&
        limit > 0
      ) {

        return Math.min(
          limit,
          SESSION_LIMIT_CONFIG.ABSOLUTE_MAX_SESSIONS
        );

      }

    }

  }


  return SESSION_LIMIT_CONFIG.DEFAULT_MAX_SESSIONS;

}


// =====================================================
// GET USER ACTIVE SESSIONS
// =====================================================

function getActiveUserSessions(
  userId
) {

  if (!userId) {

    return [];

  }


  if (
    typeof getUserSessions ===
    "function"
  ) {

    const sessions =
      getUserSessions(
        userId
      ) || [];


    const now =
      Date.now();


    return sessions.filter(
      function(session) {

        if (
          session.status &&
          String(
            session.status
          ).toLowerCase() !==
          "active"
        ) {

          return false;

        }


        const expiry =
          new Date(
            session.expiresAt ||
            session.tokenExpiry ||
            session.expiry
          );


        if (
          isNaN(
            expiry.getTime()
          )
        ) {

          return false;

        }


        return (
          expiry.getTime() >
          now
        );

      }
    );

  }


  return [];

}


// =====================================================
// COUNT ACTIVE SESSIONS
// =====================================================

function countActiveSessions(
  userId
) {

  return getActiveUserSessions(
    userId
  ).length;

}


// =====================================================
// CHECK SESSION LIMIT
// =====================================================

function checkSessionLimit(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const active =
    countActiveSessions(
      userId
    );


  const maximum =
    getMaxSessionLimit(
      userId
    );


  return {

    allowed:
      active < maximum,

    current:
      active,

    maximum:
      maximum,

    remaining:
      Math.max(
        0,
        maximum - active
      ),

    limitReached:
      active >= maximum

  };

}


// =====================================================
// ENFORCE SESSION LIMIT
// =====================================================

function enforceSessionLimit(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const result =
    checkSessionLimit(
      userId
    );


  if (
    result.allowed
  ) {

    return result;

  }


  // ---------------------------------------------------
  // Optional automatic oldest-session removal
  // ---------------------------------------------------

  if (
    SESSION_LIMIT_CONFIG.AUTO_REVOKE_OLDEST
  ) {

    const revoked =
      revokeOldestUserSession(
        userId
      );


    if (revoked) {

      return checkSessionLimit(
        userId
      );

    }

  }


  throw new Error(
    "Maximum active session limit reached"
  );

}


// =====================================================
// CHECK BEFORE CREATING SESSION
// =====================================================

function canCreateSession(
  userId
) {

  const result =
    checkSessionLimit(
      userId
    );


  return {

    allowed:
      result.allowed,

    current:
      result.current,

    maximum:
      result.maximum,

    remaining:
      result.remaining,

    reason:
      result.allowed
        ? null
        : "Maximum active session limit reached"

  };

}


// =====================================================
// REVOKE OLDEST SESSION
// =====================================================

function revokeOldestUserSession(
  userId
) {

  const sessions =
    getActiveUserSessions(
      userId
    );


  if (
    !sessions.length
  ) {

    return false;

  }


  sessions.sort(
    function(a, b) {

      const aDate =
        new Date(
          a.lastActivity ||
          a.lastActivityAt ||
          a.updatedAt ||
          a.createdAt ||
          0
        ).getTime();


      const bDate =
        new Date(
          b.lastActivity ||
          b.lastActivityAt ||
          b.updatedAt ||
          b.createdAt ||
          0
        ).getTime();


      return aDate - bDate;

    }
  );


  const oldest =
    sessions[0];


  const token =
    oldest.token ||
    oldest.sessionToken ||
    oldest.session_token;


  if (
    !token
  ) {

    return false;

  }


  if (
    typeof invalidateSession ===
    "function"
  ) {

    invalidateSession(
      token
    );

  } else if (
    typeof deleteSession ===
    "function"
  ) {

    deleteSession(
      token
    );

  } else {

    return false;

  }


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "OLDEST_SESSION_REVOKED",
      {

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********"

      }
    );

  }


  return true;

}


// =====================================================
// REVOKE ALL USER SESSIONS EXCEPT CURRENT
// =====================================================

function revokeOtherSessions(
  userId,
  currentToken
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const sessions =
    getActiveUserSessions(
      userId
    );


  let revoked =
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


      if (
        currentToken &&
        String(token) ===
        String(currentToken)
      ) {

        return;

      }


      try {

        if (
          typeof invalidateSession ===
          "function"
        ) {

          invalidateSession(
            token
          );

          revoked++;

        }

      } catch (error) {

        // Continue processing remaining sessions.

      }

    }
  );


  return {

    success: true,

    userId:
      userId,

    revoked:
      revoked,

    remaining:
      countActiveSessions(
        userId
      )

  };

}


// =====================================================
// REVOKE ALL USER SESSIONS
// =====================================================

function revokeAllUserSessions(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const sessions =
    getActiveUserSessions(
      userId
    );


  let revoked =
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

        if (
          typeof invalidateSession ===
          "function"
        ) {

          invalidateSession(
            token
          );

          revoked++;

        }

      } catch (error) {

        // Continue with remaining sessions.

      }

    }
  );


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "ALL_SESSIONS_REVOKED",
      {

        revoked:
          revoked

      }
    );

  }


  return {

    success: true,

    userId:
      userId,

    revoked:
      revoked,

    remaining:
      countActiveSessions(
        userId
      )

  };

}


// =====================================================
// SET USER SESSION LIMIT
// =====================================================

function setUserSessionLimit(
  userId,
  limit
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  limit =
    parseInt(
      limit,
      10
    );


  if (
    isNaN(limit) ||
    limit < 1
  ) {

    throw new Error(
      "Session limit must be at least 1"
    );

  }


  if (
    limit >
    SESSION_LIMIT_CONFIG.ABSOLUTE_MAX_SESSIONS
  ) {

    throw new Error(
      "Session limit exceeds maximum allowed value"
    );

  }


  const sheet =
    typeof getSheet ===
    "function"
      ? getSheet(
          SHEETS.USERS
        )
      : null;


  if (!sheet) {

    throw new Error(
      "Users sheet not found"
    );

  }


  const values =
    sheet.getDataRange()
      .getValues();


  if (
    values.length <= 1
  ) {

    throw new Error(
      "User not found"
    );

  }


  const headers =
    values[0];


  const idColumn =
    findHeaderColumn(
      headers,
      [
        "ID",
        "User ID"
      ]
    );


  const limitColumn =
    findHeaderColumn(
      headers,
      [
        "Max Sessions",
        "Session Limit",
        "MaxSession"
      ]
    );


  if (
    idColumn === -1
  ) {

    throw new Error(
      "User ID column not found"
    );

  }


  if (
    limitColumn === -1
  ) {

    throw new Error(
      "Session limit column not found"
    );

  }


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(
        values[i][idColumn]
      ) !==
      String(userId)
    ) {

      continue;

    }


    sheet
      .getRange(
        i + 1,
        limitColumn + 1
      )
      .setValue(
        limit
      );


    return {

      success: true,

      userId:
        userId,

      maximum:
        limit

    };

  }


  throw new Error(
    "User not found"
  );

}


// =====================================================
// GET SESSION LIMIT STATUS
// =====================================================

function getSessionLimitStatus(
  userId
) {

  const current =
    countActiveSessions(
      userId
    );


  const maximum =
    getMaxSessionLimit(
      userId
    );


  return {

    userId:
      userId,

    current:
      current,

    maximum:
      maximum,

    remaining:
      Math.max(
        0,
        maximum - current
      ),

    limitReached:
      current >= maximum,

    utilization:
      maximum > 0
        ? Math.round(
            (
              current /
              maximum
            ) * 100
          )
        : 0

  };

}


// =====================================================
// CLEAN EXPIRED SESSIONS BEFORE LIMIT CHECK
// =====================================================

function cleanupExpiredSessionsForLimit(
  userId
) {

  if (
    typeof cleanupExpiredSessions ===
    "function"
  ) {

    try {

      cleanupExpiredSessions(
        userId
      );

    } catch (error) {

      // Limit checking should continue
      // even if cleanup fails.

    }

  }


  return checkSessionLimit(
    userId
  );

}