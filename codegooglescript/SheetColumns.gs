// =====================================================
// SHEETCOLUMNS.GS
// Sheet Column Operations
// Cloud Project Platform
// =====================================================


// =====================================================
// ADD COLUMNS
// =====================================================

function addColumns(data) {

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
    !Array.isArray(data.columns) ||
    data.columns.length === 0
  ) {

    return errorResponse(
      "Columns are required"
    );

  }


  // ===================================================
  // FIND SHEET
  // ===================================================

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
    checkSheetWriteAccess(
      sheet,
      session
    );

  if (!access.allowed) {

    return errorResponse(
      access.message
    );

  }


  // ===================================================
  // GET PHYSICAL SHEET
  // ===================================================

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


  // ===================================================
  // READ EXISTING HEADERS
  // ===================================================

  const lastColumn =
    physicalSheet.getLastColumn();

  const existingHeaders =
    lastColumn > 0
      ? physicalSheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .getValues()[0]
      : [];


  // ===================================================
  // NORMALIZE COLUMN NAMES
  // ===================================================

  const newColumns =
    data.columns.map(
      function(column) {

        if (
          typeof column ===
          "object"
        ) {

          return sanitizeInput(
            String(
              column.name || ""
            ).trim()
          );

        }

        return sanitizeInput(
          String(
            column
          ).trim()
        );

      }
    );


  // ===================================================
  // VALIDATE COLUMN NAMES
  // ===================================================

  for (
    let i = 0;
    i < newColumns.length;
    i++
  ) {

    if (!newColumns[i]) {

      return errorResponse(
        "Column name cannot be empty"
      );

    }

    if (
      newColumns[i].length > 100
    ) {

      return errorResponse(
        "Column name cannot exceed 100 characters"
      );

    }

  }


  // ===================================================
  // CHECK DUPLICATES
  // ===================================================

  const existingNames =
    existingHeaders.map(
      function(header) {

        return String(
          header || ""
        )
          .trim()
          .toLowerCase();

      }
    );

  const requestedNames = [];

  for (
    let i = 0;
    i < newColumns.length;
    i++
  ) {

    const normalized =
      newColumns[i]
        .toLowerCase();

    if (
      existingNames.indexOf(
        normalized
      ) !== -1
    ) {

      return errorResponse(
        "Column already exists: " +
        newColumns[i]
      );

    }

    if (
      requestedNames.indexOf(
        normalized
      ) !== -1
    ) {

      return errorResponse(
        "Duplicate column: " +
        newColumns[i]
      );

    }

    requestedNames.push(
      normalized
    );

  }


  // ===================================================
  // ADD COLUMNS TO GOOGLE SHEET
  // ===================================================

  try {

    const startColumn =
      Math.max(
        physicalSheet.getMaxColumns(),
        existingHeaders.length
      ) + 1;

    const requiredColumns =
      startColumn +
      newColumns.length -
      1;

    const maxColumns =
      physicalSheet.getMaxColumns();

    if (
      requiredColumns >
      maxColumns
    ) {

      physicalSheet.insertColumnsAfter(
        maxColumns,
        requiredColumns - maxColumns
      );

    }

    physicalSheet
      .getRange(
        1,
        startColumn,
        1,
        newColumns.length
      )
      .setValues([
        newColumns
      ]);

  } catch (error) {

    return errorResponse(
      "Unable to add columns: " +
      error.message
    );

  }


  // ===================================================
  // LOG
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
          "ADD_SHEET_COLUMNS",

        targetId:
          sheet.id,

        targetType:
          "SHEET",

        details:
          "Added columns: " +
          newColumns.join(", ")

      });

    }

  } catch (error) {

    // Logging failure does not
    // cancel the operation.

  }


  return successResponse(

    "Columns added successfully",

    {

      sheetId:
        sheet.id,

      columns:
        newColumns,

      count:
        newColumns.length

    }

  );

}


// =====================================================
// DELETE COLUMN
// =====================================================

