// =====================================================
// SESSIONSECURITY.GS
// Session Security & Hijacking Protection
// =====================================================


// =====================================================
// SECURITY CONFIGURATION
// =====================================================

const SESSION_SECURITY = {

  MAX_IP_CHANGES: 3,

  MAX_DEVICE_CHANGES: 2,

  LOCK_ON_HIJACK: true,

  REQUIRE_DEVICE: false,

  REQUIRE_IP: false

};


// =====================================================
// VALIDATE SESSION SECURITY
// =====================================================

function validateSessionSecurity(
  token,
  deviceId,
  ipAddress
) {

  if (!token) {

    return {
      valid: false,
      hijacked: false,
      reason: "TOKEN_REQUIRED"
    };

  }

  const session =
    getSessionByToken(token);

  if (!session) {

    return {
      valid: false,
      hijacked: false,
      reason: "SESSION_NOT_FOUND"
    };

  }

  if (
    session.status !== "Active"
  ) {

    return {
      valid: false,
      hijacked: false,
      reason: "SESSION_INACTIVE"
    };

  }

  const deviceCheck =
    validateSessionDevice(
      session,
      deviceId
    );

  const ipCheck =
    validateSessionIP(
      session,
      ipAddress
    );

  if (
    !deviceCheck.valid ||
    !ipCheck.valid
  ) {

    handleSuspiciousSession(
      session,
      deviceCheck,
      ipCheck
    );

    return {
      valid: false,
      hijacked: true,
      reason:
        "SESSION_SECURITY_MISMATCH",
      device: deviceCheck,
      ip: ipCheck
    };

  }

  return {
    valid: true,
    hijacked: false,
    session: session
  };

}


// =====================================================
// VALIDATE SESSION DEVICE
// =====================================================

function validateSessionDevice(
  session,
  deviceId
) {

  if (!session) {

    return {
      valid: false,
      reason: "SESSION_REQUIRED"
    };

  }

  if (!deviceId) {

    if (
      SESSION_SECURITY.REQUIRE_DEVICE
    ) {

      return {
        valid: false,
        reason: "DEVICE_ID_REQUIRED"
      };

    }

    return {
      valid: true,
      matched: false,
      reason: "DEVICE_NOT_PROVIDED"
    };

  }

  if (!session.deviceId) {

    return {
      valid: true,
      matched: false,
      reason: "NO_STORED_DEVICE"
    };

  }

  const matched =
    String(session.deviceId) ===
    String(deviceId);

  return {
    valid: matched,
    matched: matched,
    reason:
      matched
        ? "DEVICE_MATCH"
        : "DEVICE_MISMATCH"
  };

}


// =====================================================
// VALIDATE SESSION IP
// =====================================================

function validateSessionIP(
  session,
  ipAddress
) {

  if (!session) {

    return {
      valid: false,
      reason: "SESSION_REQUIRED"
    };

  }

  if (!ipAddress) {

    if (
      SESSION_SECURITY.REQUIRE_IP
    ) {

      return {
        valid: false,
        reason: "IP_ADDRESS_REQUIRED"
      };

    }

    return {
      valid: true,
      matched: false,
      reason: "IP_NOT_PROVIDED"
    };

  }

  if (!session.ipAddress) {

    return {
      valid: true,
      matched: false,
      reason: "NO_STORED_IP"
    };

  }

  const matched =
    String(session.ipAddress) ===
    String(ipAddress);

  return {
    valid: matched,
    matched: matched,
    reason:
      matched
        ? "IP_MATCH"
        : "IP_MISMATCH"
  };

}


// =====================================================
// CHECK DEVICE CHANGE
// =====================================================

function detectDeviceChange(
  session,
  deviceId
) {

  if (!session || !deviceId) {
    return false;
  }

  if (!session.deviceId) {
    return false;
  }

  return (
    String(session.deviceId) !==
    String(deviceId)
  );

}


// =====================================================
// CHECK IP CHANGE
// =====================================================

function detectIPChange(
  session,
  ipAddress
) {

  if (!session || !ipAddress) {
    return false;
  }

  if (!session.ipAddress) {
    return false;
  }

  return (
    String(session.ipAddress) !==
    String(ipAddress)
  );

}


// =====================================================
// HANDLE SUSPICIOUS SESSION
// =====================================================

