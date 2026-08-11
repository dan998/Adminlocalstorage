// =====================================================
// APISETTINGSROUTES.GS
// Settings API Routes
// Registration System API
// =====================================================


// =====================================================
// SETTINGS ROUTER
// =====================================================

function handleSettingsRoutes(
  action,
  data
) {

  // ===================================================
  // GET SETTINGS
  // ===================================================

  if (
    action ===
    "getSettings"
  ) {

    return getSettings(
      data
    );

  }


  // ===================================================
  // UPDATE SETTINGS
  // ===================================================

  if (
    action ===
    "updateSettings"
  ) {

    return updateSettings(
      data
    );

  }


  // ===================================================
  // SYSTEM CONFIG
  // ===================================================

  if (
    action ===
    "systemConfig"
  ) {

    return systemConfig(
      data
    );

  }


  // ===================================================
  // MAINTENANCE MODE
  // ===================================================

  if (
    action ===
    "maintenanceMode"
  ) {

    return maintenanceMode(
      data
    );

  }


  // ===================================================
  // NO SETTINGS ROUTE
  // ===================================================

  return null;

}