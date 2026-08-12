// =====================================================
// STORAGEHEALTH.GS
// Storage Health Monitoring
// Cloud Project Platform
// =====================================================


// =====================================================
// HEALTH STATUS
// =====================================================

const STORAGE_HEALTH_STATUS = {

  HEALTHY:
    "Healthy",

  WARNING:
    "Warning",

  DEGRADED:
    "Degraded",

  FULL:
    "Full",

  OFFLINE:
    "Offline",

  DISABLED:
    "Disabled",

  ERROR:
    "Error",

  UNKNOWN:
    "Unknown"

};


// =====================================================
// HEALTH CHECK TYPES
// =====================================================

const STORAGE_HEALTH_CHECKS = {

  STORAGE:
    "Storage",

  CAPACITY:
    "Capacity",

  ROOMS:
    "Rooms",

  NODES:
    "Nodes",

  CONNECTIVITY:
    "Connectivity",

  FILE_LIMIT:
    "File Limit",

  ALLOCATION:
    "Allocation"

};


// =====================================================
// HEALTH SETTINGS
// =====================================================

const STORAGE_HEALTH_SETTINGS = {

  ENABLED:
    true,

  WARNING_USAGE_PERCENT:
    80,

  DEGRADED_USAGE_PERCENT:
    90,

  FULL_USAGE_PERCENT:
    100,

  MIN_HEALTH_SCORE:
    60,

  MIN_NODE_HEALTH_SCORE:
    50,

  INCLUDE_DISABLED_STORAGE:
    false,

  INCLUDE_FULL_STORAGE:
    true,

  CHECK_ROOMS:
    true,

  CHECK_NODES:
    true,

  CHECK_CAPACITY:
    true,

  LOG_HEALTH_EVENTS:
    true

};


// =====================================================
// HEALTH SCORE
// =====================================================

const STORAGE_HEALTH_SCORE = {

  MAX:
    100,

  MIN:
    0,

  STORAGE_STATUS:
    25,

  CAPACITY:
    30,

  NODES:
    20,

  ROOMS:
    15,

  CONNECTIVITY:
    10

};


// =====================================================
// HEALTH ID
// =====================================================

function generateStorageHealthId() {

  return (
    "SHEALTH-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// HEALTH ENABLED
// =====================================================

function isStorageHealthEnabled() {

  return (
    STORAGE_HEALTH_SETTINGS
      .ENABLED === true
  );

}


// =====================================================
// GET USAGE PERCENTAGE
// =====================================================

function getStorageHealthUsagePercent(
  storage
) {

  if (!storage) {

    return 0;

  }


  return calculateStorageUsagePercent(
    storage.totalBytes,
    storage.usedBytes
  );

}


// =====================================================
// GET CAPACITY STATUS
// =====================================================

function getStorageCapacityHealth(
  storage
) {

  if (!storage) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0,

      usagePercent:
        0

    };

  }


  const usagePercent =
    getStorageHealthUsagePercent(
      storage
    );


  if (
    usagePercent >=
    STORAGE_HEALTH_SETTINGS
      .FULL_USAGE_PERCENT
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.FULL,

      score:
        0,

      usagePercent:
        usagePercent

    };

  }


  if (
    usagePercent >=
    STORAGE_HEALTH_SETTINGS
      .DEGRADED_USAGE_PERCENT
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.DEGRADED,

      score:
        30,

      usagePercent:
        usagePercent

    };

  }


  if (
    usagePercent >=
    STORAGE_HEALTH_SETTINGS
      .WARNING_USAGE_PERCENT
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        70,

      usagePercent:
        usagePercent

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.HEALTHY,

    score:
      100,

    usagePercent:
      usagePercent

  };

}


// =====================================================
// GET STORAGE STATUS HEALTH
// =====================================================

function getStorageStatusHealth(
  storage
) {

  if (!storage) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0

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

      status:
        STORAGE_HEALTH_STATUS.DISABLED,

      score:
        0

    };

  }


  if (
    status ===
    "offline"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.OFFLINE,

      score:
        0

    };

  }


  if (
    status ===
    "error"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.ERROR,

      score:
        0

    };

  }


  if (
    status ===
    "full"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.FULL,

      score:
        20

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.HEALTHY,

    score:
      100

  };

}


// =====================================================
// CHECK ROOMS
// =====================================================