function deleteSheetColumn(data) {

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
    data.column === undefined ||
    data.column === null ||
    data.column === ""
  ) {

    return errorResponse(
      "Column is required"
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
    checkSheetWriteAccess(
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


  // ===================================================
  // RESOLVE COLUMN
  // ===================================================

  const columnNumber =
    resolveSheetColumn(
      physicalSheet,
      data.column
    );

  if (
    !columnNumber
  ) {

    return errorResponse(
      "Column not found"
    );

  }


  // ===================================================
  // SAFETY CHECK
  // ===================================================

  if (
    physicalSheet.getMaxColumns() <= 1
  ) {

    return errorResponse(
      "Cannot delete the last column"
    );

  }


  try {

    physicalSheet.deleteColumn(
      columnNumber
    );

  } catch (error) {

    return errorResponse(
      "Unable to delete column: " +
      error.message
    );

  }


  return successResponse(

    "Column deleted successfully",

    {

      sheetId:
        sheet.id,

      column:
        columnNumber

    }

  );

}


// =====================================================
// RENAME COLUMN
// =====================================================

function renameSheetColumn(data) {

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
    data.column === undefined
  ) {

    return errorResponse(
      "Column is required"
    );

  }

  if (!data.name) {

    return errorResponse(
      "New column name is required"
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
    checkSheetWriteAccess(
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
    resolveSheetColumn(
      physicalSheet,
      data.column
    );

  if (
    !columnNumber
  ) {

    return errorResponse(
      "Column not found"
    );

  }


  const newName =
    sanitizeInput(
      String(
        data.name
      ).trim()
    );

  if (!newName) {

    return errorResponse(
      "Column name cannot be empty"
    );

  }


  // ===================================================
  // CHECK DUPLICATE
  // ===================================================

  const lastColumn =
    physicalSheet.getLastColumn();

  const headers =
    lastColumn > 0
      ? physicalSheet
          .getRange(
            1,
            1,
            1,
            lastColumn
          )
          .getValues()[0]
      : [];

  for (
    let i = 0;
    i < headers.length;
    i++
  ) {

    if (
      i + 1 ===
      columnNumber
    ) {

      continue;

    }

    if (
      String(
        headers[i] || ""
      )
        .trim()
        .toLowerCase() ===
      newName.toLowerCase()
    ) {

      return errorResponse(
        "A column with this name already exists"
      );

    }

  }


  try {

    physicalSheet
      .getRange(
        1,
        columnNumber
      )
      .setValue(
        newName
      );

  } catch (error) {

    return errorResponse(
      "Unable to rename column: " +
      error.message
    );

  }


  return successResponse(

    "Column renamed successfully",

    {

      sheetId:
        sheet.id,

      column:
        columnNumber,

      name:
        newName

    }

  );

}


// =====================================================
// READ SHEET COLUMNS
// =====================================================

function getSheetColumns(data) {

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
      error.message
    );

  }


  const lastColumn =
    physicalSheet.getLastColumn();

  if (
    lastColumn === 0
  ) {

    return successResponse(

      "No columns found",

      {

        sheetId:
          sheet.id,

        columns:
          [],

        count:
          0

      }

    );

  }


  const headers =
    physicalSheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];


  const columns =
    [];

  for (
    let i = 0;
    i < headers.length;
    i++
  ) {

    columns.push({

      number:
        i + 1,

      name:
        String(
          headers[i] || ""
        ),

      letter:
        columnNumberToLetter(
          i + 1
        )

    });

  }


  return successResponse(

    "Sheet columns retrieved successfully",

    {

      sheetId:
        sheet.id,

      columns:
        columns,

      count:
        columns.length

    }

  );

}


// =====================================================
// RESOLVE SHEET COLUMN
// Supports:
// 1
// A
// AA
// "Email"
// =====================================================

function resolveSheetColumn(
  physicalSheet,
  column
) {

  if (!physicalSheet) {

    return null;

  }

  if (
    column === undefined ||
    column === null ||
    column === ""
  ) {

    return null;

  }


  // ===================================================
  // NUMBER
  // ===================================================

  if (
    typeof column ===
    "number"
  ) {

    return column >= 1
      ? Math.floor(column)
      : null;

  }


  const value =
    String(
      column
    ).trim();


  // ===================================================
  // NUMERIC STRING
  // ===================================================

  if (
    /^\d+$/.test(value)
  ) {

    const number =
      Number(value);

    return number >= 1
      ? number
      : null;

  }


  // ===================================================
  // COLUMN LETTER
  // ===================================================

  if (
    /^[A-Za-z]+$/.test(value)
  ) {

    return columnLetterToNumber(
      value
    );

  }


  // ===================================================
  // COLUMN NAME
  // ===================================================

  const lastColumn =
    physicalSheet.getLastColumn();

  if (
    lastColumn < 1
  ) {

    return null;

  }

  const headers =
    physicalSheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];

  for (
    let i = 0;
    i < headers.length;
    i++
  ) {

    if (
      String(
        headers[i] || ""
      )
        .trim()
        .toLowerCase() ===
      value.toLowerCase()
    ) {

      return i + 1;

    }

  }

  return null;

}


// =====================================================
// COLUMN NUMBER → LETTER
// =====================================================

function columnNumberToLetter(
  columnNumber
) {

  let result =
    "";

  let number =
    Number(
      columnNumber
    );

  while (
    number > 0
  ) {

    const remainder =
      (number - 1) %
      26;

    result =
      String.fromCharCode(
        65 + remainder
      ) +
      result;

    number =
      Math.floor(
        (number - 1) /
        26
      );

  }

  return result;

}


// =====================================================
// COLUMN LETTER → NUMBER
// =====================================================

function columnLetterToNumber(
  letters
) {

  const value =
    String(
      letters
    )
      .trim()
      .toUpperCase();

  if (
    !/^[A-Z]+$/.test(value)
  ) {

    return null;

  }

  let number =
    0;

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


// =====================================================
// WRITE ACCESS CHECK
// =====================================================

function checkSheetWriteAccess(
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


  // ===================================================
  // ADMIN
  // ===================================================

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


  // ===================================================
  // SHEET OWNER
  // ===================================================

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


  // ===================================================
  // PROJECT OWNER / MEMBER
  // ===================================================

  if (
    sheet.projectId
  ) {

    const project =
      findProjectById(
        sheet.projectId
      );

    if (project) {

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

      const member =
        findProjectUser(
          sheet.projectId,
          session.userId
        );

      if (
        member &&
        String(
          member.status || ""
        ).toLowerCase() ===
        "active"
      ) {

        // If your permission system later
        // supports granular project roles,
        // this is where write permission
        // should be checked.

        return {

          allowed:
            true,

          reason:
            "project member"

        };

      }

    }

  }


  return {

    allowed:
      false,

    message:
      "You do not have permission to modify this sheet"

  };

}