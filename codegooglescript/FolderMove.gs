// =====================================================
// FOLDERMOVE.GS
// Folder Move Operations
// Registration System API
// =====================================================


// =====================================================
// MOVE FOLDER
// =====================================================

function moveFolder(data) {

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
  // CHECK PROJECT ACCESS
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
      "You do not have permission to move this folder"
    );

  }


  // ===================================================
  // DETERMINE NEW PARENT
  // ===================================================

  const newParentFolderId =
    data.parentFolderId
      ? String(
          data.parentFolderId
        )
      : "";


  // ===================================================
  // PREVENT MOVING TO SAME LOCATION
  // ===================================================

  if (
    String(
      folder.parentFolderId || ""
    ) ===
    newParentFolderId
  ) {

    return errorResponse(
      "Folder is already in this location"
    );

  }


  // ===================================================
  // PREVENT MOVING FOLDER INTO ITSELF
  // ===================================================

  if (
    newParentFolderId &&
    String(
      folder.id
    ) ===
    newParentFolderId
  ) {

    return errorResponse(
      "A folder cannot be moved into itself"
    );

  }


  // ===================================================
  // FIND NEW PARENT FOLDER
  // ===================================================

  let newParentFolder = null;


  if (newParentFolderId) {

    newParentFolder =
      findFolderById(
        newParentFolderId
      );


    if (!newParentFolder) {

      return errorResponse(
        "Destination folder not found"
      );

    }


    // ================================================
    // DESTINATION MUST BELONG TO SAME PROJECT
    // ================================================

    if (
      String(
        newParentFolder.projectId
      ) !==
      String(
        folder.projectId
      )
    ) {

      return errorResponse(
        "Destination folder belongs to another project"
      );

    }


    // ================================================
    // CHECK DESTINATION ACCESS
    // ================================================

    const destinationAccess =
      isAdmin ||
      isOwner ||
      checkProjectAccessInternal(
        newParentFolder.projectId,
        session.userId
      );


    if (!destinationAccess) {

      return errorResponse(
        "You do not have access to the destination folder"
      );

    }

  }


  // ===================================================
  // PREVENT CIRCULAR FOLDER STRUCTURE
  // ===================================================

  if (
    newParentFolderId
  ) {

    const isDescendant =
      isFolderDescendant(
        newParentFolderId,
        folder.id
      );


    if (isDescendant) {

      return errorResponse(
        "A folder cannot be moved inside one of its descendants"
      );

    }

  }


  // ===================================================
  // CHECK DUPLICATE NAME
  // ===================================================

  const existing =
    findFolderByName(
      folder.projectId,
      folder.name,
      newParentFolderId
    );


  if (
    existing &&
    String(
      existing.id
    ) !==
    String(
      folder.id
    )
  ) {

    return errorResponse(
      "A folder with this name already exists in the destination"
    );

  }


  // ===================================================
  // GET GOOGLE DRIVE FOLDERS
  // ===================================================

  let driveFolder;


  try {

    driveFolder =
      DriveApp.getFolderById(
        folder.driveFolderId
      );

  } catch (error) {

    return errorResponse(
      "Unable to access the Google Drive folder: " +
      error.message
    );

  }


  // ===================================================
  // MOVE FOLDER IN GOOGLE DRIVE
  // ===================================================

  try {

    if (newParentFolder) {

      const destinationDriveFolder =
        DriveApp.getFolderById(
          newParentFolder.driveFolderId
        );


      // ==============================================
      // ADD TO NEW PARENT
      // ==============================================

      destinationDriveFolder.addFolder(
        driveFolder
      );


      // ==============================================
      // REMOVE FROM OLD PARENT
      // ==============================================

      if (
        folder.parentFolderId
      ) {

        const oldParentFolder =
          findFolderById(
            folder.parentFolderId
          );


        if (oldParentFolder) {

          try {

            const oldDriveFolder =
              DriveApp.getFolderById(
                oldParentFolder.driveFolderId
              );


            oldDriveFolder.removeFolder(
              driveFolder
            );

          } catch (oldParentError) {

            // The folder was already added to the
            // destination, so do not fail the entire
            // operation because the old parent could
            // not be updated.

          }

        }

      }

    } else {

      // ==============================================
      // MOVE TO PROJECT ROOT
      // ==============================================

      const projectRootFolderId =
        project.driveFolderId;


      if (!projectRootFolderId) {

        return errorResponse(
          "Project root folder is not configured"
        );

      }


      const projectRootFolder =
        DriveApp.getFolderById(
          projectRootFolderId
        );


      projectRootFolder.addFolder(
        driveFolder
      );


      // ==============================================
      // REMOVE FROM CURRENT PARENT
      // ==============================================

      if (
        folder.parentFolderId
      ) {

        const oldParentFolder =
          findFolderById(
            folder.parentFolderId
          );


        if (oldParentFolder) {

          try {

            const oldDriveFolder =
              DriveApp.getFolderById(
                oldParentFolder.driveFolderId
              );


            oldDriveFolder.removeFolder(
              driveFolder
            );

          } catch (oldParentError) {

            // Ignore old-parent cleanup failure.

          }

        }

      }

    }

  } catch (error) {

    return errorResponse(
      "Unable to move Google Drive folder: " +
      error.message
    );

  }


  // ===================================================
  // UPDATE DATABASE
  // ===================================================

  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const now =
    new Date();


  sheet.getRange(
    folder.row,
    FOLDER_COLUMNS.PARENT_FOLDER_ID
  )
    .setValue(
      newParentFolderId
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

    "Folder moved successfully",

    {

      folder: {

        id:
          folder.id,

        projectId:
          folder.projectId,

        parentFolderId:
          newParentFolderId,

        name:
          folder.name,

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


// =====================================================
// CHECK FOLDER DESCENDANT
// Prevents circular folder structures.
// =====================================================

function isFolderDescendant(
  folderId,
  possibleAncestorId
) {

  let currentFolderId =
    String(
      folderId || ""
    );


  const visited = {};


  while (
    currentFolderId
  ) {

    // ================================================
    // PROTECT AGAINST CORRUPTED CIRCULAR DATA
    // ================================================

    if (
      visited[currentFolderId]
    ) {

      return true;

    }


    visited[currentFolderId] =
      true;


    // ================================================
    // FIND CURRENT FOLDER
    // ================================================

    const currentFolder =
      findFolderById(
        currentFolderId
      );


    if (!currentFolder) {

      return false;

    }


    // ================================================
    // CHECK PARENT
    // ================================================

    const parentId =
      String(
        currentFolder.parentFolderId || ""
      );


    if (!parentId) {

      return false;

    }


    // ================================================
    // FOUND TARGET
    // ================================================

    if (
      parentId ===
      String(
        possibleAncestorId
      )
    ) {

      return true;

    }


    currentFolderId =
      parentId;

  }


  return false;

}