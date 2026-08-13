// =====================================================
// STORAGESECURITY.GS
// Storage Security & Protection
// Cloud Project Platform
// =====================================================


// =====================================================
// SECURITY ACTIONS
// =====================================================

const STORAGE_SECURITY_ACTIONS = {

  UPLOAD:
    "upload",

  DOWNLOAD:
    "download",

  READ:
    "read",

  UPDATE:
    "update",

  DELETE:
    "delete",

  SHARE:
    "share",

  CREATE:
    "create",

  MANAGE:
    "manage"

};


// =====================================================
// SECURITY STATUS
// =====================================================

const STORAGE_SECURITY_STATUS = {

  ALLOWED:
    "Allowed",

  DENIED:
    "Denied",

  BLOCKED:
    "Blocked",

  SUSPICIOUS:
    "Suspicious",

  EXPIRED:
    "Expired",

  INVALID:
    "Invalid",

  ERROR:
    "Error"

};


// =====================================================
// SECURITY SETTINGS
// =====================================================

const STORAGE_SECURITY_SETTINGS = {

  ENABLED:
    true,

  REQUIRE_AUTHENTICATION:
    true,

  REQUIRE_PERMISSION:
    true,

  CHECK_QUOTA:
    true,

  CHECK_FILE_SIZE:
    true,

  CHECK_STORAGE_STATUS:
    true,

  CHECK_NODE_STATUS:
    true,

  LOG_SECURITY_EVENTS:
    true,

  BLOCK_INVALID_FILE_NAMES:
    true,

  BLOCK_PATH_TRAVERSAL:
    true,

  MAX_FILE_NAME_LENGTH:
    255,

  MAX_PATH_LENGTH:
    1000,

  MAX_SECURITY_FAILURES:
    5

};


// =====================================================
// BLOCKED FILE NAME PATTERNS
// =====================================================

const STORAGE_BLOCKED_FILE_PATTERNS = [

  "..",

  "<",

  ">",

  "|",

  "\0",

  "\r",

  "\n"

];


// =====================================================
// SECURITY EVENT TYPES
// =====================================================

const STORAGE_SECURITY_EVENTS = {

  ACCESS_GRANTED:
    "Storage access granted",

  ACCESS_DENIED:
    "Storage access denied",

  INVALID_FILE:
    "Invalid file",

  INVALID_PATH:
    "Invalid path",

  QUOTA_EXCEEDED:
    "Storage quota exceeded",

  FILE_TOO_LARGE:
    "File too large",

  STORAGE_FULL:
    "Storage full",

  STORAGE_DISABLED:
    "Storage disabled",

  NODE_UNAVAILABLE:
    "Storage node unavailable",

  SUSPICIOUS_REQUEST:
    "Suspicious storage request",

  SECURITY_ERROR:
    "Storage security error"

};


// =====================================================
// SECURITY ID
// =====================================================

function generateStorageSecurityId() {

  return (
    "SSEC-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// SECURITY ENABLED
// =====================================================

function isStorageSecurityEnabled() {

  return (
    STORAGE_SECURITY_SETTINGS
      .ENABLED === true
  );

}


// =====================================================
// NORMALIZE FILE NAME
// =====================================================

function normalizeStorageFileName(
  fileName
) {

  if (
    fileName === null ||
    fileName === undefined
  ) {

    return "";

  }


  return String(
    fileName
  )
    .trim();

}


// =====================================================
// VALIDATE FILE NAME
// =====================================================

function validateStorageFileName(
  fileName
) {

  fileName =
    normalizeStorageFileName(
      fileName
    );


  if (!fileName) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "File name is required"

    };

  }


  if (
    fileName.length >
    STORAGE_SECURITY_SETTINGS
      .MAX_FILE_NAME_LENGTH
  ) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "File name is too long"

    };

  }


  if (
    STORAGE_SECURITY_SETTINGS
      .BLOCK_INVALID_FILE_NAMES
  ) {

    for (
      let i = 0;
      i <
      STORAGE_BLOCKED_FILE_PATTERNS.length;
      i++
    ) {

      if (
        fileName.indexOf(
          STORAGE_BLOCKED_FILE_PATTERNS[i]
        ) !== -1
      ) {

        return {

          valid:
            false,

          status:
            STORAGE_SECURITY_STATUS.BLOCKED,

          error:
            "File name contains a blocked pattern"

        };

      }

    }

  }


  return {

    valid:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null,

    fileName:
      fileName

  };

}


