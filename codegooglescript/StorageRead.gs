// =====================================================
// STORAGEREAD.GS
// Storage Read Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// GET STORAGE BY ID
// =====================================================

function getStorage(
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


  return storage;

}


// =====================================================
// GET STORAGE BY NAME
// =====================================================

function getStorageByName(
  name
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


  return storage;

}


// =====================================================
// GET ALL STORAGE
// =====================================================

function getStorages() {

  return getAllStorageRecords();

}


// =====================================================
// GET ACTIVE STORAGE
// =====================================================

function getActiveStorages() {

  return getActiveStorageRecords();

}


// =====================================================
// GET STORAGE WITH NODES
// =====================================================

function getStorageWithNodes(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  return {

    storage:
      storage,

    nodes:
      nodes,

    nodeCount:
      nodes.length

  };

}


// =====================================================
// GET STORAGE WITH ROOMS
// =====================================================

function getStorageWithRooms(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  return {

    storage:
      storage,

    rooms:
      rooms,

    roomCount:
      rooms.length

  };

}


// =====================================================
// GET COMPLETE STORAGE
// =====================================================

function getCompleteStorage(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  return {

    storage:
      storage,

    nodes:
      nodes,

    rooms:
      rooms,

    nodeCount:
      nodes.length,

    roomCount:
      rooms.length

  };

}


// =====================================================
// GET STORAGE SUMMARY
// =====================================================

function getStorageSummary(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  let totalBytes =
    0;


  let usedBytes =
    0;


  let availableBytes =
    0;


  let fileCount =
    0;


  let activeNodes =
    0;


  let fullNodes =
    0;


  let errorNodes =
    0;


  nodes.forEach(
    function(node) {

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


      fileCount +=
        Number(
          node.fileCount || 0
        );


      if (
        node.status ===
        STORAGE_NODE_STATUS.ACTIVE
      ) {

        activeNodes++;

      }


      if (
        node.status ===
        STORAGE_NODE_STATUS.FULL
      ) {

        fullNodes++;

      }


      if (
        node.status ===
        STORAGE_NODE_STATUS.ERROR
      ) {

        errorNodes++;

      }

    }
  );


  const usagePercent =
    calculateStorageUsagePercent(
      totalBytes,
      usedBytes
    );


  return {

    storageId:
      storage.id,

    name:
      storage.name,

    type:
      storage.type,

    status:
      storage.status,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      Math.max(
        0,
        availableBytes
      ),

    usagePercent:
      usagePercent,

    nodeCount:
      nodes.length,

    roomCount:
      rooms.length,

    activeNodes:
      activeNodes,

    fullNodes:
      fullNodes,

    errorNodes:
      errorNodes,

    fileCount:
      fileCount

  };

}


// =====================================================
// GET STORAGE HEALTH
// =====================================================

function getStorageHealth(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let healthyNodes =
    0;


  let unhealthyNodes =
    0;


  let fullNodes =
    0;


  nodes.forEach(
    function(node) {

      if (
        node.status ===
        STORAGE_NODE_STATUS.ACTIVE
      ) {

        healthyNodes++;

      }
      else if (
        node.status ===
        STORAGE_NODE_STATUS.FULL
      ) {

        fullNodes++;

      }
      else {

        unhealthyNodes++;

      }

    }
  );


  let health =
    "Healthy";


  if (
    nodes.length === 0
  ) {

    health =
      "No Nodes";

  }
  else if (
    healthyNodes === 0
  ) {

    health =
      "Unavailable";

  }
  else if (
    unhealthyNodes > 0 ||
    fullNodes > 0
  ) {

    health =
      "Warning";

  }


  return {

    storageId:
      storage.id,

    name:
      storage.name,

    status:
      storage.status,

    health:
      health,

    totalNodes:
      nodes.length,

    healthyNodes:
      healthyNodes,

    unhealthyNodes:
      unhealthyNodes,

    fullNodes:
      fullNodes

  };

}


// =====================================================
// GET AVAILABLE STORAGE
// =====================================================

