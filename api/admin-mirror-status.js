// Admin-only: row counts of the Supabase copy, so it can be compared with the Sheet before reads are ever switched over.
import {requireAdmin} from './_admin-auth.js';
import {mirrorCount} from './_mirror.js';

const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
function cors(req,res){const origin=req.headers?.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization');res.setHeader('Cache-Control','no-store');}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers?.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(!(await requireAdmin(req,res)))return;
  const [responses,prepost]=await Promise.all([mirrorCount('research_responses'),mirrorCount('prepost_submissions')]);
  return res.status(200).json({ok:true,configured:responses.configured,responses:responses.count??null,prepost:prepost.count??null});
}
