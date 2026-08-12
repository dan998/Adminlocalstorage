// =====================================================
// STORAGEROUTER.GS
// Storage API Router
// Cloud Project Platform
// =====================================================


// =====================================================
// MAIN STORAGE ROUTER
// =====================================================

function handleStorageRoutes(
  action,
  data
) {

  data =
    data || {};


  if (!action) {

    throw new Error(
      "Storage action is required"
    );

  }


  // ===================================================
  // CREATE
  // ===================================================

  if (
    action === "createStorage"
  ) {

    return createStorage(
      data
    );

  }


  if (
    action === "createStorageNode"
  ) {

    return createStorageNode(
      data
    );

  }


  if (
    action === "createStorageRoom"
  ) {

    return createStorageRoom(
      data
    );

  }


  // ===================================================
  // READ
  // ===================================================

  if (
    action === "getStorage"
  ) {

    return getStorage(
      data.storageId
    );

  }


  if (
    action === "getStorageByName"
  ) {

    return getStorageByName(
      data.name
    );

  }


  if (
    action === "getStorages"
  ) {

    return getStorages();

  }


  if (
    action === "getActiveStorages"
  ) {

    return getActiveStorages();

  }


  if (
    action === "getCompleteStorage"
  ) {

    return getCompleteStorage(
      data.storageId
    );

  }


  if (
    action === "getStorageSummary"
  ) {

    return getStorageSummary(
      data.storageId
    );

  }


  if (
    action === "getStorageHealth"
  ) {

    return getStorageHealth(
      data.storageId
    );

  }


  if (
    action === "getStorageCapacity"
  ) {

    return getStorageCapacity(
      data.storageId
    );

  }


  if (
    action === "getTotalStorageCapacity"
  ) {

    return getTotalStorageCapacity();

  }


  if (
    action === "searchStorage"
  ) {

    return searchStorage(
      data.search
    );

  }


  if (
    action === "getStorageDashboard"
  ) {

    return getStorageDashboard();

  }


  // ===================================================
  // STORAGE + NODES
  // ===================================================

  if (
    action === "getStorageWithNodes"
  ) {

    return getStorageWithNodes(
      data.storageId
    );

  }


  if (
    action === "getStorageNodesStatus"
  ) {

    return getStorageNodesStatus(
      data.storageId
    );

  }


  // ===================================================
  // STORAGE + ROOMS
  // ===================================================

  if (
    action === "getStorageWithRooms"
  ) {

    return getStorageWithRooms(
      data.storageId
    );

  }


  if (
    action === "getStorageRoomsStatus"
  ) {

    return getStorageRoomsStatus(
      data.storageId
    );

  }


  // ===================================================
  // FILE CAPACITY
  // ===================================================

  if (
    action === "canStoreFile"
  ) {

    return {

      canStore:
        canStoreFile(
          data.fileSize
        )

    };

  }


  if (
    action === "findStorageForFile"
  ) {

    return findStorageForFile(
      data.fileSize
    );

  }


  if (
    action === "findStorageNodeForFile"
  ) {

    return findStorageNodeForFile(
      data.fileSize,
      data.storageId
    );

  }


  if (
    action === "getStorageAllocationCandidates"
  ) {

    return getStorageAllocationCandidates(
      data.fileSize
    );

  }


  // ===================================================
  // UPDATE
  // ===================================================

  if (
    action === "updateStorage"
  ) {

    return updateStorage(
      data.storageId,
      data
    );

  }


  if (
    action === "updateStorageName"
  ) {

    return updateStorageName(
      data.storageId,
      data.name
    );

  }


  if (
    action === "updateStorageDescription"
  ) {

    return updateStorageDescription(
      data.storageId,
      data.description
    );

  }


  if (
    action === "updateStorageType"
  ) {

    return updateStorageType(
      data.storageId,
      data.type
    );

  }


  if (
    action === "updateStorageStatus"
  ) {

    return updateStorageStatus(
      data.storageId,
      data.status
    );

  }


  if (
    action === "enableStorage"
  ) {

    return enableStorage(
      data.storageId
    );

  }


  if (
    action === "disableStorage"
  ) {

    return disableStorage(
      data.storageId
    );

  }


  if (
    action === "updateStorageCapacity"
  ) {

    return updateStorageCapacity(
      data.storageId,
      data.totalBytes,
      data.usedBytes
    );

  }


  if (
    action === "updateStorageUsage"
  ) {

    return updateStorageUsage(
      data.storageId,
      data.usedBytes
    );

  }


  if (
    action === "increaseStorageUsage"
  ) {

    return increaseStorageUsage(
      data.storageId,
      data.bytes
    );

  }


  if (
    action === "decreaseStorageUsage"
  ) {

    return decreaseStorageUsage(
      data.storageId,
      data.bytes
    );

  }


  if (
    action === "updateStorageMaxFileSize"
  ) {

    return updateStorageMaxFileSize(
      data.storageId,
      data.maxFileSize
    );

  }


  if (
    action === "recalculateStorageCounts"
  ) {

    return recalculateStorageCounts(
      data.storageId
    );

  }


  if (
    action === "recalculateStorageCapacity"
  ) {

    return recalculateStorageCapacity(
      data.storageId
    );

  }


  if (
    action === "synchronizeStorage"
  ) {

    return synchronizeStorage(
      data.storageId
    );

  }


  // ===================================================
  // NODE UPDATE
  // ===================================================

  if (
    action === "updateStorageNode"
  ) {

    return updateStorageNode(
      data.nodeId,
      data
    );

  }


  if (
    action === "updateStorageNodeStatus"
  ) {

    return updateStorageNodeStatus(
      data.nodeId,
      data.status
    );

  }


  if (
    action === "enableStorageNode"
  ) {

    return enableStorageNode(
      data.nodeId
    );

  }


  if (
    action === "disableStorageNode"
  ) {

    return disableStorageNode(
      data.nodeId
    );

  }


  if (
    action === "markStorageNodeFull"
  ) {

    return markStorageNodeFull(
      data.nodeId
    );

  }


  if (
    action === "updateStorageNodeCapacity"
  ) {

    return updateStorageNodeCapacity(
      data.nodeId,
      data.totalBytes,
      data.usedBytes
    );

  }


  if (
    action === "increaseStorageNodeUsage"
  ) {

    return increaseStorageNodeUsage(
      data.nodeId,
      data.bytes
    );

  }


  if (
    action === "decreaseStorageNodeUsage"
  ) {

    return decreaseStorageNodeUsage(
      data.nodeId,
      data.bytes
    );

  }


  if (
    action === "updateStorageNodeHealth"
  ) {

    return updateStorageNodeHealth(
      data.nodeId,
      data.status,
      data.errorMessage
    );

  }


  if (
    action === "updateStorageNodePriority"
  ) {

    return updateStorageNodePriority(
      data.nodeId,
      data.priority
    );

  }


  if (
    action === "updateStorageNodeWeight"
  ) {

    return updateStorageNodeWeight(
      data.nodeId,
      data.weight
    );

  }


  if (
    action === "updateStorageNodeFileCount"
  ) {

    return updateStorageNodeFileCount(
      data.nodeId,
      data.fileCount
    );

  }


  // ===================================================
  // DELETE
  // ===================================================

  if (
    action === "canDeleteStorage"
  ) {

    return canDeleteStorage(
      data.storageId
    );

  }


  if (
    action === "deleteStorage"
  ) {

    return deleteStorage(
      data.storageId,
      data.options
    );

  }


  if (
    action === "safeDeleteStorage"
  ) {

    return safeDeleteStorage(
      data.storageId
    );

  }


  if (
    action === "softDeleteStorage"
  ) {

    return softDeleteStorage(
      data.storageId
    );

  }


  if (
    action === "archiveStorage"
  ) {

    return archiveStorage(
      data.storageId
    );

  }


  if (
    action === "restoreStorage"
  ) {

    return restoreStorage(
      data.storageId
    );

  }


  if (
    action === "emptyStorage"
  ) {

    return emptyStorage(
      data.storageId,
      data.options
    );

  }


  if (
    action === "purgeStorage"
  ) {

    return purgeStorage(
      data.storageId
    );

  }


  if (
    action === "deleteStorageNode"
  ) {

    return deleteStorageNode(
      data.nodeId,
      data.options
    );

  }


  if (
    action === "deleteStorageRoom"
  ) {

    return deleteStorageRoom(
      data.roomId,
      data.options
    );

  }


  if (
    action === "deleteAllStorageNodes"
  ) {

    return deleteAllStorageNodes(
      data.storageId,
      data.options
    );

  }


  if (
    action === "deleteAllStorageRooms"
  ) {

    return deleteAllStorageRooms(
      data.storageId,
      data.options
    );

  }


  if (
    action === "canDeleteStorageNode"
  ) {

    return canDeleteStorageNode(
      data.nodeId
    );

  }


  if (
    action === "canDeleteStorageRoom"
  ) {

    return canDeleteStorageRoom(
      data.roomId
    );

  }


  if (
    action === "deleteStorageByName"
  ) {

    return deleteStorageByName(
      data.name,
      data.options
    );

  }


  // ===================================================
  // CLEANUP
  // ===================================================

  if (
    action === "deleteEmptyStorages"
  ) {

    return deleteEmptyStorages();

  }


  if (
    action === "deleteDisabledStorages"
  ) {

    return deleteDisabledStorages(
      data.options
    );

  }


  // ===================================================
  // UNKNOWN ACTION
  // ===================================================

  throw new Error(
    "Unknown storage action: " +
    action
  );

}


