// =====================================================
// STORAGEALLOCATION.GS
// Intelligent Storage Allocation Engine
// Cloud Project Platform
// =====================================================


// =====================================================
// ALLOCATION STRATEGIES
// =====================================================

const STORAGE_ALLOCATION_STRATEGIES = {

  LEAST_USED:
    "Least Used",

  MOST_AVAILABLE:
    "Most Available",

  ROUND_ROBIN:
    "Round Robin",

  FIRST_AVAILABLE:
    "First Available",

  BALANCED:
    "Balanced"

};


// =====================================================
// ALLOCATION STATUS
// =====================================================

const STORAGE_ALLOCATION_STATUS = {

  AVAILABLE:
    "Available",

  SELECTED:
    "Selected",

  FULL:
    "Full",

  UNAVAILABLE:
    "Unavailable",

  FAILED:
    "Failed"

};


// =====================================================
// DEFAULT STRATEGY
// =====================================================

const DEFAULT_STORAGE_ALLOCATION_STRATEGY =
  STORAGE_ALLOCATION_STRATEGIES
    .BALANCED;


// =====================================================
// ALLOCATION LIMITS
// =====================================================

const STORAGE_ALLOCATION_LIMITS = {

  MAX_CANDIDATES:
    100,

  MIN_AVAILABLE_PERCENT:
    0,

  MAX_RETRY_ATTEMPTS:
    5

};


// =====================================================
// NORMALIZE BYTES
// =====================================================

