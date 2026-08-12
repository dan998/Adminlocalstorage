// =====================================================
// STORAGEUPDATE.GS
// Storage Update Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// UPDATE STORAGE
// =====================================================

function updateStorage(
  storageId,
  data
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }

  data =
    data || {};


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  const updated =
    Object.assign(
      {},
      storage,
      data,
      {
        id:
          storage.id,

        updatedAt:
          new Date()
      }
    );


  validateStorageUpdate(
    storage,
    updated
  );


  if (
    data.name &&
    String(
      data.name
    )
      .trim()
      .toLowerCase() !==
    String(
      storage.name
    )
      .trim()
      .toLowerCase()
  ) {

    const duplicate =
      findStorageByName(
        data.name
      );


    if (
      duplicate &&
      String(
        duplicate.id
      ) !==
      String(
        storage.id
      )
    ) {

      throw new Error(
        "Another storage already uses this name"
      );

    }

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  const row =
    storage.row;


  sheet
    .getRange(
      row,
      STORAGE_COLUMNS.ID,
      1,
      14
    )
    .setValues([

      [

        storage.id,

        updated.name,

        updated.type,

        updated.status,

        updated.description,

        Number(
          updated.totalBytes || 0
        ),

        Number(
          updated.usedBytes || 0
        ),

        calculateStorageAvailable(
          updated.totalBytes,
          updated.usedBytes
        ),

        Number(
          updated.maxFileSize || 0
        ),

        Number(
          updated.roomCount || 0
        ),

        Number(
          updated.nodeCount || 0
        ),

        updated.createdBy || "",

        updated.createdAt || "",

        updated.updatedAt

      ]

    ]);


  return findStorageById(
    storageId
  );

}


// =====================================================
// UPDATE STORAGE NAME
// =====================================================

function updateStorageName(
  storageId,
  name
) {

  if (!name) {

    throw new Error(
      "Storage name is required"
    );

  }


  return updateStorage(
    storageId,
    {
      name:
        String(
          name
        ).trim()
    }
  );

}


// =====================================================
// UPDATE STORAGE DESCRIPTION
// =====================================================

function updateStorageDescription(
  storageId,
  description
) {

  description =
    String(
      description ||
      ""
    ).trim();


  if (
    description.length >
    STORAGE_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {

    throw new Error(
      "Storage description is too long"
    );

  }


  return updateStorage(
    storageId,
    {
      description:
        description
    }
  );

}


// =====================================================
// UPDATE STORAGE TYPE
// =====================================================

function updateStorageType(
  storageId,
  type
) {

  if (!type) {

    throw new Error(
      "Storage type is required"
    );

  }


  return updateStorage(
    storageId,
    {
      type:
        type
    }
  );

}


// =====================================================
// UPDATE STORAGE STATUS
// =====================================================

function updateStorageStatus(
  storageId,
  status
) {

  if (!status) {

    throw new Error(
      "Storage status is required"
    );

  }


  if (
    typeof STORAGE_STATUS !==
    "undefined"
  ) {

    const valid =
      Object.values(
        STORAGE_STATUS
      ).includes(
        status
      );


    if (!valid) {

      throw new Error(
        "Invalid storage status"
      );

    }

  }


  return updateStorage(
    storageId,
    {
      status:
        status
    }
  );

}


// =====================================================
// ENABLE STORAGE
// =====================================================

function enableStorage(
  storageId
) {

  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.ACTIVE
  );

}


// =====================================================
// DISABLE STORAGE
// =====================================================

function disableStorage(
  storageId
) {

  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.DISABLED
  );

}


// =====================================================
// MARK STORAGE FULL
// =====================================================

function markStorageFull(
  storageId
) {

  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.FULL
  );

}


// =====================================================
// UPDATE STORAGE CAPACITY
// =====================================================

function updateStorageCapacity(
  storageId,
  totalBytes,
  usedBytes
) {

  totalBytes =
    Number(
      totalBytes || 0
    );


  usedBytes =
    Number(
      usedBytes || 0
    );


  if (
    totalBytes < 0
  ) {

    throw new Error(
      "Total capacity cannot be negative"
    );

  }


  if (
    usedBytes < 0
  ) {

    throw new Error(
      "Used capacity cannot be negative"
    );

  }


  if (
    usedBytes >
    totalBytes
  ) {

    throw new Error(
      "Used capacity cannot exceed total capacity"
    );

  }


  return updateStorage(
    storageId,
    {

      totalBytes:
        totalBytes,

      usedBytes:
        usedBytes,

      availableBytes:
        calculateStorageAvailable(
          totalBytes,
          usedBytes
        )

    }
  );

}


