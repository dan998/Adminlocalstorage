// =====================================================
// SHEETCREATE.GS
// Sheet Creation Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// CREATE SHEET
// =====================================================

function createSheet(data) {

  data = data || {};

  const session =
    requireAuth(
      data.token
    );


  // ===================================================
  // VALIDATE PROJECT
  // ===================================================

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
    );

  if (!project) {

    return errorResponse(
      "Project not found"
    );

  }


  // ===================================================
  // CHECK PROJECT ACCESS
  // ===================================================

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

  if (
    !isAdmin &&
    !isOwner
  ) {

    return errorResponse(
      "You do not have permission to create sheets in this project"
    );

  }


  // ===================================================
  // VALIDATE NAME
  // ===================================================

  if (!data.name) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  const name =
    sanitizeInput(
      String(
        data.name
      ).trim()
    );

  if (!name) {

    return errorResponse(
      "Sheet name cannot be empty"
    );

  }

  if (
    name.length > 100
  ) {

    return errorResponse(
      "Sheet name cannot exceed 100 characters"
    );

  }


  // ===================================================
  // CHECK DUPLICATE
  // ===================================================

  const existing =
    findSheetByName(
      data.projectId,
      name
    );

  if (existing) {

    return errorResponse(
      "A sheet with this name already exists in this project"
    );

  }


  // ===================================================
  // GET SPREADSHEET
  // ===================================================

  let spreadsheet;

  try {

    spreadsheet =
      getSpreadsheetForProject(
        data.projectId
      );

  } catch (error) {

    return errorResponse(
      "Unable to locate project spreadsheet: " +
      error.message
    );

  }

  if (!spreadsheet) {

    return errorResponse(
      "Project spreadsheet not found"
    );

  }


  // ===================================================
  // CREATE PHYSICAL SHEET
  // ===================================================

  let physicalSheet;

  try {

    physicalSheet =
      spreadsheet.insertSheet(
        name
      );

  } catch (error) {

    return errorResponse(
      "Unable to create sheet: " +
      error.message
    );

  }


  // ===================================================
  // GENERATE DATABASE RECORD
  // ===================================================

  const id =
    generateID(
      "SHT"
    );

  const now =
    new Date();

  const description =
    data.description !== undefined
      ? sanitizeInput(
          String(
            data.description
          )
        )
      : "";

  const visibility =
    data.visibility
      ? sanitizeInput(
          String(
            data.visibility
          )
        )
      : "Private";

  const status =
    "Active";


  // ===================================================
  // SAVE SHEET RECORD
  // ===================================================

  try {

    const databaseSheet =
      getSheet(
        SHEETS.SHEETS
      );

    databaseSheet.appendRow([

      id,

      data.projectId,

      name,

      description,

      session.userId,

      spreadsheet.getId(),

      status,

      visibility,

      now,

      now,

      session.userId,

      now

    ]);

  } catch (error) {

    // -----------------------------------------------
    // Roll back physical sheet if database save fails
    // -----------------------------------------------

    try {

      spreadsheet.deleteSheet(
        physicalSheet
      );

    } catch (rollbackError) {

      // Ignore rollback failure.
    }

    return errorResponse(
      "Sheet was created but could not be registered: " +
      error.message
    );

  }


  // ===================================================
  // CREATE OPTIONAL HEADERS
  // ===================================================

  if (
    Array.isArray(
      data.columns
    ) &&
    data.columns.length > 0
  ) {

    try {

      const headers =
        data.columns.map(
          function(column) {

            return sanitizeInput(
              String(
                column
              )
            );

          }
        );

      physicalSheet
        .getRange(
          1,
          1,
          1,
          headers.length
        )
        .setValues([
          headers
        ]);

    } catch (error) {

      // Sheet remains valid even if
      // optional headers fail.

    }

  }


  // ===================================================
  // CREATE OPTIONAL INITIAL ROWS
  // ===================================================

  if (
    Array.isArray(
      data.rows
    ) &&
    data.rows.length > 0
  ) {

    try {

      const rows =
        data.rows;

      if (
        rows.every(
          function(row) {

            return Array.isArray(
              row
            );

          }
        )
      ) {

        const columnCount =
          Math.max(
            rows.reduce(
              function(max, row) {

                return Math.max(
                  max,
                  row.length
                );

              },
              0
            ),
            1
          );

        const normalizedRows =
          rows.map(
            function(row) {

              const result =
                [];

              for (
                let i = 0;
                i < columnCount;
                i++
              ) {

                result.push(
                  row[i] !== undefined
                    ? row[i]
                    : ""
                );

              }

              return result;

            }
          );

        physicalSheet
          .getRange(
            2,
            1,
            normalizedRows.length,
            columnCount
          )
          .setValues(
            normalizedRows
          );

      }

    } catch (error) {

      // Optional initial data failure
      // does not invalidate the sheet.

    }

  }


  // ===================================================
  // LOG CREATION
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
          "CREATE_SHEET",

        targetId:
          id,

        targetType:
          "SHEET",

        details:
          "Sheet created successfully"

      });

    }

  } catch (error) {

    // Logging failure should not
    // cancel successful creation.

  }


  // ===================================================
  // RETURN RESULT
  // ===================================================

  return successResponse(

    "Sheet created successfully",

    {

      sheet: {

        id:
          id,

        projectId:
          data.projectId,

        name:
          name,

        description:
          description,

        ownerId:
          session.userId,

        spreadsheetId:
          spreadsheet.getId(),

        status:
          status,

        visibility:
          visibility,

        createdAt:
          now,

        updatedAt:
          now

      }

    }

  );

}


