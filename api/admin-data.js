// Uncensored research data for signed-in admins only.
// Auth: the caller sends a Supabase access token (Google sign-in). We ask Supabase who the token belongs to and
// release data only if that e-mail is confirmed and listed in ADMIN_EMAILS (comma-separated, set in Vercel, never in the repo).
const ALLOWED_ORIGINS=new Set(['https://alco-uurimis.github.io','https://alkohol-ja-aju.vercel.app']);

export function isAdminUser(user,allowlist){
  const emails=String(allowlist||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  const email=String(user?.email||'').trim().toLowerCase();
  return Boolean(email)&&Boolean(user?.email_confirmed_at||user?.confirmed_at)&&emails.includes(email);
}

function cors(req,res){const origin=req.headers?.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Allow-Methods','GET, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Authorization');res.setHeader('Cache-Control','no-store');}

async function currentUser(token){
  const base=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');const key=process.env.SUPABASE_ANON_KEY;
  if(!base||!key||!token)return null;
  const r=await fetch(`${base}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});
  return r.ok?r.json():null;
}

async function request(url,body){const options={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),redirect:'manual'};const first=await fetch(url,options);if(![301,302,303,307,308].includes(first.status))return first;const location=first.headers.get('location');if(!location)throw new Error('missing_redirect');const destination=new URL(location,url).toString();return [307,308].includes(first.status)?fetch(destination,options):fetch(destination,{headers:{accept:'application/json'}});}

export default async function handler(req,res){
  cors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const origin=req.headers?.origin;if(origin&&!ALLOWED_ORIGINS.has(origin))return res.status(403).json({ok:false,error:'origin_not_allowed'});
  if(!process.env.ADMIN_EMAILS||!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY)return res.status(503).json({ok:false,error:'admin_not_configured'});
  const header=String(req.headers?.authorization||'');const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
  if(!token)return res.status(401).json({ok:false,error:'unauthorised'});
  let user=null;try{user=await currentUser(token);}catch{return res.status(502).json({ok:false,error:'auth_unreachable'});}
  if(!user)return res.status(401).json({ok:false,error:'unauthorised'});
  if(!isAdminUser(user,process.env.ADMIN_EMAILS))return res.status(403).json({ok:false,error:'forbidden'});
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
