// Shared admin check for the API. Files starting with "_" are helpers, not routes.
// Auth: the caller sends a Supabase access token (Google sign-in). We ask Supabase who the token belongs to and
// allow the request only if that e-mail is confirmed and listed in ADMIN_EMAILS (comma-separated, set in Vercel, never in the repo).

export function isAdminUser(user,allowlist){
  const emails=String(allowlist||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
  const email=String(user?.email||'').trim().toLowerCase();
  return Boolean(email)&&Boolean(user?.email_confirmed_at||user?.confirmed_at)&&emails.includes(email);
}

async function currentUser(token){
  const base=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');const key=process.env.SUPABASE_ANON_KEY;
  if(!base||!key||!token)return null;
  const r=await fetch(`${base}/auth/v1/user`,{headers:{apikey:key,Authorization:`Bearer ${token}`}});
  return r.ok?r.json():null;
}

/** Returns the admin user, or null after sending the appropriate error response. */
export async function requireAdmin(req,res){
  if(!process.env.ADMIN_EMAILS||!process.env.SUPABASE_URL||!process.env.SUPABASE_ANON_KEY){res.status(503).json({ok:false,error:'admin_not_configured'});return null;}
  const header=String(req.headers?.authorization||'');const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
  if(!token){res.status(401).json({ok:false,error:'unauthorised'});return null;}
  let user=null;try{user=await currentUser(token);}catch{res.status(502).json({ok:false,error:'auth_unreachable'});return null;}
  if(!user){res.status(401).json({ok:false,error:'unauthorised'});return null;}
  if(!isAdminUser(user,process.env.ADMIN_EMAILS)){res.status(403).json({ok:false,error:'forbidden'});return null;}
  return user;
}
