const ALLOWED_ORIGINS = new Set([
  'https://alco-uurimis.github.io',
  'https://alkohol-ja-aju.vercel.app',
]);

const SECTION_VALUES = new Set(['brain','memory','attention','lab','quiz','sources']);
const LEAST_CLEAR_VALUES = new Set(['none',...SECTION_VALUES]);
const RECOMMEND_VALUES = new Set(['yes','maybe','no']);
const LEARNED_VALUES = new Set(['yes','partly','no']);
const PACE_VALUES = new Set(['too_short','balanced','too_long']);
const LANGUAGES = new Set(['et','ru']);
const SCALE_FIELDS = ['knowledgeBefore','knowledgeAfter','clarity','interest','navigation','visuals','memoryDifficulty','attentionDifficulty','gamesUseful','confidence'];

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

function sectionLabel(value, language) {
  const labels = {
    et:{brain:'Aju ja alkohol',memory:'Mäluharjutus',attention:'Tähelepanuharjutus',lab:'Mängulabor',quiz:'Müüt või fakt',sources:'Allikad ja kokkuvõte',none:'Kõik oli arusaadav'},
    ru:{brain:'Мозг и алкоголь',memory:'Упражнение на память',attention:'Упражнение на внимание',lab:'Игровая лаборатория',quiz:'Миф или факт',sources:'Источники и выводы',none:'Всё было понятно'},
  };
  return labels[language]?.[value] ?? value;
}

function optionLabel(value, language, type) {
  const ru=language==='ru';
  const maps={
    recommend:{yes:ru?'Да':'Jah',maybe:ru?'Возможно':'Võib-olla',no:ru?'Нет':'Ei'},
    learned:{yes:ru?'Да':'Jah',partly:ru?'Частично':'Osaliselt',no:ru?'Нет':'Ei'},
    pace:{too_short:ru?'Слишком коротко':'Liiga lühike',balanced:ru?'В самый раз':'Paras',too_long:ru?'Слишком длинно':'Liiga pikk'},
  };
  return maps[type]?.[value] ?? value;
}

function finiteNumber(value,min,max){
  const n=Number(value);
  return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}

