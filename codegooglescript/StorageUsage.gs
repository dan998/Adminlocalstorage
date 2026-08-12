// =====================================================
// STORAGEUSAGE.GS
// Storage Usage & Capacity Tracking
// Cloud Project Platform
// =====================================================


// =====================================================
// USAGE CONSTANTS
// =====================================================

const STORAGE_USAGE_STATUS = {

  NORMAL:
    "Normal",

  WARNING:
    "Warning",

  CRITICAL:
    "Critical",

  FULL:
    "Full",

  ERROR:
    "Error"

};


// =====================================================
// USAGE THRESHOLDS
// =====================================================

const STORAGE_USAGE_THRESHOLDS = {

  WARNING:
    70,

  CRITICAL:
    90,

  FULL:
    100

};


// =====================================================
// NORMALIZE BYTES
// =====================================================

function normalizeStorageBytes(
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
// GET STORAGE USAGE
// =====================================================

function getStorageUsage(
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


  const totalBytes =
    normalizeStorageBytes(
      storage.totalBytes
    );


  const usedBytes =
    normalizeStorageBytes(
      storage.usedBytes
    );


  const availableBytes =
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    );


  const usagePercent =
    calculateStorageUsagePercent(
      totalBytes,
      usedBytes
    );


  return {

    storageId:
      storage.id,

    storageName:
      storage.name,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      availableBytes,

    usagePercent:
      usagePercent,

    status:
      getStorageUsageStatus(
        usagePercent
      )

  };

}


// =====================================================
// GET STORAGE USAGE STATUS
// =====================================================

function getStorageUsageStatus(
  usagePercent
) {

  usagePercent =
    Number(
      usagePercent || 0
    );


  if (
    usagePercent >=
    STORAGE_USAGE_THRESHOLDS.FULL
  ) {

    return STORAGE_USAGE_STATUS.FULL;

  }


  if (
    usagePercent >=
    STORAGE_USAGE_THRESHOLDS.CRITICAL
  ) {

    return STORAGE_USAGE_STATUS.CRITICAL;

  }


  if (
    usagePercent >=
    STORAGE_USAGE_THRESHOLDS.WARNING
  ) {

    return STORAGE_USAGE_STATUS.WARNING;

  }


  return STORAGE_USAGE_STATUS.NORMAL;

}


// =====================================================
// UPDATE STORAGE USAGE
// =====================================================

function updateStorageUsage(
  storageId,
  usedBytes
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


  usedBytes =
    normalizeStorageBytes(
      usedBytes
    );


  const totalBytes =
    normalizeStorageBytes(
      storage.totalBytes
    );


  if (
    usedBytes >
    totalBytes &&
    totalBytes > 0
  ) {

    throw new Error(
      "Used storage cannot exceed total storage capacity"
    );

  }


  const availableBytes =
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    );


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.USED_BYTES
  ).setValue(
    usedBytes
  );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.AVAILABLE_BYTES
  ).setValue(
    availableBytes
  );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.UPDATED_AT
  ).setValue(
    new Date()
  );


  return getStorageUsage(
    storageId
  );

}


// =====================================================
// INCREASE STORAGE USAGE
// =====================================================

