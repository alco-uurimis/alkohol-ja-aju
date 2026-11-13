import { describe, expect, it } from 'vitest';
import { chunk, mapPrepost, mapResponse, parseCsv, toObjects } from '../scripts/backfill-lib.mjs';

describe('parseCsv', () => {
  it('handles quotes, commas, newlines in quotes, CRLF and BOM', () => {
    const rows = parseCsv('﻿a,b,c\r\n1,"x, y","line1\nline2"\r\n2,"he said ""hi""",\r\n');
    expect(rows).toEqual([['a', 'b', 'c'], ['1', 'x, y', 'line1\nline2'], ['2', 'he said "hi"', '']]);
  });
  it('maps rows to objects by header', () => expect(toObjects(parseCsv('a,b\n1,2\n'))).toEqual([{ a: '1', b: '2' }]));
});

describe('mapResponse', () => {
  const base = { submitted_at: '2026-05-01T10:00:00.000Z', response_id: 'research_abc12345', language: 'ru', version: '4', ownUse: 'never', contexts: 'friends | family', minorConsent: '', last30_legacy: '1_2' };
  it('builds the same shape the live mirror writes', () => {
    expect(mapResponse(base).row).toEqual({
      response_id: 'research_abc12345', submitted_at: '2026-05-01T10:00:00.000Z', language: 'ru', version: 4,
      answers: { ownUse: 'never', contexts: ['friends', 'family'], last30: '1_2' },
    });
  });
  it('reads a zone-less sheet timestamp as UTC', () => expect(mapResponse({ ...base, submitted_at: '2026-05-01 10:00:00' }).row.submitted_at).toBe('2026-05-01T10:00:00.000Z'));
  it('reports bad rows instead of guessing', () => {
    expect(mapResponse({ ...base, response_id: 'x' }).error).toBe('bad_response_id');
    expect(mapResponse({ ...base, submitted_at: 'soon' }).error).toBe('bad_date');
    expect(mapResponse({ ...base, language: 'en' }).error).toBe('bad_language');
    expect(mapResponse({ ...base, version: '' }).error).toBe('bad_version');
  });
});

describe('mapPrepost', () => {
  const ok = { token: 'a'.repeat(32), phase: 'pre', language: 'et', score: '4', total: '6', blackout: '1', attention: '0', reaction: '1', sleep: '1', decisions: '1', development: '0' };
  it('maps a row', () => expect(mapPrepost(ok).row).toEqual({ token: 'a'.repeat(32), phase: 'pre', lang: 'et', correct: { blackout: 1, attention: 0, reaction: 1, sleep: 1, decisions: 1, development: 0 }, score: 4, total: 6 }));
  it('rejects malformed rows', () => {
    expect(mapPrepost({ ...ok, token: 'zz' }).error).toBe('bad_token');
    expect(mapPrepost({ ...ok, blackout: '' }).error).toBe('bad_item');
    expect(mapPrepost({ ...ok, phase: 'mid' }).error).toBe('bad_phase');
  });
});

describe('chunk', () => it('splits evenly', () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])));
