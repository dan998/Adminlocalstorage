// =====================================================
// SHEETDELETE.GS
// Sheet Deletion
// Cloud Project Platform
// =====================================================


// =====================================================
// DELETE SHEET
// =====================================================

function deleteSheet(data) {

  data = data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.sheetId) {

    return errorResponse(
      "Sheet ID is required"
    );

  }

  const sheetRecord =
    findSheetById(
      data.sheetId
    );

  if (!sheetRecord) {

    return errorResponse(
      "Sheet not found"
    );

  }


  // ===================================================
  // CHECK PROJECT ACCESS
  // ===================================================

  if (
    sheetRecord.projectId
  ) {

    const project =
      findProjectById(
        sheetRecord.projectId
      );

    if (!project) {

      return errorResponse(
        "Project not found"
      );

    }

    const isAdmin =
      String(
        session.role || ""
      ).toLowerCase() ===
      "admin";

    const isOwner =
      String(
        project.ownerId || ""
      ) ===
      String(
        session.userId || ""
      );

    const hasAccess =
      checkProjectAccessInternal(
        sheetRecord.projectId,
        session.userId
      );

    if (
      !isAdmin &&
      !isOwner &&
      !hasAccess
    ) {

      return errorResponse(
        "You do not have permission to delete this sheet"
      );

    }

  }


  // ===================================================
  // GET PHYSICAL SHEET
  // ===================================================

  let spreadsheet;

  try {

    spreadsheet =
      getSpreadsheetForSheet(
        sheetRecord
      );

  } catch (error) {

    return errorResponse(
      "Unable to access spreadsheet: " +
      error.message
    );

  }

  if (!spreadsheet) {

    return errorResponse(
      "Spreadsheet not found"
    );

  }


  // ===================================================
  // FIND PHYSICAL SHEET
  // ===================================================

  const physicalSheet =
    spreadsheet.getSheetByName(
      String(
        sheetRecord.name
      )
    );

  if (!physicalSheet) {

    return errorResponse(
      "Physical sheet not found"
    );

  }


  // ===================================================
  // PROTECT LAST SHEET
  // ===================================================

  const allSheets =
    spreadsheet.getSheets();

  if (
    allSheets.length <= 1
  ) {

    return errorResponse(
      "Cannot delete the last sheet in a spreadsheet"
    );

  }


  // ===================================================
  // DELETE PHYSICAL SHEET
  // ===================================================

  try {

    spreadsheet.deleteSheet(
      physicalSheet
    );

  } catch (error) {

    return errorResponse(
      "Unable to delete sheet: " +
      error.message
    );

  }


  // ===================================================
  // REMOVE SHEET RECORD
  // ===================================================

  try {

    deleteSheetRecord(
      data.sheetId
    );

  } catch (error) {

    return errorResponse(
      "Sheet deleted, but database record could not be removed: " +
      error.message
    );

  }


  // ===================================================
  // DELETE SHEET DATA
  // ===================================================

  try {

    if (
      typeof deleteAllSheetData ===
      "function"
    ) {

      deleteAllSheetData(
        data.sheetId
      );

    }

  } catch (error) {

    // Do not fail the entire operation if
    // separate sheet-data cleanup fails.

    logError(
      "Sheet data cleanup failed: " +
      error.message
    );

  }


  // ===================================================
  // LOG ACTIVITY
  // ===================================================

  try {

    if (
      typeof createLog ===
      "function"
    ) {

      createLog({

        userId:
          session.userId,

        action:
          "DELETE_SHEET",

        targetId:
          data.sheetId,

        targetType:
          "SHEET",

        details:
          "Sheet deleted successfully"

      });

    }

  } catch (error) {

    // Logging failure should not
    // reverse a successful deletion.

  }


  // ===================================================
  // RESPONSE
  // ===================================================

  return successResponse(

    "Sheet deleted successfully",

    {

      sheetId:
        data.sheetId,

      deleted:
        true

    }

  );

}


// =====================================================
// DELETE SHEET RECORD
// Removes the sheet metadata record.
// =====================================================

function deleteSheetRecord(
  sheetId
) {

  if (!sheetId) {

    throw new Error(
      "Sheet ID is required"
    );

  }

  const sheet =
    getSheet(
      SHEETS.SHEETS
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = values.length - 1;
    i >= 1;
    i--
  ) {

    const currentId =
      values[i][0];

    if (
      String(
        currentId
      ) ===
      String(
        sheetId
      )
    ) {

      sheet.deleteRow(
        i + 1
      );

      return true;

    }

  }

  return false;

}