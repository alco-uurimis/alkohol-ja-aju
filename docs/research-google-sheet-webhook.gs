const SPREADSHEET_ID = '1U4vVdsnYMPq-CZRbXxm_rqNk-n9kF4Chtu-wl5pz7Lg';
const SHEET_NAME = 'Responses';
const PUBLIC_MIN_N = 10;      // minimum valid responses before anything is public
const PUBLIC_MIN_GROUP = 5;   // minimum size of any single published category
const CURRENT_SCHEMA_VERSION = '4';

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json({ ok: true, service: 'research-sheet-webhook', version: 11 });
}

function requireSecret(body) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expectedSecret) return 'missing_secret';
  if (!body.secret || body.secret !== expectedSecret) return 'forbidden';
  return '';
}

function headerIndex(headers, name) {
  const index = headers.indexOf(name);
  return index >= 0 ? index : -1;
}

function readCell(row, headers, name) {
  const index = headerIndex(headers, name);
  return index >= 0 ? String(row[index] || '').trim() : '';
}

function countAnswered(rows, headers, name) {
  return rows.filter(row => Boolean(readCell(row, headers, name))).length;
}

function countField(rows, headers, name) {
  const counts = {};
  rows.forEach(row => {
    const code = readCell(row, headers, name);
    if (!code) return;
    counts[code] = (counts[code] || 0) + 1;
  });
  const published = {};
  Object.keys(counts).sort().forEach(code => {
    if (counts[code] >= PUBLIC_MIN_GROUP) published[code] = counts[code];
  });
  return published;
}

function isValidCurrentResponse(row, headers) {
  return readCell(row, headers, 'version') === CURRENT_SCHEMA_VERSION &&
    readCell(row, headers, 'ageEligible15Plus') === 'yes' &&
    readCell(row, headers, 'consent') === 'yes' &&
    Boolean(readCell(row, headers, 'response_id'));
}

function aggregate(sheet) {
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  if (lastColumn < 1 || lastRow < 1) {
    return { ok: true, schemaVersion: 4, n: 0, publishable: false, minimumGroupSize: PUBLIC_MIN_N, lastUpdated: new Date().toISOString() };
  }

  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(v => String(v || '').trim());
  const requiredHeaders = ['response_id','version','ageEligible15Plus','consent','ageGroup','ownUse','overallImpact','helpKnowledge'];
  const missing = requiredHeaders.filter(name => headerIndex(headers, name) < 0);
  if (missing.length) return { ok: false, error: 'missing_headers', missing };

  const totalStoredRows = Math.max(0, lastRow - 1);
  const allRows = totalStoredRows ? sheet.getRange(2, 1, totalStoredRows, lastColumn).getDisplayValues() : [];
  const rows = allRows.filter(row => isValidCurrentResponse(row, headers));
  const n = rows.length;
  const base = {
    ok: true,
    schemaVersion: Number(CURRENT_SCHEMA_VERSION),
    n,
    publishable: n >= PUBLIC_MIN_N,
    minimumGroupSize: PUBLIC_MIN_N,
    lastUpdated: new Date().toISOString()
  };
  if (n < PUBLIC_MIN_N) return base;

  return Object.assign(base, {
    ageGroup: countField(rows, headers, 'ageGroup'),
    ownUse: countField(rows, headers, 'ownUse'),
    overallImpact: countField(rows, headers, 'overallImpact'),
    helpKnowledge: countField(rows, headers, 'helpKnowledge'),
    // How many people answered each question. Lets the public API tell "some people skipped this question"
    // apart from "a small category was hidden" (the latter must still withhold the chart).
    answered: {
      ageGroup: countAnswered(rows, headers, 'ageGroup'),
      ownUse: countAnswered(rows, headers, 'ownUse'),
      overallImpact: countAnswered(rows, headers, 'overallImpact'),
      helpKnowledge: countAnswered(rows, headers, 'helpKnowledge')
    }
  });
}

// Admin-only: every question, every category, no suppression. Reachable only with the webhook secret, which only the
// private Vercel API holds, and that API releases the result only to allow-listed signed-in admins.
const ADMIN_SINGLE_FIELDS = ['language','ageGroup','ownUse','typicalUnits','sixPlus','peerNorm','closeExposure','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice'];
const ADMIN_MULTI_FIELDS = ['contexts','closeRelations'];

