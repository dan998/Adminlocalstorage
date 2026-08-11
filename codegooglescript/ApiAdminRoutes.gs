// =====================================================
// APIADMINROUTES.GS
// Administrator Routes
// =====================================================

function handleAdminRoutes(
  action,
  data
) {

  switch (action) {

    case "createAdmin":

      return createAdmin(data);


    case "getAdmins":

      return getAdmins(data);


    case "updateAdmin":

      return updateAdmin(data);


    case "deleteAdmin":

      return deleteAdmin(data);


    default:

      return null;

  }

}