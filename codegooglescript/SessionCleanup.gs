// =====================================================
// SESSIONCLEANUP.GS
// Session Cleanup & Maintenance
// =====================================================

// =====================================================
// CLEANUP EXPIRED SESSIONS
// =====================================================

function cleanupExpiredSessions() {

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

const now =
new Date();

let cleaned = 0;

for (let i = 1; i < data.length; i++) {

const sessionId =
  data[i][0];

const expiresAt =
  data[i][5];

const status =
  data[i][6];

if (
  status === "Active" &&
  new Date(expiresAt) <= now
) {

  sheet.getRange(
    i + 1,
    SESSION_COLUMNS.STATUS
  ).setValue(
    "Expired"
  );

  cleaned++;

}

}

return {
success: true,
expiredSessions: cleaned
};

}

// =====================================================
// DELETE EXPIRED SESSIONS
// =====================================================

function deleteExpiredSessions() {

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

const now =
new Date();

let deleted = 0;

for (
let i = data.length - 1;
i >= 1;
i--
) {

const expiresAt =
  data[i][5];

if (
  new Date(expiresAt) <= now
) {

  sheet.deleteRow(
    i + 1
  );

  deleted++;

}

}

return {
success: true,
deletedSessions: deleted
};

}

// =====================================================
// DELETE LOGGED OUT SESSIONS
// =====================================================

function deleteLoggedOutSessions() {

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

let deleted = 0;

for (
let i = data.length - 1;
i >= 1;
i--
) {

if (
  data[i][6] ===
  "Logged Out"
) {

  sheet.deleteRow(
    i + 1
  );

  deleted++;

}

}

return {
success: true,
deletedSessions: deleted
};

}

// =====================================================
// DELETE INACTIVE SESSIONS
// =====================================================

function deleteInactiveSessions() {

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

let deleted = 0;

for (
let i = data.length - 1;
i >= 1;
i--
) {

const status =
  data[i][6];

if (
  status !== "Active"
) {

  sheet.deleteRow(
    i + 1
  );

  deleted++;

}

}

return {
success: true,
deletedSessions: deleted
};

}

// =====================================================
// REMOVE OLD SESSIONS
// KEEP LAST N DAYS
// =====================================================

function removeOldSessions(
daysToKeep
) {

daysToKeep =
daysToKeep || 30;

const sheet =
getSheet(SHEETS.SESSIONS);

const data =
sheet.getDataRange().getValues();

const cutoffDate =
new Date();

cutoffDate.setDate(
cutoffDate.getDate() -
daysToKeep
);

let deleted = 0;

for (
let i = data.length - 1;
i >= 1;
i--
) {

const createdAt =
  new Date(
    data[i][4]
  );

if (
  createdAt <
  cutoffDate
) {

  sheet.deleteRow(
    i + 1
  );

  deleted++;

}

}

return {
success: true,
deletedSessions: deleted
};

}

// =====================================================
// SESSION MAINTENANCE TASK
// =====================================================

function runSessionMaintenance() {

const expired =
cleanupExpiredSessions();

const deleted =
deleteExpiredSessions();

return {
success: true,
expiredMarked:
expired.expiredSessions,
expiredDeleted:
deleted.deletedSessions,
runAt:
new Date()
};

}