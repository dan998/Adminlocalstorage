// =====================================================
// USERS.GS
// Core User Model
// CodingFamily Nexus
// Cloud Project Platform
// =====================================================


// =====================================================
// USER COLUMNS
// =====================================================

const USER_COLUMNS = {

  ID: 1,

  USERNAME: 2,

  EMAIL: 3,

  PHONE: 4,

  COUNTRY: 5,

  COUNTRY_CODE: 6,

  NETWORK: 7,

  PASSWORD_HASH: 8,

  SECURITY_QUESTION: 9,

  SECURITY_ANSWER_HASH: 10,

  VERIFY_STATUS: 11,

  DEVICE_ID: 12,

  IP_ADDRESS: 13,

  CREATED_AT: 14,

  UPDATED_AT: 15,

  LAST_LOGIN: 16,

  LAST_LOGOUT: 17,

  RESET_CODE_HASH: 18,

  RESET_EXPIRY: 19,

  RESET_USED: 20,

  RESET_ATTEMPTS: 21,

  RESET_TOKEN: 22,

  SESSION_TOKEN: 23,

  TOKEN_EXPIRY: 24,

  FAILED_LOGIN_ATTEMPTS: 25,

  ACCOUNT_LOCKED: 26,

  LOCKED_EXPIRY: 27,

  TOTAL_PROJECTS: 28,

  TOTAL_FILES: 29,

  TOTAL_STORAGE_USED: 30,

  STATUS: 31

};


// =====================================================
// USER STATUSES
// =====================================================

const USER_STATUSES = [

  "Active",

  "Inactive",

  "Pending",

  "Suspended",

  "Blocked",

  "Deleted"

];


// =====================================================
// USER VERIFICATION STATUS
// =====================================================

const USER_VERIFY_STATUS = {

  PENDING:
    "Pending",

  VERIFIED:
    "Verified",

  REJECTED:
    "Rejected"

};


// =====================================================
// DEFAULT USER VALUES
// =====================================================

const DEFAULT_USER_STATUS =
  "Active";


const DEFAULT_USER_VERIFY_STATUS =
  USER_VERIFY_STATUS.PENDING;


// =====================================================
// USER VALIDATION LIMITS
// =====================================================

const USER_LIMITS = {

  MIN_USERNAME_LENGTH:
    3,

  MAX_USERNAME_LENGTH:
    50,

  MIN_PASSWORD_LENGTH:
    8,

  MAX_PASSWORD_LENGTH:
    128,

  MAX_EMAIL_LENGTH:
    254,

  MAX_PHONE_LENGTH:
    30

};


// =====================================================
// USER DEFAULT LIMITS
// =====================================================

const USER_DEFAULT_LIMITS = {

  MAX_PROJECTS:
    10,

  MAX_FILES:
    1000,

  MAX_STORAGE_BYTES:
    1024 * 1024 * 1024,

  MAX_FILE_SIZE:
    100 * 1024 * 1024,

  MAX_SESSIONS:
    5

};


// =====================================================
// BUILD USER RECORD
// =====================================================

function buildUserRecord(
  data
) {

  data =
    data || {};

  const now =
    new Date();

  const id =
    data.id ||
    generateID(
      ID_PREFIXES.USER
    );

  return {

    id:
      id,

    username:
      data.username ||
      "",

    email:
      data.email ||
      "",

    phone:
      data.phone ||
      "",

    country:
      data.country ||
      "",

    countryCode:
      data.countryCode ||
      "",

    network:
      data.network ||
      "",

    passwordHash:
      data.passwordHash ||
      "",

    securityQuestion:
      data.securityQuestion ||
      "",

    securityAnswerHash:
      data.securityAnswerHash ||
      "",

    verifyStatus:
      data.verifyStatus ||
      DEFAULT_USER_VERIFY_STATUS,

    deviceId:
      data.deviceId ||
      "",

    ipAddress:
      data.ipAddress ||
      "",

    createdAt:
      data.createdAt ||
      now,

    updatedAt:
      data.updatedAt ||
      now,

    lastLogin:
      data.lastLogin ||
      "",

    lastLogout:
      data.lastLogout ||
      "",

    resetCodeHash:
      data.resetCodeHash ||
      "",

    resetExpiry:
      data.resetExpiry ||
      "",

    resetUsed:
      data.resetUsed ||
      false,

    resetAttempts:
      Number(
        data.resetAttempts || 0
      ),

    resetToken:
      data.resetToken ||
      "",

    sessionToken:
      data.sessionToken ||
      "",

    tokenExpiry:
      data.tokenExpiry ||
      "",

    failedLoginAttempts:
      Number(
        data.failedLoginAttempts || 0
      ),

    accountLocked:
      data.accountLocked ||
      false,

    lockedExpiry:
      data.lockedExpiry ||
      "",

    totalProjects:
      Number(
        data.totalProjects || 0
      ),

    totalFiles:
      Number(
        data.totalFiles || 0
      ),

    totalStorageUsed:
      Number(
        data.totalStorageUsed || 0
      ),

    status:
      data.status ||
      DEFAULT_USER_STATUS

  };

}