function increaseStorageUsage(
  storageId,
  bytes
) {

  bytes =
    normalizeStorageBytes(
      bytes
    );


  if (
    bytes <= 0
  ) {

    return getStorageUsage(
      storageId
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


  const currentUsed =
    normalizeStorageBytes(
      storage.usedBytes
    );


  const totalBytes =
    normalizeStorageBytes(
      storage.totalBytes
    );


  const newUsed =
    currentUsed +
    bytes;


  if (
    totalBytes > 0 &&
    newUsed > totalBytes
  ) {

    throw new Error(
      "Storage capacity exceeded"
    );

  }


  return updateStorageUsage(
    storageId,
    newUsed
  );

}


// =====================================================
// DECREASE STORAGE USAGE
// =====================================================

function decreaseStorageUsage(
  storageId,
  bytes
) {

  bytes =
    normalizeStorageBytes(
      bytes
    );


  if (
    bytes <= 0
  ) {

    return getStorageUsage(
      storageId
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


  const currentUsed =
    normalizeStorageBytes(
      storage.usedBytes
    );


  const newUsed =
    Math.max(
      0,
      currentUsed -
      bytes
    );


  return updateStorageUsage(
    storageId,
    newUsed
  );

}


// =====================================================
// RECALCULATE STORAGE USAGE FROM NODES
// =====================================================

function recalculateStorageUsage(
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


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let usedBytes =
    0;


  let totalBytes =
    0;


  let fileCount =
    0;


  nodes.forEach(
    function(node) {

      usedBytes +=
        normalizeStorageBytes(
          node.usedBytes
        );


      totalBytes +=
        normalizeStorageBytes(
          node.totalBytes
        );


      fileCount +=
        Number(
          node.fileCount || 0
        );

    }
  );


  // ---------------------------------------------------
  // Do not replace configured storage capacity with
  // zero when nodes have not reported capacity yet.
  // ---------------------------------------------------

  if (
    totalBytes <= 0
  ) {

    totalBytes =
      normalizeStorageBytes(
        storage.totalBytes
      );

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.TOTAL_BYTES
  ).setValue(
    totalBytes
  );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.USED_BYTES
  ).setValue(
    usedBytes
  );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.AVAILABLE_BYTES
  ).setValue(
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    )
  );


  sheet.getRange(
    storage.row,
    STORAGE_COLUMNS.UPDATED_AT
  ).setValue(
    new Date()
  );


  return {

    storageId:
      storageId,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageAvailable(
        totalBytes,
        usedBytes
      ),

    fileCount:
      fileCount,

    nodeCount:
      nodes.length

  };

}


// =====================================================
// GET NODE USAGE
// =====================================================

function getStorageNodeUsage(
  nodeId
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
    normalizeStorageBytes(
      node.totalBytes
    );


  const usedBytes =
    normalizeStorageBytes(
      node.usedBytes
    );


  return {

    nodeId:
      node.id,

    nodeName:
      node.name,

    storageId:
      node.storageId,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageAvailable(
        totalBytes,
        usedBytes
      ),

    usagePercent:
      calculateStorageUsagePercent(
        totalBytes,
        usedBytes
      ),

    status:
      getStorageUsageStatus(
        calculateStorageUsagePercent(
          totalBytes,
          usedBytes
        )
      )

  };

}


// =====================================================
// UPDATE NODE USAGE
// =====================================================

function updateStorageNodeUsage(
  nodeId,
  usedBytes
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


  usedBytes =
    normalizeStorageBytes(
      usedBytes
    );


  const totalBytes =
    normalizeStorageBytes(
      node.totalBytes
    );


  if (
    totalBytes > 0 &&
    usedBytes > totalBytes
  ) {

    throw new Error(
      "Node capacity exceeded"
    );

  }


  if (
    typeof updateStorageNode ===
    "function"
  ) {

    return updateStorageNode(
      nodeId,
      {

        usedBytes:
          usedBytes,

        availableBytes:
          calculateStorageAvailable(
            totalBytes,
            usedBytes
          ),

        updatedAt:
          new Date()

      }
    );

  }


  throw new Error(
    "Storage node update function is not available"
  );

}


// =====================================================
// INCREASE NODE USAGE
// =====================================================

function increaseStorageNodeUsage(
  nodeId,
  bytes
) {

  bytes =
    normalizeStorageBytes(
      bytes
    );


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  const currentUsed =
    normalizeStorageBytes(
      node.usedBytes
    );


  return updateStorageNodeUsage(
    nodeId,
    currentUsed +
    bytes
  );

}


// =====================================================
// DECREASE NODE USAGE
// =====================================================

function decreaseStorageNodeUsage(
  nodeId,
  bytes
) {

  bytes =
    normalizeStorageBytes(
      bytes
    );


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  const currentUsed =
    normalizeStorageBytes(
      node.usedBytes
    );


  return updateStorageNodeUsage(
    nodeId,
    Math.max(
      0,
      currentUsed -
      bytes
    )
  );

}


// =====================================================
// GET ALL STORAGE USAGE
// =====================================================

function getAllStorageUsage() {

  const storages =
    getAllStorageRecords();


  return storages.map(
    function(storage) {

      return getStorageUsage(
        storage.id
      );

    }
  );

}


// =====================================================
// GET ACTIVE STORAGE USAGE
// =====================================================

function getActiveStorageUsage() {

  const storages =
    getActiveStorageRecords();


  return storages.map(
    function(storage) {

      return getStorageUsage(
        storage.id
      );

    }
  );

}


// =====================================================
// GET TOTAL USAGE ACROSS ALL STORAGE
// =====================================================

function getTotalStorageUsage() {

  const storages =
    getAllStorageRecords();


  let totalBytes =
    0;


  let usedBytes =
    0;


  let availableBytes =
    0;


  storages.forEach(
    function(storage) {

      totalBytes +=
        normalizeStorageBytes(
          storage.totalBytes
        );


      usedBytes +=
        normalizeStorageBytes(
          storage.usedBytes
        );


      availableBytes +=
        normalizeStorageBytes(
          storage.availableBytes
        );

    }
  );


  return {

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      availableBytes,

    usagePercent:
      calculateStorageUsagePercent(
        totalBytes,
        usedBytes
      ),

    storageCount:
      storages.length

  };

}


// =====================================================
// GET ACTIVE TOTAL USAGE
// =====================================================

function getActiveTotalStorageUsage() {

  const storages =
    getActiveStorageRecords();


  let totalBytes =
    0;


  let usedBytes =
    0;


  storages.forEach(
    function(storage) {

      totalBytes +=
        normalizeStorageBytes(
          storage.totalBytes
        );


      usedBytes +=
        normalizeStorageBytes(
          storage.usedBytes
        );

    }
  );


  return {

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageAvailable(
        totalBytes,
        usedBytes
      ),

    usagePercent:
      calculateStorageUsagePercent(
        totalBytes,
        usedBytes
      ),

    storageCount:
      storages.length

  };

}


// =====================================================
// FIND STORAGE WITH CAPACITY
// =====================================================

function findStorageWithCapacity(
  requiredBytes
) {

  requiredBytes =
    normalizeStorageBytes(
      requiredBytes
    );


  const storages =
    getActiveStorageRecords();


  const matches = [];


  storages.forEach(
    function(storage) {

      if (
        hasStorageCapacity(
          storage,
          requiredBytes
        )
      ) {

        matches.push(
          getStorageUsage(
            storage.id
          )
        );

      }

    }
  );


  return matches;

}


// =====================================================
// FIND FULL STORAGE
// =====================================================

function getFullStorages() {

  const storages =
    getAllStorageRecords();


  return storages.filter(
    function(storage) {

      const percent =
        calculateStorageUsagePercent(
          storage.totalBytes,
          storage.usedBytes
        );


      return percent >=
        STORAGE_USAGE_THRESHOLDS.FULL;

    }
  );

}


// =====================================================
// FIND WARNING STORAGE
// =====================================================

function getWarningStorages() {

  const storages =
    getAllStorageRecords();


  return storages.filter(
    function(storage) {

      const percent =
        calculateStorageUsagePercent(
          storage.totalBytes,
          storage.usedBytes
        );


      return (
        percent >=
        STORAGE_USAGE_THRESHOLDS.WARNING
      );

    }
  );

}


// =====================================================
// GET STORAGE USAGE SUMMARY
// =====================================================

function getStorageUsageSummary() {

  const usage =
    getTotalStorageUsage();


  const active =
    getActiveTotalStorageUsage();


  return {

    total:
      usage,

    active:
      active,

    warningCount:
      getWarningStorages().length,

    fullCount:
      getFullStorages().length

  };

}


// =====================================================
// SYNCHRONIZE ALL STORAGE USAGE
// =====================================================

function synchronizeAllStorageUsage() {

  const storages =
    getAllStorageRecords();


  const results = [];


  storages.forEach(
    function(storage) {

      try {

        results.push(
          recalculateStorageUsage(
            storage.id
          )
        );

      }
      catch (error) {

        results.push({

          storageId:
            storage.id,

          success:
            false,

          error:
            error.message

        });

      }

    }
  );


  return {

    success:
      true,

    results:
      results

  };

}


// =====================================================
// STORAGE USAGE HEALTH
// =====================================================

function getStorageUsageHealth(
  storageId
) {

  const usage =
    getStorageUsage(
      storageId
    );


  const status =
    usage.status;


  return {

    storageId:
      storageId,

    status:
      status,

    healthy:
      status ===
      STORAGE_USAGE_STATUS.NORMAL,

    warning:
      status ===
      STORAGE_USAGE_STATUS.WARNING,

    critical:
      status ===
      STORAGE_USAGE_STATUS.CRITICAL,

    full:
      status ===
      STORAGE_USAGE_STATUS.FULL,

    usagePercent:
      usage.usagePercent,

    availableBytes:
      usage.availableBytes

  };

}


// =====================================================
// USAGE CONFIGURATION
// =====================================================

function getStorageUsageConfig() {

  return {

    statuses:
      STORAGE_USAGE_STATUS,

    thresholds:
      STORAGE_USAGE_THRESHOLDS,

    tracking:
      true,

    multiStorage:
      true,

    multiNode:
      true,

    automaticSynchronization:
      true

  };

}