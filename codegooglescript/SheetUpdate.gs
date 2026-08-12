// =====================================================
// SHEETUPDATE.GS
// Sheet Update Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// UPDATE SHEET
// =====================================================

function updateSheet(data) {

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


  // ===================================================
  // FIND SHEET
  // ===================================================

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
  // PROJECT ACCESS
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
        "You do not have permission to update this sheet"
      );

    }

  }


  // ===================================================
  // VALIDATE UPDATE DATA
  // ===================================================

  if (
    data.name !== undefined &&
    !String(
      data.name
    ).trim()
  ) {

    return errorResponse(
      "Sheet name cannot be empty"
    );

  }


  // ===================================================
  // GET DATABASE SHEET
  // ===================================================

  const databaseSheet =
    getSheet(
      SHEETS.SHEETS
    );

  const rowNumber =
    sheetRecord.row;


  // ===================================================
  // UPDATE NAME
  // ===================================================

  if (
    data.name !== undefined
  ) {

    const newName =
      sanitizeInput(
        String(
          data.name
        ).trim()
      );

    // -----------------------------------------------
    // Check duplicate sheet name
    // -----------------------------------------------

    const existing =
      findSheetByName(
        sheetRecord.projectId,
        newName
      );

    if (
      existing &&
      String(
        existing.id
      ) !==
      String(
        data.sheetId
      )
    ) {

      return errorResponse(
        "A sheet with this name already exists"
      );

    }


    // -----------------------------------------------
    // Update database record
    // -----------------------------------------------

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.NAME
      )
      .setValue(
        newName
      );


    // -----------------------------------------------
    // Update physical Google Sheet
    // -----------------------------------------------

    try {

      const spreadsheet =
        getSpreadsheetForSheet(
          sheetRecord
        );

      if (
        spreadsheet
      ) {

        const physicalSheet =
          spreadsheet.getSheetByName(
            String(
              sheetRecord.name
            )
          );

        if (
          physicalSheet
        ) {

          physicalSheet.setName(
            newName
          );

        }

      }

    } catch (error) {

      return errorResponse(
        "Sheet record updated, but physical sheet could not be renamed: " +
        error.message
      );

    }

  }


  // ===================================================
  // UPDATE DESCRIPTION
  // ===================================================

  if (
    data.description !== undefined
  ) {

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.DESCRIPTION
      )
      .setValue(
        sanitizeInput(
          data.description
        )
      );

  }


  // ===================================================
  // UPDATE STATUS
  // ===================================================

  if (
    data.status !== undefined
  ) {

    const status =
      sanitizeInput(
        data.status
      );

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.STATUS
      )
      .setValue(
        status
      );

  }


  // ===================================================
  // UPDATE VISIBILITY
  // ===================================================

  if (
    data.visibility !== undefined
  ) {

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.VISIBILITY
      )
      .setValue(
        sanitizeInput(
          data.visibility
        )
      );

  }


  // ===================================================
  // UPDATE UPDATED BY / DATE
  // ===================================================

  if (
    SHEET_COLUMNS.UPDATED_BY
  ) {

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.UPDATED_BY
      )
      .setValue(
        session.userId
      );

  }

  if (
    SHEET_COLUMNS.UPDATED_AT
  ) {

    databaseSheet
      .getRange(
        rowNumber,
        SHEET_COLUMNS.UPDATED_AT
      )
      .setValue(
        new Date()
      );

  }


  // ===================================================
  // LOG UPDATE
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
          "UPDATE_SHEET",

        targetId:
          data.sheetId,

        targetType:
          "SHEET",

        details:
          "Sheet information updated"

      });

    }

  } catch (error) {

    // Logging failure should not
    // cancel the update.

  }


  // ===================================================
  // RETURN UPDATED SHEET
  // ===================================================

  const updatedSheet =
    findSheetById(
      data.sheetId
    );

  return successResponse(

    "Sheet updated successfully",

    {

      sheet:
        updatedSheet

    }

  );

}


// =====================================================
// UPDATE SHEET STATUS
// =====================================================

function updateSheetStatus(
  data
) {

  data =
    data || {};

  if (!data.sheetId) {

    return errorResponse(
      "Sheet ID is required"
    );

  }

  if (!data.status) {

    return errorResponse(
      "Sheet status is required"
    );

  }

  return updateSheet({

    token:
      data.token,

    sheetId:
      data.sheetId,

    status:
      data.status

  });

}


// =====================================================
// UPDATE SHEET DESCRIPTION
// =====================================================

function updateSheetDescription(
  data
) {

  data =
    data || {};

  if (!data.sheetId) {

    return errorResponse(
      "Sheet ID is required"
    );

  }

  return updateSheet({

    token:
      data.token,

    sheetId:
      data.sheetId,

    description:
      data.description || ""

  });

}


// =====================================================
// RENAME SHEET
// =====================================================

function renameSheet(
  data
) {

  data =
    data || {};

  if (!data.sheetId) {

    return errorResponse(
      "Sheet ID is required"
    );

  }

  if (!data.name) {

    return errorResponse(
      "New sheet name is required"
    );

  }

  return updateSheet({

    token:
      data.token,

    sheetId:
      data.sheetId,

    name:
      data.name

  });

}