// =====================================================
// FIND USER BY ID
// =====================================================

function findUserById(
  userId
) {

  if (!userId) {

    return null;

  }

  const sheet =
    getSheet(
      SHEETS.USERS
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
        USER_COLUMNS.ID - 1
      ];

    if (
      String(id) ===
      String(userId)
    ) {

      return userRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND USER BY USERNAME
// =====================================================

function findUserByUsername(
  username
) {

  if (!username) {

    return null;

  }

  const target =
    String(username)
      .trim()
      .toLowerCase();

  const sheet =
    getSheet(
      SHEETS.USERS
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

    const value =
      String(
        row[
          USER_COLUMNS.USERNAME - 1
        ] || ""
      )
        .trim()
        .toLowerCase();

    if (
      value === target
    ) {

      return userRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND USER BY EMAIL
// =====================================================

function findUserByEmail(
  email
) {

  if (!email) {

    return null;

  }

  const target =
    String(email)
      .trim()
      .toLowerCase();

  const sheet =
    getSheet(
      SHEETS.USERS
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

    const value =
      String(
        row[
          USER_COLUMNS.EMAIL - 1
        ] || ""
      )
        .trim()
        .toLowerCase();

    if (
      value === target
    ) {

      return userRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND USER BY PHONE
// =====================================================

function findUserByPhone(
  phone
) {

  if (!phone) {

    return null;

  }

  const target =
    String(phone)
      .replace(
        /\D/g,
        ""
      );

  if (!target) {

    return null;

  }

  const sheet =
    getSheet(
      SHEETS.USERS
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

    const value =
      String(
        row[
          USER_COLUMNS.PHONE - 1
        ] || ""
      )
        .replace(
          /\D/g,
          ""
        );

    if (
      value === target
    ) {

      return userRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND USER BY LOGIN IDENTIFIER
// =====================================================

function findUserByLogin(
  identifier
) {

  if (!identifier) {

    return null;

  }

  const value =
    String(identifier)
      .trim();

  let user =
    findUserByUsername(
      value
    );

  if (user) {

    return user;

  }

  user =
    findUserByEmail(
      value
    );

  if (user) {

    return user;

  }

  return findUserByPhone(
    value
  );

}


// =====================================================
// GET ALL USERS
// =====================================================

function getAllUsers() {

  const sheet =
    getSheet(
      SHEETS.USERS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  const users = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      !row[
        USER_COLUMNS.ID - 1
      ]
    ) {

      continue;

    }

    users.push(
      userRowToObject(
        row,
        i + 1
      )
    );

  }

  return users;

}


// =====================================================
// GET ACTIVE USERS
// =====================================================

function getActiveUsers() {

  return getAllUsers()
    .filter(
      function(user) {

        return String(
          user.status || ""
        )
          .toLowerCase() ===
          "active";

      }
    );

}


// =====================================================
// GET VERIFIED USERS
// =====================================================

function getVerifiedUsers() {

  return getAllUsers()
    .filter(
      function(user) {

        return String(
          user.verifyStatus || ""
        )
          .toLowerCase() ===
          "verified";

      }
    );

}


// =====================================================
// CONVERT SHEET ROW TO OBJECT
// =====================================================

function userRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber,

    id:
      row[
        USER_COLUMNS.ID - 1
      ],

    username:
      row[
        USER_COLUMNS.USERNAME - 1
      ],

    email:
      row[
        USER_COLUMNS.EMAIL - 1
      ],

    phone:
      row[
        USER_COLUMNS.PHONE - 1
      ],

    country:
      row[
        USER_COLUMNS.COUNTRY - 1
      ],

    countryCode:
      row[
        USER_COLUMNS.COUNTRY_CODE - 1
      ],

    network:
      row[
        USER_COLUMNS.NETWORK - 1
      ],

    passwordHash:
      row[
        USER_COLUMNS.PASSWORD_HASH - 1
      ],

    securityQuestion:
      row[
        USER_COLUMNS.SECURITY_QUESTION - 1
      ],

    securityAnswerHash:
      row[
        USER_COLUMNS.SECURITY_ANSWER_HASH - 1
      ],

    verifyStatus:
      row[
        USER_COLUMNS.VERIFY_STATUS - 1
      ],

    deviceId:
      row[
        USER_COLUMNS.DEVICE_ID - 1
      ],

    ipAddress:
      row[
        USER_COLUMNS.IP_ADDRESS - 1
      ],

    createdAt:
      row[
        USER_COLUMNS.CREATED_AT - 1
      ],

    updatedAt:
      row[
        USER_COLUMNS.UPDATED_AT - 1
      ],

    lastLogin:
      row[
        USER_COLUMNS.LAST_LOGIN - 1
      ],

    lastLogout:
      row[
        USER_COLUMNS.LAST_LOGOUT - 1
      ],

    resetCodeHash:
      row[
        USER_COLUMNS.RESET_CODE_HASH - 1
      ],

    resetExpiry:
      row[
        USER_COLUMNS.RESET_EXPIRY - 1
      ],

    resetUsed:
      row[
        USER_COLUMNS.RESET_USED - 1
      ],

    resetAttempts:
      Number(
        row[
          USER_COLUMNS.RESET_ATTEMPTS - 1
        ] || 0
      ),

    resetToken:
      row[
        USER_COLUMNS.RESET_TOKEN - 1
      ],

    sessionToken:
      row[
        USER_COLUMNS.SESSION_TOKEN - 1
      ],

    tokenExpiry:
      row[
        USER_COLUMNS.TOKEN_EXPIRY - 1
      ],

    failedLoginAttempts:
      Number(
        row[
          USER_COLUMNS.FAILED_LOGIN_ATTEMPTS - 1
        ] || 0
      ),

    accountLocked:
      row[
        USER_COLUMNS.ACCOUNT_LOCKED - 1
      ],

    lockedExpiry:
      row[
        USER_COLUMNS.LOCKED_EXPIRY - 1
      ],

    totalProjects:
      Number(
        row[
          USER_COLUMNS.TOTAL_PROJECTS - 1
        ] || 0
      ),

    totalFiles:
      Number(
        row[
          USER_COLUMNS.TOTAL_FILES - 1
        ] || 0
      ),

    totalStorageUsed:
      Number(
        row[
          USER_COLUMNS.TOTAL_STORAGE_USED - 1
        ] || 0
      ),

    status:
      row[
        USER_COLUMNS.STATUS - 1
      ]

  };

}


// =====================================================
// CHECK USER EXISTS
// =====================================================

function userExists(
  identifier
) {

  return !!findUserByLogin(
    identifier
  );

}


// =====================================================
// CHECK USER ACTIVE
// =====================================================

function isUserActive(
  user
) {

  if (!user) {

    return false;

  }

  return String(
    user.status || ""
  )
    .toLowerCase() ===
    "active";

}


// =====================================================
// CHECK USER VERIFIED
// =====================================================

function isUserVerified(
  user
) {

  if (!user) {

    return false;

  }

  return String(
    user.verifyStatus || ""
  )
    .toLowerCase() ===
    "verified";

}


// =====================================================
// CHECK USER LOCK
// =====================================================

function isUserLocked(
  user
) {

  if (!user) {

    return false;

  }

  const locked =
    user.accountLocked === true ||
    String(
      user.accountLocked
    ).toLowerCase() ===
    "true";

  if (!locked) {

    return false;

  }

  if (!user.lockedExpiry) {

    return true;

  }

  const expiry =
    new Date(
      user.lockedExpiry
    );

  if (
    isNaN(
      expiry.getTime()
    )
  ) {

    return true;

  }

  return (
    expiry >
    new Date()
  );

}


// =====================================================
// GET USER STORAGE USAGE
// =====================================================

function getUserStorageUsage(
  user
) {

  if (!user) {

    return 0;

  }

  return Number(
    user.totalStorageUsed ||
    0
  );

}


// =====================================================
// VALIDATE USER OBJECT
// =====================================================

function validateUserObject(
  user
) {

  if (!user) {

    return {

      valid: false,

      error:
        "User is required"

    };

  }

  if (!user.id) {

    return {

      valid: false,

      error:
        "User ID is required"

    };

  }

  if (!user.username) {

    return {

      valid: false,

      error:
        "Username is required"

    };

  }

  if (!user.email) {

    return {

      valid: false,

      error:
        "Email is required"

    };

  }

  return {

    valid: true,

    error: null

  };

}