function normalizeAllocationBytes(
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
// GET STORAGE ALLOCATION STRATEGY
// =====================================================

function getStorageAllocationStrategy() {

  if (
    typeof STORAGE_ALLOCATION !==
    "undefined"
  ) {

    return (
      STORAGE_ALLOCATION.LEAST_USED ||
      DEFAULT_STORAGE_ALLOCATION_STRATEGY
    );

  }


  return DEFAULT_STORAGE_ALLOCATION_STRATEGY;

}


// =====================================================
// GET ACTIVE STORAGE CANDIDATES
// =====================================================

function getStorageAllocationCandidates(
  requiredBytes,
  options
) {

  requiredBytes =
    normalizeAllocationBytes(
      requiredBytes
    );


  options =
    options || {};


  const storages =
    getActiveStorageRecords();


  const candidates = [];


  storages.forEach(
    function(storage) {

      try {

        // ------------------------------------------------
        // FILE SIZE CHECK
        // ------------------------------------------------

        if (
          !isFileSizeAllowed(
            storage,
            requiredBytes
          )
        ) {

          return;

        }


        // ------------------------------------------------
        // CAPACITY CHECK
        // ------------------------------------------------

        if (
          !hasStorageCapacity(
            storage,
            requiredBytes
          )
        ) {

          return;

        }


        // ------------------------------------------------
        // QUOTA CHECK
        // ------------------------------------------------

        if (
          typeof checkStorageUploadQuota ===
          "function"
        ) {

          const quota =
            checkStorageUploadQuota(
              storage.id,
              requiredBytes
            );


          if (
            !quota.allowed
          ) {

            return;

          }

        }


        const usage =
          getStorageUsage(
            storage.id
          );


        candidates.push({

          storage:
            storage,

          storageId:
            storage.id,

          name:
            storage.name,

          totalBytes:
            normalizeAllocationBytes(
              storage.totalBytes
            ),

          usedBytes:
            normalizeAllocationBytes(
              storage.usedBytes
            ),

          availableBytes:
            normalizeAllocationBytes(
              storage.availableBytes
            ),

          usagePercent:
            usage.usagePercent,

          requiredBytes:
            requiredBytes,

          status:
            STORAGE_ALLOCATION_STATUS.AVAILABLE

        });

      }
      catch (error) {

        // Ignore invalid/unavailable
        // storage locations.

      }

    }
  );


  return candidates.slice(
    0,
    STORAGE_ALLOCATION_LIMITS
      .MAX_CANDIDATES
  );

}


// =====================================================
// SORT BY LEAST USED
// =====================================================

function sortStorageByLeastUsed(
  candidates
) {

  return candidates.sort(
    function(a, b) {

      return (
        Number(
          a.usagePercent
        ) -
        Number(
          b.usagePercent
        )
      );

    }
  );

}


// =====================================================
// SORT BY MOST AVAILABLE
// =====================================================

function sortStorageByMostAvailable(
  candidates
) {

  return candidates.sort(
    function(a, b) {

      return (
        Number(
          b.availableBytes
        ) -
        Number(
          a.availableBytes
        )
      );

    }
  );

}


// =====================================================
// SORT BY BALANCED USAGE
// =====================================================

function sortStorageByBalancedUsage(
  candidates
) {

  return candidates.sort(
    function(a, b) {

      const aScore =
        calculateStorageAllocationScore(
          a
        );


      const bScore =
        calculateStorageAllocationScore(
          b
        );


      return (
        bScore -
        aScore
      );

    }
  );

}


// =====================================================
// CALCULATE ALLOCATION SCORE
// =====================================================

function calculateStorageAllocationScore(
  candidate
) {

  if (!candidate) {

    return -1;

  }


  const available =
    normalizeAllocationBytes(
      candidate.availableBytes
    );


  const total =
    normalizeAllocationBytes(
      candidate.totalBytes
    );


  const usage =
    Number(
      candidate.usagePercent ||
      0
    );


  // ---------------------------------------------------
  // Unlimited / unknown capacity
  // ---------------------------------------------------

  if (
    total <= 0
  ) {

    return (
      100 -
      usage
    );

  }


  const availablePercent =
    (
      available /
      total
    ) *
    100;


  /*
   * Balanced score:
   *
   * More available space = better
   * Lower usage = better
   */

  return (
    availablePercent * 0.7 +
    (100 - usage) * 0.3
  );

}


// =====================================================
// SORT CANDIDATES
// =====================================================

function sortStorageAllocationCandidates(
  candidates,
  strategy
) {

  strategy =
    strategy ||
    getStorageAllocationStrategy();


  const copy =
    candidates.slice();


  if (
    strategy ===
    STORAGE_ALLOCATION_STRATEGIES
      .MOST_AVAILABLE
  ) {

    return sortStorageByMostAvailable(
      copy
    );

  }


  if (
    strategy ===
    STORAGE_ALLOCATION_STRATEGIES
      .LEAST_USED
  ) {

    return sortStorageByLeastUsed(
      copy
    );

  }


  if (
    strategy ===
    STORAGE_ALLOCATION_STRATEGIES
      .FIRST_AVAILABLE
  ) {

    return copy;

  }


  if (
    strategy ===
    STORAGE_ALLOCATION_STRATEGIES
      .BALANCED
  ) {

    return sortStorageByBalancedUsage(
      copy
    );

  }


  return sortStorageByBalancedUsage(
    copy
  );

}


// =====================================================
// SELECT STORAGE
// =====================================================

function selectStorageForAllocation(
  requiredBytes,
  options
) {

  requiredBytes =
    normalizeAllocationBytes(
      requiredBytes
    );


  options =
    options || {};


  const candidates =
    getStorageAllocationCandidates(
      requiredBytes,
      options
    );


  if (
    candidates.length === 0
  ) {

    return null;

  }


  const sorted =
    sortStorageAllocationCandidates(
      candidates,
      options.strategy
    );


  const selected =
    sorted[0];


  selected.status =
    STORAGE_ALLOCATION_STATUS.SELECTED;


  return selected;

}


// =====================================================
// FIND STORAGE FOR FILE
// =====================================================

function findStorageForFile(
  requiredBytes,
  options
) {

  const selected =
    selectStorageForAllocation(
      requiredBytes,
      options
    );


  if (!selected) {

    return null;

  }


  return {

    storage:
      selected.storage,

    storageId:
      selected.storageId,

    availableBytes:
      selected.availableBytes,

    usagePercent:
      selected.usagePercent,

    requiredBytes:
      selected.requiredBytes

  };

}


// =====================================================
// GET STORAGE NODES
// =====================================================

function getAvailableStorageNodes(
  storageId,
  requiredBytes
) {

  requiredBytes =
    normalizeAllocationBytes(
      requiredBytes
    );


  if (
    !storageId
  ) {

    throw new Error(
      "Storage ID is required"
    );

  }


  if (
    typeof getStorageNodesByStorageId !==
    "function"
  ) {

    throw new Error(
      "Storage node lookup is unavailable"
    );

  }


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  const available = [];


  nodes.forEach(
    function(node) {

      const totalBytes =
        normalizeAllocationBytes(
          node.totalBytes
        );


      const usedBytes =
        normalizeAllocationBytes(
          node.usedBytes
        );


      const availableBytes =
        calculateStorageAvailable(
          totalBytes,
          usedBytes
        );


      const active =
        String(
          node.status ||
          ""
        ).toLowerCase() ===
        "active";


      if (
        !active
      ) {

        return;

      }


      if (
        totalBytes > 0 &&
        availableBytes <
        requiredBytes
      ) {

        return;

      }


      available.push({

        node:
          node,

        nodeId:
          node.id,

        storageId:
          storageId,

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
          )

      });

    }
  );


  return available;

}


