import { useEffect, useMemo, useState } from 'react';
import { getResearchSteps, type Lang, type Question } from './researchData';
import { T, languageKey, readSurveyLang } from './data/researchT';

type Answers=Record<string,string|string[]>;
const researchEndpoint='https://alkohol-ja-aju.vercel.app/api/research';

function createSubmissionId(){const random=globalThis.crypto?.randomUUID?.()??Math.random().toString(36).slice(2);return`research_${Date.now().toString(36)}_${random.replace(/-/g,'').slice(0,16)}`;}

function isVisible(question:Question,answers:Answers){
  return !question.showWhen||!question.showWhen.notIn.includes(String(answers[question.showWhen.field]??''));
}

function QuestionBlock({question,value,onChange,lang}:{question:Question;value:string|string[]|undefined;onChange:(value:string|string[])=>void;lang:Lang}){
  const selected=Array.isArray(value)?value:[];
  const ru=lang==='ru';
  const toggle=(next:string)=>{
    if(question.type==='radio')return onChange(next);
    if(next==='prefer_not')return onChange(selected.includes(next)?[]:['prefer_not']);
    const clean=selected.filter(v=>v!=='prefer_not');
    onChange(clean.includes(next)?clean.filter(v=>v!==next):[...clean,next]);
  };
  return <fieldset className="research-question">
    <legend>{question.title}{question.optional&&<span> · {T(lang,ru?'необязательно':'valikuline')}</span>}</legend>
    {question.hint&&<p className="research-question-hint">{question.hint}</p>}
    <div className="research-options">{question.options.map(option=>{
      const checked=question.type==='radio'?value===option.value:selected.includes(option.value);
      return <label key={option.value} className={'research-option '+(checked?'selected':'')}>
        <input type={question.type==='radio'?'radio':'checkbox'} name={question.id} checked={checked} onChange={()=>toggle(option.value)}/>
        <span className="research-control" aria-hidden="true"/><span>{option.label}</span>
      </label>;
    })}</div>
  </fieldset>;
}

