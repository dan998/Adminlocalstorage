// =====================================================
// APISHEETROUTES.GS
// Sheet API Routes
// Registration System API
// =====================================================


// =====================================================
// SHEET ROUTER
// =====================================================

function handleSheetRoutes(
  action,
  data
) {

  // ===================================================
  // CREATE SHEET
  // ===================================================

  if (
    action ===
    "createSheet"
  ) {

    return createSheet(
      data
    );

  }


  // ===================================================
  // GET SHEETS
  // ===================================================

  if (
    action ===
    "getSheets"
  ) {

    return getSheets(
      data
    );

  }


  // ===================================================
  // GET SHEET DATA
  // ===================================================

  if (
    action ===
    "getSheetData"
  ) {

    return getSheetData(
      data
    );

  }


  // ===================================================
  // UPDATE SHEET CELL
  // ===================================================

  if (
    action ===
    "updateSheetCell"
  ) {

    return updateSheetCell(
      data
    );

  }


  // ===================================================
  // ADD SHEET ROW
  // ===================================================

  if (
    action ===
    "addSheetRow"
  ) {

    return addSheetRow(
      data
    );

  }


  // ===================================================
  // DELETE SHEET ROW
  // ===================================================

  if (
    action ===
    "deleteSheetRow"
  ) {

    return deleteSheetRow(
      data
    );

  }


  // ===================================================
  // SEARCH SHEET
  // ===================================================

  if (
    action ===
    "searchSheet"
  ) {

    return searchSheet(
      data
    );

  }


  // ===================================================
  // EXPORT SHEET
  // ===================================================

  if (
    action ===
    "exportSheet"
  ) {

    return exportSheet(
      data
    );

  }


  // ===================================================
  // CREATE DYNAMIC SHEET
  // ===================================================

  if (
    action ===
    "createDynamicSheet"
  ) {

    return createDynamicSheet(
      data
    );

  }


  // ===================================================
  // ADD COLUMNS
  // ===================================================

  if (
    action ===
    "addColumns"
  ) {

    return addColumns(
      data
    );

  }


  // ===================================================
  // DELETE SHEET
  // ===================================================

  if (
    action ===
    "deleteSheet"
  ) {

    return deleteSheet(
      data
    );

  }


  // ===================================================
  // RENAME SHEET
  // ===================================================

  if (
    action ===
    "renameSheet"
  ) {

    return renameSheet(
      data
    );

  }


  // ===================================================
  // NO SHEET ROUTE
  // ===================================================

  return null;

}