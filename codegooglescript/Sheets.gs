// =====================================================
// SHEETS.GS
// Core Sheet Management
// Cloud Project Platform
// =====================================================


// =====================================================
// SHEET COLUMNS
// =====================================================

const SHEET_COLUMNS = {

  ID: 1,

  PROJECT_ID: 2,

  OWNER_ID: 3,

  NAME: 4,

  SPREADSHEET_ID: 5,

  SHEET_ID: 6,

  DESCRIPTION: 7,

  STATUS: 8,

  CREATED_AT: 9,

  UPDATED_AT: 10

};


// =====================================================
// DEFAULT VALUES
// =====================================================

const DEFAULT_SHEET_STATUS =
  "Active";


// =====================================================
// GET SHEETS DATABASE
// =====================================================

function getSheetsDatabase() {

  return getSheet(
    SHEETS.SHEETS
  );

}


// =====================================================
// FIND SHEET BY ID
// =====================================================

function findSheetById(
  sheetId
) {

  if (!sheetId) {

    return null;

  }

  const sheet =
    getSheetsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SHEET_COLUMNS.ID - 1
        ]
      ) ===
      String(
        sheetId
      )
    ) {

      return sheetRowToObject(
        row,
        i + 1
      );

    }

  }

  return null;

}


// =====================================================
// FIND SHEETS BY PROJECT
// =====================================================

function findSheetsByProject(
  projectId
) {

  const results =
    [];

  if (!projectId) {

    return results;

  }

  const sheet =
    getSheetsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SHEET_COLUMNS.PROJECT_ID - 1
        ]
      ) !==
      String(
        projectId
      )
    ) {

      continue;

    }

    results.push(
      sheetRowToObject(
        row,
        i + 1
      )
    );

  }

  return results;

}


// =====================================================
// FIND SHEETS BY OWNER
// =====================================================

function findSheetsByOwner(
  ownerId
) {

  const results =
    [];

  if (!ownerId) {

    return results;

  }

  const sheet =
    getSheetsDatabase();

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    if (
      String(
        row[
          SHEET_COLUMNS.OWNER_ID - 1
        ]
      ) !==
      String(
        ownerId
      )
    ) {

      continue;

    }

    results.push(
      sheetRowToObject(
        row,
        i + 1
      )
    );

  }

  return results;

}


// =====================================================
// CHECK SHEET EXISTS
// =====================================================

function sheetExists(
  sheetId
) {

  return !!findSheetById(
    sheetId
  );

}


// =====================================================
// CHECK SHEET NAME
// =====================================================

function sheetNameExists(
  projectId,
  name,
  excludeSheetId
) {

  if (!name) {

    return false;

  }

  const sheets =
    findSheetsByProject(
      projectId
    );

  const target =
    String(
      name
    )
      .trim()
      .toLowerCase();

  for (
    let i = 0;
    i < sheets.length;
    i++
  ) {

    const current =
      sheets[i];

    if (
      excludeSheetId &&
      String(
        current.id
      ) ===
      String(
        excludeSheetId
      )
    ) {

      continue;

    }

    if (
      String(
        current.name || ""
      )
        .trim()
        .toLowerCase() ===
      target
    ) {

      return true;

    }

  }

  return false;

}


// =====================================================
// CONVERT DATABASE ROW TO OBJECT
// =====================================================

function sheetRowToObject(
  row,
  rowNumber
) {

  return {

    row:
      rowNumber || null,

    id:
      row[
        SHEET_COLUMNS.ID - 1
      ],

    projectId:
      row[
        SHEET_COLUMNS.PROJECT_ID - 1
      ],

    ownerId:
      row[
        SHEET_COLUMNS.OWNER_ID - 1
      ],

    name:
      row[
        SHEET_COLUMNS.NAME - 1
      ],

    spreadsheetId:
      row[
        SHEET_COLUMNS.SPREADSHEET_ID - 1
      ],

    sheetId:
      row[
        SHEET_COLUMNS.SHEET_ID - 1
      ],

    description:
      row[
        SHEET_COLUMNS.DESCRIPTION - 1
      ],

    status:
      row[
        SHEET_COLUMNS.STATUS - 1
      ],

    createdAt:
      row[
        SHEET_COLUMNS.CREATED_AT - 1
      ],

    updatedAt:
      row[
        SHEET_COLUMNS.UPDATED_AT - 1
      ]

  };

}


// =====================================================
// GET PHYSICAL GOOGLE SHEET
// =====================================================

