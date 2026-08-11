// =====================================================
// SHEETROWS.GS
// Sheet Row Management
// Registration System API
// =====================================================


// =====================================================
// ADD SHEET ROW
// =====================================================

function addSheetRow(data) {

  data =
    data || {};

  // ---------------------------------
  // Authentication
  // ---------------------------------

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
  // Validate row data
  // ---------------------------------

  if (
    data.values === undefined ||
    data.values === null
  ) {

    return errorResponse(
      "Row values are required"
    );

  }

  if (
    !Array.isArray(
      data.values
    )
  ) {

    return errorResponse(
      "Row values must be an array"
    );

  }

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  // ---------------------------------
  // Get sheet
  // ---------------------------------

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
  // Prevent empty rows
  // ---------------------------------

  if (
    data.values.length === 0
  ) {

    return errorResponse(
      "Row cannot be empty"
    );

  }

  // ---------------------------------
  // Prepare values
  // ---------------------------------

  const values =
    data.values.map(
      function(value) {

        if (
          typeof value ===
            "object" &&
          value !== null
        ) {

          try {

            return JSON.stringify(
              value
            );

          } catch (error) {

            return "";

          }

        }

        return value;

      }
    );

  // ---------------------------------
  // Determine next row
  // ---------------------------------

  const nextRow =
    sheet.getLastRow() + 1;

  // ---------------------------------
  // Check column capacity
  // ---------------------------------

  if (
    values.length >
    sheet.getMaxColumns()
  ) {

    return errorResponse(
      "Row contains more values than the sheet supports"
    );

  }

  // ---------------------------------
  // Add row
  // ---------------------------------

  sheet
    .getRange(
      nextRow,
      1,
      1,
      values.length
    )
    .setValues([
      values
    ]);

  // ---------------------------------
  // Return result
  // ---------------------------------

  return successResponse(

    "Sheet row added successfully",

    {

      sheet:
        sheet.getName(),

      row:
        nextRow,

      values:
        values,

      cellRange:
        sheet
          .getRange(
            nextRow,
            1,
            1,
            values.length
          )
          .getA1Notation()

    }

  );

}


// =====================================================
// DELETE SHEET ROW
// =====================================================

function deleteSheetRow(data) {

  data =
    data || {};

  // ---------------------------------
  // Authentication
  // ---------------------------------

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
  // Validate row
  // ---------------------------------

  if (
    data.row === undefined ||
    data.row === null ||
    data.row === ""
  ) {

    return errorResponse(
      "Row number is required"
    );

  }

  const row =
    Number(
      data.row
    );

  if (
    !Number.isInteger(row) ||
    row < 1
  ) {

    return errorResponse(
      "Invalid row number"
    );

  }

  // ---------------------------------
  // Get spreadsheet
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  // ---------------------------------
  // Get sheet
  // ---------------------------------

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
  // Prevent deleting outside range
  // ---------------------------------

  if (
    row >
    sheet.getMaxRows()
  ) {

    return errorResponse(
      "Row is outside the sheet range"
    );

  }

  // ---------------------------------
  // Optional protection:
  // Do not allow deletion of header
  // row unless explicitly requested.
  // ---------------------------------

  if (
    row === 1 &&
    data.allowHeaderDelete !== true
  ) {

    return errorResponse(
      "Header row cannot be deleted"
    );

  }

  // ---------------------------------
  // Capture row before deletion
  // ---------------------------------

  let previousValues = [];

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastColumn > 0
  ) {

    previousValues =
      sheet
        .getRange(
          row,
          1,
          1,
          lastColumn
        )
        .getValues()[0];

  }

  // ---------------------------------
  // Delete row
  // ---------------------------------

  sheet.deleteRow(
    row
  );

  // ---------------------------------
  // Return result
  // ---------------------------------

  return successResponse(

    "Sheet row deleted successfully",

    {

      sheet:
        sheet.getName(),

      row:
        row,

      deletedValues:
        previousValues

    }

  );

}