function getAvailableStorage(
  requiredBytes
) {

  requiredBytes =
    Number(
      requiredBytes || 0
    );


  if (
    requiredBytes < 0
  ) {

    requiredBytes =
      0;

  }


  const storages =
    getActiveStorageRecords();


  const available = [];


  storages.forEach(
    function(storage) {

      const nodes =
        getAvailableStorageNodes(
          requiredBytes,
          storage.id
        );


      if (
        nodes.length === 0
      ) {

        return;

      }


      available.push({

        storage:
          storage,

        nodes:
          nodes,

        nodeCount:
          nodes.length,

        availableBytes:
          nodes.reduce(
            function(total, node) {

              return (
                total +
                Number(
                  node.availableBytes ||
                  0
                )
              );

            },
            0
          )

      });

    }
  );


  return available;

}


// =====================================================
// FIND STORAGE FOR FILE
// =====================================================

function findStorageForFile(
  fileSize
) {

  fileSize =
    Number(
      fileSize || 0
    );


  if (
    fileSize < 0
  ) {

    throw new Error(
      "File size cannot be negative"
    );

  }


  const available =
    getAvailableStorage(
      fileSize
    );


  if (
    available.length === 0
  ) {

    return null;

  }


  available.sort(
    function(a, b) {

      return (
        b.availableBytes -
        a.availableBytes
      );

    }
  );


  return available[0];

}


// =====================================================
// FIND BEST NODE FOR FILE
// =====================================================

function findStorageNodeForFile(
  fileSize,
  storageId
) {

  fileSize =
    Number(
      fileSize || 0
    );


  if (
    fileSize < 0
  ) {

    throw new Error(
      "File size cannot be negative"
    );

  }


  const node =
    getBestAvailableStorageNode(
      fileSize,
      storageId
    );


  if (
    node
  ) {

    return node;

  }


  return getLeastUsedStorageNode(
    fileSize,
    storageId
  );

}


// =====================================================
// GET STORAGE CAPACITY
// =====================================================