function adminAggregate(sheet) {
  const lastColumn = sheet.getLastColumn();
  const lastRow = sheet.getLastRow();
  const now = new Date().toISOString();
  if (lastColumn < 1 || lastRow < 2) return { ok: true, n: 0, excluded: 0, lastUpdated: now, fields: {}, answered: {} };
  const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(v => String(v || '').trim());
  const allRows = sheet.getRange(2, 1, lastRow - 1, lastColumn).getDisplayValues();
  const rows = allRows.filter(row => isValidCurrentResponse(row, headers));
  const fields = {};
  const answered = {};
  ADMIN_SINGLE_FIELDS.concat(ADMIN_MULTI_FIELDS).forEach(name => {
    const multi = ADMIN_MULTI_FIELDS.indexOf(name) >= 0;
    const counts = {};
    let people = 0;
    rows.forEach(row => {
      const raw = readCell(row, headers, name);
      if (!raw) return;
      people += 1;
      (multi ? raw.split('|') : [raw]).map(v => v.trim()).filter(Boolean).forEach(code => { counts[code] = (counts[code] || 0) + 1; });
    });
    fields[name] = counts;
    answered[name] = people;
  });
  return { ok: true, n: rows.length, excluded: allRows.length - rows.length, lastUpdated: now, fields: fields, answered: answered };
}

// Admin-only: permanently remove one response row by its response_id (Google Sheets version history can restore it).
function deleteResponse(sheet, responseId) {
  if (!/^research_[a-z0-9_-]{8,90}$/i.test(responseId)) return { ok: false, error: 'invalid_response_id' };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lastColumn = sheet.getLastColumn();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return { ok: true, deleted: false };
    const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(v => String(v || '').trim());
    const idIndex = headerIndex(headers, 'response_id');
    if (idIndex < 0) return { ok: false, error: 'missing_response_id_header' };
    const ids = sheet.getRange(2, idIndex + 1, lastRow - 1, 1).getDisplayValues().flat().map(v => String(v).trim());
    const at = ids.indexOf(responseId);
    if (at < 0) return { ok: true, deleted: false };
    sheet.deleteRow(at + 2);
    SpreadsheetApp.flush();
    return { ok: true, deleted: true };
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (error) { return json({ ok: false, error: 'invalid_json' }); }

  const authError = requireSecret(body);
  if (authError) return json({ ok: false, error: authError });
  if (body.health === true) return json({ ok: true, health: true, version: 7 });

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) return json({ ok: false, error: 'missing_sheet' });
  if (body.aggregate === true) return json(aggregate(sheet));
  if (body.adminAggregate === true) return json(adminAggregate(sheet));
  if (body.adminAction === 'deleteResponse') return json(deleteResponse(sheet, String(body.responseId || '').trim()));

  const r = body.response || {};
  const responseId = String(r.response_id || '').trim();
  if (!responseId) return json({ ok: false, error: 'missing_response_id' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lastColumn = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0].map(v => String(v || '').trim());
    const idIndex = headerIndex(headers, 'response_id');
    if (idIndex < 0) return json({ ok: false, error: 'missing_response_id_header' });

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, idIndex + 1, lastRow - 1, 1).getDisplayValues().flat();
      if (ids.includes(responseId)) return json({ ok: true, duplicate: true, version: 7 });
    }

    const joinList = value => Array.isArray(value) ? value.join(' | ') : (value ?? '');
    const valuesByHeader = {
      submitted_at: r.submitted_at || new Date().toISOString(),
      response_id: responseId,
      language: r.language || '',
      version: r.version || '',
      ageEligible15Plus: r.ageEligible15Plus || r.adult || '',
      consent: r.consent || '',
      ageGroup: r.ageGroup || '',
      ownUse: r.ownUse || '',
      last30_legacy: r.last30 || '',
      typicalUnits: r.typicalUnits || '',
      sixPlus: r.sixPlus || '',
      contexts: joinList(r.contexts),
      peerNorm: r.peerNorm || '',
      closeExposure: r.closeExposure || '',
      closeRelations: joinList(r.closeRelations),
      closeHousehold: r.closeHousehold || '',
      closeConflict: r.closeConflict || '',
      closeUnsafe: r.closeUnsafe || '',
      worry: r.worry || '',
      sleep: r.sleep || '',
      study: r.study || '',
      mood: r.mood || '',
      avoid: r.avoid || '',
      unsafe: r.unsafe || '',
      extraResponsibility: r.extraResponsibility || '',
      overallImpact: r.overallImpact || '',
      pressure: r.pressure || '',
      refusalNormal: r.refusalNormal || '',
      helpKnowledge: r.helpKnowledge || '',
      supportChoice: r.supportChoice || '',
      minorConsent: r.minorConsent || ''
    };

    const row = headers.map(header => Object.prototype.hasOwnProperty.call(valuesByHeader, header) ? valuesByHeader[header] : '');
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return json({ ok: true, duplicate: false, version: 7 });
  } finally {
    lock.releaseLock();
  }
}
