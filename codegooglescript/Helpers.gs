// =====================================================
// HELPERS.GS
// Shared Backend Helper Functions
// Cloud Project Platform
// =====================================================


// =====================================================
// SAFE VALUE HELPERS
// =====================================================

function safeString(value, defaultValue) {

  if (
    value === null ||
    value === undefined
  ) {
    return defaultValue || "";
  }

  return String(value).trim();

}


function safeNumber(value, defaultValue) {

  const number = Number(value);

  if (isNaN(number)) {
    return defaultValue || 0;
  }

  return number;

}


function safeBoolean(value, defaultValue) {

  if (
    value === true ||
    value === false
  ) {
    return value;
  }

  if (
    value === "true" ||
    value === "TRUE" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "FALSE" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return defaultValue || false;

}


// =====================================================
// OBJECT HELPERS
// =====================================================

function isObject(value) {

  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );

}


function isEmptyObject(value) {

  return (
    isObject(value) &&
    Object.keys(value).length === 0
  );

}


function hasProperty(object, property) {

  return (
    isObject(object) &&
    Object.prototype.hasOwnProperty.call(
      object,
      property
    )
  );

}


function getProperty(
  object,
  property,
  defaultValue
) {

  if (
    !isObject(object) ||
    !hasProperty(object, property)
  ) {
    return defaultValue;
  }

  return object[property];

}


// =====================================================
// ARRAY HELPERS
// =====================================================

function ensureArray(value) {

  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  return [value];

}


function removeDuplicates(array) {

  if (!Array.isArray(array)) {
    return [];
  }

  return Array.from(
    new Set(array)
  );

}


function arrayContains(
  array,
  value
) {

  if (!Array.isArray(array)) {
    return false;
  }

  return array.indexOf(value) !== -1;

}


// =====================================================
// STRING HELPERS
// =====================================================

function normalizeString(value) {

  return safeString(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

}


function normalizeEmail(email) {

  return safeString(email)
    .toLowerCase();

}


function normalizeUsername(username) {

  return safeString(username)
    .toLowerCase();

}


function isBlank(value) {

  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );

}


// =====================================================
// EMAIL HELPERS
// =====================================================

function isValidEmail(email) {

  email =
    normalizeEmail(email);

  if (!email) {
    return false;
  }

  const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return pattern.test(email);

}


// =====================================================
// ID HELPERS
// =====================================================

function isValidId(id) {

  if (
    id === null ||
    id === undefined
  ) {
    return false;
  }

  return String(id).trim() !== "";

}


// =====================================================
// DATE HELPERS
// =====================================================

function now() {

  return new Date();

}


function isValidDate(value) {

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return !isNaN(
    date.getTime()
  );

}


function addMinutes(
  date,
  minutes
) {

  const result =
    new Date(
      date || new Date()
    );

  result.setMinutes(
    result.getMinutes() +
    Number(minutes || 0)
  );

  return result;

}


function addHours(
  date,
  hours
) {

  return addMinutes(
    date,
    Number(hours || 0) * 60
  );

}


function addDays(
  date,
  days
) {

  const result =
    new Date(
      date || new Date()
    );

  result.setDate(
    result.getDate() +
    Number(days || 0)
  );

  return result;

}


function isExpired(
  expiry
) {

  if (!expiry) {
    return true;
  }

  const expiryDate =
    new Date(expiry);

  if (
    isNaN(
      expiryDate.getTime()
    )
  ) {
    return true;
  }

  return (
    expiryDate.getTime() <=
    Date.now()
  );

}


// =====================================================
// JSON HELPERS
// =====================================================

function safeJsonParse(
  value,
  defaultValue
) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return (
      defaultValue !== undefined
        ? defaultValue
        : null
    );
  }

  try {

    return JSON.parse(value);

  } catch (error) {

    return (
      defaultValue !== undefined
        ? defaultValue
        : null
    );

  }

}


function safeJsonStringify(
  value,
  defaultValue
) {

  try {

    return JSON.stringify(value);

  } catch (error) {

    return (
      defaultValue !== undefined
        ? defaultValue
        : "{}"
    );

  }

}


// =====================================================
// SHEET HELPERS
// =====================================================

function getLastRowSafe(
  sheet
) {

  if (!sheet) {
    return 0;
  }

  return sheet.getLastRow();

}