function checkStorageRoomsHealth(
  storageId
) {

  if (
    !STORAGE_HEALTH_SETTINGS
      .CHECK_ROOMS
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        100,

      total:
        0,

      active:
        0,

      inactive:
        0

    };

  }


  if (
    typeof getStorageRoomsByStorageId !==
    "function"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.ERROR,

      score:
        0,

      total:
        0,

      active:
        0,

      inactive:
        0,

      error:
        "Storage rooms system unavailable"

    };

  }


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    ) || [];


  let active =
    0;


  let inactive =
    0;


  for (
    let i = 0;
    i < rooms.length;
    i++
  ) {

    const status =
      String(
        rooms[i].status ||
        ""
      ).toLowerCase();


    if (
      status ===
      "active"
    ) {

      active++;

    }
    else {

      inactive++;

    }

  }


  if (
    rooms.length === 0
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        50,

      total:
        0,

      active:
        0,

      inactive:
        0

    };

  }


  const ratio =
    active /
    rooms.length;


  if (
    ratio < 0.5
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.DEGRADED,

      score:
        30,

      total:
        rooms.length,

      active:
        active,

      inactive:
        inactive

    };

  }


  if (
    ratio < 1
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        70,

      total:
        rooms.length,

      active:
        active,

      inactive:
        inactive

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.HEALTHY,

    score:
      100,

    total:
      rooms.length,

    active:
      active,

    inactive:
      inactive

  };

}


// =====================================================
// CHECK NODES
// =====================================================

function checkStorageNodesHealth(
  storageId
) {

  if (
    !STORAGE_HEALTH_SETTINGS
      .CHECK_NODES
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        100,

      total:
        0,

      active:
        0,

      inactive:
        0

    };

  }


  if (
    typeof getStorageNodesByStorageId !==
    "function"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.ERROR,

      score:
        0,

      total:
        0,

      active:
        0,

      inactive:
        0,

      error:
        "Storage nodes system unavailable"

    };

  }


  const nodes =
    getStorageNodesByStorageId(
      storageId
    ) || [];


  let active =
    0;


  let inactive =
    0;


  let totalHealth =
    0;


  for (
    let i = 0;
    i < nodes.length;
    i++
  ) {

    const node =
      nodes[i];


    const status =
      String(
        node.status ||
        ""
      ).toLowerCase();


    if (
      status ===
      "active"
    ) {

      active++;

    }
    else {

      inactive++;

    }


    let nodeScore =
      Number(
        node.healthScore
      );


    if (
      !isFinite(
        nodeScore
      )
    ) {

      nodeScore =
        status ===
        "active"
          ? 100
          : 0;

    }


    nodeScore =
      Math.max(
        0,
        Math.min(
          100,
          nodeScore
        )
      );


    totalHealth +=
      nodeScore;

  }


  if (
    nodes.length === 0
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        50,

      total:
        0,

      active:
        0,

      inactive:
        0,

      averageHealth:
        0

    };

  }


  const averageHealth =
    totalHealth /
    nodes.length;


  if (
    averageHealth <
    STORAGE_HEALTH_SETTINGS
      .MIN_NODE_HEALTH_SCORE
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.DEGRADED,

      score:
        averageHealth,

      total:
        nodes.length,

      active:
        active,

      inactive:
        inactive,

      averageHealth:
        averageHealth

    };

  }


  if (
    averageHealth < 80
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        averageHealth,

      total:
        nodes.length,

      active:
        active,

      inactive:
        inactive,

      averageHealth:
        averageHealth

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.HEALTHY,

    score:
      averageHealth,

    total:
      nodes.length,

    active:
      active,

    inactive:
      inactive,

    averageHealth:
      averageHealth

  };

}


// =====================================================
// CONNECTIVITY CHECK
// =====================================================

function checkStorageConnectivity(
  storage
) {

  if (!storage) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0,

      connected:
        false

    };

  }


  /*
   * Apps Script cannot reliably ping every
   * external storage provider without provider-
   * specific APIs.
   *
   * This check therefore uses the configured
   * storage status as the baseline.
   */

  const status =
    String(
      storage.status ||
      ""
    ).toLowerCase();


  if (
    status === "active"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.HEALTHY,

      score:
        100,

      connected:
        true

    };

  }


  if (
    status === "disabled" ||
    status === "offline"
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.OFFLINE,

      score:
        0,

      connected:
        false

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.WARNING,

    score:
      50,

    connected:
      false

  };

}


// =====================================================
// FILE LIMIT CHECK
// =====================================================

function checkStorageFileLimitHealth(
  storage
) {

  if (!storage) {

    return {

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0

    };

  }


  const maxFileSize =
    Number(
      storage.maxFileSize ||
      0
    );


  if (
    maxFileSize <= 0
  ) {

    return {

      status:
        STORAGE_HEALTH_STATUS.WARNING,

      score:
        50,

      maxFileSize:
        maxFileSize

    };

  }


  return {

    status:
      STORAGE_HEALTH_STATUS.HEALTHY,

    score:
      100,

    maxFileSize:
      maxFileSize

  };

}