// =====================================================
// UPDATE STORAGE USAGE
// =====================================================

function updateStorageUsage(
  storageId,
  usedBytes
) {

  const storage =
    getStorage(
      storageId
    );


  usedBytes =
    Number(
      usedBytes || 0
    );


  if (
    usedBytes < 0
  ) {

    throw new Error(
      "Used bytes cannot be negative"
    );

  }


  if (
    usedBytes >
    Number(
      storage.totalBytes || 0
    )
  ) {

    throw new Error(
      "Used bytes cannot exceed storage capacity"
    );

  }


  return updateStorageCapacity(
    storageId,
    storage.totalBytes,
    usedBytes
  );

}


// =====================================================
// INCREASE STORAGE USAGE
// =====================================================

function increaseStorageUsage(
  storageId,
  bytes
) {

  const storage =
    getStorage(
      storageId
    );


  bytes =
    Number(
      bytes || 0
    );


  if (
    bytes < 0
  ) {

    throw new Error(
      "Bytes cannot be negative"
    );

  }


  const newUsed =
    Number(
      storage.usedBytes || 0
    ) +
    bytes;


  if (
    newUsed >
    Number(
      storage.totalBytes || 0
    )
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

  const storage =
    getStorage(
      storageId
    );


  bytes =
    Number(
      bytes || 0
    );


  if (
    bytes < 0
  ) {

    throw new Error(
      "Bytes cannot be negative"
    );

  }


  const newUsed =
    Math.max(
      0,
      Number(
        storage.usedBytes || 0
      ) -
      bytes
    );


  return updateStorageUsage(
    storageId,
    newUsed
  );

}


// =====================================================
// RECALCULATE STORAGE COUNTS
// =====================================================

function recalculateStorageCounts(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  const roomCount =
    rooms.length;


  const nodeCount =
    nodes.length;


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet
    .getRange(
      storage.row,
      STORAGE_COLUMNS.ROOM_COUNT
    )
    .setValue(
      roomCount
    );


  sheet
    .getRange(
      storage.row,
      STORAGE_COLUMNS.NODE_COUNT
    )
    .setValue(
      nodeCount
    );


  sheet
    .getRange(
      storage.row,
      STORAGE_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );


  return findStorageById(
    storageId
  );

}


// =====================================================
// RECALCULATE STORAGE CAPACITY FROM NODES
// =====================================================

function recalculateStorageCapacity(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let totalBytes =
    0;


  let usedBytes =
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

    }
  );


  const availableBytes =
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    );


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet
    .getRange(
      storage.row,
      STORAGE_COLUMNS.TOTAL_BYTES,
      1,
      3
    )
    .setValues([

      [

        totalBytes,

        usedBytes,

        availableBytes

      ]

    ]);


  sheet
    .getRange(
      storage.row,
      STORAGE_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );


  return findStorageById(
    storageId
  );

}


// =====================================================
// SYNCHRONIZE STORAGE FROM NODES
// =====================================================

function synchronizeStorage(
  storageId
) {

  recalculateStorageCounts(
    storageId
  );


  recalculateStorageCapacity(
    storageId
  );


  const storage =
    getStorage(
      storageId
    );


  const health =
    getStorageHealth(
      storageId
    );


  let status =
    storage.status;


  if (
    health.health ===
    "Unavailable"
  ) {

    status =
      STORAGE_STATUS.ERROR;

  }
  else if (
    health.health ===
    "Healthy"
  ) {

    if (
      status ===
      STORAGE_STATUS.FULL
    ) {

      status =
        STORAGE_STATUS.ACTIVE;

    }

  }


  if (
    status !==
    storage.status
  ) {

    updateStorageStatus(
      storageId,
      status
    );

  }


  return getStorage(
    storageId
  );

}


// =====================================================
// UPDATE STORAGE FROM NODE
// =====================================================

function updateStorageFromNode(
  storageId,
  nodeId
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (
    !node
  ) {

    throw new Error(
      "Storage node not found"
    );

  }


  if (
    String(
      node.storageId
    ) !==
    String(
      storageId
    )
  ) {

    throw new Error(
      "Node does not belong to storage"
    );

  }


  return synchronizeStorage(
    storageId
  );

}


