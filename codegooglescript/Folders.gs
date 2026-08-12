// =====================================================
// FOLDERS.GS
// Folder Core / Data Layer
// Cloud Project Platform
// =====================================================


// =====================================================
// FOLDER COLUMNS
// =====================================================

const FOLDER_COLUMNS = {

  ID: 1,

  PROJECT_ID: 2,

  PARENT_ID: 3,

  NAME: 4,

  DESCRIPTION: 5,

  OWNER_ID: 6,

  STORAGE_NODE_ID: 7,

  DRIVE_FOLDER_ID: 8,

  PATH: 9,

  STATUS: 10,

  CREATED_AT: 11,

  UPDATED_AT: 12

};


// =====================================================
// FOLDER STATUSES
// =====================================================

const FOLDER_STATUS = {

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  DELETED:
    "Deleted"

};


// =====================================================
// DEFAULT FOLDER STATUS
// =====================================================

const DEFAULT_FOLDER_STATUS =
  FOLDER_STATUS.ACTIVE;


// =====================================================
// GET FOLDER SHEET
// =====================================================

function getFolderSheet() {

  return getSheet(
    SHEETS.FOLDERS
  );

}


// =====================================================
// FIND FOLDER BY ID
// =====================================================

function findFolderById(
  folderId
) {

  if (!folderId) {

    return null;

  }

  const sheet =
    getFolderSheet();

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

    if (
      String(
        row[
          FOLDER_COLUMNS.ID - 1
        ]
      ) ===
      String(
        folderId
      )
    ) {

      return mapFolderRow(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND FOLDER BY NAME
// =====================================================

function findFolderByName(
  projectId,
  parentId,
  name
) {

  if (
    !projectId ||
    !name
  ) {

    return null;

  }

  const sheet =
    getFolderSheet();

  const values =
    sheet
      .getDataRange()
      .getValues();

  const normalizedName =
    String(
      name
    )
      .trim()
      .toLowerCase();

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

    const rowParentId =
      row[
        FOLDER_COLUMNS.PARENT_ID - 1
      ];

    const rowName =
      String(
        row[
          FOLDER_COLUMNS.NAME - 1
        ]
      )
        .trim()
        .toLowerCase();

    if (

      String(
        rowProjectId
      ) ===
      String(
        projectId
      ) &&

      String(
        rowParentId || ""
      ) ===
      String(
        parentId || ""
      ) &&

      rowName ===
      normalizedName &&

      String(
        row[
          FOLDER_COLUMNS.STATUS - 1
        ]
      )
        .toLowerCase() !==
        "deleted"

    ) {

      return mapFolderRow(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// GET PROJECT FOLDERS
// =====================================================

function getFoldersByProject(
  projectId
) {

  if (!projectId) {

    return [];

  }

  const sheet =
    getFolderSheet();

  const values =
    sheet
      .getDataRange()
      .getValues();

  const folders = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          FOLDER_COLUMNS.PROJECT_ID - 1
        ]
      ) !==
      String(
        projectId
      )
    ) {

      continue;

    }

    if (
      String(
        row[
          FOLDER_COLUMNS.STATUS - 1
        ]
      )
        .toLowerCase() ===
        "deleted"
    ) {

      continue;

    }

    folders.push(
      mapFolderRow(
        row,
        i + 1
      )
    );

  }

  return folders;

}


// =====================================================
// GET CHILD FOLDERS
// =====================================================

function getChildFolders(
  projectId,
  parentId
) {

  if (!projectId) {

    return [];

  }

  const folders =
    getFoldersByProject(
      projectId
    );

  return folders.filter(
    function(folder) {

      return String(
        folder.parentId || ""
      ) ===
      String(
        parentId || ""
      );

    }
  );

}


// =====================================================
// GET ROOT FOLDERS
// =====================================================

function getRootFolders(
  projectId
) {

  return getChildFolders(
    projectId,
    ""
  );

}


// =====================================================
// CHECK FOLDER EXISTS
// =====================================================

function folderExists(
  projectId,
  parentId,
  name
) {

  return !!findFolderByName(
    projectId,
    parentId,
    name
  );

}


// =====================================================
// CREATE FOLDER RECORD
// =====================================================

function createFolderRecord(
  data
) {

  data =
    data || {};

  if (!data.projectId) {

    throw new Error(
      "Project ID is required"
    );

  }

  if (!data.name) {

    throw new Error(
      "Folder name is required"
    );

  }

  const existing =
    findFolderByName(
      data.projectId,
      data.parentId || "",
      data.name
    );

  if (existing) {

    throw new Error(
      "A folder with this name already exists"
    );

  }

  const sheet =
    getFolderSheet();

  const id =
    generateID(
      "FLD"
    );

  const now =
    new Date();

  const name =
    sanitizeInput(
      data.name
    );

  const description =
    data.description
      ? sanitizeInput(
          data.description
        )
      : "";

  const parentId =
    data.parentId || "";

  const ownerId =
    data.ownerId || "";

  const storageNodeId =
    data.storageNodeId || "";

  const driveFolderId =
    data.driveFolderId || "";

  const path =
    data.path ||
    buildFolderPath(
      data.projectId,
      parentId,
      name
    );

  const status =
    data.status ||
    DEFAULT_FOLDER_STATUS;

  sheet.appendRow([

    id,

    data.projectId,

    parentId,

    name,

    description,

    ownerId,

    storageNodeId,

    driveFolderId,

    path,

    status,

    now,

    now

  ]);

  return {

    id:
      id,

    projectId:
      data.projectId,

    parentId:
      parentId,

    name:
      name,

    description:
      description,

    ownerId:
      ownerId,

    storageNodeId:
      storageNodeId,

    driveFolderId:
      driveFolderId,

    path:
      path,

    status:
      status,

    createdAt:
      now,

    updatedAt:
      now

  };

}


// =====================================================
// UPDATE FOLDER RECORD
// =====================================================

function updateFolderRecord(
  folderId,
  updates
) {

  updates =
    updates || {};

  const folder =
    findFolderById(
      folderId
    );

  if (!folder) {

    throw new Error(
      "Folder not found"
    );

  }

  const sheet =
    getFolderSheet();

  const row =
    folder.row;

  const now =
    new Date();

  if (
    updates.name !==
    undefined
  ) {

    const newName =
      sanitizeInput(
        updates.name
      );

    const existing =
      findFolderByName(
        folder.projectId,
        folder.parentId,
        newName
      );

    if (
      existing &&
      String(
        existing.id
      ) !==
      String(
        folderId
      )
    ) {

      throw new Error(
        "A folder with this name already exists"
      );

    }

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.NAME
      )
      .setValue(
        newName
      );

  }

  if (
    updates.description !==
    undefined
  ) {

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.DESCRIPTION
      )
      .setValue(
        sanitizeInput(
          updates.description
        )
      );

  }

  if (
    updates.status !==
    undefined
  ) {

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.STATUS
      )
      .setValue(
        sanitizeInput(
          updates.status
        )
      );

  }

  if (
    updates.storageNodeId !==
    undefined
  ) {

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.STORAGE_NODE_ID
      )
      .setValue(
        updates.storageNodeId
      );

  }

  if (
    updates.driveFolderId !==
    undefined
  ) {

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.DRIVE_FOLDER_ID
      )
      .setValue(
        updates.driveFolderId
      );

  }

  if (
    updates.path !==
    undefined
  ) {

    sheet
      .getRange(
        row,
        FOLDER_COLUMNS.PATH
      )
      .setValue(
        updates.path
      );

  }

  sheet
    .getRange(
      row,
      FOLDER_COLUMNS.UPDATED_AT
    )
    .setValue(
      now
    );

  return findFolderById(
    folderId
  );

}


