// =====================================================
// APIAUTHROUTES.GS
// Authentication Routes
// =====================================================

function handleAuthRoutes(
  action,
  data
) {

  switch (action) {

    case "registerUser":

      return registerUser(data);


    case "userLogin":

      return userLogin(data);


    case "adminLogin":

      return adminLogin(data);


    case "verifyEmail":

      return verifyEmail(data);


    case "resendVerification":

      return resendVerification(data);


    case "changePassword":

      return changePassword(data);


    case "forgotPassword":

      return forgotPassword(data);


    case "verifyResetCode":

      return verifyResetCode(data);


    case "resetPassword":

      return resetPassword(data);


    default:

      return null;

  }

}