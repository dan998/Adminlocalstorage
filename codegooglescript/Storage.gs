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
// STORAGE MODEL VERSION
// =====================================================

const STORAGE_MODEL_VERSION =
  "1.0.0";


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
    500,

  MIN_TOTAL_BYTES:
    0,

  MIN_USED_BYTES:
    0,

  MIN_FILE_SIZE:
    0

};


// =====================================================
// STORAGE DEFAULTS
// =====================================================

const STORAGE_DEFAULTS = {

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  TOTAL_BYTES:
    0,

  USED_BYTES:
    0,

  AVAILABLE_BYTES:
    0,

  ROOM_COUNT:
    0,

  NODE_COUNT:
    0

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


  const totalBytes =
    normalizeStorageBytes(
      data.totalBytes,
      STORAGE_DEFAULTS.TOTAL_BYTES
    );


  const usedBytes =
    normalizeStorageBytes(
      data.usedBytes,
      STORAGE_DEFAULTS.USED_BYTES
    );


  const availableBytes =
    calculateStorageAvailable(
      totalBytes,
      usedBytes
    );


  return {

    id:
      id,

    name:
      normalizeStorageName(
        data.name
      ),

    type:
      data.type ||
      DEFAULT_STORAGE_TYPE,

    status:
      data.status ||
      DEFAULT_STORAGE_STATUS,

    description:
      normalizeStorageDescription(
        data.description
      ),

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      availableBytes,

    maxFileSize:
      normalizeStorageBytes(
        data.maxFileSize,
        STORAGE_DEFAULTS.MAX_FILE_SIZE
      ),

    roomCount:
      normalizeStorageNumber(
        data.roomCount,
        STORAGE_DEFAULTS.ROOM_COUNT
      ),

    nodeCount:
      normalizeStorageNumber(
        data.nodeCount,
        STORAGE_DEFAULTS.NODE_COUNT
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
// NORMALIZE STORAGE NAME
// =====================================================

function normalizeStorageName(
  name
) {

  const value =
    String(
      name ||
      "Storage"
    )
      .trim();


  if (
    !value
  ) {

    return "Storage";

  }


  return value
    .substring(
      0,
      STORAGE_LIMITS
        .MAX_NAME_LENGTH
    );

}


// =====================================================
// NORMALIZE DESCRIPTION
// =====================================================

function normalizeStorageDescription(
  description
) {

  return String(
    description ||
    ""
  )
    .trim()
    .substring(
      0,
      STORAGE_LIMITS
        .MAX_DESCRIPTION_LENGTH
    );

}


// =====================================================
// NORMALIZE STORAGE BYTES
// =====================================================

function normalizeStorageBytes(
  value,
  defaultValue
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
      defaultValue ||
      0
    );

  }


  return Math.floor(
    number
  );

}


// =====================================================
// NORMALIZE STORAGE NUMBER
// =====================================================

function normalizeStorageNumber(
  value,
  defaultValue
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
      defaultValue ||
      0
    );

  }


  return Math.floor(
    number
  );

}


// =====================================================
// CONVERT STORAGE OBJECT TO SHEET ROW
// =====================================================

function storageObjectToRow(
  storage
) {

  if (
    !storage
  ) {

    throw new Error(
      "Storage object is required"
    );

  }


  return [

    storage.id || "",

    storage.name || "",

    storage.type || "",

    storage.status || "",

    storage.description || "",

    Number(
      storage.totalBytes || 0
    ),

    Number(
      storage.usedBytes || 0
    ),

    calculateStorageAvailable(
      storage.totalBytes,
      storage.usedBytes
    ),

    Number(
      storage.maxFileSize || 0
    ),

    Number(
      storage.roomCount || 0
    ),

    Number(
      storage.nodeCount || 0
    ),

    storage.createdBy || "",

    storage.createdAt || "",

    storage.updatedAt || ""

  ];

}


// =====================================================
// CONVERT SHEET ROW TO STORAGE OBJECT
// =====================================================

