// =====================================================
// SESSION REFRESH
// SessionRefresh.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION REFRESH CONFIGURATION
// =====================================================

const SESSION_REFRESH_CONFIG = {

  // Session lifetime after refresh
  SESSION_DURATION_MS:
    30 * 24 * 60 * 60 * 1000,

  // Rotate token when remaining lifetime is below this
  ROTATE_THRESHOLD_MS:
    24 * 60 * 60 * 1000,

  // Maximum allowed refresh failures
  MAX_REFRESH_ATTEMPTS: 5

};


// =====================================================
// REFRESH SESSION
// =====================================================

function refreshSession(token) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }

  const session =
    getSessionByToken(token);

  if (!session) {

    throw new Error(
      "Invalid session"
    );

  }


  // ---------------------------------------------------
  // CHECK SESSION EXPIRATION
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

    invalidateSession(token);

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

    invalidateSession(token);

    throw new Error(
      "User account not found"
    );

  }


  // ---------------------------------------------------
  // CHECK ACCOUNT STATUS
  // ---------------------------------------------------

  if (
    user.status &&
    String(user.status).toLowerCase() !==
    "active"
  ) {

    invalidateSession(token);

    throw new Error(
      "User account is not active"
    );

  }


  // ---------------------------------------------------
  // DETERMINE WHETHER TOKEN SHOULD ROTATE
  // ---------------------------------------------------

  const remainingTime =
    expiresAt.getTime() -
    now.getTime();

  let newToken =
    token;

  let rotated =
    false;


  if (
    remainingTime <=
    SESSION_REFRESH_CONFIG.ROTATE_THRESHOLD_MS
  ) {

    newToken =
      generateToken();

    rotated =
      true;

  }


  // ---------------------------------------------------
  // NEW EXPIRATION
  // ---------------------------------------------------

  const newExpiry =
    new Date(
      now.getTime() +
      SESSION_REFRESH_CONFIG.SESSION_DURATION_MS
    );


  // ---------------------------------------------------
  // UPDATE SESSION
  // ---------------------------------------------------

  updateSessionRefresh(
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
      user.id ||
      session.userId,
      "SESSION_REFRESH",
      {
        rotated: rotated,
        previousToken: maskSessionToken(token),
        newToken: maskSessionToken(newToken),
        expiresAt: newExpiry.toISOString()
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
      SESSION_REFRESH_CONFIG.SESSION_DURATION_MS,

    rotated:
      rotated,

    userId:
      session.userId,

    role:
      session.role ||
      user.role

  };

}


// =====================================================
// UPDATE SESSION AFTER REFRESH
// =====================================================

function updateSessionRefresh(
  oldToken,
  newToken,
  newExpiry,
  lastActivity
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
      "Session not found"
    );

  }


  const headers =
    values[0];


  const tokenColumn =
    findHeaderColumn(
      headers,
      [
        "Session Token",
        "Token",
        "TokenHash"
      ]
    );

  const expiryColumn =
    findHeaderColumn(
      headers,
      [
        "Token Expiry",
        "ExpiresAt",
        "Expiry",
        "Expires"
      ]
    );

  const activityColumn =
    findHeaderColumn(
      headers,
      [
        "Last Activity",
        "LastActivity",
        "UpdatedAt"
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
    // Update token
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
      activityColumn !== -1
    ) {

      sheet
        .getRange(
          i + 1,
          activityColumn + 1
        )
        .setValue(
          lastActivity
        );

    }


    return true;

  }


  throw new Error(
    "Session not found"
  );

}


// =====================================================
// REFRESH SESSION FROM REQUEST
// =====================================================

function refreshSessionFromRequest(
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


  return refreshSession(
    token
  );

}


// =====================================================
// CHECK WHETHER SESSION NEEDS REFRESH
// =====================================================

function sessionNeedsRefresh(
  token
) {

  if (!token) {

    return false;

  }


  const session =
    getSessionByToken(token);

  if (!session) {

    return false;

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

    return false;

  }


  const remaining =
    expiresAt.getTime() -
    Date.now();


  return (
    remaining <=
    SESSION_REFRESH_CONFIG.ROTATE_THRESHOLD_MS
  );

}


// =====================================================
// GET SESSION EXPIRATION
// =====================================================

function getSessionExpiration(
  token
) {

  if (!token) {

    return null;

  }


  const session =
    getSessionByToken(token);

  if (!session) {

    return null;

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

    return null;

  }


  return {

    expiresAt:
      expiresAt.toISOString(),

    expiresIn:
      Math.max(
        0,
        expiresAt.getTime() -
        Date.now()
      ),

    expired:
      expiresAt.getTime() <=
      Date.now(),

    needsRefresh:
      sessionNeedsRefresh(token)

  };

}


// =====================================================
// MASK SESSION TOKEN
// =====================================================

function maskSessionToken(
  token
) {

  if (!token) {

    return "";

  }


  const value =
    String(token);


  if (
    value.length <= 8
  ) {

    return "********";

  }


  return (
    value.substring(0, 4) +
    "..." +
    value.substring(
      value.length - 4
    )
  );

}


// =====================================================
// VALIDATE REFRESH RESULT
// =====================================================

function validateRefreshResult(
  result
) {

  if (!result) {

    return false;

  }


  if (
    result.success !== true
  ) {

    return false;

  }


  if (!result.token) {

    return false;

  }


  if (!result.expiresAt) {

    return false;

  }


  const expiry =
    new Date(
      result.expiresAt
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
    Date.now()
  );

}


// =====================================================
// SESSION REFRESH RESPONSE
// =====================================================

function getSessionRefreshResponse(
  token
) {

  const result =
    refreshSession(
      token
    );


  return {

    success:
      validateRefreshResult(
        result
      ),

    token:
      result.token,

    expiresAt:
      result.expiresAt,

    expiresIn:
      result.expiresIn,

    rotated:
      result.rotated,

    userId:
      result.userId,

    role:
      result.role

  };

}