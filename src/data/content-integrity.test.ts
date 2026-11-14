import { describe, expect, it } from 'vitest';
import { knowledgeCards, questions, sources, takeaways, topics } from './content';
import { knowledgeCardsRu, questionsRu, sourcesRu, takeawaysRu, topicsRu } from './content.ru';

const refsOf=(items:{refs:number[]}[])=>items.flatMap(item=>item.refs);

describe('bilingual content integrity',()=>{
  it('keeps source ids unique and aligned across languages',()=>{
    const etIds=sources.map(s=>s.id);
    const ruIds=sourcesRu.map(s=>s.id);
    expect(new Set(etIds).size).toBe(etIds.length);
    expect(new Set(ruIds).size).toBe(ruIds.length);
    expect(ruIds).toEqual(etIds);
    for(const id of etIds){
      const et=sources.find(s=>s.id===id)!;
      const ru=sourcesRu.find(s=>s.id===id)!;
      expect(ru.originalTitle).toBe(et.originalTitle);
    }
  });

  it('keeps topic and quiz ids aligned between ET and RU',()=>{
    expect(topicsRu.map(t=>t.id)).toEqual(topics.map(t=>t.id));
    expect(questionsRu.map(q=>q.id)).toEqual(questions.map(q=>q.id));
    expect(questionsRu.map(q=>q.fact)).toEqual(questions.map(q=>q.fact));
    expect(questionsRu.map(q=>q.status)).toEqual(questions.map(q=>q.status));
  });

  it('keeps parallel educational collections the same length',()=>{
    expect(knowledgeCardsRu).toHaveLength(knowledgeCards.length);
    expect(takeawaysRu).toHaveLength(takeaways.length);
    expect(topicsRu).toHaveLength(topics.length);
    expect(questionsRu).toHaveLength(questions.length);
  });

  it('does not reference missing core sources',()=>{
    const known=new Set(sources.map(s=>s.id));
    const refs=[...refsOf(topics),...refsOf(knowledgeCards),...refsOf(questions),...refsOf(takeaways),...refsOf(topicsRu),...refsOf(knowledgeCardsRu),...refsOf(questionsRu),...refsOf(takeawaysRu)];
    expect(refs.filter(id=>!known.has(id))).toEqual([]);
  });

  it('marks every public quiz statement as verified',()=>{
    expect(questions.every(q=>q.status==='verified')).toBe(true);
    expect(questionsRu.every(q=>q.status==='verified')).toBe(true);
  });
});

import { additionalSourcesEn, knowledgeCardsEn, questionsEn, scienceEn, sourcesEn, takeawaysEn, topicsEn } from './content.en';
import { additionalSourcesEt } from './additionalSources';
import { science } from './content';

describe('English content stays aligned with the Estonian original',()=>{
  const same=(a:unknown,b:unknown)=>expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  it('sources: same ids, years and links',()=>{
    const en=[...sourcesEn,...additionalSourcesEn], et=[...sources,...additionalSourcesEt];
    same(en.map(s=>[s.id,s.year,s.url]),et.map(s=>[s.id,s.year,s.url]));
  });
  it('topics, cards, takeaways: same count, ids and source references',()=>{
    same(topicsEn.map(t=>[t.id,t.symbol,t.refs]),topics.map(t=>[t.id,t.symbol,t.refs]));
    same(knowledgeCardsEn.map(c=>c.refs),knowledgeCards.map(c=>c.refs));
    same(takeawaysEn.map(t=>t.refs),takeaways.map(t=>t.refs));
  });
  it('quiz: same ids, answers, references and status',()=>{
    same(questionsEn.map(q=>[q.id,q.fact,q.refs,q.status]),questions.map(q=>[q.id,q.fact,q.refs,q.status]));
  });
  it('science notes: same keys, none empty',()=>{
    same(Object.keys(scienceEn),Object.keys(science));
    for(const v of Object.values(scienceEn))expect(v.length).toBeGreaterThan(20);
  });
});