function storageRowToObject(
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
        STORAGE_COLUMNS
          .TOTAL_BYTES - 1
      ] || 0
    );


  const usedBytes =
    Number(
      row[
        STORAGE_COLUMNS
          .USED_BYTES - 1
      ] || 0
    );


  return {

    row:
      rowNumber || null,

    id:
      row[
        STORAGE_COLUMNS
          .ID - 1
      ] || "",

    name:
      row[
        STORAGE_COLUMNS
          .NAME - 1
      ] || "",

    type:
      row[
        STORAGE_COLUMNS
          .TYPE - 1
      ] || "",

    status:
      row[
        STORAGE_COLUMNS
          .STATUS - 1
      ] || "",

    description:
      row[
        STORAGE_COLUMNS
          .DESCRIPTION - 1
      ] || "",

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    // Always calculate this value.
    availableBytes:
      calculateStorageAvailable(
        totalBytes,
        usedBytes
      ),

    maxFileSize:
      Number(
        row[
          STORAGE_COLUMNS
            .MAX_FILE_SIZE - 1
        ] ||
        STORAGE_DEFAULTS
          .MAX_FILE_SIZE
      ),

    roomCount:
      Number(
        row[
          STORAGE_COLUMNS
            .ROOM_COUNT - 1
        ] || 0
      ),

    nodeCount:
      Number(
        row[
          STORAGE_COLUMNS
            .NODE_COUNT - 1
        ] || 0
      ),

    createdBy:
      row[
        STORAGE_COLUMNS
          .CREATED_BY - 1
      ] || "",

    createdAt:
      row[
        STORAGE_COLUMNS
          .CREATED_AT - 1
      ] || "",

    updatedAt:
      row[
        STORAGE_COLUMNS
          .UPDATED_AT - 1
      ] || ""

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
    normalizeStorageBytes(
      totalBytes,
      0
    );


  usedBytes =
    normalizeStorageBytes(
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
// CALCULATE STORAGE USAGE PERCENTAGE
// =====================================================

function calculateStorageUsagePercent(
  totalBytes,
  usedBytes
) {

  totalBytes =
    normalizeStorageBytes(
      totalBytes,
      0
    );


  usedBytes =
    normalizeStorageBytes(
      usedBytes,
      0
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
// GET STORAGE AVAILABLE BYTES
// =====================================================

function getStorageAvailableBytes(
  storage
) {

  if (
    !storage
  ) {

    return 0;

  }


  return calculateStorageAvailable(

    storage.totalBytes,

    storage.usedBytes

  );

}


// =====================================================
// GET STORAGE USAGE PERCENT
// =====================================================

function getStorageUsagePercent(
  storage
) {

  if (
    !storage
  ) {

    return 0;

  }


  return calculateStorageUsagePercent(

    storage.totalBytes,

    storage.usedBytes

  );

}


// =====================================================
// CHECK STORAGE CAPACITY
// =====================================================

function hasStorageCapacity(
  storage,
  requiredBytes
) {

  if (
    !storage
  ) {

    return false;

  }


  requiredBytes =
    normalizeStorageBytes(
      requiredBytes,
      0
    );


  const available =
    getStorageAvailableBytes(
      storage
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

  if (
    !storage
  ) {

    return false;

  }


  fileSize =
    normalizeStorageBytes(
      fileSize,
      0
    );


  const maxFileSize =
    normalizeStorageBytes(
      storage.maxFileSize,
      0
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
// CHECK STORAGE IS ACTIVE
// =====================================================

function isStorageActive(
  storage
) {

  if (
    !storage
  ) {

    return false;

  }


  return String(
    storage.status ||
    ""
  )
    .toLowerCase() ===
    String(
      STORAGE_STATUS.ACTIVE
    )
      .toLowerCase();

}


// =====================================================
// CHECK STORAGE IS FULL
// =====================================================

function isStorageFull(
  storage
) {

  if (
    !storage
  ) {

    return false;

  }


  return (
    getStorageAvailableBytes(
      storage
    ) <= 0
  );

}


// =====================================================
// GET CORE STORAGE STATUS
// =====================================================

function getStorageCoreStatus(
  storage
) {

  if (
    !storage
  ) {

    return (
      typeof STORAGE_STATUS !==
      "undefined"

        ? STORAGE_STATUS.ERROR

        : "Error"
    );

  }


  if (
    typeof STORAGE_STATUS !==
    "undefined" &&
    storage.status ===
    STORAGE_STATUS.DISABLED
  ) {

    return STORAGE_STATUS.DISABLED;

  }


  if (
    isStorageFull(
      storage
    )
  ) {

    return (
      typeof STORAGE_STATUS !==
      "undefined"

        ? STORAGE_STATUS.FULL

        : "Full"
    );

  }


  return (
    typeof STORAGE_STATUS !==
    "undefined"

      ? STORAGE_STATUS.ACTIVE

      : "Active"
  );

}


// =====================================================
// VALIDATE STORAGE NAME
// =====================================================

function validateStorageName(
  name
) {

  const value =
    String(
      name ||
      ""
    )
      .trim();


  if (
    value.length <
    STORAGE_LIMITS
      .MIN_NAME_LENGTH
  ) {

    return {

      valid:
        false,

      error:
        "Storage name is required"

    };

  }


  if (
    value.length >
    STORAGE_LIMITS
      .MAX_NAME_LENGTH
  ) {

    return {

      valid:
        false,

      error:
        "Storage name is too long"

    };

  }


  return {

    valid:
      true,

    error:
      null

  };

}


// =====================================================
// VALIDATE STORAGE DESCRIPTION
// =====================================================

function validateStorageDescription(
  description
) {

  const value =
    String(
      description ||
      ""
    )
      .trim();


  if (
    value.length >
    STORAGE_LIMITS
      .MAX_DESCRIPTION_LENGTH
  ) {

    return {

      valid:
        false,

      error:
        "Storage description is too long"

    };

  }


  return {

    valid:
      true,

    error:
      null

  };

}


// =====================================================
// VALIDATE STORAGE OBJECT
// =====================================================

function validateStorageObject(
  storage
) {

  if (
    !storage
  ) {

    return {

      valid:
        false,

      errors: [

        "Storage is required"

      ]

    };

  }


  const errors = [];


  // ---------------------------------------------------
  // ID
  // ---------------------------------------------------

  if (
    !storage.id
  ) {

    errors.push(
      "Storage ID is required"
    );

  }


  // ---------------------------------------------------
  // NAME
  // ---------------------------------------------------

  const nameValidation =
    validateStorageName(
      storage.name
    );


  if (
    !nameValidation.valid
  ) {

    errors.push(
      nameValidation.error
    );

  }


  // ---------------------------------------------------
  // DESCRIPTION
  // ---------------------------------------------------

  const descriptionValidation =
    validateStorageDescription(
      storage.description
    );


  if (
    !descriptionValidation.valid
  ) {

    errors.push(
      descriptionValidation.error
    );

  }


  // ---------------------------------------------------
  // TYPE
  // ---------------------------------------------------

  if (
    !storage.type
  ) {

    errors.push(
      "Storage type is required"
    );

  }


  // ---------------------------------------------------
  // STATUS
  // ---------------------------------------------------

  if (
    !storage.status
  ) {

    errors.push(
      "Storage status is required"
    );

  }


  // ---------------------------------------------------
  // BYTE VALIDATION
  // ---------------------------------------------------

  const totalBytes =
    Number(
      storage.totalBytes || 0
    );


  const usedBytes =
    Number(
      storage.usedBytes || 0
    );


  const maxFileSize =
    Number(
      storage.maxFileSize || 0
    );


  if (
    !isFinite(totalBytes) ||
    totalBytes < 0
  ) {

    errors.push(
      "Invalid total storage size"
    );

  }


  if (
    !isFinite(usedBytes) ||
    usedBytes < 0
  ) {

    errors.push(
      "Invalid used storage size"
    );

  }


  if (
    usedBytes >
    totalBytes
  ) {

    errors.push(
      "Used storage cannot exceed total storage"
    );

  }


  if (
    !isFinite(maxFileSize) ||
    maxFileSize < 0
  ) {

    errors.push(
      "Invalid maximum file size"
    );

  }


  // ---------------------------------------------------
  // COUNTS
  // ---------------------------------------------------

  if (
    Number(
      storage.roomCount || 0
    ) < 0
  ) {

    errors.push(
      "Invalid room count"
    );

  }


  if (
    Number(
      storage.nodeCount || 0
    ) < 0
  ) {

    errors.push(
      "Invalid node count"
    );

  }


  return {

    valid:
      errors.length === 0,

    errors:
      errors,

    error:
      errors.length > 0
        ? errors[0]
        : null

  };

}


// =====================================================
// NORMALIZE STORAGE RECORD
// =====================================================

function normalizeStorageRecord(
  storage
) {

  if (
    !storage
  ) {

    return null;

  }


  const record =
    buildStorageRecord(
      storage
    );


  return record;

}


// =====================================================
// GET STORAGE MODEL CONFIG
// =====================================================

function getStorageModelConfig() {

  return {

    version:
      STORAGE_MODEL_VERSION,

    columns:
      STORAGE_COLUMNS,

    defaults:
      STORAGE_DEFAULTS,

    limits:
      STORAGE_LIMITS,

    defaultType:
      DEFAULT_STORAGE_TYPE,

    defaultStatus:
      DEFAULT_STORAGE_STATUS,

    defaultAllocation:
      DEFAULT_STORAGE_ALLOCATION

  };

}


// =====================================================
// STORAGE CORE HEALTH CHECK
// =====================================================

function getStorageCoreHealth() {

  const checks = {

    columns:
      !!STORAGE_COLUMNS,

    defaults:
      !!STORAGE_DEFAULTS,

    limits:
      !!STORAGE_LIMITS,

    modelVersion:
      STORAGE_MODEL_VERSION

  };


  return {

    healthy:
      checks.columns &&
      checks.defaults &&
      checks.limits,

    checks:
      checks

  };

}