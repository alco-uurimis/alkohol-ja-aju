const ALLOWED_ORIGINS = new Set([
  'https://alco-uurimis.github.io',
  'https://alkohol-ja-aju.vercel.app',
]);

const LANGUAGES = new Set(['et','ru']);
const YES_NO = new Set(['yes','no']);
const AGE_GROUPS = new Set(['18_20','21_25','26_35','36_plus','prefer_not']);
const OWN_USE = new Set(['never','once','rare','monthly','weekly_plus','prefer_not']);
const LAST30 = new Set(['0','1_2','3_5','6_plus','prefer_not']);
const CONTEXTS = new Set(['friends','family','event','alone','other','prefer_not']);
const PEER_NORM = new Set(['rare','some','common','very_common','unsure','prefer_not']);
const FREQ = new Set(['never','rare','sometimes','often','prefer_not']);
const CLOSE_RELATIONS = new Set(['partner','family','friend','other','prefer_not']);
const REFUSAL_NORMAL = new Set(['yes','mostly','unsure','mostly_no','no','prefer_not']);
const HELP_KNOWLEDGE = new Set(['yes','partly','no','prefer_not']);
const SUPPORT_CHOICE = new Set(['friend','family','school','doctor','helpline','none','prefer_not']);

function applyCors(req,res){
  const origin=req.headers.origin;
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}

function readBody(req){
  if(req.body&&typeof req.body==='object')return req.body;
  if(typeof req.body==='string')return JSON.parse(req.body);
  return {};
}

function scalar(value,allowed,optional=false){
  if(value===undefined||value===null||value==='')return optional?'':null;
  const v=String(value);
  return allowed.has(v)?v:null;
}

function list(value,allowed){
  if(value===undefined||value===null)return [];
  if(!Array.isArray(value)||value.length>10)return null;
  const out=[];
  for(const item of value){
    const v=String(item);
    if(!allowed.has(v))return null;
    if(!out.includes(v))out.push(v);
  }
  if(out.includes('prefer_not'))return ['prefer_not'];
  return out;
}

function makeId(){
  const random=globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `research_${Date.now().toString(36)}_${random.slice(0,10)}`;
}

function localTimestamp(){
  return new Intl.DateTimeFormat('et-EE',{
    timeZone:'Europe/Tallinn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,
  }).format(new Date());
}

const FIELD_LABELS={
  ru:{ageGroup:'Возраст',ownUse:'Собственный опыт',last30:'Дней за последние 30',contexts:'Контекст употребления',peerNorm:'Употребление среди ровесников',closeExposure:'Близкий был заметно пьян',closeRelations:'Кто из близких',closeConflict:'Конфликты/напряжение',closeUnsafe:'Непредсказуемость/небезопасность',worry:'Переживания',sleep:'Сон/отдых',study:'Учёба/работа',mood:'Настроение',avoid:'Избегание',unsafe:'Чувство небезопасности',pressure:'Давление компании',refusalNormal:'Нормальность отказа',helpKnowledge:'Знание о помощи',supportChoice:'К кому обратиться'},
  et:{ageGroup:'Vanuserühm',ownUse:'Enda kogemus',last30:'Päevi viimase 30 jooksul',contexts:'Tarvitamise olukord',peerNorm:'Tarvitamine eakaaslaste seas',closeExposure:'Lähedane selgelt joobes',closeRelations:'Kes lähedastest',closeConflict:'Konflikt/pinge',closeUnsafe:'Ettearvamatus/ebaturvalisus',worry:'Muretsemine',sleep:'Uni/puhkus',study:'Õppimine/töö',mood:'Meeleolu',avoid:'Vältimine',unsafe:'Ebaturvalisuse tunne',pressure:'Seltskonna surve',refusalNormal:'Keeldumise normaalsus',helpKnowledge:'Teadmine abist',supportChoice:'Kelle poole pöörduda'},
};

const VALUE_LABELS={
  ru:{yes:'Да',no:'Нет',18_20:'18–20',21_25:'21–25',26_35:'26–35',36_plus:'36+',prefer_not:'Предпочитаю не отвечать',never:'Никогда',once:'Несколько раз',rare:'Редко',monthly:'Раз в месяц или чаще',weekly_plus:'Раз в неделю или чаще','0':'0','1_2':'1–2','3_5':'3–5','6_plus':'6+',friends:'С друзьями',family:'С семьёй/родственниками',event:'Вечеринка/мероприятие',alone:'В одиночку',other:'Другое',some:'У части людей',common:'Довольно распространено',very_common:'Очень распространено',unsure:'Не знаю/не уверен(а)',sometimes:'Иногда',often:'Часто',partner:'Партнёр',friend:'Друг',mostly:'Скорее нормально',mostly_no:'Скорее сложно',partly:'Примерно представляю',school:'Специалист школы/университета',doctor:'Медицинский специалист',helpline:'Анонимная служба помощи',none:'Ни к кому из перечисленных'},
  et:{yes:'Jah',no:'Ei',18_20:'18–20',21_25:'21–25',26_35:'26–35',36_plus:'36+',prefer_not:'Eelistan mitte vastata',never:'Mitte kunagi',once:'Mõnel korral',rare:'Harva',monthly:'Kord kuus või sagedamini',weekly_plus:'Kord nädalas või sagedamini','0':'0','1_2':'1–2','3_5':'3–5','6_plus':'6+',friends:'Sõpradega',family:'Pere/sugulastega',event:'Pidu/üritus',alone:'Üksi',other:'Muu',some:'Osal inimestest',common:'Üsna levinud',very_common:'Väga levinud',unsure:'Ei tea / pole kindel',sometimes:'Mõnikord',often:'Sageli',partner:'Partner',friend:'Sõber',mostly:'Pigem normaalne',mostly_no:'Pigem keeruline',partly:'Umbes tean',school:'Kooli/ülikooli spetsialist',doctor:'Tervishoiuspetsialist',helpline:'Anonüümne abiteenus',none:'Mitte kellegi nimetatu poole'},
};

