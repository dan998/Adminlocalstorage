// =====================================================
// FOLDERDELETE.GS
// Folder Delete Operations
// Registration System API
// =====================================================


// =====================================================
// DELETE FOLDER
// =====================================================

function deleteFolder(data) {

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
  // CHECK PERMISSION
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


  if (
    !isAdmin &&
    !isOwner
  ) {

    return errorResponse(
      "You do not have permission to delete this folder"
    );

  }


  // ===================================================
  // CHECK GOOGLE DRIVE FOLDER
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
  // CHECK CONTENT
  // ===================================================

  const recursive =
    data.recursive === true ||
    String(
      data.recursive || ""
    ).toLowerCase() === "true";


  if (!recursive) {

    const files =
      driveFolder.getFiles();


    const subFolders =
      driveFolder.getFolders();


    if (
      files.hasNext() ||
      subFolders.hasNext()
    ) {

      return errorResponse(
        "Folder is not empty. Use recursive=true to delete the folder and its contents."
      );

    }

  }


  // ===================================================
  // DELETE FROM GOOGLE DRIVE
  // ===================================================

  try {

    /*
     * IMPORTANT:
     *
     * Google Drive folders are normally moved to
     * trash rather than permanently destroyed.
     *
     * This is safer because the folder can potentially
     * be recovered from Google Drive Trash.
     */

    driveFolder.setTrashed(
      true
    );

  } catch (error) {

    return errorResponse(
      "Unable to delete Google Drive folder: " +
      error.message
    );

  }


  // ===================================================
  // DELETE DATABASE RECORDS
  // ===================================================

  try {

    removeFolderDatabaseRecords(
      folder.id
    );

  } catch (error) {

    /*
     * The Drive folder has already been moved to Trash.
     *
     * Return an error so the administrator knows that
     * database cleanup requires attention.
     */

    return errorResponse(
      "Folder was moved to Google Drive Trash, but database cleanup failed: " +
      error.message
    );

  }


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return successResponse(

    "Folder deleted successfully",

    {

      folderId:
        folder.id,

      projectId:
        folder.projectId,

      driveFolderId:
        folder.driveFolderId,

      deletedBy:
        session.userId,

      deletedAt:
        new Date()

    }

  );

}


// =====================================================
// REMOVE FOLDER DATABASE RECORDS
// =====================================================

function removeFolderDatabaseRecords(
  folderId
) {

  if (!folderId) {

    return false;

  }


  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  // ===================================================
  // DELETE FOLDER RECORD
  // ===================================================

  for (
    let i = values.length - 1;
    i >= 1;
    i--
  ) {

    const row =
      values[i];


    const rowFolderId =
      row[
        FOLDER_COLUMNS.ID - 1
      ];


    if (
      String(
        rowFolderId
      ) ===
      String(
        folderId
      )
    ) {

      sheet.deleteRow(
        i + 1
      );

    }

  }


  // ===================================================
  // DELETE CHILD FOLDER RECORDS
  // ===================================================

  removeChildFolderRecords(
    folderId
  );


  return true;

}


// =====================================================
// REMOVE CHILD FOLDER RECORDS
// =====================================================

function removeChildFolderRecords(
  parentFolderId
) {

  if (!parentFolderId) {

    return false;

  }


  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  let changed =
    true;


  /*
   * Continue searching until no more child records
   * are found.
   *
   * This supports multiple levels:
   *
   * Folder A
   *   └── Folder B
   *       └── Folder C
   *           └── Folder D
   */

  while (changed) {

    changed =
      false;


    const values =
      sheet
        .getDataRange()
        .getValues();


    for (
      let i = values.length - 1;
      i >= 1;
      i--
    ) {

      const row =
        values[i];


      const rowParentId =
        row[
          FOLDER_COLUMNS.PARENT_FOLDER_ID - 1
        ];


      if (
        String(
          rowParentId || ""
        ) ===
        String(
          parentFolderId
        )
      ) {

        const childId =
          row[
            FOLDER_COLUMNS.ID - 1
          ];


        sheet.deleteRow(
          i + 1
        );


        changed =
          true;


        /*
         * Recursively remove the child's descendants.
         */

        removeChildFolderRecords(
          childId
        );

      }

    }

  }


  return true;

}