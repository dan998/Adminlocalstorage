// =====================================================
// SESSION DEVICE
// SessionDevice.gs
// Registration System API
// =====================================================


// =====================================================
// DEVICE CONFIGURATION
// =====================================================

const SESSION_DEVICE_CONFIG = {

  MAX_DEVICES_PER_USER: 5,

  DEVICE_ID_LENGTH: 32,

  ALLOW_UNKNOWN_DEVICE: true,

  UPDATE_LAST_SEEN: true

};


// =====================================================
// GENERATE DEVICE ID
// =====================================================

function generateDeviceId() {

  const raw =
    [
      Utilities.getUuid(),
      Utilities.getUuid(),
      new Date().getTime(),
      Math.random()
    ].join("|");


  const digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      raw
    );


  return digest
    .map(function(byte) {

      const value =
        byte < 0
          ? byte + 256
          : byte;

      return (
        "0" +
        value.toString(16)
      ).slice(-2);

    })
    .join("")
    .substring(
      0,
      SESSION_DEVICE_CONFIG.DEVICE_ID_LENGTH
    );

}


// =====================================================
// NORMALIZE DEVICE ID
// =====================================================

function normalizeDeviceId(
  deviceId
) {

  if (!deviceId) {

    return "";

  }


  return String(
    deviceId
  )
    .trim()
    .substring(
      0,
      128
    );

}


// =====================================================
// GET DEVICE ID FROM REQUEST
// =====================================================

function getDeviceIdFromRequest(
  request
) {

  request =
    request || {};


  return normalizeDeviceId(
    request.deviceId ||
    request.deviceID ||
    request.device_id ||
    request.device
  );

}


// =====================================================
// REGISTER DEVICE
// =====================================================

function registerSessionDevice(
  userId,
  deviceId,
  deviceInfo
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  deviceInfo =
    deviceInfo || {};


  deviceId =
    normalizeDeviceId(
      deviceId
    );


  // ---------------------------------------------------
  // GENERATE DEVICE ID IF MISSING
  // ---------------------------------------------------

  if (!deviceId) {

    deviceId =
      generateDeviceId();

  }


  // ---------------------------------------------------
  // CHECK EXISTING DEVICE
  // ---------------------------------------------------

  const existing =
    getSessionDevice(
      userId,
      deviceId
    );


  const now =
    new Date();


  if (existing) {

    updateSessionDevice(
      userId,
      deviceId,
      {

        lastSeen:
          now,

        name:
          deviceInfo.name ||
          existing.name,

        platform:
          deviceInfo.platform ||
          existing.platform,

        browser:
          deviceInfo.browser ||
          existing.browser,

        ipAddress:
          deviceInfo.ipAddress ||
          existing.ipAddress,

        userAgent:
          deviceInfo.userAgent ||
          existing.userAgent

      }
    );


    return {

      success: true,

      created: false,

      deviceId:
        deviceId

    };

  }


  // ---------------------------------------------------
  // CHECK DEVICE LIMIT
  // ---------------------------------------------------

  const devices =
    getUserDevices(
      userId
    );


  if (
    devices.length >=
    SESSION_DEVICE_CONFIG.MAX_DEVICES_PER_USER
  ) {

    throw new Error(
      "Maximum number of devices reached"
    );

  }


  // ---------------------------------------------------
  // CREATE DEVICE RECORD
  // ---------------------------------------------------

  const device =
    {

      deviceId:
        deviceId,

      userId:
        userId,

      name:
        deviceInfo.name ||
        "Unknown Device",

      platform:
        deviceInfo.platform ||
        "Unknown",

      browser:
        deviceInfo.browser ||
        "Unknown",

      ipAddress:
        deviceInfo.ipAddress ||
        "",

      userAgent:
        deviceInfo.userAgent ||
        "",

      firstSeen:
        now,

      lastSeen:
        now,

      status:
        "Active"

    };


  saveSessionDevice(
    device
  );


  // ---------------------------------------------------
  // SECURITY LOG
  // ---------------------------------------------------

  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "DEVICE_REGISTERED",
      {

        deviceId:
          maskDeviceId(
            deviceId
          ),

        platform:
          device.platform,

        browser:
          device.browser

      }
    );

  }


  return {

    success: true,

    created: true,

    deviceId:
      deviceId,

    device:
      device

  };

}


// =====================================================
// SAVE DEVICE
// =====================================================

function saveSessionDevice(
  device
) {

  const props =
    PropertiesService
      .getScriptProperties();


  const key =
    getDevicePropertyKey(
      device.userId,
      device.deviceId
    );


  props.setProperty(
    key,
    JSON.stringify(
      device
    )
  );


  return true;

}


// =====================================================
// GET DEVICE
// =====================================================

