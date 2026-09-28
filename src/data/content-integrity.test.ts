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
