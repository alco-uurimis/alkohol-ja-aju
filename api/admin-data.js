// Uncensored research data for signed-in admins only (see _admin-auth.js).
import {isAdminUser,requireAdmin} from './_admin-auth.js';
export {isAdminUser};

const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);

function cors(req,res){const origin=req.headers?.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization');res.setHeader('Cache-Control','no-store');}

async function request(url,body){const options={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),redirect:'manual'};const first=await fetch(url,options);if(![301,302,303,307,308].includes(first.status))return first;const location=first.headers.get('location');if(!location)throw new Error('missing_redirect');const destination=new URL(location,url).toString();return [307,308].includes(first.status)?fetch(destination,options):fetch(destination,{headers:{accept:'application/json'}});}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers?.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(!(await requireAdmin(req,res)))return;
  const url=process.env.SHEET_WEBHOOK_URL,secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret)return res.status(503).json({ok:false,error:'summary_not_configured'});
  try{
    const parsed=new URL(String(url).trim());if(parsed.protocol!=='https:'||parsed.hostname!=='script.google.com')return res.status(503).json({ok:false,error:'summary_url_invalid'});
    const response=await request(parsed.toString(),{secret,adminAggregate:true});
    const data=await response.json().catch(()=>null);
    if(!response.ok||data?.ok!==true||!data.fields)return res.status(502).json({ok:false,error:'upstream_failed_or_script_outdated'});
    return res.status(200).json(data);
  }catch{return res.status(502).json({ok:false,error:'summary_unreachable'});}
}
