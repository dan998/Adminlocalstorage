// =====================================================
// STORAGEQUOTA.GS
// Storage Quota & Limit Management
// Cloud Project Platform
// =====================================================


// =====================================================
// QUOTA TYPES
// =====================================================

const STORAGE_QUOTA_TYPES = {

  STORAGE:
    "Storage",

  USER:
    "User",

  PROJECT:
    "Project",

  NODE:
    "Node",

  ROOM:
    "Room",

  FILE:
    "File"

};


// =====================================================
// QUOTA STATUS
// =====================================================

const STORAGE_QUOTA_STATUS = {

  ENABLED:
    "Enabled",

  DISABLED:
    "Disabled",

  WARNING:
    "Warning",

  EXCEEDED:
    "Exceeded",

  UNLIMITED:
    "Unlimited"

};


// =====================================================
// DEFAULT QUOTA SETTINGS
// =====================================================

const STORAGE_QUOTA_DEFAULTS = {

  ENABLED:
    true,

  WARNING_PERCENT:
    80,

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  MAX_FILES:
    0,

  MAX_STORAGE_BYTES:
    0

};


// =====================================================
// QUOTA LIMITS
// =====================================================

const STORAGE_QUOTA_LIMITS = {

  MIN_WARNING_PERCENT:
    1,

  MAX_WARNING_PERCENT:
    99,

  MAX_NAME_LENGTH:
    100,

  MAX_DESCRIPTION_LENGTH:
    500

};


// =====================================================
// GENERATE QUOTA ID
// =====================================================

