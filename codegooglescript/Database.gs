// =====================================================
// DATABASE.GS
// Database Core
// Cloud Project Platform
// =====================================================


// =====================================================
// DATABASE CONFIGURATION
// =====================================================

const DATABASE_CONFIG = {

  // Spreadsheet ID can be supplied by Config.gs.
  // Do not hard-code private credentials here.
  SPREADSHEET_ID_PROPERTY:
    "DATABASE_SPREADSHEET_ID",

  HEADER_ROW:
    1,

  AUTO_CREATE_SHEETS:
    true,

  USE_SCRIPT_LOCK:
    true,

  LOCK_TIMEOUT:
    30000

};


// =====================================================
// DATABASE STATE
// =====================================================

let DATABASE_SPREADSHEET_CACHE = null;


// =====================================================
// GET DATABASE SPREADSHEET
// =====================================================

function getDatabase() {

  if (DATABASE_SPREADSHEET_CACHE) {

    return DATABASE_SPREADSHEET_CACHE;

  }


  let spreadsheetId = "";


  // Prefer Config.gs if available.
  if (
    typeof getConfig === "function"
  ) {

    const config =
      getConfig() || {};

    spreadsheetId =
      config.databaseSpreadsheetId ||
      config.spreadsheetId ||
      "";

  }


  // Fall back to Script Properties.
  if (!spreadsheetId) {

    spreadsheetId =
      PropertiesService
        .getScriptProperties()
        .getProperty(
          DATABASE_CONFIG
            .SPREADSHEET_ID_PROPERTY
        ) ||
      "";

  }


  // If an ID is configured, open it.
  if (spreadsheetId) {

    try {

      DATABASE_SPREADSHEET_CACHE =
        SpreadsheetApp
          .openById(
            spreadsheetId
          );

      return DATABASE_SPREADSHEET_CACHE;

    } catch (error) {

      throw createAppError(

        ERROR_CODES.DATABASE_ERROR,

        "Unable to open database spreadsheet",

        null,

        error

      );

    }

  }


  // Otherwise use the spreadsheet
  // attached to this Apps Script project.
  try {

    DATABASE_SPREADSHEET_CACHE =
      SpreadsheetApp
        .getActiveSpreadsheet();

    if (
      !DATABASE_SPREADSHEET_CACHE
    ) {

      throw new Error(
        "No active spreadsheet found"
      );

    }

    return DATABASE_SPREADSHEET_CACHE;

  } catch (error) {

    throw createAppError(

      ERROR_CODES.DATABASE_ERROR,

      "Database spreadsheet is not configured",

      null,

      error

    );

  }

}


// =====================================================
// GET DATABASE ID
// =====================================================

function getDatabaseId() {

  const database =
    getDatabase();

  return database.getId();

}


// =====================================================
// GET DATABASE NAME
// =====================================================

function getDatabaseName() {

  const database =
    getDatabase();

  return database.getName();

}


// =====================================================
// GET DATABASE URL
// =====================================================

function getDatabaseUrl() {

  const database =
    getDatabase();

  return database.getUrl();

}


// =====================================================
// SET DATABASE SPREADSHEET ID
// =====================================================

function setDatabaseSpreadsheetId(
  spreadsheetId
) {

  if (!spreadsheetId) {

    throwConfigurationError(
      "Spreadsheet ID is required"
    );

  }


  try {

    // Verify access before saving.
    const spreadsheet =
      SpreadsheetApp
        .openById(
          spreadsheetId
        );


    PropertiesService
      .getScriptProperties()
      .setProperty(

        DATABASE_CONFIG
          .SPREADSHEET_ID_PROPERTY,

        spreadsheet.getId()

      );


    DATABASE_SPREADSHEET_CACHE =
      spreadsheet;


    return apiSuccess(

      "Database spreadsheet configured",

      {
        id:
          spreadsheet.getId(),

        name:
          spreadsheet.getName()

      }

    );

  } catch (error) {

    return handleError(
      error,
      "Database.setDatabaseSpreadsheetId"
    );

  }

}


// =====================================================
// CLEAR DATABASE CACHE
// =====================================================

function clearDatabaseCache() {

  DATABASE_SPREADSHEET_CACHE =
    null;

}


// =====================================================
// GET SHEET
// =====================================================

function getSheet(
  sheetName
) {

  if (!sheetName) {

    throwValidationError(
      "Sheet name is required"
    );

  }


  const database =
    getDatabase();


  let sheet =
    database.getSheetByName(
      String(sheetName)
    );


  if (
    !sheet &&
    DATABASE_CONFIG.AUTO_CREATE_SHEETS
  ) {

    sheet =
      createDatabaseSheet(
        sheetName
      );

  }


  if (!sheet) {

    throw createAppError(

      ERROR_CODES.NOT_FOUND,

      "Database sheet not found: " +
      String(sheetName)

    );

  }


  return sheet;

}


// =====================================================
// CHECK SHEET EXISTS
// =====================================================

