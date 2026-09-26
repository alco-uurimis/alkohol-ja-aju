const SPREADSHEET_ID = '1U4vVdsnYMPq-CZRbXxm_rqNk-n9kF4Chtu-wl5pz7Lg';
const SHEET_NAME = 'Responses';

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
  if (!expectedSecret) return json({ ok: false, error: 'missing_secret' });

  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (error) {
    return json({ ok: false, error: 'invalid_json' });
  }

  if (!body.secret || body.secret !== expectedSecret) {
    return json({ ok: false, error: 'forbidden' });
  }

  if (body.health === true) {
    return json({ ok: true, health: true });
  }

  const r = body.response || {};
  const responseId = String(r.response_id || '');
  if (!responseId) return json({ ok: false, error: 'missing_response_id' });

  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) return json({ ok: false, error: 'missing_sheet' });

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
      r.submitted_at || new Date().toISOString(),
      responseId,
      r.language || '',
      r.version || '',
      r.adult || '',
      r.consent || '',
      r.ageGroup || '',
      r.ownUse || '',
      r.last30 || '',
      r.typicalUnits || '',
      r.sixPlus || '',
      joinList(r.contexts),
      r.peerNorm || '',
      r.closeExposure || '',
      joinList(r.closeRelations),
      r.closeHousehold || '',
      r.closeConflict || '',
      r.closeUnsafe || '',
      r.worry || '',
      r.sleep || '',
      r.study || '',
      r.mood || '',
      r.avoid || '',
      r.unsafe || '',
      r.extraResponsibility || '',
      r.overallImpact || '',
      r.pressure || '',
      r.refusalNormal || '',
      r.helpKnowledge || '',
      r.supportChoice || '',
    ]);

    SpreadsheetApp.flush();
    return json({ ok: true, duplicate: false });
  } finally {
    lock.releaseLock();
  }
}
