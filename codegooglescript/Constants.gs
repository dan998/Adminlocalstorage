// =====================================================
// CONSTANTS.GS
// Global System Constants
// Cloud Project Platform
// =====================================================


// =====================================================
// APPLICATION
// =====================================================

const APP = Object.freeze({

  NAME:
    "Cloud Project Platform",

  VERSION:
    "1.0.0",

  API_VERSION:
    "v1",

  ENVIRONMENT:
    "production"

});


// =====================================================
// SYSTEM STATUS
// =====================================================

const SYSTEM_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  MAINTENANCE:
    "Maintenance",

  SUSPENDED:
    "Suspended",

  DELETED:
    "Deleted"

});


// =====================================================
// USER STATUS
// =====================================================

const USER_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  PENDING:
    "Pending",

  SUSPENDED:
    "Suspended",

  BLOCKED:
    "Blocked",

  DELETED:
    "Deleted"

});


// =====================================================
// ADMIN STATUS
// =====================================================

const ADMIN_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  SUSPENDED:
    "Suspended",

  BLOCKED:
    "Blocked"

});


// =====================================================
// PROJECT STATUS
// =====================================================

const PROJECT_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  PRIVATE:
    "Private",

  PUBLIC:
    "Public",

  ARCHIVED:
    "Archived",

  SUSPENDED:
    "Suspended",

  DELETED:
    "Deleted"

});


// =====================================================
// PROJECT USER STATUS
// =====================================================

const PROJECT_USER_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  PENDING:
    "Pending",

  SUSPENDED:
    "Suspended",

  REMOVED:
    "Removed"

});


// =====================================================
// PROJECT USER ROLES
// =====================================================

const PROJECT_USER_ROLE = Object.freeze({

  OWNER:
    "Owner",

  ADMIN:
    "Admin",

  MAINTAINER:
    "Maintainer",

  DEVELOPER:
    "Developer",

  EDITOR:
    "Editor",

  MEMBER:
    "Member",

  VIEWER:
    "Viewer"

});


// =====================================================
// GENERAL ROLES
// =====================================================

const ROLES = Object.freeze({

  SUPER_ADMIN:
    "SuperAdmin",

  ADMIN:
    "Admin",

  MANAGER:
    "Manager",

  DEVELOPER:
    "Developer",

  USER:
    "User",

  GUEST:
    "Guest"

});


// =====================================================
// FILE STATUS
// =====================================================

const FILE_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  ARCHIVED:
    "Archived",

  DELETED:
    "Deleted",

  TRASHED:
    "Trashed",

  LOCKED:
    "Locked"

});


// =====================================================
// FILE TYPES
// =====================================================

const FILE_TYPES = Object.freeze({

  FILE:
    "file",

  IMAGE:
    "image",

  VIDEO:
    "video",

  AUDIO:
    "audio",

  DOCUMENT:
    "document",

  PDF:
    "pdf",

  SPREADSHEET:
    "spreadsheet",

  CODE:
    "code",

  ARCHIVE:
    "archive",

  OTHER:
    "other"

});


// =====================================================
// FOLDER STATUS
// =====================================================

const FOLDER_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  ARCHIVED:
    "Archived",

  DELETED:
    "Deleted",

  TRASHED:
    "Trashed"

});


// =====================================================
// FILE VERSION STATUS
// =====================================================

const VERSION_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  ARCHIVED:
    "Archived",

  RESTORED:
    "Restored",

  DELETED:
    "Deleted"

});


// =====================================================
// STORAGE STATUS
// =====================================================

const STORAGE_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  FULL:
    "Full",

  DISABLED:
    "Disabled",

  ERROR:
    "Error",

  MAINTENANCE:
    "Maintenance"

});


// =====================================================
// STORAGE TYPES
// =====================================================

const STORAGE_TYPES = Object.freeze({

  GOOGLE_DRIVE:
    "GoogleDrive",

  GOOGLE_SHARED_DRIVE:
    "GoogleSharedDrive",

  LOCAL:
    "Local",

  EXTERNAL:
    "External"

});


