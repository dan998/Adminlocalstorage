// =====================================================
// STORAGECLEANUP.GS
// Storage Cleanup & Maintenance
// Cloud Project Platform
// =====================================================


// =====================================================
// CLEANUP STATUS
// =====================================================

const STORAGE_CLEANUP_STATUS = {

  ENABLED:
    "Enabled",

  DISABLED:
    "Disabled",

  COMPLETED:
    "Completed",

  PARTIAL:
    "Partial",

  FAILED:
    "Failed",

  SKIPPED:
    "Skipped"

};


// =====================================================
// CLEANUP TYPES
// =====================================================

const STORAGE_CLEANUP_TYPES = {

  TEMP_FILES:
    "Temporary Files",

  EXPIRED_FILES:
    "Expired Files",

  ORPHAN_FILES:
    "Orphan Files",

  ORPHAN_RECORDS:
    "Orphan Records",

  EMPTY_ROOMS:
    "Empty Rooms",

  INACTIVE_NODES:
    "Inactive Nodes",

  FAILED_UPLOADS:
    "Failed Uploads",

  STALE_SESSIONS:
    "Stale Storage Sessions",

  STORAGE_RECORDS:
    "Storage Records",

  ALL:
    "All"

};


// =====================================================
// CLEANUP SETTINGS
// =====================================================

const STORAGE_CLEANUP_SETTINGS = {

  ENABLED:
    true,

  DRY_RUN:
    false,

  REQUIRE_CONFIRMATION:
    true,

  DELETE_TEMP_FILES:
    true,

  DELETE_EXPIRED_FILES:
    true,

  DELETE_ORPHAN_RECORDS:
    true,

  DELETE_EMPTY_ROOMS:
    false,

  DELETE_INACTIVE_NODES:
    false,

  DELETE_FAILED_UPLOADS:
    true,

  DELETE_STORAGE_RECORDS:
    false,

  TEMP_FILE_MAX_AGE_HOURS:
    24,

  EXPIRED_FILE_GRACE_DAYS:
    7,

  FAILED_UPLOAD_MAX_AGE_HOURS:
    24,

  STALE_RECORD_MAX_AGE_DAYS:
    30,

  MAX_DELETE_PER_RUN:
    500,

  LOG_CLEANUP:
    true

};


// =====================================================
// CLEANUP LOG SHEET
// =====================================================

const STORAGE_CLEANUP_SHEET =
  "STORAGE_CLEANUP_LOGS";


// =====================================================
// CLEANUP COLUMNS
// =====================================================

const STORAGE_CLEANUP_COLUMNS = {

  ID: 1,

  TYPE: 2,

  STORAGE_ID: 3,

  USER_ID: 4,

  ITEM_ID: 5,

  ACTION: 6,

  STATUS: 7,

  DRY_RUN: 8,

  MESSAGE: 9,

  CREATED_AT: 10,

  CREATED_BY: 11

};


// =====================================================
// GENERATE CLEANUP ID
// =====================================================

