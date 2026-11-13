// Admin-only: compares the Supabase copy with the Sheet. Stage 1 of moving reads to Supabase: nothing is switched,
// the page only shows whether the two sources would produce identical summaries.
import {requireAdmin} from './_admin-auth.js';
import {mirrorFetchAll} from './_mirror.js';
import {adminAggregate, publicAggregate, diff} from './_aggregate.js';

const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
function cors(req,res){const origin=req.headers?.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization');res.setHeader('Cache-Control','no-store');}
async function request(url,body){const options={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),redirect:'manual'};const first=await fetch(url,options);if(![301,302,303,307,308].includes(first.status))return first;const location=first.headers.get('location');if(!location)throw new Error('redirect_missing');const destination=new URL(location,url);if(destination.protocol!=='https:'||!/(^|\.)google(usercontent)?\.com$/i.test(destination.hostname))throw new Error('redirect_untrusted');return fetch(destination,{method:'GET'});}
async function fromSheet(body){
  const url=process.env.SHEET_WEBHOOK_URL,secret=process.env.SHEET_WEBHOOK_SECRET;
  if(!url||!secret)return null;
  try{const parsed=new URL(String(url).trim());if(parsed.protocol!=='https:'||parsed.hostname!=='script.google.com')return null;
    const r=await request(parsed.toString(),{secret,...body});const d=await r.json().catch(()=>null);return r.ok&&d?.ok===true?d:null;}catch{return null;}
}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers?.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(!(await requireAdmin(req,res)))return;
  const [responses,prepost]=await Promise.all([mirrorFetchAll('research_responses'),mirrorFetchAll('prepost_submissions')]);
  if(!responses||!prepost)return res.status(200).json({ok:true,configured:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),responses:null,prepost:null,parity:null});
  const [sheetAdmin,sheetPublic]=await Promise.all([fromSheet({adminAggregate:true}),fromSheet({aggregate:true,schemaVersion:4})]);
  const sbAdmin=adminAggregate(responses,prepost),sbPublic=publicAggregate(responses);
  // The Sheet may not have the PrePost tab / the pre-v13 script: report that instead of listing every field as different.
  const parity=sheetAdmin&&sheetPublic?{admin:diff(sheetAdmin,sbAdmin),public:diff(sheetPublic,sbPublic)}:{error:'sheet_unavailable_or_script_outdated'};
  return res.status(200).json({ok:true,configured:true,responses:responses.length,prepost:prepost.length,parity});
}
