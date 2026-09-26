import { describe,it,expect } from 'vitest';
import { memoryRound,attentionRound,scoreSelection,shuffle,toggleSelection } from './tasks';
import { questions,sources } from '../data/content';
describe('Memory and attention scoring',()=>{
 it('does not reward selecting every memory option',()=>{const round=memoryRound();expect(scoreSelection(round.targets,round.options)).toMatchObject({hits:8,falseAlarms:8,score:0,missed:0});});
 it('scores empty, exact, partial and duplicate selections',()=>{expect(scoreSelection(['a','b'],[])).toMatchObject({hits:0,missed:2,score:0,accuracy:0});expect(scoreSelection(['a','b'],['a','b'])).toMatchObject({score:2,accuracy:100});expect(scoreSelection(['a','b'],['a','c','c'])).toMatchObject({hits:1,falseAlarms:1,missed:1,score:0,accuracy:50});});
 it('always makes eight unique targets and eight disjoint distractors',()=>{for(let n=0;n<100;n++){const r=memoryRound();expect(new Set(r.targets).size).toBe(8);expect(new Set(r.options).size).toBe(16);expect(r.targets.every(w=>r.options.includes(w))).toBe(true);}});
 it('creates a 36-cell attention grid with 12 targets',()=>{const grid=attentionRound();expect(grid).toHaveLength(36);expect(grid.filter(c=>c==='T')).toHaveLength(12);expect(scoreSelection(grid.flatMap((c,i)=>c==='T'?[i]:[]),Array.from({length:36},(_,i)=>i))).toMatchObject({hits:12,falseAlarms:24,accuracy:33});});
 it('allows deselection without mutating its input',()=>{const input=['a'];expect(toggleSelection(input,'a')).toEqual([]);expect(input).toEqual(['a']);expect(shuffle(input)).toEqual(['a']);});
 it('has ten answerable sourced questions and no fabricated source keys',()=>{expect(questions).toHaveLength(10);expect(new Set(questions.map(q=>q.id)).size).toBe(10);for(const q of questions){expect(q.status).toBe('verified');expect(q.refs.length).toBeGreaterThan(0);for(const id of q.refs)expect(sources.some(s=>s.id===id&&s.url.startsWith('https://'))).toBe(true);}});
});
