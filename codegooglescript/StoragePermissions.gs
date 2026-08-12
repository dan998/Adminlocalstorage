// =====================================================
// STORAGEPERMISSIONS.GS
// Storage Access Control & Permissions
// Cloud Project Platform
// =====================================================


// =====================================================
// PERMISSION ACTIONS
// =====================================================

const STORAGE_PERMISSION_ACTIONS = {

  CREATE:
    "storage.create",

  READ:
    "storage.read",

  UPLOAD:
    "storage.upload",

  DOWNLOAD:
    "storage.download",

  UPDATE:
    "storage.update",

  DELETE:
    "storage.delete",

  SHARE:
    "storage.share",

  MANAGE:
    "storage.manage",

  ALLOCATE:
    "storage.allocate",

  VIEW_USAGE:
    "storage.view_usage",

  MANAGE_QUOTA:
    "storage.manage_quota",

  MANAGE_NODES:
    "storage.manage_nodes",

  MANAGE_ROOMS:
    "storage.manage_rooms"

};


// =====================================================
// STORAGE ROLES
// =====================================================

const STORAGE_ROLES = {

  OWNER:
    "Owner",

  ADMIN:
    "Admin",

  MANAGER:
    "Manager",

  EDITOR:
    "Editor",

  CONTRIBUTOR:
    "Contributor",

  VIEWER:
    "Viewer",

  GUEST:
    "Guest"

};


// =====================================================
// ROLE PERMISSIONS
// =====================================================

const STORAGE_ROLE_PERMISSIONS = {

  Owner: [

    STORAGE_PERMISSION_ACTIONS.CREATE,
    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.UPLOAD,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD,
    STORAGE_PERMISSION_ACTIONS.UPDATE,
    STORAGE_PERMISSION_ACTIONS.DELETE,
    STORAGE_PERMISSION_ACTIONS.SHARE,
    STORAGE_PERMISSION_ACTIONS.MANAGE,
    STORAGE_PERMISSION_ACTIONS.ALLOCATE,
    STORAGE_PERMISSION_ACTIONS.VIEW_USAGE,
    STORAGE_PERMISSION_ACTIONS.MANAGE_QUOTA,
    STORAGE_PERMISSION_ACTIONS.MANAGE_NODES,
    STORAGE_PERMISSION_ACTIONS.MANAGE_ROOMS

  ],

  Admin: [

    STORAGE_PERMISSION_ACTIONS.CREATE,
    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.UPLOAD,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD,
    STORAGE_PERMISSION_ACTIONS.UPDATE,
    STORAGE_PERMISSION_ACTIONS.DELETE,
    STORAGE_PERMISSION_ACTIONS.SHARE,
    STORAGE_PERMISSION_ACTIONS.MANAGE,
    STORAGE_PERMISSION_ACTIONS.ALLOCATE,
    STORAGE_PERMISSION_ACTIONS.VIEW_USAGE,
    STORAGE_PERMISSION_ACTIONS.MANAGE_QUOTA,
    STORAGE_PERMISSION_ACTIONS.MANAGE_NODES,
    STORAGE_PERMISSION_ACTIONS.MANAGE_ROOMS

  ],

  Manager: [

    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.UPLOAD,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD,
    STORAGE_PERMISSION_ACTIONS.UPDATE,
    STORAGE_PERMISSION_ACTIONS.DELETE,
    STORAGE_PERMISSION_ACTIONS.SHARE,
    STORAGE_PERMISSION_ACTIONS.ALLOCATE,
    STORAGE_PERMISSION_ACTIONS.VIEW_USAGE,
    STORAGE_PERMISSION_ACTIONS.MANAGE_NODES,
    STORAGE_PERMISSION_ACTIONS.MANAGE_ROOMS

  ],

  Editor: [

    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.UPLOAD,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD,
    STORAGE_PERMISSION_ACTIONS.UPDATE,
    STORAGE_PERMISSION_ACTIONS.SHARE,
    STORAGE_PERMISSION_ACTIONS.VIEW_USAGE

  ],

  Contributor: [

    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.UPLOAD,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD

  ],

  Viewer: [

    STORAGE_PERMISSION_ACTIONS.READ,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD

  ],

  Guest: [

    STORAGE_PERMISSION_ACTIONS.READ

  ]

};


