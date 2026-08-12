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

  NODE_ID: 3,

  NAME: 4,

  TYPE: 5,

  STATUS: 6,

  DESCRIPTION: 7,

  TOTAL_BYTES: 8,

  USED_BYTES: 9,

  AVAILABLE_BYTES: 10,

  MAX_FILE_SIZE: 11,

  FILE_COUNT: 12,

  CREATED_BY: 13,

  CREATED_AT: 14,

  UPDATED_AT: 15

};


// =====================================================
// STORAGE ROOM TYPES
// =====================================================

const STORAGE_ROOM_TYPES = {

  ROOT:
    "Root",

  FILES:
    "Files",

  IMAGES:
    "Images",

  VIDEOS:
    "Videos",

  DOCUMENTS:
    "Documents",

  BACKUPS:
    "Backups",

  TEMPORARY:
    "Temporary",

  ARCHIVE:
    "Archive",

  CUSTOM:
    "Custom"

};


// =====================================================
// STORAGE ROOM STATUSES
// =====================================================

const STORAGE_ROOM_STATUS = {

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
    "Error"

};


// =====================================================
// STORAGE ROOM LIMITS
// =====================================================

const STORAGE_ROOM_LIMITS = {

  MIN_NAME_LENGTH:
    1,

  MAX_NAME_LENGTH:
    100,

  MAX_DESCRIPTION_LENGTH:
    500,

  MAX_ROOMS_PER_STORAGE:
    1000

};


// =====================================================
// STORAGE ROOM DEFAULTS
// =====================================================

const STORAGE_ROOM_DEFAULTS = {

  TYPE:
    STORAGE_ROOM_TYPES.FILES,

  STATUS:
    STORAGE_ROOM_STATUS.ACTIVE,

  TOTAL_BYTES:
    0,

  USED_BYTES:
    0,

  AVAILABLE_BYTES:
    0,

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  FILE_COUNT:
    0

};


// =====================================================
// GET STORAGE ROOM SHEET
// =====================================================

function getStorageRoomsSheet() {

  return getSheet(
    SHEETS.STORAGE_ROOMS
  );

}


// =====================================================
// GENERATE STORAGE ROOM ID
// =====================================================

function generateStorageRoomId() {

  if (
    typeof generateID ===
    "function" &&
    typeof ID_PREFIXES !==
    "undefined" &&
    ID_PREFIXES.STORAGE_ROOM
  ) {

    return generateID(
      ID_PREFIXES.STORAGE_ROOM
    );

  }


  return (
    "ROOM-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase()
  );

}


// =====================================================
// BUILD STORAGE ROOM RECORD
// =====================================================