// =====================================================
// STORAGE ROOM STATUS
// =====================================================

const STORAGE_ROOM_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  INACTIVE:
    "Inactive",

  FULL:
    "Full",

  ERROR:
    "Error",

  DISABLED:
    "Disabled"

});


// =====================================================
// STORAGE ALLOCATION
// =====================================================

const STORAGE_ALLOCATION = Object.freeze({

  ROUND_ROBIN:
    "round_robin",

  LEAST_USED:
    "least_used",

  MOST_AVAILABLE:
    "most_available",

  PROJECT_BASED:
    "project_based",

  USER_BASED:
    "user_based",

  MANUAL:
    "manual"

});


// =====================================================
// STORAGE DEFAULTS
// =====================================================

const STORAGE_DEFAULTS = Object.freeze({

  ROOM_STATUS:
    STORAGE_ROOM_STATUS.ACTIVE,

  ALLOCATION_METHOD:
    STORAGE_ALLOCATION.LEAST_USED,

  MAX_FILE_SIZE:
    50 * 1024 * 1024,

  CHUNK_SIZE:
    5 * 1024 * 1024

});


// =====================================================
// EMAIL STATUS
// =====================================================

const EMAIL_STATUS = Object.freeze({

  QUEUED:
    "Queued",

  PROCESSING:
    "Processing",

  SENT:
    "Sent",

  FAILED:
    "Failed",

  CANCELLED:
    "Cancelled"

});


// =====================================================
// NOTIFICATION STATUS
// =====================================================

const NOTIFICATION_STATUS = Object.freeze({

  UNREAD:
    "Unread",

  READ:
    "Read",

  ARCHIVED:
    "Archived",

  DELETED:
    "Deleted"

});


// =====================================================
// SESSION STATUS
// =====================================================

const SESSION_STATUS = Object.freeze({

  ACTIVE:
    "Active",

  EXPIRED:
    "Expired",

  LOGGED_OUT:
    "LoggedOut",

  REVOKED:
    "Revoked",

  BLOCKED:
    "Blocked"

});


// =====================================================
// BACKUP STATUS
// =====================================================

const BACKUP_STATUS = Object.freeze({

  QUEUED:
    "Queued",

  RUNNING:
    "Running",

  COMPLETED:
    "Completed",

  FAILED:
    "Failed",

  RESTORED:
    "Restored",

  DELETED:
    "Deleted"

});


// =====================================================
// LOG LEVELS
// =====================================================

const LOG_LEVEL = Object.freeze({

  DEBUG:
    "DEBUG",

  INFO:
    "INFO",

  WARNING:
    "WARNING",

  ERROR:
    "ERROR",

  CRITICAL:
    "CRITICAL"

});


// =====================================================
// LOG TYPES
// =====================================================

const LOG_TYPES = Object.freeze({

  SYSTEM:
    "System",

  AUTH:
    "Authentication",

  USER:
    "User",

  ADMIN:
    "Admin",

  PROJECT:
    "Project",

  FILE:
    "File",

  FOLDER:
    "Folder",

  STORAGE:
    "Storage",

  SHEET:
    "Sheet",

  EMAIL:
    "Email",

  SECURITY:
    "Security",

  BACKUP:
    "Backup",

  SESSION:
    "Session"

});


// =====================================================
// AUTHENTICATION METHODS
// =====================================================

const AUTH_METHODS = Object.freeze({

  EMAIL:
    "email",

  USERNAME:
    "username",

  PHONE:
    "phone",

  TOKEN:
    "token"

});


// =====================================================
// TOKEN TYPES
// =====================================================

const TOKEN_TYPES = Object.freeze({

  SESSION:
    "session",

  RESET:
    "reset",

  VERIFICATION:
    "verification",

  API:
    "api",

  REFRESH:
    "refresh"

});


// =====================================================
// SECURITY EVENTS
// =====================================================