// =====================================================
// PERMISSION STATUS
// =====================================================

const STORAGE_PERMISSION_STATUS = {

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  REVOKED:
    "Revoked",

  EXPIRED:
    "Expired",

  PENDING:
    "Pending"

};


// =====================================================
// PERMISSION COLUMNS
// =====================================================

const STORAGE_PERMISSION_COLUMNS = {

  ID: 1,

  STORAGE_ID: 2,

  USER_ID: 3,

  PROJECT_ID: 4,

  ROLE: 5,

  PERMISSIONS: 6,

  STATUS: 7,

  CREATED_BY: 8,

  CREATED_AT: 9,

  UPDATED_AT: 10,

  EXPIRES_AT: 11

};


// =====================================================
// PERMISSION SHEET
// =====================================================

const STORAGE_PERMISSION_SHEET =
  "STORAGE_PERMISSIONS";


// =====================================================
// GENERATE PERMISSION ID
// =====================================================

function generateStoragePermissionId() {

  return (
    "SPERM-" +
    Utilities.getUuid()
      .substring(0, 12)
      .toUpperCase()
  );

}


// =====================================================
// GET PERMISSION SHEET
// =====================================================

function getStoragePermissionsSheet() {

  return getSheet(
    SHEETS.STORAGE_PERMISSIONS ||
    STORAGE_PERMISSION_SHEET
  );

}


// =====================================================
// GET ROLE PERMISSIONS
// =====================================================

function getStorageRolePermissions(
  role
) {

  role =
    String(
      role || ""
    ).trim();


  return (
    STORAGE_ROLE_PERMISSIONS[
      role
    ] || []
  ).slice();

}


// =====================================================
// CHECK ROLE
// =====================================================

function isValidStorageRole(
  role
) {

  return Object.values(
    STORAGE_ROLES
  ).indexOf(
    role
  ) !== -1;

}


// =====================================================
// CHECK ACTION
// =====================================================

function isValidStoragePermissionAction(
  action
) {

  return Object.values(
    STORAGE_PERMISSION_ACTIONS
  ).indexOf(
    action
  ) !== -1;

}


// =====================================================
// BUILD PERMISSION
// =====================================================

function buildStoragePermission(
  data
) {

  data =
    data || {};


  const role =
    data.role ||
    STORAGE_ROLES.VIEWER;


  if (
    !isValidStorageRole(
      role
    )
  ) {

    throw new Error(
      "Invalid storage role"
    );

  }


  const permissions =
    data.permissions ||
    getStorageRolePermissions(
      role
    );


  return {

    id:
      data.id ||
      generateStoragePermissionId(),

    storageId:
      data.storageId ||
      "",

    userId:
      data.userId ||
      "",

    projectId:
      data.projectId ||
      "",

    role:
      role,

    permissions:
      permissions,

    status:
      data.status ||
      STORAGE_PERMISSION_STATUS.ACTIVE,

    createdBy:
      data.createdBy ||
      "",

    createdAt:
      data.createdAt ||
      new Date(),

    updatedAt:
      data.updatedAt ||
      new Date(),

    expiresAt:
      data.expiresAt ||
      ""

  };

}


// =====================================================
// CREATE PERMISSION
// =====================================================