// =====================================================
// VALIDATE STORAGE PATH
// =====================================================

function validateStoragePath(
  path
) {

  path =
    String(
      path || ""
    ).trim();


  if (
    path.length >
    STORAGE_SECURITY_SETTINGS
      .MAX_PATH_LENGTH
  ) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Storage path is too long"

    };

  }


  if (
    STORAGE_SECURITY_SETTINGS
      .BLOCK_PATH_TRAVERSAL
  ) {

    if (
      path.indexOf(
        ".."
      ) !== -1
    ) {

      return {

        valid:
          false,

        status:
          STORAGE_SECURITY_STATUS.BLOCKED,

        error:
          "Path traversal detected"

      };

    }

  }


  return {

    valid:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null,

    path:
      path

  };

}


// =====================================================
// VALIDATE FILE SIZE
// =====================================================

function validateStorageFileSize(
  fileSize
) {

  fileSize =
    Number(
      fileSize
    );


  if (
    !isFinite(fileSize) ||
    fileSize < 0
  ) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Invalid file size"

    };

  }


  return {

    valid:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null,

    fileSize:
      fileSize

  };

}


// =====================================================
// VALIDATE STORAGE EXISTS
// =====================================================

function validateStorageAccessTarget(
  storageId
) {

  if (!storageId) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Storage ID is required"

    };

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    return {

      valid:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Storage not found"

    };

  }


  return {

    valid:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    storage:
      storage

  };

}


// =====================================================
// CHECK STORAGE STATUS
// =====================================================

function checkStorageSecurityStatus(
  storage
) {

  if (!storage) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Storage not found"

    };

  }


  const status =
    String(
      storage.status ||
      ""
    ).toLowerCase();


  if (
    status ===
    "disabled"
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.BLOCKED,

      error:
        STORAGE_SECURITY_EVENTS
          .STORAGE_DISABLED

    };

  }


  if (
    status ===
    "full"
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        STORAGE_SECURITY_EVENTS
          .STORAGE_FULL

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null

  };

}


// =====================================================
// CHECK NODE SECURITY STATUS
// =====================================================

function checkStorageNodeSecurity(
  node
) {

  if (!node) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "Storage node not found"

    };

  }


  const status =
    String(
      node.status ||
      ""
    ).toLowerCase();


  if (
    status !==
    "active"
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        STORAGE_SECURITY_EVENTS
          .NODE_UNAVAILABLE

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null

  };

}


// =====================================================
// AUTHENTICATION CHECK
// =====================================================

function checkStorageAuthentication(
  userId
) {

  if (
    !STORAGE_SECURITY_SETTINGS
      .REQUIRE_AUTHENTICATION
  ) {

    return {

      authenticated:
        true

    };

  }


  if (!userId) {

    return {

      authenticated:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        "Authentication required"

    };

  }


  /*
   * Session validation is intentionally delegated
   * to SessionValidate.gs.
   */

  return {

    authenticated:
      true,

    userId:
      userId

  };

}


// =====================================================
// PERMISSION CHECK
// =====================================================

function checkStorageSecurityPermission(
  userId,
  storageId,
  action
) {

  if (
    !STORAGE_SECURITY_SETTINGS
      .REQUIRE_PERMISSION
  ) {

    return {

      allowed:
        true

    };

  }


  if (
    typeof hasStoragePermission !==
    "function"
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.ERROR,

      error:
        "Storage permission system unavailable"

    };

  }


  const allowed =
    hasStoragePermission(
      userId,
      storageId,
      action
    );


  if (!allowed) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        "Storage permission denied"

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    error:
      null

  };

}


// =====================================================
// QUOTA SECURITY CHECK
// =====================================================