export default function ResearchApp(){
  const [lang,setLang]=useState<Lang>(readSurveyLang);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Answers>({});
  const [error,setError]=useState('');
  const [complete,setComplete]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [responseId,setResponseId]=useState('');
  const [submissionId]=useState(createSubmissionId);
  const ru=lang==='ru';
  const steps=useMemo(()=>getResearchSteps(lang),[lang]);
  const current=steps[step];
  const isMinor=answers.ageGroup==='15_17';

  useEffect(()=>{
    document.documentElement.lang=lang;
    document.title=T(lang,ru?'Помоги науке — исследовательский опрос':'Aita teadust — uurimisküsitlus');
    try{window.localStorage.setItem(languageKey,lang);}catch{}
  },[lang,ru]);

  const visible=current.questions.filter(q=>isVisible(q,answers));
  const valid=visible.every(q=>q.optional||(q.type==='multi'?Array.isArray(answers[q.id])&&answers[q.id].length>0:typeof answers[q.id]==='string'&&answers[q.id]!==''));
  const consentGate=step!==0||(
    answers.ageEligible15Plus==='yes'&&
    typeof answers.ageGroup==='string'&&answers.ageGroup!==''&&
    answers.consent==='yes'&&
    (!isMinor||answers.minorConsent==='yes')
  );
  const update=(id:string,value:string|string[])=>setAnswers(prev=>{
    const next={...prev,[id]:value};
    for(const {questions} of steps)for(const question of questions)if(!isVisible(question,next))delete next[question.id];
    return next;
  });
  const move=(delta:1|-1)=>{
    if(delta===1&&(!valid||!consentGate)){setError(T(lang,ru?'Заполни обязательные пункты согласия. Для чувствительных вопросов дальше можно выбрать «предпочитаю не отвечать».':'Täida kohustuslikud nõusolekuväljad. Tundlike küsimuste puhul saad hiljem valida „eelistan mitte vastata“.'));return;}
    setError('');setStep(s=>Math.max(0,Math.min(steps.length-1,s+delta)));window.scrollTo({top:0,behavior:'smooth'});
  };
  const download=()=>{
    const blob=new Blob([JSON.stringify({version:4,language:lang,responseId:responseId||submissionId,answers},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${responseId||submissionId}.json`;a.click();URL.revokeObjectURL(url);
  };
  const submit=async()=>{
    if(!valid){setError(T(lang,ru?'Ответь на обязательные вопросы перед отправкой.':'Vasta enne saatmist kohustuslikele küsimustele.'));return;}
    setSubmitting(true);setError('');
    try{
      const response=await fetch(researchEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({schemaVersion:4,submissionId,language:lang,answers})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true){
        console.error('Research delivery failed',data);
        const why=` (HTTP ${response.status}${typeof data?.error==='string'?' · '+data.error.slice(0,60):''})`;
        if(data?.error==='age_not_eligible')setError(T(lang,ru?'Опрос доступен только участникам от 15 лет.':'Küsitlus on mõeldud ainult vähemalt 15-aastastele.'));
        else if(data?.error==='minor_consent_required')setError(T(lang,ru?'Для участника 15–17 лет нужно подтвердить отдельное информированное согласие.':'15–17-aastane osaleja peab kinnitama eraldi teadliku nõusoleku.'));
        else if(data?.configured?.telegram===false&&data?.configured?.sheet===false)setError(T(lang,ru?'Сервис отправки пока не настроен на сервере. Ответы не потеряны — попробуй позже.':'Saatmisteenus pole serveris veel seadistatud. Vastused ei kao — proovi hiljem uuesti.')+why);
        else setError(T(lang,ru?'Не удалось подтвердить сохранение. Ответы остаются в этой вкладке — попробуй отправить ещё раз.':'Salvestamist ei õnnestunud kinnitada. Vastused jäävad sellesse vahelehte – proovi uuesti.')+why);
        return;
      }
      setResponseId(String(data.responseId??submissionId));
      setComplete(true);window.scrollTo({top:0,behavior:'smooth'});
    }catch(error){console.error('Research request failed',error+' (network / CORS)');setError(T(lang,ru?'Нет связи с сервером. Ответы остаются на этой странице — попробуй отправить ещё раз позже.':'Serveriga ei saadud ühendust. Vastused jäävad sellele lehele — proovi hiljem uuesti saata.'));}
    finally{setSubmitting(false);}
  };

  if(complete){
    return <div className="research-shell"><ResearchHeader lang={lang} setLang={setLang}/><main className="research-complete">
      <span className="research-kicker">{T(lang,ru?'ОТВЕТ ПРИНЯТ':'VASTUS ON VASTU VÕETUD')}</span>
      <h1>{T(lang,ru?'Спасибо за участие.':'Aitäh osalemast.')}</h1>
      <p>{T(lang,ru?'Ответ сохранён в закрытой таблице исследования.':'Vastus salvestati uuringu privaatsesse tabelisse.')}</p>
      {responseId&&<div className="research-code"><span>{T(lang,ru?'ID ответа':'Vastuse ID')}</span><code>{responseId}</code></div>}
      <div className="research-complete-actions"><button className="research-secondary" type="button" onClick={download}>{T(lang,ru?'Скачать свою копию JSON':'Laadi oma JSON-koopia alla')}</button></div>
      <div className="research-help"><strong>{T(lang,ru?'Если тема затронула тебя лично':'Kui teema puudutas sind isiklikult')}</strong><p>{T(lang,ru?'Можно поговорить с человеком, которому доверяешь, или обратиться к медицинскому или психологическому специалисту.':'Võid rääkida inimesega, keda usaldad, või pöörduda tervishoiu- või vaimse tervise spetsialisti poole.')}</p>{isMinor&&<p>{T(lang,ru?'Для подростков в Эстонии также круглосуточно работает Lasteabi 116 111 — бесплатно, на русском, эстонском и английском.':'Noortele on Eestis ööpäev läbi olemas ka Lasteabi 116 111 — tasuta, eesti, vene ja inglise keeles.')}</p>}</div>
      <a className="research-home-large" href={lang==='en'?'../en/':'../'}>{T(lang,ru?'Вернуться на основной сайт':'Tagasi põhilehele')}</a>
    </main></div>;
  }

  const blocked=step===0&&(answers.ageEligible15Plus==='no'||answers.consent==='no'||(isMinor&&answers.minorConsent==='no'));
  return <div className="research-shell"><ResearchHeader lang={lang} setLang={setLang}/><main className="research-main">
    <section className="research-hero"><span className="research-kicker">{T(lang,ru?'ДОБРОВОЛЬНЫЙ УЧЕБНО-ИССЛЕДОВАТЕЛЬСКИЙ ОПРОС 15+':'VABATAHTLIK ÕPPE- JA UURIMISKÜSITLUS 15+')}</span><h1>{T(lang,ru?'Помоги лучше понять, как алкоголь влияет на человека и его окружение.':'Aita paremini mõista, kuidas alkohol mõjutab inimest ja tema lähedasi.')}</h1><p>{T(lang,ru?'Около 5–7 минут. Здесь нет правильных ответов — важен реальный опыт и мнение.':'Umbes 5–7 minutit. Õigeid vastuseid ei ole — oluline on tegelik kogemus ja arvamus.')}</p><div className="research-trust"><div><strong>15+</strong><span>{T(lang,ru?'Для 15–17-летних предусмотрено отдельное информированное согласие.':'15–17-aastastele on eraldi teadliku nõusoleku samm.')}</span></div><div><strong>{T(lang,ru?'Без прямых идентификаторов':'Ilma otseste tunnusteta')}</strong><span>{T(lang,ru?'Не спрашиваем имя, e-mail, школу, телефон или точную дату рождения.':'Me ei küsi nime, e-posti, kooli, telefoni ega täpset sünnikuupäeva.')}</span></div><div><strong>{T(lang,ru?'Закрытая таблица':'Privaatne tabel')}</strong><span>{T(lang,ru?'Ответ сохраняется в закрытой таблице исследования.':'Vastus salvestatakse uuringu privaatsesse Google Sheetsi tabelisse.')}</span></div></div></section>
    <section className="research-card">
      <div className="research-progress-head"><div><span>{T(lang,ru?'ШАГ':'SAMM')} {step+1}/{steps.length}</span><strong>{current.title}</strong></div><b>{Math.round((step+1)/steps.length*100)}%</b></div>
      <div className="research-progress" aria-hidden="true"><span style={{width:`${(step+1)/steps.length*100}%`}}/></div>
      <div className="research-steps">{steps.map((item,index)=><span key={item.title} className={index===step?'active':index<step?'done':''}><b>{index+1}</b><small>{item.title}</small></span>)}</div>
      <div className="research-step"><h2>{current.title}</h2><p className="research-step-intro">{current.intro}</p>{step===0&&<div className="research-privacy"><strong>{T(lang,ru?'Приватность, возраст и согласие':'Privaatsus, vanus ja nõusolek')}</strong><p>{T(lang,ru?'Мы не запрашиваем имя, e-mail, школу, телефон или точную дату рождения. Ответы без прямых идентификаторов передаются через сервер проекта в приватную Google-таблицу. Для 15–17-летних самостоятельное участие допустимо только при соблюдении применимых требований конкретного исследования; эта веб-форма сама по себе не является этическим одобрением.':'Me ei küsi nime, e-posti, kooli, telefoni ega täpset sünnikuupäeva. Otseste tunnusteta vastused saadetakse projekti serveri kaudu privaatsesse Google Sheetsi tabelisse. 15–17-aastaste iseseisev osalemine on lubatud ainult konkreetsele uuringule kohalduvate nõuete täitmisel; veebivorm ise ei ole eetikakooskõlastus.')}</p></div>}{visible.map(q=><QuestionBlock key={q.id} question={q} value={answers[q.id]} onChange={value=>update(q.id,value)} lang={lang}/>)}{blocked&&<div className="research-stop">{answers.ageEligible15Plus==='no'?(T(lang,ru?'Этот опрос предназначен для участников от 15 лет.':'Küsitlus on mõeldud vähemalt 15-aastastele.')):(T(lang,ru?'Продолжить нельзя без добровольного информированного согласия.':'Ilma vabatahtliku teadliku nõusolekuta ei saa jätkata.'))}</div>}{step===steps.length-1&&<div className="research-privacy"><strong>{T(lang,ru?'Перед отправкой':'Enne saatmist')}</strong><p>{T(lang,ru?'Нажимая «Отправить ответы», ты подтверждаешь передачу ответов без прямых идентификаторов в приватную Google-таблицу исследования.':'Nupule „Saada vastused“ vajutades kinnitad otseste tunnusteta vastuste edastamise uuringu privaatsesse Google Sheetsi tabelisse.')}</p></div>}</div>
      {error&&<div className="research-error" role="alert">{error}</div>}
      <div className="research-actions">{step>0?<button className="research-secondary" type="button" onClick={()=>move(-1)} disabled={submitting}>{T(lang,ru?'Назад':'Tagasi')}</button>:<a className="research-secondary" href={lang==='en'?'../en/':'../'}>{T(lang,ru?'Выйти':'Välju')}</a>}{step<steps.length-1?<button className="research-primary" type="button" onClick={()=>move(1)} disabled={step===0&&!consentGate}>{T(lang,ru?'Продолжить':'Jätka')}</button>:<button className="research-primary" type="button" onClick={submit} disabled={submitting}>{submitting?(T(lang,ru?'Отправка…':'Saatmine…')):(T(lang,ru?'Отправить ответы':'Saada vastused'))}</button>}</div>
    </section>
  </main></div>;
}

function ResearchHeader({lang,setLang}:{lang:Lang;setLang:(lang:Lang)=>void}){
  const ru=lang==='ru';
  return <header className="research-header"><a className="research-brand" href={lang==='en'?'../en/':'../'} aria-label={T(lang,ru?'алкоголь и мозг':'alkohol ja aju')}><img src="../logo-mark.svg" alt=""/><span>{T(lang,ru?'алкоголь и мозг':'alkohol ja aju')}</span></a><a className="research-home" href={lang==='en'?'../en/':'../'}>{T(lang,ru?'Основной сайт':'Põhileht')}</a><div className="research-lang" role="group" aria-label={T(lang,ru?'Язык':'Keel')}><button type="button" className={lang==='et'?'active':''} onClick={()=>setLang('et')}>ET</button><button type="button" className={lang==='ru'?'active':''} onClick={()=>setLang('ru')}>RU</button><button type="button" className={lang==='en'?'active':''} onClick={()=>setLang('en')}>EN</button></div></header>;
}