function readGameMetrics(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return {};
  const result={};

  if(value.reaction&&typeof value.reaction==='object'){
    const latestMs=finiteNumber(value.reaction.latestMs,50,10000);
    const bestMs=finiteNumber(value.reaction.bestMs,50,10000);
    const attempts=finiteNumber(value.reaction.attempts,1,100);
    if(latestMs!==null&&bestMs!==null&&attempts!==null)result.reaction={latestMs,bestMs,attempts};
  }

  if(value.stroop&&typeof value.stroop==='object'){
    const score=finiteNumber(value.stroop.score,0,8);
    const rounds=finiteNumber(value.stroop.rounds,1,8);
    const averageMs=finiteNumber(value.stroop.averageMs,50,60000);
    const totalMs=finiteNumber(value.stroop.totalMs,100,300000);
    const attempts=finiteNumber(value.stroop.attempts,1,100);
    if(score!==null&&rounds!==null&&averageMs!==null&&totalMs!==null&&attempts!==null)result.stroop={score,rounds,averageMs,totalMs,attempts};
  }

  if(value.signal&&typeof value.signal==='object'){
    const reachedLength=finiteNumber(value.signal.reachedLength,1,20);
    const durationMs=finiteNumber(value.signal.durationMs,100,300000);
    const attempts=finiteNumber(value.signal.attempts,1,100);
    const completed=value.signal.completed===true;
    if(reachedLength!==null&&durationMs!==null&&attempts!==null)result.signal={reachedLength,durationMs,attempts,completed};
  }

  return result;
}

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ok:false,error:'method_not_allowed'});

  const origin=req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) return res.status(403).json({ok:false,error:'origin_not_allowed'});
  const length=Number(req.headers['content-length']||0);
  if (length>12000) return res.status(413).json({ok:false,error:'payload_too_large'});

  const botToken=process.env.BOT_TOKEN;
  const chatId=process.env.CHAT_ID;
  if(!botToken||!chatId)return res.status(500).json({ok:false,error:'server_not_configured'});

  let body;
  try{body=readBody(req);}catch{return res.status(400).json({ok:false,error:'invalid_json'});}

  const language=String(body.language??'');
  if(!LANGUAGES.has(language))return res.status(400).json({ok:false,error:'invalid_language'});

  const scales={};
  for(const field of SCALE_FIELDS){
    const value=String(body[field]??'');
    if(!['1','2','3','4','5'].includes(value))return res.status(400).json({ok:false,error:`invalid_${field}`});
    scales[field]=value;
  }

  const useful=String(body.useful??'');
  const leastClear=String(body.leastClear??'');
  const pace=String(body.pace??'');
  const learned=String(body.learned??'');
  const recommend=String(body.recommend??'');
  const comment=typeof body.comment==='string'?body.comment.trim():'';
  const gameMetrics=readGameMetrics(body.gameMetrics);

  if(!SECTION_VALUES.has(useful))return res.status(400).json({ok:false,error:'invalid_useful_section'});
  if(!LEAST_CLEAR_VALUES.has(leastClear))return res.status(400).json({ok:false,error:'invalid_least_clear'});
  if(!PACE_VALUES.has(pace))return res.status(400).json({ok:false,error:'invalid_pace'});
  if(!LEARNED_VALUES.has(learned))return res.status(400).json({ok:false,error:'invalid_learned'});
  if(!RECOMMEND_VALUES.has(recommend))return res.status(400).json({ok:false,error:'invalid_recommendation'});
  if(comment.length>1000)return res.status(400).json({ok:false,error:'comment_too_long'});

  const isRu=language==='ru';
  const knowledgeDelta=Number(scales.knowledgeAfter)-Number(scales.knowledgeBefore);
  const lines=[
    '🧠 Alkohol ja aju — uus statistiline küsitlus',
    '',
    `Keel / Язык: ${language.toUpperCase()}`,
    '',
    '📊 STRUCTURED',
    `knowledge_before=${scales.knowledgeBefore}`,
    `knowledge_after=${scales.knowledgeAfter}`,
    `knowledge_delta=${knowledgeDelta}`,
    `clarity=${scales.clarity}`,
    `interest=${scales.interest}`,
    `navigation=${scales.navigation}`,
    `visuals=${scales.visuals}`,
    `memory_difficulty=${scales.memoryDifficulty}`,
    `attention_difficulty=${scales.attentionDifficulty}`,
    `games_useful=${scales.gamesUseful}`,
    `myth_confidence=${scales.confidence}`,
    `useful_section=${useful}`,
    `least_clear=${leastClear}`,
    `pace=${pace}`,
    `learned=${learned}`,
    `recommend=${recommend}`,
  ];

  if(gameMetrics.reaction){
    lines.push(`reaction_latest_ms=${gameMetrics.reaction.latestMs}`,`reaction_best_ms=${gameMetrics.reaction.bestMs}`,`reaction_attempts=${gameMetrics.reaction.attempts}`);
  }
  if(gameMetrics.stroop){
    lines.push(`stroop_score=${gameMetrics.stroop.score}`,`stroop_rounds=${gameMetrics.stroop.rounds}`,`stroop_avg_ms=${gameMetrics.stroop.averageMs}`,`stroop_total_ms=${gameMetrics.stroop.totalMs}`,`stroop_attempts=${gameMetrics.stroop.attempts}`);
  }
  if(gameMetrics.signal){
    lines.push(`signal_level=${gameMetrics.signal.reachedLength}`,`signal_completed=${gameMetrics.signal.completed?'yes':'no'}`,`signal_duration_ms=${gameMetrics.signal.durationMs}`,`signal_attempts=${gameMetrics.signal.attempts}`);
  }

  lines.push(
    '',
    isRu?'📝 Ответы':'📝 Vastused',
    `${isRu?'Знания до':'Teadmised enne'}: ${scales.knowledgeBefore}/5`,
    `${isRu?'Знания после':'Teadmised pärast'}: ${scales.knowledgeAfter}/5 (${knowledgeDelta>=0?'+':''}${knowledgeDelta})`,
    `${isRu?'Понятность':'Arusaadavus'}: ${scales.clarity}/5`,
    `${isRu?'Интерес':'Huvi'}: ${scales.interest}/5`,
    `${isRu?'Навигация':'Navigeerimine'}: ${scales.navigation}/5`,
    `${isRu?'Визуал':'Visuaal'}: ${scales.visuals}/5`,
    `${isRu?'Сложность памяти':'Mälu raskus'}: ${scales.memoryDifficulty}/5`,
    `${isRu?'Сложность внимания':'Tähelepanu raskus'}: ${scales.attentionDifficulty}/5`,
    `${isRu?'Польза игр':'Mängude kasu'}: ${scales.gamesUseful}/5`,
    `${isRu?'Уверенность в мифах/фактах':'Müütide/faktide kindlus'}: ${scales.confidence}/5`,
    `${isRu?'Самый полезный раздел':'Kasulikum osa'}: ${sectionLabel(useful,language)}`,
    `${isRu?'Наименее понятный':'Kõige ebaselgem'}: ${sectionLabel(leastClear,language)}`,
    `${isRu?'Темп':'Tempo'}: ${optionLabel(pace,language,'pace')}`,
    `${isRu?'Узнал новое':'Sai uut teada'}: ${optionLabel(learned,language,'learned')}`,
    `${isRu?'Рекомендует':'Soovitaks'}: ${optionLabel(recommend,language,'recommend')}`,
  );

  if(gameMetrics.reaction||gameMetrics.stroop||gameMetrics.signal){
    lines.push('',isRu?'🎮 Мини-игры':'🎮 Minimängud');
    if(gameMetrics.reaction)lines.push(`${isRu?'Реакция':'Reaktsioon'}: ${gameMetrics.reaction.latestMs} ms · ${isRu?'лучшее':'parim'} ${gameMetrics.reaction.bestMs} ms · ${isRu?'попыток':'katseid'} ${gameMetrics.reaction.attempts}`);
    if(gameMetrics.stroop)lines.push(`Stroop: ${gameMetrics.stroop.score}/${gameMetrics.stroop.rounds} · ${isRu?'среднее':'keskmine'} ${gameMetrics.stroop.averageMs} ms · ${isRu?'общее время':'koguaeg'} ${(gameMetrics.stroop.totalMs/1000).toFixed(1)} s · ${isRu?'попыток':'katseid'} ${gameMetrics.stroop.attempts}`);
    if(gameMetrics.signal)lines.push(`${isRu?'Цепочка':'Signaalirada'}: ${isRu?'уровень':'tase'} ${gameMetrics.signal.reachedLength} · ${gameMetrics.signal.completed?(isRu?'пройдено':'läbitud'):(isRu?'не завершено':'pooleli')} · ${(gameMetrics.signal.durationMs/1000).toFixed(1)} s · ${isRu?'попыток':'katseid'} ${gameMetrics.signal.attempts}`);
  }

  if(comment)lines.push('',isRu?'Комментарий / структурированные данные:':'Kommentaar / struktureeritud andmed:',comment);
  lines.push('',`Aeg / Время: ${new Date().toISOString()}`);

  try{
    const telegram=await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),disable_web_page_preview:true})});
    if(!telegram.ok)return res.status(502).json({ok:false,error:'telegram_delivery_failed'});
    return res.status(200).json({ok:true});
  }catch{return res.status(502).json({ok:false,error:'telegram_unreachable'});}
}