function checkStorageSecurityQuota(
  storageId,
  fileSize
) {

  if (
    !STORAGE_SECURITY_SETTINGS
      .CHECK_QUOTA
  ) {

    return {

      allowed:
        true

    };

  }


  if (
    typeof checkStorageUploadQuota !==
    "function"
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.ERROR,

      error:
        "Storage quota system unavailable"

    };

  }


  const result =
    checkStorageUploadQuota(
      storageId,
      fileSize
    );


  if (
    !result.allowed
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        result.reason ||
        STORAGE_SECURITY_EVENTS
          .QUOTA_EXCEEDED,

      quota:
        result

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    quota:
      result

  };

}


// =====================================================
// COMPLETE UPLOAD SECURITY CHECK
// =====================================================

function validateStorageUploadSecurity(
  data
) {

  data =
    data || {};


  const userId =
    data.userId || "";


  const storageId =
    data.storageId || "";


  const fileName =
    data.fileName || "";


  const fileSize =
    data.fileSize;


  // ---------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------

  const authentication =
    checkStorageAuthentication(
      userId
    );


  if (
    !authentication.authenticated
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        authentication.error

    };

  }


  // ---------------------------------------------------
  // STORAGE
  // ---------------------------------------------------

  const target =
    validateStorageAccessTarget(
      storageId
    );


  if (
    !target.valid
  ) {

    return {

      allowed:
        false,

      status:
        target.status,

      error:
        target.error

    };

  }


  // ---------------------------------------------------
  // STORAGE STATUS
  // ---------------------------------------------------

  const storageStatus =
    checkStorageSecurityStatus(
      target.storage
    );


  if (
    !storageStatus.allowed
  ) {

    return storageStatus;

  }


  // ---------------------------------------------------
  // PERMISSION
  // ---------------------------------------------------

  const permission =
    checkStorageSecurityPermission(
      userId,
      storageId,
      STORAGE_SECURITY_ACTIONS.UPLOAD
    );


  if (
    !permission.allowed
  ) {

    return permission;

  }


  // ---------------------------------------------------
  // FILE NAME
  // ---------------------------------------------------

  const nameCheck =
    validateStorageFileName(
      fileName
    );


  if (
    !nameCheck.valid
  ) {

    return {

      allowed:
        false,

      status:
        nameCheck.status,

      error:
        nameCheck.error

    };

  }


  // ---------------------------------------------------
  // FILE SIZE
  // ---------------------------------------------------

  const sizeCheck =
    validateStorageFileSize(
      fileSize
    );


  if (
    !sizeCheck.valid
  ) {

    return {

      allowed:
        false,

      status:
        sizeCheck.status,

      error:
        sizeCheck.error

    };

  }


  // ---------------------------------------------------
  // STORAGE FILE SIZE
  // ---------------------------------------------------

  if (
    STORAGE_SECURITY_SETTINGS
      .CHECK_FILE_SIZE
  ) {

    if (
      !isFileSizeAllowed(
        target.storage,
        sizeCheck.fileSize
      )
    ) {

      return {

        allowed:
          false,

        status:
          STORAGE_SECURITY_STATUS.DENIED,

        error:
          STORAGE_SECURITY_EVENTS
            .FILE_TOO_LARGE

      };

    }

  }


  // ---------------------------------------------------
  // QUOTA
  // ---------------------------------------------------

  const quota =
    checkStorageSecurityQuota(
      storageId,
      sizeCheck.fileSize
    );


  if (
    !quota.allowed
  ) {

    return quota;

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    userId:
      userId,

    storageId:
      storageId,

    fileName:
      nameCheck.fileName,

    fileSize:
      sizeCheck.fileSize,

    storage:
      target.storage

  };

}


// =====================================================
// COMPLETE DOWNLOAD SECURITY CHECK
// =====================================================

function validateStorageDownloadSecurity(
  data
) {

  data =
    data || {};


  const userId =
    data.userId || "";


  const storageId =
    data.storageId || "";


  const fileId =
    data.fileId || "";


  const authentication =
    checkStorageAuthentication(
      userId
    );


  if (
    !authentication.authenticated
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        authentication.error

    };

  }


  const target =
    validateStorageAccessTarget(
      storageId
    );


  if (
    !target.valid
  ) {

    return {

      allowed:
        false,

      status:
        target.status,

      error:
        target.error

    };

  }


  const permission =
    checkStorageSecurityPermission(
      userId,
      storageId,
      STORAGE_SECURITY_ACTIONS.DOWNLOAD
    );


  if (
    !permission.allowed
  ) {

    return permission;

  }


  if (!fileId) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "File ID is required"

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    userId:
      userId,

    storageId:
      storageId,

    fileId:
      fileId

  };

}


