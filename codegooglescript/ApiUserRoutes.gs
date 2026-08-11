// =====================================================
// APIUSERROUTES.GS
// User Routes
// =====================================================

function handleUserRoutes(
  action,
  data
) {

  switch (action) {

    case "createUser":

      return createUser(data);


    case "getUsers":

      return getUsers(data);


    case "getUser":

      return getUser(data);


    case "updateUser":

      return updateUser(data);


    case "updateUserStatus":

      return updateUserStatus(data);


    case "deleteUser":

      return deleteUser(data);


    case "updateUserLimits":

      return updateUserLimits(data);


    case "getUserUsage":

      return getUserUsage(data);


    default:

      return null;

  }

}