function answerLabel(value,language){
  if(Array.isArray(value))return value.map(v=>VALUE_LABELS[language]?.[v]??v).join(', ');
  return VALUE_LABELS[language]?.[value]??value;
}

export default async function handler(req,res){
  applyCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});

  const origin=req.headers.origin;
  if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  const length=Number(req.headers['content-length']||0);
  if(length>16000)return res.status(413).json({ok:false,error:'payload_too_large'});

  let body;
  try{body=readBody(req);}catch{return res.status(400).json({ok:false,error:'invalid_json'});}

  const language=String(body.language??'');
  if(!LANGUAGES.has(language))return res.status(400).json({ok:false,error:'invalid_language'});
  const input=body.answers;
  if(!input||typeof input!=='object'||Array.isArray(input))return res.status(400).json({ok:false,error:'invalid_answers'});

  const answers={
    adult:scalar(input.adult,YES_NO),
    consent:scalar(input.consent,YES_NO),
    ageGroup:scalar(input.ageGroup,AGE_GROUPS),
    ownUse:scalar(input.ownUse,OWN_USE),
    last30:scalar(input.last30,LAST30),
    contexts:list(input.contexts,CONTEXTS),
    peerNorm:scalar(input.peerNorm,PEER_NORM),
    closeExposure:scalar(input.closeExposure,FREQ),
    closeRelations:list(input.closeRelations,CLOSE_RELATIONS),
    closeConflict:scalar(input.closeConflict,FREQ),
    closeUnsafe:scalar(input.closeUnsafe,FREQ),
    worry:scalar(input.worry,FREQ),
    sleep:scalar(input.sleep,FREQ),
    study:scalar(input.study,FREQ),
    mood:scalar(input.mood,FREQ),
    avoid:scalar(input.avoid,FREQ),
    unsafe:scalar(input.unsafe,FREQ),
    pressure:scalar(input.pressure,FREQ),
    refusalNormal:scalar(input.refusalNormal,REFUSAL_NORMAL),
    helpKnowledge:scalar(input.helpKnowledge,HELP_KNOWLEDGE),
    supportChoice:scalar(input.supportChoice,SUPPORT_CHOICE),
  };

  const required=['adult','consent','ageGroup','ownUse','last30','peerNorm','closeExposure','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','pressure','refusalNormal','helpKnowledge','supportChoice'];
  if(required.some(key=>answers[key]===null))return res.status(400).json({ok:false,error:'invalid_or_missing_answer'});
  if(answers.contexts===null||answers.closeRelations===null)return res.status(400).json({ok:false,error:'invalid_multi_answer'});
  if(answers.adult!=='yes'||answers.consent!=='yes')return res.status(400).json({ok:false,error:'consent_required'});

  const sheetUrl=process.env.SHEET_WEBHOOK_URL;
  const sheetSecret=process.env.SHEET_WEBHOOK_SECRET;
  const botToken=process.env.BOT_TOKEN;
  const chatId=process.env.CHAT_ID;
  if(!sheetUrl||!sheetSecret||!botToken||!chatId)return res.status(500).json({ok:false,error:'server_not_configured'});

  const responseId=makeId();
  const response={submitted_at:new Date().toISOString(),response_id:responseId,language,version:2,...answers};

  try{
    const sheet=await fetch(sheetUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({secret:sheetSecret,response})});
    const sheetText=await sheet.text();
    let sheetBody={};
    try{sheetBody=JSON.parse(sheetText);}catch{/* Apps Script may return non-json on deployment errors */}
    if(!sheet.ok||sheetBody.ok!==true)return res.status(502).json({ok:false,error:'sheet_delivery_failed',responseId});
  }catch{
    return res.status(502).json({ok:false,error:'sheet_unreachable',responseId});
  }

  const labels=FIELD_LABELS[language];
  const isRu=language==='ru';
  const order=['ageGroup','ownUse','last30','contexts','peerNorm','closeExposure','closeRelations','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','pressure','refusalNormal','helpKnowledge','supportChoice'];
  const lines=[
    isRu?'Новый ответ — «Помоги науке»':'Uus vastus — „Aita teadust“',
    `${isRu?'ID ответа':'Vastuse ID'}: ${responseId}`,
    `${isRu?'Язык':'Keel'}: ${language.toUpperCase()}`,
    `${isRu?'Отправлено':'Saadetud'}: ${localTimestamp()} (Tallinn)`,
    '',
    ...order.map(key=>`${labels[key]}: ${answerLabel(answers[key],language)}`),
    '',
    isRu?'Сохранено в Google Sheets.':'Salvestatud Google Sheetsi.',
  ];

  try{
    const telegram=await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:lines.join('\n'),disable_web_page_preview:true})});
    if(!telegram.ok)return res.status(502).json({ok:false,error:'telegram_delivery_failed',savedToSheet:true,responseId});
  }catch{
    return res.status(502).json({ok:false,error:'telegram_unreachable',savedToSheet:true,responseId});
  }

  return res.status(200).json({ok:true,responseId});
}
