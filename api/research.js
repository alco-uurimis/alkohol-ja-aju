const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
const LANGUAGES=new Set(['et','ru']);
const YES_NO=new Set(['yes','no']);
const AGE_GROUPS=new Set(['18_20','21_25','26_35','36_plus','prefer_not']);
const OWN_USE=new Set(['never','less_monthly','monthly','two_four_month','two_three_week','four_plus_week','prefer_not','once','rare','weekly_plus']);
const LAST30=new Set(['0','1_2','3_5','6_plus','prefer_not']);
const TYPICAL_UNITS=new Set(['1_2','3_4','5_6','7_9','10_plus','prefer_not']);
const SIX_PLUS=new Set(['never','less_monthly','monthly','weekly','daily_almost','prefer_not']);
const CONTEXTS=new Set(['friends','family','event','alone','other','prefer_not']);
const PEER_NORM=new Set(['rare','some','common','very_common','unsure','prefer_not']);
const FREQ=new Set(['never','rare','sometimes','often','prefer_not']);
const CLOSE_RELATIONS=new Set(['partner','family','friend','other','prefer_not']);
const HOUSEHOLD=new Set(['yes','sometimes','no','prefer_not']);
const OVERALL_IMPACT=new Set(['none','slight','moderate','strong','very_strong','prefer_not']);
const REFUSAL_NORMAL=new Set(['yes','mostly','unsure','mostly_no','no','prefer_not']);
const HELP_KNOWLEDGE=new Set(['yes','partly','no','prefer_not']);
const SUPPORT_CHOICE=new Set(['friend','family','school','doctor','helpline','none','prefer_not']);