// =====================================================
// UPDATE STORAGE MAX FILE SIZE
// =====================================================

function updateStorageMaxFileSize(
  storageId,
  maxFileSize
) {

  maxFileSize =
    Number(
      maxFileSize || 0
    );


  if (
    maxFileSize < 0
  ) {

    throw new Error(
      "Maximum file size cannot be negative"
    );

  }


  return updateStorage(
    storageId,
    {
      maxFileSize:
        maxFileSize
    }
  );

}


// =====================================================
// UPDATE STORAGE NODE
// =====================================================

function updateStorageNode(
  nodeId,
  data
) {

  if (!nodeId) {

    throw new Error(
      "Node ID is required"
    );

  }


  data =
    data || {};


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  const updated =
    Object.assign(
      {},
      node,
      data,
      {

        id:
          node.id,

        storageId:
          node.storageId,

        updatedAt:
          new Date()

      }
    );


  const validation =
    validateStorageNode(
      updated
    );


  if (
    !validation.valid
  ) {

    throw new Error(
      validation.error
    );

  }


  const sheet =
    getStorageNodesSheet();


  const row =
    node.row;


  sheet
    .getRange(
      row,
      STORAGE_NODE_COLUMNS.ID,
      1,
      21
    )
    .setValues([

      storageNodeObjectToRow(
        updated
      )

    ]);


  synchronizeStorage(
    node.storageId
  );


  return findStorageNodeById(
    nodeId
  );

}


// =====================================================
// UPDATE NODE STATUS
// =====================================================

function updateStorageNodeStatus(
  nodeId,
  status
) {

  if (
    !Object
      .values(
        STORAGE_NODE_STATUS
      )
      .includes(
        status
      )
  ) {

    throw new Error(
      "Invalid storage node status"
    );

  }


  return updateStorageNode(
    nodeId,
    {
      status:
        status
    }
  );

}


// =====================================================
// ENABLE NODE
// =====================================================

function enableStorageNode(
  nodeId
) {

  return updateStorageNodeStatus(
    nodeId,
    STORAGE_NODE_STATUS.ACTIVE
  );

}


// =====================================================
// DISABLE NODE
// =====================================================

function disableStorageNode(
  nodeId
) {

  return updateStorageNodeStatus(
    nodeId,
    STORAGE_NODE_STATUS.DISABLED
  );

}


// =====================================================
// MARK NODE FULL
// =====================================================

function markStorageNodeFull(
  nodeId
) {

  return updateStorageNodeStatus(
    nodeId,
    STORAGE_NODE_STATUS.FULL
  );

}


// =====================================================
// UPDATE NODE CAPACITY
// =====================================================

function updateStorageNodeCapacity(
  nodeId,
  totalBytes,
  usedBytes
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  totalBytes =
    Number(
      totalBytes || 0
    );


  usedBytes =
    Number(
      usedBytes || 0
    );


  if (
    totalBytes < 0 ||
    usedBytes < 0
  ) {

    throw new Error(
      "Capacity values cannot be negative"
    );

  }


  if (
    usedBytes >
    totalBytes
  ) {

    throw new Error(
      "Used capacity cannot exceed total capacity"
    );

  }


  return updateStorageNode(
    nodeId,
    {

      totalBytes:
        totalBytes,

      usedBytes:
        usedBytes,

      availableBytes:
        calculateStorageNodeAvailable(
          totalBytes,
          usedBytes
        ),

      status:
        usedBytes >= totalBytes &&
        totalBytes > 0
          ? STORAGE_NODE_STATUS.FULL
          : STORAGE_NODE_STATUS.ACTIVE

    }
  );

}


// =====================================================
// INCREASE NODE USAGE
// =====================================================

function increaseStorageNodeUsage(
  nodeId,
  bytes
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  bytes =
    Number(
      bytes || 0
    );


  if (
    bytes < 0
  ) {

    throw new Error(
      "Bytes cannot be negative"
    );

  }


  const newUsed =
    Number(
      node.usedBytes || 0
    ) +
    bytes;


  if (
    newUsed >
    Number(
      node.totalBytes || 0
    )
  ) {

    throw new Error(
      "Storage node capacity exceeded"
    );

  }


  return updateStorageNode(
    nodeId,
    {

      usedBytes:
        newUsed,

      availableBytes:
        calculateStorageNodeAvailable(
          node.totalBytes,
          newUsed
        ),

      status:
        newUsed >=
        node.totalBytes
          ? STORAGE_NODE_STATUS.FULL
          : STORAGE_NODE_STATUS.ACTIVE

    }
  );

}


