// =====================================================
// STORAGECONFIG.GS
// Storage Configuration
// Cloud Project Platform
// =====================================================


// =====================================================
// STORAGE TYPES
// =====================================================

const STORAGE_TYPES = {

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
// STORAGE STATUS
// =====================================================

const STORAGE_STATUS = {

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  DISABLED:
    "Disabled",

  FULL:
    "Full",

  MAINTENANCE:
    "Maintenance",

  ERROR:
    "Error"

};


// =====================================================
// STORAGE ALLOCATION STRATEGIES
// =====================================================

const STORAGE_ALLOCATION = {

  LEAST_USED:
    "Least Used",

  MOST_AVAILABLE:
    "Most Available",

  ROUND_ROBIN:
    "Round Robin",

  RANDOM:
    "Random",

  FIRST_AVAILABLE:
    "First Available"

};


// =====================================================
// STORAGE ACCESS MODES
// =====================================================

const STORAGE_ACCESS_MODES = {

  PRIVATE:
    "Private",

  PUBLIC:
    "Public",

  SHARED:
    "Shared",

  RESTRICTED:
    "Restricted"

};


// =====================================================
// STORAGE FILE STATUSES
// =====================================================

const STORAGE_FILE_STATUS = {

  ACTIVE:
    "Active",

  UPLOADING:
    "Uploading",

  PROCESSING:
    "Processing",

  READY:
    "Ready",

  FAILED:
    "Failed",

  DELETED:
    "Deleted",

  ARCHIVED:
    "Archived"

};


// =====================================================
// STORAGE CONFIGURATION
// =====================================================

const STORAGE_CONFIG = {

  ENABLED:
    true,

  DEFAULT_TYPE:
    STORAGE_TYPES.GOOGLE_DRIVE,

  DEFAULT_STATUS:
    STORAGE_STATUS.ACTIVE,

  DEFAULT_ALLOCATION:
    STORAGE_ALLOCATION.LEAST_USED,

  DEFAULT_ACCESS:
    STORAGE_ACCESS_MODES.PRIVATE,

  MAX_STORAGE_COUNT:
    100,

  MAX_ROOMS_PER_STORAGE:
    100,

  MAX_NODES_PER_STORAGE:
    100,

  ENABLE_UPLOADS:
    true,

  ENABLE_DOWNLOADS:
    true,

  ENABLE_PUBLIC_FILES:
    false,

  ENABLE_VERSIONING:
    true,

  ENABLE_CHECKSUM:
    true,

  ENABLE_CLEANUP:
    true,

  ENABLE_HEALTH_CHECK:
    true

};


// =====================================================
// STORAGE SIZE DEFAULTS
// =====================================================

const STORAGE_SIZE_DEFAULTS = {

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  DEFAULT_STORAGE_SIZE:
    15 * 1024 * 1024 * 1024,

  MIN_FILE_SIZE:
    1,

  MAX_STORAGE_SIZE:
    1024 * 1024 * 1024 * 1024

};


// =====================================================
// STORAGE RETENTION
// =====================================================

const STORAGE_RETENTION = {

  DELETED_FILE_DAYS:
    30,

  FAILED_UPLOAD_DAYS:
    7,

  TEMP_FILE_DAYS:
    1,

  ARCHIVED_FILE_DAYS:
    365

};


// =====================================================
// STORAGE VALIDATION
// =====================================================

function isValidStorageType(
  type
) {

  return Object
    .values(
      STORAGE_TYPES
    )
    .indexOf(
      type
    ) !== -1;

}


// =====================================================
// VALIDATE STORAGE STATUS
// =====================================================

function isValidStorageStatus(
  status
) {

  return Object
    .values(
      STORAGE_STATUS
    )
    .indexOf(
      status
    ) !== -1;

}


// =====================================================
// VALIDATE ALLOCATION STRATEGY
// =====================================================

function isValidStorageAllocation(
  allocation
) {

  return Object
    .values(
      STORAGE_ALLOCATION
    )
    .indexOf(
      allocation
    ) !== -1;

}


// =====================================================
// VALIDATE ACCESS MODE
// =====================================================

function isValidStorageAccessMode(
  access
) {

  return Object
    .values(
      STORAGE_ACCESS_MODES
    )
    .indexOf(
      access
    ) !== -1;

}


// =====================================================
// VALIDATE FILE STATUS
// =====================================================

function isValidStorageFileStatus(
  status
) {

  return Object
    .values(
      STORAGE_FILE_STATUS
    )
    .indexOf(
      status
    ) !== -1;

}


// =====================================================
// GET STORAGE CONFIGURATION
// =====================================================

function getStorageConfig() {

  return {

    enabled:
      STORAGE_CONFIG.ENABLED,

    types:
      STORAGE_TYPES,

    statuses:
      STORAGE_STATUS,

    allocations:
      STORAGE_ALLOCATION,

    accessModes:
      STORAGE_ACCESS_MODES,

    fileStatuses:
      STORAGE_FILE_STATUS,

    config:
      STORAGE_CONFIG,

    sizes:
      STORAGE_SIZE_DEFAULTS,

    retention:
      STORAGE_RETENTION

  };

}


// =====================================================
// CHECK STORAGE SYSTEM ENABLED
// =====================================================

function isStorageEnabled() {

  return (
    STORAGE_CONFIG.ENABLED ===
    true
  );

}


// =====================================================
// CHECK UPLOADS ENABLED
// =====================================================

function isStorageUploadEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_UPLOADS ===
    true
  );

}