function getSessionDevice(
  userId,
  deviceId
) {

  if (!userId || !deviceId) {

    return null;

  }


  const props =
    PropertiesService
      .getScriptProperties();


  const key =
    getDevicePropertyKey(
      userId,
      deviceId
    );


  const value =
    props.getProperty(
      key
    );


  if (!value) {

    return null;

  }


  try {

    return JSON.parse(
      value
    );

  } catch (error) {

    return null;

  }

}


// =====================================================
// GET USER DEVICES
// =====================================================

function getUserDevices(
  userId
) {

  if (!userId) {

    return [];

  }


  const props =
    PropertiesService
      .getScriptProperties();


  const all =
    props.getProperties();


  const prefix =
    getDeviceUserPrefix(
      userId
    );


  const devices =
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

        const device =
          JSON.parse(
            all[key]
          );


        if (
          device &&
          device.userId ===
          userId
        ) {

          devices.push(
            device
          );

        }

      } catch (error) {

        // Ignore malformed records.

      }

    }
  );


  devices.sort(
    function(a, b) {

      return (
        new Date(
          b.lastSeen || 0
        ).getTime() -
        new Date(
          a.lastSeen || 0
        ).getTime()
      );

    }
  );


  return devices;

}


// =====================================================
// UPDATE DEVICE
// =====================================================

function updateSessionDevice(
  userId,
  deviceId,
  updates
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    throw new Error(
      "Device not found"
    );

  }


  updates =
    updates || {};


  Object.keys(
    updates
  ).forEach(
    function(key) {

      if (
        updates[key] !==
        undefined
      ) {

        device[key] =
          updates[key];

      }

    }
  );


  device.lastSeen =
    updates.lastSeen ||
    new Date();


  saveSessionDevice(
    device
  );


  return device;

}


// =====================================================
// UPDATE DEVICE LAST SEEN
// =====================================================

function updateDeviceLastSeen(
  userId,
  deviceId
) {

  if (!userId || !deviceId) {

    return false;

  }


  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    return false;

  }


  device.lastSeen =
    new Date();


  saveSessionDevice(
    device
  );


  return true;

}


// =====================================================
// CHECK DEVICE
// =====================================================

function validateSessionDevice(
  userId,
  deviceId
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    return {

      valid: false,

      registered: false,

      reason:
        "Device not registered"

    };

  }


  if (
    String(
      device.status
    ).toLowerCase() !==
    "active"
  ) {

    return {

      valid: false,

      registered: true,

      reason:
        "Device is inactive"

    };

  }


  return {

    valid: true,

    registered: true,

    device:
      device

  };

}


// =====================================================
// REGISTER OR VALIDATE DEVICE
// =====================================================

function registerOrValidateDevice(
  userId,
  deviceId,
  deviceInfo
) {

  deviceId =
    normalizeDeviceId(
      deviceId
    );


  if (!deviceId) {

    if (
      !SESSION_DEVICE_CONFIG.ALLOW_UNKNOWN_DEVICE
    ) {

      throw new Error(
        "Device ID is required"
      );

    }


    deviceId =
      generateDeviceId();

  }


  const existing =
    getSessionDevice(
      userId,
      deviceId
    );


  if (existing) {

    updateDeviceLastSeen(
      userId,
      deviceId
    );


    return {

      success: true,

      registered: true,

      created: false,

      deviceId:
        deviceId

    };

  }


  return registerSessionDevice(
    userId,
    deviceId,
    deviceInfo
  );

}


// =====================================================
// REVOKE DEVICE
// =====================================================

function revokeSessionDevice(
  userId,
  deviceId
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    throw new Error(
      "Device not found"
    );

  }


  device.status =
    "Revoked";

  device.revokedAt =
    new Date();


  saveSessionDevice(
    device
  );


  // ---------------------------------------------------
  // REVOKE DEVICE SESSIONS
  // ---------------------------------------------------

  revokeDeviceSessions(
    userId,
    deviceId
  );


  if (
    typeof logSecurityEvent ===
    "function"
  ) {

    logSecurityEvent(
      userId,
      "DEVICE_REVOKED",
      {

        deviceId:
          maskDeviceId(
            deviceId
          )

      }
    );

  }


  return {

    success: true,

    userId:
      userId,

    deviceId:
      deviceId

  };

}


// =====================================================
// REVOKE DEVICE SESSIONS
// =====================================================

function revokeDeviceSessions(
  userId,
  deviceId
) {

  if (
    typeof getUserSessions !==
    "function"
  ) {

    return 0;

  }


  const sessions =
    getUserSessions(
      userId
    );


  if (!sessions) {

    return 0;

  }


  let revoked =
    0;


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


      if (
        token &&
        typeof invalidateSession ===
        "function"
      ) {

        try {

          invalidateSession(
            token
          );

          revoked++;

        } catch (error) {

          // Continue with remaining sessions.

        }

      }

    }
  );


  return revoked;

}


