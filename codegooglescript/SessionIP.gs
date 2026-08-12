// =====================================================
// SESSION IP
// SessionIP.gs
// Registration System API
// =====================================================


// =====================================================
// SESSION IP CONFIGURATION
// =====================================================

const SESSION_IP_CONFIG = {

  // Whether to bind a session to its original IP
  BIND_SESSION_IP: false,

  // Whether an IP change should be logged
  LOG_IP_CHANGES: true,

  // Maximum IP history entries per user
  MAX_IP_HISTORY: 50,

  // Whether private/local IPs are accepted
  ALLOW_PRIVATE_IPS: true

};


// =====================================================
// GET REQUEST IP
// =====================================================

function getRequestIP(
  request
) {

  request =
    request || {};


  return normalizeIP(
    request.ipAddress ||
    request.ip ||
    request.clientIP ||
    request.clientIp ||
    ""
  );

}


// =====================================================
// NORMALIZE IP
// =====================================================

function normalizeIP(
  ip
) {

  if (!ip) {

    return "";

  }


  ip =
    String(ip)
      .trim();


  // ---------------------------------------------------
  // Remove port from IPv4
  // ---------------------------------------------------

  if (
    /^\d{1,3}(\.\d{1,3}){3}:\d+$/
      .test(ip)
  ) {

    ip =
      ip.substring(
        0,
        ip.lastIndexOf(":")
      );

  }


  // ---------------------------------------------------
  // Remove IPv6 brackets
  // ---------------------------------------------------

  if (
    ip.charAt(0) === "[" &&
    ip.charAt(
      ip.length - 1
    ) === "]"
  ) {

    ip =
      ip.substring(
        1,
        ip.length - 1
      );

  }


  return ip.substring(
    0,
    128
  );

}


// =====================================================
// VALIDATE IP FORMAT
// =====================================================

function isValidIP(
  ip
) {

  ip =
    normalizeIP(
      ip
    );


  if (!ip) {

    return false;

  }


  // ---------------------------------------------------
  // IPv4
  // ---------------------------------------------------

  const ipv4 =
    ip.match(
      /^(\d{1,3}\.){3}\d{1,3}$/
    );


  if (ipv4) {

    const parts =
      ip.split(".");


    return parts.every(
      function(part) {

        const value =
          Number(part);

        return (
          value >= 0 &&
          value <= 255
        );

      }
    );

  }


  // ---------------------------------------------------
  // Basic IPv6 validation
  // ---------------------------------------------------

  const ipv6 =
    /^[0-9a-fA-F:]+$/
      .test(ip);


  return ipv6;

}


// =====================================================
// GET SESSION IP
// =====================================================

function getSessionIP(
  token
) {

  if (!token) {

    return null;

  }


  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return null;

  }


  return normalizeIP(
    session.ipAddress ||
    session.ip ||
    session.clientIP ||
    ""
  );

}


// =====================================================
// SET SESSION IP
// =====================================================

