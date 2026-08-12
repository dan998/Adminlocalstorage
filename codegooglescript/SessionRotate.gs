// =====================================================
// SESSION ROTATION
// SessionRotate.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION ROTATION CONFIGURATION
// =====================================================

const SESSION_ROTATE_CONFIG = {

  // New lifetime after rotation
  SESSION_DURATION_MS:
    30 * 24 * 60 * 60 * 1000,

  // Number of tokens temporarily accepted
  // during a controlled rotation.
  GRACE_PERIOD_MS:
    30 * 1000

};


// =====================================================
// ROTATE SESSION TOKEN
// =====================================================

function rotateSessionToken(token) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  // ---------------------------------------------------
  // FIND CURRENT SESSION
  // ---------------------------------------------------

  const session =
    getSessionByToken(token);

  if (!session) {

    throw new Error(
      "Invalid session"
    );

  }


  // ---------------------------------------------------
  // CHECK EXPIRATION
  // ---------------------------------------------------

  const now =
    new Date();

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

    throw new Error(
      "Invalid session expiration"
    );

  }


  if (
    expiresAt.getTime() <=
    now.getTime()
  ) {

    if (
      typeof invalidateSession ===
      "function"
    ) {

      invalidateSession(
        token
      );

    }

    throw new Error(
      "Session has expired"
    );

  }


  // ---------------------------------------------------
  // CHECK USER
  // ---------------------------------------------------

  const user =
    getUserById(
      session.userId
    );

  if (!user) {

    if (
      typeof invalidateSession ===
      "function"
    ) {

      invalidateSession(
        token
      );

    }

    throw new Error(
      "User account not found"
    );

  }


  // ---------------------------------------------------
  // CHECK USER STATUS
  // ---------------------------------------------------

  if (
    user.status &&
    String(
      user.status
    ).toLowerCase() !==
    "active"
  ) {

    if (
      typeof invalidateSession ===
      "function"
    ) {

      invalidateSession(
        token
      );

    }

    throw new Error(
      "User account is not active"
    );

  }


  // ---------------------------------------------------
  // GENERATE NEW TOKEN
  // ---------------------------------------------------

  const newToken =
    generateToken();


  if (!newToken) {

    throw new Error(
      "Unable to generate new session token"
    );

  }


  if (
    String(newToken) ===
    String(token)
  ) {

    throw new Error(
      "Token rotation failed"
    );

  }


  // ---------------------------------------------------
  // NEW EXPIRATION
  // ---------------------------------------------------

  const newExpiry =
    new Date(
      now.getTime() +
      SESSION_ROTATE_CONFIG.SESSION_DURATION_MS
    );


  // ---------------------------------------------------
  // UPDATE SESSION
  // ---------------------------------------------------

  replaceSessionToken(
    token,
    newToken,
    newExpiry,
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
      "SESSION_TOKEN_ROTATED",
      {
        previousToken:
          maskSessionToken(
            token
          ),

        newToken:
          maskSessionToken(
            newToken
          ),

        expiresAt:
          newExpiry.toISOString()
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
      "TOKEN_ROTATED",
      {
        rotatedAt:
          now.toISOString()
      }
    );

  }


  // ---------------------------------------------------
  // RETURN
  // ---------------------------------------------------

  return {

    success: true,

    token:
      newToken,

    expiresAt:
      newExpiry.toISOString(),

    expiresIn:
      SESSION_ROTATE_CONFIG.SESSION_DURATION_MS,

    userId:
      session.userId,

    role:
      session.role ||
      user.role,

    rotatedAt:
      now.toISOString()

  };

}


// =====================================================
// REPLACE SESSION TOKEN
// =====================================================

function replaceSessionToken(
  oldToken,
  newToken,
  newExpiry,
  updatedAt
) {

  if (!oldToken) {

    throw new Error(
      "Old session token is required"
    );

  }


  if (!newToken) {

    throw new Error(
      "New session token is required"
    );

  }


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


  const expiryColumn =
    findHeaderColumn(
      headers,
      [
        "Token Expiry",
        "ExpiresAt",
        "Expiry"
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

    const storedToken =
      String(
        values[i][tokenColumn]
      );


    if (
      storedToken !==
      String(oldToken)
    ) {

      continue;

    }


    // -----------------------------------------------
    // Replace token
    // -----------------------------------------------

    sheet
      .getRange(
        i + 1,
        tokenColumn + 1
      )
      .setValue(
        newToken
      );


    // -----------------------------------------------
    // Update expiration
    // -----------------------------------------------

    if (
      expiryColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          expiryColumn + 1
        )
        .setValue(
          newExpiry
        );

    }


    // -----------------------------------------------
    // Update activity
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
          updatedAt
        );

    }


    return true;

  }


  throw new Error(
    "Session token not found"
  );

}


// =====================================================
// ROTATE SESSION FROM REQUEST
// =====================================================

function rotateSessionFromRequest(
  request
) {

  request =
    request || {};


  const token =
    request.token ||
    request.sessionToken ||
    request.session_token;


  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  return rotateSessionToken(
    token
  );

}


// =====================================================
// FORCE SESSION ROTATION
// =====================================================

function forceSessionRotation(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const sessions =
    getUserSessions(
      userId
    );


  if (
    !sessions ||
    !sessions.length
  ) {

    return {

      success: true,

      rotated: 0

    };

  }


  let rotated =
    0;


  sessions.forEach(
    function(session) {

      const token =
        session.token ||
        session.sessionToken;


      if (!token) {

        return;

      }


      try {

        rotateSessionToken(
          token
        );

        rotated++;

      } catch (error) {

        // Continue rotating
        // other active sessions.

      }

    }
  );


  return {

    success: true,

    userId:
      userId,

    rotated:
      rotated

  };

}


// =====================================================
// ROTATE ALL ACTIVE SESSIONS
// =====================================================

function rotateAllUserSessions(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  const sessions =
    getUserSessions(
      userId
    );


  if (
    !sessions ||
    !sessions.length
  ) {

    return [];

  }


  const results =
    [];


  sessions.forEach(
    function(session) {

      const token =
        session.token ||
        session.sessionToken;


      if (!token) {

        return;

      }


      try {

        const result =
          rotateSessionToken(
            token
          );


        results.push(
          result
        );

      } catch (error) {

        results.push({

          success: false,

          error:
            error.message

        });

      }

    }
  );


  return results;

}


// =====================================================
// VERIFY ROTATED TOKEN
// =====================================================

function verifyRotatedSessionToken(
  token
) {

  if (!token) {

    return {

      valid: false,

      reason:
        "Missing token"

    };

  }


  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return {

      valid: false,

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

      valid: false,

      reason:
        "Invalid expiration"

    };

  }


  if (
    expiresAt.getTime() <=
    Date.now()
  ) {

    return {

      valid: false,

      reason:
        "Session expired"

    };

  }


  return {

    valid: true,

    userId:
      session.userId,

    role:
      session.role,

    expiresAt:
      expiresAt.toISOString()

  };

}


// =====================================================
// ROTATION RESPONSE
// =====================================================

function getSessionRotationResponse(
  token
) {

  const result =
    rotateSessionToken(
      token
    );


  return {

    success:
      result.success,

    token:
      result.token,

    expiresAt:
      result.expiresAt,

    expiresIn:
      result.expiresIn,

    userId:
      result.userId,

    role:
      result.role,

    rotatedAt:
      result.rotatedAt

  };

}