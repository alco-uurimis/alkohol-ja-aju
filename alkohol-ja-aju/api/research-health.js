const ALLOWED_ORIGINS = new Set([
  'https://alco-uurimis.github.io',
  'https://alkohol-ja-aju.vercel.app',
]);

function applyCors(req,res){
  const origin=req.headers.origin;
  if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
}

async function checkTelegram(){
  const token=process.env.BOT_TOKEN;
  const chatId=process.env.CHAT_ID;
  if(!token||!chatId){
    return {ok:false,configured:false,reason:!token&&!chatId?'missing_bot_token_and_chat_id':!token?'missing_bot_token':'missing_chat_id'};
  }
  try{
    const me=await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meBody=await me.json().catch(()=>({}));
    if(!me.ok||meBody.ok!==true)return {ok:false,configured:true,reason:'bot_token_invalid'};

    const chat=await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(chatId)}`);
    const chatBody=await chat.json().catch(()=>({}));
    if(!chat.ok||chatBody.ok!==true)return {ok:false,configured:true,reason:'chat_id_invalid_or_bot_has_no_access'};

    return {ok:true,configured:true,reason:'ok'};
  }catch{
    return {ok:false,configured:true,reason:'telegram_unreachable'};
  }
}

async function checkSheet(){
  const url=process.env.SHEET_WEBHOOK_URL;
  const secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret){
    return {ok:false,configured:false,reason:!url&&!secret?'missing_sheet_url_and_secret':!url?'missing_sheet_url':'missing_sheet_secret'};
  }
  try{
    const response=await fetch(url,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({secret,health:true}),
    });
    const text=await response.text();
    let data={};
    try{data=JSON.parse(text);}catch{}
    if(data.ok===true&&data.health===true)return {ok:true,configured:true,reason:'ok'};
    if(data.error==='forbidden')return {ok:false,configured:true,reason:'sheet_secret_mismatch'};
    if(data.error==='missing_secret')return {ok:false,configured:true,reason:'apps_script_missing_webhook_secret'};
    if(data.error==='missing_response_id')return {ok:false,configured:true,reason:'apps_script_outdated_redeploy_required'};
    return {ok:false,configured:true,reason:'sheet_webhook_error'};
  }catch{
    return {ok:false,configured:true,reason:'sheet_unreachable'};
  }
}

export default async function handler(req,res){
  applyCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const [telegram,sheet]=await Promise.all([checkTelegram(),checkSheet()]);
  return res.status(200).json({
    ok:telegram.ok&&sheet.ok,
    service:'research-delivery',
    telegram,
    sheet,
    checkedAt:new Date().toISOString(),
  });
}
