// =====================================================
// STORAGEDELETE.GS
// Storage Delete Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// DELETE STORAGE
// =====================================================

function deleteStorage(
  storageId,
  options
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  options =
    options || {};


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  // ---------------------------------------------------
  // PROTECT STORAGE CONTAINING DATA
  // ---------------------------------------------------

  const usedBytes =
    Number(
      storage.usedBytes || 0
    );


  const force =
    options.force === true;


  if (
    usedBytes > 0 &&
    !force
  ) {

    throw new Error(
      "Storage contains data. Empty the storage before deleting it or use force deletion."
    );

  }


  // ---------------------------------------------------
  // DELETE CHILD ROOMS
  // ---------------------------------------------------

  if (
    options.deleteRooms !== false
  ) {

    rooms.forEach(
      function(room) {

        deleteStorageRoom(
          room.id,
          {
            force:
              force
          }
        );

      }
    );

  }


  // ---------------------------------------------------
  // DELETE CHILD NODES
  // ---------------------------------------------------

  if (
    options.deleteNodes !== false
  ) {

    nodes.forEach(
      function(node) {

        deleteStorageNode(
          node.id,
          {
            force:
              force
          }
        );

      }
    );

  }


  // ---------------------------------------------------
  // DELETE STORAGE RECORD
  // ---------------------------------------------------

  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet.deleteRow(
    storage.row
  );


  return {

    success:
      true,

    storageId:
      storageId,

    deletedRooms:
      rooms.length,

    deletedNodes:
      nodes.length

  };

}


// =====================================================
// SOFT DELETE STORAGE
// =====================================================

function softDeleteStorage(
  storageId
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.DISABLED
  );

}


// =====================================================
// ARCHIVE STORAGE
// =====================================================

function archiveStorage(
  storageId
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


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
    typeof STORAGE_STATUS !==
    "undefined" &&
    STORAGE_STATUS.ARCHIVED
  ) {

    return updateStorageStatus(
      storageId,
      STORAGE_STATUS.ARCHIVED
    );

  }


  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.DISABLED
  );

}


// =====================================================
// RESTORE STORAGE
// =====================================================

function restoreStorage(
  storageId
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  return updateStorageStatus(
    storageId,
    STORAGE_STATUS.ACTIVE
  );

}


// =====================================================
// EMPTY STORAGE
// =====================================================

function emptyStorage(
  storageId,
  options
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  options =
    options || {};


  const storage =
    findStorageById(
      storageId
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let processedNodes =
    0;


  nodes.forEach(
    function(node) {

      if (
        typeof emptyStorageNode ===
        "function"
      ) {

        emptyStorageNode(
          node.id,
          options
        );

      }
      else {

        updateStorageNodeUsage(
          node.id,
          0
        );

      }


      processedNodes++;

    }
  );


  synchronizeStorage(
    storageId
  );


  return {

    success:
      true,

    storageId:
      storageId,

    processedNodes:
      processedNodes

  };

}


// =====================================================
// DELETE STORAGE NODE
// =====================================================

function deleteStorageNode(
  nodeId,
  options
) {

  if (!nodeId) {

    throw new Error(
      "Node ID is required"
    );

  }


  options =
    options || {};


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    throw new Error(
      "Storage node not found"
    );

  }


  const usedBytes =
    Number(
      node.usedBytes || 0
    );


  if (
    usedBytes > 0 &&
    options.force !== true
  ) {

    throw new Error(
      "Storage node contains data and cannot be deleted"
    );

  }


  const sheet =
    getStorageNodesSheet();


  sheet.deleteRow(
    node.row
  );


  // ---------------------------------------------------
  // SYNCHRONIZE PARENT STORAGE
  // ---------------------------------------------------

  if (
    node.storageId
  ) {

    const parent =
      findStorageById(
        node.storageId
      );


    if (
      parent
    ) {

      synchronizeStorage(
        node.storageId
      );

    }

  }


  return {

    success:
      true,

    nodeId:
      nodeId

  };

}


// =====================================================
// DELETE STORAGE ROOM
// =====================================================

function deleteStorageRoom(
  roomId,
  options
) {

  if (!roomId) {

    throw new Error(
      "Room ID is required"
    );

  }


  options =
    options || {};


  const room =
    findStorageRoomById(
      roomId
    );


  if (!room) {

    throw new Error(
      "Storage room not found"
    );

  }


  const usedBytes =
    Number(
      room.usedBytes || 0
    );


  if (
    usedBytes > 0 &&
    options.force !== true
  ) {

    throw new Error(
      "Storage room contains data and cannot be deleted"
    );

  }


  const sheet =
    getStorageRoomsSheet();


  sheet.deleteRow(
    room.row
  );


  // ---------------------------------------------------
  // SYNCHRONIZE PARENT STORAGE
  // ---------------------------------------------------

  if (
    room.storageId
  ) {

    const parent =
      findStorageById(
        room.storageId
      );


    if (
      parent
    ) {

      synchronizeStorage(
        room.storageId
      );

    }

  }


  return {

    success:
      true,

    roomId:
      roomId

  };

}


// =====================================================
// DELETE ALL STORAGE NODES
// =====================================================

function deleteAllStorageNodes(
  storageId,
  options
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  options =
    options || {};


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let deleted =
    0;


  nodes
    .slice()
    .reverse()
    .forEach(
      function(node) {

        deleteStorageNode(
          node.id,
          options
        );


        deleted++;

      }
    );


  return {

    success:
      true,

    storageId:
      storageId,

    deleted:
      deleted

  };

}


// =====================================================
// DELETE ALL STORAGE ROOMS
// =====================================================