// =====================================================
// SORT NODES
// =====================================================

function sortStorageNodes(
  nodes,
  strategy
) {

  const copy =
    nodes.slice();


  if (
    strategy ===
    STORAGE_ALLOCATION_STRATEGIES
      .MOST_AVAILABLE
  ) {

    return copy.sort(
      function(a, b) {

        return (
          b.availableBytes -
          a.availableBytes
        );

      }
    );

  }


  return copy.sort(
    function(a, b) {

      return (
        a.usagePercent -
        b.usagePercent
      );

    }
  );

}


// =====================================================
// SELECT STORAGE NODE
// =====================================================

function selectStorageNode(
  storageId,
  requiredBytes,
  options
) {

  options =
    options || {};


  const nodes =
    getAvailableStorageNodes(
      storageId,
      requiredBytes
    );


  if (
    nodes.length === 0
  ) {

    return null;

  }


  const sorted =
    sortStorageNodes(
      nodes,
      options.strategy
    );


  const selected =
    sorted[0];


  return {

    node:
      selected.node,

    nodeId:
      selected.nodeId,

    storageId:
      storageId,

    availableBytes:
      selected.availableBytes,

    usagePercent:
      selected.usagePercent,

    requiredBytes:
      normalizeAllocationBytes(
        requiredBytes
      )

  };

}


// =====================================================
// FIND STORAGE NODE FOR FILE
// =====================================================

function findStorageNodeForFile(
  requiredBytes,
  storageId,
  options
) {

  if (
    !storageId
  ) {

    const storage =
      findStorageForFile(
        requiredBytes,
        options
      );


    if (!storage) {

      return null;

    }


    storageId =
      storage.storageId;

  }


  return selectStorageNode(
    storageId,
    requiredBytes,
    options
  );

}


// =====================================================
// FULL STORAGE FAILOVER
// =====================================================

function allocateWithFailover(
  requiredBytes,
  options
) {

  requiredBytes =
    normalizeAllocationBytes(
      requiredBytes
    );


  options =
    options || {};


  const candidates =
    getStorageAllocationCandidates(
      requiredBytes,
      options
    );


  if (
    candidates.length === 0
  ) {

    return {

      success:
        false,

      status:
        STORAGE_ALLOCATION_STATUS.FULL,

      storage:
        null,

      node:
        null,

      candidates:
        []

    };

  }


  const sorted =
    sortStorageAllocationCandidates(
      candidates,
      options.strategy
    );


  for (
    let i = 0;
    i < sorted.length;
    i++
  ) {

    const candidate =
      sorted[i];


    try {

      const node =
        selectStorageNode(
          candidate.storageId,
          requiredBytes,
          options
        );


      if (
        node
      ) {

        return {

          success:
            true,

          status:
            STORAGE_ALLOCATION_STATUS.SELECTED,

          storage:
            candidate.storage,

          storageId:
            candidate.storageId,

          node:
            node.node,

          nodeId:
            node.nodeId,

          availableBytes:
            node.availableBytes,

          attempts:
            i + 1

        };

      }

    }
    catch (error) {

      // Try next storage location.

    }

  }


  return {

    success:
      false,

    status:
      STORAGE_ALLOCATION_STATUS.UNAVAILABLE,

    storage:
      null,

    node:
      null,

    candidates:
      sorted

  };

}


// =====================================================
// GET ALL AVAILABLE STORAGE
// =====================================================

function getAllAvailableStorage(
  requiredBytes
) {

  return getStorageAllocationCandidates(
    requiredBytes
  );

}


// =====================================================
// CHECK ALLOCATION
// =====================================================

function checkStorageAllocation(
  requiredBytes,
  options
) {

  const candidates =
    getStorageAllocationCandidates(
      requiredBytes,
      options
    );


  const selected =
    selectStorageForAllocation(
      requiredBytes,
      options
    );


  return {

    allowed:
      selected !== null,

    requiredBytes:
      normalizeAllocationBytes(
        requiredBytes
      ),

    candidateCount:
      candidates.length,

    selectedStorageId:
      selected
        ? selected.storageId
        : null,

    selectedStorageName:
      selected
        ? selected.name
        : null,

    candidates:
      candidates

  };

}


