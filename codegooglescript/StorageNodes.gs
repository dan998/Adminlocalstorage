// =====================================================
// STORAGENODES.GS
// Storage Node Management
// Cloud Project Platform
// =====================================================


// =====================================================
// STORAGE NODE COLUMNS
// =====================================================

const STORAGE_NODE_COLUMNS = {

  ID: 1,

  STORAGE_ID: 2,

  NAME: 3,

  PROVIDER: 4,

  ACCOUNT_ID: 5,

  DRIVE_ID: 6,

  ROOT_FOLDER_ID: 7,

  TYPE: 8,

  STATUS: 9,

  TOTAL_BYTES: 10,

  USED_BYTES: 11,

  AVAILABLE_BYTES: 12,

  MAX_FILE_SIZE: 13,

  PRIORITY: 14,

  ALLOCATION_WEIGHT: 15,

  FILE_COUNT: 16,

  LAST_HEALTH_CHECK: 17,

  LAST_ERROR: 18,

  CREATED_BY: 19,

  CREATED_AT: 20,

  UPDATED_AT: 21

};


// =====================================================
// STORAGE NODE TYPES
// =====================================================

const STORAGE_NODE_TYPES = {

  GOOGLE_DRIVE:
    "Google Drive",

  GOOGLE_CLOUD:
    "Google Cloud",

  LOCAL:
    "Local",

  EXTERNAL:
    "External",

  CUSTOM:
    "Custom"

};


// =====================================================
// STORAGE NODE STATUS
// =====================================================

const STORAGE_NODE_STATUS = {

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  FULL:
    "Full",

  MAINTENANCE:
    "Maintenance",

  DISABLED:
    "Disabled",

  ERROR:
    "Error",

  UNAUTHORIZED:
    "Unauthorized"

};


// =====================================================
// STORAGE NODE DEFAULTS
// =====================================================

const STORAGE_NODE_DEFAULTS = {

  TYPE:
    STORAGE_NODE_TYPES.GOOGLE_DRIVE,

  STATUS:
    STORAGE_NODE_STATUS.ACTIVE,

  TOTAL_BYTES:
    0,

  USED_BYTES:
    0,

  AVAILABLE_BYTES:
    0,

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  PRIORITY:
    100,

  ALLOCATION_WEIGHT:
    1,

  FILE_COUNT:
    0

};


// =====================================================
// STORAGE NODE LIMITS
// =====================================================

const STORAGE_NODE_LIMITS = {

  MAX_NAME_LENGTH:
    100,

  MAX_ACCOUNT_ID_LENGTH:
    200,

  MAX_DRIVE_ID_LENGTH:
    200,

  MAX_FOLDER_ID_LENGTH:
    200,

  MAX_ERROR_LENGTH:
    500,

  MAX_NODES_PER_STORAGE:
    1000

};


// =====================================================
// GET STORAGE NODE SHEET
// =====================================================

function getStorageNodesSheet() {

  return getSheet(
    SHEETS.STORAGE_NODES
  );

}


// =====================================================
// GENERATE NODE ID
// =====================================================

