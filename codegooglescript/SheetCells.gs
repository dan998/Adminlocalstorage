// =====================================================
// SHEETCELLS.GS
// Sheet Cell Management
// Registration System API
// =====================================================


// =====================================================
// UPDATE SHEET CELL
// =====================================================

function updateSheetCell(data) {

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
      "Row is required"
    );

  }

  // ---------------------------------
  // Validate column
  // ---------------------------------

  if (
    data.column === undefined ||
    data.column === null ||
    data.column === ""
  ) {

    return errorResponse(
      "Column is required"
    );

  }

  // ---------------------------------
  // Validate row number
  // ---------------------------------

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
  // Resolve column
  // ---------------------------------

  let column;

  if (
    typeof data.column ===
    "number"
  ) {

    column =
      Number(
        data.column
      );

  } else {

    const columnValue =
      String(
        data.column
      ).trim();

    // ---------------------------------
    // Numeric column
    // ---------------------------------

    if (
      /^\d+$/.test(
        columnValue
      )
    ) {

      column =
        Number(
          columnValue
        );

    }

    // ---------------------------------
    // Letter column
    // Example: A, B, AA
    // ---------------------------------

    else if (
      /^[A-Za-z]+$/.test(
        columnValue
      )
    ) {

      column =
        columnLettersToNumber(
          columnValue
        );

    }

    else {

      return errorResponse(
        "Invalid column"
      );

    }

  }

  if (
    !Number.isInteger(column) ||
    column < 1
  ) {

    return errorResponse(
      "Invalid column number"
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
  // Check maximum dimensions
  // ---------------------------------

  if (
    row >
    sheet.getMaxRows()
  ) {

    return errorResponse(
      "Row is outside the sheet range"
    );

  }

  if (
    column >
    sheet.getMaxColumns()
  ) {

    return errorResponse(
      "Column is outside the sheet range"
    );

  }

  // ---------------------------------
  // Get value
  // ---------------------------------

  let value =
    data.value;

  if (
    value === undefined
  ) {

    value = "";

  }

  // ---------------------------------
  // Prevent objects from being
  // written directly into cells
  // ---------------------------------

  if (
    typeof value ===
      "object" &&
    value !== null
  ) {

    try {

      value =
        JSON.stringify(
          value
        );

    } catch (error) {

      return errorResponse(
        "Invalid cell value"
      );

    }

  }

  // ---------------------------------
  // Update cell
  // ---------------------------------

  const cell =
    sheet.getRange(
      row,
      column
    );

  cell.setValue(
    value
  );

  // ---------------------------------
  // Get A1 notation
  // ---------------------------------

  const a1 =
    cell.getA1Notation();

  // ---------------------------------
  // Return result
  // ---------------------------------

  return successResponse(

    "Sheet cell updated successfully",

    {

      sheet:
        sheet.getName(),

      row:
        row,

      column:
        column,

      cell:
        a1,

      value:
        value

    }

  );

}


// =====================================================
// COLUMN LETTERS TO NUMBER
// =====================================================
//
// A  = 1
// B  = 2
// Z  = 26
// AA = 27
// AB = 28
// =====================================================

function columnLettersToNumber(
  letters
) {

  const value =
    String(
      letters
    )
      .trim()
      .toUpperCase();

  let number = 0;

  for (
    let i = 0;
    i < value.length;
    i++
  ) {

    number =
      number * 26 +
      (
        value.charCodeAt(i) -
        64
      );

  }

  return number;

}