// =====================================================
// FOLDERREAD.GS
// Folder Read / Lookup Operations
// Registration System API
// =====================================================


// =====================================================
// GET FOLDERS
// Get folders belonging to a project
// =====================================================

function getFolders(data) {

  data = data || {};

  const session =
    requireAuth(
      data.token
    );


  // ===================================================
  // VALIDATE PROJECT ID
  // ===================================================

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }


  // ===================================================
  // FIND PROJECT
  // ===================================================

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
  // GET SHEET
  // ===================================================

  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  const folders = [];


  // ===================================================
  // READ FOLDERS
  // ===================================================

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const projectId =
      row[
        FOLDER_COLUMNS.PROJECT_ID - 1
      ];


    if (
      String(projectId) !==
      String(data.projectId)
    ) {

      continue;

    }


    const parentFolderId =
      row[
        FOLDER_COLUMNS.PARENT_FOLDER_ID - 1
      ];


    // =================================================
    // OPTIONAL PARENT FILTER
    // =================================================

    if (
      data.parentFolderId !== undefined
    ) {

      if (
        String(
          parentFolderId || ""
        ) !==
        String(
          data.parentFolderId || ""
        )
      ) {

        continue;

      }

    }


    folders.push({

      id:
        row[
          FOLDER_COLUMNS.ID - 1
        ],

      projectId:
        projectId,

      parentFolderId:
        parentFolderId || "",

      name:
        row[
          FOLDER_COLUMNS.NAME - 1
        ],

      driveFolderId:
        row[
          FOLDER_COLUMNS.DRIVE_FOLDER_ID - 1
        ],

      createdBy:
        row[
          FOLDER_COLUMNS.CREATED_BY - 1
        ],

      createdAt:
        row[
          FOLDER_COLUMNS.CREATED_AT - 1
        ],

      updatedAt:
        row[
          FOLDER_COLUMNS.UPDATED_AT - 1
        ]

    });

  }


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return successResponse(

    "Folders retrieved successfully",

    {

      folders:
        folders,

      count:
        folders.length

    }

  );

}


// =====================================================
// GET SINGLE FOLDER
// =====================================================

function getFolder(data) {

  data = data || {};

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
      "You do not have access to this folder"
    );

  }


  // ===================================================
  // RETURN FOLDER
  // ===================================================

  return successResponse(

    "Folder retrieved successfully",

    {

      folder:
        folder

    }

  );

}


// =====================================================
// FIND FOLDER BY ID
// Internal Function
// =====================================================

function findFolderById(
  folderId
) {

  if (!folderId) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const id =
      row[
        FOLDER_COLUMNS.ID - 1
      ];


    if (
      String(id) ===
      String(folderId)
    ) {

      return {

        row:
          i + 1,

        id:
          id,

        projectId:
          row[
            FOLDER_COLUMNS.PROJECT_ID - 1
          ],

        parentFolderId:
          row[
            FOLDER_COLUMNS.PARENT_FOLDER_ID - 1
          ] || "",

        name:
          row[
            FOLDER_COLUMNS.NAME - 1
          ],

        driveFolderId:
          row[
            FOLDER_COLUMNS.DRIVE_FOLDER_ID - 1
          ],

        createdBy:
          row[
            FOLDER_COLUMNS.CREATED_BY - 1
          ],

        createdAt:
          row[
            FOLDER_COLUMNS.CREATED_AT - 1
          ],

        updatedAt:
          row[
            FOLDER_COLUMNS.UPDATED_AT - 1
          ]

      };

    }

  }


  return null;

}


// =====================================================
// FIND FOLDER BY NAME
// Internal Function
// =====================================================

function findFolderByName(
  projectId,
  folderName,
  parentFolderId
) {

  if (!projectId || !folderName) {

    return null;

  }


  const sheet =
    getSheet(
      SHEETS.FOLDERS
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  const targetParent =
    String(
      parentFolderId || ""
    );


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const rowProjectId =
      row[
        FOLDER_COLUMNS.PROJECT_ID - 1
      ];


    if (
      String(rowProjectId) !==
      String(projectId)
    ) {

      continue;

    }


    const rowParentId =
      row[
        FOLDER_COLUMNS.PARENT_FOLDER_ID - 1
      ];


    if (
      String(
        rowParentId || ""
      ) !==
      targetParent
    ) {

      continue;

    }


    const rowName =
      row[
        FOLDER_COLUMNS.NAME - 1
      ];


    if (
      String(rowName)
        .trim()
        .toLowerCase() ===
      String(folderName)
        .trim()
        .toLowerCase()
    ) {

      return {

        row:
          i + 1,

        id:
          row[
            FOLDER_COLUMNS.ID - 1
          ],

        projectId:
          rowProjectId,

        parentFolderId:
          rowParentId || "",

        name:
          rowName,

        driveFolderId:
          row[
            FOLDER_COLUMNS.DRIVE_FOLDER_ID - 1
          ],

        createdBy:
          row[
            FOLDER_COLUMNS.CREATED_BY - 1
          ],

        createdAt:
          row[
            FOLDER_COLUMNS.CREATED_AT - 1
          ],

        updatedAt:
          row[
            FOLDER_COLUMNS.UPDATED_AT - 1
          ]

      };

    }

  }


  return null;

}