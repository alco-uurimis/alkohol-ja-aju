import { describe, expect, it } from 'vitest';
import { getResearchSteps } from './researchData';

function flatten(lang:'et'|'ru'){
  return getResearchSteps(lang).flatMap(step=>step.questions);
}

describe('research questionnaire contract',()=>{
  it('keeps the same question ids in Estonian and Russian',()=>{
    expect(flatten('ru').map(q=>q.id)).toEqual(flatten('et').map(q=>q.id));
  });

  it('has unique question ids and unique option codes',()=>{
    for(const lang of ['et','ru'] as const){
      const questions=flatten(lang);
      expect(new Set(questions.map(q=>q.id)).size).toBe(questions.length);
      for(const q of questions)expect(new Set(q.options.map(o=>o.value)).size).toBe(q.options.length);
    }
  });

  it('requires separate informed consent for the 15–17 group',()=>{
    const first=getResearchSteps('ru')[0].questions;
    expect(first.map(q=>q.id)).toEqual(['ageEligible15Plus','ageGroup','consent','minorConsent']);
    const ages=first.find(q=>q.id==='ageGroup')?.options.map(o=>o.value);
    expect(ages).toEqual(['15_17','18_20','21_25','26_35','36_plus']);
    const minor=first.find(q=>q.id==='minorConsent');
    expect(minor?.showWhen?.field).toBe('ageGroup');
    expect(minor?.options.map(o=>o.value)).toEqual(['yes','no']);
  });

  it('uses one 12-month reference period for alcohol-experience questions',()=>{
    const ids=new Set(flatten('ru').map(q=>q.id));
    for(const id of ['ownUse','typicalUnits','sixPlus','peerNorm','closeExposure','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','pressure'])expect(ids.has(id)).toBe(true);
  });
});