function deleteAllStorageRooms(
  storageId,
  options
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  options =
    options || {};


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  let deleted =
    0;


  rooms
    .slice()
    .reverse()
    .forEach(
      function(room) {

        deleteStorageRoom(
          room.id,
          options
        );


        deleted++;

      }
    );


  return {

    success:
      true,

    storageId:
      storageId,

    deleted:
      deleted

  };

}


// =====================================================
// PURGE STORAGE
// =====================================================

function purgeStorage(
  storageId
) {

  if (!storageId) {

    throw new Error(
      "Storage ID is required"
    );

  }


  return deleteStorage(
    storageId,
    {

      force:
        true,

      deleteRooms:
        true,

      deleteNodes:
        true

    }
  );

}


// =====================================================
// CHECK IF STORAGE CAN BE DELETED
// =====================================================

function canDeleteStorage(
  storageId
) {

  if (!storageId) {

    return {

      allowed:
        false,

      reason:
        "Storage ID is required"

    };

  }


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


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  const usedBytes =
    Number(
      storage.usedBytes || 0
    );


  if (
    usedBytes > 0
  ) {

    return {

      allowed:
        false,

      reason:
        "Storage contains data",

      usedBytes:
        usedBytes,

      roomCount:
        rooms.length,

      nodeCount:
        nodes.length

    };

  }


  return {

    allowed:
      true,

    reason:
      null,

    usedBytes:
      0,

    roomCount:
      rooms.length,

    nodeCount:
      nodes.length

  };

}


// =====================================================
// CHECK IF NODE CAN BE DELETED
// =====================================================

function canDeleteStorageNode(
  nodeId
) {

  if (!nodeId) {

    return {

      allowed:
        false,

      reason:
        "Node ID is required"

    };

  }


  const node =
    findStorageNodeById(
      nodeId
    );


  if (!node) {

    return {

      allowed:
        false,

      reason:
        "Storage node not found"

    };

  }


  const usedBytes =
    Number(
      node.usedBytes || 0
    );


  if (
    usedBytes > 0
  ) {

    return {

      allowed:
        false,

      reason:
        "Storage node contains data",

      usedBytes:
        usedBytes

    };

  }


  return {

    allowed:
      true,

    reason:
      null

  };

}


// =====================================================
// CHECK IF ROOM CAN BE DELETED
// =====================================================

function canDeleteStorageRoom(
  roomId
) {

  if (!roomId) {

    return {

      allowed:
        false,

      reason:
        "Room ID is required"

    };

  }


  const room =
    findStorageRoomById(
      roomId
    );


  if (!room) {

    return {

      allowed:
        false,

      reason:
        "Storage room not found"

    };

  }


  const usedBytes =
    Number(
      room.usedBytes || 0
    );


  if (
    usedBytes > 0
  ) {

    return {

      allowed:
        false,

      reason:
        "Storage room contains data",

      usedBytes:
        usedBytes

    };

  }


  return {

    allowed:
      true,

    reason:
      null

  };

}


// =====================================================
// CLEAN EMPTY STORAGE
// =====================================================

function deleteEmptyStorages() {

  const storages =
    getAllStorageRecords();


  let deleted =
    0;


  const skipped = [];


  storages
    .slice()
    .reverse()
    .forEach(
      function(storage) {

        const check =
          canDeleteStorage(
            storage.id
          );


        if (
          check.allowed
        ) {

          deleteStorage(
            storage.id,
            {

              force:
                false,

              deleteRooms:
                true,

              deleteNodes:
                true

            }
          );


          deleted++;

        }
        else {

          skipped.push({

            storageId:
              storage.id,

            reason:
              check.reason

          });

        }

      }
    );


  return {

    success:
      true,

    deleted:
      deleted,

    skipped:
      skipped

  };

}


// =====================================================
// DELETE DISABLED STORAGES
// =====================================================

function deleteDisabledStorages(
  options
) {

  options =
    options || {};


  const storages =
    getAllStorageRecords();


  let deleted =
    0;


  const skipped = [];


  storages
    .slice()
    .reverse()
    .forEach(
      function(storage) {

        const status =
          String(
            storage.status ||
            ""
          )
            .toLowerCase();


        if (
          status !==
          String(
            STORAGE_STATUS.DISABLED
          )
            .toLowerCase()
        ) {

          return;

        }


        const check =
          canDeleteStorage(
            storage.id
          );


        if (
          check.allowed ||
          options.force === true
        ) {

          deleteStorage(
            storage.id,
            {

              force:
                options.force === true,

              deleteRooms:
                true,

              deleteNodes:
                true

            }
          );


          deleted++;

        }
        else {

          skipped.push({

            storageId:
              storage.id,

            reason:
              check.reason

          });

        }

      }
    );


  return {

    success:
      true,

    deleted:
      deleted,

    skipped:
      skipped

  };

}


// =====================================================
// DELETE STORAGE BY NAME
// =====================================================

function deleteStorageByName(
  name,
  options
) {

  if (!name) {

    throw new Error(
      "Storage name is required"
    );

  }


  const storage =
    findStorageByName(
      name
    );


  if (!storage) {

    throw new Error(
      "Storage not found"
    );

  }


  return deleteStorage(
    storage.id,
    options
  );

}


// =====================================================
// DELETE STORAGE SAFELY
// =====================================================

function safeDeleteStorage(
  storageId
) {

  const check =
    canDeleteStorage(
      storageId
    );


  if (
    !check.allowed
  ) {

    throw new Error(
      check.reason
    );

  }


  return deleteStorage(
    storageId,
    {

      force:
        false,

      deleteRooms:
        true,

      deleteNodes:
        true

    }
  );

}