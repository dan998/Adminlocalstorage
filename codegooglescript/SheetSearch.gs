// =====================================================
// SHEETSEARCH.GS
// Sheet Search Management
// Registration System API
// =====================================================


// =====================================================
// SEARCH SHEET
// =====================================================

function searchSheet(data) {

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
  // Validate search query
  // ---------------------------------

  if (
    data.query === undefined ||
    data.query === null
  ) {

    return errorResponse(
      "Search query is required"
    );

  }

  const query =
    String(
      data.query
    )
      .trim();

  if (!query) {

    return errorResponse(
      "Search query cannot be empty"
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
  // Check if sheet has data
  // ---------------------------------

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastRow === 0 ||
    lastColumn === 0
  ) {

    return successResponse(

      "No data found",

      {

        sheet:
          sheet.getName(),

        query:
          query,

        results:
          [],

        count:
          0

      }

    );

  }

  // ---------------------------------
  // Read sheet data
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
  // Search options
  // ---------------------------------

  const caseSensitive =
    data.caseSensitive === true;

  const exactMatch =
    data.exactMatch === true;

  // ---------------------------------
  // Prepare search query
  // ---------------------------------

  const searchQuery =
    caseSensitive
      ? query
      : query.toLowerCase();

  // ---------------------------------
  // Headers
  // ---------------------------------

  const headers =
    values[0]
      .map(
        function(header, index) {

          return String(
            header || ""
          ) ||
          "Column" +
          (index + 1);

        }
      );

  // ---------------------------------
  // Search rows
  // ---------------------------------

  const results = [];

  for (
    let rowIndex = 0;
    rowIndex < values.length;
    rowIndex++
  ) {

    const row =
      values[rowIndex];

    let matched =
      false;

    let matchedColumns =
      [];

    for (
      let columnIndex = 0;
      columnIndex < row.length;
      columnIndex++
    ) {

      const originalValue =
        String(
          row[columnIndex] ?? ""
        );

      const searchableValue =
        caseSensitive
          ? originalValue
          : originalValue.toLowerCase();

      let isMatch;

      if (exactMatch) {

        isMatch =
          searchableValue ===
          searchQuery;

      } else {

        isMatch =
          searchableValue.indexOf(
            searchQuery
          ) !== -1;

      }

      if (isMatch) {

        matched =
          true;

        matchedColumns.push({

          column:
            columnIndex + 1,

          columnName:
            headers[columnIndex],

          value:
            row[columnIndex]

        });

      }

    }

    if (!matched) {

      continue;

    }

    // ---------------------------------
    // Convert row to object
    // ---------------------------------

    const rowData = {};

    headers.forEach(
      function(header, index) {

        rowData[header] =
          row[index];

      }
    );

    results.push({

      row:
        rowIndex + 1,

      data:
        rowData,

      values:
        row,

      matches:
        matchedColumns

    });

  }

  // ---------------------------------
  // Return results
  // ---------------------------------

  return successResponse(

    results.length > 0
      ? "Search completed successfully"
      : "No matching records found",

    {

      sheet:
        sheet.getName(),

      query:
        query,

      caseSensitive:
        caseSensitive,

      exactMatch:
        exactMatch,

      results:
        results,

      count:
        results.length

    }

  );

}