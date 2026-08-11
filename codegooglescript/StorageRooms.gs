// =====================================================
// STORAGEROOMS.GS
// Storage Room Management
// Cloud Project Platform
// =====================================================


// =====================================================
// STORAGE ROOM COLUMNS
// =====================================================

const STORAGE_ROOM_COLUMNS = {

  ID: 1,

  STORAGE_ID: 2,

  PROJECT_ID: 3,

  NAME: 4,

  DESCRIPTION: 5,

  STATUS: 6,

  ROOM_TYPE: 7,

  OWNER_ID: 8,

  TOTAL_BYTES: 9,

  USED_BYTES: 10,

  AVAILABLE_BYTES: 11,

  NODE_COUNT: 12,

  MAX_FILE_SIZE: 13,

  CREATED_AT: 14,

  UPDATED_AT: 15

};


// =====================================================
// STORAGE ROOM TYPES
// =====================================================

const STORAGE_ROOM_TYPES = Object.freeze({

  PERSONAL:
    "Personal",

  PROJECT:
    "Project",

  SHARED:
    "Shared",

  SYSTEM:
    "System",

  BACKUP:
    "Backup"

});


// =====================================================
// STORAGE ROOM STATUS
// =====================================================

const STORAGE_ROOM_STATUS = Object.freeze({

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

const DEFAULT_STORAGE_ROOM_TYPE =
  STORAGE_ROOM_TYPES.PROJECT;


const DEFAULT_STORAGE_ROOM_STATUS =
  STORAGE_ROOM_STATUS.ACTIVE;


// =====================================================
// BUILD STORAGE ROOM
// =====================================================

function buildStorageRoomRecord(
  data
) {

  data =
    data || {};

  const now =
    new Date();

  return {

    id:
      data.id ||
      generateID(
        ID_PREFIXES.STORAGE_ROOM
      ),

    storageId:
      data.storageId ||
      "",

    projectId:
      data.projectId ||
      "",

    name:
      data.name ||
      "Storage Room",

    description:
      data.description ||
      "",

    status:
      data.status ||
      DEFAULT_STORAGE_ROOM_STATUS,

    roomType:
      data.roomType ||
      DEFAULT_STORAGE_ROOM_TYPE,

    ownerId:
      data.ownerId ||
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

    nodeCount:
      Number(
        data.nodeCount ||
        0
      ),

    maxFileSize:
      Number(
        data.maxFileSize ||
        0
      ),

    createdAt:
      data.createdAt ||
      now,

    updatedAt:
      data.updatedAt ||
      now

  };

}


// =====================================================
// FIND STORAGE ROOM BY ID
// =====================================================

function findStorageRoomById(
  roomId
) {

  if (!roomId) {

    return null;

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
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
        STORAGE_ROOM_COLUMNS.ID - 1
      ];

    if (
      String(id) ===
      String(roomId)
    ) {

      return storageRoomRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND ROOM BY PROJECT
// =====================================================

function findStorageRoomByProject(
  projectId
) {

  if (!projectId) {

    return null;

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
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

    const rowProjectId =
      row[
        STORAGE_ROOM_COLUMNS.PROJECT_ID - 1
      ];

    if (
      String(rowProjectId) ===
      String(projectId)
    ) {

      return storageRoomRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// GET ROOMS BY STORAGE ID
// =====================================================

function getStorageRoomsByStorageId(
  storageId
) {

  if (!storageId) {

    return [];

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const rooms = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          STORAGE_ROOM_COLUMNS.STORAGE_ID - 1
        ]
      ) !==
      String(storageId)
    ) {

      continue;

    }

    rooms.push(
      storageRoomRowToObject(
        row,
        i + 1
      )
    );

  }

  return rooms;

}


// =====================================================
// GET ROOMS BY OWNER
// =====================================================

function getStorageRoomsByOwner(
  ownerId
) {

  if (!ownerId) {

    return [];

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const rooms = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          STORAGE_ROOM_COLUMNS.OWNER_ID - 1
        ]
      ) !==
      String(ownerId)
    ) {

      continue;

    }

    rooms.push(
      storageRoomRowToObject(
        row,
        i + 1
      )
    );

  }

  return rooms;

}


// =====================================================
// GET ALL STORAGE ROOMS
// =====================================================

function getAllStorageRooms() {

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const rooms = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      !row[
        STORAGE_ROOM_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }

    rooms.push(
      storageRoomRowToObject(
        row,
        i + 1
      )
    );

  }

  return rooms;

}


// =====================================================
// GET ACTIVE STORAGE ROOMS
// =====================================================

function getActiveStorageRooms() {

  const rooms =
    getAllStorageRooms();

  return rooms.filter(
    function(room) {

      return String(
        room.status || ""
      )
        .toLowerCase() ===
        String(
          STORAGE_ROOM_STATUS.ACTIVE
        )
          .toLowerCase();

    }
  );

}


// =====================================================
// CONVERT SHEET ROW TO OBJECT
// =====================================================

function storageRoomRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber,

    id:
      row[
        STORAGE_ROOM_COLUMNS.ID - 1
      ],

    storageId:
      row[
        STORAGE_ROOM_COLUMNS.STORAGE_ID - 1
      ],

    projectId:
      row[
        STORAGE_ROOM_COLUMNS.PROJECT_ID - 1
      ],

    name:
      row[
        STORAGE_ROOM_COLUMNS.NAME - 1
      ],

    description:
      row[
        STORAGE_ROOM_COLUMNS.DESCRIPTION - 1
      ],

    status:
      row[
        STORAGE_ROOM_COLUMNS.STATUS - 1
      ],

    roomType:
      row[
        STORAGE_ROOM_COLUMNS.ROOM_TYPE - 1
      ],

    ownerId:
      row[
        STORAGE_ROOM_COLUMNS.OWNER_ID - 1
      ],

    totalBytes:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.TOTAL_BYTES - 1
        ] || 0
      ),

    usedBytes:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.USED_BYTES - 1
        ] || 0
      ),

    availableBytes:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.AVAILABLE_BYTES - 1
        ] || 0
      ),

    nodeCount:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.NODE_COUNT - 1
        ] || 0
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.MAX_FILE_SIZE - 1
        ] || 0
      ),

    createdAt:
      row[
        STORAGE_ROOM_COLUMNS.CREATED_AT - 1
      ],

    updatedAt:
      row[
        STORAGE_ROOM_COLUMNS.UPDATED_AT - 1
      ]

  };

}


// =====================================================
// CALCULATE ROOM AVAILABLE SPACE
// =====================================================

function calculateStorageRoomAvailableSpace(
  room
) {

  if (!room) {

    return 0;

  }

  const total =
    Number(
      room.totalBytes || 0
    );

  const used =
    Number(
      room.usedBytes || 0
    );

  return Math.max(
    0,
    total - used
  );

}


// =====================================================
// CALCULATE ROOM USAGE
// =====================================================

function calculateStorageRoomUsagePercent(
  room
) {

  if (!room) {

    return 0;

  }

  const total =
    Number(
      room.totalBytes || 0
    );

  const used =
    Number(
      room.usedBytes || 0
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
// CHECK ROOM CAPACITY
// =====================================================

function hasStorageRoomCapacity(
  roomId,
  requiredBytes
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    return false;

  }

  requiredBytes =
    Number(
      requiredBytes || 0
    );

  return (
    calculateStorageRoomAvailableSpace(
      room
    ) >=
    requiredBytes
  );

}


// =====================================================
// UPDATE ROOM USAGE
// =====================================================

function updateStorageRoomUsage(
  roomId,
  bytesAdded
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    throw new Error(
      "Storage room not found"
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
        room.usedBytes || 0
      ) +
      bytesAdded
    );

  const newAvailable =
    Math.max(
      0,
      Number(
        room.totalBytes || 0
      ) -
      newUsed
    );

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.USED_BYTES
    )
    .setValue(
      newUsed
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.AVAILABLE_BYTES
    )
    .setValue(
      newAvailable
    );

  if (
    newAvailable <= 0
  ) {

    sheet
      .getRange(
        room.row,
        STORAGE_ROOM_COLUMNS.STATUS
      )
      .setValue(
        STORAGE_ROOM_STATUS.FULL
      );

  }

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return {

    roomId:
      roomId,

    usedBytes:
      newUsed,

    availableBytes:
      newAvailable

  };

}


// =====================================================
// UPDATE ROOM NODE COUNT
// =====================================================

function updateStorageRoomNodeCount(
  roomId
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    throw new Error(
      "Storage room not found"
    );

  }

  const nodes =
    getStorageNodesByRoomId(
      roomId
    );

  const count =
    nodes.length;

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.NODE_COUNT
    )
    .setValue(
      count
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return count;

}


// =====================================================
// REFRESH ROOM CAPACITY FROM NODES
// =====================================================

function refreshStorageRoomCapacity(
  roomId
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    throw new Error(
      "Storage room not found"
    );

  }

  const nodes =
    getStorageNodesByRoomId(
      roomId
    );

  let totalBytes =
    0;

  let usedBytes =
    0;

  let availableBytes =
    0;

  for (
    let i = 0;
    i < nodes.length;
    i++
  ) {

    const node =
      nodes[i];

    totalBytes +=
      Number(
        node.totalBytes || 0
      );

    usedBytes +=
      Number(
        node.usedBytes || 0
      );

    availableBytes +=
      Number(
        node.availableBytes || 0
      );

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.TOTAL_BYTES
    )
    .setValue(
      totalBytes
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.USED_BYTES
    )
    .setValue(
      usedBytes
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.AVAILABLE_BYTES
    )
    .setValue(
      availableBytes
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.NODE_COUNT
    )
    .setValue(
      nodes.length
    );

  let status =
    room.status;

  if (
    nodes.length === 0
  ) {

    status =
      STORAGE_ROOM_STATUS.INACTIVE;

  }
  else if (
    availableBytes <= 0
  ) {

    status =
      STORAGE_ROOM_STATUS.FULL;

  }
  else {

    status =
      STORAGE_ROOM_STATUS.ACTIVE;

  }

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.STATUS
    )
    .setValue(
      status
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return {

    roomId:
      roomId,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      availableBytes,

    nodeCount:
      nodes.length,

    status:
      status

  };

}


// =====================================================
// SET ROOM STATUS
// =====================================================

function setStorageRoomStatus(
  roomId,
  status
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    throw new Error(
      "Storage room not found"
    );

  }

  status =
    String(
      status || ""
    ).trim();

  if (!status) {

    throw new Error(
      "Storage room status is required"
    );

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.STATUS
    )
    .setValue(
      status
    );

  sheet
    .getRange(
      room.row,
      STORAGE_ROOM_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// DELETE STORAGE ROOM RECORD
// =====================================================

function removeStorageRoomRecord(
  roomId
) {

  const room =
    findStorageRoomById(
      roomId
    );

  if (!room) {

    return false;

  }

  const nodes =
    getStorageNodesByRoomId(
      roomId
    );

  if (
    nodes.length > 0
  ) {

    throw new Error(
      "Cannot delete storage room while storage nodes are attached"
    );

  }

  const sheet =
    getSheet(
      SHEETS.STORAGE_ROOMS
    );

  sheet.deleteRow(
    room.row
  );

  return true;

}