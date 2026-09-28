import { useState } from 'react';
import type { FormEvent } from 'react';
import { readGameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';
type Status='idle'|'sending'|'sent'|'error';
const endpoint='https://alkohol-ja-aju.vercel.app/api/feedback';
const scaleValues=['1','2','3','4','5'];

function Scale({name,value,onChange,label,low,high}:{name:string;value:string;onChange:(value:string)=>void;label:string;low:string;high:string}){
  return <fieldset className="survey-question survey-scale-question" data-field={name}>
    <legend>{label}</legend>
    <div className="survey-scale" role="radiogroup" aria-label={label}>{scaleValues.map(v=><label key={v} className={value===v?'selected':''}><input type="radio" name={name} value={v} checked={value===v} onChange={e=>onChange(e.target.value)}/><span>{v}</span></label>)}</div>
    <div className="survey-scale-labels" aria-hidden="true"><span>1 — {low}</span><span>5 — {high}</span></div>
  </fieldset>;
}

export default function FeedbackSurvey({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [clarity,setClarity]=useState('');
  const [learned,setLearned]=useState('');
  const [recommend,setRecommend]=useState('');
  const [detailsOpen,setDetailsOpen]=useState(false);
  const [useful,setUseful]=useState('');
  const [comment,setComment]=useState('');
  const [consent,setConsent]=useState(false);
  const [status,setStatus]=useState<Status>('idle');
  const [errorDetail,setErrorDetail]=useState('');
  const [validationError,setValidationError]=useState('');
  const sectionOptions=[['brain',ru?'Мозг и алкоголь':'Aju ja alkohol'],['memory',ru?'Упражнение на память':'Mäluharjutus'],['attention',ru?'Упражнение на внимание':'Tähelepanuharjutus'],['lab',ru?'Игровая лаборатория':'Mängulabor'],['quiz',ru?'Миф или факт':'Müüt või fakt'],['sources',ru?'Источники и выводы':'Allikad ja kokkuvõte']];

  function reset(){setClarity('');setLearned('');setRecommend('');setDetailsOpen(false);setUseful('');setComment('');setConsent(false);setValidationError('');}
  async function post(body:Record<string,unknown>){const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),15000);try{return await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:controller.signal});}finally{window.clearTimeout(timeout);}}
  function validate(){const missing=[!clarity?'clarity':'',!learned?'learned':'',!recommend?'recommend':'',!consent?'consent':''].filter(Boolean);if(!missing.length)return true;setValidationError(ru?`Ответь на ${missing.length} обязательн${missing.length===1?'ый пункт':'ых пункта'} и подтверди согласие на отправку.`:`Vasta veel ${missing.length} kohustuslikule punktile ja kinnita saatmise nõusolek.`);window.setTimeout(()=>{const field=document.querySelector<HTMLElement>(`[data-field="${missing[0]}"]`);field?.querySelector<HTMLInputElement>('input, select, textarea, button')?.focus();},0);return false;}
  async function submit(event:FormEvent){event.preventDefault();if(status==='sending')return;setValidationError('');if(!validate())return;setStatus('sending');setErrorDetail('');try{const response=await post({feedbackVersion:'quick',clarity,learned,recommend,useful:useful||null,comment:comment.trim(),language:lang,gameMetrics:readGameMetrics()});if(!response.ok){let detail='';try{detail=(await response.json() as {error?:string}).error??'';}catch{/* no-op */}throw new Error(detail||`HTTP ${response.status}`);}setStatus('sent');reset();}catch(error){setStatus('error');setErrorDetail(error instanceof DOMException&&error.name==='AbortError'?(ru?'Сервер не ответил вовремя':'Server ei vastanud õigel ajal'):error instanceof Error?error.message:'unknown_error');}}

  if(status==='sent')return <div className="survey-finish" role="status"><strong>{ru?'Спасибо — ответ отправлен без имени и контактов.':'Aitäh — vastus saadeti ilma nime ja kontaktandmeteta.'}</strong><p>{ru?'Форма не спрашивала имя, e-mail или телефон.':'Vorm ei küsinud nime, e-posti ega telefoninumbrit.'}</p><button className="button" onClick={()=>setStatus('idle')}>{ru?'Оставить ещё один ответ':'Saada veel üks vastus'}</button></div>;
  return <form className="feedback-form feedback-form-quick" onSubmit={submit} noValidate>
    <div className="survey-intro-card"><span className="pill">{ru?'БЕЗ ПРЯМЫХ ИДЕНТИФИКАТОРОВ':'ILMA OTSESTE TUNNUSTETA'}</span><div><strong>{ru?'Три коротких вопроса · около минуты':'Kolm lühiküsimust · umbes minut'}</strong><p>{ru?'Подробности необязательны. Не указывай имя, контакты, данные о здоровье или другую личную информацию.':'Detailid on vabatahtlikud. Ära kirjuta nime, kontaktandmeid, terviseandmeid ega muud isiklikku teavet.'}</p></div></div>
    <div className="survey-block"><div className="survey-block-head"><span>01</span><h3>{ru?'Быстрая оценка':'Kiire hinnang'}</h3></div>
      <Scale name="clarity" value={clarity} onChange={setClarity} label={ru?'Насколько понятным был материал?':'Kui arusaadav oli õppematerjal?'} low={ru?'совсем непонятно':'üldse mitte arusaadav'} high={ru?'очень понятно':'väga arusaadav'}/>
      <fieldset className="survey-question" data-field="learned"><legend>{ru?'Узнал(а) ли ты что-то новое?':'Kas said midagi uut teada?'}</legend><div className="survey-inline"><label><input type="radio" name="learned" value="yes" checked={learned==='yes'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Да':'Jah'}</span></label><label><input type="radio" name="learned" value="partly" checked={learned==='partly'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Частично':'Osaliselt'}</span></label><label><input type="radio" name="learned" value="no" checked={learned==='no'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Нет':'Ei'}</span></label></div></fieldset>
      <fieldset className="survey-question" data-field="recommend"><legend>{ru?'Посоветовал(а) бы сайт однокласснику?':'Kas soovitaksid veebilehte klassikaaslasele?'}</legend><div className="survey-inline"><label><input type="radio" name="recommend" value="yes" checked={recommend==='yes'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Да':'Jah'}</span></label><label><input type="radio" name="recommend" value="maybe" checked={recommend==='maybe'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Возможно':'Võib-olla'}</span></label><label><input type="radio" name="recommend" value="no" checked={recommend==='no'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Нет':'Ei'}</span></label></div></fieldset>
    </div>
    <div className="survey-details"><button type="button" className="text-button" aria-expanded={detailsOpen} onClick={()=>setDetailsOpen(open=>!open)}>{detailsOpen?(ru?'Скрыть необязательные подробности':'Peida vabatahtlikud detailid'):(ru?'Добавить подробность (необязательно)':'Lisa detail (vabatahtlik)')}</button>{detailsOpen&&<div className="survey-detail-fields"><label className="survey-question survey-select">{ru?'Что оказалось самым полезным?':'Milline osa oli kõige kasulikum?'}<select value={useful} onChange={e=>setUseful(e.target.value)}><option value="">{ru?'Не выбирать':'Ära vali'}</option>{sectionOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label className="survey-question">{ru?'Что стоит улучшить?':'Mida võiks parandada?'}<textarea maxLength={500} value={comment} onChange={e=>setComment(e.target.value)} placeholder={ru?'До 500 символов':'Kuni 500 tähemärki'}/><small>{comment.length} / 500</small></label></div>}</div>
    <label className="survey-consent" data-field="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{ru?'Согласен(на) отправить эти ответы без прямых идентификаторов. Если я играл(а), в них могут войти результаты мини-игр из этой вкладки.':'Nõustun saatma need vastused ilma otseste tunnusteta. Kui mängisin, võivad vastusesse kuuluda selle vahelehe minimängude tulemused.'}</span></label>
    {validationError&&<p className="survey-error" role="alert">{validationError}</p>}{status==='error'&&<p className="survey-error" role="alert">{ru?'Не получилось отправить. Попробуй ещё раз.':'Saatmine ei õnnestunud. Proovi uuesti.'} <small>{errorDetail}</small></p>}
    <button className="button primary survey-submit" disabled={status==='sending'}>{status==='sending'?(ru?'Отправка…':'Saadan…'):(ru?'Отправить ответ':'Saada vastus')}</button>
  </form>;
}
