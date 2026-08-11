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

  ROOM_ID: 3,

  NAME: 4,

  TYPE: 5,

  STATUS: 6,

  PROVIDER: 7,

  ACCOUNT_EMAIL: 8,

  DRIVE_ID: 9,

  ROOT_FOLDER_ID: 10,

  TOTAL_BYTES: 11,

  USED_BYTES: 12,

  AVAILABLE_BYTES: 13,

  MAX_FILE_SIZE: 14,

  PRIORITY: 15,

  WEIGHT: 16,

  LAST_HEALTH_CHECK: 17,

  LAST_ERROR: 18,

  CREATED_BY: 19,

  CREATED_AT: 20,

  UPDATED_AT: 21

};


// =====================================================
// NODE TYPES
// =====================================================

const STORAGE_NODE_TYPES = Object.freeze({

  GOOGLE_DRIVE:
    "GoogleDrive",

  GOOGLE_SHARED_DRIVE:
    "GoogleSharedDrive",

  EXTERNAL:
    "External",

  LOCAL:
    "Local"

});


// =====================================================
// NODE STATUS
// =====================================================

const STORAGE_NODE_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  FULL:
    "Full",

  ERROR:
    "Error",

  MAINTENANCE:
    "Maintenance",

  DISABLED:
    "Disabled"

});


// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_STORAGE_NODE_TYPE =
  STORAGE_NODE_TYPES.GOOGLE_DRIVE;


const DEFAULT_STORAGE_NODE_STATUS =
  STORAGE_NODE_STATUS.ACTIVE;


const DEFAULT_STORAGE_NODE_PRIORITY =
  1;


const DEFAULT_STORAGE_NODE_WEIGHT =
  1;


// =====================================================
// CREATE NODE OBJECT
// =====================================================

