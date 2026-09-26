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

export function clearGameMetrics(){
  try{window.sessionStorage.removeItem(KEY);}catch{/* no-op */}
}