function createStoragePermission(
  data
) {

  const permission =
    buildStoragePermission(
      data
    );


  if (
    !permission.userId
  ) {

    throw new Error(
      "User ID is required"
    );

  }


  if (
    !permission.storageId
  ) {

    throw new Error(
      "Storage ID is required"
    );

  }


  const sheet =
    getStoragePermissionsSheet();


  sheet.appendRow([

    permission.id,

    permission.storageId,

    permission.userId,

    permission.projectId,

    permission.role,

    JSON.stringify(
      permission.permissions
    ),

    permission.status,

    permission.createdBy,

    permission.createdAt,

    permission.updatedAt,

    permission.expiresAt

  ]);


  return permission;

}


// =====================================================
// FIND PERMISSION
// =====================================================

function findStoragePermission(
  storageId,
  userId
) {

  if (
    !storageId ||
    !userId
  ) {

    return null;

  }


  const sheet =
    getStoragePermissionsSheet();


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


    const rowStorageId =
      String(
        row[
          STORAGE_PERMISSION_COLUMNS
            .STORAGE_ID - 1
        ] || ""
      );


    const rowUserId =
      String(
        row[
          STORAGE_PERMISSION_COLUMNS
            .USER_ID - 1
        ] || ""
      );


    if (
      rowStorageId ===
      String(storageId) &&
      rowUserId ===
      String(userId)
    ) {

      return storagePermissionRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// FIND PERMISSION BY ID
// =====================================================

function findStoragePermissionById(
  permissionId
) {

  if (
    !permissionId
  ) {

    return null;

  }


  const sheet =
    getStoragePermissionsSheet();


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
          STORAGE_PERMISSION_COLUMNS.ID - 1
        ] || ""
      ) ===
      String(permissionId)
    ) {

      return storagePermissionRowToObject(
        row,
        i + 1
      );

    }

  }


  return null;

}


// =====================================================
// CONVERT ROW TO OBJECT
// =====================================================

function storagePermissionRowToObject(
  row,
  rowNumber
) {

  let permissions =
    row[
      STORAGE_PERMISSION_COLUMNS
        .PERMISSIONS - 1
    ];


  try {

    permissions =
      permissions
        ? JSON.parse(
            permissions
          )
        : [];

  }
  catch (error) {

    permissions = [];

  }


  return {

    row:
      rowNumber,

    id:
      row[
        STORAGE_PERMISSION_COLUMNS.ID - 1
      ],

    storageId:
      row[
        STORAGE_PERMISSION_COLUMNS
          .STORAGE_ID - 1
      ],

    userId:
      row[
        STORAGE_PERMISSION_COLUMNS
          .USER_ID - 1
      ],

    projectId:
      row[
        STORAGE_PERMISSION_COLUMNS
          .PROJECT_ID - 1
      ],

    role:
      row[
        STORAGE_PERMISSION_COLUMNS
          .ROLE - 1
      ],

    permissions:
      permissions,

    status:
      row[
        STORAGE_PERMISSION_COLUMNS
          .STATUS - 1
      ],

    createdBy:
      row[
        STORAGE_PERMISSION_COLUMNS
          .CREATED_BY - 1
      ],

    createdAt:
      row[
        STORAGE_PERMISSION_COLUMNS
          .CREATED_AT - 1
      ],

    updatedAt:
      row[
        STORAGE_PERMISSION_COLUMNS
          .UPDATED_AT - 1
      ],

    expiresAt:
      row[
        STORAGE_PERMISSION_COLUMNS
          .EXPIRES_AT - 1
      ]

  };

}


// =====================================================
// CHECK PERMISSION EXPIRATION
// =====================================================

function isStoragePermissionExpired(
  permission
) {

  if (
    !permission ||
    !permission.expiresAt
  ) {

    return false;

  }


  const expiresAt =
    new Date(
      permission.expiresAt
    );


  if (
    isNaN(
      expiresAt.getTime()
    )
  ) {

    return true;

  }


  return (
    new Date().getTime() >=
    expiresAt.getTime()
  );

}


// =====================================================
// CHECK USER STORAGE PERMISSION
// =====================================================