function applyCors(req,res){
  const origin=req.headers.origin;
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}
function readBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string')return JSON.parse(req.body);return{};}
function scalar(value,allowed,optional=false){if(value===undefined||value===null||value==='')return optional?'':null;const v=String(value);return allowed.has(v)?v:null;}
function list(value,allowed){if(value===undefined||value===null)return[];if(!Array.isArray(value)||value.length>10)return null;const out=[];for(const item of value){const v=String(item);if(!allowed.has(v))return null;if(!out.includes(v))out.push(v);}return out.includes('prefer_not')?['prefer_not']:out;}
function makeId(){const random=globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2);return`research_${Date.now().toString(36)}_${random.slice(0,10)}`;}
function readSubmissionId(value){const v=String(value??'');return /^research_[a-z0-9_-]{8,90}$/i.test(v)?v:makeId();}
function localTimestamp(){return new Intl.DateTimeFormat('et-EE',{timeZone:'Europe/Tallinn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());}

const FIELD_LABELS={
  ru:{ageGroup:'Возраст',ownUse:'Частота употребления за 12 месяцев',last30:'Дней за последние 30',typicalUnits:'Единиц в обычный день',sixPlus:'6+ единиц за один раз',contexts:'Контекст употребления',peerNorm:'Употребление среди ровесников',closeExposure:'Близкий был заметно пьян',closeRelations:'Кто из близких',closeHousehold:'Совместное проживание',closeConflict:'Конфликты/напряжение',closeUnsafe:'Непредсказуемость/небезопасность',worry:'Переживания',sleep:'Сон/отдых',study:'Учёба/работа',mood:'Настроение',avoid:'Избегание',unsafe:'Чувство небезопасности',extraResponsibility:'Дополнительные обязанности',overallImpact:'Общее негативное влияние',pressure:'Давление компании',refusalNormal:'Нормальность отказа',helpKnowledge:'Знание о помощи',supportChoice:'К кому обратиться'},
  et:{ageGroup:'Vanuserühm',ownUse:'Tarvitamise sagedus 12 kuu jooksul',last30:'Päevi viimase 30 jooksul',typicalUnits:'Ühikuid tavalisel päeval',sixPlus:'6+ ühikut korraga',contexts:'Tarvitamise olukord',peerNorm:'Tarvitamine eakaaslaste seas',closeExposure:'Lähedane selgelt joobes',closeRelations:'Kes lähedastest',closeHousehold:'Koos elamine',closeConflict:'Konflikt/pinge',closeUnsafe:'Ettearvamatus/ebaturvalisus',worry:'Muretsemine',sleep:'Uni/puhkus',study:'Õppimine/töö',mood:'Meeleolu',avoid:'Vältimine',unsafe:'Ebaturvalisuse tunne',extraResponsibility:'Lisakohustused',overallImpact:'Üldine negatiivne mõju',pressure:'Seltskonna surve',refusalNormal:'Keeldumise normaalsus',helpKnowledge:'Teadmine abist',supportChoice:'Kelle poole pöörduda'}
};
const VALUE_LABELS={
  ru:{yes:'Да',no:'Нет',18_20:'18–20',21_25:'21–25',26_35:'26–35',36_plus:'36+',prefer_not:'Предпочитаю не отвечать',never:'Никогда',once:'Несколько раз',rare:'Редко',less_monthly:'Реже раза в месяц',monthly:'Примерно раз в месяц',two_four_month:'2–4 раза в месяц',two_three_week:'2–3 раза в неделю',four_plus_week:'4 раза в неделю или чаще',weekly_plus:'Раз в неделю или чаще','0':'0','1_2':'1–2','3_5':'3–5','6_plus':'6+','3_4':'3–4','5_6':'5–6','7_9':'7–9',10_plus:'10+',weekly:'Примерно раз в неделю',daily_almost:'Ежедневно или почти ежедневно',friends:'С друзьями',family:'С семьёй/родственниками',event:'Вечеринка/мероприятие',alone:'В одиночку',other:'Другое',some:'У части людей',common:'Довольно распространено',very_common:'Очень распространено',unsure:'Не знаю/не уверен(а)',sometimes:'Иногда',often:'Часто',partner:'Партнёр',friend:'Друг',mostly:'Скорее нормально',mostly_no:'Скорее сложно',partly:'Примерно представляю',school:'Специалист школы/университета',doctor:'Медицинский/психологический специалист',helpline:'Анонимная служба помощи',none:'Ни к кому из перечисленных',slight:'Незначительно',moderate:'Умеренно',strong:'Сильно',very_strong:'Очень сильно'},
  et:{yes:'Jah',no:'Ei',18_20:'18–20',21_25:'21–25',26_35:'26–35',36_plus:'36+',prefer_not:'Eelistan mitte vastata',never:'Mitte kunagi',once:'Mõnel korral',rare:'Harva',less_monthly:'Harvem kui kord kuus',monthly:'Umbes kord kuus',two_four_month:'2–4 korda kuus',two_three_week:'2–3 korda nädalas',four_plus_week:'4 korda nädalas või sagedamini',weekly_plus:'Kord nädalas või sagedamini','0':'0','1_2':'1–2','3_5':'3–5','6_plus':'6+','3_4':'3–4','5_6':'5–6','7_9':'7–9',10_plus:'10+',weekly:'Umbes kord nädalas',daily_almost:'Iga päev või peaaegu iga päev',friends:'Sõpradega',family:'Pere/sugulastega',event:'Pidu/üritus',alone:'Üksi',other:'Muu',some:'Osal inimestest',common:'Üsna levinud',very_common:'Väga levinud',unsure:'Ei tea / pole kindel',sometimes:'Mõnikord',often:'Sageli',partner:'Partner',friend:'Sõber',mostly:'Pigem normaalne',mostly_no:'Pigem keeruline',partly:'Umbes tean',school:'Kooli/ülikooli spetsialist',doctor:'Tervishoiu-/vaimse tervise spetsialist',helpline:'Anonüümne abiteenus',none:'Mitte kellegi nimetatu poole',slight:'Vähesel määral',moderate:'Mõõdukalt',strong:'Tugevalt',very_strong:'Väga tugevalt'}
};
function answerLabel(value,language,key){if(key==='overallImpact'&&value==='none')return language==='ru'?'Не повлияло':'Ei mõjutanud';if(key==='closeHousehold'&&value==='sometimes')return language==='ru'?'Часть времени':'Osa ajast';if(Array.isArray(value))return value.map(v=>VALUE_LABELS[language]?.[v]??v).join(', ');return VALUE_LABELS[language]?.[value]??value;}

async function deliverSheet(response){
  const url=process.env.SHEET_WEBHOOK_URL,secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret)return{ok:false,configured:false,error:'sheet_not_configured'};
  try{
    const result=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({secret,response})});
    const text=await result.text();let data={};try{data=JSON.parse(text);}catch{}
    if(!result.ok||data.ok!==true)return{ok:false,configured:true,error:'sheet_delivery_failed'};
    return{ok:true,configured:true,duplicate:data.duplicate===true};
  }catch{return{ok:false,configured:true,error:'sheet_unreachable'};}
}
async function deliverTelegram(response){
  const token=process.env.BOT_TOKEN,chatId=process.env.CHAT_ID;
  if(!token||!chatId)return{ok:false,configured:false,error:'telegram_not_configured'};
  const language=response.language,isRu=language==='ru',labels=FIELD_LABELS[language];
  const order=['ageGroup','ownUse','last30','typicalUnits','sixPlus','contexts','peerNorm','closeExposure','closeRelations','closeHousehold','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','extraResponsibility','overallImpact','pressure','refusalNormal','helpKnowledge','supportChoice'];
  const lines=[isRu?'Новый ответ — «Помоги науке»':'Uus vastus — „Aita teadust“',`${isRu?'ID ответа':'Vastuse ID'}: ${response.response_id}`,`${isRu?'Версия анкеты':'Küsitluse versioon'}: ${response.version}`,`${isRu?'Язык':'Keel'}: ${language.toUpperCase()}`,`${isRu?'Отправлено':'Saadetud'}: ${localTimestamp()} (Tallinn)`,'',...order.filter(key=>Array.isArray(response[key])?response[key].length>0:response[key]!==''&&response[key]!=null).map(key=>`${labels[key]}: ${answerLabel(response[key],language,key)}`)];
  try{
    const result=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),disable_web_page_preview:true})});
    if(!result.ok)return{ok:false,configured:true,error:'telegram_delivery_failed'};
    return{ok:true,configured:true};
  }catch{return{ok:false,configured:true,error:'telegram_unreachable'};}
}