function generateStorageCleanupId() {

  return (
    "SCLEAN-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// CHECK CLEANUP ENABLED
// =====================================================

function isStorageCleanupEnabled() {

  return (
    STORAGE_CLEANUP_SETTINGS
      .ENABLED === true
  );

}


// =====================================================
// GET CLEANUP SHEET
// =====================================================

function getStorageCleanupSheet() {

  return getSheet(
    SHEETS.STORAGE_CLEANUP ||
    STORAGE_CLEANUP_SHEET
  );

}


// =====================================================
// LOG CLEANUP EVENT
// =====================================================

function logStorageCleanupEvent(
  data
) {

  if (
    !STORAGE_CLEANUP_SETTINGS
      .LOG_CLEANUP
  ) {

    return null;

  }


  data =
    data || {};


  const event = {

    id:
      generateStorageCleanupId(),

    type:
      data.type ||
      "",

    storageId:
      data.storageId ||
      "",

    userId:
      data.userId ||
      "",

    itemId:
      data.itemId ||
      "",

    action:
      data.action ||
      "",

    status:
      data.status ||
      STORAGE_CLEANUP_STATUS.COMPLETED,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN,

    message:
      data.message ||
      "",

    createdAt:
      new Date(),

    createdBy:
      data.createdBy ||
      ""

  };


  try {

    const sheet =
      getStorageCleanupSheet();


    sheet.appendRow([

      event.id,

      event.type,

      event.storageId,

      event.userId,

      event.itemId,

      event.action,

      event.status,

      event.dryRun,

      event.message,

      event.createdAt,

      event.createdBy

    ]);

  }
  catch (error) {

    console.log(
      JSON.stringify(
        event
      )
    );

  }


  return event;

}


// =====================================================
// CHECK ITEM AGE
// =====================================================

function isStorageItemOlderThan(
  dateValue,
  ageMilliseconds
) {

  if (!dateValue) {

    return false;

  }


  const date =
    new Date(
      dateValue
    );


  if (
    isNaN(
      date.getTime()
    )
  ) {

    return false;

  }


  return (
    new Date().getTime() -
    date.getTime()
  ) >=
  ageMilliseconds;

}


// =====================================================
// GET TEMP FILE AGE
// =====================================================

function getStorageTempFileMaxAge() {

  return (
    STORAGE_CLEANUP_SETTINGS
      .TEMP_FILE_MAX_AGE_HOURS *
    60 *
    60 *
    1000
  );

}


// =====================================================
// GET EXPIRED FILE AGE
// =====================================================

function getStorageExpiredFileGraceAge() {

  return (
    STORAGE_CLEANUP_SETTINGS
      .EXPIRED_FILE_GRACE_DAYS *
    24 *
    60 *
    60 *
    1000
  );

}


// =====================================================
// SAFE DELETE FILE
// =====================================================

function safelyDeleteStorageFile(
  fileId,
  data
) {

  data =
    data || {};


  if (!fileId) {

    return {

      success:
        false,

      status:
        STORAGE_CLEANUP_STATUS.FAILED,

      error:
        "File ID is required"

    };

  }


  /*
   * DRY RUN
   */

  if (
    STORAGE_CLEANUP_SETTINGS
      .DRY_RUN
  ) {

    logStorageCleanupEvent({

      type:
        data.type ||
        STORAGE_CLEANUP_TYPES
          .TEMP_FILES,

      storageId:
        data.storageId,

      userId:
        data.userId,

      itemId:
        fileId,

      action:
        "DRY_RUN_DELETE",

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      message:
        "File would be deleted"

    });


    return {

      success:
        true,

      dryRun:
        true,

      deleted:
        false,

      fileId:
        fileId

    };

  }


  /*
   * Prefer the project's existing
   * file deletion function.
   */

  if (
    typeof deleteFile ===
    "function"
  ) {

    try {

      const result =
        deleteFile(
          fileId
        );


      logStorageCleanupEvent({

        type:
          data.type,

        storageId:
          data.storageId,

        userId:
          data.userId,

        itemId:
          fileId,

        action:
          "DELETE_FILE",

        status:
          STORAGE_CLEANUP_STATUS
            .COMPLETED,

        message:
          "File deleted"

      });


      return {

        success:
          true,

        deleted:
          true,

        fileId:
          fileId,

        result:
          result

      };

    }
    catch (error) {

      logStorageCleanupEvent({

        type:
          data.type,

        storageId:
          data.storageId,

        userId:
          data.userId,

        itemId:
          fileId,

        action:
          "DELETE_FILE",

        status:
          STORAGE_CLEANUP_STATUS
            .FAILED,

        message:
          error.message

      });


      return {

        success:
          false,

        deleted:
          false,

        status:
          STORAGE_CLEANUP_STATUS
            .FAILED,

        error:
          error.message

      };

    }

  }


  return {

    success:
      false,

    deleted:
      false,

    status:
      STORAGE_CLEANUP_STATUS
        .FAILED,

    error:
      "File deletion function unavailable"

  };

}


// =====================================================
// CLEAN TEMPORARY FILES
// =====================================================

function cleanupTemporaryStorageFiles(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_TEMP_FILES
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  if (
    typeof getAllFiles !==
    "function"
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      deleted:
        0,

      error:
        "File read system unavailable"

    };

  }


  const files =
    getAllFiles() || [];


  const maxAge =
    getStorageTempFileMaxAge();


  let scanned =
    0;

  let candidates =
    0;

  let deleted =
    0;

  let failed =
    0;


  const maxDelete =
    Number(
      options.maxDelete ||
      STORAGE_CLEANUP_SETTINGS
        .MAX_DELETE_PER_RUN
    );


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    if (
      deleted >=
      maxDelete
    ) {

      break;

    }


    const file =
      files[i];


    scanned++;


    const isTemporary =
      file.isTemporary === true ||
      file.temporary === true ||
      String(
        file.status ||
        ""
      ).toLowerCase() ===
      "temporary";


    if (!isTemporary) {

      continue;

    }


    if (
      !isStorageItemOlderThan(
        file.createdAt ||
        file.createdDate,
        maxAge
      )
    ) {

      continue;

    }


    candidates++;


    const result =
      safelyDeleteStorageFile(
        file.id,
        {

          type:
            STORAGE_CLEANUP_TYPES
              .TEMP_FILES,

          storageId:
            file.storageId,

          userId:
            file.userId

        }
      );


    if (
      result.deleted
    ) {

      deleted++;

    }
    else if (
      !result.dryRun
    ) {

      failed++;

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .TEMP_FILES,

    status:
      failed > 0
        ? STORAGE_CLEANUP_STATUS.PARTIAL
        : STORAGE_CLEANUP_STATUS.COMPLETED,

    scanned:
      scanned,

    candidates:
      candidates,

    deleted:
      deleted,

    failed:
      failed,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN

  };

}


// =====================================================
// CLEAN EXPIRED FILES
// =====================================================

function cleanupExpiredStorageFiles(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_EXPIRED_FILES
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  if (
    typeof getAllFiles !==
    "function"
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      deleted:
        0,

      error:
        "File read system unavailable"

    };

  }


  const files =
    getAllFiles() || [];


  const graceAge =
    getStorageExpiredFileGraceAge();


  let scanned =
    0;

  let candidates =
    0;

  let deleted =
    0;

  let failed =
    0;


  const maxDelete =
    Number(
      options.maxDelete ||
      STORAGE_CLEANUP_SETTINGS
        .MAX_DELETE_PER_RUN
    );


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    if (
      deleted >=
      maxDelete
    ) {

      break;

    }


    const file =
      files[i];


    scanned++;


    const status =
      String(
        file.status ||
        ""
      ).toLowerCase();


    const expired =
      file.expired === true ||
      status === "expired";


    if (!expired) {

      continue;

    }


    if (
      !isStorageItemOlderThan(
        file.updatedAt ||
        file.createdAt,
        graceAge
      )
    ) {

      continue;

    }


    candidates++;


    const result =
      safelyDeleteStorageFile(
        file.id,
        {

          type:
            STORAGE_CLEANUP_TYPES
              .EXPIRED_FILES,

          storageId:
            file.storageId,

          userId:
            file.userId

        }
      );


    if (
      result.deleted
    ) {

      deleted++;

    }
    else if (
      !result.dryRun
    ) {

      failed++;

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .EXPIRED_FILES,

    status:
      failed > 0
        ? STORAGE_CLEANUP_STATUS.PARTIAL
        : STORAGE_CLEANUP_STATUS.COMPLETED,

    scanned:
      scanned,

    candidates:
      candidates,

    deleted:
      deleted,

    failed:
      failed,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN

  };

}


