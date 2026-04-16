// ─────────────────────────────────────────────────────────────
//  CampKit – Google Apps Script entry point
//  Serves the web UI (doGet) and handles checklist API (doPost)
// ─────────────────────────────────────────────────────────────

var SPREADSHEET_ID = '1hwlRQ8-S2juhuhyfaIiGg2_U5TBJjfSDQDGws9HCQ_Y';
var SHEET_NAME     = 'main view';

// Column positions in the Sheet (1-indexed)
var COL_BAG     = 2;  // B
var COL_NO_NEED = 3;  // C
var COL_ITEM    = 4;  // D
var COL_PACKED  = 5;  // E
var COL_NOTE    = 6;  // F

var DATA_START_ROW = 2; // row 1 is the header

// ── Entry points ─────────────────────────────────────────────

function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'get_checklist') {
    return jsonOutput(getChecklist());
  }
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('CampKit')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    var result;
    switch (p.action) {
      case 'toggle_packed':
        result = setCellBool(p.rowIndex, COL_PACKED, p.value);
        break;
      case 'toggle_no_need':
        result = setCellBool(p.rowIndex, COL_NO_NEED, p.value);
        break;
      default:
        throw { message: 'Unknown action: ' + p.action };
    }
    return jsonOutput({ ok: true, data: result });
  } catch (err) {
    return jsonOutput({ ok: false, error: err.message });
  }
}

// ── Helpers ───────────────────────────────────────────────────

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
