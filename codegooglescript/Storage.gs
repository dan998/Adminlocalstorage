// =====================================================
// STORAGE.GS
// Storage Core Model
// Cloud Project Platform
// =====================================================


// =====================================================
// STORAGE COLUMNS
// =====================================================

const STORAGE_COLUMNS = {

  ID: 1,

  NAME: 2,

  TYPE: 3,

  STATUS: 4,

  DESCRIPTION: 5,

  TOTAL_BYTES: 6,

  USED_BYTES: 7,

  AVAILABLE_BYTES: 8,

  MAX_FILE_SIZE: 9,

  ROOM_COUNT: 10,

  NODE_COUNT: 11,

  CREATED_BY: 12,

  CREATED_AT: 13,

  UPDATED_AT: 14

};


// =====================================================
// DEFAULT STORAGE VALUES
// =====================================================

const DEFAULT_STORAGE_TYPE =
  STORAGE_TYPES.GOOGLE_DRIVE;


const DEFAULT_STORAGE_STATUS =
  STORAGE_STATUS.ACTIVE;


const DEFAULT_STORAGE_ALLOCATION =
  STORAGE_ALLOCATION.LEAST_USED;


// =====================================================
// STORAGE LIMITS
// =====================================================

const STORAGE_LIMITS = {

  MIN_NAME_LENGTH:
    1,

  MAX_NAME_LENGTH:
    100,

  MAX_DESCRIPTION_LENGTH:
    500

};


// =====================================================
// STORAGE RECORD
// =====================================================