// =====================================================
// FIND ORPHAN FILE RECORDS
// =====================================================

function findOrphanStorageFileRecords() {

  if (
    typeof getAllFiles !==
    "function"
  ) {

    return [];

  }


  const files =
    getAllFiles() || [];


  const orphanFiles = [];


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    const file =
      files[i];


    /*
     * A file without a storage ID
     * cannot be safely allocated.
     */

    if (
      !file.storageId
    ) {

      orphanFiles.push(
        file
      );

      continue;

    }


    if (
      typeof findStorageById ===
      "function"
    ) {

      const storage =
        findStorageById(
          file.storageId
        );


      if (!storage) {

        orphanFiles.push(
          file
        );

      }

    }

  }


  return orphanFiles;

}


// =====================================================
// CLEAN ORPHAN FILE RECORDS
// =====================================================

function cleanupOrphanStorageFiles(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_ORPHAN_RECORDS
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  const orphans =
    findOrphanStorageFileRecords();


  let deleted =
    0;

  let failed =
    0;


  const maxDelete =
    Number(
      options.maxDelete ||
      STORAGE_CLEANUP_SETTINGS
        .MAX_DELETE_PER_RUN
    );


  for (
    let i = 0;
    i < orphans.length;
    i++
  ) {

    if (
      deleted >=
      maxDelete
    ) {

      break;

    }


    const file =
      orphans[i];


    const result =
      safelyDeleteStorageFile(
        file.id,
        {

          type:
            STORAGE_CLEANUP_TYPES
              .ORPHAN_FILES,

          storageId:
            file.storageId,

          userId:
            file.userId

        }
      );


    if (
      result.deleted
    ) {

      deleted++;

    }
    else if (
      !result.dryRun
    ) {

      failed++;

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .ORPHAN_FILES,

    status:
      failed > 0
        ? STORAGE_CLEANUP_STATUS.PARTIAL
        : STORAGE_CLEANUP_STATUS.COMPLETED,

    candidates:
      orphans.length,

    deleted:
      deleted,

    failed:
      failed

  };

}


// =====================================================
// CLEAN EMPTY ROOMS
// =====================================================

function cleanupEmptyStorageRooms(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_EMPTY_ROOMS
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  if (
    typeof getAllStorageRooms !==
    "function"
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      deleted:
        0,

      error:
        "Storage room system unavailable"

    };

  }


  const rooms =
    getAllStorageRooms() || [];


  let candidates =
    0;

  let deleted =
    0;


  for (
    let i = 0;
    i < rooms.length;
    i++
  ) {

    const room =
      rooms[i];


    const count =
      Number(
        room.fileCount ||
        room.filesCount ||
        0
      );


    if (
      count !== 0
    ) {

      continue;

    }


    candidates++;


    if (
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN
    ) {

      continue;

    }


    /*
     * Do not delete protected/default rooms.
     */

    if (
      room.isDefault === true ||
      room.protected === true
    ) {

      continue;

    }


    if (
      typeof deleteStorageRoom ===
      "function"
    ) {

      try {

        deleteStorageRoom(
          room.id
        );

        deleted++;

      }
      catch (error) {

        logStorageCleanupEvent({

          type:
            STORAGE_CLEANUP_TYPES
              .EMPTY_ROOMS,

          storageId:
            room.storageId,

          itemId:
            room.id,

          action:
            "DELETE_ROOM",

          status:
            STORAGE_CLEANUP_STATUS
              .FAILED,

          message:
            error.message

        });

      }

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .EMPTY_ROOMS,

    status:
      STORAGE_CLEANUP_STATUS.COMPLETED,

    candidates:
      candidates,

    deleted:
      deleted,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN

  };

}


// =====================================================
// CLEAN INACTIVE NODES
// =====================================================

function cleanupInactiveStorageNodes(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_INACTIVE_NODES
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  if (
    typeof getAllStorageNodes !==
    "function"
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      deleted:
        0,

      error:
        "Storage node system unavailable"

    };

  }


  const nodes =
    getAllStorageNodes() || [];


  let candidates =
    0;

  let deleted =
    0;


  for (
    let i = 0;
    i < nodes.length;
    i++
  ) {

    const node =
      nodes[i];


    const status =
      String(
        node.status ||
        ""
      ).toLowerCase();


    if (
      status !==
      "inactive"
    ) {

      continue;

    }


    /*
     * Never remove the default node.
     */

    if (
      node.isDefault === true ||
      node.protected === true
    ) {

      continue;

    }


    candidates++;


    if (
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN
    ) {

      continue;

    }


    if (
      typeof deleteStorageNode ===
      "function"
    ) {

      try {

        deleteStorageNode(
          node.id
        );

        deleted++;

      }
      catch (error) {

        logStorageCleanupEvent({

          type:
            STORAGE_CLEANUP_TYPES
              .INACTIVE_NODES,

          storageId:
            node.storageId,

          itemId:
            node.id,

          action:
            "DELETE_NODE",

          status:
            STORAGE_CLEANUP_STATUS
              .FAILED,

          message:
            error.message

        });

      }

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .INACTIVE_NODES,

    status:
      STORAGE_CLEANUP_STATUS.COMPLETED,

    candidates:
      candidates,

    deleted:
      deleted,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN

  };

}


// =====================================================
// CLEAN FAILED UPLOADS
// =====================================================

function cleanupFailedStorageUploads(
  options
) {

  options =
    options || {};


  if (
    !STORAGE_CLEANUP_SETTINGS
      .DELETE_FAILED_UPLOADS
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      deleted:
        0

    };

  }


  if (
    typeof getAllFiles !==
    "function"
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      deleted:
        0,

      error:
        "File system unavailable"

    };

  }


  const files =
    getAllFiles() || [];


  const maxAge =
    STORAGE_CLEANUP_SETTINGS
      .FAILED_UPLOAD_MAX_AGE_HOURS *
    60 *
    60 *
    1000;


  let candidates =
    0;

  let deleted =
    0;

  let failed =
    0;


  for (
    let i = 0;
    i < files.length;
    i++
  ) {

    if (
      deleted >=
      STORAGE_CLEANUP_SETTINGS
        .MAX_DELETE_PER_RUN
    ) {

      break;

    }


    const file =
      files[i];


    const status =
      String(
        file.status ||
        ""
      ).toLowerCase();


    if (
      status !==
      "failed"
    ) {

      continue;

    }


    if (
      !isStorageItemOlderThan(
        file.createdAt ||
        file.createdDate,
        maxAge
      )
    ) {

      continue;

    }


    candidates++;


    const result =
      safelyDeleteStorageFile(
        file.id,
        {

          type:
            STORAGE_CLEANUP_TYPES
              .FAILED_UPLOADS,

          storageId:
            file.storageId,

          userId:
            file.userId

        }
      );


    if (
      result.deleted
    ) {

      deleted++;

    }
    else if (
      !result.dryRun
    ) {

      failed++;

    }

  }


  return {

    type:
      STORAGE_CLEANUP_TYPES
        .FAILED_UPLOADS,

    status:
      failed > 0
        ? STORAGE_CLEANUP_STATUS.PARTIAL
        : STORAGE_CLEANUP_STATUS.COMPLETED,

    candidates:
      candidates,

    deleted:
      deleted,

    failed:
      failed

  };

}


