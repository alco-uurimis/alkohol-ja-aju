import { useState } from 'react';
import type { FormEvent } from 'react';

type Lang='et'|'ru';
const endpoint='https://alkohol-ja-aju.vercel.app/api/feedback';

export default function FeedbackSurvey({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [clarity,setClarity]=useState('');
  const [useful,setUseful]=useState('');
  const [recommend,setRecommend]=useState('');
  const [comment,setComment]=useState('');
  const [consent,setConsent]=useState(false);
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!consent)return;
    setStatus('sending');
    try{
      const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({clarity,useful,recommend,comment,language:lang})});
      if(!res.ok)throw new Error('submit failed');
      setStatus('sent');setClarity('');setUseful('');setRecommend('');setComment('');setConsent(false);
    }catch{setStatus('error');}
  }

  return <form className="feedback-form" onSubmit={submit}>
    <fieldset><legend>{ru?'Насколько понятным был материал?':'Kui arusaadav oli õppematerjal?'}</legend><div className="survey-scale">{['1','2','3','4','5'].map(v=><label key={v}><input required type="radio" name="clarity" value={v} checked={clarity===v} onChange={e=>setClarity(e.target.value)}/><span>{v}</span></label>)}</div><p className="small">{ru?'1 — совсем непонятно, 5 — очень понятно':'1 — üldse mitte arusaadav, 5 — väga arusaadav'}</p></fieldset>
    <label>{ru?'Какой раздел оказался самым полезным?':'Milline osa oli kõige kasulikum?'}<select required value={useful} onChange={e=>setUseful(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option><option value="brain">{ru?'Мозг и алкоголь':'Aju ja alkohol'}</option><option value="memory">{ru?'Упражнение на память':'Mäluharjutus'}</option><option value="attention">{ru?'Упражнение на внимание':'Tähelepanuharjutus'}</option><option value="quiz">{ru?'Миф или факт':'Müüt või fakt'}</option></select></label>
    <fieldset><legend>{ru?'Посоветовал(а) бы ты этот материал однокласснику?':'Kas soovitaksid seda õppematerjali klassikaaslasele?'}</legend><div className="survey-inline"><label><input required type="radio" name="recommend" value="yes" checked={recommend==='yes'} onChange={e=>setRecommend(e.target.value)}/>{ru?' Да':' Jah'}</label><label><input type="radio" name="recommend" value="no" checked={recommend==='no'} onChange={e=>setRecommend(e.target.value)}/>{ru?' Нет':' Ei'}</label></div></fieldset>
    <label>{ru?'Комментарий или предложение (необязательно)':'Kommentaar või ettepanek (valikuline)'}<textarea maxLength={1000} rows={4} value={comment} onChange={e=>setComment(e.target.value)} placeholder={ru?'Не указывай имя, телефон или другие личные данные.':'Ära lisa nime, telefoninumbrit ega muid isikuandmeid.'}/></label>
    <label className="check-label"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{ru?' Я согласен(-на) отправить эти анонимные ответы автору проекта.':' Nõustun saatma need anonüümsed vastused projekti autorile.'}</label>
    <button className="button primary" disabled={status==='sending'}>{status==='sending'?(ru?'Отправка…':'Saadan…'):(ru?'Отправить ответы':'Saada vastused')}</button>
    {status==='sent'&&<p className="survey-status success" role="status">{ru?'Спасибо. Ответы отправлены.':'Aitäh. Vastused on saadetud.'}</p>}
    {status==='error'&&<p className="survey-status error" role="status">{ru?'Не удалось отправить ответы. Попробуй позже.':'Vastuste saatmine ebaõnnestus. Proovi hiljem uuesti.'}</p>}
  </form>;
}
