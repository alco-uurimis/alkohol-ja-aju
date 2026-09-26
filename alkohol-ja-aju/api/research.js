const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
const FIELDS=['adult','consent','ageGroup','ownUse','last30','typicalUnits','sixPlus','contexts','peerNorm','closeExposure','closeRelations','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice'];

function cors(req,res){
  const origin=req.headers.origin;
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
function body(req){
  if(req.body&&typeof req.body==='object')return req.body;
  if(typeof req.body==='string')return JSON.parse(req.body);
  return {};
}
function responseId(value){
  const v=String(value||'');
  if(/^research_[a-z0-9_-]{8,90}$/i.test(v))return v;
  const rnd=globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2);
  return `research_${Date.now().toString(36)}_${rnd.slice(0,10)}`;
}
function cleanAnswers(input){
  const out={};
  for(const key of FIELDS){
    const value=input?.[key];
    if(Array.isArray(value))out[key]=value.slice(0,10).map(v=>String(v).slice(0,80));
    else if(value!==undefined&&value!==null)out[key]=String(value).slice(0,120);
  }
  return out;
}
function localTime(){
  return new Intl.DateTimeFormat('et-EE',{timeZone:'Europe/Tallinn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
}
async function sendSheet(response){
  const url=process.env.SHEET_WEBHOOK_URL,secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret)return {ok:false,configured:false,error:'sheet_not_configured'};
  try{
    const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({secret,response})});
    const text=await r.text();let data={};try{data=JSON.parse(text)}catch{}
    return r.ok&&data.ok===true?{ok:true,configured:true,duplicate:data.duplicate===true}:{ok:false,configured:true,error:'sheet_delivery_failed'};
  }catch{return {ok:false,configured:true,error:'sheet_unreachable'};}
}
async function sendTelegram(response){
  const token=process.env.BOT_TOKEN,chatId=process.env.CHAT_ID;
  if(!token||!chatId)return {ok:false,configured:false,error:'telegram_not_configured'};
  const ru=response.language==='ru';
  const lines=[ru?'Новый ответ — «Помоги науке»':'Uus vastus — „Aita teadust“',`${ru?'ID ответа':'Vastuse ID'}: ${response.response_id}`,`${ru?'Версия':'Versioon'}: ${response.version}`,`${ru?'Язык':'Keel'}: ${response.language.toUpperCase()}`,`${ru?'Отправлено':'Saadetud'}: ${localTime()} (Tallinn)`,''];
  for(const key of FIELDS){
    const value=response[key];
    if(value===undefined||value===''||(Array.isArray(value)&&value.length===0))continue;
    lines.push(`${key}: ${Array.isArray(value)?value.join(', '):value}`);
  }
  try{
    const r=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),disable_web_page_preview:true})});
    return r.ok?{ok:true,configured:true}:{ok:false,configured:true,error:'telegram_delivery_failed'};
  }catch{return {ok:false,configured:true,error:'telegram_unreachable'};}
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers.origin;
  if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(Number(req.headers['content-length']||0)>18000)return res.status(413).json({ok:false,error:'payload_too_large'});
  let payload;try{payload=body(req)}catch{return res.status(400).json({ok:false,error:'invalid_json'});}
  const language=String(payload.language||'');
  if(!['et','ru'].includes(language))return res.status(400).json({ok:false,error:'invalid_language'});
  const answers=cleanAnswers(payload.answers);
  if(answers.adult!=='yes'||answers.consent!=='yes')return res.status(400).json({ok:false,error:'consent_required'});
  const id=responseId(payload.submissionId);
  const response={submitted_at:new Date().toISOString(),response_id:id,language,version:3,...answers};
  const [sheet,telegram]=await Promise.all([sendSheet(response),sendTelegram(response)]);
  const anyOk=sheet.ok||telegram.ok;
  const configured=sheet.configured||telegram.configured;
  if(!configured)return res.status(500).json({ok:false,error:'server_not_configured',responseId:id,delivery:{sheet,telegram}});
  if(!anyOk)return res.status(502).json({ok:false,error:'delivery_failed',responseId:id,delivery:{sheet,telegram}});
  return res.status(200).json({ok:true,responseId:id,partial:!(sheet.ok&&telegram.ok),delivery:{sheet,telegram}});
}
