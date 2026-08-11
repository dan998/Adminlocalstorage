// =====================================================
// SHEETEXPORT.GS
// Sheet Export Management
// Registration System API
// =====================================================


// =====================================================
// EXPORT SHEET
// =====================================================

function exportSheet(data) {

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
  // Export format
  // ---------------------------------

  const format =
    String(
      data.format || "csv"
    )
      .trim()
      .toLowerCase();

  const allowedFormats = [
    "csv",
    "xlsx",
    "pdf"
  ];

  if (
    allowedFormats.indexOf(
      format
    ) === -1
  ) {

    return errorResponse(
      "Invalid export format. Supported formats: csv, xlsx, pdf"
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
  // Check sheet data
  // ---------------------------------

  const lastRow =
    sheet.getLastRow();

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastRow === 0 ||
    lastColumn === 0
  ) {

    return errorResponse(
      "Sheet contains no data"
    );

  }

  // ---------------------------------
  // Generate filename
  // ---------------------------------

  const requestedName =
    data.filename
      ? String(
          data.filename
        ).trim()
      : sheet.getName();

  const safeName =
    requestedName
      .replace(
        /[\\/:*?"<>|#%&{}$!'@+=`]/g,
        "_"
      );

  // ---------------------------------
  // CSV EXPORT
  // ---------------------------------

  if (format === "csv") {

    return exportSheetCSV(
      spreadsheet,
      sheet,
      safeName
    );

  }

  // ---------------------------------
  // XLSX EXPORT
  // ---------------------------------

  if (format === "xlsx") {

    return exportSheetXLSX(
      spreadsheet,
      sheet,
      safeName
    );

  }

  // ---------------------------------
  // PDF EXPORT
  // ---------------------------------

  if (format === "pdf") {

    return exportSheetPDF(
      spreadsheet,
      sheet,
      safeName
    );

  }

  return errorResponse(
    "Unsupported export format"
  );

}


// =====================================================
// EXPORT CSV
// =====================================================

function exportSheetCSV(
  spreadsheet,
  sheet,
  filename
) {

  const values =
    sheet
      .getDataRange()
      .getDisplayValues();

  const csvRows = [];

  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    const row =
      values[i]
        .map(
          function(value) {

            return csvEscape(
              value
            );

          }
        );

    csvRows.push(
      row.join(",")
    );

  }

  const csv =
    csvRows.join("\r\n");

  const blob =
    Utilities
      .newBlob(
        csv,
        "text/csv",
        filename + ".csv"
      );

  const file =
    DriveApp
      .createFile(
        blob
      );

  return successResponse(

    "Sheet exported successfully",

    {

      format:
        "csv",

      filename:
        file.getName(),

      fileId:
        file.getId(),

      url:
        file.getUrl(),

      mimeType:
        "text/csv"

    }

  );

}


// =====================================================
// CSV ESCAPE
// =====================================================

function csvEscape(
  value
) {

  const text =
    String(
      value ?? ""
    );

  if (
    text.indexOf(",") !== -1 ||
    text.indexOf('"') !== -1 ||
    text.indexOf("\n") !== -1 ||
    text.indexOf("\r") !== -1
  ) {

    return '"' +
      text.replace(
        /"/g,
        '""'
      ) +
      '"';

  }

  return text;

}


// =====================================================
// EXPORT XLSX
// =====================================================

function exportSheetXLSX(
  spreadsheet,
  sheet,
  filename
) {

  const spreadsheetId =
    spreadsheet.getId();

  const sheetId =
    sheet.getSheetId();

  const url =
    "https://docs.google.com/spreadsheets/d/" +
    spreadsheetId +
    "/export?format=xlsx" +
    "&gid=" +
    sheetId;

  const response =
    UrlFetchApp.fetch(
      url,
      {

        method:
          "get",

        headers: {

          Authorization:
            "Bearer " +
            ScriptApp
              .getOAuthToken()

        },

        muteHttpExceptions:
          true

      }
    );

  const responseCode =
    response.getResponseCode();

  if (
    responseCode !== 200
  ) {

    return errorResponse(
      "Failed to export sheet as XLSX"
    );

  }

  const blob =
    response
      .getBlob()
      .setName(
        filename + ".xlsx"
      );

  const file =
    DriveApp
      .createFile(
        blob
      );

  return successResponse(

    "Sheet exported successfully",

    {

      format:
        "xlsx",

      filename:
        file.getName(),

      fileId:
        file.getId(),

      url:
        file.getUrl(),

      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    }

  );

}


// =====================================================
// EXPORT PDF
// =====================================================

function exportSheetPDF(
  spreadsheet,
  sheet,
  filename
) {

  const spreadsheetId =
    spreadsheet.getId();

  const sheetId =
    sheet.getSheetId();

  const exportUrl =
    "https://docs.google.com/spreadsheets/d/" +
    spreadsheetId +
    "/export" +

    "?format=pdf" +

    "&gid=" +
    sheetId +

    "&size=A4" +

    "&portrait=true" +

    "&fitw=true" +

    "&sheetnames=false" +

    "&printtitle=false" +

    "&pagenumbers=true" +

    "&gridlines=true" +

    "&fzr=false";

  const response =
    UrlFetchApp.fetch(
      exportUrl,
      {

        method:
          "get",

        headers: {

          Authorization:
            "Bearer " +
            ScriptApp
              .getOAuthToken()

        },

        muteHttpExceptions:
          true

      }
    );

  const responseCode =
    response.getResponseCode();

  if (
    responseCode !== 200
  ) {

    return errorResponse(
      "Failed to export sheet as PDF"
    );

  }

  const blob =
    response
      .getBlob()
      .setName(
        filename + ".pdf"
      );

  const file =
    DriveApp
      .createFile(
        blob
      );

  return successResponse(

    "Sheet exported successfully",

    {

      format:
        "pdf",

      filename:
        file.getName(),

      fileId:
        file.getId(),

      url:
        file.getUrl(),

      mimeType:
        "application/pdf"

    }

  );

}