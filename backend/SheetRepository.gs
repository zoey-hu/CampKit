function getSpreadsheet() {
  if (APP_CONFIG.spreadsheetId) {
    return SpreadsheetApp.openById(APP_CONFIG.spreadsheetId);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheetConfig(sheetKey) {
  var sheetConfig = APP_CONFIG.sheets[sheetKey];
  if (!sheetConfig) {
    throwKnownError('CONFIG_ERROR', 'Unknown sheet key: ' + sheetKey);
  }
  return sheetConfig;
}

function getSheet(sheetKey) {
  var sheetConfig = getSheetConfig(sheetKey);
  var sheet = getSpreadsheet().getSheetByName(sheetConfig.name);
  if (!sheet) {
    throwKnownError('SHEET_NOT_FOUND', 'Sheet not found: ' + sheetConfig.name);
  }
  return sheet;
}

function getHeaderIndexMap(headers) {
  return headers.reduce(function(acc, header, index) {
    acc[header] = index;
    return acc;
  }, {});
}

function ensureSheetHeaders(sheetKey) {
  var config = getSheetConfig(sheetKey);
  var sheet = getSheet(sheetKey);
  var firstRow = sheet.getRange(1, 1, 1, config.headers.length).getValues()[0];
  var needsInitialization = config.headers.some(function(header, index) {
    return firstRow[index] !== header;
  });

  if (needsInitialization) {
    sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
  }
}

function getAllRows(sheetKey) {
  ensureSheetHeaders(sheetKey);

  var config = getSheetConfig(sheetKey);
  var sheet = getSheet(sheetKey);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  var rows = sheet.getRange(2, 1, lastRow - 1, config.headers.length).getValues();
  return rows.map(function(row) {
    return mapRowToObject(config.headers, row);
  }).filter(function(item) {
    return item[config.idField];
  });
}

function mapRowToObject(headers, row) {
  return headers.reduce(function(acc, header, index) {
    acc[header] = row[index];
    return acc;
  }, {});
}

function buildRowFromObject(sheetKey, data) {
  var config = getSheetConfig(sheetKey);
  return config.headers.map(function(header) {
    return data[header] !== undefined ? data[header] : '';
  });
}

function appendRows(sheetKey, rows) {
  if (!rows.length) {
    return;
  }

  ensureSheetHeaders(sheetKey);

  var sheet = getSheet(sheetKey);
  var values = rows.map(function(row) {
    return buildRowFromObject(sheetKey, row);
  });

  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);
}

function findRowIndexById(sheetKey, id) {
  var config = getSheetConfig(sheetKey);
  var sheet = getSheet(sheetKey);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return -1;
  }

  var idColumnIndex = config.headers.indexOf(config.idField) + 1;
  var values = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();

  for (var i = 0; i < values.length; i += 1) {
    if (String(values[i][0]) === String(id)) {
      return i + 2;
    }
  }

  return -1;
}

function updateRowById(sheetKey, id, updates) {
  ensureSheetHeaders(sheetKey);

  var rowIndex = findRowIndexById(sheetKey, id);
  if (rowIndex === -1) {
    throwKnownError('NOT_FOUND', 'Row not found for id: ' + id);
  }

  var config = getSheetConfig(sheetKey);
  var sheet = getSheet(sheetKey);
  var currentRow = sheet.getRange(rowIndex, 1, 1, config.headers.length).getValues()[0];
  var currentData = mapRowToObject(config.headers, currentRow);
  var nextRow = buildRowFromObject(sheetKey, mergeObjects(currentData, updates));

  sheet.getRange(rowIndex, 1, 1, nextRow.length).setValues([nextRow]);
  return mapRowToObject(config.headers, nextRow);
}

function deleteRowById(sheetKey, id) {
  var rowIndex = findRowIndexById(sheetKey, id);
  if (rowIndex === -1) {
    throwKnownError('NOT_FOUND', 'Row not found for id: ' + id);
  }
  getSheet(sheetKey).deleteRow(rowIndex);
}

function deleteRowsByField(sheetKey, fieldName, fieldValue) {
  var config = getSheetConfig(sheetKey);
  var fieldIndex = config.headers.indexOf(fieldName);

  if (fieldIndex === -1) {
    throwKnownError('CONFIG_ERROR', 'Unknown field on sheet: ' + fieldName);
  }

  var sheet = getSheet(sheetKey);
  var rows = getAllRows(sheetKey);
  var indexesToDelete = [];

  rows.forEach(function(row, index) {
    if (String(row[fieldName]) === String(fieldValue)) {
      indexesToDelete.push(index + 2);
    }
  });

  indexesToDelete.reverse().forEach(function(rowIndex) {
    sheet.deleteRow(rowIndex);
  });
}

function getRowById(sheetKey, id) {
  var config = getSheetConfig(sheetKey);
  return getAllRows(sheetKey).filter(function(item) {
    return String(item[config.idField]) === String(id);
  })[0] || null;
}

function filterRowsByField(sheetKey, fieldName, fieldValue) {
  return getAllRows(sheetKey).filter(function(item) {
    return String(item[fieldName]) === String(fieldValue);
  });
}

function mergeObjects(baseObject, updates) {
  var merged = {};
  var key;

  for (key in baseObject) {
    if (baseObject.hasOwnProperty(key)) {
      merged[key] = baseObject[key];
    }
  }

  for (key in updates) {
    if (updates.hasOwnProperty(key) && updates[key] !== undefined) {
      merged[key] = updates[key];
    }
  }

  return merged;
}