// =====================================================
// STORAGE ACTION LIST
// =====================================================

function getStorageActions() {

  return [

    // Create

    "createStorage",
    "createStorageNode",
    "createStorageRoom",


    // Read

    "getStorage",
    "getStorageByName",
    "getStorages",
    "getActiveStorages",
    "getCompleteStorage",
    "getStorageSummary",
    "getStorageHealth",
    "getStorageCapacity",
    "getTotalStorageCapacity",
    "searchStorage",
    "getStorageDashboard",


    // Nodes

    "getStorageWithNodes",
    "getStorageNodesStatus",


    // Rooms

    "getStorageWithRooms",
    "getStorageRoomsStatus",


    // Allocation

    "canStoreFile",
    "findStorageForFile",
    "findStorageNodeForFile",
    "getStorageAllocationCandidates",


    // Update

    "updateStorage",
    "updateStorageName",
    "updateStorageDescription",
    "updateStorageType",
    "updateStorageStatus",
    "enableStorage",
    "disableStorage",
    "updateStorageCapacity",
    "updateStorageUsage",
    "increaseStorageUsage",
    "decreaseStorageUsage",
    "updateStorageMaxFileSize",
    "recalculateStorageCounts",
    "recalculateStorageCapacity",
    "synchronizeStorage",


    // Node update

    "updateStorageNode",
    "updateStorageNodeStatus",
    "enableStorageNode",
    "disableStorageNode",
    "markStorageNodeFull",
    "updateStorageNodeCapacity",
    "increaseStorageNodeUsage",
    "decreaseStorageNodeUsage",
    "updateStorageNodeHealth",
    "updateStorageNodePriority",
    "updateStorageNodeWeight",
    "updateStorageNodeFileCount",


    // Delete

    "canDeleteStorage",
    "deleteStorage",
    "safeDeleteStorage",
    "softDeleteStorage",
    "archiveStorage",
    "restoreStorage",
    "emptyStorage",
    "purgeStorage",
    "deleteStorageNode",
    "deleteStorageRoom",
    "deleteAllStorageNodes",
    "deleteAllStorageRooms",
    "canDeleteStorageNode",
    "canDeleteStorageRoom",
    "deleteStorageByName",


    // Cleanup

    "deleteEmptyStorages",
    "deleteDisabledStorages"

  ];

}


// =====================================================
// CHECK STORAGE ACTION
// =====================================================

function isValidStorageAction(
  action
) {

  return getStorageActions()
    .indexOf(
      action
    ) !== -1;

}


// =====================================================
// ROUTE STORAGE REQUEST
// =====================================================

function routeStorageRequest(
  request
) {

  request =
    request || {};


  const action =
    request.action ||
    request.operation;


  const data =
    request.data ||
    request;


  if (
    !action
  ) {

    throw new Error(
      "Storage action is required"
    );

  }


  if (
    !isValidStorageAction(
      action
    )
  ) {

    throw new Error(
      "Invalid storage action: " +
      action
    );

  }


  return handleStorageRoutes(
    action,
    data
  );

}