function hasStoragePermission(
  userId,
  storageId,
  action
) {

  if (
    !userId ||
    !storageId ||
    !action
  ) {

    return false;

  }


  if (
    !isValidStoragePermissionAction(
      action
    )
  ) {

    return false;

  }


  const permission =
    findStoragePermission(
      storageId,
      userId
    );


  if (!permission) {

    /*
     * Fall back to application-level
     * admin/owner checks when available.
     */

    if (
      typeof getUserById ===
      "function"
    ) {

      const user =
        getUserById(
          userId
        );


      if (
        user &&
        (
          user.role ===
          "Admin" ||
          user.role ===
          "admin"
        )
      ) {

        return true;

      }

    }


    return false;

  }


  if (
    permission.status !==
    STORAGE_PERMISSION_STATUS.ACTIVE
  ) {

    return false;

  }


  if (
    isStoragePermissionExpired(
      permission
    )
  ) {

    return false;

  }


  return (
    permission.permissions
      .indexOf(
        action
      ) !== -1
  );

}


// =====================================================
// REQUIRE STORAGE PERMISSION
// =====================================================

function requireStoragePermission(
  userId,
  storageId,
  action
) {

  const allowed =
    hasStoragePermission(
      userId,
      storageId,
      action
    );


  if (!allowed) {

    throw new Error(
      "Storage permission denied"
    );

  }


  return true;

}


// =====================================================
// GET USER STORAGE ROLE
// =====================================================

function getUserStorageRole(
  userId,
  storageId
) {

  const permission =
    findStoragePermission(
      storageId,
      userId
    );


  if (!permission) {

    return null;

  }


  if (
    permission.status !==
    STORAGE_PERMISSION_STATUS.ACTIVE
  ) {

    return null;

  }


  if (
    isStoragePermissionExpired(
      permission
    )
  ) {

    return null;

  }


  return permission.role;

}


// =====================================================
// GET USER STORAGE PERMISSIONS
// =====================================================

function getUserStoragePermissions(
  userId,
  storageId
) {

  const permission =
    findStoragePermission(
      storageId,
      userId
    );


  if (!permission) {

    return [];

  }


  if (
    permission.status !==
    STORAGE_PERMISSION_STATUS.ACTIVE
  ) {

    return [];

  }


  if (
    isStoragePermissionExpired(
      permission
    )
  ) {

    return [];

  }


  return permission.permissions
    .slice();

}


// =====================================================
// GRANT STORAGE ROLE
// =====================================================

function grantStorageRole(
  storageId,
  userId,
  role,
  createdBy,
  projectId
) {

  if (
    !isValidStorageRole(
      role
    )
  ) {

    throw new Error(
      "Invalid storage role"
    );

  }


  const existing =
    findStoragePermission(
      storageId,
      userId
    );


  if (
    existing
  ) {

    return updateStoragePermissionRole(
      existing.id,
      role,
      createdBy
    );

  }


  return createStoragePermission({

    storageId:
      storageId,

    userId:
      userId,

    projectId:
      projectId || "",

    role:
      role,

    createdBy:
      createdBy || ""

  });

}


// =====================================================
// UPDATE PERMISSION ROLE
// =====================================================

function updateStoragePermissionRole(
  permissionId,
  role,
  updatedBy
) {

  if (
    !isValidStorageRole(
      role
    )
  ) {

    throw new Error(
      "Invalid storage role"
    );

  }


  const permission =
    findStoragePermissionById(
      permissionId
    );


  if (!permission) {

    throw new Error(
      "Storage permission not found"
    );

  }


  const sheet =
    getStoragePermissionsSheet();


  const row =
    permission.row;


  sheet.getRange(
    row,
    STORAGE_PERMISSION_COLUMNS.ROLE
  ).setValue(
    role
  );


  sheet.getRange(
    row,
    STORAGE_PERMISSION_COLUMNS
      .PERMISSIONS
  ).setValue(
    JSON.stringify(
      getStorageRolePermissions(
        role
      )
    )
  );


  sheet.getRange(
    row,
    STORAGE_PERMISSION_COLUMNS
      .UPDATED_AT
  ).setValue(
    new Date()
  );


  return findStoragePermissionById(
    permissionId
  );

}