// =====================================================
// CREATE SHEET FROM TEMPLATE
// =====================================================

function createSheetFromTemplate(
  data
) {

  data = data || {};

  const session =
    requireAuth(
      data.token
    );

  if (!data.projectId) {

    return errorResponse(
      "Project ID is required"
    );

  }

  if (!data.name) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  if (!data.templateSheetId) {

    return errorResponse(
      "Template sheet ID is required"
    );

  }

  const project =
    findProjectById(
      data.projectId
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

  if (
    !isAdmin &&
    !isOwner
  ) {

    return errorResponse(
      "You do not have permission to create sheets in this project"
    );

  }

  const template =
    findSheetById(
      data.templateSheetId
    );

  if (!template) {

    return errorResponse(
      "Template sheet not found"
    );

  }

  if (
    String(
      template.projectId
    ) !==
    String(
      data.projectId
    )
  ) {

    return errorResponse(
      "Template sheet does not belong to this project"
    );

  }

  const existing =
    findSheetByName(
      data.projectId,
      data.name
    );

  if (existing) {

    return errorResponse(
      "A sheet with this name already exists"
    );

  }

  let spreadsheet;

  try {

    spreadsheet =
      getSpreadsheetForProject(
        data.projectId
      );

  } catch (error) {

    return errorResponse(
      error.message
    );

  }

  if (!spreadsheet) {

    return errorResponse(
      "Project spreadsheet not found"
    );

  }

  let templateSheet;

  try {

    templateSheet =
      getPhysicalSheet(
        template
      );

  } catch (error) {

    return errorResponse(
      error.message
    );

  }

  if (!templateSheet) {

    return errorResponse(
      "Physical template sheet not found"
    );

  }

  let newSheet;

  try {

    newSheet =
      templateSheet.copyTo(
        spreadsheet
      );

    newSheet.setName(
      sanitizeInput(
        String(
          data.name
        ).trim()
      )
    );

  } catch (error) {

    return errorResponse(
      "Unable to copy template sheet: " +
      error.message
    );

  }


  // ===================================================
  // REGISTER NEW SHEET
  // ===================================================

  const id =
    generateID(
      "SHT"
    );

  const now =
    new Date();

  const description =
    data.description !== undefined
      ? sanitizeInput(
          String(
            data.description
          )
        )
      : "";

  const visibility =
    data.visibility
      ? sanitizeInput(
          String(
            data.visibility
          )
        )
      : "Private";

  try {

    const databaseSheet =
      getSheet(
        SHEETS.SHEETS
      );

    databaseSheet.appendRow([

      id,

      data.projectId,

      newSheet.getName(),

      description,

      session.userId,

      spreadsheet.getId(),

      "Active",

      visibility,

      now,

      now,

      session.userId,

      now

    ]);

  } catch (error) {

    try {

      spreadsheet.deleteSheet(
        newSheet
      );

    } catch (rollbackError) {

      // Ignore rollback failure.
    }

    return errorResponse(
      "Template copied but database registration failed: " +
      error.message
    );

  }


  return successResponse(

    "Sheet created from template successfully",

    {

      sheet: {

        id:
          id,

        projectId:
          data.projectId,

        name:
          newSheet.getName(),

        description:
          description,

        ownerId:
          session.userId,

        spreadsheetId:
          spreadsheet.getId(),

        status:
          "Active",

        visibility:
          visibility,

        createdAt:
          now,

        updatedAt:
          now

      }

    }

  );

}