function generateStorageQuotaId() {

  return (
    "QUOTA-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// NORMALIZE QUOTA BYTES
// =====================================================

function normalizeQuotaBytes(
  bytes
) {

  bytes =
    Number(
      bytes || 0
    );


  if (
    !isFinite(bytes)
  ) {

    return 0;

  }


  return Math.max(
    0,
    Math.floor(bytes)
  );

}


// =====================================================
// NORMALIZE QUOTA COUNT
// =====================================================

function normalizeQuotaCount(
  count
) {

  count =
    Number(
      count || 0
    );


  if (
    !isFinite(count)
  ) {

    return 0;

  }


  return Math.max(
    0,
    Math.floor(count)
  );

}


// =====================================================
// VALIDATE WARNING PERCENT
// =====================================================

function validateStorageQuotaWarningPercent(
  percent
) {

  percent =
    Number(
      percent
    );


  if (
    !isFinite(percent)
  ) {

    throw new Error(
      "Invalid quota warning percentage"
    );

  }


  if (
    percent <
    STORAGE_QUOTA_LIMITS
      .MIN_WARNING_PERCENT ||
    percent >
    STORAGE_QUOTA_LIMITS
      .MAX_WARNING_PERCENT
  ) {

    throw new Error(
      "Quota warning percentage must be between 1 and 99"
    );

  }


  return percent;

}


// =====================================================
// BUILD QUOTA OBJECT
// =====================================================

function buildStorageQuota(
  data
) {

  data =
    data || {};


  const warningPercent =
    data.warningPercent !==
    undefined
      ? validateStorageQuotaWarningPercent(
          data.warningPercent
        )
      : STORAGE_QUOTA_DEFAULTS
          .WARNING_PERCENT;


  return {

    id:
      data.id ||
      generateStorageQuotaId(),

    type:
      data.type ||
      STORAGE_QUOTA_TYPES.STORAGE,

    resourceId:
      data.resourceId ||
      "",

    name:
      data.name ||
      "Storage Quota",

    enabled:
      data.enabled !== false,

    maxStorageBytes:
      normalizeQuotaBytes(
        data.maxStorageBytes
      ),

    maxFileSize:
      normalizeQuotaBytes(
        data.maxFileSize ||
        STORAGE_QUOTA_DEFAULTS
          .MAX_FILE_SIZE
      ),

    maxFiles:
      normalizeQuotaCount(
        data.maxFiles
      ),

    warningPercent:
      warningPercent,

    createdBy:
      data.createdBy ||
      "",

    createdAt:
      data.createdAt ||
      new Date(),

    updatedAt:
      data.updatedAt ||
      new Date()

  };

}


// =====================================================
// GET STORAGE QUOTA
// =====================================================

function getStorageQuota(
  storageId
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  const configuredLimit =
    normalizeQuotaBytes(
      storage.quotaBytes
    );


  const maxStorageBytes =
    configuredLimit > 0
      ? configuredLimit
      : normalizeQuotaBytes(
          storage.totalBytes
        );


  return buildStorageQuota({

    resourceId:
      storage.id,

    name:
      storage.name +
      " Quota",

    maxStorageBytes:
      maxStorageBytes,

    maxFileSize:
      storage.maxFileSize ||

      STORAGE_QUOTA_DEFAULTS
        .MAX_FILE_SIZE

  });

}


// =====================================================
// GET QUOTA USAGE
// =====================================================

function getStorageQuotaUsage(
  storageId
) {

  const quota =
    getStorageQuota(
      storageId
    );


  const usage =
    getStorageUsage(
      storageId
    );


  const maxBytes =
    normalizeQuotaBytes(
      quota.maxStorageBytes
    );


  const usedBytes =
    normalizeQuotaBytes(
      usage.usedBytes
    );


  const unlimited =
    maxBytes <= 0;


  const percent =
    unlimited
      ? 0
      : calculateStorageUsagePercent(
          maxBytes,
          usedBytes
        );


  return {

    quotaId:
      quota.id,

    storageId:
      storageId,

    maxStorageBytes:
      maxBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      unlimited
        ? 0
        : calculateStorageAvailable(
            maxBytes,
            usedBytes
          ),

    usagePercent:
      percent,

    unlimited:
      unlimited,

    status:
      getStorageQuotaStatus(
        percent,
        unlimited,
        quota.enabled
      )

  };

}


// =====================================================
// QUOTA STATUS
// =====================================================

function getStorageQuotaStatus(
  percent,
  unlimited,
  enabled
) {

  if (
    !enabled
  ) {

    return STORAGE_QUOTA_STATUS.DISABLED;

  }


  if (
    unlimited
  ) {

    return STORAGE_QUOTA_STATUS.UNLIMITED;

  }


  if (
    percent >= 100
  ) {

    return STORAGE_QUOTA_STATUS.EXCEEDED;

  }


  return STORAGE_QUOTA_STATUS.ENABLED;

}


// =====================================================
// CHECK STORAGE QUOTA
// =====================================================

function checkStorageQuota(
  storageId,
  requiredBytes
) {

  requiredBytes =
    normalizeQuotaBytes(
      requiredBytes
    );


  const quota =
    getStorageQuota(
      storageId
    );


  if (
    !quota.enabled
  ) {

    return {

      allowed:
        true,

      status:
        STORAGE_QUOTA_STATUS.DISABLED,

      reason:
        null

    };

  }


  const maxBytes =
    normalizeQuotaBytes(
      quota.maxStorageBytes
    );


  if (
    maxBytes <= 0
  ) {

    return {

      allowed:
        true,

      status:
        STORAGE_QUOTA_STATUS.UNLIMITED,

      reason:
        null

    };

  }


  const usage =
    getStorageUsage(
      storageId
    );


  const usedBytes =
    normalizeQuotaBytes(
      usage.usedBytes
    );


  const remaining =
    Math.max(
      0,
      maxBytes -
      usedBytes
    );


  if (
    requiredBytes >
    remaining
  ) {

    return {

      allowed:
        false,

      status:
        STORAGE_QUOTA_STATUS.EXCEEDED,

      reason:
        "Storage quota exceeded",

      requiredBytes:
        requiredBytes,

      remainingBytes:
        remaining

    };

  }


  return {

    allowed:
      true,

    status:
      STORAGE_QUOTA_STATUS.ENABLED,

    reason:
      null,

    requiredBytes:
      requiredBytes,

    remainingBytes:
      remaining

  };

}


// =====================================================
// CHECK FILE SIZE QUOTA
// =====================================================

function checkStorageFileQuota(
  storageId,
  fileSize
) {

  fileSize =
    normalizeQuotaBytes(
      fileSize
    );


  const quota =
    getStorageQuota(
      storageId
    );


  const maxFileSize =
    normalizeQuotaBytes(
      quota.maxFileSize
    );


  if (
    maxFileSize <= 0
  ) {

    return {

      allowed:
        true,

      reason:
        null

    };

  }


  if (
    fileSize >
    maxFileSize
  ) {

    return {

      allowed:
        false,

      reason:
        "File exceeds storage file-size quota",

      maxFileSize:
        maxFileSize,

      fileSize:
        fileSize

    };

  }


  return {

    allowed:
      true,

    reason:
      null,

    maxFileSize:
      maxFileSize

  };

}


// =====================================================
// CHECK COMPLETE UPLOAD QUOTA
// =====================================================

function checkStorageUploadQuota(
  storageId,
  fileSize
) {

  const fileCheck =
    checkStorageFileQuota(
      storageId,
      fileSize
    );


  if (
    !fileCheck.allowed
  ) {

    return fileCheck;

  }


  return checkStorageQuota(
    storageId,
    fileSize
  );

}


// =====================================================
// GET USER QUOTA
// =====================================================

function getUserStorageQuota(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }


  /*
   * If a USER_QUOTA function exists elsewhere,
   * use it. Otherwise return the platform default.
   */

  if (
    typeof findUserStorageQuota ===
    "function"
  ) {

    const custom =
      findUserStorageQuota(
        userId
      );


    if (custom) {

      return buildStorageQuota(
        custom
      );

    }

  }


  return buildStorageQuota({

    type:
      STORAGE_QUOTA_TYPES.USER,

    resourceId:
      userId,

    name:
      "User Storage Quota",

    maxStorageBytes:
      0

  });

}


// =====================================================
// CHECK USER QUOTA
// =====================================================

function checkUserStorageQuota(
  userId,
  requiredBytes
) {

  const quota =
    getUserStorageQuota(
      userId
    );


  if (
    !quota.enabled
  ) {

    return {

      allowed:
        true,

      status:
        STORAGE_QUOTA_STATUS.DISABLED

    };

  }


  const maxBytes =
    normalizeQuotaBytes(
      quota.maxStorageBytes
    );


  // 0 means no configured user quota.
  if (
    maxBytes <= 0
  ) {

    return {

      allowed:
        true,

      status:
        STORAGE_QUOTA_STATUS.UNLIMITED

    };

  }


  /*
   * Calculate user usage when the project
   * provides a usage function.
   */

  let usedBytes =
    0;


  if (
    typeof getUserStorageUsage ===
    "function"
  ) {

    usedBytes =
      normalizeQuotaBytes(
        getUserStorageUsage(
          userId
        )
      );

  }


  const required =
    normalizeQuotaBytes(
      requiredBytes
    );


  const remaining =
    Math.max(
      0,
      maxBytes -
      usedBytes
    );


  return {

    allowed:
      required <= remaining,

    status:
      required <= remaining
        ? STORAGE_QUOTA_STATUS.ENABLED
        : STORAGE_QUOTA_STATUS.EXCEEDED,

    usedBytes:
      usedBytes,

    remainingBytes:
      remaining,

    maxStorageBytes:
      maxBytes

  };

}


// =====================================================
// GET PROJECT QUOTA
// =====================================================

function getProjectStorageQuota(
  projectId
) {

  if (!projectId) {

    throw new Error(
      "Project ID is required"
    );

  }


  if (
    typeof findProjectStorageQuota ===
    "function"
  ) {

    const custom =
      findProjectStorageQuota(
        projectId
      );


    if (custom) {

      return buildStorageQuota(
        custom
      );

    }

  }


  return buildStorageQuota({

    type:
      STORAGE_QUOTA_TYPES.PROJECT,

    resourceId:
      projectId,

    name:
      "Project Storage Quota",

    maxStorageBytes:
      0

  });

}


// =====================================================
// CHECK PROJECT QUOTA
// =====================================================

function checkProjectStorageQuota(
  projectId,
  requiredBytes
) {

  const quota =
    getProjectStorageQuota(
      projectId
    );


  const maxBytes =
    normalizeQuotaBytes(
      quota.maxStorageBytes
    );


  if (
    maxBytes <= 0
  ) {

    return {

      allowed:
        true,

      status:
        STORAGE_QUOTA_STATUS.UNLIMITED

    };

  }


  let usedBytes =
    0;


  if (
    typeof getProjectStorageUsage ===
    "function"
  ) {

    usedBytes =
      normalizeQuotaBytes(
        getProjectStorageUsage(
          projectId
        )
      );

  }


  const required =
    normalizeQuotaBytes(
      requiredBytes
    );


  const remaining =
    Math.max(
      0,
      maxBytes -
      usedBytes
    );


  return {

    allowed:
      required <= remaining,

    status:
      required <= remaining
        ? STORAGE_QUOTA_STATUS.ENABLED
        : STORAGE_QUOTA_STATUS.EXCEEDED,

    usedBytes:
      usedBytes,

    remainingBytes:
      remaining,

    maxStorageBytes:
      maxBytes

  };

}


// =====================================================
// CHECK NODE QUOTA
// =====================================================

function checkStorageNodeQuota(
  nodeId,
  requiredBytes
) {

  if (!nodeId) {

    throw new Error(
      "Node ID is required"
    );

  }


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  const totalBytes =
    normalizeQuotaBytes(
      node.totalBytes
    );


  const usedBytes =
    normalizeQuotaBytes(
      node.usedBytes
    );


  const required =
    normalizeQuotaBytes(
      requiredBytes
    );


  const available =
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    );


  return {

    allowed:
      totalBytes <= 0 ||
      required <= available,

    nodeId:
      nodeId,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      available,

    requiredBytes:
      required

  };

}