// =====================================================
// CALCULATE HEALTH SCORE
// =====================================================

function calculateStorageHealthScore(
  components
) {

  components =
    components || {};


  let score =
    0;


  score +=
    (
      Number(
        components.storageStatusScore ||
        0
      ) *
      STORAGE_HEALTH_SCORE
        .STORAGE_STATUS
    ) / 100;


  score +=
    (
      Number(
        components.capacityScore ||
        0
      ) *
      STORAGE_HEALTH_SCORE
        .CAPACITY
    ) / 100;


  score +=
    (
      Number(
        components.nodesScore ||
        0
      ) *
      STORAGE_HEALTH_SCORE
        .NODES
    ) / 100;


  score +=
    (
      Number(
        components.roomsScore ||
        0
      ) *
      STORAGE_HEALTH_SCORE
        .ROOMS
    ) / 100;


  score +=
    (
      Number(
        components.connectivityScore ||
        0
      ) *
      STORAGE_HEALTH_SCORE
        .CONNECTIVITY
    ) / 100;


  return Math.max(
    0,
    Math.min(
      100,
      score
    )
  );

}


// =====================================================
// DETERMINE OVERALL HEALTH
// =====================================================

function determineStorageHealthStatus(
  score,
  components
) {

  components =
    components || {};


  if (
    components.storageStatus ===
    STORAGE_HEALTH_STATUS.DISABLED
  ) {

    return STORAGE_HEALTH_STATUS.DISABLED;

  }


  if (
    components.connectivityStatus ===
    STORAGE_HEALTH_STATUS.OFFLINE
  ) {

    return STORAGE_HEALTH_STATUS.OFFLINE;

  }


  if (
    components.capacityStatus ===
    STORAGE_HEALTH_STATUS.FULL
  ) {

    return STORAGE_HEALTH_STATUS.FULL;

  }


  if (
    score <
    STORAGE_HEALTH_SETTINGS
      .MIN_HEALTH_SCORE
  ) {

    return STORAGE_HEALTH_STATUS.DEGRADED;

  }


  if (
    score < 80
  ) {

    return STORAGE_HEALTH_STATUS.WARNING;

  }


  return STORAGE_HEALTH_STATUS.HEALTHY;

}


// =====================================================
// COMPLETE STORAGE HEALTH CHECK
// =====================================================

function checkStorageHealth(
  storageId
) {

  if (!isStorageHealthEnabled()) {

    return {

      enabled:
        false,

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0

    };

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    return {

      enabled:
        true,

      storageId:
        storageId,

      status:
        STORAGE_HEALTH_STATUS.UNKNOWN,

      score:
        0,

      error:
        "Storage not found"

    };

  }


  const storageStatus =
    getStorageStatusHealth(
      storage
    );


  const capacity =
    getStorageCapacityHealth(
      storage
    );


  const nodes =
    checkStorageNodesHealth(
      storageId
    );


  const rooms =
    checkStorageRoomsHealth(
      storageId
    );


  const connectivity =
    checkStorageConnectivity(
      storage
    );


  const fileLimit =
    checkStorageFileLimitHealth(
      storage
    );


  const score =
    calculateStorageHealthScore({

      storageStatusScore:
        storageStatus.score,

      capacityScore:
        capacity.score,

      nodesScore:
        nodes.score,

      roomsScore:
        rooms.score,

      connectivityScore:
        connectivity.score

    });


  const status =
    determineStorageHealthStatus(
      score,
      {

        storageStatus:
          storageStatus.status,

        capacityStatus:
          capacity.status,

        connectivityStatus:
          connectivity.status

      }
    );


  return {

    enabled:
      true,

    healthId:
      generateStorageHealthId(),

    storageId:
      storageId,

    storageName:
      storage.name,

    storageType:
      storage.type,

    status:
      status,

    score:
      Number(
        score.toFixed(
          2
        )
      ),

    usagePercent:
      capacity.usagePercent,

    availableBytes:
      Number(
        storage.availableBytes ||
        0
      ),

    totalBytes:
      Number(
        storage.totalBytes ||
        0
      ),

    usedBytes:
      Number(
        storage.usedBytes ||
        0
      ),

    components: {

      storage:
        storageStatus,

      capacity:
        capacity,

      nodes:
        nodes,

      rooms:
        rooms,

      connectivity:
        connectivity,

      fileLimit:
        fileLimit

    },

    checkedAt:
      new Date()

  };

}


