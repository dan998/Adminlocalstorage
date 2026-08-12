// =====================================================
// SESSIONCREATE.GS
// Create Authentication Sessions
// Cloud Project Platform
// =====================================================


// =====================================================
// CREATE SESSION
// =====================================================

function createSession(data) {

  data = data || {};

  if (!data.userId) {

    throw new Error(
      "User ID is required"
    );

  }


  // ===================================================
  // SESSION CONFIGURATION
  // ===================================================

  const config =
    getSessionConfiguration();

  const role =
    data.role ||
    "User";


  // ===================================================
  // GENERATE TOKEN
  // ===================================================

  let token;

  if (
    typeof generateToken ===
    "function"
  ) {

    token =
      generateToken();

  } else if (
    typeof generateSecureToken ===
    "function"
  ) {

    token =
      generateSecureToken();

  } else {

    throw new Error(
      "Token generator is not available"
    );

  }


  if (!token) {

    throw new Error(
      "Unable to generate session token"
    );

  }


  // ===================================================
  // HASH TOKEN BEFORE STORAGE
  // ===================================================

  let tokenHash;

  if (
    typeof hashPassword ===
    "function"
  ) {

    tokenHash =
      hashPassword(
        token
      );

  } else if (
    typeof hashToken ===
    "function"
  ) {

    tokenHash =
      hashToken(
        token
      );

  } else {

    throw new Error(
      "Token hashing function is not available"
    );

  }


  // ===================================================
  // SESSION INFORMATION
  // ===================================================

  const now =
    new Date();

  const expiresAt =
    new Date(
      now.getTime() +
      config.duration
    );


  // ===================================================
  // SESSION ID
  // ===================================================

  const sessionId =
    generateID(
      "SES"
    );


  // ===================================================
  // DEVICE / REQUEST INFORMATION
  // ===================================================

  const deviceId =
    data.deviceId ||
    "";

  const ipAddress =
    data.ipAddress ||
    "";

  const userAgent =
    data.userAgent ||
    "";


  // ===================================================
  // SAVE SESSION
  // ===================================================

  const sheet =
    getSessionsDatabase();

  sheet.appendRow([

    sessionId,

    data.userId,

    tokenHash,

    role,

    deviceId,

    ipAddress,

    userAgent,

    now,

    now,

    expiresAt,

    DEFAULT_SESSION_STATUS,

    ""

  ]);


  // ===================================================
  // RETURN SESSION
  // ===================================================

  return {

    id:
      sessionId,

    token:
      token,

    userId:
      data.userId,

    role:
      role,

    deviceId:
      deviceId,

    createdAt:
      now,

    expiresAt:
      expiresAt,

    status:
      DEFAULT_SESSION_STATUS

  };

}


// =====================================================
// CREATE SESSION FOR USER
// =====================================================

function createUserSession(
  userId,
  role,
  options
) {

  options =
    options || {};

  return createSession({

    userId:
      userId,

    role:
      role ||
      "User",

    deviceId:
      options.deviceId ||
      "",

    ipAddress:
      options.ipAddress ||
      "",

    userAgent:
      options.userAgent ||
      ""

  });

}


// =====================================================
// CREATE ADMIN SESSION
// =====================================================

function createAdminSession(
  adminId,
  options
) {

  options =
    options || {};

  return createSession({

    userId:
      adminId,

    role:
      "Admin",

    deviceId:
      options.deviceId ||
      "",

    ipAddress:
      options.ipAddress ||
      "",

    userAgent:
      options.userAgent ||
      ""

  });

}


// =====================================================
// CREATE SESSION FROM REQUEST
// =====================================================

function createSessionFromRequest(
  userId,
  role,
  request
) {

  request =
    request || {};

  return createSession({

    userId:
      userId,

    role:
      role,

    deviceId:
      request.deviceId ||
      "",

    ipAddress:
      request.ipAddress ||
      "",

    userAgent:
      request.userAgent ||
      ""

  });

}


// =====================================================
// CREATE SESSION RESPONSE
// =====================================================

function createSessionResponse(
  session
) {

  if (!session) {

    return errorResponse(
      "Unable to create session"
    );

  }

  return successResponse(

    "Session created successfully",

    {

      session: {

        id:
          session.id,

        token:
          session.token,

        userId:
          session.userId,

        role:
          session.role,

        deviceId:
          session.deviceId,

        createdAt:
          session.createdAt,

        expiresAt:
          session.expiresAt,

        status:
          session.status

      }

    }

  );

}


// =====================================================
// CREATE SESSION AND RETURN RESPONSE
// =====================================================

function createSessionAndRespond(
  data
) {

  try {

    const session =
      createSession(
        data
      );

    return createSessionResponse(
      session
    );

  } catch (error) {

    return errorResponse(
      error.message
    );

  }

}