// =====================================================
// DECREASE NODE USAGE
// =====================================================

function decreaseStorageNodeUsage(
  nodeId,
  bytes
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  bytes =
    Number(
      bytes || 0
    );


  if (
    bytes < 0
  ) {

    throw new Error(
      "Bytes cannot be negative"
    );

  }


  const newUsed =
    Math.max(
      0,
      Number(
        node.usedBytes || 0
      ) -
      bytes
    );


  return updateStorageNode(
    nodeId,
    {

      usedBytes:
        newUsed,

      availableBytes:
        calculateStorageNodeAvailable(
          node.totalBytes,
          newUsed
        ),

      status:
        STORAGE_NODE_STATUS.ACTIVE

    }
  );

}


// =====================================================
// UPDATE NODE HEALTH
// =====================================================

function updateStorageNodeHealth(
  nodeId,
  status,
  errorMessage
) {

  if (
    !nodeId
  ) {

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


  return updateStorageNode(
    nodeId,
    {

      status:
        status ||
        node.status,

      lastHealthCheck:
        new Date(),

      lastError:
        errorMessage ||
        ""

    }
  );

}


// =====================================================
// UPDATE NODE PRIORITY
// =====================================================

function updateStorageNodePriority(
  nodeId,
  priority
) {

  priority =
    Number(
      priority
    );


  if (
    !isFinite(priority) ||
    priority < 0
  ) {

    throw new Error(
      "Invalid node priority"
    );

  }


  return updateStorageNode(
    nodeId,
    {
      priority:
        Math.floor(
          priority
        )
    }
  );

}


// =====================================================
// UPDATE NODE ALLOCATION WEIGHT
// =====================================================

function updateStorageNodeWeight(
  nodeId,
  weight
) {

  weight =
    Number(
      weight
    );


  if (
    !isFinite(weight) ||
    weight < 0
  ) {

    throw new Error(
      "Invalid allocation weight"
    );

  }


  return updateStorageNode(
    nodeId,
    {

      allocationWeight:
        weight

    }
  );

}


// =====================================================
// UPDATE NODE FILE COUNT
// =====================================================

function updateStorageNodeFileCount(
  nodeId,
  fileCount
) {

  fileCount =
    Number(
      fileCount
    );


  if (
    !isFinite(fileCount) ||
    fileCount < 0
  ) {

    throw new Error(
      "Invalid file count"
    );

  }


  return updateStorageNode(
    nodeId,
    {

      fileCount:
        Math.floor(
          fileCount
        )

    }
  );

}


// =====================================================
// VALIDATE STORAGE UPDATE
// =====================================================

function validateStorageUpdate(
  original,
  updated
) {

  if (
    !updated.name
  ) {

    throw new Error(
      "Storage name is required"
    );

  }


  if (
    String(
      updated.name
    ).length >
    STORAGE_LIMITS.MAX_NAME_LENGTH
  ) {

    throw new Error(
      "Storage name is too long"
    );

  }


  if (
    String(
      updated.description ||
      ""
    ).length >
    STORAGE_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {

    throw new Error(
      "Storage description is too long"
    );

  }


  const totalBytes =
    Number(
      updated.totalBytes || 0
    );


  const usedBytes =
    Number(
      updated.usedBytes || 0
    );


  if (
    totalBytes < 0
  ) {

    throw new Error(
      "Total bytes cannot be negative"
    );

  }


  if (
    usedBytes < 0
  ) {

    throw new Error(
      "Used bytes cannot be negative"
    );

  }


  if (
    usedBytes >
    totalBytes
  ) {

    throw new Error(
      "Used bytes cannot exceed total bytes"
    );

  }


  if (
    typeof STORAGE_STATUS !==
    "undefined"
  ) {

    if (
      !Object
        .values(
          STORAGE_STATUS
        )
        .includes(
          updated.status
        )
    ) {

      throw new Error(
        "Invalid storage status"
      );

    }

  }


  return true;

}