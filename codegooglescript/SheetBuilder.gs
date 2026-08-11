// =====================================================
// SHEETBUILDER.GS
// Dynamic Sheet Builder
// Registration System API
// =====================================================


// =====================================================
// CREATE DYNAMIC SHEET
// =====================================================

function createDynamicSheet(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  // ---------------------------------
  // Validate sheet name
  // ---------------------------------

  if (!data.name) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  const sheetName =
    String(
      data.name
    )
      .trim();

  if (!sheetName) {

    return errorResponse(
      "Sheet name cannot be empty"
    );

  }

  if (sheetName.length > 100) {

    return errorResponse(
      "Sheet name is too long"
    );

  }

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  // ---------------------------------
  // Check existing sheet
  // ---------------------------------

  const existing =
    spreadsheet
      .getSheetByName(
        sheetName
      );

  if (existing) {

    return errorResponse(
      "A sheet with this name already exists"
    );

  }

  // ---------------------------------
  // Create sheet
  // ---------------------------------

  const sheet =
    spreadsheet
      .insertSheet(
        sheetName
      );

  // ---------------------------------
  // Optional columns
  // ---------------------------------

  let columns =
    data.columns;

  if (
    typeof columns === "string"
  ) {

    try {

      columns =
        JSON.parse(
          columns
        );

    } catch (error) {

      columns =
        columns
          .split(",")
          .map(
            function(column) {

              return column.trim();

            }
          )
          .filter(
            function(column) {

              return column !== "";

            }
          );

    }

  }

  if (
    Array.isArray(columns) &&
    columns.length > 0
  ) {

    const cleanedColumns = [];

    for (
      let i = 0;
      i < columns.length;
      i++
    ) {

      const column =
        String(
          columns[i]
        )
          .trim();

      if (
        column &&
        cleanedColumns.indexOf(
          column
        ) === -1
      ) {

        cleanedColumns.push(
          column
        );

      }

    }

    if (
      cleanedColumns.length > 0
    ) {

      sheet
        .getRange(
          1,
          1,
          1,
          cleanedColumns.length
        )
        .setValues([
          cleanedColumns
        ]);

    }

  }

  return successResponse(

    "Dynamic sheet created successfully",

    {

      sheet: {

        name:
          sheet.getName(),

        sheetId:
          sheet.getSheetId(),

        index:
          sheet.getIndex(),

        maxRows:
          sheet.getMaxRows(),

        maxColumns:
          sheet.getMaxColumns(),

        createdAt:
          new Date()

      }

    }

  );

}


// =====================================================
// ADD COLUMNS
// =====================================================

function addColumns(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  // ---------------------------------
  // Validate sheet
  // ---------------------------------

  if (!data.sheet) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  // ---------------------------------
  // Validate columns
  // ---------------------------------

  let columns =
    data.columns;

  if (
    typeof columns === "string"
  ) {

    try {

      columns =
        JSON.parse(
          columns
        );

    } catch (error) {

      columns =
        columns
          .split(",")
          .map(
            function(column) {

              return column.trim();

            }
          )
          .filter(
            function(column) {

              return column !== "";

            }
          );

    }

  }

  if (
    !Array.isArray(columns) ||
    columns.length === 0
  ) {

    return errorResponse(
      "At least one column is required"
    );

  }

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    spreadsheet
      .getSheetByName(
        String(
          data.sheet
        ).trim()
      );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  // ---------------------------------
  // Clean column names
  // ---------------------------------

  const cleanedColumns = [];

  for (
    let i = 0;
    i < columns.length;
    i++
  ) {

    const column =
      String(
        columns[i]
      )
        .trim();

    if (
      !column
    ) {

      continue;

    }

    if (
      cleanedColumns.indexOf(
        column
      ) !== -1
    ) {

      continue;

    }

    cleanedColumns.push(
      column
    );

  }

  if (
    cleanedColumns.length === 0
  ) {

    return errorResponse(
      "No valid columns were provided"
    );

  }

  // ---------------------------------
  // Determine starting column
  // ---------------------------------

  const currentColumns =
    sheet.getMaxColumns();

  const requiredColumns =
    cleanedColumns.length;

  // ---------------------------------
  // Add physical columns
  // ---------------------------------

  sheet.insertColumnsAfter(
    currentColumns,
    requiredColumns
  );

  // ---------------------------------
  // Determine header position
  // ---------------------------------

  const lastColumnBefore =
    sheet.getLastColumn();

  let startColumn =
    lastColumnBefore + 1;

  if (
    lastColumnBefore === 0
  ) {

    startColumn =
      1;

  }

  // ---------------------------------
  // Write headers
  // ---------------------------------

  sheet
    .getRange(
      1,
      startColumn,
      1,
      cleanedColumns.length
    )
    .setValues([
      cleanedColumns
    ]);

  return successResponse(

    "Columns added successfully",

    {

      sheet:
        sheet.getName(),

      columns:
        cleanedColumns,

      count:
        cleanedColumns.length

    }

  );

}


