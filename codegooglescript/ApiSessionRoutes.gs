// =====================================================
// APISESSIONROUTES.GS
// Session Routes
// =====================================================

function handleSessionRoutes(
  action,
  data
) {

  switch (action) {

    case "logout":

      return logout(
        data.token
      );


    case "getSessionInfo":

      return getSessionInfo(
        data.token
      );


    case "getActiveSessions":

      return getActiveSessions(
        data
      );


    case "forceLogout":

      return forceLogout(
        data
      );


    case "deleteExpiredSessions":

      requireAdmin(
        data.token
      );

      return deleteExpiredSessions();


    default:

      return null;

  }

}