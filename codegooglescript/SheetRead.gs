// =====================================================
// SHEETREAD.GS
// Sheet Read Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// GET SINGLE SHEET
// =====================================================

function getSheetRecord(data) {

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

  const sheet =
    findSheetById(
      data.sheetId
    );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  // ===================================================
  // CHECK ACCESS
  // ===================================================

  const access =
    checkSheetAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }

  return successResponse(

    "Sheet retrieved successfully",

    {

      sheet:
        formatSheetRecord(
          sheet
        )

    }

  );

}


// =====================================================
// GET PROJECT SHEETS
// =====================================================

function getSheets(data) {

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

  // ===================================================
  // CHECK PROJECT
  // ===================================================

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

  const hasAccess =
    checkProjectAccessInternal(
      data.projectId,
      session.userId
    );

  if (
    !isAdmin &&
    !isOwner &&
    !hasAccess
  ) {

    return errorResponse(
      "You do not have access to this project"
    );

  }

  // ===================================================
  // GET SHEETS
  // ===================================================

  const sheets =
    getSheetsByProject(
      data.projectId
    );

  const formattedSheets =
    sheets.map(
      function(sheet) {

        return formatSheetRecord(
          sheet
        );

      }
    );

  return successResponse(

    "Sheets retrieved successfully",

    {

      sheets:
        formattedSheets,

      count:
        formattedSheets.length

    }

  );

}


// =====================================================
// GET SHEETS BY PROJECT
// =====================================================

function getSheetsByProject(
  projectId
) {

  if (!projectId) {

    return [];

  }

  const databaseSheet =
    getSheet(
      SHEETS.SHEETS
    );

  const values =
    databaseSheet
      .getDataRange()
      .getValues();

  const sheets = [];

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];

    const rowProjectId =
      row[
        SHEET_COLUMNS.PROJECT_ID - 1
      ];

    if (
      String(
        rowProjectId
      ) !==
      String(
        projectId
      )
    ) {

      continue;

    }

    const status =
      row[
        SHEET_COLUMNS.STATUS - 1
      ];

    if (
      String(
        status || ""
      ).toLowerCase() ===
      "deleted"
    ) {

      continue;

    }

    sheets.push(
      mapSheetRow(
        row,
        i + 1
      )
    );

  }

  return sheets;

}


// =====================================================
// GET SHEET DATA
// =====================================================

function getSheetData(
  data
) {

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

  const sheet =
    findSheetById(
      data.sheetId
    );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  // ===================================================
  // CHECK ACCESS
  // ===================================================

  const access =
    checkSheetAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }

  // ===================================================
  // GET PHYSICAL GOOGLE SHEET
  // ===================================================

  let physicalSheet;

  try {

    physicalSheet =
      getPhysicalSheet(
        sheet
      );

  } catch (error) {

    return errorResponse(
      "Unable to access sheet: " +
      error.message
    );

  }

  if (!physicalSheet) {

    return errorResponse(
      "Physical sheet not found"
    );

  }

  // ===================================================
  // READ RANGE
  // ===================================================

  let range;

  try {

    if (
      data.range
    ) {

      range =
        physicalSheet.getRange(
          String(
            data.range
          )
        );

    } else {

      range =
        physicalSheet.getDataRange();

    }

  } catch (error) {

    return errorResponse(
      "Invalid sheet range: " +
      error.message
    );

  }

  const values =
    range.getValues();

  const formulas =
    range.getFormulas();

  const displayValues =
    range.getDisplayValues();

  return successResponse(

    "Sheet data retrieved successfully",

    {

      sheetId:
        sheet.id,

      projectId:
        sheet.projectId,

      name:
        sheet.name,

      range:
        range.getA1Notation(),

      values:
        values,

      formulas:
        formulas,

      displayValues:
        displayValues,

      rows:
        values.length,

      columns:
        values.length
          ? values[0].length
          : 0

    }

  );

}


// =====================================================
// GET SHEET METADATA
// =====================================================

function getSheetMetadata(
  data
) {

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

  const sheet =
    findSheetById(
      data.sheetId
    );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  const access =
    checkSheetAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }

  let physicalSheet;

  try {

    physicalSheet =
      getPhysicalSheet(
        sheet
      );

  } catch (error) {

    return errorResponse(
      "Unable to access physical sheet: " +
      error.message
    );

  }

  if (!physicalSheet) {

    return errorResponse(
      "Physical sheet not found"
    );

  }

  return successResponse(

    "Sheet metadata retrieved successfully",

    {

      sheet:
        formatSheetRecord(
          sheet
        ),

      rows:
        physicalSheet.getMaxRows(),

      columns:
        physicalSheet.getMaxColumns(),

      lastRow:
        physicalSheet.getLastRow(),

      lastColumn:
        physicalSheet.getLastColumn(),

      frozenRows:
        physicalSheet.getFrozenRows(),

      frozenColumns:
        physicalSheet.getFrozenColumns()

    }

  );

}


// =====================================================
// GET SHEET ROW
// =====================================================