function getStorageCapacity(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  let totalBytes =
    0;


  let usedBytes =
    0;


  let availableBytes =
    0;


  nodes.forEach(
    function(node) {

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
  );


  return {

    storageId:
      storage.id,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      Math.max(
        0,
        availableBytes
      ),

    usagePercent:
      calculateStorageUsagePercent(
        totalBytes,
        usedBytes
      )

  };

}


// =====================================================
// GET ALL STORAGE CAPACITY
// =====================================================

function getTotalStorageCapacity() {

  const storages =
    getActiveStorageRecords();


  let totalBytes =
    0;


  let usedBytes =
    0;


  let availableBytes =
    0;


  let nodeCount =
    0;


  storages.forEach(
    function(storage) {

      const nodes =
        getStorageNodesByStorageId(
          storage.id
        );


      nodes.forEach(
        function(node) {

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


          nodeCount++;

        }
      );

    }
  );


  return {

    storageCount:
      storages.length,

    nodeCount:
      nodeCount,

    totalBytes:
      totalBytes,

    usedBytes:
      usedBytes,

    availableBytes:
      Math.max(
        0,
        availableBytes
      ),

    usagePercent:
      calculateStorageUsagePercent(
        totalBytes,
        usedBytes
      )

  };

}


// =====================================================
// GET STORAGE STATUS
// =====================================================

function readStorageStatus(
  storageId
) {

  const storage =
    getStorage(
      storageId
    );


  return getStorageStatus(
    storage
  );

}


// =====================================================
// SEARCH STORAGE
// =====================================================

function searchStorage(
  searchTerm
) {

  const term =
    String(
      searchTerm ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    !term
  ) {

    return getAllStorageRecords();

  }


  return getAllStorageRecords()
    .filter(
      function(storage) {

        const name =
          String(
            storage.name ||
            ""
          )
            .toLowerCase();


        const id =
          String(
            storage.id ||
            ""
          )
            .toLowerCase();


        const type =
          String(
            storage.type ||
            ""
          )
            .toLowerCase();


        const status =
          String(
            storage.status ||
            ""
          )
            .toLowerCase();


        const description =
          String(
            storage.description ||
            ""
          )
            .toLowerCase();


        return (
          name.indexOf(term) !== -1 ||
          id.indexOf(term) !== -1 ||
          type.indexOf(term) !== -1 ||
          status.indexOf(term) !== -1 ||
          description.indexOf(term) !== -1
        );

      }
    );

}


// =====================================================
// GET STORAGE NODES STATUS
// =====================================================

function getStorageNodesStatus(
  storageId
) {

  const nodes =
    getStorageNodesByStorageId(
      storageId
    );


  return nodes.map(
    function(node) {

      return {

        id:
          node.id,

        name:
          node.name,

        status:
          node.status,

        provider:
          node.provider,

        totalBytes:
          node.totalBytes,

        usedBytes:
          node.usedBytes,

        availableBytes:
          node.availableBytes,

        usagePercent:
          getStorageNodeUsagePercent(
            node
          ),

        fileCount:
          node.fileCount,

        lastHealthCheck:
          node.lastHealthCheck,

        lastError:
          node.lastError

      };

    }
  );

}


// =====================================================
// GET STORAGE ROOMS STATUS
// =====================================================

function getStorageRoomsStatus(
  storageId
) {

  const rooms =
    getStorageRoomsByStorageId(
      storageId
    );


  return rooms.map(
    function(room) {

      return {

        id:
          room.id,

        name:
          room.name,

        type:
          room.type,

        status:
          room.status,

        storageId:
          room.storageId,

        nodeId:
          room.nodeId,

        totalBytes:
          room.totalBytes,

        usedBytes:
          room.usedBytes,

        availableBytes:
          room.availableBytes,

        fileCount:
          room.fileCount

      };

    }
  );

}


// =====================================================
// GET STORAGE DASHBOARD
// =====================================================

function getStorageDashboard() {

  const capacity =
    getTotalStorageCapacity();


  const storages =
    getActiveStorageRecords();


  const storageData =
    storages.map(
      function(storage) {

        return getStorageSummary(
          storage.id
        );

      }
    );


  return {

    capacity:
      capacity,

    storages:
      storageData,

    generatedAt:
      new Date()

  };

}


// =====================================================
// GET STORAGE FOR ALLOCATION
// =====================================================

function getStorageAllocationCandidates(
  fileSize
) {

  fileSize =
    Number(
      fileSize || 0
    );


  const storages =
    getActiveStorageRecords();


  const candidates = [];


  storages.forEach(
    function(storage) {

      const nodes =
        getAvailableStorageNodes(
          fileSize,
          storage.id
        );


      nodes.forEach(
        function(node) {

          candidates.push({

            storageId:
              storage.id,

            storageName:
              storage.name,

            nodeId:
              node.id,

            nodeName:
              node.name,

            availableBytes:
              node.availableBytes,

            usagePercent:
              getStorageNodeUsagePercent(
                node
              ),

            priority:
              node.priority,

            allocationWeight:
              node.allocationWeight

          });

        }
      );

    }
  );


  candidates.sort(
    function(a, b) {

      if (
        b.priority !==
        a.priority
      ) {

        return (
          b.priority -
          a.priority
        );

      }


      if (
        b.availableBytes !==
        a.availableBytes
      ) {

        return (
          b.availableBytes -
          a.availableBytes
        );

      }


      return (
        a.usagePercent -
        b.usagePercent
      );

    }
  );


  return candidates;

}


// =====================================================
// CHECK WHETHER ANY STORAGE CAN ACCEPT FILE
// =====================================================

function canStoreFile(
  fileSize
) {

  fileSize =
    Number(
      fileSize || 0
    );


  if (
    fileSize < 0
  ) {

    return false;

  }


  return (
    getStorageAllocationCandidates(
      fileSize
    ).length > 0
  );

}


// =====================================================
// GET STORAGE READ CONFIG
// =====================================================

function getStorageReadConfig() {

  return {

    storageCount:
      getAllStorageRecords().length,

    activeStorageCount:
      getActiveStorageRecords().length,

    capacity:
      getTotalStorageCapacity()

  };

}