function buildStorageRecord(
  data
) {

  data =
    data || {};


  const now =
    new Date();


  const id =
    data.id ||
    generateID(
      ID_PREFIXES.STORAGE
    );


  return {

    id:
      id,

    name:
      data.name ||
      "Storage",

    type:
      data.type ||
      DEFAULT_STORAGE_TYPE,

    status:
      data.status ||
      DEFAULT_STORAGE_STATUS,

    description:
      data.description ||
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
        STORAGE_DEFAULTS.MAX_FILE_SIZE
      ),

    roomCount:
      Number(
        data.roomCount ||
        0
      ),

    nodeCount:
      Number(
        data.nodeCount ||
        0
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
// FIND STORAGE BY ID
// =====================================================

function findStorageById(
  storageId
) {

  if (!storageId) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE
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
        STORAGE_COLUMNS.ID - 1
      ];


    if (
      String(id) ===
      String(storageId)
    ) {

      return storageRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// FIND STORAGE BY NAME
// =====================================================

function findStorageByName(
  name
) {

  if (!name) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


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


    const rowName =
      String(
        row[
          STORAGE_COLUMNS.NAME - 1
        ] || ""
      )
        .trim()
        .toLowerCase();


    if (
      rowName ===
      target
    ) {

      return storageRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// GET ALL STORAGE
// =====================================================

function getAllStorageRecords() {

  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  const storages = [];


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    if (
      !row[
        STORAGE_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }


    storages.push(
      storageRowToObject(
        row,
        i + 1
      )
    );

  }


  return storages;

}


// =====================================================
// GET ACTIVE STORAGE
// =====================================================

function getActiveStorageRecords() {

  const storages =
    getAllStorageRecords();


  return storages.filter(
    function(storage) {

      return String(
        storage.status || ""
      )
        .toLowerCase() ===
        String(
          STORAGE_STATUS.ACTIVE
        )
          .toLowerCase();

    }
  );

}


// =====================================================
// CONVERT SHEET ROW TO OBJECT
// =====================================================

function storageRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber,

    id:
      row[
        STORAGE_COLUMNS.ID - 1
      ],

    name:
      row[
        STORAGE_COLUMNS.NAME - 1
      ],

    type:
      row[
        STORAGE_COLUMNS.TYPE - 1
      ],

    status:
      row[
        STORAGE_COLUMNS.STATUS - 1
      ],

    description:
      row[
        STORAGE_COLUMNS.DESCRIPTION - 1
      ],

    totalBytes:
      Number(
        row[
          STORAGE_COLUMNS.TOTAL_BYTES - 1
        ] || 0
      ),

    usedBytes:
      Number(
        row[
          STORAGE_COLUMNS.USED_BYTES - 1
        ] || 0
      ),

    availableBytes:
      Number(
        row[
          STORAGE_COLUMNS.AVAILABLE_BYTES - 1
        ] || 0
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_COLUMNS.MAX_FILE_SIZE - 1
        ] || 0
      ),

    roomCount:
      Number(
        row[
          STORAGE_COLUMNS.ROOM_COUNT - 1
        ] || 0
      ),

    nodeCount:
      Number(
        row[
          STORAGE_COLUMNS.NODE_COUNT - 1
        ] || 0
      ),

    createdBy:
      row[
        STORAGE_COLUMNS.CREATED_BY - 1
      ],

    createdAt:
      row[
        STORAGE_COLUMNS.CREATED_AT - 1
      ],

    updatedAt:
      row[
        STORAGE_COLUMNS.UPDATED_AT - 1
      ]

  };

}


// =====================================================
// CALCULATE AVAILABLE STORAGE
// =====================================================

function calculateStorageAvailable(
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


  const available =
    totalBytes -
    usedBytes;


  return Math.max(
    0,
    available
  );

}


// =====================================================
// CALCULATE STORAGE USAGE PERCENTAGE
// =====================================================

function calculateStorageUsagePercent(
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
    totalBytes <= 0
  ) {

    return 0;

  }


  const percentage =
    (
      usedBytes /
      totalBytes
    ) *
    100;


  return Math.min(
    100,
    Math.max(
      0,
      percentage
    )
  );

}


// =====================================================
// CHECK STORAGE AVAILABILITY
// =====================================================

function hasStorageCapacity(
  storage,
  requiredBytes
) {

  if (!storage) {

    return false;

  }


  requiredBytes =
    Number(
      requiredBytes || 0
    );


  const available =
    Number(
      storage.availableBytes || 0
    );


  return (
    available >=
    requiredBytes
  );

}


// =====================================================
// CHECK FILE SIZE LIMIT
// =====================================================

function isFileSizeAllowed(
  storage,
  fileSize
) {

  if (!storage) {

    return false;

  }


  fileSize =
    Number(
      fileSize || 0
    );


  const maxFileSize =
    Number(
      storage.maxFileSize || 0
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
// UPDATE STORAGE COUNTS
// =====================================================

function updateStorageCounts(
  storageId
) {

  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    return null;

  }


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


  return {

    storageId:
      storageId,

    roomCount:
      roomCount,

    nodeCount:
      nodeCount

  };

}


// =====================================================
// STORAGE HEALTH STATUS
// =====================================================

function getStorageStatus(
  storage
) {

  if (!storage) {

    return STORAGE_STATUS.ERROR;

  }


  if (
    String(
      storage.status || ""
    ).toLowerCase() ===
    "disabled"
  ) {

    return STORAGE_STATUS.DISABLED;

  }


  if (
    Number(
      storage.availableBytes || 0
    ) <= 0
  ) {

    return STORAGE_STATUS.FULL;

  }


  return STORAGE_STATUS.ACTIVE;

}


// =====================================================
// VALIDATE STORAGE OBJECT
// =====================================================

function validateStorageObject(
  storage
) {

  if (!storage) {

    return {

      valid:
        false,

      error:
        "Storage is required"

    };

  }


  if (!storage.id) {

    return {

      valid:
        false,

      error:
        "Storage ID is required"

    };

  }


  if (!storage.name) {

    return {

      valid:
        false,

      error:
        "Storage name is required"

    };

  }


  if (!storage.type) {

    return {

      valid:
        false,

      error:
        "Storage type is required"

    };

  }


  return {

    valid:
      true,

    error:
      null

  };

}