function databaseSheetExists(
  sheetName
) {

  if (!sheetName) {
    return false;
  }


  const database =
    getDatabase();


  return (
    database.getSheetByName(
      String(sheetName)
    ) !== null
  );

}


// =====================================================
// CREATE DATABASE SHEET
// =====================================================

function createDatabaseSheet(
  sheetName,
  headers
) {

  if (!sheetName) {

    throwValidationError(
      "Sheet name is required"
    );

  }


  const database =
    getDatabase();


  let sheet =
    database.getSheetByName(
      String(sheetName)
    );


  if (sheet) {

    return sheet;

  }


  sheet =
    database.insertSheet(
      String(sheetName)
    );


  if (
    Array.isArray(headers) &&
    headers.length > 0
  ) {

    sheet
      .getRange(
        DATABASE_CONFIG.HEADER_ROW,
        1,
        1,
        headers.length
      )
      .setValues([
        headers
      ]);

  }


  return sheet;

}


// =====================================================
// GET ALL DATABASE SHEETS
// =====================================================

function getDatabaseSheets() {

  return getDatabase()
    .getSheets()
    .map(
      function(sheet) {

        return {

          name:
            sheet.getName(),

          id:
            sheet.getSheetId(),

          index:
            sheet.getIndex(),

          rows:
            sheet.getLastRow(),

          columns:
            sheet.getLastColumn()

        };

      }
    );

}


// =====================================================
// GET SHEET HEADERS
// =====================================================

function getSheetHeaders(
  sheet
) {

  if (!sheet) {

    return [];

  }


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastColumn <= 0
  ) {

    return [];

  }


  return sheet
    .getRange(
      DATABASE_CONFIG.HEADER_ROW,
      1,
      1,
      lastColumn
    )
    .getValues()[0];

}


// =====================================================
// SET SHEET HEADERS
// =====================================================

function setSheetHeaders(
  sheet,
  headers
) {

  if (!sheet) {

    throwValidationError(
      "Sheet is required"
    );

  }


  if (
    !Array.isArray(headers) ||
    headers.length === 0
  ) {

    throwValidationError(
      "Headers are required"
    );

  }


  sheet
    .getRange(
      DATABASE_CONFIG.HEADER_ROW,
      1,
      1,
      headers.length
    )
    .setValues([
      headers
    ]);


  return true;

}


// =====================================================
// GET DATA ROWS
// =====================================================

function getDatabaseRows(
  sheet,
  includeHeader
) {

  if (!sheet) {

    return [];

  }


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow <= 0 ||
    lastColumn <= 0
  ) {

    return [];

  }


  const values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getValues();


  if (
    includeHeader === true
  ) {

    return values;

  }


  if (
    values.length <= 1
  ) {

    return [];

  }


  return values.slice(1);

}


// =====================================================
// GET DATABASE ROW COUNT
// =====================================================

function getDatabaseRowCount(
  sheet
) {

  if (!sheet) {
    return 0;
  }


  const lastRow =
    sheet.getLastRow();


  return Math.max(
    0,
    lastRow -
    DATABASE_CONFIG.HEADER_ROW
  );

}


// =====================================================
// GET DATABASE COLUMN COUNT
// =====================================================

function getDatabaseColumnCount(
  sheet
) {

  if (!sheet) {
    return 0;
  }


  return sheet.getLastColumn();

}


// =====================================================
// APPEND DATABASE ROW
// =====================================================

function appendDatabaseRow(
  sheet,
  row
) {

  if (!sheet) {

    throwValidationError(
      "Sheet is required"
    );

  }


  if (!Array.isArray(row)) {

    throwValidationError(
      "Row must be an array"
    );

  }


  sheet.appendRow(
    row
  );


  return sheet.getLastRow();

}


// =====================================================
// APPEND MULTIPLE DATABASE ROWS
// =====================================================

function appendDatabaseRows(
  sheet,
  rows
) {

  if (!sheet) {

    throwValidationError(
      "Sheet is required"
    );

  }


  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {

    return 0;

  }


  const startRow =
    sheet.getLastRow() + 1;


  const columnCount =
    rows[0].length;


  sheet
    .getRange(
      startRow,
      1,
      rows.length,
      columnCount
    )
    .setValues(
      rows
    );


  return rows.length;

}


// =====================================================
// UPDATE DATABASE ROW
// =====================================================

function updateDatabaseRow(
  sheet,
  rowNumber,
  row
) {

  if (!sheet) {

    throwValidationError(
      "Sheet is required"
    );

  }


  if (
    rowNumber <=
    DATABASE_CONFIG.HEADER_ROW
  ) {

    throwValidationError(
      "Invalid database row"
    );

  }


  if (!Array.isArray(row)) {

    throwValidationError(
      "Row must be an array"
    );

  }


  sheet
    .getRange(
      rowNumber,
      1,
      1,
      row.length
    )
    .setValues([
      row
    ]);


  return true;

}


// =====================================================
// DELETE DATABASE ROW
// =====================================================

