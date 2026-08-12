// =====================================================
// SESSIONLOGOUT.GS
// Session Logout Operations
// =====================================================

// =====================================================
// LOGOUT SESSION
// =====================================================

function logoutSession(token) {

if (!token) {

throw new Error(
  "Session token is required"
);

}

const session =
getSessionByToken(token);

if (!session) {

throw new Error(
  "Session not found"
);

}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

for (let i = 1; i < data.length; i++) {

if (data[i][1] === token) {

  sheet.getRange(
    i + 1,
    SESSION_COLUMNS.STATUS
  ).setValue("Logged Out");

  break;

}

}

updateUserLastLogout(
session.userId
);

logSecurityEvent(
session.userId,
"SESSION_LOGOUT",
"User logged out successfully"
);

return {
success: true,
message: "Logged out successfully"
};

}

// =====================================================
// LOGOUT SESSION BY ID
// =====================================================

function logoutSessionById(
sessionId
) {

const session =
getSessionById(
sessionId
);

if (!session) {

throw new Error(
  "Session not found"
);

}

return logoutSession(
session.token
);

}

// =====================================================
// LOGOUT ALL USER SESSIONS
// =====================================================

function logoutAllUserSessions(
userId
) {

if (!userId) {

throw new Error(
  "User ID is required"
);

}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

let count = 0;

for (let i = 1; i < data.length; i++) {

if (
  data[i][2] === userId &&
  data[i][6] === "Active"
) {

  sheet.getRange(
    i + 1,
    SESSION_COLUMNS.STATUS
  ).setValue(
    "Logged Out"
  );

  count++;

}

}

updateUserLastLogout(
userId
);

logSecurityEvent(
userId,
"ALL_SESSIONS_LOGOUT",
count +
" session(s) logged out"
);

return {
success: true,
sessionsLoggedOut: count
};

}

// =====================================================
// LOGOUT OTHER SESSIONS
// KEEP CURRENT SESSION ACTIVE
// =====================================================

function logoutOtherSessions(
userId,
currentToken
) {

if (!userId) {

throw new Error(
  "User ID is required"
);

}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

let count = 0;

for (let i = 1; i < data.length; i++) {

if (
  data[i][2] === userId &&
  data[i][1] !== currentToken &&
  data[i][6] === "Active"
) {

  sheet.getRange(
    i + 1,
    SESSION_COLUMNS.STATUS
  ).setValue(
    "Logged Out"
  );

  count++;

}

}

logSecurityEvent(
userId,
"OTHER_SESSIONS_LOGOUT",
count +
" other session(s) logged out"
);

return {
success: true,
sessionsLoggedOut: count
};

}

// =====================================================
// ADMIN FORCE LOGOUT USER
// =====================================================

function forceLogoutUser(
adminId,
userId
) {

const result =
logoutAllUserSessions(
userId
);

logAdminAction(
adminId,
"FORCE_LOGOUT_USER",
"User ID: " + userId
);

return result;

}