// =====================================================
// ALLOCATION PLAN
// =====================================================

function createStorageAllocationPlan(
  requiredBytes,
  options
) {

  options =
    options || {};


  const candidates =
    getStorageAllocationCandidates(
      requiredBytes,
      options
    );


  const sorted =
    sortStorageAllocationCandidates(
      candidates,
      options.strategy
    );


  return {

    requiredBytes:
      normalizeAllocationBytes(
        requiredBytes
      ),

    strategy:
      options.strategy ||
      getStorageAllocationStrategy(),

    candidateCount:
      sorted.length,

    candidates:
      sorted.map(
        function(candidate) {

          return {

            storageId:
              candidate.storageId,

            name:
              candidate.name,

            totalBytes:
              candidate.totalBytes,

            usedBytes:
              candidate.usedBytes,

            availableBytes:
              candidate.availableBytes,

            usagePercent:
              candidate.usagePercent,

            score:
              calculateStorageAllocationScore(
                candidate
              )

          };

        }
      )

  };

}


// =====================================================
// GET STORAGE FAILOVER ORDER
// =====================================================

function getStorageFailoverOrder(
  requiredBytes,
  options
) {

  options =
    options || {};


  const candidates =
    getStorageAllocationCandidates(
      requiredBytes,
      options
    );


  const sorted =
    sortStorageAllocationCandidates(
      candidates,
      options.strategy
    );


  return sorted.map(
    function(candidate) {

      return {

        storageId:
          candidate.storageId,

        name:
          candidate.name,

        availableBytes:
          candidate.availableBytes,

        usagePercent:
          candidate.usagePercent

      };

    }
  );

}


// =====================================================
// RESERVE CAPACITY
// =====================================================

function reserveStorageCapacity(
  storageId,
  bytes
) {

  bytes =
    normalizeAllocationBytes(
      bytes
    );


  if (
    bytes <= 0
  ) {

    throw new Error(
      "Reservation size must be greater than zero"
    );

  }


  const check =
    checkStorageUploadQuota(
      storageId,
      bytes
    );


  if (
    !check.allowed
  ) {

    throw new Error(
      check.reason ||
      "Storage capacity unavailable"
    );

  }


  /*
   * Capacity reservation should normally be
   * persisted in a dedicated reservation table.
   *
   * This function returns a reservation object.
   */

  return {

    reservationId:
      "RES-" +
      Utilities.getUuid()
        .substring(0, 12)
        .toUpperCase(),

    storageId:
      storageId,

    bytes:
      bytes,

    status:
      "Reserved",

    createdAt:
      new Date()

  };

}


// =====================================================
// RELEASE CAPACITY RESERVATION
// =====================================================

function releaseStorageCapacityReservation(
  reservation
) {

  if (!reservation) {

    throw new Error(
      "Reservation is required"
    );

  }


  return {

    reservationId:
      reservation.reservationId ||
      null,

    storageId:
      reservation.storageId ||
      null,

    bytes:
      normalizeAllocationBytes(
        reservation.bytes
      ),

    status:
      "Released",

    releasedAt:
      new Date()

  };

}


// =====================================================
// STORAGE ALLOCATION SUMMARY
// =====================================================

function getStorageAllocationSummary(
  requiredBytes
) {

  const candidates =
    getStorageAllocationCandidates(
      requiredBytes
    );


  const selected =
    selectStorageForAllocation(
      requiredBytes
    );


  return {

    requiredBytes:
      normalizeAllocationBytes(
        requiredBytes
      ),

    available:
      candidates.length > 0,

    candidateCount:
      candidates.length,

    selectedStorageId:
      selected
        ? selected.storageId
        : null,

    selectedStorageName:
      selected
        ? selected.name
        : null,

    selectedAvailableBytes:
      selected
        ? selected.availableBytes
        : 0

  };

}


// =====================================================
// ALLOCATION CONFIGURATION
// =====================================================

function getStorageAllocationConfig() {

  return {

    strategies:
      STORAGE_ALLOCATION_STRATEGIES,

    statuses:
      STORAGE_ALLOCATION_STATUS,

    defaultStrategy:
      getStorageAllocationStrategy(),

    failover:
      true,

    multiStorage:
      true,

    multiNode:
      true,

    quotaChecking:
      true,

    capacityChecking:
      true,

    automaticSelection:
      true

  };

}