// =====================================================
// CHECK DOWNLOADS ENABLED
// =====================================================

function isStorageDownloadEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_DOWNLOADS ===
    true
  );

}


// =====================================================
// CHECK PUBLIC STORAGE ENABLED
// =====================================================

function isPublicStorageEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_PUBLIC_FILES ===
    true
  );

}


// =====================================================
// CHECK VERSIONING ENABLED
// =====================================================

function isStorageVersioningEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_VERSIONING ===
    true
  );

}


// =====================================================
// CHECK CHECKSUM ENABLED
// =====================================================

function isStorageChecksumEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_CHECKSUM ===
    true
  );

}


// =====================================================
// CHECK CLEANUP ENABLED
// =====================================================

function isStorageCleanupEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_CLEANUP ===
    true
  );

}


// =====================================================
// CHECK HEALTH CHECK ENABLED
// =====================================================

function isStorageHealthCheckEnabled() {

  return (
    isStorageEnabled() &&
    STORAGE_CONFIG
      .ENABLE_HEALTH_CHECK ===
    true
  );

}


// =====================================================
// GET DEFAULT STORAGE SETTINGS
// =====================================================

function getDefaultStorageSettings() {

  return {

    type:
      STORAGE_CONFIG.DEFAULT_TYPE,

    status:
      STORAGE_CONFIG.DEFAULT_STATUS,

    allocation:
      STORAGE_CONFIG.DEFAULT_ALLOCATION,

    access:
      STORAGE_CONFIG.DEFAULT_ACCESS,

    maxFileSize:
      STORAGE_SIZE_DEFAULTS
        .MAX_FILE_SIZE,

    storageSize:
      STORAGE_SIZE_DEFAULTS
        .DEFAULT_STORAGE_SIZE

  };

}


// =====================================================
// GET STORAGE RETENTION SETTINGS
// =====================================================

function getStorageRetentionSettings() {

  return {

    deletedFiles:
      STORAGE_RETENTION
        .DELETED_FILE_DAYS,

    failedUploads:
      STORAGE_RETENTION
        .FAILED_UPLOAD_DAYS,

    temporaryFiles:
      STORAGE_RETENTION
        .TEMP_FILE_DAYS,

    archivedFiles:
      STORAGE_RETENTION
        .ARCHIVED_FILE_DAYS

  };

}


// =====================================================
// STORAGE CONFIGURATION HEALTH
// =====================================================

function validateStorageConfiguration() {

  const errors = [];


  if (
    !isValidStorageType(
      STORAGE_CONFIG.DEFAULT_TYPE
    )
  ) {

    errors.push(
      "Invalid default storage type"
    );

  }


  if (
    !isValidStorageStatus(
      STORAGE_CONFIG.DEFAULT_STATUS
    )
  ) {

    errors.push(
      "Invalid default storage status"
    );

  }


  if (
    !isValidStorageAllocation(
      STORAGE_CONFIG.DEFAULT_ALLOCATION
    )
  ) {

    errors.push(
      "Invalid default allocation strategy"
    );

  }


  if (
    !isValidStorageAccessMode(
      STORAGE_CONFIG.DEFAULT_ACCESS
    )
  ) {

    errors.push(
      "Invalid default access mode"
    );

  }


  if (
    STORAGE_SIZE_DEFAULTS
      .MAX_FILE_SIZE <= 0
  ) {

    errors.push(
      "Maximum file size must be greater than zero"
    );

  }


  if (
    STORAGE_SIZE_DEFAULTS
      .MAX_FILE_SIZE >
    STORAGE_SIZE_DEFAULTS
      .MAX_STORAGE_SIZE
  ) {

    errors.push(
      "Maximum file size cannot exceed maximum storage size"
    );

  }


  return {

    valid:
      errors.length === 0,

    errors:
      errors

  };

}