function getLastColumnSafe(
  sheet
) {

  if (!sheet) {
    return 0;
  }

  return sheet.getLastColumn();

}


function isSheetEmpty(
  sheet
) {

  if (!sheet) {
    return true;
  }

  return (
    sheet.getLastRow() <= 1
  );

}


// =====================================================
// ROW HELPERS
// =====================================================

function getRowValue(
  row,
  column
) {

  if (
    !Array.isArray(row) ||
    !column
  ) {
    return null;
  }

  return (
    row[column - 1] !== undefined
      ? row[column - 1]
      : null
  );

}


function setRowValue(
  row,
  column,
  value
) {

  if (
    !Array.isArray(row) ||
    !column
  ) {
    return row;
  }

  row[column - 1] =
    value;

  return row;

}


// =====================================================
// SEARCH HELPERS
// =====================================================

function equalsIgnoreCase(
  value1,
  value2
) {

  return (
    normalizeString(value1) ===
    normalizeString(value2)
  );

}


function containsIgnoreCase(
  value,
  search
) {

  const source =
    normalizeString(value);

  const target =
    normalizeString(search);

  if (!target) {
    return true;
  }

  return source.indexOf(
    target
  ) !== -1;

}


// =====================================================
// PAGINATION
// =====================================================

function paginate(
  items,
  page,
  limit
) {

  items =
    Array.isArray(items)
      ? items
      : [];

  page =
    Math.max(
      1,
      Number(page || 1)
    );

  limit =
    Math.max(
      1,
      Number(limit || 20)
    );

  const total =
    items.length;

  const totalPages =
    Math.ceil(
      total / limit
    );

  const start =
    (page - 1) * limit;

  const data =
    items.slice(
      start,
      start + limit
    );

  return {

    data: data,

    pagination: {

      page: page,

      limit: limit,

      total: total,

      totalPages: totalPages,

      hasNext:
        page < totalPages,

      hasPrevious:
        page > 1

    }

  };

}


// =====================================================
// OBJECT CLEANUP
// =====================================================

function removeUndefinedProperties(
  object
) {

  if (!isObject(object)) {
    return {};
  }

  const result = {};

  Object.keys(object)
    .forEach(
      function(key) {

        if (
          object[key] !==
          undefined
        ) {

          result[key] =
            object[key];

        }

      }
    );

  return result;

}


// =====================================================
// CLONE OBJECT
// =====================================================

function cloneObject(
  object
) {

  if (!isObject(object)) {
    return object;
  }

  return JSON.parse(
    JSON.stringify(object)
  );

}


// =====================================================
// ERROR HELPERS
// =====================================================

function getErrorMessage(
  error
) {

  if (!error) {
    return "Unknown error";
  }

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  if (
    error.message
  ) {
    return String(
      error.message
    );
  }

  return String(error);

}


// =====================================================
// SAFE EXECUTION
// =====================================================

function safeExecute(
  callback,
  fallback
) {

  try {

    return callback();

  } catch (error) {

    console.error(
      getErrorMessage(error)
    );

    return fallback;

  }

}


// =====================================================
// LOCK HELPERS
// =====================================================

function withScriptLock(
  callback,
  timeout
) {

  const lock =
    LockService.getScriptLock();

  const lockTimeout =
    Number(
      timeout || 10000
    );

  if (
    !lock.tryLock(
      lockTimeout
    )
  ) {

    throw new Error(
      "System is busy. Please try again."
    );

  }

  try {

    return callback();

  } finally {

    lock.releaseLock();

  }

}


// =====================================================
// CACHE HELPERS
// =====================================================

function getScriptCache() {

  return CacheService
    .getScriptCache();

}


function getUserCache() {

  return CacheService
    .getUserCache();

}


// =====================================================
// PROPERTY HELPERS
// =====================================================

function getScriptProperty(
  key,
  defaultValue
) {

  const value =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  return (
    value === null
      ? defaultValue
      : value
  );

}


function setScriptProperty(
  key,
  value
) {

  PropertiesService
    .getScriptProperties()
    .setProperty(
      key,
      String(value)
    );

}


// =====================================================
// LOGGING HELPER
// =====================================================

function debugLog(
  label,
  data
) {

  console.log(
    "[" +
    String(label || "DEBUG") +
    "]",
    data
  );

}