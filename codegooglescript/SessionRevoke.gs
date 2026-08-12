// =====================================================
// SESSION REVOKE
// SessionRevoke.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION REVOKE CONFIGURATION
// =====================================================

const SESSION_REVOKE_CONFIG = {

  // Whether to keep revoked sessions in the sheet
  KEEP_REVOKED_SESSIONS: true,

  // Default reason
  DEFAULT_REASON:
    "Session revoked"

};


// =====================================================
// REVOKE SESSION
// =====================================================

function revokeSession(
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


  const now =
    new Date();


  reason =
    reason ||
    SESSION_REVOKE_CONFIG.DEFAULT_REASON;


  // ---------------------------------------------------
  // UPDATE SESSION
  // ---------------------------------------------------

  updateSessionRevocation(
    token,
    reason,
    now
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
      "SESSION_REVOKED",
      {

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********",

        reason:
          reason,

        revokedAt:
          now.toISOString()

      }
    );

  }


  // ---------------------------------------------------
  // ANALYTICS
  // ---------------------------------------------------

  if (
    typeof recordSessionEvent ===
    "function"
  ) {

    recordSessionEvent(
      session.userId,
      "SESSION_REVOKED",
      {

        reason:
          reason,

        revokedAt:
          now.toISOString()

      }
    );

  }


  return {

    success: true,

    revoked: true,

    userId:
      session.userId,

    revokedAt:
      now.toISOString(),

    reason:
      reason

  };

}


// =====================================================
// UPDATE SESSION REVOCATION
// =====================================================

function updateSessionRevocation(
  token,
  reason,
  revokedAt
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


  const statusColumn =
    findHeaderColumn(
      headers,
      [
        "Status",
        "Session Status"
      ]
    );


  const revokedColumn =
    findHeaderColumn(
      headers,
      [
        "Revoked",
        "Is Revoked"
      ]
    );


  const revokedAtColumn =
    findHeaderColumn(
      headers,
      [
        "Revoked At",
        "RevokedAt"
      ]
    );


  const reasonColumn =
    findHeaderColumn(
      headers,
      [
        "Revoke Reason",
        "Revocation Reason",
        "Reason"
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
    // Session status
    // -----------------------------------------------

    if (
      statusColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          statusColumn + 1
        )
        .setValue(
          "Revoked"
        );

    }


    // -----------------------------------------------
    // Revoked flag
    // -----------------------------------------------

    if (
      revokedColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          revokedColumn + 1
        )
        .setValue(
          true
        );

    }


    // -----------------------------------------------
    // Revoked timestamp
    // -----------------------------------------------

    if (
      revokedAtColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          revokedAtColumn + 1
        )
        .setValue(
          revokedAt
        );

    }


    // -----------------------------------------------
    // Revocation reason
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
          reason
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
          updatedAt()
        );

    }


    return true;

  }


  throw new Error(
    "Session token not found"
  );

}


// =====================================================
// CHECK WHETHER SESSION IS REVOKED
// =====================================================

function isSessionRevoked(
  token
) {

  if (!token) {

    return {

      revoked: true,

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

      revoked: true,

      reason:
        "Session not found"

    };

  }


  const revoked =
    session.revoked === true ||
    String(
      session.revoked
    ).toLowerCase() ===
    "true";


  const status =
    String(
      session.status ||
      ""
    ).toLowerCase();


  if (
    revoked ||
    status === "revoked"
  ) {

    return {

      revoked: true,

      userId:
        session.userId,

      reason:
        session.revokeReason ||
        session.revocationReason ||
        "Session revoked",

      revokedAt:
        session.revokedAt ||
        session.revoked_at ||
        null

    };

  }


  return {

    revoked: false,

    userId:
      session.userId

  };

}


// =====================================================
// REQUIRE NON-REVOKED SESSION
// =====================================================

function requireActiveSession(
  token
) {

  const result =
    isSessionRevoked(
      token
    );


  if (
    result.revoked
  ) {

    throw new Error(
      result.reason ||
      "Session has been revoked"
    );

  }


  return true;

}


// =====================================================
// REVOKE ALL USER SESSIONS
// =====================================================

function revokeUserSessions(
  userId,
  reason,
  exceptToken
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


  let revoked =
    0;


  reason =
    reason ||
    "All user sessions revoked";


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
        exceptToken &&
        String(token) ===
        String(exceptToken)
      ) {

        return;

      }


      try {

        const result =
          isSessionRevoked(
            token
          );


        if (
          result.revoked
        ) {

          return;

        }


        revokeSession(
          token,
          reason
        );


        revoked++;

      } catch (error) {

        // Continue with remaining sessions.

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
      countActiveSessionsSafe(
        userId
      )

  };

}


// =====================================================
// REVOKE CURRENT SESSION
// =====================================================

function revokeCurrentSession(
  token,
  reason
) {

  return revokeSession(
    token,
    reason ||
    "Current session revoked"
  );

}


// =====================================================
// REVOKE OTHER SESSIONS
// =====================================================