// =====================================================
// CHECK ALL STORAGE HEALTH
// =====================================================

function checkAllStorageHealth() {

  const storages =
    getAllStorageRecords();


  const results = [];


  for (
    let i = 0;
    i < storages.length;
    i++
  ) {

    results.push(
      checkStorageHealth(
        storages[i].id
      )
    );

  }


  return results;

}


// =====================================================
// GET HEALTHY STORAGE
// =====================================================

function getHealthyStorageRecords() {

  const results =
    checkAllStorageHealth();


  return results.filter(
    function(result) {

      return (
        result.status ===
        STORAGE_HEALTH_STATUS.HEALTHY
      );

    }
  );

}


// =====================================================
// GET AVAILABLE STORAGE
// =====================================================

function getAvailableHealthyStorageRecords() {

  const results =
    checkAllStorageHealth();


  return results.filter(
    function(result) {

      if (
        result.status ===
        STORAGE_HEALTH_STATUS.DISABLED
      ) {

        return false;

      }


      if (
        result.status ===
        STORAGE_HEALTH_STATUS.OFFLINE
      ) {

        return false;

      }


      if (
        result.status ===
        STORAGE_HEALTH_STATUS.ERROR
      ) {

        return false;

      }


      if (
        !STORAGE_HEALTH_SETTINGS
          .INCLUDE_FULL_STORAGE &&
        result.status ===
        STORAGE_HEALTH_STATUS.FULL
      ) {

        return false;

      }


      return true;

    }
  );

}


// =====================================================
// FIND BEST STORAGE BY HEALTH
// =====================================================

function findBestStorageByHealth() {

  const results =
    getAvailableHealthyStorageRecords();


  if (
    results.length === 0
  ) {

    return null;

  }


  results.sort(
    function(a, b) {

      // Highest health first
      if (
        b.score !==
        a.score
      ) {

        return (
          b.score -
          a.score
        );

      }


      // Then highest available capacity
      return (
        Number(
          b.availableBytes ||
          0
        ) -
        Number(
          a.availableBytes ||
          0
        )
      );

    }
  );


  return results[0];

}


// =====================================================
// GET STORAGE HEALTH SUMMARY
// =====================================================

function getStorageHealthSummary() {

  const results =
    checkAllStorageHealth();


  let healthy =
    0;

  let warning =
    0;

  let degraded =
    0;

  let full =
    0;

  let offline =
    0;

  let disabled =
    0;

  let error =
    0;


  let totalBytes =
    0;

  let usedBytes =
    0;

  let availableBytes =
    0;


  for (
    let i = 0;
    i < results.length;
    i++
  ) {

    const result =
      results[i];


    switch (
      result.status
    ) {

      case STORAGE_HEALTH_STATUS.HEALTHY:
        healthy++;
        break;

      case STORAGE_HEALTH_STATUS.WARNING:
        warning++;
        break;

      case STORAGE_HEALTH_STATUS.DEGRADED:
        degraded++;
        break;

      case STORAGE_HEALTH_STATUS.FULL:
        full++;
        break;

      case STORAGE_HEALTH_STATUS.OFFLINE:
        offline++;
        break;

      case STORAGE_HEALTH_STATUS.DISABLED:
        disabled++;
        break;

      case STORAGE_HEALTH_STATUS.ERROR:
        error++;
        break;

    }


    totalBytes +=
      Number(
        result.totalBytes ||
        0
      );


    usedBytes +=
      Number(
        result.usedBytes ||
        0
      );


    availableBytes +=
      Number(
        result.availableBytes ||
        0
      );

  }


  const usagePercent =
    totalBytes > 0
      ? (
          usedBytes /
          totalBytes
        ) * 100
      : 0;


  return {

    totalStorages:
      results.length,

    healthy:
      healthy,

    warning:
      warning,

    degraded:
      degraded,

    full:
      full,

    offline:
      offline,

    disabled:
      disabled,

    error:
      error,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      availableBytes,

    usagePercent:
      Number(
        usagePercent.toFixed(
          2
        )
      ),

    checkedAt:
      new Date()

  };

}


// =====================================================
// STORAGE HEALTH CONFIG
// =====================================================

function getStorageHealthConfig() {

  return {

    enabled:
      STORAGE_HEALTH_SETTINGS
        .ENABLED,

    settings:
      STORAGE_HEALTH_SETTINGS,

    statuses:
      STORAGE_HEALTH_STATUS,

    checks:
      STORAGE_HEALTH_CHECKS,

    score:
      STORAGE_HEALTH_SCORE

  };

}