// =====================================================
// REVOKE STORAGE PERMISSION
// =====================================================

function revokeStoragePermission(
  permissionId,
  revokedBy
) {

  const permission =
    findStoragePermissionById(
      permissionId
    );


  if (!permission) {

    throw new Error(
      "Storage permission not found"
    );

  }


  const sheet =
    getStoragePermissionsSheet();


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS.STATUS
  ).setValue(
    STORAGE_PERMISSION_STATUS.REVOKED
  );


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS.UPDATED_AT
  ).setValue(
    new Date()
  );


  return {

    success:
      true,

    permissionId:
      permissionId,

    status:
      STORAGE_PERMISSION_STATUS.REVOKED

  };

}


// =====================================================
// RESTORE STORAGE PERMISSION
// =====================================================

function restoreStoragePermission(
  permissionId
) {

  const permission =
    findStoragePermissionById(
      permissionId
    );


  if (!permission) {

    throw new Error(
      "Storage permission not found"
    );

  }


  const sheet =
    getStoragePermissionsSheet();


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS.STATUS
  ).setValue(
    STORAGE_PERMISSION_STATUS.ACTIVE
  );


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS.UPDATED_AT
  ).setValue(
    new Date()
  );


  return findStoragePermissionById(
    permissionId
  );

}


// =====================================================
// SET PERMISSION EXPIRATION
// =====================================================

function setStoragePermissionExpiration(
  permissionId,
  expiresAt
) {

  const permission =
    findStoragePermissionById(
      permissionId
    );


  if (!permission) {

    throw new Error(
      "Storage permission not found"
    );

  }


  if (
    expiresAt &&
    isNaN(
      new Date(
        expiresAt
      ).getTime()
    )
  ) {

    throw new Error(
      "Invalid expiration date"
    );

  }


  const sheet =
    getStoragePermissionsSheet();


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS
      .EXPIRES_AT
  ).setValue(
    expiresAt || ""
  );


  sheet.getRange(
    permission.row,
    STORAGE_PERMISSION_COLUMNS
      .UPDATED_AT
  ).setValue(
    new Date()
  );


  return findStoragePermissionById(
    permissionId
  );

}


// =====================================================
// CAN UPLOAD
// =====================================================

function canUploadToStorage(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS.UPLOAD
  );

}


// =====================================================
// CAN DOWNLOAD
// =====================================================

function canDownloadFromStorage(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS.DOWNLOAD
  );

}


// =====================================================
// CAN DELETE
// =====================================================

function canDeleteFromStorage(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS.DELETE
  );

}


// =====================================================
// CAN MANAGE STORAGE
// =====================================================

function canManageStorage(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS.MANAGE
  );

}


// =====================================================
// CAN MANAGE QUOTA
// =====================================================

function canManageStorageQuota(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS
      .MANAGE_QUOTA
  );

}


// =====================================================
// CAN MANAGE NODES
// =====================================================

function canManageStorageNodes(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS
      .MANAGE_NODES
  );

}


// =====================================================
// CAN MANAGE ROOMS
// =====================================================

function canManageStorageRooms(
  userId,
  storageId
) {

  return hasStoragePermission(
    userId,
    storageId,
    STORAGE_PERMISSION_ACTIONS
      .MANAGE_ROOMS
  );

}


// =====================================================
// GET STORAGE PERMISSION CONFIG
// =====================================================

function getStoragePermissionConfig() {

  return {

    actions:
      STORAGE_PERMISSION_ACTIONS,

    roles:
      STORAGE_ROLES,

    rolePermissions:
      STORAGE_ROLE_PERMISSIONS,

    statuses:
      STORAGE_PERMISSION_STATUS,

    sheet:
      STORAGE_PERMISSION_SHEET

  };

}