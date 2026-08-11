// =====================================================
// SCHEMA.GS
// Database Schema Definition
// Cloud Project Platform
// =====================================================


// =====================================================
// SCHEMA VERSION
// =====================================================

const SCHEMA_VERSION =
  "1.0.0";


// =====================================================
// SHEET NAMES
// =====================================================

const SCHEMA_SHEETS = Object.freeze({

  USERS:
    "Users",

  ADMINS:
    "Admins",

  SESSIONS:
    "Sessions",

  PROJECTS:
    "Projects",

  PROJECT_USERS:
    "ProjectUsers",

  FILES:
    "Files",

  FOLDERS:
    "Folders",

  FILE_VERSIONS:
    "FileVersions",

  COMMITS:
    "Commits",

  PROJECT_HISTORY:
    "ProjectHistory",

  STORAGE:
    "Storage",

  STORAGE_ROOMS:
    "StorageRooms",

  STORAGE_NODES:
    "StorageNodes",

  SHEETS:
    "Sheets",

  SHEET_DATA:
    "SheetData",

  NOTIFICATIONS:
    "Notifications",

  EMAIL_QUEUE:
    "EmailQueue",

  EMAIL_LOGS:
    "EmailLogs",

  ROLES:
    "Roles",

  PERMISSIONS:
    "Permissions",

  ROLE_PERMISSIONS:
    "RolePermissions",

  SETTINGS:
    "Settings",

  LOGS:
    "Logs",

  ADMIN_LOGS:
    "AdminLogs",

  SECURITY_LOGS:
    "SecurityLogs",

  LOGIN_LOGS:
    "LoginLogs",

  FILE_LOGS:
    "FileLogs",

  PROJECT_LOGS:
    "ProjectLogs",

  STORAGE_LOGS:
    "StorageLogs",

  BACKUPS:
    "Backups"

});


// =====================================================
// DATABASE SCHEMA
// =====================================================

