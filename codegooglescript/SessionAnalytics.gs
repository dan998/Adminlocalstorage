// =====================================================
// SESSIONANALYTICS.GS
// Session Analytics & Statistics
// =====================================================


// =====================================================
// GET SESSION STATISTICS
// =====================================================

function getSessionStatistics() {

  const sessions =
    getAllSessions();

  const now =
    new Date();

  let active = 0;
  let expired = 0;
  let loggedOut = 0;
  let locked = 0;
  let inactive = 0;

  sessions.forEach(
    function(session) {

      const status =
        String(
          session.status || ""
        ).toLowerCase();

      const expiresAt =
        session.expiresAt
          ? new Date(session.expiresAt)
          : null;

      if (
        status === "active" &&
        expiresAt &&
        expiresAt > now
      ) {

        active++;

      }
      else if (
        status === "expired"
      ) {

        expired++;

      }
      else if (
        status === "logged out"
      ) {

        loggedOut++;

      }
      else if (
        status === "locked"
      ) {

        locked++;

      }
      else {

        inactive++;

      }

    }
  );

  return {

    success: true,

    totalSessions:
      sessions.length,

    activeSessions:
      active,

    expiredSessions:
      expired,

    loggedOutSessions:
      loggedOut,

    lockedSessions:
      locked,

    inactiveSessions:
      inactive,

    generatedAt:
      new Date()

  };

}


// =====================================================
// GET ACTIVE SESSION COUNT
// =====================================================

function getActiveSessionCount() {

  const statistics =
    getSessionStatistics();

  return statistics.activeSessions;

}


// =====================================================
// GET USER SESSION COUNT
// =====================================================

function getUserSessionCount(
  userId
) {

  if (!userId) {
    return 0;
  }

  return getUserSessions(
    userId
  ).length;

}


// =====================================================
// GET ACTIVE USER SESSION COUNT
// =====================================================

function getActiveUserSessionCount(
  userId
) {

  if (!userId) {
    return 0;
  }

  return getActiveUserSessions(
    userId
  ).length;

}


// =====================================================
// GET ONLINE USERS
// =====================================================

function getOnlineUsers() {

  const sessions =
    getAllSessions();

  const now =
    new Date();

  const users = {};

  sessions.forEach(
    function(session) {

      if (
        String(session.status)
          .toLowerCase() !== "active"
      ) {

        return;

      }

      if (
        !session.expiresAt
      ) {

        return;

      }

      if (
        new Date(session.expiresAt)
        <= now
      ) {

        return;

      }

      const userId =
        String(session.userId);

      if (!users[userId]) {

        users[userId] = {

          userId:
            session.userId,

          role:
            session.role,

          sessions: 0,

          latestExpiry:
            session.expiresAt

        };

      }

      users[userId].sessions++;

      if (
        new Date(session.expiresAt) >
        new Date(
          users[userId].latestExpiry
        )
      ) {

        users[userId].latestExpiry =
          session.expiresAt;

      }

    }
  );

  return Object.keys(users)
    .map(
      function(userId) {

        return users[userId];

      }
    );

}


// =====================================================
// GET ONLINE USER COUNT
// =====================================================

function getOnlineUserCount() {

  return getOnlineUsers().length;

}


// =====================================================
// GET SESSIONS BY ROLE
// =====================================================

function getSessionsByRole(
  role
) {

  if (!role) {
    return [];
  }

  const sessions =
    getAllSessions();

  return sessions.filter(
    function(session) {

      return (
        String(session.role)
          .toLowerCase() ===
        String(role)
          .toLowerCase()
      );

    }
  );

}


// =====================================================
// GET ACTIVE SESSIONS BY ROLE
// =====================================================

function getActiveSessionsByRole(
  role
) {

  const sessions =
    getSessionsByRole(role);

  const now =
    new Date();

  return sessions.filter(
    function(session) {

      return (

        String(session.status)
          .toLowerCase() ===
          "active"

        &&

        session.expiresAt

        &&

        new Date(session.expiresAt)
          > now

      );

    }
  );

}


// =====================================================
// GET ACTIVE USERS BY ROLE
// =====================================================

function getActiveUsersByRole(
  role
) {

  const sessions =
    getActiveSessionsByRole(
      role
    );

  const users = {};

  sessions.forEach(
    function(session) {

      users[
        String(session.userId)
      ] = {

        userId:
          session.userId,

        role:
          session.role

      };

    }
  );

  return Object.keys(users)
    .map(
      function(userId) {
        return users[userId];
      }
    );

}


// =====================================================
// GET SESSION SUMMARY
// =====================================================

function getSessionSummary() {

  const statistics =
    getSessionStatistics();

  return {

    success: true,

    totalSessions:
      statistics.totalSessions,

    activeSessions:
      statistics.activeSessions,

    onlineUsers:
      getOnlineUserCount(),

    expiredSessions:
      statistics.expiredSessions,

    loggedOutSessions:
      statistics.loggedOutSessions,

    lockedSessions:
      statistics.lockedSessions,

    inactiveSessions:
      statistics.inactiveSessions,

    generatedAt:
      statistics.generatedAt

  };

}