const SECURITY_EVENTS = Object.freeze({

  LOGIN_SUCCESS:
    "login_success",

  LOGIN_FAILED:
    "login_failed",

  LOGOUT:
    "logout",

  PASSWORD_CHANGED:
    "password_changed",

  PASSWORD_RESET:
    "password_reset",

  ACCOUNT_LOCKED:
    "account_locked",

  ACCOUNT_UNLOCKED:
    "account_unlocked",

  EMAIL_VERIFIED:
    "email_verified",

  SUSPICIOUS_ACTIVITY:
    "suspicious_activity",

  PERMISSION_DENIED:
    "permission_denied",

  TOKEN_INVALID:
    "token_invalid",

  TOKEN_EXPIRED:
    "token_expired"

});


// =====================================================
// API RESPONSE STATUS
// =====================================================

const API_STATUS = Object.freeze({

  SUCCESS:
    "success",

  ERROR:
    "error",

  UNAUTHORIZED:
    "unauthorized",

  FORBIDDEN:
    "forbidden",

  NOT_FOUND:
    "not_found",

  VALIDATION_ERROR:
    "validation_error",

  RATE_LIMITED:
    "rate_limited",

  SERVER_ERROR:
    "server_error"

});


// =====================================================
// HTTP STATUS CODES
// =====================================================

const HTTP_STATUS = Object.freeze({

  OK:
    200,

  CREATED:
    201,

  BAD_REQUEST:
    400,

  UNAUTHORIZED:
    401,

  FORBIDDEN:
    403,

  NOT_FOUND:
    404,

  CONFLICT:
    409,

  TOO_MANY_REQUESTS:
    429,

  SERVER_ERROR:
    500,

  SERVICE_UNAVAILABLE:
    503

});


// =====================================================
// API ACTIONS
// =====================================================

const API_ACTIONS = Object.freeze({

  CREATE:
    "create",

  READ:
    "read",

  UPDATE:
    "update",

  DELETE:
    "delete",

  SEARCH:
    "search",

  UPLOAD:
    "upload",

  DOWNLOAD:
    "download",

  EXPORT:
    "export",

  IMPORT:
    "import"

});


// =====================================================
// DATABASE
// =====================================================

const DATABASE = Object.freeze({

  HEADER_ROW:
    1,

  FIRST_DATA_ROW:
    2,

  DEFAULT_DATE_FORMAT:
    "yyyy-MM-dd HH:mm:ss"

});


// =====================================================
// ID PREFIXES
// =====================================================

const ID_PREFIXES = Object.freeze({

  USER:
    "USR",

  ADMIN:
    "ADM",

  PROJECT:
    "PRJ",

  PROJECT_USER:
    "PRU",

  FILE:
    "FIL",

  FOLDER:
    "FLD",

  VERSION:
    "VER",

  STORAGE:
    "STR",

  STORAGE_ROOM:
    "ROOM",

  STORAGE_NODE:
    "NODE",

  SESSION:
    "SES",

  NOTIFICATION:
    "NOT",

  EMAIL:
    "EML",

  ROLE:
    "ROL",

  PERMISSION:
    "PER",

  BACKUP:
    "BKP",

  LOG:
    "LOG",

  COMMIT:
    "CMT"

});


// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULTS = Object.freeze({

  USER_ROLE:
    ROLES.USER,

  USER_STATUS:
    USER_STATUS.ACTIVE,

  ADMIN_STATUS:
    ADMIN_STATUS.ACTIVE,

  PROJECT_STATUS:
    PROJECT_STATUS.ACTIVE,

  PROJECT_USER_ROLE:
    PROJECT_USER_ROLE.MEMBER,

  PROJECT_USER_STATUS:
    PROJECT_USER_STATUS.ACTIVE,

  FILE_STATUS:
    FILE_STATUS.ACTIVE,

  FOLDER_STATUS:
    FOLDER_STATUS.ACTIVE,

  SESSION_STATUS:
    SESSION_STATUS.ACTIVE

});