const DATABASE_SCHEMA = Object.freeze({

  Users: {

    sheet:
      "Users",

    columns: [

      "ID",
      "Username",
      "Email",
      "Phone",
      "Country",
      "CountryCode",
      "Network",
      "PasswordHash",
      "Role",
      "Status",
      "VerifyStatus",
      "DeviceID",
      "IPAddress",
      "CreatedAt",
      "LastLogin",
      "LastLogout",
      "ResetCodeHash",
      "ResetExpiry",
      "ResetUsed",
      "ResetAttempts",
      "SessionToken",
      "TokenExpiry",
      "FailedLoginAttempts",
      "AccountLocked",
      "LockedExpiry",
      "ResetToken"

    ]

  },


  Admins: {

    sheet:
      "Admins",

    columns: [

      "ID",
      "Username",
      "Email",
      "PasswordHash",
      "Role",
      "Status",
      "Permissions",
      "LastLogin",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  Sessions: {

    sheet:
      "Sessions",

    columns: [

      "ID",
      "UserID",
      "TokenHash",
      "Role",
      "IPAddress",
      "DeviceID",
      "UserAgent",
      "CreatedAt",
      "ExpiresAt",
      "LastActivity",
      "Status"

    ]

  },


  Projects: {

    sheet:
      "Projects",

    columns: [

      "ID",
      "Name",
      "Description",
      "OwnerID",
      "Status",
      "Visibility",
      "StorageID",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  ProjectUsers: {

    sheet:
      "ProjectUsers",

    columns: [

      "ID",
      "ProjectID",
      "UserID",
      "Role",
      "Status",
      "CreatedAt"

    ]

  },


  Files: {

    sheet:
      "Files",

    columns: [

      "ID",
      "ProjectID",
      "FolderID",
      "StorageID",
      "StorageRoomID",
      "StorageNodeID",
      "Name",
      "OriginalName",
      "MimeType",
      "Extension",
      "Size",
      "DriveFileID",
      "DriveURL",
      "Path",
      "Version",
      "OwnerID",
      "UploadedBy",
      "Status",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  Folders: {

    sheet:
      "Folders",

    columns: [

      "ID",
      "ProjectID",
      "ParentID",
      "StorageRoomID",
      "Name",
      "Path",
      "OwnerID",
      "CreatedBy",
      "Status",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  FileVersions: {

    sheet:
      "FileVersions",

    columns: [

      "ID",
      "FileID",
      "Version",
      "StorageNodeID",
      "DriveFileID",
      "Size",
      "Hash",
      "CreatedBy",
      "CreatedAt",
      "Status"

    ]

  },


  Commits: {

    sheet:
      "Commits",

    columns: [

      "ID",
      "ProjectID",
      "UserID",
      "Message",
      "ParentCommitID",
      "Branch",
      "CreatedAt"

    ]

  },


  ProjectHistory: {

    sheet:
      "ProjectHistory",

    columns: [

      "ID",
      "ProjectID",
      "UserID",
      "Action",
      "TargetType",
      "TargetID",
      "Details",
      "CreatedAt"

    ]

  },


  Storage: {

    sheet:
      "Storage",

    columns: [

      "ID",
      "Name",
      "Type",
      "OwnerID",
      "ProjectID",
      "Status",
      "QuotaBytes",
      "UsedBytes",
      "AvailableBytes",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  StorageRooms: {

    sheet:
      "StorageRooms",

    columns: [

      "ID",
      "StorageID",
      "ProjectID",
      "Name",
      "Description",
      "Status",
      "RoomType",
      "OwnerID",
      "TotalBytes",
      "UsedBytes",
      "AvailableBytes",
      "NodeCount",
      "MaxFileSize",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  StorageNodes: {

    sheet:
      "StorageNodes",

    columns: [

      "ID",
      "StorageID",
      "RoomID",
      "Name",
      "Type",
      "Status",
      "Provider",
      "AccountEmail",
      "DriveID",
      "RootFolderID",
      "TotalBytes",
      "UsedBytes",
      "AvailableBytes",
      "MaxFileSize",
      "Priority",
      "Weight",
      "LastHealthCheck",
      "LastError",
      "CreatedBy",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  Sheets: {

    sheet:
      "Sheets",

    columns: [

      "ID",
      "ProjectID",
      "Name",
      "Description",
      "OwnerID",
      "Status",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  SheetData: {

    sheet:
      "SheetData",

    columns: [

      "ID",
      "SheetID",
      "RowNumber",
      "ColumnNumber",
      "Value",
      "DataType",
      "UpdatedBy",
      "UpdatedAt"

    ]

  },


  Notifications: {

    sheet:
      "Notifications",

    columns: [

      "ID",
      "UserID",
      "Type",
      "Title",
      "Message",
      "RelatedType",
      "RelatedID",
      "IsRead",
      "CreatedAt"

    ]

  },


  EmailQueue: {

    sheet:
      "EmailQueue",

    columns: [

      "ID",
      "Recipient",
      "RecipientType",
      "Subject",
      "Body",
      "Template",
      "Priority",
      "Status",
      "Attempts",
      "ScheduledAt",
      "SentAt",
      "Error",
      "CreatedAt"

    ]

  },


  EmailLogs: {

    sheet:
      "EmailLogs",

    columns: [

      "ID",
      "Recipient",
      "Subject",
      "Type",
      "Status",
      "MessageID",
      "Error",
      "SentAt"

    ]

  },


  Roles: {

    sheet:
      "Roles",

    columns: [

      "ID",
      "Name",
      "Description",
      "Status",
      "CreatedAt",
      "UpdatedAt"

    ]

  },


  Permissions: {

    sheet:
      "Permissions",

    columns: [

      "ID",
      "Name",
      "Description",
      "Resource",
      "Action",
      "CreatedAt"

    ]

  },


  RolePermissions: {

    sheet:
      "RolePermissions",

    columns: [

      "ID",
      "RoleID",
      "PermissionID",
      "CreatedAt"

    ]

  },


  Settings: {

    sheet:
      "Settings",

    columns: [

      "ID",
      "Key",
      "Value",
      "Description",
      "UpdatedAt"

    ]

  },


  Logs: {

    sheet:
      "Logs",

    columns: [

      "ID",
      "Level",
      "Action",
      "UserID",
      "Message",
      "IPAddress",
      "CreatedAt"

    ]

  },


  AdminLogs: {

    sheet:
      "AdminLogs",

    columns: [

      "ID",
      "AdminID",
      "Action",
      "TargetType",
      "TargetID",
      "Details",
      "IPAddress",
      "CreatedAt"

    ]

  },


  SecurityLogs: {

    sheet:
      "SecurityLogs",

    columns: [

      "ID",
      "UserID",
      "Event",
      "Severity",
      "IPAddress",
      "DeviceID",
      "Details",
      "CreatedAt"

    ]

  },


  LoginLogs: {

    sheet:
      "LoginLogs",

    columns: [

      "ID",
      "UserID",
      "LoginIdentifier",
      "Success",
      "IPAddress",
      "DeviceID",
      "UserAgent",
      "CreatedAt"

    ]

  },


  FileLogs: {

    sheet:
      "FileLogs",

    columns: [

      "ID",
      "FileID",
      "UserID",
      "Action",
      "Details",
      "CreatedAt"

    ]

  },


  ProjectLogs: {

    sheet:
      "ProjectLogs",

    columns: [

      "ID",
      "ProjectID",
      "UserID",
      "Action",
      "Details",
      "CreatedAt"

    ]

  },


  StorageLogs: {

    sheet:
      "StorageLogs",

    columns: [

      "ID",
      "StorageID",
      "RoomID",
      "NodeID",
      "Action",
      "Bytes",
      "Status",
      "Details",
      "CreatedAt"

    ]

  },


  Backups: {

    sheet:
      "Backups",

    columns: [

      "ID",
      "Type",
      "Target",
      "Location",
      "Size",
      "Status",
      "CreatedBy",
      "CreatedAt",
      "CompletedAt",
      "Error"

    ]

  }

});


// =====================================================
// GET TABLE SCHEMA
// =====================================================

function getTableSchema(
  tableName
) {

  if (!tableName) {

    return null;

  }

  return (
    DATABASE_SCHEMA[
      tableName
    ] ||
    null
  );

}


// =====================================================
// GET TABLE COLUMNS
// =====================================================

function getTableColumns(
  tableName
) {

  const schema =
    getTableSchema(
      tableName
    );

  if (!schema) {

    return [];

  }

  return schema.columns || [];

}


// =====================================================
// CHECK TABLE EXISTS
// =====================================================

function schemaTableExists(
  tableName
) {

  return Boolean(
    DATABASE_SCHEMA[
      tableName
    ]
  );

}


// =====================================================
// GET ALL TABLE NAMES
// =====================================================

function getSchemaTableNames() {

  return Object.keys(
    DATABASE_SCHEMA
  );

}


// =====================================================
// GET COMPLETE SCHEMA
// =====================================================

function getDatabaseSchema() {

  return DATABASE_SCHEMA;

}


// =====================================================
// GET HEADER FROM SCHEMA
// =====================================================

function getSchemaHeader(
  tableName
) {

  return getTableColumns(
    tableName
  );

}