function revokeOtherUserSessions(
  userId,
  currentToken,
  reason
) {

  return revokeUserSessions(
    userId,
    reason ||
    "Other sessions revoked",
    currentToken
  );

}


// =====================================================
// REVOKE DEVICE SESSIONS
// =====================================================

function revokeSessionsByDevice(
  userId,
  deviceId,
  reason
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  if (!deviceId) {

    throw new Error(
      "Device ID is required"
    );

  }


  const sessions =
    typeof getUserSessions ===
    "function"
      ? getUserSessions(
          userId
        ) || []
      : [];


  let revoked =
    0;


  reason =
    reason ||
    "Device sessions revoked";


  sessions.forEach(
    function(session) {

      const sessionDeviceId =
        session.deviceId ||
        session.deviceID;


      if (
        String(
          sessionDeviceId
        ) !==
        String(deviceId)
      ) {

        return;

      }


      const token =
        session.token ||
        session.sessionToken ||
        session.session_token;


      if (!token) {

        return;

      }


      try {

        const result =
          isSessionRevoked(
            token
          );


        if (
          !result.revoked
        ) {

          revokeSession(
            token,
            reason
          );

          revoked++;

        }

      } catch (error) {

        // Continue with remaining sessions.

      }

    }
  );


  return {

    success: true,

    userId:
      userId,

    deviceId:
      deviceId,

    revoked:
      revoked

  };

}


// =====================================================
// REVOKE SESSIONS BY ROLE
// =====================================================

function revokeSessionsByRole(
  role,
  reason
) {

  if (!role) {

    throw new Error(
      "Role is required"
    );

  }


  if (
    typeof getAllSessions !==
    "function"
  ) {

    throw new Error(
      "Session reader is unavailable"
    );

  }


  const sessions =
    getAllSessions() || [];


  let revoked =
    0;


  reason =
    reason ||
    "Sessions revoked by role";


  sessions.forEach(
    function(session) {

      const sessionRole =
        session.role ||
        "";


      if (
        String(
          sessionRole
        ).toLowerCase() !==
        String(
          role
        ).toLowerCase()
      ) {

        return;

      }


      const token =
        session.token ||
        session.sessionToken ||
        session.session_token;


      if (!token) {

        return;

      }


      try {

        if (
          !isSessionRevoked(
            token
          ).revoked
        ) {

          revokeSession(
            token,
            reason
          );

          revoked++;

        }

      } catch (error) {

        // Continue processing.

      }

    }
  );


  return {

    success: true,

    role:
      role,

    revoked:
      revoked

  };

}


// =====================================================
// REVOKE ALL SESSIONS
// =====================================================

function revokeAllSessions(
  reason
) {

  if (
    typeof getAllSessions !==
    "function"
  ) {

    throw new Error(
      "Session reader is unavailable"
    );

  }


  const sessions =
    getAllSessions() || [];


  let revoked =
    0;


  reason =
    reason ||
    "All sessions revoked";


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
          !isSessionRevoked(
            token
          ).revoked
        ) {

          revokeSession(
            token,
            reason
          );

          revoked++;

        }

      } catch (error) {

        // Continue processing.

      }

    }
  );


  return {

    success: true,

    revoked:
      revoked

  };

}


// =====================================================
// REVOKE FROM REQUEST
// =====================================================

function revokeSessionFromRequest(
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
    "Session revoked";


  return revokeSession(
    token,
    reason
  );

}


// =====================================================
// GET REVOCATION STATUS
// =====================================================

function getSessionRevocationStatus(
  token
) {

  return isSessionRevoked(
    token
  );

}


// =====================================================
// SAFE SESSION COUNT
// =====================================================

function countActiveSessionsSafe(
  userId
) {

  try {

    if (
      typeof countActiveSessions ===
      "function"
    ) {

      return countActiveSessions(
        userId
      );

    }

  } catch (error) {

    return 0;

  }


  return 0;

}


// =====================================================
// SESSION REVOCATION VALIDATION
// =====================================================

function validateSessionRevocation(
  token
) {

  const result =
    isSessionRevoked(
      token
    );


  return {

    valid:
      result.revoked !== true,

    revoked:
      result.revoked === true,

    userId:
      result.userId ||
      null,

    reason:
      result.reason ||
      null,

    revokedAt:
      result.revokedAt ||
      null

  };

}


// =====================================================
// REVOKE EXPIRED SESSION
// =====================================================

function revokeExpiredSession(
  token
) {

  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return {

      success: false,

      reason:
        "Session not found"

    };

  }


  const expiresAt =
    new Date(
      session.expiresAt ||
      session.tokenExpiry ||
      session.expiry
    );


  if (
    isNaN(
      expiresAt.getTime()
    )
  ) {

    return {

      success: false,

      reason:
        "Invalid session expiration"

    };

  }


  if (
    expiresAt.getTime() >
    Date.now()
  ) {

    return {

      success: false,

      reason:
        "Session has not expired"

    };

  }


  return revokeSession(
    token,
    "Session expired"
  );

}