// =====================================================
// UPDATE FOLDER PARENT
// =====================================================

function updateFolderParent(
  folderId,
  parentId
) {

  const folder =
    findFolderById(
      folderId
    );

  if (!folder) {

    throw new Error(
      "Folder not found"
    );

  }

  if (
    String(
      folderId
    ) ===
    String(
      parentId
    )
  ) {

    throw new Error(
      "A folder cannot be its own parent"
    );

  }

  if (
    parentId
  ) {

    const parent =
      findFolderById(
        parentId
      );

    if (!parent) {

      throw new Error(
        "Parent folder not found"
      );

    }

    if (
      String(
        parent.projectId
      ) !==
      String(
        folder.projectId
      )
    ) {

      throw new Error(
        "Parent folder belongs to another project"
      );

    }

    if (
      isFolderInsideFolder(
        parentId,
        folderId
      )
    ) {

      throw new Error(
        "Cannot move a folder inside one of its children"
      );

    }

  }

  const sheet =
    getFolderSheet();

  const now =
    new Date();

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.PARENT_ID
    )
    .setValue(
      parentId || ""
    );

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.UPDATED_AT
    )
    .setValue(
      now
    );

  const updated =
    findFolderById(
      folderId
    );

  updateFolderPathTree(
    folderId
  );

  return findFolderById(
    folderId
  );

}