function getPhysicalSheet(
  sheet
) {

  if (!sheet) {

    throw new Error(
      "Sheet information is required"
    );

  }

  if (
    !sheet.spreadsheetId
  ) {

    throw new Error(
      "Spreadsheet ID is missing"
    );

  }

  if (
    !sheet.sheetId
  ) {

    throw new Error(
      "Google Sheet tab ID is missing"
    );

  }


  let spreadsheet;

  try {

    spreadsheet =
      SpreadsheetApp.openById(
        String(
          sheet.spreadsheetId
        )
      );

  } catch (error) {

    throw new Error(
      "Unable to open spreadsheet: " +
      error.message
    );

  }


  const sheets =
    spreadsheet.getSheets();

  for (
    let i = 0;
    i < sheets.length;
    i++
  ) {

    if (
      String(
        sheets[i].getSheetId()
      ) ===
      String(
        sheet.sheetId
      )
    ) {

      return sheets[i];

    }

  }


  throw new Error(
    "Google Sheet tab not found"
  );

}


// =====================================================
// GET SPREADSHEET
// =====================================================

function getSpreadsheetForSheet(
  sheet
) {

  if (!sheet) {

    throw new Error(
      "Sheet information is required"
    );

  }

  if (
    !sheet.spreadsheetId
  ) {

    throw new Error(
      "Spreadsheet ID is missing"
    );

  }

  try {

    return SpreadsheetApp.openById(
      String(
        sheet.spreadsheetId
      )
    );

  } catch (error) {

    throw new Error(
      "Unable to open spreadsheet: " +
      error.message
    );

  }

}


// =====================================================
// GET SHEET TAB BY ID
// =====================================================

function getSheetTabById(
  spreadsheet,
  sheetId
) {

  if (
    !spreadsheet ||
    !sheetId
  ) {

    return null;

  }

  const sheets =
    spreadsheet.getSheets();

  for (
    let i = 0;
    i < sheets.length;
    i++
  ) {

    if (
      String(
        sheets[i].getSheetId()
      ) ===
      String(
        sheetId
      )
    ) {

      return sheets[i];

    }

  }

  return null;

}


// =====================================================
// GET SHEET TAB BY NAME
// =====================================================

function getSheetTabByName(
  spreadsheet,
  name
) {

  if (
    !spreadsheet ||
    !name
  ) {

    return null;

  }

  return spreadsheet.getSheetByName(
    String(
      name
    )
  );

}


// =====================================================
// GET SHEET TAB ID
// =====================================================

function getSheetTabId(
  physicalSheet
) {

  if (!physicalSheet) {

    return null;

  }

  return physicalSheet.getSheetId();

}


// =====================================================
// GET SPREADSHEET ID
// =====================================================

function getSpreadsheetId(
  physicalSheet
) {

  if (!physicalSheet) {

    return null;

  }

  return physicalSheet
    .getParent()
    .getId();

}


// =====================================================
// GET SHEET NAME
// =====================================================

function getPhysicalSheetName(
  physicalSheet
) {

  if (!physicalSheet) {

    return null;

  }

  return physicalSheet.getName();

}


// =====================================================
// GET SHEET ROW NUMBER
// =====================================================

function getSheetRowNumber(
  sheet
) {

  if (!sheet) {

    return null;

  }

  return sheet.row || null;

}


// =====================================================
// UPDATE SHEET TIMESTAMP
// =====================================================

