export type GameMetrics = {
  reaction?: { latestMs: number; bestMs: number; attempts: number };
  stroop?: { score: number; rounds: number; averageMs: number; totalMs: number; attempts: number };
  signal?: { reachedLength: number; completed: boolean; durationMs: number; attempts: number };
};

const KEY='alkohol-ja-aju:game-metrics';

export function readGameMetrics():GameMetrics{
  if(typeof window==='undefined') return {};
  try{
    const raw=window.sessionStorage.getItem(KEY);
    return raw?JSON.parse(raw) as GameMetrics:{};
  }catch{return {};}
}

function write(metrics:GameMetrics){
  try{window.sessionStorage.setItem(KEY,JSON.stringify(metrics));}catch{/* storage can be unavailable */}
  try{window.dispatchEvent(new CustomEvent('alkohol-game-metrics'));}catch{/* no-op */}
}

export function recordReaction(ms:number){
  const current=readGameMetrics();
  const previous=current.reaction;
  current.reaction={
    latestMs:ms,
    bestMs:previous?Math.min(previous.bestMs,ms):ms,
    attempts:(previous?.attempts??0)+1,
  };
  write(current);
}

export function recordStroop(score:number,rounds:number,averageMs:number,totalMs:number){
  const current=readGameMetrics();
  current.stroop={score,rounds,averageMs,totalMs,attempts:(current.stroop?.attempts??0)+1};
  write(current);
}

export function recordSignal(reachedLength:number,completed:boolean,durationMs:number){
  const current=readGameMetrics();
  const previous=current.signal;
  current.signal={
    reachedLength:Math.max(previous?.reachedLength??0,reachedLength),
    completed:completed||(previous?.completed??false),
    durationMs,
    attempts:(previous?.attempts??0)+1,
  };
  write(current);
}

export function gameMetricsCompactText(metrics:GameMetrics):string{
  const parts:string[]=[];
  if(metrics.reaction){
    parts.push(`reaction_latest=${metrics.reaction.latestMs}ms`);
    parts.push(`reaction_best=${metrics.reaction.bestMs}ms`);
    parts.push(`reaction_attempts=${metrics.reaction.attempts}`);
  }
  if(metrics.stroop){
    parts.push(`stroop=${metrics.stroop.score}/${metrics.stroop.rounds}`);
    parts.push(`stroop_avg=${metrics.stroop.averageMs}ms`);
    parts.push(`stroop_total=${metrics.stroop.totalMs}ms`);
    parts.push(`stroop_attempts=${metrics.stroop.attempts}`);
  }
  if(metrics.signal){
    parts.push(`signal_level=${metrics.signal.reachedLength}`);
    parts.push(`signal_done=${metrics.signal.completed?'yes':'no'}`);
    parts.push(`signal_time=${metrics.signal.durationMs}ms`);
    parts.push(`signal_attempts=${metrics.signal.attempts}`);
  }
  return parts.join('; ');
}

export function clearGameMetrics(){
  try{window.sessionStorage.removeItem(KEY);}catch{/* no-op */}
  try{window.dispatchEvent(new CustomEvent('alkohol-game-metrics'));}catch{/* no-op */}
}