// =====================================================
// GET DEVICE FROM SESSION
// =====================================================

function getSessionDeviceInfo(
  token
) {

  if (!token) {

    return null;

  }


  if (
    typeof getSessionByToken !==
    "function"
  ) {

    return null;

  }


  const session =
    getSessionByToken(
      token
    );


  if (!session) {

    return null;

  }


  const deviceId =
    session.deviceId ||
    session.deviceID;


  if (!deviceId) {

    return null;

  }


  return getSessionDevice(
    session.userId,
    deviceId
  );

}


// =====================================================
// CHECK WHETHER DEVICE IS TRUSTED
// =====================================================

function isTrustedSessionDevice(
  userId,
  deviceId
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    return false;

  }


  return (
    String(
      device.status
    ).toLowerCase() ===
    "active"
  );

}


// =====================================================
// TRUST DEVICE
// =====================================================

function trustSessionDevice(
  userId,
  deviceId
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    throw new Error(
      "Device not found"
    );

  }


  device.status =
    "Active";

  device.trusted =
    true;

  device.trustedAt =
    new Date();

  device.lastSeen =
    new Date();


  saveSessionDevice(
    device
  );


  return {

    success: true,

    deviceId:
      deviceId,

    trusted: true

  };

}


// =====================================================
// UNTRUST DEVICE
// =====================================================

function untrustSessionDevice(
  userId,
  deviceId
) {

  const device =
    getSessionDevice(
      userId,
      deviceId
    );


  if (!device) {

    throw new Error(
      "Device not found"
    );

  }


  device.trusted =
    false;

  device.untrustedAt =
    new Date();


  saveSessionDevice(
    device
  );


  return {

    success: true,

    deviceId:
      deviceId,

    trusted: false

  };

}


// =====================================================
// DELETE DEVICE
// =====================================================

function deleteSessionDevice(
  userId,
  deviceId
) {

  const props =
    PropertiesService
      .getScriptProperties();


  const key =
    getDevicePropertyKey(
      userId,
      deviceId
    );


  props.deleteProperty(
    key
  );


  return true;

}


// =====================================================
// DELETE ALL USER DEVICES
// =====================================================

function deleteAllSessionDevices(
  userId
) {

  const devices =
    getUserDevices(
      userId
    );


  devices.forEach(
    function(device) {

      deleteSessionDevice(
        userId,
        device.deviceId
      );

    }
  );


  return devices.length;

}


// =====================================================
// DEVICE PROPERTY KEY
// =====================================================

function getDevicePropertyKey(
  userId,
  deviceId
) {

  return (
    "SESSION_DEVICE_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_" +
    encodeURIComponent(
      String(deviceId)
    )
  );

}


// =====================================================
// DEVICE USER PREFIX
// =====================================================

function getDeviceUserPrefix(
  userId
) {

  return (
    "SESSION_DEVICE_" +
    encodeURIComponent(
      String(userId)
    ) +
    "_"
  );

}


// =====================================================
// MASK DEVICE ID
// =====================================================

function maskDeviceId(
  deviceId
) {

  if (!deviceId) {

    return "";

  }


  const value =
    String(
      deviceId
    );


  if (
    value.length <= 8
  ) {

    return "********";

  }


  return (
    value.substring(
      0,
      4
    ) +
    "..." +
    value.substring(
      value.length - 4
    )
  );

}


// =====================================================
// GET DEVICE SUMMARY
// =====================================================

function getSessionDeviceSummary(
  userId
) {

  const devices =
    getUserDevices(
      userId
    );


  return devices.map(
    function(device) {

      return {

        deviceId:
          device.deviceId,

        name:
          device.name,

        platform:
          device.platform,

        browser:
          device.browser,

        status:
          device.status,

        trusted:
          device.trusted === true,

        firstSeen:
          device.firstSeen,

        lastSeen:
          device.lastSeen,

        ipAddress:
          device.ipAddress

      };

    }
  );

}


// =====================================================
// DEVICE LIMIT STATUS
// =====================================================

function getDeviceLimitStatus(
  userId
) {

  const devices =
    getUserDevices(
      userId
    );


  return {

    current:
      devices.length,

    maximum:
      SESSION_DEVICE_CONFIG.MAX_DEVICES_PER_USER,

    available:
      Math.max(
        0,
        SESSION_DEVICE_CONFIG.MAX_DEVICES_PER_USER -
        devices.length
      ),

    limitReached:
      devices.length >=
      SESSION_DEVICE_CONFIG.MAX_DEVICES_PER_USER

  };

}