function buildStorageNodeRecord(
  data
) {

  data =
    data || {};


  const now =
    new Date();


  const id =
    data.id ||
    generateID(
      ID_PREFIXES.STORAGE_NODE
    );


  return {

    id:
      id,

    storageId:
      data.storageId ||
      "",

    roomId:
      data.roomId ||
      "",

    name:
      data.name ||
      "Storage Node",

    type:
      data.type ||
      DEFAULT_STORAGE_NODE_TYPE,

    status:
      data.status ||
      DEFAULT_STORAGE_NODE_STATUS,

    provider:
      data.provider ||
      "Google Drive",

    accountEmail:
      data.accountEmail ||
      "",

    driveId:
      data.driveId ||
      "",

    rootFolderId:
      data.rootFolderId ||
      "",

    totalBytes:
      Number(
        data.totalBytes ||
        0
      ),

    usedBytes:
      Number(
        data.usedBytes ||
        0
      ),

    availableBytes:
      Number(
        data.availableBytes ||
        0
      ),

    maxFileSize:
      Number(
        data.maxFileSize ||
        0
      ),

    priority:
      Number(
        data.priority ||
        DEFAULT_STORAGE_NODE_PRIORITY
      ),

    weight:
      Number(
        data.weight ||
        DEFAULT_STORAGE_NODE_WEIGHT
      ),

    lastHealthCheck:
      data.lastHealthCheck ||
      "",

    lastError:
      data.lastError ||
      "",

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
// FIND NODE BY ID
// =====================================================

function findStorageNodeById(
  nodeId
) {

  if (!nodeId) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const id =
      row[
        STORAGE_NODE_COLUMNS.ID - 1
      ];


    if (
      String(id) ===
      String(nodeId)
    ) {

      return storageNodeRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// FIND NODE BY DRIVE ID
// =====================================================

function findStorageNodeByDriveId(
  driveId
) {

  if (!driveId) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const rowDriveId =
      row[
        STORAGE_NODE_COLUMNS.DRIVE_ID - 1
      ];


    if (
      String(rowDriveId) ===
      String(driveId)
    ) {

      return storageNodeRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// FIND NODES BY STORAGE ID
// =====================================================

function getStorageNodesByStorageId(
  storageId
) {

  if (!storageId) {

    return [];

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


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

    const row =
      values[i];


    const rowStorageId =
      row[
        STORAGE_NODE_COLUMNS.STORAGE_ID - 1
      ];


    if (
      String(rowStorageId) ===
      String(storageId)
    ) {

      nodes.push(
        storageNodeRowToObject(
          row,
          i + 1
        )
      );

    }

  }


  return nodes;

}


// =====================================================
// FIND NODES BY ROOM ID
// =====================================================

function getStorageNodesByRoomId(
  roomId
) {

  if (!roomId) {

    return [];

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


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

    const row =
      values[i];


    const rowRoomId =
      row[
        STORAGE_NODE_COLUMNS.ROOM_ID - 1
      ];


    if (
      String(rowRoomId) ===
      String(roomId)
    ) {

      nodes.push(
        storageNodeRowToObject(
          row,
          i + 1
        )
      );

    }

  }


  return nodes;

}


// =====================================================
// GET ALL STORAGE NODES
// =====================================================

function getAllStorageNodes() {

  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


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

    const row =
      values[i];


    if (
      !row[
        STORAGE_NODE_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }


    nodes.push(
      storageNodeRowToObject(
        row,
        i + 1
      )
    );

  }


  return nodes;

}


// =====================================================
// GET ACTIVE NODES
// =====================================================

function getActiveStorageNodes() {

  const nodes =
    getAllStorageNodes();


  return nodes.filter(
    function(node) {

      return String(
        node.status || ""
      )
        .toLowerCase() ===
        String(
          STORAGE_NODE_STATUS.ACTIVE
        )
          .toLowerCase();

    }
  );

}


// =====================================================
// GET AVAILABLE NODES
// =====================================================

function getAvailableStorageNodes() {

  const nodes =
    getActiveStorageNodes();


  return nodes.filter(
    function(node) {

      return Number(
        node.availableBytes || 0
      ) > 0;

    }
  );

}


// =====================================================
// CONVERT ROW TO OBJECT
// =====================================================

function storageNodeRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber,

    id:
      row[
        STORAGE_NODE_COLUMNS.ID - 1
      ],

    storageId:
      row[
        STORAGE_NODE_COLUMNS.STORAGE_ID - 1
      ],

    roomId:
      row[
        STORAGE_NODE_COLUMNS.ROOM_ID - 1
      ],

    name:
      row[
        STORAGE_NODE_COLUMNS.NAME - 1
      ],

    type:
      row[
        STORAGE_NODE_COLUMNS.TYPE - 1
      ],

    status:
      row[
        STORAGE_NODE_COLUMNS.STATUS - 1
      ],

    provider:
      row[
        STORAGE_NODE_COLUMNS.PROVIDER - 1
      ],

    accountEmail:
      row[
        STORAGE_NODE_COLUMNS.ACCOUNT_EMAIL - 1
      ],

    driveId:
      row[
        STORAGE_NODE_COLUMNS.DRIVE_ID - 1
      ],

    rootFolderId:
      row[
        STORAGE_NODE_COLUMNS.ROOT_FOLDER_ID - 1
      ],

    totalBytes:
      Number(
        row[
          STORAGE_NODE_COLUMNS.TOTAL_BYTES - 1
        ] || 0
      ),

    usedBytes:
      Number(
        row[
          STORAGE_NODE_COLUMNS.USED_BYTES - 1
        ] || 0
      ),

    availableBytes:
      Number(
        row[
          STORAGE_NODE_COLUMNS.AVAILABLE_BYTES - 1
        ] || 0
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_NODE_COLUMNS.MAX_FILE_SIZE - 1
        ] || 0
      ),

    priority:
      Number(
        row[
          STORAGE_NODE_COLUMNS.PRIORITY - 1
        ] || 0
      ),

    weight:
      Number(
        row[
          STORAGE_NODE_COLUMNS.WEIGHT - 1
        ] || 0
      ),

    lastHealthCheck:
      row[
        STORAGE_NODE_COLUMNS.LAST_HEALTH_CHECK - 1
      ],

    lastError:
      row[
        STORAGE_NODE_COLUMNS.LAST_ERROR - 1
      ],

    createdBy:
      row[
        STORAGE_NODE_COLUMNS.CREATED_BY - 1
      ],

    createdAt:
      row[
        STORAGE_NODE_COLUMNS.CREATED_AT - 1
      ],

    updatedAt:
      row[
        STORAGE_NODE_COLUMNS.UPDATED_AT - 1
      ]

  };

}


// =====================================================
// CALCULATE NODE AVAILABLE SPACE
// =====================================================

function calculateNodeAvailableSpace(
  node
) {

  if (!node) {

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


  return Math.max(
    0,
    total - used
  );

}


// =====================================================
// CALCULATE NODE USAGE
// =====================================================

function calculateNodeUsagePercent(
  node
) {

  if (!node) {

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
// CHECK NODE CAPACITY
// =====================================================

function hasNodeCapacity(
  node,
  requiredBytes
) {

  if (!node) {

    return false;

  }


  requiredBytes =
    Number(
      requiredBytes || 0
    );


  const available =
    calculateNodeAvailableSpace(
      node
    );


  return (
    available >=
    requiredBytes
  );

}


// =====================================================
// CHECK NODE FILE SIZE
// =====================================================

function isNodeFileSizeAllowed(
  node,
  fileSize
) {

  if (!node) {

    return false;

  }


  fileSize =
    Number(
      fileSize || 0
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
// CHECK NODE HEALTH
// =====================================================

function isStorageNodeHealthy(
  node
) {

  if (!node) {

    return false;

  }


  const status =
    String(
      node.status || ""
    ).toLowerCase();


  return (
    status ===
    String(
      STORAGE_NODE_STATUS.ACTIVE
    ).toLowerCase()
  );

}


// =====================================================
// UPDATE NODE USAGE
// =====================================================

function updateStorageNodeUsage(
  nodeId,
  bytesAdded
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


  bytesAdded =
    Number(
      bytesAdded || 0
    );


  const newUsed =
    Math.max(
      0,
      Number(
        node.usedBytes || 0
      ) +
      bytesAdded
    );


  const newAvailable =
    Math.max(
      0,
      Number(
        node.totalBytes || 0
      ) -
      newUsed
    );


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.USED_BYTES
  )
    .setValue(
      newUsed
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.AVAILABLE_BYTES
  )
    .setValue(
      newAvailable
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.UPDATED_AT
  )
    .setValue(
      new Date()
    );


  return {

    nodeId:
      nodeId,

    usedBytes:
      newUsed,

    availableBytes:
      newAvailable

  };

}


// =====================================================
// SET NODE STATUS
// =====================================================

function setStorageNodeStatus(
  nodeId,
  status,
  errorMessage
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


  status =
    String(
      status || ""
    ).trim();


  if (!status) {

    throw new Error(
      "Storage node status is required"
    );

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.STATUS
  )
    .setValue(
      status
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.LAST_ERROR
  )
    .setValue(
      errorMessage || ""
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.UPDATED_AT
  )
    .setValue(
      new Date()
    );


  return true;

}


// =====================================================
// RECORD HEALTH CHECK
// =====================================================

function recordStorageNodeHealth(
  nodeId,
  healthy,
  errorMessage
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


  const status =
    healthy
      ? STORAGE_NODE_STATUS.ACTIVE
      : STORAGE_NODE_STATUS.ERROR;


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.STATUS
  )
    .setValue(
      status
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.LAST_HEALTH_CHECK
  )
    .setValue(
      new Date()
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.LAST_ERROR
  )
    .setValue(
      healthy
        ? ""
        : (
            errorMessage ||
            "Storage node health check failed"
          )
    );


  sheet.getRange(
    node.row,
    STORAGE_NODE_COLUMNS.UPDATED_AT
  )
    .setValue(
      new Date()
    );


  return {

    nodeId:
      nodeId,

    healthy:
      healthy,

    status:
      status

  };

}


// =====================================================
// REMOVE NODE
// =====================================================

function removeStorageNodeRecord(
  nodeId
) {

  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    return false;

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE_NODES
    );


  sheet.deleteRow(
    node.row
  );


  return true;

}