// =====================================================
// CHECK FOLDER TREE RELATIONSHIP
// =====================================================

function isFolderInsideFolder(
  folderId,
  possibleParentId
) {

  let current =
    findFolderById(
      folderId
    );

  const visited = {};

  while (
    current &&
    current.parentId
  ) {

    const parentId =
      String(
        current.parentId
      );

    if (
      visited[parentId]
    ) {

      return true;

    }

    visited[parentId] =
      true;

    if (
      parentId ===
      String(
        possibleParentId
      )
    ) {

      return true;

    }

    current =
      findFolderById(
        parentId
      );

  }

  return false;

}


// =====================================================
// BUILD FOLDER PATH
// =====================================================

function buildFolderPath(
  projectId,
  parentId,
  folderName
) {

  const name =
    String(
      folderName || ""
    )
      .trim();

  if (!parentId) {

    return "/" + name;

  }

  const parent =
    findFolderById(
      parentId
    );

  if (!parent) {

    return "/" + name;

  }

  return (
    String(
      parent.path || "/"
    )
      .replace(
        /\/$/,
        ""
      ) +
    "/" +
    name
  );

}


// =====================================================
// UPDATE FOLDER PATH TREE
// =====================================================

function updateFolderPathTree(
  folderId
) {

  const folder =
    findFolderById(
      folderId
    );

  if (!folder) {

    return false;

  }

  const newPath =
    buildFolderPath(
      folder.projectId,
      folder.parentId,
      folder.name
    );

  const sheet =
    getFolderSheet();

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.PATH
    )
    .setValue(
      newPath
    );

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  const children =
    getChildFolders(
      folder.projectId,
      folder.id
    );

  children.forEach(
    function(child) {

      updateFolderPathTree(
        child.id
      );

    }
  );

  return true;

}


// =====================================================
// DELETE FOLDER RECORD
// =====================================================

function deleteFolderRecord(
  folderId
) {

  const folder =
    findFolderById(
      folderId
    );

  if (!folder) {

    return false;

  }

  const sheet =
    getFolderSheet();

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.STATUS
    )
    .setValue(
      FOLDER_STATUS.DELETED
    );

  sheet
    .getRange(
      folder.row,
      FOLDER_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// MAP FOLDER ROW
// =====================================================

function mapFolderRow(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber,

    id:
      row[
        FOLDER_COLUMNS.ID - 1
      ],

    projectId:
      row[
        FOLDER_COLUMNS.PROJECT_ID - 1
      ],

    parentId:
      row[
        FOLDER_COLUMNS.PARENT_ID - 1
      ],

    name:
      row[
        FOLDER_COLUMNS.NAME - 1
      ],

    description:
      row[
        FOLDER_COLUMNS.DESCRIPTION - 1
      ],

    ownerId:
      row[
        FOLDER_COLUMNS.OWNER_ID - 1
      ],

    storageNodeId:
      row[
        FOLDER_COLUMNS.STORAGE_NODE_ID - 1
      ],

    driveFolderId:
      row[
        FOLDER_COLUMNS.DRIVE_FOLDER_ID - 1
      ],

    path:
      row[
        FOLDER_COLUMNS.PATH - 1
      ],

    status:
      row[
        FOLDER_COLUMNS.STATUS - 1
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