function updateSheetTimestamp(
  sheetId
) {

  const sheet =
    findSheetById(
      sheetId
    );

  if (!sheet) {

    return false;

  }

  if (!sheet.row) {

    return false;

  }

  const database =
    getSheetsDatabase();

  database
    .getRange(
      sheet.row,
      SHEET_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// UPDATE SHEET STATUS
// =====================================================

function setSheetStatus(
  sheetId,
  status
) {

  if (!sheetId) {

    return false;

  }

  const sheet =
    findSheetById(
      sheetId
    );

  if (!sheet) {

    return false;

  }

  const database =
    getSheetsDatabase();

  database
    .getRange(
      sheet.row,
      SHEET_COLUMNS.STATUS
    )
    .setValue(
      String(
        status || ""
      )
        .trim()
    );

  database
    .getRange(
      sheet.row,
      SHEET_COLUMNS.UPDATED_AT
    )
    .setValue(
      new Date()
    );

  return true;

}


// =====================================================
// GET SHEET STATUS
// =====================================================

function getSheetStatus(
  sheetId
) {

  const sheet =
    findSheetById(
      sheetId
    );

  if (!sheet) {

    return null;

  }

  return sheet.status;

}


// =====================================================
// CHECK ACTIVE SHEET
// =====================================================

function isSheetActive(
  sheet
) {

  if (!sheet) {

    return false;

  }

  return String(
    sheet.status || ""
  )
    .toLowerCase() ===
    "active";

}


// =====================================================
// COUNT PROJECT SHEETS
// =====================================================

function countProjectSheets(
  projectId
) {

  return findSheetsByProject(
    projectId
  ).length;

}


// =====================================================
// COUNT USER SHEETS
// =====================================================

function countUserSheets(
  ownerId
) {

  return findSheetsByOwner(
    ownerId
  ).length;

}


// =====================================================
// GET SHEET COLUMN COUNT
// =====================================================

function getSheetColumnCount(
  physicalSheet
) {

  if (!physicalSheet) {

    return 0;

  }

  return physicalSheet.getLastColumn();

}


// =====================================================
// GET SHEET ROW COUNT
// =====================================================

function getSheetRowCount(
  physicalSheet
) {

  if (!physicalSheet) {

    return 0;

  }

  return physicalSheet.getLastRow();

}


// =====================================================
// GET SHEET SIZE
// =====================================================

function getSheetSize(
  physicalSheet
) {

  if (!physicalSheet) {

    return {

      rows:
        0,

      columns:
        0

    };

  }

  return {

    rows:
      physicalSheet.getLastRow(),

    columns:
      physicalSheet.getLastColumn()

  };

}


// =====================================================
// GET SHEET METADATA
// =====================================================

function getSheetMetadata(
  sheetId
) {

  const sheet =
    findSheetById(
      sheetId
    );

  if (!sheet) {

    return null;

  }

  let physicalSheet = null;

  try {

    physicalSheet =
      getPhysicalSheet(
        sheet
      );

  } catch (error) {

    return {

      id:
        sheet.id,

      projectId:
        sheet.projectId,

      ownerId:
        sheet.ownerId,

      name:
        sheet.name,

      spreadsheetId:
        sheet.spreadsheetId,

      sheetId:
        sheet.sheetId,

      description:
        sheet.description,

      status:
        sheet.status,

      createdAt:
        sheet.createdAt,

      updatedAt:
        sheet.updatedAt,

      available:
        false,

      error:
        error.message

    };

  }


  return {

    id:
      sheet.id,

    projectId:
      sheet.projectId,

    ownerId:
      sheet.ownerId,

    name:
      sheet.name,

    spreadsheetId:
      sheet.spreadsheetId,

    sheetId:
      sheet.sheetId,

    description:
      sheet.description,

    status:
      sheet.status,

    createdAt:
      sheet.createdAt,

    updatedAt:
      sheet.updatedAt,

    available:
      true,

    rows:
      physicalSheet.getLastRow(),

    columns:
      physicalSheet.getLastColumn(),

    maxRows:
      physicalSheet.getMaxRows(),

    maxColumns:
      physicalSheet.getMaxColumns()

  };

}


// =====================================================
// ENSURE HEADER ROW
// =====================================================

function ensureSheetHeader(
  physicalSheet,
  headers
) {

  if (
    !physicalSheet
  ) {

    throw new Error(
      "Physical sheet is required"
    );

  }

  if (
    !Array.isArray(headers) ||
    headers.length === 0
  ) {

    return false;

  }

  const existingColumns =
    physicalSheet.getMaxColumns();

  if (
    existingColumns <
    headers.length
  ) {

    physicalSheet.insertColumnsAfter(
      existingColumns,
      headers.length -
      existingColumns
    );

  }

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

  return true;

}


// =====================================================
// CLEAR SHEET DATA
// =====================================================

function clearPhysicalSheetData(
  physicalSheet
) {

  if (!physicalSheet) {

    return false;

  }

  const lastRow =
    physicalSheet.getLastRow();

  const lastColumn =
    physicalSheet.getLastColumn();

  if (
    lastRow <= 1 ||
    lastColumn <= 0
  ) {

    return true;

  }

  physicalSheet
    .getRange(
      2,
      1,
      lastRow - 1,
      lastColumn
    )
    .clearContent();

  return true;

}


// =====================================================
// GET SHEET DATABASE HEADERS
// =====================================================

function getSheetDatabaseHeaders() {

  const database =
    getSheetsDatabase();

  const lastColumn =
    database.getLastColumn();

  if (
    lastColumn === 0
  ) {

    return [];

  }

  return database
    .getRange(
      1,
      1,
      1,
      lastColumn
    )
    .getValues()[0];

}