function setSessionIP(
  token,
  ip
) {

  if (!token) {

    throw new Error(
      "Session token is required"
    );

  }


  ip =
    normalizeIP(
      ip
    );


  if (
    ip &&
    !isValidIP(ip)
  ) {

    throw new Error(
      "Invalid IP address"
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


  const ipColumn =
    findHeaderColumn(
      headers,
      [
        "IP Address",
        "IP",
        "Client IP"
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
    ipColumn === -1
  ) {

    throw new Error(
      "IP Address column not found"
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


    sheet
      .getRange(
        i + 1,
        ipColumn + 1
      )
      .setValue(
        ip
      );


    return true;

  }


  throw new Error(
    "Session not found"
  );

}


// =====================================================
// CHECK SESSION IP
// =====================================================

function checkSessionIP(
  token,
  currentIP
) {

  if (!token) {

    return {

      valid: false,

      reason:
        "Missing session token"

    };

  }


  currentIP =
    normalizeIP(
      currentIP
    );


  if (
    currentIP &&
    !isValidIP(currentIP)
  ) {

    return {

      valid: false,

      reason:
        "Invalid current IP"

    };

  }


  const sessionIP =
    getSessionIP(
      token
    );


  // ---------------------------------------------------
  // No stored IP
  // ---------------------------------------------------

  if (!sessionIP) {

    return {

      valid: true,

      changed: false,

      storedIP:
        null,

      currentIP:
        currentIP

    };

  }


  const changed =
    String(
      sessionIP
    ) !==
    String(
      currentIP
    );


  // ---------------------------------------------------
  // IP binding disabled
  // ---------------------------------------------------

  if (
    !SESSION_IP_CONFIG.BIND_SESSION_IP
  ) {

    return {

      valid: true,

      changed: changed,

      bound: false,

      storedIP:
        sessionIP,

      currentIP:
        currentIP

    };

  }


  return {

    valid:
      !changed,

    changed:
      changed,

    bound: true,

    storedIP:
      sessionIP,

    currentIP:
      currentIP,

    reason:
      changed
        ? "Session IP changed"
        : null

  };

}


// =====================================================
// REQUIRE MATCHING SESSION IP
// =====================================================

function requireMatchingSessionIP(
  token,
  currentIP
) {

  const result =
    checkSessionIP(
      token,
      currentIP
    );


  if (
    !result.valid
  ) {

    throw new Error(
      result.reason ||
      "Session IP validation failed"
    );

  }


  return result;

}


// =====================================================
// UPDATE SESSION IP ACTIVITY
// =====================================================

function updateSessionIP(
  token,
  currentIP
) {

  currentIP =
    normalizeIP(
      currentIP
    );


  if (
    currentIP &&
    !isValidIP(currentIP)
  ) {

    throw new Error(
      "Invalid IP address"
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


  const previousIP =
    normalizeIP(
      session.ipAddress ||
      session.ip ||
      ""
    );


  const changed =
    previousIP &&
    currentIP &&
    previousIP !== currentIP;


  // ---------------------------------------------------
  // Update current IP
  // ---------------------------------------------------

  setSessionIP(
    token,
    currentIP
  );


  // ---------------------------------------------------
  // Record IP history
  // ---------------------------------------------------

  if (
    currentIP
  ) {

    saveSessionIPHistory(
      session.userId,
      currentIP,
      token
    );

  }


  // ---------------------------------------------------
  // Log IP change
  // ---------------------------------------------------

  if (
    changed &&
    SESSION_IP_CONFIG.LOG_IP_CHANGES &&
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      session.userId,
      "SESSION_IP_CHANGED",
      {

        previousIP:
          maskIP(
            previousIP
          ),

        currentIP:
          maskIP(
            currentIP
          ),

        token:
          typeof maskSessionToken ===
          "function"
            ? maskSessionToken(token)
            : "********"

      }
    );

  }


  return {

    success: true,

    changed:
      !!changed,

    previousIP:
      previousIP,

    currentIP:
      currentIP

  };

}


// =====================================================
// SAVE IP HISTORY
// =====================================================

function saveSessionIPHistory(
  userId,
  ip,
  token
) {

  if (!userId || !ip) {

    return null;

  }


  const props =
    PropertiesService
      .getScriptProperties();


  const id =
    typeof generateId ===
    "function"
      ? generateId("IP")
      : Utilities.getUuid();


  const record = {

    id:
      id,

    userId:
      userId,

    ip:
      ip,

    token:
      typeof maskSessionToken ===
      "function"
        ? maskSessionToken(token)
        : "",

    timestamp:
      new Date().toISOString()

  };


  const key =
    getIPHistoryKey(
      userId,
      id
    );


  props.setProperty(
    key,
    JSON.stringify(
      record
    )
  );


  trimIPHistory(
    userId
  );


  return record;

}


// =====================================================
// GET USER IP HISTORY
// =====================================================

function getUserIPHistory(
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
      SESSION_IP_CONFIG.MAX_IP_HISTORY;

  }


  limit =
    Math.min(
      limit,
      SESSION_IP_CONFIG.MAX_IP_HISTORY
    );


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getIPHistoryPrefix(
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

        const record =
          JSON.parse(
            all[key]
          );


        if (
          record &&
          String(
            record.userId
          ) ===
          String(userId)
        ) {

          records.push(
            record
          );

        }

      } catch (error) {

        // Ignore malformed records.

      }

    }
  );


  records.sort(
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


  return records.slice(
    0,
    limit
  );

}


// =====================================================
// CHECK TRUSTED IP
// =====================================================

function isTrustedSessionIP(
  userId,
  ip
) {

  ip =
    normalizeIP(
      ip
    );


  if (
    !userId ||
    !ip
  ) {

    return false;

  }


  const history =
    getUserIPHistory(
      userId,
      SESSION_IP_CONFIG.MAX_IP_HISTORY
    );


  return history.some(
    function(record) {

      return (
        String(
          record.ip
        ) ===
        String(ip)
      );

    }
  );

}


// =====================================================
// TRUST IP
// =====================================================

function trustSessionIP(
  userId,
  ip
) {

  ip =
    normalizeIP(
      ip
    );


  if (
    !userId
  ) {

    throw new Error(
      "User ID is required"
    );

  }


  if (
    !isValidIP(ip)
  ) {

    throw new Error(
      "Invalid IP address"
    );

  }


  saveSessionIPHistory(
    userId,
    ip,
    ""
  );


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "IP_TRUSTED",
      {

        ip:
          maskIP(ip)

      }
    );

  }


  return {

    success: true,

    userId:
      userId,

    ip:
      ip

  };

}


// =====================================================
// REMOVE IP FROM TRUSTED HISTORY
// =====================================================

function removeTrustedSessionIP(
  userId,
  ip
) {

  ip =
    normalizeIP(
      ip
    );


  if (
    !userId ||
    !ip
  ) {

    throw new Error(
      "User ID and IP are required"
    );

  }


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getIPHistoryPrefix(
      userId
    );


  let removed =
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


      try {

        const record =
          JSON.parse(
            all[key]
          );


        if (
          String(
            record.ip
          ) ===
          String(ip)
        ) {

          props.deleteProperty(
            key
          );

          removed++;

        }

      } catch (error) {

        // Ignore malformed records.

      }

    }
  );


  return {

    success: true,

    removed:
      removed

  };

}


