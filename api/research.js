import {mirrorResponse} from './_mirror.js';
import {primaryDelivery,readSource,withDeadline} from './_source.js';
const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
const LANGUAGES=new Set(['et','ru','en']);
const YES_NO=new Set(['yes','no']);
const AGE_GROUPS=new Set(['15_17','18_20','21_25','26_35','36_plus','prefer_not']);
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

function isAllowedOrigin(origin){return !origin||ALLOWED_ORIGINS.has(origin)||/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);}
function applyCors(req,res){const origin=req.headers?.origin;if(origin&&isAllowedOrigin(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');res.setHeader('Access-Control-Max-Age','86400');res.setHeader('Cache-Control','no-store');}
function readBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string')return JSON.parse(req.body);return{};}
function scalar(value,allowed,optional=false){if(value===undefined||value===null||value==='')return optional?'':null;const v=String(value);return allowed.has(v)?v:null;}
function list(value,allowed){if(value===undefined||value===null)return[];if(!Array.isArray(value)||value.length>10)return null;const out=[];for(const item of value){const v=String(item);if(!allowed.has(v))return null;if(!out.includes(v))out.push(v);}return out.includes('prefer_not')?['prefer_not']:out;}
function makeId(){return`research_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,12)}`;}
function readSubmissionId(value){const v=String(value??'');return /^research_[a-z0-9_-]{8,90}$/i.test(v)?v:makeId();}
async function fetchWithTimeout(url,options,timeoutMs=45000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
async function postToAppsScript(url,body){const options={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),redirect:'manual'};const first=await fetchWithTimeout(url,options);if(![301,302,303,307,308].includes(first.status))return first;const location=first.headers.get('location');if(!location)throw new Error('apps_script_redirect_missing');const destination=new URL(location,url).toString();return [307,308].includes(first.status)?fetchWithTimeout(destination,options):fetchWithTimeout(destination,{method:'GET',headers:{accept:'application/json'}});}

async function deliverSheet(response){
  const url=process.env.SHEET_WEBHOOK_URL,secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret)return{ok:false,configured:false,error:'sheet_not_configured'};
  try{
    const parsed=new URL(String(url).trim());
    if(parsed.protocol!=='https:')return{ok:false,configured:true,error:'sheet_url_invalid'};
    const result=await postToAppsScript(parsed.toString(),{secret,response});
    const text=await result.text();let data={};try{data=JSON.parse(text);}catch{}
    if(!result.ok||data.ok!==true)return{ok:false,configured:true,error:'sheet_delivery_failed',status:result.status};
    return{ok:true,configured:true,duplicate:data.duplicate===true};
  }catch(error){return{ok:false,configured:true,error:error?.name==='AbortError'?'sheet_timeout':'sheet_unreachable'};}
}

async function deliverTelegram(){
  const token=process.env.BOT_TOKEN,chatId=process.env.CHAT_ID;
  if(!token||!chatId)return{ok:false,configured:false,error:'telegram_not_configured'};
  try{
    const result=await fetchWithTimeout(`https://api.telegram.org/bot${token}/sendMessage`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:chatId,text:'Alkohol ja aju: uus vastus salvestatud / новый ответ сохранён.',disable_web_page_preview:true})});
    if(!result.ok)return{ok:false,configured:true,error:'telegram_delivery_failed',status:result.status};
    return{ok:true,configured:true};
  }catch(error){return{ok:false,configured:true,error:error?.name==='AbortError'?'telegram_timeout':'telegram_internal_error'};}
}

