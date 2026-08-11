// =====================================================
// API PROJECT USER ROUTES
// Project User API Controller
// Registration System API
// =====================================================


// =====================================================
// API: ADD PROJECT USER
// =====================================================

function apiAddProjectUser(data) {

  data = data || {};

  return addProjectUser(data);

}


// =====================================================
// API: REMOVE PROJECT USER
// =====================================================

function apiRemoveProjectUser(data) {

  data = data || {};

  return removeProjectUser(data);

}


// =====================================================
// API: GET PROJECT USERS
// =====================================================

function apiGetProjectUsers(data) {

  data = data || {};

  return getProjectUsers(data);

}


// =====================================================
// API: CHECK PROJECT ACCESS
// =====================================================

function apiCheckProjectAccess(data) {

  data = data || {};

  return checkProjectAccess(data);

}


// =====================================================
// API ROUTE HANDLER
// Used by ApiRouter.gs
// =====================================================

function routeProjectUserRequest(
  action,
  data
) {

  data = data || {};

  switch (
    String(action || "")
      .toLowerCase()
  ) {

    case "add":

      return apiAddProjectUser(
        data
      );


    case "remove":

      return apiRemoveProjectUser(
        data
      );


    case "list":

    case "get":

      return apiGetProjectUsers(
        data
      );


    case "access":

    case "checkaccess":

      return apiCheckProjectAccess(
        data
      );


    default:

      return errorResponse(
        "Unknown project user action"
      );

  }

}