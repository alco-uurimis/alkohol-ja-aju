export type GameMetrics = {
  reaction?: { latestMs: number; bestMs: number; attempts: number; recentMs?: number[]; medianMs?: number | null };
  stroop?: { score: number; rounds: number; averageMs: number; totalMs: number; attempts: number };
  signal?: { reachedLength: number; completed: boolean; durationMs: number; attempts: number };
};

const KEY='alkohol-ja-aju:game-metrics';
export function readGameMetrics():GameMetrics{if(typeof window==='undefined')return{};try{const raw=window.sessionStorage.getItem(KEY);return raw?JSON.parse(raw) as GameMetrics:{};}catch{return{};}}
function write(metrics:GameMetrics){try{window.sessionStorage.setItem(KEY,JSON.stringify(metrics));}catch{}try{window.dispatchEvent(new CustomEvent('alkohol-game-metrics'));}catch{}}
function median(values:number[]){const sorted=[...values].sort((a,b)=>a-b);const m=Math.floor(sorted.length/2);return sorted.length%2?sorted[m]:Math.round((sorted[m-1]+sorted[m])/2);}
export function recordReaction(ms:number){const current=readGameMetrics();const previous=current.reaction;const recent=[...(previous?.recentMs??[]),ms].slice(-5);current.reaction={latestMs:ms,bestMs:previous?Math.min(previous.bestMs,ms):ms,attempts:(previous?.attempts??0)+1,recentMs:recent,medianMs:recent.length===5?median(recent):null};write(current);}
export function recordStroop(score:number,rounds:number,averageMs:number,totalMs:number){const current=readGameMetrics();current.stroop={score,rounds,averageMs,totalMs,attempts:(current.stroop?.attempts??0)+1};write(current);}
export function recordSignal(reachedLength:number,completed:boolean,durationMs:number){const current=readGameMetrics();const previous=current.signal;current.signal={reachedLength:Math.max(previous?.reachedLength??0,reachedLength),completed:completed||(previous?.completed??false),durationMs,attempts:(previous?.attempts??0)+1};write(current);}
export function gameMetricsCompactText(metrics:GameMetrics):string{const parts:string[]=[];if(metrics.reaction){parts.push(`reaction_latest=${metrics.reaction.latestMs}ms`);parts.push(`reaction_best=${metrics.reaction.bestMs}ms`);parts.push(`reaction_attempts=${metrics.reaction.attempts}`);if(metrics.reaction.medianMs)parts.push(`reaction_median5=${metrics.reaction.medianMs}ms`);}if(metrics.stroop){parts.push(`stroop=${metrics.stroop.score}/${metrics.stroop.rounds}`);parts.push(`stroop_avg=${metrics.stroop.averageMs}ms`);parts.push(`stroop_total=${metrics.stroop.totalMs}ms`);parts.push(`stroop_attempts=${metrics.stroop.attempts}`);}if(metrics.signal){parts.push(`signal_level=${metrics.signal.reachedLength}`);parts.push(`signal_done=${metrics.signal.completed?'yes':'no'}`);parts.push(`signal_time=${metrics.signal.durationMs}ms`);parts.push(`signal_attempts=${metrics.signal.attempts}`);}return parts.join('; ');}
export function clearGameMetrics(){try{window.sessionStorage.removeItem(KEY);}catch{}try{window.dispatchEvent(new CustomEvent('alkohol-game-metrics'));}catch{}}
