// =====================================================
// APIPERMISSIONROUTES.GS
// Permission API Routes
// Registration System API
// =====================================================


// =====================================================
// PERMISSION ROUTER
// =====================================================

function handlePermissionRoutes(
  action,
  data
) {

  // ===================================================
  // CREATE ROLE
  // ===================================================

  if (
    action ===
    "createRole"
  ) {

    return createRole(
      data
    );

  }


  // ===================================================
  // GET ROLES
  // ===================================================

  if (
    action ===
    "getRoles"
  ) {

    return getRoles(
      data
    );

  }


  // ===================================================
  // UPDATE PERMISSION
  // ===================================================

  if (
    action ===
    "updatePermission"
  ) {

    return updatePermission(
      data
    );

  }


  // ===================================================
  // CHECK PERMISSION
  // ===================================================

  if (
    action ===
    "checkPermission"
  ) {

    return checkPermissionAPI(
      data
    );

  }


  // ===================================================
  // NO PERMISSION ROUTE
  // ===================================================

  return null;

}