// =====================================================
// LIMITS
// =====================================================

const LIMITS = Object.freeze({

  MIN_PASSWORD_LENGTH:
    8,

  MAX_PASSWORD_LENGTH:
    128,

  MIN_USERNAME_LENGTH:
    3,

  MAX_USERNAME_LENGTH:
    50,

  MAX_EMAIL_LENGTH:
    254,

  MAX_PROJECT_NAME_LENGTH:
    100,

  MAX_FOLDER_NAME_LENGTH:
    255,

  MAX_FILE_NAME_LENGTH:
    255,

  MAX_BROADCAST_RECIPIENTS:
    500,

  MAX_LOGIN_ATTEMPTS:
    5,

  MAX_RESET_ATTEMPTS:
    5

});


// =====================================================
// SESSION EXPIRATION
// =====================================================

const SESSION_EXPIRATION = Object.freeze({

  DEFAULT_DAYS:
    30,

  REMEMBER_ME_DAYS:
    90,

  MAX_DAYS:
    365

});


// =====================================================
// PASSWORD RESET
// =====================================================

const PASSWORD_RESET = Object.freeze({

  CODE_LENGTH:
    6,

  EXPIRATION_MINUTES:
    10,

  MAX_ATTEMPTS:
    5

});


// =====================================================
// EMAIL VERIFICATION
// =====================================================

const EMAIL_VERIFICATION = Object.freeze({

  CODE_LENGTH:
    6,

  EXPIRATION_MINUTES:
    15,

  MAX_ATTEMPTS:
    5

});


// =====================================================
// RATE LIMITING
// =====================================================

const RATE_LIMITS = Object.freeze({

  LOGIN:
    10,

  REGISTER:
    5,

  PASSWORD_RESET:
    5,

  EMAIL:
    20,

  FILE_UPLOAD:
    50,

  API:
    100

});


// =====================================================
// MIME TYPES
// =====================================================

const MIME_TYPES = Object.freeze({

  JSON:
    "application/json",

  TEXT:
    "text/plain",

  HTML:
    "text/html",

  PDF:
    "application/pdf",

  CSV:
    "text/csv",

  XLSX:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  ZIP:
    "application/zip"

});


// =====================================================
// BOOLEAN VALUES
// =====================================================

const BOOLEAN = Object.freeze({

  TRUE:
    true,

  FALSE:
    false

});


// =====================================================
// ENVIRONMENTS
// =====================================================

const ENVIRONMENTS = Object.freeze({

  DEVELOPMENT:
    "development",

  TEST:
    "test",

  STAGING:
    "staging",

  PRODUCTION:
    "production"

});


// =====================================================
// CACHE KEYS
// =====================================================

const CACHE_KEYS = Object.freeze({

  SETTINGS:
    "system_settings",

  STORAGE_ROOMS:
    "storage_rooms",

  STORAGE_HEALTH:
    "storage_health",

  PROJECT:
    "project_",

  USER:
    "user_",

  SESSION:
    "session_"

});


// =====================================================
// LOCK KEYS
// =====================================================

const LOCK_KEYS = Object.freeze({

  DATABASE:
    "database_lock",

  STORAGE:
    "storage_lock",

  FILE_UPLOAD:
    "file_upload_lock",

  EMAIL_QUEUE:
    "email_queue_lock",

  BACKUP:
    "backup_lock"

});


// =====================================================
// GOOGLE DRIVE
// =====================================================

const DRIVE = Object.freeze({

  TRASH:
    "trash",

  ROOT:
    "root",

  FOLDER:
    "folder",

  FILE:
    "file"

});


// =====================================================
// SHEET TYPES
// =====================================================

const SHEET_TYPES = Object.freeze({

  DATABASE:
    "database",

  PROJECT:
    "project",

  USER:
    "user",

  LOG:
    "log",

  BACKUP:
    "backup",

  SYSTEM:
    "system"

});