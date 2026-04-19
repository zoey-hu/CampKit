// ─────────────────────────────────────────────────────────────
//  CampKit - Google Apps Script entry point
//  Serves the web UI (doGet) and handles checklist API (doPost)
// ─────────────────────────────────────────────────────────────

var SPREADSHEET_ID = '1JD8mO3fzBC0ve1Y0w-CvKYwLg9NRFJLOLe5EjHteEUA';
var SHEET_NAME     = 'main view';

// Column positions in the Sheet (1-indexed)
var COL_ID      = 1;  // A   (stable UUID per row)
var COL_BAG     = 2;  // B
var COL_NO_NEED = 3;  // C
var COL_ITEM    = 4;  // D
var COL_PACKED  = 5;  // E
var COL_NOTE    = 6;  // F
var NUM_COLS    = 6;

var DATA_START_ROW = 3; // row 1 blank, row 2 header

// ── Entry points ─────────────────────────────────────────────

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'get_checklist') {
    return jsonOutput(getSheetChecklist());
  }
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('CampKit')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var result;
    switch (p.action) {
      case 'toggle_packed':
        result = setCellBoolById(p.id, COL_PACKED, p.value);
        break;
      case 'toggle_no_need':
        result = setCellBoolById(p.id, COL_NO_NEED, p.value);
        break;
      case 'add_item':
        result = addItem(p.bag, p.item, p.note);
        break;
      case 'update_item':
        result = updateItem(p.id, p.bag, p.item, p.note);
        break;
      case 'delete_item':
        result = deleteItem(p.id);
        break;
      default:
        throw { message: 'Unknown action: ' + p.action };
    }
    return jsonOutput({ ok: true, data: result });
  } catch (err) {
    return jsonOutput({ ok: false, error: err.message || String(err) });
  }
}

// ── Sheet read ───────────────────────────────────────────────

function getSheetChecklist() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var lastRow = sheet.getLastRow();

  if (lastRow < DATA_START_ROW) {
    return { ok: true, data: { items: [], bags: [], tripName: ss.getName() } };
  }

  var numRows = lastRow - DATA_START_ROW + 1;
  var range = sheet.getRange(DATA_START_ROW, 1, numRows, NUM_COLS);
  var values = range.getValues();

  // Backfill missing IDs in one batch.
  var backfilled = false;
  for (var i = 0; i < values.length; i++) {
    var item = String(values[i][COL_ITEM - 1] || '').trim();
    if (!item) continue;

    var id = String(values[i][COL_ID - 1] || '').trim();
    if (!id) {
      values[i][COL_ID - 1] = Utilities.getUuid();
      backfilled = true;
    }
  }
  if (backfilled) {
    range.setValues(values);
  }

  var items = [];
  var bags = [];
  var bagsSeen = {};

  for (var j = 0; j < values.length; j++) {
    var row = values[j];
    var itemName = String(row[COL_ITEM - 1] || '').trim();
    if (!itemName) continue;

    var bag = String(row[COL_BAG - 1] || '').trim();
    var noNeed = parseBool(row[COL_NO_NEED - 1]);
    var packed = parseBool(row[COL_PACKED - 1]);
    var note = String(row[COL_NOTE - 1] || '').trim();
    var rowId = String(row[COL_ID - 1] || '').trim();

    if (bag && !bagsSeen[bag]) {
      bagsSeen[bag] = true;
      bags.push(bag);
    }

    items.push({
      id: rowId,
      bag: bag,
      item: itemName,
      note: note,
      packed: packed,
      noNeed: noNeed
    });
  }

  return { ok: true, data: { items: items, bags: bags, tripName: ss.getName() } };
}

// ── Sheet write ──────────────────────────────────────────────

function setCellBoolById(id, col, value) {
  if (!id) throw { message: 'missing id' };

  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  var rowIndex = findMainViewRowIndexById(sheet, id);
  var boolVal = (value === true || value === 'true' || value === 'TRUE');

  sheet.getRange(rowIndex, col).setValue(boolVal);
  return { id: id, col: col, value: boolVal };
}

function addItem(bag, item, note) {
  var cleanItem = String(item || '').trim();
  if (!cleanItem) throw { message: 'item required' };

  var cleanBag = String(bag || '').trim() || '未分類';
  var cleanNote = String(note || '').trim();
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  var id = Utilities.getUuid();

  // Append first, then sort so the new row lands inside its category block.
  sheet.appendRow([id, cleanBag, false, cleanItem, false, cleanNote]);
  sortByCategory(sheet);

  return { id: id, bag: cleanBag, item: cleanItem, note: cleanNote };
}

