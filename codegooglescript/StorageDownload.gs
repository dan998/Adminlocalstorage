// =====================================================
// STORAGEDOWNLOAD.GS
// Storage Download Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// DOWNLOAD STATUS
// =====================================================

const STORAGE_DOWNLOAD_STATUS = {

  PENDING:
    "Pending",

  PREPARING:
    "Preparing",

  READY:
    "Ready",

  COMPLETED:
    "Completed",

  FAILED:
    "Failed",

  CANCELLED:
    "Cancelled"

};


// =====================================================
// DOWNLOAD LIMITS
// =====================================================

const STORAGE_DOWNLOAD_LIMITS = {

  MAX_FILE_SIZE:
    50 * 1024 * 1024,

  MAX_BATCH_FILES:
    100

};


// =====================================================
// GENERATE DOWNLOAD ID
// =====================================================

function generateStorageDownloadId() {

  return (
    "DOWNLOAD-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// FIND FILE
// =====================================================

function findStorageFileForDownload(
  fileId
) {

  if (!fileId) {

    throw new Error(
      "File ID is required"
    );

  }


  // ---------------------------------------------------
  // Use the file module when available
  // ---------------------------------------------------

  if (
    typeof findFileById ===
    "function"
  ) {

    return findFileById(
      fileId
    );

  }


  if (
    typeof getFileById ===
    "function"
  ) {

    return getFileById(
      fileId
    );

  }


  throw new Error(
    "File lookup function is not available"
  );

}


// =====================================================
// VALIDATE DOWNLOAD FILE
// =====================================================

function validateStorageDownloadFile(
  file
) {

  if (!file) {

    throw new Error(
      "File not found"
    );

  }


  if (!file.id) {

    throw new Error(
      "Invalid file record"
    );

  }


  if (
    file.deleted === true
  ) {

    throw new Error(
      "File has been deleted"
    );

  }


  if (
    String(
      file.status || ""
    ).toLowerCase() ===
    "deleted"
  ) {

    throw new Error(
      "File has been deleted"
    );

  }


  return true;

}


// =====================================================
// CHECK DOWNLOAD SIZE
// =====================================================

function validateStorageDownloadSize(
  fileSize
) {

  fileSize =
    Number(
      fileSize || 0
    );


  if (
    !isFinite(fileSize) ||
    fileSize < 0
  ) {

    throw new Error(
      "Invalid file size"
    );

  }


  return true;

}


// =====================================================
// CHECK FILE ACCESS
// =====================================================

function canDownloadStorageFile(
  file,
  userId,
  options
) {

  options =
    options || {};


  if (!file) {

    return {

      allowed:
        false,

      reason:
        "File not found"

    };

  }


  if (
    options.isAdmin === true
  ) {

    return {

      allowed:
        true,

      reason:
        null

    };

  }


  // ---------------------------------------------------
  // Owner access
  // ---------------------------------------------------

  if (
    file.userId &&
    userId &&
    String(
      file.userId
    ) ===
    String(
      userId
    )
  ) {

    return {

      allowed:
        true,

      reason:
        null

    };

  }


  // ---------------------------------------------------
  // Explicit public file
  // ---------------------------------------------------

  if (
    file.public === true ||
    file.isPublic === true
  ) {

    return {

      allowed:
        true,

      reason:
        null

    };

  }


  // ---------------------------------------------------
  // Permission helper
  // ---------------------------------------------------

  if (
    typeof userCanAccessFile ===
    "function"
  ) {

    const allowed =
      userCanAccessFile(
        userId,
        file.id
      );


    return {

      allowed:
        allowed === true,

      reason:
        allowed === true
          ? null
          : "Access denied"

    };

  }


  return {

    allowed:
      false,

    reason:
      "Access denied"

  };

}


// =====================================================
// GET FILE STORAGE LOCATION
// =====================================================

function getStorageFileLocation(
  file
) {

  if (!file) {

    throw new Error(
      "File is required"
    );

  }


  const storageId =
    file.storageId ||
    file.storage_id;


  const nodeId =
    file.nodeId ||
    file.node_id;


  const roomId =
    file.roomId ||
    file.room_id;


  if (
    !storageId
  ) {

    throw new Error(
      "File storage location is missing"
    );

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "File storage not found"
    );

  }


  let node =
    null;


  if (
    nodeId &&
    typeof findStorageNodeById ===
    "function"
  ) {

    node =
      findStorageNodeById(
        nodeId
      );

  }


  let room =
    null;


  if (
    roomId &&
    typeof findStorageRoomById ===
    "function"
  ) {

    room =
      findStorageRoomById(
        roomId
      );

  }


  return {

    storage:
      storage,

    node:
      node,

    room:
      room

  };

}


// =====================================================
// CREATE DOWNLOAD REQUEST
// =====================================================

function createStorageDownload(
  data
) {

  data =
    data || {};


  if (!data.fileId) {

    throw new Error(
      "File ID is required"
    );

  }


  const file =
    findStorageFileForDownload(
      data.fileId
    );


  validateStorageDownloadFile(
    file
  );


  const access =
    canDownloadStorageFile(
      file,
      data.userId,
      data
    );


  if (!access.allowed) {

    throw new Error(
      access.reason
    );

  }


  const fileSize =
    Number(
      file.size ||
      file.fileSize ||
      0
    );


  validateStorageDownloadSize(
    fileSize
  );


  const location =
    getStorageFileLocation(
      file
    );


  return {

    downloadId:
      generateStorageDownloadId(),

    fileId:
      file.id,

    fileName:
      file.name ||
      file.fileName ||
      "",

    fileSize:
      fileSize,

    mimeType:
      file.mimeType ||
      "application/octet-stream",

    storageId:
      location.storage.id,

    nodeId:
      location.node
        ? location.node.id
        : null,

    roomId:
      location.room
        ? location.room.id
        : null,

    status:
      STORAGE_DOWNLOAD_STATUS.PENDING,

    createdAt:
      new Date()

  };

}


// =====================================================
// PREPARE DOWNLOAD
// =====================================================

function prepareStorageDownload(
  data
) {

  const request =
    createStorageDownload(
      data
    );


  request.status =
    STORAGE_DOWNLOAD_STATUS.PREPARING;


  request.updatedAt =
    new Date();


  return request;

}


// =====================================================
// GET DOWNLOAD TARGET
// =====================================================

function getStorageDownloadTarget(
  fileId
) {

  const file =
    findStorageFileForDownload(
      fileId
    );


  validateStorageDownloadFile(
    file
  );


  const location =
    getStorageFileLocation(
      file
    );


  return {

    fileId:
      file.id,

    storageId:
      location.storage.id,

    storageName:
      location.storage.name,

    nodeId:
      location.node
        ? location.node.id
        : null,

    nodeName:
      location.node
        ? location.node.name
        : null,

    roomId:
      location.room
        ? location.room.id
        : null

  };

}


// =====================================================
// DOWNLOAD FROM GOOGLE DRIVE
// =====================================================

function downloadStorageDriveFile(
  fileId
) {

  if (!fileId) {

    throw new Error(
      "File ID is required"
    );

  }


  /*
   * This function assumes that fileId is a
   * Google Drive file ID.
   *
   * The actual Drive account used depends
   * on the storage node/provider layer.
   */


  const driveFile =
    DriveApp.getFileById(
      fileId
    );


  if (!driveFile) {

    throw new Error(
      "Google Drive file not found"
    );

  }


  const blob =
    driveFile.getBlob();


  return {

    fileId:
      fileId,

    fileName:
      driveFile.getName(),

    mimeType:
      blob.getContentType(),

    size:
      blob.getBytes().length,

    blob:
      blob

  };

}


// =====================================================
// GET DOWNLOAD BLOB
// =====================================================

function getStorageDownloadBlob(
  fileId,
  options
) {

  options =
    options || {};


  const file =
    findStorageFileForDownload(
      fileId
    );


  validateStorageDownloadFile(
    file
  );


  const access =
    canDownloadStorageFile(
      file,
      options.userId,
      options
    );


  if (!access.allowed) {

    throw new Error(
      access.reason
    );

  }


  const provider =
    String(
      file.provider ||
      file.storageProvider ||
      "GOOGLE_DRIVE"
    ).toUpperCase();


  // ---------------------------------------------------
  // GOOGLE DRIVE
  // ---------------------------------------------------

  if (
    provider ===
    "GOOGLE_DRIVE"
  ) {

    return downloadStorageDriveFile(
      file.externalId ||
      file.driveFileId ||
      file.providerFileId ||
      file.id
    );

  }


  // ---------------------------------------------------
  // CUSTOM PROVIDER
  // ---------------------------------------------------

  if (
    typeof downloadFromStorageProvider ===
    "function"
  ) {

    return downloadFromStorageProvider(
      file,
      options
    );

  }


  throw new Error(
    "Unsupported storage provider: " +
    provider
  );

}


// =====================================================
// COMPLETE DOWNLOAD
// =====================================================

function completeStorageDownload(
  downloadData
) {

  downloadData =
    downloadData || {};


  if (!downloadData.downloadId) {

    throw new Error(
      "Download ID is required"
    );

  }


  return {

    success:
      true,

    downloadId:
      downloadData.downloadId,

    fileId:
      downloadData.fileId ||
      null,

    status:
      STORAGE_DOWNLOAD_STATUS.COMPLETED,

    completedAt:
      new Date()

  };

}


// =====================================================
// FAIL DOWNLOAD
// =====================================================

function failStorageDownload(
  downloadData
) {

  downloadData =
    downloadData || {};


  return {

    success:
      false,

    downloadId:
      downloadData.downloadId ||
      null,

    fileId:
      downloadData.fileId ||
      null,

    status:
      STORAGE_DOWNLOAD_STATUS.FAILED,

    error:
      downloadData.error ||
      "Storage download failed",

    failedAt:
      new Date()

  };

}


// =====================================================
// CANCEL DOWNLOAD
// =====================================================

function cancelStorageDownload(
  downloadId
) {

  if (!downloadId) {

    throw new Error(
      "Download ID is required"
    );

  }


  return {

    success:
      true,

    downloadId:
      downloadId,

    status:
      STORAGE_DOWNLOAD_STATUS.CANCELLED,

    cancelledAt:
      new Date()

  };

}


// =====================================================
// DOWNLOAD INFORMATION
// =====================================================

function getStorageDownloadInfo(
  fileId,
  userId,
  options
) {

  options =
    options || {};


  const file =
    findStorageFileForDownload(
      fileId
    );


  validateStorageDownloadFile(
    file
  );


  const access =
    canDownloadStorageFile(
      file,
      userId,
      options
    );


  if (!access.allowed) {

    throw new Error(
      access.reason
    );

  }


  const location =
    getStorageFileLocation(
      file
    );


  return {

    fileId:
      file.id,

    fileName:
      file.name ||
      file.fileName ||
      "",

    fileSize:
      Number(
        file.size ||
        file.fileSize ||
        0
      ),

    mimeType:
      file.mimeType ||
      "application/octet-stream",

    storageId:
      location.storage.id,

    storageName:
      location.storage.name,

    nodeId:
      location.node
        ? location.node.id
        : null,

    roomId:
      location.room
        ? location.room.id
        : null,

    downloadable:
      true

  };

}


// =====================================================
// CHECK DOWNLOAD ACCESS
// =====================================================

function validateStorageDownloadAccess(
  fileId,
  userId,
  options
) {

  options =
    options || {};


  const file =
    findStorageFileForDownload(
      fileId
    );


  validateStorageDownloadFile(
    file
  );


  const access =
    canDownloadStorageFile(
      file,
      userId,
      options
    );


  if (!access.allowed) {

    throw new Error(
      access.reason
    );

  }


  return {

    allowed:
      true,

    fileId:
      fileId

  };

}


// =====================================================
// BATCH DOWNLOAD VALIDATION
// =====================================================

function validateStorageBatchDownload(
  fileIds,
  userId,
  options
) {

  options =
    options || {};


  if (
    !Array.isArray(
      fileIds
    )
  ) {

    throw new Error(
      "fileIds must be an array"
    );

  }


  if (
    fileIds.length >
    STORAGE_DOWNLOAD_LIMITS
      .MAX_BATCH_FILES
  ) {

    throw new Error(
      "Too many files requested"
    );

  }


  const results = [];


  fileIds.forEach(
    function(fileId) {

      try {

        const info =
          getStorageDownloadInfo(
            fileId,
            userId,
            options
          );


        results.push({

          fileId:
            fileId,

          allowed:
            true,

          info:
            info

        });

      }
      catch (error) {

        results.push({

          fileId:
            fileId,

          allowed:
            false,

          error:
            error.message

        });

      }

    }
  );


  return results;

}


// =====================================================
// DOWNLOAD CONFIG
// =====================================================

function getStorageDownloadConfig() {

  return {

    statuses:
      STORAGE_DOWNLOAD_STATUS,

    limits:
      STORAGE_DOWNLOAD_LIMITS,

    providers: [

      "GOOGLE_DRIVE"

    ],

    accessControl:
      true,

    batchDownloads:
      true,

    multiStorageSupport:
      true,

    multiNodeSupport:
      true

  };

}