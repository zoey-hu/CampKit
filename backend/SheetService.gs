// ─────────────────────────────────────────────────────────────
//  SheetService – reads / writes the flat checklist sheet
//
//  Sheet layout (row 1 = header):
//    A(1)  – empty
//    B(2)  – Bag       (category name, e.g. "露營用品")
//    C(3)  – No Need   (TRUE/FALSE – skip for this trip)
//    D(4)  – Item      (gear name)
//    E(5)  – Packed    (TRUE/FALSE)
//    F(6)  – Note      (storage location / remark)
//    G–J   – Bag-view summary block (read-only, we don't touch it)
// ─────────────────────────────────────────────────────────────

function getActiveSheet() {
  return SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName(SHEET_NAME);
}

// Returns { tripName, bags, items }
function getChecklist() {
  var sheet = getActiveSheet();
  var ss    = sheet.getParent();

  var lastRow = sheet.getLastRow();
  var items   = [];
  var bagOrder = [];
  var bagSeen  = {};

  if (lastRow >= DATA_START_ROW) {
    var numRows = lastRow - DATA_START_ROW + 1;
    var data    = sheet.getRange(DATA_START_ROW, 1, numRows, COL_NOTE).getValues();

    data.forEach(function(row, i) {
      var itemName = String(row[COL_ITEM - 1] || '').trim();
      if (!itemName) return; // skip empty rows

      var bag = String(row[COL_BAG - 1] || '').trim();

      if (bag && !bagSeen[bag]) {
        bagSeen[bag] = true;
        bagOrder.push(bag);
      }

      items.push({
        rowIndex : DATA_START_ROW + i,
        bag      : bag,
        noNeed   : parseBoolean(row[COL_NO_NEED - 1]),
        item     : itemName,
        packed   : parseBoolean(row[COL_PACKED - 1]),
        note     : String(row[COL_NOTE - 1] || '').trim()
      });
    });
  }

  return {
    tripName : ss.getName(),
    bags     : bagOrder,
    items    : items
  };
}

// Writes a single boolean cell and returns the new value
function setCellBool(rowIndex, col, value) {
  var boolVal = (value === true || value === 'true' || value === 'TRUE');
  getActiveSheet().getRange(rowIndex, col).setValue(boolVal);
  return { rowIndex: rowIndex, col: col, value: boolVal };
}

// ── Shared boolean parser (reuses Utils.gs if present) ───────
function parseBoolean(v) {
  if (v === true)  return true;
  if (v === false) return false;
  var s = String(v).trim().toUpperCase();
  return s === 'TRUE' || s === '1' || s === 'YES';
}