function generateStorageNodeId() {

  if (
    typeof generateID ===
    "function" &&
    typeof ID_PREFIXES !==
    "undefined" &&
    ID_PREFIXES.STORAGE_NODE
  ) {

    return generateID(
      ID_PREFIXES.STORAGE_NODE
    );

  }


  return (
    "NODE-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// BUILD STORAGE NODE
// =====================================================

function buildStorageNodeRecord(
  data
) {

  data =
    data || {};


  const now =
    new Date();


  const totalBytes =
    normalizeStorageNodeBytes(
      data.totalBytes,
      STORAGE_NODE_DEFAULTS.TOTAL_BYTES
    );


  const usedBytes =
    normalizeStorageNodeBytes(
      data.usedBytes,
      STORAGE_NODE_DEFAULTS.USED_BYTES
    );


  return {

    id:
      data.id ||
      generateStorageNodeId(),

    storageId:
      data.storageId ||
      "",

    name:
      normalizeStorageNodeName(
        data.name
      ),

    provider:
      data.provider ||
      STORAGE_NODE_DEFAULTS.TYPE,

    accountId:
      String(
        data.accountId ||
        ""
      )
        .trim()
        .substring(
          0,
          STORAGE_NODE_LIMITS
            .MAX_ACCOUNT_ID_LENGTH
        ),

    driveId:
      String(
        data.driveId ||
        ""
      )
        .trim()
        .substring(
          0,
          STORAGE_NODE_LIMITS
            .MAX_DRIVE_ID_LENGTH
        ),

    rootFolderId:
      String(
        data.rootFolderId ||
        ""
      )
        .trim()
        .substring(
          0,
          STORAGE_NODE_LIMITS
            .MAX_FOLDER_ID_LENGTH
        ),

    type:
      data.type ||
      STORAGE_NODE_DEFAULTS.TYPE,

    status:
      data.status ||
      STORAGE_NODE_DEFAULTS.STATUS,

    totalBytes:
      totalBytes,

    usedBytes:
      Math.min(
        usedBytes,
        totalBytes
      ),

    availableBytes:
      calculateStorageNodeAvailable(
        totalBytes,
        usedBytes
      ),

    maxFileSize:
      normalizeStorageNodeBytes(
        data.maxFileSize,
        STORAGE_NODE_DEFAULTS.MAX_FILE_SIZE
      ),

    priority:
      normalizeStorageNodeNumber(
        data.priority,
        STORAGE_NODE_DEFAULTS.PRIORITY
      ),

    allocationWeight:
      normalizeStorageNodeNumber(
        data.allocationWeight,
        STORAGE_NODE_DEFAULTS.ALLOCATION_WEIGHT
      ),

    fileCount:
      normalizeStorageNodeNumber(
        data.fileCount,
        STORAGE_NODE_DEFAULTS.FILE_COUNT
      ),

    lastHealthCheck:
      data.lastHealthCheck ||
      "",

    lastError:
      String(
        data.lastError ||
        ""
      )
        .substring(
          0,
          STORAGE_NODE_LIMITS
            .MAX_ERROR_LENGTH
        ),

    createdBy:
      data.createdBy ||
      "",

    createdAt:
      data.createdAt ||
      now,

    updatedAt:
      data.updatedAt ||
      now

  };

}


// =====================================================
// NORMALIZE NODE NAME
// =====================================================

function normalizeStorageNodeName(
  name
) {

  const value =
    String(
      name ||
      "Storage Node"
    )
      .trim();


  return value.substring(
    0,
    STORAGE_NODE_LIMITS
      .MAX_NAME_LENGTH
  );

}


// =====================================================
// NORMALIZE NODE BYTES
// =====================================================

function normalizeStorageNodeBytes(
  value,
  fallback
) {

  const number =
    Number(
      value
    );


  if (
    !isFinite(number) ||
    number < 0
  ) {

    return Number(
      fallback ||
      0
    );

  }


  return Math.floor(
    number
  );

}


// =====================================================
// NORMALIZE NODE NUMBER
// =====================================================

function normalizeStorageNodeNumber(
  value,
  fallback
) {

  const number =
    Number(
      value
    );


  if (
    !isFinite(number) ||
    number < 0
  ) {

    return Number(
      fallback ||
      0
    );

  }


  return Math.floor(
    number
  );

}


// =====================================================
// CALCULATE NODE AVAILABLE STORAGE
// =====================================================

function calculateStorageNodeAvailable(
  totalBytes,
  usedBytes
) {

  totalBytes =
    normalizeStorageNodeBytes(
      totalBytes,
      0
    );


  usedBytes =
    normalizeStorageNodeBytes(
      usedBytes,
      0
    );


  return Math.max(
    0,
    totalBytes -
    usedBytes
  );

}


// =====================================================
// CONVERT NODE OBJECT TO SHEET ROW
// =====================================================

function storageNodeObjectToRow(
  node
) {

  if (
    !node
  ) {

    throw new Error(
      "Storage node is required"
    );

  }


  return [

    node.id || "",

    node.storageId || "",

    node.name || "",

    node.provider || "",

    node.accountId || "",

    node.driveId || "",

    node.rootFolderId || "",

    node.type || "",

    node.status || "",

    Number(
      node.totalBytes || 0
    ),

    Number(
      node.usedBytes || 0
    ),

    calculateStorageNodeAvailable(
      node.totalBytes,
      node.usedBytes
    ),

    Number(
      node.maxFileSize || 0
    ),

    Number(
      node.priority || 0
    ),

    Number(
      node.allocationWeight || 1
    ),

    Number(
      node.fileCount || 0
    ),

    node.lastHealthCheck || "",

    node.lastError || "",

    node.createdBy || "",

    node.createdAt || "",

    node.updatedAt || ""

  ];

}


// =====================================================
// CONVERT SHEET ROW TO NODE OBJECT
// =====================================================

function storageNodeRowToObject(
  row,
  rowNumber
) {

  if (
    !row
  ) {

    return null;

  }


  const totalBytes =
    Number(
      row[
        STORAGE_NODE_COLUMNS
          .TOTAL_BYTES - 1
      ] || 0
    );


  const usedBytes =
    Number(
      row[
        STORAGE_NODE_COLUMNS
          .USED_BYTES - 1
      ] || 0
    );


  return {

    row:
      rowNumber || null,

    id:
      row[
        STORAGE_NODE_COLUMNS.ID - 1
      ] || "",

    storageId:
      row[
        STORAGE_NODE_COLUMNS.STORAGE_ID - 1
      ] || "",

    name:
      row[
        STORAGE_NODE_COLUMNS.NAME - 1
      ] || "",

    provider:
      row[
        STORAGE_NODE_COLUMNS.PROVIDER - 1
      ] || "",

    accountId:
      row[
        STORAGE_NODE_COLUMNS.ACCOUNT_ID - 1
      ] || "",

    driveId:
      row[
        STORAGE_NODE_COLUMNS.DRIVE_ID - 1
      ] || "",

    rootFolderId:
      row[
        STORAGE_NODE_COLUMNS.ROOT_FOLDER_ID - 1
      ] || "",

    type:
      row[
        STORAGE_NODE_COLUMNS.TYPE - 1
      ] || "",

    status:
      row[
        STORAGE_NODE_COLUMNS.STATUS - 1
      ] || "",

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageNodeAvailable(
        totalBytes,
        usedBytes
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_NODE_COLUMNS
            .MAX_FILE_SIZE - 1
        ] ||
        STORAGE_NODE_DEFAULTS
          .MAX_FILE_SIZE
      ),

    priority:
      Number(
        row[
          STORAGE_NODE_COLUMNS
            .PRIORITY - 1
        ] ||
        STORAGE_NODE_DEFAULTS
          .PRIORITY
      ),

    allocationWeight:
      Number(
        row[
          STORAGE_NODE_COLUMNS
            .ALLOCATION_WEIGHT - 1
        ] ||
        STORAGE_NODE_DEFAULTS
          .ALLOCATION_WEIGHT
      ),

    fileCount:
      Number(
        row[
          STORAGE_NODE_COLUMNS
            .FILE_COUNT - 1
        ] || 0
      ),

    lastHealthCheck:
      row[
        STORAGE_NODE_COLUMNS
          .LAST_HEALTH_CHECK - 1
      ] || "",

    lastError:
      row[
        STORAGE_NODE_COLUMNS
          .LAST_ERROR - 1
      ] || "",

    createdBy:
      row[
        STORAGE_NODE_COLUMNS
          .CREATED_BY - 1
      ] || "",

    createdAt:
      row[
        STORAGE_NODE_COLUMNS
          .CREATED_AT - 1
      ] || "",

    updatedAt:
      row[
        STORAGE_NODE_COLUMNS
          .UPDATED_AT - 1
      ] || ""

  };

}


// =====================================================
// FIND NODE BY ID
// =====================================================

function findStorageNodeById(
  nodeId
) {

  if (
    !nodeId
  ) {

    return null;

  }


  const sheet =
    getStorageNodesSheet();


  const values =
    sheet
      .getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(
        values[i][
          STORAGE_NODE_COLUMNS.ID - 1
        ] || ""
      ) ===
      String(
        nodeId
      )
    ) {

      return storageNodeRowToObject(
        values[i],
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// FIND NODE BY NAME
// =====================================================

function findStorageNodeByName(
  storageId,
  name
) {

  if (
    !storageId ||
    !name
  ) {

    return null;

  }


  const target =
    String(
      name
    )
      .trim()
      .toLowerCase();


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  for (
    let i = 0;
    i < nodes.length;
    i++
  ) {

    if (
      String(
        nodes[i].name
      )
        .trim()
        .toLowerCase() ===
      target
    ) {

      return nodes[i];

    }

  }


  return null;

}


// =====================================================
// GET ALL STORAGE NODES
// =====================================================

function getAllStorageNodes() {

  const sheet =
    getStorageNodesSheet();


  const values =
    sheet
      .getDataRange()
      .getValues();


  const nodes = [];


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      !values[i][
        STORAGE_NODE_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }


    nodes.push(
      storageNodeRowToObject(
        values[i],
        i + 1
      )
    );

  }


  return nodes;

}


// =====================================================
// GET NODES BY STORAGE
// =====================================================

function getStorageNodesByStorageId(
  storageId
) {

  if (
    !storageId
  ) {

    return [];

  }


  return getAllStorageNodes()
    .filter(
      function(node) {

        return String(
          node.storageId
        ) ===
        String(
          storageId
        );

      }
    );

}


// =====================================================
// GET ACTIVE NODES
// =====================================================

function getActiveStorageNodes(
  storageId
) {

  let nodes =
    getAllStorageNodes();


  if (
    storageId
  ) {

    nodes =
      nodes.filter(
        function(node) {

          return String(
            node.storageId
          ) ===
          String(
            storageId
          );

        }
      );

  }


  return nodes.filter(
    function(node) {

      return (
        String(
          node.status
        ).toLowerCase() ===
        String(
          STORAGE_NODE_STATUS.ACTIVE
        ).toLowerCase()
      );

    }
  );

}


// =====================================================
// GET AVAILABLE NODES
// =====================================================

function getAvailableStorageNodes(
  requiredBytes,
  storageId
) {

  requiredBytes =
    normalizeStorageNodeBytes(
      requiredBytes,
      0
    );


  return getActiveStorageNodes(
    storageId
  )
    .filter(
      function(node) {

        return (
          node.availableBytes >=
          requiredBytes
        );

      }
    );

}


// =====================================================
// CHECK NODE CAPACITY
// =====================================================

function hasStorageNodeCapacity(
  node,
  requiredBytes
) {

  if (
    !node
  ) {

    return false;

  }


  requiredBytes =
    normalizeStorageNodeBytes(
      requiredBytes,
      0
    );


  return (
    calculateStorageNodeAvailable(
      node.totalBytes,
      node.usedBytes
    ) >=
    requiredBytes
  );

}


// =====================================================
// CHECK NODE FILE SIZE
// =====================================================

function isStorageNodeFileSizeAllowed(
  node,
  fileSize
) {

  if (
    !node
  ) {

    return false;

  }


  fileSize =
    normalizeStorageNodeBytes(
      fileSize,
      0
    );


  const maxFileSize =
    Number(
      node.maxFileSize || 0
    );


  if (
    maxFileSize <= 0
  ) {

    return true;

  }


  return (
    fileSize <=
    maxFileSize
  );

}


// =====================================================
// GET NODE USAGE PERCENT
// =====================================================

function getStorageNodeUsagePercent(
  node
) {

  if (
    !node
  ) {

    return 0;

  }


  const total =
    Number(
      node.totalBytes || 0
    );


  const used =
    Number(
      node.usedBytes || 0
    );


  if (
    total <= 0
  ) {

    return 0;

  }


  return Math.min(
    100,
    Math.max(
      0,
      (
        used /
        total
      ) * 100
    )
  );

}


// =====================================================
// GET BEST AVAILABLE NODE
// =====================================================

function getBestAvailableStorageNode(
  requiredBytes,
  storageId
) {

  const nodes =
    getAvailableStorageNodes(
      requiredBytes,
      storageId
    );


  if (
    nodes.length === 0
  ) {

    return null;

  }


  nodes.sort(
    function(a, b) {

      // Higher priority first.
      if (
        b.priority !==
        a.priority
      ) {

        return (
          b.priority -
          a.priority
        );

      }


      // More available storage next.
      if (
        b.availableBytes !==
        a.availableBytes
      ) {

        return (
          b.availableBytes -
          a.availableBytes
        );

      }


      // Higher allocation weight last.
      return (
        b.allocationWeight -
        a.allocationWeight
      );

    }
  );


  return nodes[0];

}


// =====================================================
// GET LEAST USED NODE
// =====================================================

function getLeastUsedStorageNode(
  requiredBytes,
  storageId
) {

  const nodes =
    getAvailableStorageNodes(
      requiredBytes,
      storageId
    );


  if (
    nodes.length === 0
  ) {

    return null;

  }


  nodes.sort(
    function(a, b) {

      return (
        getStorageNodeUsagePercent(a) -
        getStorageNodeUsagePercent(b)
      );

    }
  );


  return nodes[0];

}


// =====================================================
// GET MOST AVAILABLE NODE
// =====================================================

function getMostAvailableStorageNode(
  requiredBytes,
  storageId
) {

  const nodes =
    getAvailableStorageNodes(
      requiredBytes,
      storageId
    );


  if (
    nodes.length === 0
  ) {

    return null;

  }


  nodes.sort(
    function(a, b) {

      return (
        b.availableBytes -
        a.availableBytes
      );

    }
  );


  return nodes[0];

}


// =====================================================
// CHECK NODE USABLE
// =====================================================

function isStorageNodeUsable(
  node,
  requiredBytes
) {

  if (
    !node
  ) {

    return false;

  }


  if (
    node.status !==
    STORAGE_NODE_STATUS.ACTIVE
  ) {

    return false;

  }


  if (
    !hasStorageNodeCapacity(
      node,
      requiredBytes
    )
  ) {

    return false;

  }


  if (
    !isStorageNodeFileSizeAllowed(
      node,
      requiredBytes
    )
  ) {

    return false;

  }


  return true;

}


// =====================================================
// UPDATE NODE COUNTS
// =====================================================

function calculateStorageNodeCounts(
  nodeId
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (
    !node
  ) {

    return null;

  }


  return {

    nodeId:
      node.id,

    fileCount:
      Number(
        node.fileCount || 0
      ),

    usedBytes:
      Number(
        node.usedBytes || 0
      ),

    availableBytes:
      calculateStorageNodeAvailable(
        node.totalBytes,
        node.usedBytes
      )

  };

}


// =====================================================
// VALIDATE STORAGE NODE
// =====================================================

function validateStorageNode(
  node
) {

  const errors = [];


  if (
    !node
  ) {

    return {

      valid:
        false,

      errors: [
        "Storage node is required"
      ],

      error:
        "Storage node is required"

    };

  }


  if (
    !node.id
  ) {

    errors.push(
      "Node ID is required"
    );

  }


  if (
    !node.storageId
  ) {

    errors.push(
      "Storage ID is required"
    );

  }


  if (
    !node.name
  ) {

    errors.push(
      "Node name is required"
    );

  }


  if (
    !Object
      .values(
        STORAGE_NODE_TYPES
      )
      .includes(
        node.type
      )
  ) {

    errors.push(
      "Invalid node type"
    );

  }


  if (
    !Object
      .values(
        STORAGE_NODE_STATUS
      )
      .includes(
        node.status
      )
  ) {

    errors.push(
      "Invalid node status"
    );

  }


  const total =
    Number(
      node.totalBytes || 0
    );


  const used =
    Number(
      node.usedBytes || 0
    );


  if (
    total < 0
  ) {

    errors.push(
      "Total bytes cannot be negative"
    );

  }


  if (
    used < 0
  ) {

    errors.push(
      "Used bytes cannot be negative"
    );

  }


  if (
    used > total
  ) {

    errors.push(
      "Used bytes cannot exceed total bytes"
    );

  }


  if (
    Number(
      node.priority || 0
    ) < 0
  ) {

    errors.push(
      "Priority cannot be negative"
    );

  }


  if (
    Number(
      node.allocationWeight || 0
    ) < 0
  ) {

    errors.push(
      "Allocation weight cannot be negative"
    );

  }


  return {

    valid:
      errors.length === 0,

    errors:
      errors,

    error:
      errors.length
        ? errors[0]
        : null

  };

}


// =====================================================
// GET NODE SUMMARY
// =====================================================

function getStorageNodeSummary(
  storageId
) {

  const nodes =
    storageId
      ? getStorageNodesByStorageId(
          storageId
        )
      : getAllStorageNodes();


  let totalBytes =
    0;


  let usedBytes =
    0;


  let fileCount =
    0;


  let active =
    0;


  let full =
    0;


  let errors =
    0;


  nodes.forEach(
    function(node) {

      totalBytes +=
        Number(
          node.totalBytes || 0
        );


      usedBytes +=
        Number(
          node.usedBytes || 0
        );


      fileCount +=
        Number(
          node.fileCount || 0
        );


      if (
        node.status ===
        STORAGE_NODE_STATUS.ACTIVE
      ) {

        active++;

      }


      if (
        node.status ===
        STORAGE_NODE_STATUS.FULL
      ) {

        full++;

      }


      if (
        node.status ===
        STORAGE_NODE_STATUS.ERROR
      ) {

        errors++;

      }

    }
  );


  return {

    storageId:
      storageId || "",

    nodeCount:
      nodes.length,

    activeNodes:
      active,

    fullNodes:
      full,

    errorNodes:
      errors,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageNodeAvailable(
        totalBytes,
        usedBytes
      ),

    fileCount:
      fileCount

  };

}


// =====================================================
// GET NODE HEALTH INFORMATION
// =====================================================

function getStorageNodeHealthInfo(
  nodeId
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (
    !node
  ) {

    return {

      healthy:
        false,

      status:
        STORAGE_NODE_STATUS.ERROR,

      error:
        "Storage node not found"

    };

  }


  return {

    healthy:
      node.status ===
      STORAGE_NODE_STATUS.ACTIVE,

    nodeId:
      node.id,

    name:
      node.name,

    provider:
      node.provider,

    status:
      node.status,

    availableBytes:
      node.availableBytes,

    usagePercent:
      getStorageNodeUsagePercent(
        node
      ),

    lastHealthCheck:
      node.lastHealthCheck,

    lastError:
      node.lastError

  };

}