// =====================================================
// DELETE SECURITY CHECK
// =====================================================

function validateStorageDeleteSecurity(
  userId,
  storageId,
  fileId
) {

  const authentication =
    checkStorageAuthentication(
      userId
    );


  if (
    !authentication.authenticated
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        authentication.error

    };

  }


  const target =
    validateStorageAccessTarget(
      storageId
    );


  if (
    !target.valid
  ) {

    return {

      allowed:
        false,

      status:
        target.status,

      error:
        target.error

    };

  }


  const permission =
    checkStorageSecurityPermission(
      userId,
      storageId,
      STORAGE_SECURITY_ACTIONS.DELETE
    );


  if (
    !permission.allowed
  ) {

    return permission;

  }


  if (!fileId) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.INVALID,

      error:
        "File ID is required"

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    userId:
      userId,

    storageId:
      storageId,

    fileId:
      fileId

  };

}


// =====================================================
// SUSPICIOUS REQUEST CHECK
// =====================================================

function isSuspiciousStorageRequest(
  data
) {

  data =
    data || {};


  let score =
    0;


  const reasons = [];


  // ---------------------------------------------------
  // Invalid user
  // ---------------------------------------------------

  if (
    !data.userId
  ) {

    score += 3;

    reasons.push(
      "Missing user ID"
    );

  }


  // ---------------------------------------------------
  // Invalid storage
  // ---------------------------------------------------

  if (
    !data.storageId
  ) {

    score += 3;

    reasons.push(
      "Missing storage ID"
    );

  }


  // ---------------------------------------------------
  // Invalid file size
  // ---------------------------------------------------

  if (
    data.fileSize !==
    undefined
  ) {

    const size =
      Number(
        data.fileSize
      );


    if (
      !isFinite(size) ||
      size < 0
    ) {

      score += 4;

      reasons.push(
        "Invalid file size"
      );

    }

  }


  // ---------------------------------------------------
  // Path traversal
  // ---------------------------------------------------

  if (
    data.path &&
    String(
      data.path
    ).indexOf(
      ".."
    ) !== -1
  ) {

    score += 5;

    reasons.push(
      "Path traversal attempt"
    );

  }


  // ---------------------------------------------------
  // Invalid file name
  // ---------------------------------------------------

  if (
    data.fileName
  ) {

    const result =
      validateStorageFileName(
        data.fileName
      );


    if (
      !result.valid
    ) {

      score += 4;

      reasons.push(
        result.error
      );

    }

  }


  return {

    suspicious:
      score >= 5,

    score:
      score,

    reasons:
      reasons

  };

}


// =====================================================
// SECURITY EVENT LOGGER
// =====================================================

function logStorageSecurityEvent(
  data
) {

  if (
    !STORAGE_SECURITY_SETTINGS
      .LOG_SECURITY_EVENTS
  ) {

    return null;

  }


  data =
    data || {};


  const event = {

    id:
      generateStorageSecurityId(),

    userId:
      data.userId ||
      "",

    storageId:
      data.storageId ||
      "",

    fileId:
      data.fileId ||
      "",

    action:
      data.action ||
      "",

    event:
      data.event ||
      STORAGE_SECURITY_EVENTS
        .SECURITY_ERROR,

    status:
      data.status ||
      STORAGE_SECURITY_STATUS.ERROR,

    message:
      data.message ||
      "",

    ipAddress:
      data.ipAddress ||
      "",

    deviceId:
      data.deviceId ||
      "",

    createdAt:
      new Date()

  };


  /*
   * If your project already has a security
   * logging system, use it.
   */

  if (
    typeof createSecurityLog ===
    "function"
  ) {

    try {

      createSecurityLog(
        event
      );

      return event;

    }
    catch (error) {

      // Continue to local fallback.

    }

  }


  /*
   * Fallback to Apps Script Logger.
   */

  console.log(
    JSON.stringify(
      event
    )
  );


  return event;

}