export default async function handler(req,res){
  applyCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(Number(req.headers['content-length']||0)>18000)return res.status(413).json({ok:false,error:'payload_too_large'});
  let body;try{body=readBody(req);}catch{return res.status(400).json({ok:false,error:'invalid_json'});}
  const language=String(body.language??'');if(!LANGUAGES.has(language))return res.status(400).json({ok:false,error:'invalid_language'});
  const schemaVersion=Number(body.schemaVersion||2)>=3?3:2,input=body.answers;
  if(!input||typeof input!=='object'||Array.isArray(input))return res.status(400).json({ok:false,error:'invalid_answers'});
  const answers={adult:scalar(input.adult,YES_NO),consent:scalar(input.consent,YES_NO),ageGroup:scalar(input.ageGroup,AGE_GROUPS),ownUse:scalar(input.ownUse,OWN_USE),last30:scalar(input.last30,LAST30,true),typicalUnits:scalar(input.typicalUnits,TYPICAL_UNITS,true),sixPlus:scalar(input.sixPlus,SIX_PLUS,true),contexts:list(input.contexts,CONTEXTS),peerNorm:scalar(input.peerNorm,PEER_NORM),closeExposure:scalar(input.closeExposure,FREQ),closeRelations:list(input.closeRelations,CLOSE_RELATIONS),closeHousehold:scalar(input.closeHousehold,HOUSEHOLD,true),closeConflict:scalar(input.closeConflict,FREQ),closeUnsafe:scalar(input.closeUnsafe,FREQ),worry:scalar(input.worry,FREQ),sleep:scalar(input.sleep,FREQ),study:scalar(input.study,FREQ),mood:scalar(input.mood,FREQ),avoid:scalar(input.avoid,FREQ),unsafe:scalar(input.unsafe,FREQ),extraResponsibility:scalar(input.extraResponsibility,FREQ,true),overallImpact:scalar(input.overallImpact,OVERALL_IMPACT,true),pressure:scalar(input.pressure,FREQ),refusalNormal:scalar(input.refusalNormal,REFUSAL_NORMAL),helpKnowledge:scalar(input.helpKnowledge,HELP_KNOWLEDGE),supportChoice:scalar(input.supportChoice,SUPPORT_CHOICE)};
  const required=['adult','consent','ageGroup','ownUse','peerNorm','closeExposure','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','pressure','refusalNormal','helpKnowledge','supportChoice'];
  if(required.some(key=>answers[key]===null))return res.status(400).json({ok:false,error:'invalid_or_missing_answer'});
  if(answers.contexts===null||answers.closeRelations===null)return res.status(400).json({ok:false,error:'invalid_multi_answer'});
  if(answers.adult!=='yes'||answers.consent!=='yes')return res.status(400).json({ok:false,error:'consent_required'});
  if(schemaVersion>=3){const drank=answers.ownUse!=='never'&&answers.ownUse!=='prefer_not';if(drank&&(!answers.typicalUnits||!answers.sixPlus))return res.status(400).json({ok:false,error:'missing_consumption_detail'});const exposed=answers.closeExposure!=='never'&&answers.closeExposure!=='prefer_not';if(exposed&&((!answers.closeRelations?.length)||!answers.closeHousehold))return res.status(400).json({ok:false,error:'missing_close_context'});if(!answers.extraResponsibility||!answers.overallImpact)return res.status(400).json({ok:false,error:'missing_impact_summary'});}else if(!answers.last30)return res.status(400).json({ok:false,error:'missing_last30'});

  const responseId=readSubmissionId(body.submissionId);
  const response={submitted_at:new Date().toISOString(),response_id:responseId,language,version:schemaVersion,...answers};
  const [sheet,telegram]=await Promise.all([deliverSheet(response),deliverTelegram(response)]);
  const channels={sheet:sheet.ok,telegram:telegram.ok};
  const configured={sheet:sheet.configured,telegram:telegram.configured};
  const warnings=[];if(!sheet.ok)warnings.push(sheet.error);if(!telegram.ok)warnings.push(telegram.error);
  if(sheet.ok||telegram.ok)return res.status(200).json({ok:true,responseId,channels,configured,warnings});
  const error=!sheet.configured&&!telegram.configured?'server_not_configured':'delivery_failed';
  return res.status(error==='server_not_configured'?500:502).json({ok:false,error,responseId,channels,configured,warnings});
}
