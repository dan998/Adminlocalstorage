// =====================================================
// APIEMAILROUTES.GS
// Email API Routes
// Registration System API
// =====================================================


// =====================================================
// EMAIL ROUTER
// =====================================================

function handleEmailRoutes(
  action,
  data
) {

  data = data || {};

  // ===================================================
  // SEND EMAIL
  // ===================================================

  if (
    action === "sendEmail"
  ) {

    return sendEmail(
      data
    );

  }

  // ===================================================
  // SEND VERIFICATION EMAIL
  // ===================================================

  if (
    action ===
    "sendVerificationEmail"
  ) {

    return sendVerificationEmail(
      data.userId
    );

  }

  // ===================================================
  // VERIFY EMAIL TOKEN
  // ===================================================

  if (
    action ===
    "verifyEmail"
  ) {

    return verifyEmail(
      data.token
    );

  }

  // ===================================================
  // RESEND VERIFICATION EMAIL
  // ===================================================

  if (
    action ===
    "resendVerificationEmail"
  ) {

    return resendVerificationEmail(
      data.userId
    );

  }

  // ===================================================
  // SEND PASSWORD RESET EMAIL
  // ===================================================

  if (
    action ===
    "sendPasswordResetEmail"
  ) {

    return sendPasswordResetEmail(
      data.identifier
    );

  }

  // ===================================================
  // SEND LOGIN ALERT EMAIL
  // ===================================================

  if (
    action ===
    "sendLoginAlertEmail"
  ) {

    return sendLoginAlertEmail(
      data.userId
    );

  }

  // ===================================================
  // SEND SECURITY ALERT EMAIL
  // ===================================================

  if (
    action ===
    "sendSecurityAlertEmail"
  ) {

    return sendSecurityAlertEmail(
      data.userId,
      data.message
    );

  }

  // ===================================================
  // SEND WELCOME EMAIL
  // ===================================================

  if (
    action ===
    "sendWelcomeEmail"
  ) {

    return sendWelcomeEmail(
      data.userId
    );

  }

  // ===================================================
  // SEND DEPOSIT EMAIL
  // ===================================================

  if (
    action ===
    "sendDepositEmail"
  ) {

    return sendDepositEmail(
      data.depositId
    );

  }

  // ===================================================
  // SEND WITHDRAWAL EMAIL
  // ===================================================

  if (
    action ===
    "sendWithdrawalEmail"
  ) {

    return sendWithdrawalEmail(
      data.withdrawalId
    );

  }

  // ===================================================
  // SEND ADMIN EMAIL
  // ===================================================

  if (
    action ===
    "sendAdminEmail"
  ) {

    return sendAdminEmail(
      data.subject,
      data.message
    );

  }

  // ===================================================
  // SEND BULK EMAIL
  // ===================================================

  if (
    action ===
    "sendBulkEmail"
  ) {

    return sendBulkEmail(
      data
    );

  }

  // ===================================================
  // EMAIL STATUS
  // ===================================================

  if (
    action ===
    "getEmailStatus"
  ) {

    return getEmailStatus(
      data.emailId
    );

  }

  // ===================================================
  // UNKNOWN ACTION
  // ===================================================

  throw new Error(
    "Unknown email action: " +
    action
  );

}