function handleSuspiciousSession(
  session,
  deviceCheck,
  ipCheck
) {

  if (!session) {
    return;
  }

  const reasonParts = [];

  if (
    deviceCheck &&
    !deviceCheck.valid
  ) {

    reasonParts.push(
      "DEVICE_MISMATCH"
    );

  }

  if (
    ipCheck &&
    !ipCheck.valid
  ) {

    reasonParts.push(
      "IP_MISMATCH"
    );

  }

  const reason =
    reasonParts.length
      ? reasonParts.join(",")
      : "SECURITY_MISMATCH";

  if (
    SESSION_SECURITY.LOCK_ON_HIJACK
  ) {

    lockSession(
      session.id
    );

  }

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_SECURITY_ALERT",
      reason
    );

  }

}


// =====================================================
// DETECT SESSION HIJACKING
// =====================================================

function detectSessionHijacking(
  token,
  deviceId,
  ipAddress
) {

  const result =
    validateSessionSecurity(
      token,
      deviceId,
      ipAddress
    );

  return {
    hijacked:
      result.hijacked === true,

    valid:
      result.valid === true,

    reason:
      result.reason || null,

    session:
      result.session || null
  };

}


// =====================================================
// CHECK SESSION OWNERSHIP
// =====================================================

function sessionBelongsToUser(
  token,
  userId
) {

  if (!token || !userId) {
    return false;
  }

  const session =
    getSessionByToken(token);

  if (!session) {
    return false;
  }

  return (
    String(session.userId) ===
    String(userId)
  );

}


// =====================================================
// CHECK ADMIN SESSION
// =====================================================

function isAdminSession(
  token
) {

  const session =
    validateSession(token);

  if (!session) {
    return false;
  }

  return (
    String(session.role)
      .toLowerCase() === "admin"
  );

}


// =====================================================
// LOCK USER SESSIONS
// =====================================================

function lockUserSessions(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }

  const sessions =
    getUserSessions(userId);

  let locked = 0;

  sessions.forEach(
    function(session) {

      if (
        session.status === "Active"
      ) {

        lockSession(
          session.id
        );

        locked++;

      }

    }
  );

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "USER_SESSIONS_LOCKED",
      locked +
      " session(s) locked"
    );

  }

  return {
    success: true,
    lockedSessions: locked
  };

}


// =====================================================
// UNLOCK SESSION
// =====================================================

function unlockSession(
  sessionId
) {

  if (!sessionId) {

    throw new Error(
      "Session ID is required"
    );

  }

  const session =
    getSessionById(
      sessionId
    );

  if (!session) {

    throw new Error(
      "Session not found"
    );

  }

  if (
    session.status !== "Locked"
  ) {

    return {
      success: true,
      message:
        "Session is not locked"
    };

  }

  return activateSession(
    sessionId
  );

}


// =====================================================
// INVALIDATE SESSION
// =====================================================

function invalidateSession(
  token,
  reason
) {

  if (!token) {
    return false;
  }

  const session =
    getSessionByToken(token);

  if (!session) {
    return false;
  }

  expireSession(
    session.id
  );

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_INVALIDATED",
      reason ||
      "Session invalidated"
    );

  }

  return true;

}


// =====================================================
// INVALIDATE ALL USER SESSIONS
// =====================================================

function invalidateAllUserSessions(
  userId,
  reason
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }

  const sessions =
    getUserSessions(userId);

  let invalidated = 0;

  sessions.forEach(
    function(session) {

      if (
        session.status === "Active"
      ) {

        expireSession(
          session.id
        );

        invalidated++;

      }

    }
  );

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "ALL_SESSIONS_INVALIDATED",
      reason ||
      "All user sessions invalidated"
    );

  }

  return {
    success: true,
    invalidatedSessions:
      invalidated
  };

}


// =====================================================
// SECURITY STATUS
// =====================================================

function getSessionSecurityStatus(
  token,
  deviceId,
  ipAddress
) {

  const session =
    getSessionByToken(token);

  if (!session) {

    return {
      exists: false,
      valid: false
    };

  }

  const security =
    validateSessionSecurity(
      token,
      deviceId,
      ipAddress
    );

  return {
    exists: true,
    valid: security.valid,
    hijacked: security.hijacked,
    reason: security.reason,
    sessionId: session.id,
    userId: session.userId,
    status: session.status
  };

}