// =====================================================
// FOLDERCREATE.GS
// Folder Creation
// Registration System API
// =====================================================


// =====================================================
// CREATE FOLDER
// =====================================================

function createFolder(data) {

  data = data || {};

  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const session =
    requireAuth(
      data.token
    );


  // ===================================================
  // VALIDATE FOLDER NAME
  // ===================================================

  if (!data.name) {

    return errorResponse(
      "Folder name is required"
    );

  }

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
  // VALIDATE PROJECT
  // ===================================================

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }


  // ===================================================
  // CHECK PROJECT ACCESS
  // ===================================================

  const isAdmin =
    String(
      session.role || ""
    ).toLowerCase() === "admin";


  const isOwner =
    String(
      project.ownerId
    ) ===
    String(
      session.userId
    );


  const hasAccess =
    checkProjectAccessInternal(
      data.projectId,
      session.userId
    );


  if (
    !isAdmin &&
    !isOwner &&
    !hasAccess
  ) {

    return errorResponse(
      "You do not have access to this project"
    );

  }


  // ===================================================
  // VALIDATE PARENT FOLDER
  // ===================================================

  let parentFolder = null;

  if (data.parentFolderId) {

    parentFolder =
      findFolderById(
        data.parentFolderId
      );

    if (!parentFolder) {

      return errorResponse(
        "Parent folder not found"
      );

    }


    if (
      String(
        parentFolder.projectId
      ) !==
      String(
        data.projectId
      )
    ) {

      return errorResponse(
        "Parent folder does not belong to this project"
      );

    }

  }


  // ===================================================
  // CHECK DUPLICATE FOLDER
  // ===================================================

  const existing =
    findFolderByName(
      data.projectId,
      folderName,
      data.parentFolderId || ""
    );

  if (existing) {

    return errorResponse(
      "A folder with this name already exists in this location"
    );

  }


  // ===================================================
  // CREATE FOLDER ID
  // ===================================================

  const folderId =
    generateID(
      "FLD"
    );


  // ===================================================
  // CREATE GOOGLE DRIVE FOLDER
  // ===================================================

  let driveFolder;

  try {

    if (parentFolder) {

      const parentDriveFolder =
        DriveApp.getFolderById(
          parentFolder.driveFolderId
        );

      driveFolder =
        parentDriveFolder.createFolder(
          folderName
        );

    } else {

      driveFolder =
        DriveApp.createFolder(
          folderName
        );

    }

  } catch (error) {

    return errorResponse(
      "Unable to create Google Drive folder: " +
      error.message
    );

  }


  // ===================================================
  // SAVE FOLDER METADATA
  // ===================================================

  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const now =
    new Date();


  sheet.appendRow([

    folderId,

    data.projectId,

    data.parentFolderId || "",

    folderName,

    driveFolder.getId(),

    session.userId,

    now,

    now

  ]);


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return successResponse(

    "Folder created successfully",

    {

      folder: {

        id:
          folderId,

        projectId:
          data.projectId,

        parentFolderId:
          data.parentFolderId || "",

        name:
          folderName,

        driveFolderId:
          driveFolder.getId(),

        createdBy:
          session.userId,

        createdAt:
          now,

        updatedAt:
          now

      }

    }

  );

}