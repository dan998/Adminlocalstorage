// =====================================================
// APIROUTER.GS
// Main API Router
// =====================================================

function routeRequest(data) {

  data = data || {};

  const action =
    String(
      data.action || ""
    )
      .trim();

  if (!action) {

    return errorResponse(
      "API action is required"
    );

  }


  // ===================================================
  // AUTHENTICATION
  // ===================================================

  const authResult =
    handleAuthRoutes(
      action,
      data
    );

  if (authResult !== null) {

    return authResult;

  }


  // ===================================================
  // USERS
  // ===================================================

  const userResult =
    handleUserRoutes(
      action,
      data
    );

  if (userResult !== null) {

    return userResult;

  }


  // ===================================================
  // ADMIN
  // ===================================================

  const adminResult =
    handleAdminRoutes(
      action,
      data
    );

  if (adminResult !== null) {

    return adminResult;

  }


  // ===================================================
  // PROJECTS
  // ===================================================

  const projectResult =
    handleProjectRoutes(
      action,
      data
    );

  if (projectResult !== null) {

    return projectResult;

  }


  // ===================================================
  // PROJECT USERS
  // ===================================================

  const projectUserResult =
    handleProjectUserRoutes(
      action,
      data
    );

  if (projectUserResult !== null) {

    return projectUserResult;

  }


  // ===================================================
  // FILES
  // ===================================================

  const fileResult =
    handleFileRoutes(
      action,
      data
    );

  if (fileResult !== null) {

    return fileResult;

  }


  // ===================================================
  // SHEETS
  // ===================================================

  const sheetResult =
    handleSheetRoutes(
      action,
      data
    );

  if (sheetResult !== null) {

    return sheetResult;

  }


  // ===================================================
  // DASHBOARD
  // ===================================================

  const dashboardResult =
    handleDashboardRoutes(
      action,
      data
    );

  if (dashboardResult !== null) {

    return dashboardResult;

  }


  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  const notificationResult =
    handleNotificationRoutes(
      action,
      data
    );

  if (notificationResult !== null) {

    return notificationResult;

  }


  // ===================================================
  // SETTINGS
  // ===================================================

  const settingsResult =
    handleSettingsRoutes(
      action,
      data
    );

  if (settingsResult !== null) {

    return settingsResult;

  }


  // ===================================================
  // PERMISSIONS
  // ===================================================

  const permissionResult =
    handlePermissionRoutes(
      action,
      data
    );

  if (permissionResult !== null) {

    return permissionResult;

  }


  // ===================================================
  // BACKUPS
  // ===================================================

  const backupResult =
    handleBackupRoutes(
      action,
      data
    );

  if (backupResult !== null) {

    return backupResult;

  }


  // ===================================================
  // SESSIONS
  // ===================================================

  const sessionResult =
    handleSessionRoutes(
      action,
      data
    );

  if (sessionResult !== null) {

    return sessionResult;

  }


  // ===================================================
  // UNKNOWN ACTION
  // ===================================================

  return errorResponse(
    "Unknown API action: " +
    action
  );

}