// =====================================================
// STORAGECREATE.GS
// Storage Creation Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// CREATE STORAGE
// =====================================================

function createStorage(
  data
) {

  data =
    data || {};


  const validation =
    validateStorageCreateData(
      data
    );


  if (
    !validation.valid
  ) {

    throw new Error(
      validation.error
    );

  }


  const existing =
    findStorageByName(
      data.name
    );


  if (
    existing
  ) {

    throw new Error(
      "A storage with this name already exists"
    );

  }


  const storage =
    buildStorageRecord(
      data
    );


  const sheet =
    getSheet(
      SHEETS.STORAGE
    );


  sheet.appendRow([

    storage.id,

    storage.name,

    storage.type,

    storage.status,

    storage.description,

    storage.totalBytes,

    storage.usedBytes,

    storage.availableBytes,

    storage.maxFileSize,

    storage.roomCount,

    storage.nodeCount,

    storage.createdBy,

    storage.createdAt,

    storage.updatedAt

  ]);


  return storage;

}


// =====================================================
// CREATE STORAGE NODE
// =====================================================

function createStorageNode(
  data
) {

  data =
    data || {};


  const validation =
    validateStorageNodeCreateData(
      data
    );


  if (
    !validation.valid
  ) {

    throw new Error(
      validation.error
    );

  }


  const storage =
    findStorageById(
      data.storageId
    );


  if (
    !storage
  ) {

    throw new Error(
      "Parent storage not found"
    );

  }


  const existing =
    findStorageNodeByName(
      data.storageId,
      data.name
    );


  if (
    existing
  ) {

    throw new Error(
      "A storage node with this name already exists"
    );

  }


  const nodes =
    getStorageNodesByStorageId(
      data.storageId
    );


  if (
    nodes.length >=
    STORAGE_NODE_LIMITS
      .MAX_NODES_PER_STORAGE
  ) {

    throw new Error(
      "Maximum storage node limit reached"
    );

  }


  const node =
    buildStorageNodeRecord(
      data
    );


  const nodeValidation =
    validateStorageNode(
      node
    );


  if (
    !nodeValidation.valid
  ) {

    throw new Error(
      nodeValidation.error
    );

  }


  const sheet =
    getStorageNodesSheet();


  sheet.appendRow(
    storageNodeObjectToRow(
      node
    )
  );


  updateStorageNodeParentCounts(
    data.storageId
  );


  return node;

}


// =====================================================
// CREATE STORAGE ROOM
// =====================================================

function createStorageRoom(
  data
) {

  data =
    data || {};


  const validation =
    validateStorageRoomCreateData(
      data
    );


  if (
    !validation.valid
  ) {

    throw new Error(
      validation.error
    );

  }


  const storage =
    findStorageById(
      data.storageId
    );


  if (
    !storage
  ) {

    throw new Error(
      "Parent storage not found"
    );

  }


  let node =
    null;


  if (
    data.nodeId
  ) {

    node =
      findStorageNodeById(
        data.nodeId
      );


    if (
      !node
    ) {

      throw new Error(
        "Storage node not found"
      );

    }


    if (
      String(
        node.storageId
      ) !==
      String(
        data.storageId
      )
    ) {

      throw new Error(
        "Storage node does not belong to this storage"
      );

    }

  }


  const existing =
    findStorageRoomByName(
      data.storageId,
      data.name
    );


  if (
    existing
  ) {

    throw new Error(
      "A storage room with this name already exists"
    );

  }


  const rooms =
    getStorageRoomsByStorageId(
      data.storageId
    );


  if (
    rooms.length >=
    STORAGE_ROOM_LIMITS
      .MAX_ROOMS_PER_STORAGE
  ) {

    throw new Error(
      "Maximum storage room limit reached"
    );

  }


  const room =
    buildStorageRoomRecord(
      data
    );


  const roomValidation =
    validateStorageRoom(
      room
    );


  if (
    !roomValidation.valid
  ) {

    throw new Error(
      roomValidation.error
    );

  }


  const sheet =
    getStorageRoomsSheet();


  sheet.appendRow(
    storageRoomObjectToRow(
      room
    )
  );


  updateStorageRoomParentCounts(
    data.storageId
  );


  return room;

}


// =====================================================
// CREATE STORAGE WITH NODE
// =====================================================

function createStorageWithNode(
  data
) {

  data =
    data || {};


  const storageData =
    data.storage ||
    data;


  const nodeData =
    data.node ||
    null;


  const storage =
    createStorage(
      storageData
    );


  let node =
    null;


  try {

    if (
      nodeData
    ) {

      node =
        createStorageNode({

          ...nodeData,

          storageId:
            storage.id

        });

    }

  }
  catch (
    error
  ) {

    // Storage was created successfully,
    // but node creation failed.

    throw new Error(
      "Storage created, but node creation failed: " +
      error.message
    );

  }


  return {

    storage:
      storage,

    node:
      node

  };

}


