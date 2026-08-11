// =====================================================
// FOLDERUPDATE.GS
// Folder Update Operations
// Registration System API
// =====================================================


// =====================================================
// UPDATE FOLDER
// =====================================================

function updateFolder(data) {

  data = data || {};

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const session =
    requireAuth(
      data.token
    );


  // ===================================================
  // VALIDATE FOLDER ID
  // ===================================================

  if (!data.folderId) {

    return errorResponse(
      "Folder ID is required"
    );

  }


  // ===================================================
  // FIND FOLDER
  // ===================================================

  const folder =
    findFolderById(
      data.folderId
    );

  if (!folder) {

    return errorResponse(
      "Folder not found"
    );

  }


  // ===================================================
  // FIND PROJECT
  // ===================================================

  const project =
    findProjectById(
      folder.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }


  // ===================================================
  // CHECK ACCESS
  // ===================================================

  const isAdmin =
    String(
      session.role || ""
    ).toLowerCase() ===
    "admin";


  const isOwner =
    String(
      project.ownerId
    ) ===
    String(
      session.userId
    );


  const hasAccess =
    checkProjectAccessInternal(
      folder.projectId,
      session.userId
    );


  if (
    !isAdmin &&
    !isOwner &&
    !hasAccess
  ) {

    return errorResponse(
      "You do not have permission to update this folder"
    );

  }


  // ===================================================
  // CHECK UPDATE DATA
  // ===================================================

  const hasName =
    data.name !== undefined &&
    data.name !== null;


  if (!hasName) {

    return errorResponse(
      "Folder name is required"
    );

  }


  // ===================================================
  // SANITIZE NAME
  // ===================================================

  const folderName =
    sanitizeInput(
      data.name
    );


  if (!folderName) {

    return errorResponse(
      "Invalid folder name"
    );

  }


  // ===================================================
  // CHECK NAME LENGTH
  // ===================================================

  if (
    folderName.length > 255
  ) {

    return errorResponse(
      "Folder name is too long"
    );

  }


  // ===================================================
  // CHECK RESERVED NAMES
  // ===================================================

  if (
    folderName === "." ||
    folderName === ".."
  ) {

    return errorResponse(
      "Invalid folder name"
    );

  }


  // ===================================================
  // CHECK DUPLICATE NAME
  // ===================================================

  const existing =
    findFolderByName(
      folder.projectId,
      folderName,
      folder.parentFolderId
    );


  if (
    existing &&
    String(existing.id) !==
    String(folder.id)
  ) {

    return errorResponse(
      "A folder with this name already exists in this location"
    );

  }


  // ===================================================
  // GET SHEET
  // ===================================================

  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  // ===================================================
  // UPDATE GOOGLE DRIVE FOLDER
  // ===================================================

  try {

    const driveFolder =
      DriveApp.getFolderById(
        folder.driveFolderId
      );


    driveFolder.setName(
      folderName
    );

  } catch (error) {

    return errorResponse(
      "Unable to update Google Drive folder: " +
      error.message
    );

  }


  // ===================================================
  // UPDATE SHEET
  // ===================================================

  const now =
    new Date();


  sheet.getRange(
    folder.row,
    FOLDER_COLUMNS.NAME
  )
    .setValue(
      folderName
    );


  sheet.getRange(
    folder.row,
    FOLDER_COLUMNS.UPDATED_AT
  )
    .setValue(
      now
    );


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return successResponse(

    "Folder updated successfully",

    {

      folder: {

        id:
          folder.id,

        projectId:
          folder.projectId,

        parentFolderId:
          folder.parentFolderId,

        name:
          folderName,

        driveFolderId:
          folder.driveFolderId,

        createdBy:
          folder.createdBy,

        createdAt:
          folder.createdAt,

        updatedAt:
          now

      }

    }

  );

}