// =====================================================
// APIFOLDERROUTES.GS
// Folder API Routes
// Registration System API
// =====================================================


// =====================================================
// API: CREATE FOLDER
// =====================================================

function apiCreateFolder(data) {

  data = data || {};

  return createFolder(data);

}


// =====================================================
// API: GET FOLDERS
// =====================================================

function apiGetFolders(data) {

  data = data || {};

  return getFolders(data);

}


// =====================================================
// API: GET FOLDER
// =====================================================

function apiGetFolder(data) {

  data = data || {};

  return getFolder(data);

}


// =====================================================
// API: UPDATE FOLDER
// =====================================================

function apiUpdateFolder(data) {

  data = data || {};

  return updateFolder(data);

}


// =====================================================
// API: DELETE FOLDER
// =====================================================

function apiDeleteFolder(data) {

  data = data || {};

  return deleteFolder(data);

}


// =====================================================
// API: MOVE FOLDER
// =====================================================

function apiMoveFolder(data) {

  data = data || {};

  return moveFolder(data);

}


// =====================================================
// FOLDER ROUTE HANDLER
// Used by ApiRouter.gs
// =====================================================

function handleFolderRoutes(
  action,
  data
) {

  data = data || {};

  switch (
    String(action || "")
      .trim()
      .toLowerCase()
  ) {


    // =================================================
    // CREATE
    // =================================================

    case "createfolder":

      return apiCreateFolder(
        data
      );


    // =================================================
    // GET ALL
    // =================================================

    case "getfolders":

      return apiGetFolders(
        data
      );


    // =================================================
    // GET ONE
    // =================================================

    case "getfolder":

      return apiGetFolder(
        data
      );


    // =================================================
    // UPDATE
    // =================================================

    case "updatefolder":

      return apiUpdateFolder(
        data
      );


    // =================================================
    // DELETE
    // =================================================

    case "deletefolder":

      return apiDeleteFolder(
        data
      );


    // =================================================
    // MOVE
    // =================================================

    case "movefolder":

      return apiMoveFolder(
        data
      );


    // =================================================
    // NOT A FOLDER ACTION
    // =================================================

    default:

      return null;

  }

}