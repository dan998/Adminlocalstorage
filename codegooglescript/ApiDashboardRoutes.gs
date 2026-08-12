// =====================================================
// APIDASHBOARDROUTES.GS
// Dashboard API Routes
// Cloud Project Platform
// =====================================================


// =====================================================
// HANDLE DASHBOARD ROUTES
// =====================================================

function handleDashboardRoutes(
  action,
  data
) {

  action =
    String(
      action || ""
    ).trim();

  data =
    data || {};


// =====================================================
// DASHBOARD STATISTICS
// =====================================================

  switch (action) {

    case "getDashboardStatistics":

      return getDashboardStatistics(
        data
      );


    case "getStatistics":

      return getDashboardStatistics(
        data
      );


// =====================================================
// DASHBOARD USERS
// =====================================================

    case "getDashboardUsers":

      return getDashboardUsers(
        data
      );


    case "getUserStatistics":

      return getDashboardUsers(
        data
      );


// =====================================================
// DASHBOARD PROJECTS
// =====================================================

    case "getDashboardProjects":

      return getDashboardProjects(
        data
      );


    case "getProjectStatistics":

      return getDashboardProjects(
        data
      );


// =====================================================
// DASHBOARD FILES
// =====================================================

    case "getDashboardFiles":

      return getDashboardFiles(
        data
      );


    case "getFileStatistics":

      return getDashboardFiles(
        data
      );


// =====================================================
// DASHBOARD STORAGE
// =====================================================

    case "getDashboardStorage":

      return getDashboardStorage(
        data
      );


    case "getStorageStatistics":

      return getDashboardStorage(
        data
      );


// =====================================================
// DASHBOARD ACTIVITY
// =====================================================

    case "getDashboardActivity":

      return getDashboardActivity(
        data
      );


    case "getRecentActivity":

      return getDashboardActivity(
        data
      );


// =====================================================
// DASHBOARD SYSTEM
// =====================================================

    case "getDashboardSystem":

      return getDashboardSystem(
        data
      );


    case "getSystemStatus":

      return getDashboardSystem(
        data
      );


// =====================================================
// DASHBOARD OVERVIEW
// =====================================================

    case "getDashboard":

      return getDashboard(
        data
      );


    case "getDashboardOverview":

      return getDashboard(
        data
      );


// =====================================================
// NO DASHBOARD ROUTE
// =====================================================

    default:

      return null;

  }

}