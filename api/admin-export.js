// Admin-only CSV backup of the Supabase tables: GET ?table=responses|prepost
import {requireAdmin} from './_admin-auth.js';
import {mirrorFetchAll} from './_mirror.js';
import {responsesCsv,prepostCsv} from './_csv.js';

const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);
function cors(req,res){const origin=req.headers?.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization');res.setHeader('Cache-Control','no-store');}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers?.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(!(await requireAdmin(req,res)))return;
  const table=req.query?.table==='prepost'?'prepost_submissions':req.query?.table==='responses'?'research_responses':null;
  if(!table)return res.status(400).json({ok:false,error:'invalid_table'});
  const rows=await mirrorFetchAll(table);
  if(!rows)return res.status(502).json({ok:false,error:'supabase_unreachable'});
  res.setHeader('Content-Type','text/csv; charset=utf-8');
  res.setHeader('Content-Disposition',`attachment; filename="${table==='research_responses'?'Responses':'PrePost'}-${new Date().toISOString().slice(0,10)}.csv"`);
  return res.status(200).send('﻿'+(table==='research_responses'?responsesCsv(rows):prepostCsv(rows)));
}
