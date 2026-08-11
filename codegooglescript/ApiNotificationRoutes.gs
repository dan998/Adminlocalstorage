// =====================================================
// APINOTIFICATIONROUTES.GS
// Notification API Routes
// Registration System API
// =====================================================


// =====================================================
// NOTIFICATION ROUTER
// =====================================================

function handleNotificationRoutes(
  action,
  data
) {

  // ===================================================
  // CREATE NOTIFICATION
  // ===================================================

  if (
    action ===
    "createNotification"
  ) {

    return createNotification(
      data
    );

  }


  // ===================================================
  // GET NOTIFICATIONS
  // ===================================================

  if (
    action ===
    "getNotifications"
  ) {

    return getNotifications(
      data
    );

  }


  // ===================================================
  // MARK NOTIFICATION AS READ
  // ===================================================

  if (
    action ===
    "markRead"
  ) {

    return markRead(
      data
    );

  }


  // ===================================================
  // DELETE NOTIFICATION
  // ===================================================

  if (
    action ===
    "deleteNotification"
  ) {

    return deleteNotification(
      data
    );

  }


  // ===================================================
  // NO NOTIFICATION ROUTE
  // ===================================================

  return null;

}