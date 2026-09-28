const SPREADSHEET_ID = '1U4vVdsnYMPq-CZRbXxm_rqNk-n9kF4Chtu-wl5pz7Lg';
const SHEET_NAME = 'Responses';
const PUBLIC_MIN_N = 10;
const CURRENT_SCHEMA_VERSION = '4';

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json({ ok: true, service: 'research-sheet-webhook', version: 6 });
}

function requireSecret(body) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expectedSecret) return 'missing_secret';
  if (!body.secret || body.secret !== expectedSecret) return 'forbidden';
  return '';
}

function countColumn(rows, index) {
  const counts = {};
  rows.forEach(row => {
    const code = String(row[index] || '').trim();
    if (!code) return;
    counts[code] = (counts[code] || 0) + 1;
  });
  const published = {};
  Object.keys(counts).sort().forEach(code => {
    if (counts[code] >= PUBLIC_MIN_N) published[code] = counts[code];
  });
  return published;
}

function isValidCurrentResponse(row) {
  return String(row[3] || '').trim() === CURRENT_SCHEMA_VERSION &&
    String(row[4] || '').trim() === 'yes' &&
    String(row[5] || '').trim() === 'yes' &&
    Boolean(String(row[1] || '').trim());
}

function aggregate(sheet) {
  const lastRow = sheet.getLastRow();
  const totalStoredRows = Math.max(0, lastRow - 1);
  const allRows = totalStoredRows ? sheet.getRange(2, 1, totalStoredRows, 31).getDisplayValues() : [];
  const rows = allRows.filter(isValidCurrentResponse);
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
    ageGroup: countColumn(rows, 6),
    ownUse: countColumn(rows, 7),
    overallImpact: countColumn(rows, 25),
    helpKnowledge: countColumn(rows, 28)
  });
}

function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (error) { return json({ ok: false, error: 'invalid_json' }); }

  const authError = requireSecret(body);
  if (authError) return json({ ok: false, error: authError });
  if (body.health === true) return json({ ok: true, health: true, version: 6 });

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) return json({ ok: false, error: 'missing_sheet' });
  if (body.aggregate === true) return json(aggregate(sheet));

  const r = body.response || {};
  const responseId = String(r.response_id || '').trim();
  if (!responseId) return json({ ok: false, error: 'missing_response_id' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 2, lastRow - 1, 1).getDisplayValues().flat();
      if (ids.includes(responseId)) return json({ ok: true, duplicate: true });
    }
    const joinList = value => Array.isArray(value) ? value.join(' | ') : (value ?? '');
    sheet.appendRow([
      r.submitted_at || new Date().toISOString(), responseId, r.language || '', r.version || '',
      r.ageEligible15Plus || r.adult || '', r.consent || '', r.ageGroup || '', r.ownUse || '', r.last30 || '',
      r.typicalUnits || '', r.sixPlus || '', joinList(r.contexts), r.peerNorm || '', r.closeExposure || '',
      joinList(r.closeRelations), r.closeHousehold || '', r.closeConflict || '', r.closeUnsafe || '', r.worry || '',
      r.sleep || '', r.study || '', r.mood || '', r.avoid || '', r.unsafe || '', r.extraResponsibility || '',
      r.overallImpact || '', r.pressure || '', r.refusalNormal || '', r.helpKnowledge || '', r.supportChoice || '',
      r.minorConsent || ''
    ]);
    SpreadsheetApp.flush();
    return json({ ok: true, duplicate: false, version: 6 });
  } finally {
    lock.releaseLock();
  }
}
