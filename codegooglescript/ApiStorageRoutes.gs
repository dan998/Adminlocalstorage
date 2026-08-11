// =====================================================
// APISTORAGEROUTES.GS
// Storage API Routes
// Cloud Project Platform
// =====================================================


// =====================================================
// STORAGE ROUTE HANDLER
// =====================================================

function handleStorageRoutes(
  action,
  data
) {

  action =
    String(
      action || ""
    ).trim();


  data =
    data || {};


  // ===================================================
  // STORAGE
  // ===================================================

  switch (action) {


    // =================================================
    // CREATE STORAGE
    // =================================================

    case "createStorage":

      return createStorage(
        data
      );


    // =================================================
    // GET STORAGE
    // =================================================

    case "getStorage":

      return getStorage(
        data
      );


    // =================================================
    // GET ALL STORAGE
    // =================================================

    case "getStorages":

      return getStorages(
        data
      );


    // =================================================
    // UPDATE STORAGE
    // =================================================

    case "updateStorage":

      return updateStorage(
        data
      );


    // =================================================
    // DELETE STORAGE
    // =================================================

    case "deleteStorage":

      return deleteStorage(
        data
      );


    // =================================================
    // STORAGE ROOMS
    // =================================================

    case "createStorageRoom":

      return createStorageRoom(
        data
      );


    case "getStorageRooms":

      return getStorageRooms(
        data
      );


    case "getStorageRoom":

      return getStorageRoom(
        data
      );


    case "updateStorageRoom":

      return updateStorageRoom(
        data
      );


    case "deleteStorageRoom":

      return deleteStorageRoom(
        data
      );


    // =================================================
    // STORAGE NODES
    // =================================================

    case "createStorageNode":

      return createStorageNode(
        data
      );


    case "getStorageNodes":

      return getStorageNodes(
        data
      );


    case "getStorageNode":

      return getStorageNode(
        data
      );


    case "updateStorageNode":

      return updateStorageNode(
        data
      );


    case "deleteStorageNode":

      return deleteStorageNode(
        data
      );


    // =================================================
    // STORAGE ROUTING
    // =================================================

    case "routeStorage":

      return routeStorage(
        data
      );


    case "selectStorage":

      return selectStorage(
        data
      );


    case "selectStorageRoom":

      return selectStorageRoom(
        data
      );


    // =================================================
    // STORAGE USAGE
    // =================================================

    case "getStorageUsage":

      return getStorageUsage(
        data
      );


    case "getAllStorageUsage":

      return getAllStorageUsage(
        data
      );


    // =================================================
    // STORAGE QUOTA
    // =================================================

    case "getStorageQuota":

      return getStorageQuota(
        data
      );


    case "updateStorageQuota":

      return updateStorageQuota(
        data
      );


    // =================================================
    // STORAGE HEALTH
    // =================================================

    case "getStorageHealth":

      return getStorageHealth(
        data
      );


    case "checkStorageHealth":

      return checkStorageHealth(
        data
      );


    case "checkAllStorageHealth":

      return checkAllStorageHealth(
        data
      );


    // =================================================
    // STORAGE ALLOCATION
    // =================================================

    case "allocateStorage":

      return allocateStorage(
        data
      );


    case "reallocateStorage":

      return reallocateStorage(
        data
      );


    // =================================================
    // STORAGE STATISTICS
    // =================================================

    case "getStorageStatistics":

      return getStorageStatistics(
        data
      );


    // =================================================
    // UNKNOWN STORAGE ACTION
    // =================================================

    default:

      return null;

  }

}