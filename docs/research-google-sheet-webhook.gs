const SPREADSHEET_ID = '1U4vVdsnYMPq-CZRbXxm_rqNk-n9kF4Chtu-wl5pz7Lg';
const SHEET_NAME = 'Responses';
const PUBLIC_MIN_N = 10;

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json({ ok: true, service: 'research-sheet-webhook', version: 5 });
}

function requireSecret(body) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expectedSecret) return 'missing_secret';
  if (!body.secret || body.secret !== expectedSecret) return 'forbidden';
  return '';
}

function countColumn(rows, index, labels) {
  const counts = {};
  rows.forEach(row => {
    const raw = String(row[index] || '').trim();
    if (!raw) return;
    const label = labels && labels[raw] ? labels[raw] : raw;
    counts[label] = (counts[label] || 0) + 1;
  });
  const published = {};
  Object.keys(counts).sort().forEach(key => {
    if (counts[key] >= PUBLIC_MIN_N) published[key] = counts[key];
  });
  return published;
}

function aggregate(sheet) {
  const lastRow = sheet.getLastRow();
  const n = Math.max(0, lastRow - 1);
  if (n < PUBLIC_MIN_N) return { ok: true, n, publishable: false, minimumGroupSize: PUBLIC_MIN_N, lastUpdated: new Date().toISOString() };
  const rows = sheet.getRange(2, 1, n, 31).getDisplayValues();
  const ageLabels = {'15_17':'15–17','18_20':'18–20','21_25':'21–25','26_35':'26–35','36_plus':'36+','prefer_not':'Prefer not to answer'};
  const useLabels = {never:'Never',less_monthly:'Less than monthly',monthly:'About monthly',two_four_month:'2–4 times/month',two_three_week:'2–3 times/week',four_plus_week:'4+ times/week',prefer_not:'Prefer not to answer'};
  const impactLabels = {none:'None',slight:'Slight',moderate:'Moderate',strong:'Strong',very_strong:'Very strong',prefer_not:'Prefer not to answer'};
  const helpLabels = {yes:'Yes',partly:'Partly',no:'No',prefer_not:'Prefer not to answer'};
  return {
    ok: true,
    n,
    publishable: true,
    minimumGroupSize: PUBLIC_MIN_N,
    lastUpdated: new Date().toISOString(),
    ageGroup: countColumn(rows, 6, ageLabels),
    ownUse: countColumn(rows, 7, useLabels),
    overallImpact: countColumn(rows, 25, impactLabels),
    helpKnowledge: countColumn(rows, 28, helpLabels)
  };
}

function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (error) { return json({ ok: false, error: 'invalid_json' }); }

  const authError = requireSecret(body);
  if (authError) return json({ ok: false, error: authError });
  if (body.health === true) return json({ ok: true, health: true, version: 5 });

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) return json({ ok: false, error: 'missing_sheet' });
  if (body.aggregate === true) return json(aggregate(sheet));

  const r = body.response || {};
  const responseId = String(r.response_id || '');
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
    return json({ ok: true, duplicate: false });
  } finally { lock.releaseLock(); }
}