function getSheetRow(
  data
) {

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

  if (
    !data.rowNumber
  ) {

    return errorResponse(
      "Row number is required"
    );

  }

  const sheet =
    findSheetById(
      data.sheetId
    );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  const access =
    checkSheetAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }

  let physicalSheet;

  try {

    physicalSheet =
      getPhysicalSheet(
        sheet
      );

  } catch (error) {

    return errorResponse(
      error.message
    );

  }

  const rowNumber =
    Number(
      data.rowNumber
    );

  if (
    rowNumber < 1 ||
    rowNumber >
    physicalSheet.getMaxRows()
  ) {

    return errorResponse(
      "Invalid row number"
    );

  }

  const lastColumn =
    Math.max(
      physicalSheet.getLastColumn(),
      1
    );

  const values =
    physicalSheet
      .getRange(
        rowNumber,
        1,
        1,
        lastColumn
      )
      .getValues()[0];

  return successResponse(

    "Sheet row retrieved successfully",

    {

      sheetId:
        data.sheetId,

      rowNumber:
        rowNumber,

      values:
        values

    }

  );

}


// =====================================================
// GET SHEET COLUMN
// =====================================================

function getSheetColumn(
  data
) {

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

  if (
    !data.columnNumber
  ) {

    return errorResponse(
      "Column number is required"
    );

  }

  const sheet =
    findSheetById(
      data.sheetId
    );

  if (!sheet) {

    return errorResponse(
      "Sheet not found"
    );

  }

  const access =
    checkSheetAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }

  let physicalSheet;

  try {

    physicalSheet =
      getPhysicalSheet(
        sheet
      );

  } catch (error) {

    return errorResponse(
      error.message
    );

  }

  const columnNumber =
    Number(
      data.columnNumber
    );

  if (
    columnNumber < 1 ||
    columnNumber >
    physicalSheet.getMaxColumns()
  ) {

    return errorResponse(
      "Invalid column number"
    );

  }

  const lastRow =
    Math.max(
      physicalSheet.getLastRow(),
      1
    );

  const values =
    physicalSheet
      .getRange(
        1,
        columnNumber,
        lastRow,
        1
      )
      .getValues();

  return successResponse(

    "Sheet column retrieved successfully",

    {

      sheetId:
        data.sheetId,

      columnNumber:
        columnNumber,

      values:
        values

    }

  );

}


// =====================================================
// CHECK SHEET ACCESS
// =====================================================

function checkSheetAccess(
  sheet,
  session
) {

  if (!sheet) {

    return {

      allowed:
        false,

      message:
        "Sheet not found"

    };

  }

  if (!session) {

    return {

      allowed:
        false,

      message:
        "Authentication required"

    };

  }

  const isAdmin =
    String(
      session.role || ""
    ).toLowerCase() ===
    "admin";

  if (isAdmin) {

    return {

      allowed:
        true,

      reason:
        "administrator"

    };

  }

  if (
    sheet.ownerId &&
    String(
      sheet.ownerId
    ) ===
    String(
      session.userId
    )
  ) {

    return {

      allowed:
        true,

      reason:
        "owner"

    };

  }

  if (
    sheet.projectId
  ) {

    const project =
      findProjectById(
        sheet.projectId
      );

    if (!project) {

      return {

        allowed:
          false,

        message:
          "Project not found"

      };

    }

    if (
      String(
        project.ownerId || ""
      ) ===
      String(
        session.userId
      )
    ) {

      return {

        allowed:
          true,

        reason:
          "project owner"

      };

    }

    if (
      checkProjectAccessInternal(
        sheet.projectId,
        session.userId
      )
    ) {

      return {

        allowed:
          true,

        reason:
          "project member"

      };

    }

  }

  return {

    allowed:
      false,

    message:
      "You do not have access to this sheet"

  };

}


// =====================================================
// GET PHYSICAL SHEET
// =====================================================

function getPhysicalSheet(
  sheetRecord
) {

  if (!sheetRecord) {

    throw new Error(
      "Sheet record is required"
    );

  }

  const spreadsheet =
    getSpreadsheetForSheet(
      sheetRecord
    );

  if (!spreadsheet) {

    throw new Error(
      "Spreadsheet not found"
    );

  }

  const physicalSheet =
    spreadsheet.getSheetByName(
      String(
        sheetRecord.name
      )
    );

  if (!physicalSheet) {

    throw new Error(
      "Physical sheet not found"
    );

  }

  return physicalSheet;

}


// =====================================================
// FORMAT SHEET RECORD
// =====================================================

function formatSheetRecord(
  sheet
) {

  if (!sheet) {

    return null;

  }

  return {

    id:
      sheet.id,

    projectId:
      sheet.projectId,

    name:
      sheet.name,

    description:
      sheet.description || "",

    ownerId:
      sheet.ownerId || "",

    spreadsheetId:
      sheet.spreadsheetId || "",

    status:
      sheet.status || "",

    visibility:
      sheet.visibility || "",

    createdAt:
      sheet.createdAt || null,

    updatedAt:
      sheet.updatedAt || null

  };

}