// =====================================================
// DELETE SHEET
// =====================================================

function deleteSheet(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  // ---------------------------------
  // Validate sheet
  // ---------------------------------

  if (!data.sheet) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  const sheetName =
    String(
      data.sheet
    )
      .trim();

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    spreadsheet
      .getSheetByName(
        sheetName
      );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  // ---------------------------------
  // Prevent deleting last sheet
  // ---------------------------------

  const sheets =
    spreadsheet.getSheets();

  if (
    sheets.length <= 1
  ) {

    return errorResponse(
      "Cannot delete the last sheet in the spreadsheet"
    );

  }

  // ---------------------------------
  // Prevent accidental system sheet
  // ---------------------------------

  if (
    typeof isProtectedSystemSheet ===
    "function"
  ) {

    if (
      isProtectedSystemSheet(
        sheetName
      )
    ) {

      return errorResponse(
        "This is a protected system sheet"
      );

    }

  }

  // ---------------------------------
  // Delete sheet
  // ---------------------------------

  spreadsheet.deleteSheet(
    sheet
  );

  return successResponse(

    "Sheet deleted successfully",

    {

      sheet:
        sheetName

    }

  );

}


// =====================================================
// RENAME SHEET
// =====================================================

function renameSheet(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  // ---------------------------------
  // Validate current name
  // ---------------------------------

  if (!data.sheet) {

    return errorResponse(
      "Current sheet name is required"
    );

  }

  // ---------------------------------
  // Validate new name
  // ---------------------------------

  if (!data.newName) {

    return errorResponse(
      "New sheet name is required"
    );

  }

  const currentName =
    String(
      data.sheet
    )
      .trim();

  const newName =
    String(
      data.newName
    )
      .trim();

  if (!newName) {

    return errorResponse(
      "New sheet name cannot be empty"
    );

  }

  if (newName.length > 100) {

    return errorResponse(
      "New sheet name is too long"
    );

  }

  // ---------------------------------
  // Prevent invalid characters
  // ---------------------------------

  if (
    /[\\\/\?\*\[\]:]/.test(
      newName
    )
  ) {

    return errorResponse(
      "New sheet name contains invalid characters"
    );

  }

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    spreadsheet
      .getSheetByName(
        currentName
      );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  // ---------------------------------
  // Check duplicate name
  // ---------------------------------

  const existing =
    spreadsheet
      .getSheetByName(
        newName
      );

  if (
    existing &&
    existing.getSheetId() !==
    sheet.getSheetId()
  ) {

    return errorResponse(
      "A sheet with the new name already exists"
    );

  }

  // ---------------------------------
  // Protected system sheet
  // ---------------------------------

  if (
    typeof isProtectedSystemSheet ===
    "function"
  ) {

    if (
      isProtectedSystemSheet(
        currentName
      )
    ) {

      return errorResponse(
        "This is a protected system sheet"
      );

    }

  }

  // ---------------------------------
  // Rename sheet
  // ---------------------------------

  sheet.setName(
    newName
  );

  return successResponse(

    "Sheet renamed successfully",

    {

      oldName:
        currentName,

      newName:
        newName,

      sheetId:
        sheet.getSheetId()

    }

  );

}