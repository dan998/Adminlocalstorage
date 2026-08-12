// =====================================================
// SESSIONREAD.GS
// Session Read Operations
// =====================================================

// =====================================================
// GET SESSION BY TOKEN
// =====================================================

function getSessionByToken(token) {

if (!token) {
return null;
}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

for (let i = 1; i < data.length; i++) {

if (data[i][1] === token) {

  return {
    id: data[i][0],
    token: data[i][1],
    userId: data[i][2],
    role: data[i][3],
    createdAt: data[i][4],
    expiresAt: data[i][5],
    status: data[i][6]
  };

}

}

return null;

}

// =====================================================
// GET SESSION BY ID
// =====================================================

function getSessionById(sessionId) {

if (!sessionId) {
return null;
}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

for (let i = 1; i < data.length; i++) {

if (data[i][0] === sessionId) {

  return {
    id: data[i][0],
    token: data[i][1],
    userId: data[i][2],
    role: data[i][3],
    createdAt: data[i][4],
    expiresAt: data[i][5],
    status: data[i][6]
  };

}

}

return null;

}

// =====================================================
// GET USER SESSIONS
// =====================================================

function getUserSessions(userId) {

if (!userId) {
return [];
}

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

const sessions = [];

for (let i = 1; i < data.length; i++) {

if (data[i][2] === userId) {

  sessions.push({
    id: data[i][0],
    token: data[i][1],
    userId: data[i][2],
    role: data[i][3],
    createdAt: data[i][4],
    expiresAt: data[i][5],
    status: data[i][6]
  });

}

}

return sessions;

}

// =====================================================
// GET ACTIVE USER SESSIONS
// =====================================================

function getActiveUserSessions(userId) {

const sessions =
getUserSessions(userId);

const now =
new Date();

return sessions.filter(session =>
session.status === "Active" &&
new Date(session.expiresAt) > now
);

}

// =====================================================
// VALIDATE SESSION
// =====================================================

function validateSession(token) {

const session =
getSessionByToken(token);

if (!session) {
return null;
}

if (session.status !== "Active") {
return null;
}

if (
new Date(session.expiresAt) <
new Date()
) {
return null;
}

return session;

}

// =====================================================
// GET ALL SESSIONS
// =====================================================

function getAllSessions() {

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

const sessions = [];

for (let i = 1; i < data.length; i++) {

sessions.push({
  id: data[i][0],
  token: data[i][1],
  userId: data[i][2],
  role: data[i][3],
  createdAt: data[i][4],
  expiresAt: data[i][5],
  status: data[i][6]
});

}

return sessions;

}