export default async function handler(req,res){
  applyCors(req,res);
  try{
    if(req.method==='OPTIONS')return res.status(204).end();
    if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
    const origin=req.headers?.origin;if(origin&&!isAllowedOrigin(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
    if(Number(req.headers?.['content-length']||0)>18000)return res.status(413).json({ok:false,error:'payload_too_large'});
    let body;try{body=readBody(req);}catch{return res.status(400).json({ok:false,error:'invalid_json'});}
    const language=String(body.language??'');if(!LANGUAGES.has(language))return res.status(400).json({ok:false,error:'invalid_language'});
    const requestedVersion=Number(body.schemaVersion||2);const schemaVersion=requestedVersion>=4?4:requestedVersion>=3?3:2;
    const input={...(body.answers)};
    if(input.ageGroup!=="15_17")delete input.minorConsent;
    if(["never","prefer_not"].includes(input.ownUse)){
      delete input.typicalUnits; delete input.sixPlus; delete input.contexts;
    }
    if(["never","prefer_not"].includes(input.closeExposure)){
      delete input.closeRelations; delete input.closeHousehold;
    }if(!input||typeof input!=='object'||Array.isArray(input))return res.status(400).json({ok:false,error:'invalid_answers'});

    const ageEligible15Plus=scalar(input.ageEligible15Plus??input.adult,YES_NO);
    const answers={
      ageEligible15Plus,
      adult:ageEligible15Plus,
      consent:scalar(input.consent,YES_NO),
      ageGroup:scalar(input.ageGroup,AGE_GROUPS),
      minorConsent:scalar(input.minorConsent,YES_NO,true),
      ownUse:scalar(input.ownUse,OWN_USE),last30:scalar(input.last30,LAST30,true),typicalUnits:scalar(input.typicalUnits,TYPICAL_UNITS,true),sixPlus:scalar(input.sixPlus,SIX_PLUS,true),contexts:list(input.contexts,CONTEXTS),peerNorm:scalar(input.peerNorm,PEER_NORM),closeExposure:scalar(input.closeExposure,FREQ),closeRelations:list(input.closeRelations,CLOSE_RELATIONS),closeHousehold:scalar(input.closeHousehold,HOUSEHOLD,true),closeConflict:scalar(input.closeConflict,FREQ),closeUnsafe:scalar(input.closeUnsafe,FREQ),worry:scalar(input.worry,FREQ),sleep:scalar(input.sleep,FREQ),study:scalar(input.study,FREQ),mood:scalar(input.mood,FREQ),avoid:scalar(input.avoid,FREQ),unsafe:scalar(input.unsafe,FREQ),extraResponsibility:scalar(input.extraResponsibility,FREQ,true),overallImpact:scalar(input.overallImpact,OVERALL_IMPACT,true),pressure:scalar(input.pressure,FREQ),refusalNormal:scalar(input.refusalNormal,REFUSAL_NORMAL),helpKnowledge:scalar(input.helpKnowledge,HELP_KNOWLEDGE),supportChoice:scalar(input.supportChoice,SUPPORT_CHOICE)
    };

    const required=['ageEligible15Plus','consent','ageGroup','ownUse','peerNorm','closeExposure','closeConflict','closeUnsafe','worry','sleep','study','mood','avoid','unsafe','pressure','refusalNormal','helpKnowledge','supportChoice'];
    if(required.some(key=>answers[key]===null))return res.status(400).json({ok:false,error:'invalid_or_missing_answer'});
    if(answers.contexts===null||answers.closeRelations===null)return res.status(400).json({ok:false,error:'invalid_multi_answer'});
    if(answers.ageEligible15Plus!=='yes')return res.status(400).json({ok:false,error:'age_not_eligible'});
    if(answers.consent!=='yes')return res.status(400).json({ok:false,error:'consent_required'});
    if(schemaVersion>=4){
      if(answers.ageGroup==='prefer_not')return res.status(400).json({ok:false,error:'age_group_required'});
      if(answers.ageGroup==='15_17'&&answers.minorConsent!=='yes')return res.status(400).json({ok:false,error:'minor_consent_required'});
    }
    if(schemaVersion>=3){
      const drank=answers.ownUse!=='never'&&answers.ownUse!=='prefer_not';if(drank&&(!answers.typicalUnits||!answers.sixPlus))return res.status(400).json({ok:false,error:'missing_consumption_detail'});
      const exposed=answers.closeExposure!=='never'&&answers.closeExposure!=='prefer_not';if(exposed&&((!Array.isArray(answers.closeRelations)||answers.closeRelations.length===0)||!answers.closeHousehold))return res.status(400).json({ok:false,error:'missing_close_context'});
      if(!answers.extraResponsibility||!answers.overallImpact)return res.status(400).json({ok:false,error:'missing_impact_summary'});
    }else if(!answers.last30)return res.status(400).json({ok:false,error:'missing_last30'});

    const responseId=readSubmissionId(body.submissionId);
    const response={submitted_at:new Date().toISOString(),response_id:responseId,language,version:schemaVersion,...answers};
    const [sheetResult,mirrorResult]=await Promise.all([readSource()==='supabase'?withDeadline(deliverSheet(response),6000,{ok:false,configured:true,error:'sheet_slow'}):deliverSheet(response),mirrorResponse(response)]);
    const sheet=primaryDelivery(sheetResult,mirrorResult);
    const telegram=sheet.ok&&!sheet.duplicate?await deliverTelegram():{ok:false,configured:Boolean(process.env.BOT_TOKEN&&process.env.CHAT_ID),error:sheet.duplicate?'notification_already_attempted':'answer_not_saved'};
    const channels={sheet:Boolean(sheet.ok),telegram:Boolean(telegram.ok)},configured={sheet:Boolean(sheet.configured),telegram:Boolean(telegram.configured)},warnings=[];
    if(!sheet.ok)warnings.push(sheet.error);if(!telegram.ok)warnings.push(telegram.error);
    if(sheet.ok)return res.status(200).json({ok:true,responseId,channels,configured,warnings,delivery:{sheet,telegram}});
    const error=!sheet.configured&&!telegram.configured?'server_not_configured':'delivery_failed';
    return res.status(error==='server_not_configured'?500:502).json({ok:false,error,responseId,channels,configured,warnings,delivery:{sheet,telegram}});
  }catch(error){console.error('research_handler_failed',error?.name||'Error');return res.status(500).json({ok:false,error:'internal_error'});}
}