function updateItem(id, bag, item, note) {
  if (!id) throw { message: 'missing id' };

  var cleanItem = String(item || '').trim();
  if (!cleanItem) throw { message: 'item required' };

  var cleanBag = String(bag || '').trim();
  if (!cleanBag) throw { message: 'bag required' };

  var cleanNote = String(note || '').trim();
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  var rowIndex = findMainViewRowIndexById(sheet, id);

  sheet.getRange(rowIndex, COL_BAG).setValue(cleanBag);
  sheet.getRange(rowIndex, COL_ITEM).setValue(cleanItem);
  sheet.getRange(rowIndex, COL_NOTE).setValue(cleanNote);
  sortByCategory(sheet);

  return { id: id, bag: cleanBag, item: cleanItem, note: cleanNote };
}

function deleteItem(id) {
  if (!id) throw { message: 'missing id' };

  try {
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('sheet not found: ' + SHEET_NAME);

    var rowIndex = findMainViewRowIndexById(sheet, id);
    deleteMainViewRow(sheet, rowIndex);
  } catch (err) {
    var detail = err && err.message ? err.message : String(err);
    throw { message: 'delete_item failed: ' + detail };
  }

  return { id: id, deleted: true };
}

// ── Sort by category (first-appearance order, stable within bag) ─

function sortByCategory(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW + 1) return;

  var numRows = lastRow - DATA_START_ROW + 1;
  var range = sheet.getRange(DATA_START_ROW, 1, numRows, NUM_COLS);
  var values = range.getValues();

  var bagOrder = {};
  var next = 0;
  for (var i = 0; i < values.length; i++) {
    var bag = String(values[i][COL_BAG - 1] || '').trim();
    if (bag && !(bag in bagOrder)) {
      bagOrder[bag] = next++;
    }
  }

  var indexed = values.map(function(row, idx) {
    return { row: row, idx: idx };
  });

  indexed.sort(function(a, b) {
    var aBag = String(a.row[COL_BAG - 1] || '').trim();
    var bBag = String(b.row[COL_BAG - 1] || '').trim();
    var aOrd = (aBag in bagOrder) ? bagOrder[aBag] : 9999;
    var bOrd = (bBag in bagOrder) ? bagOrder[bBag] : 9999;
    if (aOrd !== bOrd) return aOrd - bOrd;
    return a.idx - b.idx;
  });

  var sorted = indexed.map(function(entry) {
    return entry.row;
  });

  // Only write if the order actually changed.
  var same = true;
  for (var k = 0; k < values.length; k++) {
    if (values[k] !== sorted[k]) {
      same = false;
      break;
    }
  }

  if (!same) {
    range.setValues(sorted);
  }
}

// ── onEdit: auto-sort when category column changes ──────────
// Simple trigger: only fires on direct user edits in the Sheet
// (not on setValue from Apps Script), so no recursion risk.

function onEdit(e) {
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  if (e.range.getRow() < DATA_START_ROW) return;
  if (e.range.getColumn() !== COL_BAG) return;

  sortByCategory(sheet);
}

// ── Helpers ─────────────────────────────────────────────────

function parseBool(val) {
  return val === true || val === 'TRUE' || val === 'true';
}

function findMainViewRowIndexById(sheet, id) {
  if (!sheet) throw { message: 'sheet required' };

  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) throw { message: 'empty sheet' };

  var ids = sheet.getRange(DATA_START_ROW, COL_ID, lastRow - DATA_START_ROW + 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(id).trim()) {
      return DATA_START_ROW + i;
    }
  }

  throw { message: 'id not found: ' + id };
}

function deleteMainViewRow(sheet, rowIndex) {
  if (!sheet) throw { message: 'sheet required' };
  if (rowIndex < DATA_START_ROW) throw { message: 'invalid row index' };

  try {
    sheet
      .getRange(rowIndex, 1, 1, NUM_COLS)
      .deleteCells(SpreadsheetApp.Dimension.ROWS);
  } catch (err) {
    throw new Error('delete row failed at row ' + rowIndex + ': ' + (err.message || String(err)));
  }
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Optional: menu button for manual sort ───────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('CampKit')
    .addItem('依類別排序', 'sortByCategoryMenu')
    .addToUi();
}

function sortByCategoryMenu() {
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  sortByCategory(sheet);
  SpreadsheetApp.getUi().alert('已依類別重新排序');
}

// ── Manual test helpers ─────────────────────────────────────

function testDeleteItemById() {
  var testId = 'PUT_ITEM_ID_HERE';
  var result = deleteItem(testId);
  Logger.log(JSON.stringify(result));
  return result;
}

function testDeleteFirstVisibleItem() {
  var checklist = getSheetChecklist();
  if (!checklist.ok || !checklist.data.items.length) {
    throw new Error('no checklist items available for testing');
  }

  var target = checklist.data.items[0];
  Logger.log('Deleting first visible item: ' + JSON.stringify(target));
  var result = deleteItem(target.id);
  Logger.log(JSON.stringify(result));
  return result;
}

function testClearRowByNumber() {
  var testRow = DATA_START_ROW;
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
  deleteMainViewRow(sheet, testRow);
  Logger.log('Deleted row ' + testRow);
}