// =====================================================
// RUN COMPLETE CLEANUP
// =====================================================

function runStorageCleanup(
  options
) {

  options =
    options || {};


  if (
    !isStorageCleanupEnabled()
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .DISABLED,

      message:
        "Storage cleanup is disabled"

    };

  }


  /*
   * For destructive operations, the caller
   * should explicitly confirm the operation.
   */

  if (
    STORAGE_CLEANUP_SETTINGS
      .REQUIRE_CONFIRMATION &&
    options.confirm !== true
  ) {

    return {

      status:
        STORAGE_CLEANUP_STATUS
          .SKIPPED,

      message:
        "Cleanup confirmation required",

      confirmationRequired:
        true

    };

  }


  const results = {};


  results.temporaryFiles =
    cleanupTemporaryStorageFiles(
      options
    );


  results.expiredFiles =
    cleanupExpiredStorageFiles(
      options
    );


  results.failedUploads =
    cleanupFailedStorageUploads(
      options
    );


  results.orphanFiles =
    cleanupOrphanStorageFiles(
      options
    );


  results.emptyRooms =
    cleanupEmptyStorageRooms(
      options
    );


  results.inactiveNodes =
    cleanupInactiveStorageNodes(
      options
    );


  let failed =
    0;


  Object.keys(
    results
  ).forEach(
    function(key) {

      if (
        results[key].status ===
        STORAGE_CLEANUP_STATUS.FAILED ||
        results[key].failed > 0
      ) {

        failed++;

      }

    }
  );


  return {

    status:
      failed > 0
        ? STORAGE_CLEANUP_STATUS.PARTIAL
        : STORAGE_CLEANUP_STATUS.COMPLETED,

    dryRun:
      STORAGE_CLEANUP_SETTINGS
        .DRY_RUN,

    results:
      results,

    completedAt:
      new Date()

  };

}


// =====================================================
// CLEANUP PREVIEW
// =====================================================

function previewStorageCleanup(
  options
) {

  options =
    options || {};


  const previous =
    STORAGE_CLEANUP_SETTINGS
      .DRY_RUN;


  STORAGE_CLEANUP_SETTINGS
    .DRY_RUN = true;


  try {

    return runStorageCleanup({

      confirm:
        true,

      maxDelete:
        options.maxDelete

    });

  }
  finally {

    STORAGE_CLEANUP_SETTINGS
      .DRY_RUN = previous;

  }

}


// =====================================================
// GET CLEANUP CONFIG
// =====================================================

function getStorageCleanupConfig() {

  return {

    enabled:
      STORAGE_CLEANUP_SETTINGS
        .ENABLED,

    settings:
      STORAGE_CLEANUP_SETTINGS,

    statuses:
      STORAGE_CLEANUP_STATUS,

    types:
      STORAGE_CLEANUP_TYPES,

    sheet:
      STORAGE_CLEANUP_SHEET

  };

}