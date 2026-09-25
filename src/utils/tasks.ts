import { words } from '../data/words';
export function shuffle<T>(items:readonly T[],random= Math.random):T[]{ const out=[...items]; for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out; }
export function memoryRound(){const pool=shuffle(words);return {targets:pool.slice(0,8),options:shuffle(pool.slice(0,16))};}
export function scoreSelection<T>(targets:readonly T[],selected:readonly T[]){const goal=new Set(targets); const chosen=new Set(selected); const hits=[...chosen].filter(v=>goal.has(v)).length;const falseAlarms=chosen.size-hits;return {hits,falseAlarms,missed:goal.size-hits,score:Math.max(0,hits-falseAlarms),accuracy:chosen.size?Math.round(hits/chosen.size*100):0};}
export function attentionRound(){return shuffle([...Array<string>(12).fill('T'),...Array<string>(12).fill('L'),...Array<string>(12).fill('I')]);}
export function toggleSelection<T>(items:readonly T[],value:T):T[]{return items.includes(value)?items.filter(x=>x!==value):[...items,value];}