function deleteDatabaseRow(
  sheet,
  rowNumber
) {

  if (!sheet) {

    throwValidationError(
      "Sheet is required"
    );

  }


  if (
    rowNumber <=
    DATABASE_CONFIG.HEADER_ROW
  ) {

    throwValidationError(
      "Invalid database row"
    );

  }


  if (
    rowNumber >
    sheet.getLastRow()
  ) {

    throwNotFoundError(
      "Database row not found"
    );

  }


  sheet.deleteRow(
    rowNumber
  );


  return true;

}


// =====================================================
// FIND ROW BY COLUMN
// =====================================================

function findDatabaseRow(
  sheet,
  columnNumber,
  value
) {

  if (!sheet) {
    return null;
  }


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <=
    DATABASE_CONFIG.HEADER_ROW
  ) {

    return null;

  }


  const values =
    sheet
      .getRange(
        DATABASE_CONFIG.HEADER_ROW + 1,
        columnNumber,
        lastRow -
          DATABASE_CONFIG.HEADER_ROW,
        1
      )
      .getValues();


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(value)
    ) {

      return (
        i +
        DATABASE_CONFIG.HEADER_ROW +
        1
      );

    }

  }


  return null;

}


// =====================================================
// FIND ROWS BY COLUMN
// =====================================================

function findDatabaseRows(
  sheet,
  columnNumber,
  value
) {

  if (!sheet) {
    return [];
  }


  const lastRow =
    sheet.getLastRow();


  if (
    lastRow <=
    DATABASE_CONFIG.HEADER_ROW
  ) {

    return [];

  }


  const values =
    sheet
      .getRange(
        DATABASE_CONFIG.HEADER_ROW + 1,
        columnNumber,
        lastRow -
          DATABASE_CONFIG.HEADER_ROW,
        1
      )
      .getValues();


  const rows = [];


  for (
    let i = 0;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(value)
    ) {

      rows.push(
        i +
        DATABASE_CONFIG.HEADER_ROW +
        1
      );

    }

  }


  return rows;

}


// =====================================================
// DATABASE LOCK
// =====================================================

function withDatabaseLock(
  callback
) {

  if (
    DATABASE_CONFIG.USE_SCRIPT_LOCK !==
    true
  ) {

    return callback();

  }


  const lock =
    LockService
      .getScriptLock();


  if (
    !lock.tryLock(
      DATABASE_CONFIG.LOCK_TIMEOUT
    )
  ) {

    throw createAppError(

      ERROR_CODES.DATABASE_ERROR,

      "Database is currently busy"

    );

  }


  try {

    return callback();

  } finally {

    lock.releaseLock();

  }

}


// =====================================================
// DATABASE HEALTH
// =====================================================

function getDatabaseHealth() {

  try {

    const database =
      getDatabase();


    const sheets =
      database.getSheets();


    return {

      healthy:
        true,

      id:
        database.getId(),

      name:
        database.getName(),

      sheetCount:
        sheets.length,

      timestamp:
        new Date()

    };

  } catch (error) {

    return {

      healthy:
        false,

      error:
        getErrorMessage(
          error
        ),

      timestamp:
        new Date()

    };

  }

}


// =====================================================
// DATABASE STATISTICS
// =====================================================

function getDatabaseStatistics() {

  const sheets =
    getDatabase()
      .getSheets();


  let totalRows = 0;
  let totalColumns = 0;


  sheets.forEach(
    function(sheet) {

      totalRows +=
        Math.max(
          0,
          sheet.getLastRow() -
          DATABASE_CONFIG.HEADER_ROW
        );

      totalColumns +=
        sheet.getLastColumn();

    }
  );


  return {

    spreadsheetId:
      getDatabaseId(),

    spreadsheetName:
      getDatabaseName(),

    sheetCount:
      sheets.length,

    totalRows:
      totalRows,

    totalColumns:
      totalColumns,

    timestamp:
      new Date()

  };

}


// =====================================================
// DATABASE INITIALIZATION
// =====================================================

function initializeDatabase() {

  return withDatabaseLock(
    function() {

      const database =
        getDatabase();


      // If Schema.gs provides
      // database schema initialization,
      // use it here.

      if (
        typeof initializeSchema ===
        "function"
      ) {

        initializeSchema();

      }


      return {

        success:
          true,

        databaseId:
          database.getId(),

        databaseName:
          database.getName(),

        sheets:
          getDatabaseSheets(),

        timestamp:
          new Date()

      };

    }
  );

}


// =====================================================
// DATABASE TEST
// =====================================================

function testDatabaseConnection() {

  try {

    const database =
      getDatabase();


    return apiSuccess(

      "Database connection successful",

      {

        id:
          database.getId(),

        name:
          database.getName(),

        url:
          database.getUrl(),

        sheetCount:
          database.getSheets()
            .length

      }

    );

  } catch (error) {

    return handleError(

      error,

      "Database.testDatabaseConnection"

    );

  }

}