// =====================================================
// CHECK ALL QUOTAS
// =====================================================

function checkAllStorageQuotas(
  data
) {

  data =
    data || {};


  const fileSize =
    normalizeQuotaBytes(
      data.fileSize
    );


  const result = {

    allowed:
      true,

    storage:
      null,

    user:
      null,

    project:
      null,

    node:
      null

  };


  // ---------------------------------------------------
  // STORAGE QUOTA
  // ---------------------------------------------------

  if (
    data.storageId
  ) {

    result.storage =
      checkStorageUploadQuota(
        data.storageId,
        fileSize
      );


    if (
      !result.storage.allowed
    ) {

      result.allowed =
        false;

      return result;

    }

  }


  // ---------------------------------------------------
  // USER QUOTA
  // ---------------------------------------------------

  if (
    data.userId
  ) {

    result.user =
      checkUserStorageQuota(
        data.userId,
        fileSize
      );


    if (
      !result.user.allowed
    ) {

      result.allowed =
        false;

      return result;

    }

  }


  // ---------------------------------------------------
  // PROJECT QUOTA
  // ---------------------------------------------------

  if (
    data.projectId
  ) {

    result.project =
      checkProjectStorageQuota(
        data.projectId,
        fileSize
      );


    if (
      !result.project.allowed
    ) {

      result.allowed =
        false;

      return result;

    }

  }


  // ---------------------------------------------------
  // NODE QUOTA
  // ---------------------------------------------------

  if (
    data.nodeId
  ) {

    result.node =
      checkStorageNodeQuota(
        data.nodeId,
        fileSize
      );


    if (
      !result.node.allowed
    ) {

      result.allowed =
        false;

      return result;

    }

  }


  return result;

}


