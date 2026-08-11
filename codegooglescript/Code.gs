// =====================================================
// CODE.GS
// Registration System API
// Entry Points Only
// =====================================================


// =====================================================
// DO POST
// =====================================================

function doPost(e) {

  try {

    if (!e) {

      return errorResponse(
        "Invalid request"
      );

    }

    let data = {};

    if (
      e.postData &&
      e.postData.contents
    ) {

      try {

        data =
          JSON.parse(
            e.postData.contents
          );

      } catch (parseError) {

        return errorResponse(
          "Invalid JSON request"
        );

      }

    }

    const security =
      securityCheck(
        data
      );

    if (
      !security.valid
    ) {

      return errorResponse(
        security.message
      );

    }

    data =
      sanitizeObject(
        data
      );

    return routeRequest(
      data
    );

  } catch (error) {

    return handleError(
      error
    );

  }

}


// =====================================================
// DO GET
// =====================================================

function doGet(e) {

  try {

    const params =
      e &&
      e.parameter
        ? e.parameter
        : {};

    if (
      params.action ===
      "status"
    ) {

      return apiHealthCheck();

    }

    return apiHealthCheck();

  } catch (error) {

    return handleError(
      error
    );

  }

}