function buildStorageRoomRecord(
  data
) {

  data =
    data || {};


  const now =
    new Date();


  const totalBytes =
    normalizeStorageRoomBytes(
      data.totalBytes,
      STORAGE_ROOM_DEFAULTS.TOTAL_BYTES
    );


  const usedBytes =
    normalizeStorageRoomBytes(
      data.usedBytes,
      STORAGE_ROOM_DEFAULTS.USED_BYTES
    );


  return {

    id:
      data.id ||
      generateStorageRoomId(),

    storageId:
      data.storageId ||
      "",

    nodeId:
      data.nodeId ||
      "",

    name:
      normalizeStorageRoomName(
        data.name
      ),

    type:
      data.type ||
      STORAGE_ROOM_DEFAULTS.TYPE,

    status:
      data.status ||
      STORAGE_ROOM_DEFAULTS.STATUS,

    description:
      normalizeStorageRoomDescription(
        data.description
      ),

    totalBytes:
      totalBytes,

    usedBytes:
      Math.min(
        usedBytes,
        totalBytes
      ),

    availableBytes:
      calculateStorageRoomAvailable(
        totalBytes,
        usedBytes
      ),

    maxFileSize:
      normalizeStorageRoomBytes(
        data.maxFileSize,
        STORAGE_ROOM_DEFAULTS.MAX_FILE_SIZE
      ),

    fileCount:
      normalizeStorageRoomNumber(
        data.fileCount,
        STORAGE_ROOM_DEFAULTS.FILE_COUNT
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
// NORMALIZE ROOM NAME
// =====================================================

function normalizeStorageRoomName(
  name
) {

  const value =
    String(
      name ||
      "Files"
    )
      .trim();


  return value.substring(
    0,
    STORAGE_ROOM_LIMITS
      .MAX_NAME_LENGTH
  );

}


// =====================================================
// NORMALIZE DESCRIPTION
// =====================================================

function normalizeStorageRoomDescription(
  description
) {

  return String(
    description ||
    ""
  )
    .trim()
    .substring(
      0,
      STORAGE_ROOM_LIMITS
        .MAX_DESCRIPTION_LENGTH
    );

}


// =====================================================
// NORMALIZE BYTES
// =====================================================

function normalizeStorageRoomBytes(
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
// NORMALIZE NUMBER
// =====================================================

function normalizeStorageRoomNumber(
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
// CALCULATE AVAILABLE ROOM STORAGE
// =====================================================

function calculateStorageRoomAvailable(
  totalBytes,
  usedBytes
) {

  totalBytes =
    normalizeStorageRoomBytes(
      totalBytes,
      0
    );


  usedBytes =
    normalizeStorageRoomBytes(
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
// CONVERT ROOM OBJECT TO SHEET ROW
// =====================================================

function storageRoomObjectToRow(
  room
) {

  if (
    !room
  ) {

    throw new Error(
      "Storage room is required"
    );

  }


  return [

    room.id || "",

    room.storageId || "",

    room.nodeId || "",

    room.name || "",

    room.type || "",

    room.status || "",

    room.description || "",

    Number(
      room.totalBytes || 0
    ),

    Number(
      room.usedBytes || 0
    ),

    calculateStorageRoomAvailable(
      room.totalBytes,
      room.usedBytes
    ),

    Number(
      room.maxFileSize || 0
    ),

    Number(
      room.fileCount || 0
    ),

    room.createdBy || "",

    room.createdAt || "",

    room.updatedAt || ""

  ];

}


// =====================================================
// CONVERT SHEET ROW TO OBJECT
// =====================================================

function storageRoomRowToObject(
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
        STORAGE_ROOM_COLUMNS
          .TOTAL_BYTES - 1
      ] || 0
    );


  const usedBytes =
    Number(
      row[
        STORAGE_ROOM_COLUMNS
          .USED_BYTES - 1
      ] || 0
    );


  return {

    row:
      rowNumber || null,

    id:
      row[
        STORAGE_ROOM_COLUMNS.ID - 1
      ] || "",

    storageId:
      row[
        STORAGE_ROOM_COLUMNS.STORAGE_ID - 1
      ] || "",

    nodeId:
      row[
        STORAGE_ROOM_COLUMNS.NODE_ID - 1
      ] || "",

    name:
      row[
        STORAGE_ROOM_COLUMNS.NAME - 1
      ] || "",

    type:
      row[
        STORAGE_ROOM_COLUMNS.TYPE - 1
      ] || "",

    status:
      row[
        STORAGE_ROOM_COLUMNS.STATUS - 1
      ] || "",

    description:
      row[
        STORAGE_ROOM_COLUMNS.DESCRIPTION - 1
      ] || "",

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageRoomAvailable(
        totalBytes,
        usedBytes
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_ROOM_COLUMNS
            .MAX_FILE_SIZE - 1
        ] ||
        STORAGE_ROOM_DEFAULTS
          .MAX_FILE_SIZE
      ),

    fileCount:
      Number(
        row[
          STORAGE_ROOM_COLUMNS.FILE_COUNT - 1
        ] || 0
      ),

    createdBy:
      row[
        STORAGE_ROOM_COLUMNS.CREATED_BY - 1
      ] || "",

    createdAt:
      row[
        STORAGE_ROOM_COLUMNS.CREATED_AT - 1
      ] || "",

    updatedAt:
      row[
        STORAGE_ROOM_COLUMNS.UPDATED_AT - 1
      ] || ""

  };

}


// =====================================================
// FIND ROOM BY ID
// =====================================================

function findStorageRoomById(
  roomId
) {

  if (
    !roomId
  ) {

    return null;

  }


  const sheet =
    getStorageRoomsSheet();


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


    if (
      String(
        row[
          STORAGE_ROOM_COLUMNS.ID - 1
        ] || ""
      ) ===
      String(
        roomId
      )
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
// FIND ROOM BY NAME
// =====================================================

function findStorageRoomByName(
  storageId,
  name
) {

  if (
    !storageId ||
    !name
  ) {

    return null;

  }


  const sheet =
    getStorageRoomsSheet();


  const values =
    sheet
      .getDataRange()
      .getValues();


  const target =
    String(
      name
    )
      .trim()
      .toLowerCase();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const rowStorageId =
      String(
        row[
          STORAGE_ROOM_COLUMNS
            .STORAGE_ID - 1
        ] || ""
      );


    const rowName =
      String(
        row[
          STORAGE_ROOM_COLUMNS
            .NAME - 1
        ] || ""
      )
        .trim()
        .toLowerCase();


    if (
      rowStorageId ===
      String(storageId) &&
      rowName ===
      target
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
// GET ALL STORAGE ROOMS
// =====================================================

function getAllStorageRooms() {

  const sheet =
    getStorageRoomsSheet();


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

    if (
      !values[i][
        STORAGE_ROOM_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }


    rooms.push(
      storageRoomRowToObject(
        values[i],
        i + 1
      )
    );

  }


  return rooms;

}


// =====================================================
// GET ROOMS BY STORAGE
// =====================================================

function getStorageRoomsByStorageId(
  storageId
) {

  if (
    !storageId
  ) {

    return [];

  }


  return getAllStorageRooms()
    .filter(
      function(room) {

        return String(
          room.storageId
        ) ===
        String(
          storageId
        );

      }
    );

}


// =====================================================
// GET ROOMS BY NODE
// =====================================================

function getStorageRoomsByNodeId(
  nodeId
) {

  if (
    !nodeId
  ) {

    return [];

  }


  return getAllStorageRooms()
    .filter(
      function(room) {

        return String(
          room.nodeId
        ) ===
        String(
          nodeId
        );

      }
    );

}


// =====================================================
// GET ACTIVE ROOMS
// =====================================================

function getActiveStorageRooms() {

  return getAllStorageRooms()
    .filter(
      function(room) {

        return (
          String(
            room.status
          ).toLowerCase() ===
          String(
            STORAGE_ROOM_STATUS.ACTIVE
          ).toLowerCase()
        );

      }
    );

}


// =====================================================
// CHECK ROOM CAPACITY
// =====================================================

function hasStorageRoomCapacity(
  room,
  requiredBytes
) {

  if (
    !room
  ) {

    return false;

  }


  requiredBytes =
    normalizeStorageRoomBytes(
      requiredBytes,
      0
    );


  return (
    calculateStorageRoomAvailable(
      room.totalBytes,
      room.usedBytes
    ) >=
    requiredBytes
  );

}


// =====================================================
// CHECK ROOM FILE SIZE
// =====================================================

function isStorageRoomFileSizeAllowed(
  room,
  fileSize
) {

  if (
    !room
  ) {

    return false;

  }


  fileSize =
    normalizeStorageRoomBytes(
      fileSize,
      0
    );


  const maxFileSize =
    Number(
      room.maxFileSize || 0
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
// GET ROOM USAGE PERCENT
// =====================================================

function getStorageRoomUsagePercent(
  room
) {

  if (
    !room
  ) {

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
// GET BEST AVAILABLE ROOM
// =====================================================

function getBestAvailableStorageRoom(
  requiredBytes,
  options
) {

  options =
    options || {};


  const rooms =
    getActiveStorageRooms()
      .filter(
        function(room) {

          if (
            options.storageId &&
            String(
              room.storageId
            ) !==
            String(
              options.storageId
            )
          ) {

            return false;

          }


          if (
            options.nodeId &&
            String(
              room.nodeId
            ) !==
            String(
              options.nodeId
            )
          ) {

            return false;

          }


          return hasStorageRoomCapacity(
            room,
            requiredBytes
          );

        }
      );


  if (
    rooms.length === 0
  ) {

    return null;

  }


  rooms.sort(
    function(a, b) {

      return (
        b.availableBytes -
        a.availableBytes
      );

    }
  );


  return rooms[0];

}


// =====================================================
// VALIDATE STORAGE ROOM
// =====================================================

function validateStorageRoom(
  room
) {

  const errors = [];


  if (
    !room
  ) {

    errors.push(
      "Storage room is required"
    );

    return {

      valid:
        false,

      errors:
        errors

    };

  }


  if (
    !room.id
  ) {

    errors.push(
      "Room ID is required"
    );

  }


  if (
    !room.storageId
  ) {

    errors.push(
      "Storage ID is required"
    );

  }


  if (
    !room.name
  ) {

    errors.push(
      "Room name is required"
    );

  }


  if (
    !Object
      .values(
        STORAGE_ROOM_TYPES
      )
      .includes(
        room.type
      )
  ) {

    errors.push(
      "Invalid storage room type"
    );

  }


  if (
    !Object
      .values(
        STORAGE_ROOM_STATUS
      )
      .includes(
        room.status
      )
  ) {

    errors.push(
      "Invalid storage room status"
    );

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
// GET STORAGE ROOM SUMMARY
// =====================================================

function getStorageRoomSummary(
  storageId
) {

  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  let totalBytes =
    0;


  let usedBytes =
    0;


  let fileCount =
    0;


  rooms.forEach(
    function(room) {

      totalBytes +=
        Number(
          room.totalBytes || 0
        );


      usedBytes +=
        Number(
          room.usedBytes || 0
        );


      fileCount +=
        Number(
          room.fileCount || 0
        );

    }
  );


  return {

    storageId:
      storageId,

    roomCount:
      rooms.length,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      calculateStorageRoomAvailable(
        totalBytes,
        usedBytes
      ),

    fileCount:
      fileCount

  };

}