// =====================================================
// AUTHORIZE STORAGE ACTION
// =====================================================

function authorizeStorageAction(
  data
) {

  data =
    data || {};


  const suspicious =
    isSuspiciousStorageRequest(
      data
    );


  if (
    suspicious.suspicious
  ) {

    logStorageSecurityEvent({

      userId:
        data.userId,

      storageId:
        data.storageId,

      fileId:
        data.fileId,

      action:
        data.action,

      event:
        STORAGE_SECURITY_EVENTS
          .SUSPICIOUS_REQUEST,

      status:
        STORAGE_SECURITY_STATUS.SUSPICIOUS,

      message:
        suspicious.reasons
          .join("; ")

    });


    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.SUSPICIOUS,

      error:
        "Suspicious storage request",

      score:
        suspicious.score,

      reasons:
        suspicious.reasons

    };

  }


  const action =
    data.action ||
    STORAGE_SECURITY_ACTIONS.READ;


  // ---------------------------------------------------
  // Upload
  // ---------------------------------------------------

  if (
    action ===
    STORAGE_SECURITY_ACTIONS.UPLOAD
  ) {

    return validateStorageUploadSecurity(
      data
    );

  }


  // ---------------------------------------------------
  // Download
  // ---------------------------------------------------

  if (
    action ===
    STORAGE_SECURITY_ACTIONS.DOWNLOAD
  ) {

    return validateStorageDownloadSecurity(
      data
    );

  }


  // ---------------------------------------------------
  // Delete
  // ---------------------------------------------------

  if (
    action ===
    STORAGE_SECURITY_ACTIONS.DELETE
  ) {

    return validateStorageDeleteSecurity(
      data.userId,
      data.storageId,
      data.fileId
    );

  }


  // ---------------------------------------------------
  // Generic action
  // ---------------------------------------------------

  const authentication =
    checkStorageAuthentication(
      data.userId
    );


  if (
    !authentication.authenticated
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_SECURITY_STATUS.DENIED,

      error:
        authentication.error

    };

  }


  const permission =
    checkStorageSecurityPermission(
      data.userId,
      data.storageId,
      action
    );


  if (
    !permission.allowed
  ) {

    return permission;

  }


  return {

    allowed:
      true,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    userId:
      data.userId,

    storageId:
      data.storageId,

    action:
      action

  };

}


// =====================================================
// SECURITY WRAPPER
// =====================================================

function requireSecureStorageAction(
  data
) {

  const result =
    authorizeStorageAction(
      data
    );


  if (
    !result.allowed
  ) {

    throw new Error(
      result.error ||
      "Storage security check failed"
    );

  }


  logStorageSecurityEvent({

    userId:
      data.userId,

    storageId:
      data.storageId,

    fileId:
      data.fileId,

    action:
      data.action,

    event:
      STORAGE_SECURITY_EVENTS
        .ACCESS_GRANTED,

    status:
      STORAGE_SECURITY_STATUS.ALLOWED,

    message:
      "Storage action authorized"

  });


  return result;

}


// =====================================================
// SECURITY CONFIG
// =====================================================

function getStorageSecurityConfig() {

  return {

    enabled:
      STORAGE_SECURITY_SETTINGS
        .ENABLED,

    settings:
      STORAGE_SECURITY_SETTINGS,

    actions:
      STORAGE_SECURITY_ACTIONS,

    statuses:
      STORAGE_SECURITY_STATUS,

    events:
      STORAGE_SECURITY_EVENTS,

    pathProtection:
      true,

    fileNameProtection:
      true,

    authentication:
      STORAGE_SECURITY_SETTINGS
        .REQUIRE_AUTHENTICATION,

    permissionChecking:
      STORAGE_SECURITY_SETTINGS
        .REQUIRE_PERMISSION,

    quotaChecking:
      STORAGE_SECURITY_SETTINGS
        .CHECK_QUOTA,

    suspiciousRequestDetection:
      true,

    securityLogging:
      STORAGE_SECURITY_SETTINGS
        .LOG_SECURITY_EVENTS

  };

}