// =====================================================
// CREATE STORAGE WITH NODE AND ROOM
// =====================================================

function createCompleteStorage(
  data
) {

  data =
    data || {};


  const storage =
    createStorage(
      data.storage ||
      data
    );


  let node =
    null;


  let room =
    null;


  try {

    if (
      data.node
    ) {

      node =
        createStorageNode({

          ...data.node,

          storageId:
            storage.id

        });

    }


    if (
      data.room
    ) {

      room =
        createStorageRoom({

          ...data.room,

          storageId:
            storage.id,

          nodeId:
            data.room.nodeId ||
            (
              node
                ? node.id
                : ""
            )

        });

    }

  }
  catch (
    error
  ) {

    throw new Error(
      "Storage creation partially failed: " +
      error.message
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
// CREATE ROOT STORAGE ROOM
// =====================================================

function createRootStorageRoom(
  storageId,
  nodeId,
  createdBy
) {

  const existingRooms =
    getStorageRoomsByStorageId(
      storageId
    );


  const existingRoot =
    existingRooms.find(
      function(room) {

        return (
          room.type ===
          STORAGE_ROOM_TYPES.ROOT
        );

      }
    );


  if (
    existingRoot
  ) {

    return existingRoot;

  }


  return createStorageRoom({

    storageId:
      storageId,

    nodeId:
      nodeId || "",

    name:
      "Root",

    type:
      STORAGE_ROOM_TYPES.ROOT,

    status:
      STORAGE_ROOM_STATUS.ACTIVE,

    description:
      "Root storage room",

    createdBy:
      createdBy || ""

  });

}


// =====================================================
// CREATE STANDARD STORAGE ROOMS
// =====================================================

function createDefaultStorageRooms(
  storageId,
  nodeId,
  createdBy
) {

  const roomDefinitions = [

    {
      name:
        "Files",

      type:
        STORAGE_ROOM_TYPES.FILES
    },

    {
      name:
        "Images",

      type:
        STORAGE_ROOM_TYPES.IMAGES
    },

    {
      name:
        "Videos",

      type:
        STORAGE_ROOM_TYPES.VIDEOS
    },

    {
      name:
        "Documents",

      type:
        STORAGE_ROOM_TYPES.DOCUMENTS
    },

    {
      name:
        "Backups",

      type:
        STORAGE_ROOM_TYPES.BACKUPS
    }

  ];


  const created = [];


  roomDefinitions.forEach(
    function(definition) {

      const existing =
        findStorageRoomByName(
          storageId,
          definition.name
        );


      if (
        existing
      ) {

        created.push(
          existing
        );

        return;

      }


      const room =
        createStorageRoom({

          storageId:
            storageId,

          nodeId:
            nodeId || "",

          name:
            definition.name,

          type:
            definition.type,

          status:
            STORAGE_ROOM_STATUS.ACTIVE,

          createdBy:
            createdBy || ""

        });


      created.push(
        room
      );

    }
  );


  updateStorageRoomParentCounts(
    storageId
  );


  return created;

}


// =====================================================
// CREATE GOOGLE DRIVE NODE
// =====================================================

function createGoogleDriveNode(
  data
) {

  data =
    data || {};


  return createStorageNode({

    storageId:
      data.storageId,

    name:
      data.name ||
      "Google Drive",

    provider:
      STORAGE_NODE_TYPES.GOOGLE_DRIVE,

    type:
      STORAGE_NODE_TYPES.GOOGLE_DRIVE,

    accountId:
      data.accountId ||
      "",

    driveId:
      data.driveId ||
      "",

    rootFolderId:
      data.rootFolderId ||
      "",

    totalBytes:
      data.totalBytes ||
      0,

    usedBytes:
      data.usedBytes ||
      0,

    maxFileSize:
      data.maxFileSize,

    priority:
      data.priority,

    allocationWeight:
      data.allocationWeight,

    createdBy:
      data.createdBy ||
      ""

  });

}


// =====================================================
// CREATE STORAGE FROM DRIVE
// =====================================================

function createStorageFromDrive(
  data
) {

  data =
    data || {};


  const storage =
    createStorage({

      name:
        data.name ||
        "Google Drive Storage",

      type:
        STORAGE_TYPES.GOOGLE_DRIVE,

      status:
        STORAGE_STATUS.ACTIVE,

      description:
        data.description ||
        "Google Drive storage",

      totalBytes:
        data.totalBytes ||
        0,

      usedBytes:
        data.usedBytes ||
        0,

      maxFileSize:
        data.maxFileSize,

      createdBy:
        data.createdBy ||
        ""

    });


  const node =
    createGoogleDriveNode({

      storageId:
        storage.id,

      name:
        data.nodeName ||
        "Primary Drive",

      accountId:
        data.accountId,

      driveId:
        data.driveId,

      rootFolderId:
        data.rootFolderId,

      totalBytes:
        data.totalBytes,

      usedBytes:
        data.usedBytes,

      maxFileSize:
        data.maxFileSize,

      priority:
        data.priority,

      allocationWeight:
        data.allocationWeight,

      createdBy:
        data.createdBy

    });


  const room =
    createRootStorageRoom(
      storage.id,
      node.id,
      data.createdBy
    );


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
// VALIDATE STORAGE CREATE DATA
// =====================================================

function validateStorageCreateData(
  data
) {

  const errors = [];


  if (
    !data
  ) {

    errors.push(
      "Storage data is required"
    );

  }


  if (
    !data.name
  ) {

    errors.push(
      "Storage name is required"
    );

  }


  if (
    data.name &&
    String(
      data.name
    ).trim().length <
    STORAGE_LIMITS.MIN_NAME_LENGTH
  ) {

    errors.push(
      "Storage name is too short"
    );

  }


  if (
    data.name &&
    String(
      data.name
    ).length >
    STORAGE_LIMITS.MAX_NAME_LENGTH
  ) {

    errors.push(
      "Storage name is too long"
    );

  }


  if (
    data.description &&
    String(
      data.description
    ).length >
    STORAGE_LIMITS.MAX_DESCRIPTION_LENGTH
  ) {

    errors.push(
      "Storage description is too long"
    );

  }


  if (
    data.totalBytes !==
    undefined &&
    Number(
      data.totalBytes
    ) < 0
  ) {

    errors.push(
      "Total storage cannot be negative"
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
// VALIDATE NODE CREATE DATA
// =====================================================

function validateStorageNodeCreateData(
  data
) {

  const errors = [];


  if (
    !data
  ) {

    errors.push(
      "Node data is required"
    );

    return {

      valid:
        false,

      errors:
        errors,

      error:
        errors[0]

    };

  }


  if (
    !data.storageId
  ) {

    errors.push(
      "Storage ID is required"
    );

  }


  if (
    !data.name
  ) {

    errors.push(
      "Node name is required"
    );

  }


  if (
    data.totalBytes !==
    undefined &&
    Number(
      data.totalBytes
    ) < 0
  ) {

    errors.push(
      "Node capacity cannot be negative"
    );

  }


  if (
    data.maxFileSize !==
    undefined &&
    Number(
      data.maxFileSize
    ) < 0
  ) {

    errors.push(
      "Maximum file size cannot be negative"
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
// VALIDATE ROOM CREATE DATA
// =====================================================

function validateStorageRoomCreateData(
  data
) {

  const errors = [];


  if (
    !data
  ) {

    errors.push(
      "Room data is required"
    );

    return {

      valid:
        false,

      errors:
        errors,

      error:
        errors[0]

    };

  }


  if (
    !data.storageId
  ) {

    errors.push(
      "Storage ID is required"
    );

  }


  if (
    !data.name
  ) {

    errors.push(
      "Room name is required"
    );

  }


  if (
    data.totalBytes !==
    undefined &&
    Number(
      data.totalBytes
    ) < 0
  ) {

    errors.push(
      "Room capacity cannot be negative"
    );

  }


  if (
    data.maxFileSize !==
    undefined &&
    Number(
      data.maxFileSize
    ) < 0
  ) {

    errors.push(
      "Maximum file size cannot be negative"
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
// UPDATE STORAGE NODE COUNTS
// =====================================================

function updateStorageNodeParentCounts(
  storageId
) {

  const storage =
    findStorageById(
      storageId
    );


  if (
    !storage
  ) {

    return null;

  }


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  return {

    storageId:
      storageId,

    nodeCount:
      nodes.length

  };

}


// =====================================================
// UPDATE STORAGE ROOM COUNTS
// =====================================================

function updateStorageRoomParentCounts(
  storageId
) {

  const storage =
    findStorageById(
      storageId
    );


  if (
    !storage
  ) {

    return null;

  }


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  return {

    storageId:
      storageId,

    roomCount:
      rooms.length

  };

}


// =====================================================
// CREATE COMPLETE DEFAULT STORAGE
// =====================================================

function createDefaultStorage(
  data
) {

  data =
    data || {};


  const result =
    createStorageFromDrive({

      name:
        data.name ||
        "Primary Storage",

      nodeName:
        data.nodeName ||
        "Primary Node",

      accountId:
        data.accountId ||
        "",

      driveId:
        data.driveId ||
        "",

      rootFolderId:
        data.rootFolderId ||
        "",

      totalBytes:
        data.totalBytes ||
        0,

      usedBytes:
        data.usedBytes ||
        0,

      maxFileSize:
        data.maxFileSize,

      priority:
        data.priority ||
        100,

      allocationWeight:
        data.allocationWeight ||
        1,

      description:
        data.description ||
        "",

      createdBy:
        data.createdBy ||
        ""

    });


  createDefaultStorageRooms(
    result.storage.id,
    result.node.id,
    data.createdBy
  );


  return result;

}