// =====================================================
// MASK IP
// =====================================================

function maskIP(
  ip
) {

  ip =
    normalizeIP(
      ip
    );


  if (!ip) {

    return "";

  }


  // ---------------------------------------------------
  // IPv4
  // ---------------------------------------------------

  if (
    /^\d{1,3}(\.\d{1,3}){3}$/
      .test(ip)
  ) {

    const parts =
      ip.split(".");


    return (
      parts[0] +
      "." +
      parts[1] +
      ".***.***"
    );

  }


  // ---------------------------------------------------
  // IPv6
  // ---------------------------------------------------

  if (
    ip.indexOf(":") !== -1
  ) {

    const parts =
      ip.split(":");


    return (
      parts.slice(
        0,
        2
      ).join(":") +
      ":****"
    );

  }


  return "***";

}


// =====================================================
// IP HISTORY KEY
// =====================================================

function getIPHistoryKey(
  userId,
  recordId
) {

  return (
    "SESSION_IP_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_" +
    encodeURIComponent(
      String(recordId)
    )
  );

}


// =====================================================
// IP HISTORY PREFIX
// =====================================================

function getIPHistoryPrefix(
  userId
) {

  return (
    "SESSION_IP_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_"
  );

}


// =====================================================
// TRIM IP HISTORY
// =====================================================

function trimIPHistory(
  userId
) {

  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getIPHistoryPrefix(
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

        const record =
          JSON.parse(
            all[key]
          );


        records.push({

          key:
            key,

          timestamp:
            new Date(
              record.timestamp ||
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
    SESSION_IP_CONFIG.MAX_IP_HISTORY
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
      SESSION_IP_CONFIG.MAX_IP_HISTORY
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
// GET CURRENT USER SESSION IPS
// =====================================================

function getUserSessionIPs(
  userId
) {

  const history =
    getUserIPHistory(
      userId,
      SESSION_IP_CONFIG.MAX_IP_HISTORY
    );


  const unique =
    {};


  history.forEach(
    function(record) {

      if (
        record.ip
      ) {

        unique[
          record.ip
        ] = true;

      }

    }
  );


  return Object.keys(
    unique
  );

}


// =====================================================
// CHECK IP CHANGE
// =====================================================

function detectSessionIPChange(
  token,
  currentIP
) {

  const previousIP =
    getSessionIP(
      token
    );


  currentIP =
    normalizeIP(
      currentIP
    );


  return {

    changed:
      !!(
        previousIP &&
        currentIP &&
        previousIP !== currentIP
      ),

    previousIP:
      previousIP,

    currentIP:
      currentIP

  };

}


// =====================================================
// PROCESS REQUEST IP
// =====================================================

function processSessionIP(
  token,
  currentIP
) {

  currentIP =
    normalizeIP(
      currentIP
    );


  if (
    currentIP &&
    !isValidIP(currentIP)
  ) {

    throw new Error(
      "Invalid IP address"
    );

  }


  const result =
    checkSessionIP(
      token,
      currentIP
    );


  if (
    !result.valid
  ) {

    throw new Error(
      result.reason ||
      "Session IP mismatch"
    );

  }


  if (
    result.changed
  ) {

    updateSessionIP(
      token,
      currentIP
    );

  }


  return {

    success: true,

    valid: true,

    changed:
      result.changed,

    ip:
      currentIP

  };

}


// =====================================================
// CLEAR USER IP HISTORY
// =====================================================

function clearUserIPHistory(
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
    getIPHistoryPrefix(
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