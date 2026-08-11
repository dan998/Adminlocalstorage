// =====================================================
// SHEETDATA.GS
// Sheet Data Management
// Registration System API
// =====================================================


// =====================================================
// CREATE SHEET
// =====================================================

function createSheet(data) {

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
  // Validate sheet name
  // ---------------------------------

  const name =
    data.name
      ? sanitizeInput(
          data.name
        )
      : "";

  if (!name) {

    return errorResponse(
      "Sheet name is required"
    );

  }

  // ---------------------------------
  // Check if sheet already exists
  // ---------------------------------

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const existing =
    spreadsheet
      .getSheetByName(
        name
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
        name
      );

  // ---------------------------------
  // Optional headers
  // ---------------------------------

  let headers = [];

  if (
    Array.isArray(
      data.columns
    )
  ) {

    headers =
      data.columns
        .map(function(column) {

          return sanitizeInput(
            column
          );

        })
        .filter(function(column) {

          return column !== "";

        });

  }

  if (
    headers.length > 0
  ) {

    sheet
      .getRange(
        1,
        1,
        1,
        headers.length
      )
      .setValues([
        headers
      ]);

  }

  // ---------------------------------
  // Return result
  // ---------------------------------

  return successResponse(

    "Sheet created successfully",

    {

      sheet: {

        name:
          sheet.getName(),

        id:
          sheet.getSheetId(),

        index:
          sheet.getIndex(),

        maxRows:
          sheet.getMaxRows(),

        maxColumns:
          sheet.getMaxColumns(),

        columns:
          headers

      }

    }

  );

}


// =====================================================
// GET SHEETS
// =====================================================

function getSheets(data) {

  data =
    data || {};

  const session =
    requireAuth(
      data.token
    );

  const spreadsheet =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheets =
    spreadsheet
      .getSheets();

  const result = [];

  sheets.forEach(
    function(sheet) {

      result.push({

        name:
          sheet.getName(),

        id:
          sheet.getSheetId(),

        index:
          sheet.getIndex(),

        lastRow:
          sheet.getLastRow(),

        lastColumn:
          sheet.getLastColumn(),

        maxRows:
          sheet.getMaxRows(),

        maxColumns:
          sheet.getMaxColumns(),

        frozenRows:
          sheet.getFrozenRows(),

        frozenColumns:
          sheet.getFrozenColumns()

      });

    }
  );

  return successResponse(

    "Sheets retrieved successfully",

    {

      sheets:
        result,

      count:
        result.length

    }

  );

}


// =====================================================
// GET SHEET DATA
// =====================================================

function getSheetData(data) {

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
    sanitizeInput(
      data.sheet
    );

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
  // Get dimensions
  // ---------------------------------

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  // ---------------------------------
  // Empty sheet
  // ---------------------------------

  if (
    lastRow === 0 ||
    lastColumn === 0
  ) {

    return successResponse(

      "Sheet is empty",

      {

        sheet:
          sheetName,

        headers:
          [],

        rows:
          [],

        data:
          [],

        rowCount:
          0,

        columnCount:
          0

      }

    );

  }

  // ---------------------------------
  // Read all values
  // ---------------------------------

  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();

  // ---------------------------------
  // Headers
  // ---------------------------------

  const headers =
    values[0]
      .map(function(header) {

        return String(
          header || ""
        );

      });

  // ---------------------------------
  // Data rows
  // ---------------------------------

  const rows =
    values
      .slice(1);

  // ---------------------------------
  // Convert rows to objects
  // ---------------------------------

  const dataRows =
    rows.map(
      function(row) {

        const object = {};

        headers.forEach(
          function(header, index) {

            const key =
              header ||
              "Column" +
              (index + 1);

            object[key] =
              row[index];

          }
        );

        return object;

      }
    );

  // ---------------------------------
  // Return result
  // ---------------------------------

  return successResponse(

    "Sheet data retrieved successfully",

    {

      sheet:
        sheetName,

      headers:
        headers,

      rows:
        rows,

      data:
        dataRows,

      rowCount:
        rows.length,

      columnCount:
        headers.length

    }

  );

}