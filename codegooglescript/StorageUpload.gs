// =====================================================
// STORAGEUPLOAD.GS
// Storage Upload Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// UPLOAD STATUS
// =====================================================

const STORAGE_UPLOAD_STATUS = {

  PENDING:
    "Pending",

  UPLOADING:
    "Uploading",

  COMPLETED:
    "Completed",

  FAILED:
    "Failed",

  CANCELLED:
    "Cancelled"

};


// =====================================================
// UPLOAD LIMITS
// =====================================================

const STORAGE_UPLOAD_LIMITS = {

  MAX_FILENAME_LENGTH:
    255,

  MAX_METADATA_LENGTH:
    5000

};


// =====================================================
// GENERATE UPLOAD ID
// =====================================================

function generateStorageUploadId() {

  return (
    "UPLOAD-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// VALIDATE FILE NAME
// =====================================================

function validateStorageFileName(
  fileName
) {

  if (!fileName) {

    throw new Error(
      "File name is required"
    );

  }


  fileName =
    String(
      fileName
    ).trim();


  if (
    fileName.length === 0
  ) {

    throw new Error(
      "File name cannot be empty"
    );

  }


  if (
    fileName.length >
    STORAGE_UPLOAD_LIMITS
      .MAX_FILENAME_LENGTH
  ) {

    throw new Error(
      "File name is too long"
    );

  }


  return true;

}


// =====================================================
// VALIDATE FILE SIZE
// =====================================================

function validateStorageFileSize(
  fileSize
) {

  fileSize =
    Number(
      fileSize || 0
    );


  if (
    !isFinite(fileSize)
  ) {

    throw new Error(
      "Invalid file size"
    );

  }


  if (
    fileSize < 0
  ) {

    throw new Error(
      "File size cannot be negative"
    );

  }


  return true;

}


// =====================================================
// VALIDATE STORAGE UPLOAD
// =====================================================

function validateStorageUpload(
  data
) {

  data =
    data || {};


  validateStorageFileName(
    data.fileName
  );


  validateStorageFileSize(
    data.fileSize
  );


  if (
    data.storageId
  ) {

    const storage =
      findStorageById(
        data.storageId
      );


    if (!storage) {

      throw new Error(
        "Storage not found"
      );

    }


    if (
      String(
        storage.status
      ).toLowerCase() !==
      String(
        STORAGE_STATUS.ACTIVE
      ).toLowerCase()
    ) {

      throw new Error(
        "Storage is not active"
      );

    }


    if (
      !isFileSizeAllowed(
        storage,
        data.fileSize
      )
    ) {

      throw new Error(
        "File exceeds storage maximum file size"
      );

    }

  }


  return true;

}


// =====================================================
// CREATE UPLOAD REQUEST
// =====================================================

function createStorageUpload(
  data
) {

  data =
    data || {};


  validateStorageUpload(
    data
  );


  const fileSize =
    Number(
      data.fileSize || 0
    );


  const uploadId =
    generateStorageUploadId();


  return {

    uploadId:
      uploadId,

    fileName:
      String(
        data.fileName
      ).trim(),

    fileSize:
      fileSize,

    mimeType:
      data.mimeType ||
      "application/octet-stream",

    userId:
      data.userId ||
      "",

    projectId:
      data.projectId ||
      "",

    storageId:
      data.storageId ||
      null,

    nodeId:
      data.nodeId ||
      null,

    roomId:
      data.roomId ||
      null,

    status:
      STORAGE_UPLOAD_STATUS.PENDING,

    createdAt:
      new Date()

  };

}


// =====================================================
// FIND STORAGE FOR UPLOAD
// =====================================================

function selectStorageForUpload(
  fileSize,
  storageId
) {

  fileSize =
    Number(
      fileSize || 0
    );


  validateStorageFileSize(
    fileSize
  );


  // ---------------------------------------------------
  // SPECIFIC STORAGE REQUEST
  // ---------------------------------------------------

  if (
    storageId
  ) {

    const storage =
      findStorageById(
        storageId
      );


    if (!storage) {

      throw new Error(
        "Storage not found"
      );

    }


    if (
      !hasStorageCapacity(
        storage,
        fileSize
      )
    ) {

      throw new Error(
        "Requested storage does not have enough capacity"
      );

    }


    if (
      !isFileSizeAllowed(
        storage,
        fileSize
      )
    ) {

      throw new Error(
        "File exceeds storage maximum file size"
      );

    }


    const node =
      findStorageNodeForFile(
        fileSize,
        storageId
      );


    if (!node) {

      throw new Error(
        "No available node found in requested storage"
      );

    }


    return {

      storage:
        storage,

      node:
        node

    };

  }


  // ---------------------------------------------------
  // AUTOMATIC STORAGE SELECTION
  // ---------------------------------------------------

  const allocation =
    findStorageForFile(
      fileSize
    );


  if (!allocation) {

    throw new Error(
      "No storage with enough capacity is available"
    );

  }


  const node =
    findStorageNodeForFile(
      fileSize,
      allocation.storage.id
    );


  if (!node) {

    throw new Error(
      "No storage node is available"
    );

  }


  return {

    storage:
      allocation.storage,

    node:
      node

  };

}


// =====================================================
// PREPARE UPLOAD
// =====================================================

function prepareStorageUpload(
  data
) {

  const upload =
    createStorageUpload(
      data
    );


  const selected =
    selectStorageForUpload(
      upload.fileSize,
      upload.storageId
    );


  upload.storageId =
    selected.storage.id;


  upload.nodeId =
    selected.node.id;


  upload.status =
    STORAGE_UPLOAD_STATUS.PENDING;


  upload.updatedAt =
    new Date();


  return {

    upload:
      upload,

    storage:
      selected.storage,

    node:
      selected.node

  };

}


// =====================================================
// CHECK UPLOAD CAPACITY
// =====================================================

function checkStorageUploadCapacity(
  fileSize,
  storageId
) {

  fileSize =
    Number(
      fileSize || 0
    );


  validateStorageFileSize(
    fileSize
  );


  if (
    storageId
  ) {

    const storage =
      findStorageById(
        storageId
      );


    if (!storage) {

      return {

        allowed:
          false,

        reason:
          "Storage not found"

      };

    }


    if (
      !hasStorageCapacity(
        storage,
        fileSize
      )
    ) {

      return {

        allowed:
          false,

        reason:
          "Insufficient storage capacity"

      };

    }


    if (
      !isFileSizeAllowed(
        storage,
        fileSize
      )
    ) {

      return {

        allowed:
          false,

        reason:
          "File exceeds maximum file size"

      };

    }


    return {

      allowed:
        true,

      reason:
        null,

      storageId:
        storage.id

    };

  }


  const available =
    getStorageAllocationCandidates(
      fileSize
    );


  return {

    allowed:
      available.length > 0,

    reason:
      available.length > 0
        ? null
        : "No storage capacity available",

    candidates:
      available

  };

}


// =====================================================
// START UPLOAD
// =====================================================

function startStorageUpload(
  data
) {

  const prepared =
    prepareStorageUpload(
      data
    );


  return {

    uploadId:
      prepared.upload.uploadId,

    status:
      STORAGE_UPLOAD_STATUS.UPLOADING,

    storageId:
      prepared.storage.id,

    nodeId:
      prepared.node.id,

    fileName:
      prepared.upload.fileName,

    fileSize:
      prepared.upload.fileSize,

    mimeType:
      prepared.upload.mimeType,

    startedAt:
      new Date()

  };

}


// =====================================================
// COMPLETE UPLOAD
// =====================================================

function completeStorageUpload(
  uploadData
) {

  uploadData =
    uploadData || {};


  if (
    !uploadData.uploadId
  ) {

    throw new Error(
      "Upload ID is required"
    );

  }


  if (
    !uploadData.storageId
  ) {

    throw new Error(
      "Storage ID is required"
    );

  }


  if (
    !uploadData.nodeId
  ) {

    throw new Error(
      "Node ID is required"
    );

  }


  const fileSize =
    Number(
      uploadData.fileSize || 0
    );


  validateStorageFileSize(
    fileSize
  );


  // ---------------------------------------------------
  // UPDATE NODE USAGE
  // ---------------------------------------------------

  increaseStorageNodeUsage(
    uploadData.nodeId,
    fileSize
  );


  // ---------------------------------------------------
  // UPDATE STORAGE USAGE
  // ---------------------------------------------------

  increaseStorageUsage(
    uploadData.storageId,
    fileSize
  );


  // ---------------------------------------------------
  // SYNCHRONIZE STORAGE
  // ---------------------------------------------------

  synchronizeStorage(
    uploadData.storageId
  );


  return {

    success:
      true,

    uploadId:
      uploadData.uploadId,

    storageId:
      uploadData.storageId,

    nodeId:
      uploadData.nodeId,

    fileSize:
      fileSize,

    status:
      STORAGE_UPLOAD_STATUS.COMPLETED,

    completedAt:
      new Date()

  };

}


// =====================================================
// FAIL UPLOAD
// =====================================================

function failStorageUpload(
  uploadData
) {

  uploadData =
    uploadData || {};


  return {

    success:
      false,

    uploadId:
      uploadData.uploadId ||
      null,

    storageId:
      uploadData.storageId ||
      null,

    nodeId:
      uploadData.nodeId ||
      null,

    status:
      STORAGE_UPLOAD_STATUS.FAILED,

    error:
      uploadData.error ||
      "Storage upload failed",

    failedAt:
      new Date()

  };

}


// =====================================================
// CANCEL UPLOAD
// =====================================================

function cancelStorageUpload(
  uploadId
) {

  if (!uploadId) {

    throw new Error(
      "Upload ID is required"
    );

  }


  return {

    success:
      true,

    uploadId:
      uploadId,

    status:
      STORAGE_UPLOAD_STATUS.CANCELLED,

    cancelledAt:
      new Date()

  };

}


// =====================================================
// UPLOAD FROM BASE64
// =====================================================

function uploadStorageBase64(
  data
) {

  data =
    data || {};


  if (
    !data.base64
  ) {

    throw new Error(
      "Base64 file data is required"
    );

  }


  const bytes =
    Utilities
      .base64Decode(
        data.base64
      );


  const fileSize =
    bytes.length;


  const upload =
    startStorageUpload({

      fileName:
        data.fileName,

      fileSize:
        fileSize,

      mimeType:
        data.mimeType,

      userId:
        data.userId,

      projectId:
        data.projectId,

      storageId:
        data.storageId

    });


  return {

    success:
      true,

    upload:
      upload,

    bytes:
      bytes,

    fileSize:
      fileSize

  };

}


// =====================================================
// GET UPLOAD TARGET
// =====================================================

function getStorageUploadTarget(
  fileSize,
  storageId
) {

  const selected =
    selectStorageForUpload(
      fileSize,
      storageId
    );


  return {

    storageId:
      selected.storage.id,

    storageName:
      selected.storage.name,

    nodeId:
      selected.node.id,

    nodeName:
      selected.node.name,

    provider:
      selected.node.provider,

    availableBytes:
      selected.node.availableBytes,

    maxFileSize:
      selected.storage.maxFileSize

  };

}


// =====================================================
// CHECK STORAGE BEFORE UPLOAD
// =====================================================

function validateStorageBeforeUpload(
  fileSize,
  storageId
) {

  const result =
    checkStorageUploadCapacity(
      fileSize,
      storageId
    );


  if (
    !result.allowed
  ) {

    throw new Error(
      result.reason
    );

  }


  return result;

}


// =====================================================
// GET UPLOAD CONFIG
// =====================================================

function getStorageUploadConfig() {

  return {

    statuses:
      STORAGE_UPLOAD_STATUS,

    limits:
      STORAGE_UPLOAD_LIMITS,

    maxBase64Size:
      null,

    automaticAllocation:
      true,

    multiNodeSupport:
      true,

    failoverSupport:
      true

  };

}