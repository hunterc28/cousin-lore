/**
 * Cousin Lore — Google Apps Script backend.
 *
 * Lives inside the Google Sheet that collects the stories (Extensions → Apps Script).
 * Deployed as a Web app ("Execute as: Me", "Who has access: Anyone"), it gives the
 * page two endpoints:
 *
 *   GET  → { ok, stories, cousins }           public counts shown on the page
 *   POST → { action: "add" | "delete", ... }  append a story, or remove one this device added
 *
 * Setup steps are in README.md.
 */

var SHEET_NAME = 'Stories';
var HEADERS = ['Submitted', 'Name', 'Story', 'Story ID', 'Device ID'];
var COL = { submitted: 0, name: 1, story: 2, id: 3, device: 4 };

function doGet() {
  var rows = getRows_();
  var names = {};
  rows.forEach(function (r) { var n = String(r[COL.name]).trim().toLowerCase(); if (n) names[n] = true; });
  return json_({ ok: true, stories: rows.length, cousins: Object.keys(names).length });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sheet = getSheet_();
    if (body.action === 'delete') return json_(deleteStory_(sheet, body));
    return json_(addStory_(sheet, body));
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function addStory_(sheet, body) {
  var name = String(body.name || '').trim().slice(0, 60);
  var story = String(body.story || '').trim().slice(0, 5000);
  var id = String(body.id || Utilities.getUuid()).slice(0, 64);
  var device = String(body.device || '').slice(0, 64);
  if (!name) return { ok: false, error: 'missing_name' };
  if (story.length < 3) return { ok: false, error: 'missing_story' };
  var when = body.ts ? new Date(Number(body.ts)) : new Date();
  if (isNaN(when.getTime())) when = new Date();

  // Force the text columns to plain-text format first so a story that starts
  // with "=" or "+" is stored literally instead of being treated as a formula.
  var row = sheet.getLastRow() + 1;
  var range = sheet.getRange(row, 1, 1, HEADERS.length);
  range.setNumberFormats([['yyyy-mm-dd hh:mm', '@', '@', '@', '@']]);
  range.setValues([[when, name, story, id, device]]);
  return { ok: true, id: id };
}

function deleteStory_(sheet, body) {
  var id = String(body.id || ''), device = String(body.device || '');
  if (!id || !device) return { ok: false, error: 'missing_id' };
  var values = sheet.getDataRange().getValues();
  for (var r = values.length - 1; r >= 1; r--) {
    if (String(values[r][COL.id]) === id && String(values[r][COL.device]) === device) {
      sheet.deleteRow(r + 1);
      return { ok: true };
    }
  }
  return { ok: false, error: 'not_found' };
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setColumnWidth(COL.story + 1, 520);
  }
  return sheet;
}

function getRows_() {
  var sheet = getSheet_();
  var n = sheet.getLastRow();
  if (n < 2) return [];
  return sheet.getRange(2, 1, n - 1, HEADERS.length).getValues().filter(function (r) { return r[COL.story]; });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