// =====================================================
// GET USER SESSION SUMMARY
// =====================================================

function getUserSessionSummary(
  userId
) {

  if (!userId) {

    throw new Error(
      "User ID is required"
    );

  }

  const sessions =
    getUserSessions(
      userId
    );

  const now =
    new Date();

  let active = 0;
  let expired = 0;
  let loggedOut = 0;
  let locked = 0;

  sessions.forEach(
    function(session) {

      const status =
        String(
          session.status || ""
        ).toLowerCase();

      if (
        status === "active" &&
        session.expiresAt &&
        new Date(session.expiresAt) > now
      ) {

        active++;

      }
      else if (
        status === "expired"
      ) {

        expired++;

      }
      else if (
        status === "logged out"
      ) {

        loggedOut++;

      }
      else if (
        status === "locked"
      ) {

        locked++;

      }

    }
  );

  return {

    success: true,

    userId:
      userId,

    totalSessions:
      sessions.length,

    activeSessions:
      active,

    expiredSessions:
      expired,

    loggedOutSessions:
      loggedOut,

    lockedSessions:
      locked

  };

}


// =====================================================
// GET ROLE SESSION STATISTICS
// =====================================================

function getRoleSessionStatistics(
  role
) {

  const sessions =
    getSessionsByRole(
      role
    );

  const now =
    new Date();

  let active = 0;
  let expired = 0;
  let loggedOut = 0;
  let locked = 0;

  sessions.forEach(
    function(session) {

      const status =
        String(
          session.status || ""
        ).toLowerCase();

      if (
        status === "active" &&
        session.expiresAt &&
        new Date(session.expiresAt) > now
      ) {

        active++;

      }
      else if (
        status === "expired"
      ) {

        expired++;

      }
      else if (
        status === "logged out"
      ) {

        loggedOut++;

      }
      else if (
        status === "locked"
      ) {

        locked++;

      }

    }
  );

  return {

    success: true,

    role:
      role,

    totalSessions:
      sessions.length,

    activeSessions:
      active,

    expiredSessions:
      expired,

    loggedOutSessions:
      loggedOut,

    lockedSessions:
      locked

  };

}


// =====================================================
// GET SESSION EXPIRATION REPORT
// =====================================================

function getSessionExpirationReport() {

  const sessions =
    getAllSessions();

  const now =
    new Date();

  const report = {

    expired: 0,

    expiringWithin15Minutes: 0,

    expiringWithin1Hour: 0,

    expiringWithin24Hours: 0,

    activeBeyond24Hours: 0

  };

  sessions.forEach(
    function(session) {

      if (
        String(session.status)
          .toLowerCase() !==
        "active"
      ) {

        return;

      }

      if (
        !session.expiresAt
      ) {

        return;

      }

      const expiry =
        new Date(
          session.expiresAt
        );

      const difference =
        expiry.getTime() -
        now.getTime();

      if (
        difference <= 0
      ) {

        report.expired++;

      }
      else if (
        difference <=
        15 * 60 * 1000
      ) {

        report.expiringWithin15Minutes++;

      }
      else if (
        difference <=
        60 * 60 * 1000
      ) {

        report.expiringWithin1Hour++;

      }
      else if (
        difference <=
        24 * 60 * 60 * 1000
      ) {

        report.expiringWithin24Hours++;

      }
      else {

        report.activeBeyond24Hours++;

      }

    }
  );

  return {

    success: true,

    report: report,

    generatedAt:
      new Date()

  };

}


// =====================================================
// GET SESSION HEALTH
// =====================================================

function getSessionHealth() {

  const statistics =
    getSessionStatistics();

  const total =
    statistics.totalSessions;

  const active =
    statistics.activeSessions;

  const locked =
    statistics.lockedSessions;

  let health =
    "healthy";

  if (
    total > 0 &&
    locked / total >= 0.25
  ) {

    health =
      "critical";

  }
  else if (
    total > 0 &&
    locked / total >= 0.10
  ) {

    health =
      "warning";

  }

  return {

    success: true,

    health:
      health,

    totalSessions:
      total,

    activeSessions:
      active,

    lockedSessions:
      locked,

    onlineUsers:
      getOnlineUserCount(),

    generatedAt:
      new Date()

  };

}


// =====================================================
// GET SESSION DASHBOARD
// =====================================================

function getSessionDashboard() {

  return {

    success: true,

    statistics:
      getSessionStatistics(),

    summary:
      getSessionSummary(),

    expiration:
      getSessionExpirationReport(),

    health:
      getSessionHealth(),

    onlineUsers:
      getOnlineUserCount(),

    generatedAt:
      new Date()

  };

}