// =====================================================
// GET QUOTA WARNING
// =====================================================

function getStorageQuotaWarning(
  storageId
) {

  const quota =
    getStorageQuota(
      storageId
    );


  const usage =
    getStorageUsage(
      storageId
    );


  const percent =
    usage.usagePercent;


  if (
    quota.maxStorageBytes <= 0
  ) {

    return {

      warning:
        false,

      status:
        STORAGE_QUOTA_STATUS.UNLIMITED,

      usagePercent:
        0

    };

  }


  return {

    warning:
      percent >=
      quota.warningPercent,

    status:
      percent >= 100
        ? STORAGE_QUOTA_STATUS.EXCEEDED
        : percent >=
          quota.warningPercent
          ? STORAGE_QUOTA_STATUS.WARNING
          : STORAGE_QUOTA_STATUS.ENABLED,

    usagePercent:
      percent,

    warningPercent:
      quota.warningPercent

  };

}


// =====================================================
// GET QUOTA SUMMARY
// =====================================================

function getStorageQuotaSummary() {

  const storages =
    getAllStorageRecords();


  const results = [];


  storages.forEach(
    function(storage) {

      try {

        results.push({

          storageId:
            storage.id,

          name:
            storage.name,

          quota:
            getStorageQuotaUsage(
              storage.id
            ),

          warning:
            getStorageQuotaWarning(
              storage.id
            )

        });

      }
      catch (error) {

        results.push({

          storageId:
            storage.id,

          name:
            storage.name,

          error:
            error.message

        });

      }

    }
  );


  return results;

}


// =====================================================
// GET AVAILABLE STORAGE BY QUOTA
// =====================================================

function getQuotaAvailableStorages(
  requiredBytes
) {

  requiredBytes =
    normalizeQuotaBytes(
      requiredBytes
    );


  const storages =
    getActiveStorageRecords();


  const available = [];


  storages.forEach(
    function(storage) {

      try {

        const check =
          checkStorageUploadQuota(
            storage.id,
            requiredBytes
          );


        if (
          check.allowed
        ) {

          available.push({

            storageId:
              storage.id,

            name:
              storage.name,

            availableBytes:
              storage.availableBytes,

            check:
              check

          });

        }

      }
      catch (error) {

        // Ignore unavailable storage.

      }

    }
  );


  return available;

}


// =====================================================
// QUOTA CONFIGURATION
// =====================================================

function getStorageQuotaConfig() {

  return {

    types:
      STORAGE_QUOTA_TYPES,

    statuses:
      STORAGE_QUOTA_STATUS,

    defaults:
      STORAGE_QUOTA_DEFAULTS,

    limits:
      STORAGE_QUOTA_LIMITS,

    userQuotas:
      true,

    projectQuotas:
      true,

    storageQuotas:
      true,

    nodeQuotas:
      true,

    fileSizeQuotas:
      true,

    automaticChecking:
      true

  };

}