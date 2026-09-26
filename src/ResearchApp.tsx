import { useEffect, useMemo, useState } from 'react';
import { getResearchSteps, type Lang, type Question } from './researchData';

type Answers=Record<string,string|string[]>;
const languageKey='alkohol-ja-aju:language';
const researchEndpoint='https://alkohol-ja-aju.vercel.app/api/research';

function readLang():Lang{
  try{return window.localStorage.getItem(languageKey)==='ru'?'ru':'et';}catch{return'et';}
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
    <legend>{question.title}{question.optional&&<span> · {ru?'необязательно':'valikuline'}</span>}</legend>
    <div className="research-options">
      {question.options.map(option=>{
        const checked=question.type==='radio'?value===option.value:selected.includes(option.value);
        return <label key={option.value} className={'research-option '+(checked?'selected':'')}>
          <input type={question.type==='radio'?'radio':'checkbox'} name={question.id} checked={checked} onChange={()=>toggle(option.value)}/>
          <span className="research-control" aria-hidden="true"/>
          <span>{option.label}</span>
        </label>;
      })}
    </div>
  </fieldset>;
}

export default function ResearchApp(){
  const [lang,setLang]=useState<Lang>(readLang);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState<Answers>({});
  const [error,setError]=useState('');
  const [complete,setComplete]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [responseId,setResponseId]=useState('');
  const ru=lang==='ru';
  const steps=useMemo(()=>getResearchSteps(lang),[lang]);
  const current=steps[step];

  useEffect(()=>{
    document.documentElement.lang=lang;
    document.title=ru?'Помоги науке — исследовательский опрос':'Aita teadust — uurimisküsitlus';
    try{window.localStorage.setItem(languageKey,lang);}catch{/* optional */}
  },[lang,ru]);

  const visible=current.questions.filter(q=>!q.showWhen||!q.showWhen.notIn.includes(String(answers[q.showWhen.field]??'')));
  const valid=visible.every(q=>q.optional||(
    q.type==='multi' ? Array.isArray(answers[q.id])&&answers[q.id].length>0 : typeof answers[q.id]==='string'&&answers[q.id]!==''
  ));
  const ageGate=step!==0||(answers.adult==='yes'&&answers.consent==='yes');

  const update=(id:string,value:string|string[])=>setAnswers(prev=>({...prev,[id]:value}));
  const move=(delta:1|-1)=>{
    if(delta===1&&(!valid||!ageGate)){
      setError(ru?'Ответь на обязательные вопросы. Для чувствительных вопросов можно выбрать «предпочитаю не отвечать».':'Vasta kohustuslikele küsimustele. Tundliku küsimuse puhul saad valida „eelistan mitte vastata“.');
      return;
    }
    setError('');
    setStep(s=>Math.max(0,Math.min(steps.length-1,s+delta)));
    window.scrollTo({top:0,behavior:'smooth'});
  };

  const download=()=>{
    const blob=new Blob([JSON.stringify({version:2,language:lang,responseId:responseId||undefined,answers},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=responseId?`${responseId}.json`:'anonymous-research-response.json';a.click();URL.revokeObjectURL(url);
  };

  const submit=async()=>{
    if(!valid){
      setError(ru?'Ответь на обязательные вопросы перед отправкой.':'Vasta enne saatmist kohustuslikele küsimustele.');
      return;
    }
    setSubmitting(true);
    setError('');
    try{
      const response=await fetch(researchEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({language:lang,answers})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true){
        if(data.savedToSheet===true){
          setError(ru?'Ответ уже сохранён в Google Sheets, но уведомление в Telegram не доставлено. Можно безопасно нажать «Отправить» ещё раз — строка в таблице не продублируется.':'Vastus on Google Sheetsis juba salvestatud, kuid Telegrami teavitus ebaõnnestus. Võid turvaliselt uuesti saata — tabelisse duplikaati ei teki.');
        }else{
          setError(ru?'Не удалось отправить ответы. Проверь интернет и попробуй ещё раз — введённые ответы не потеряны.':'Vastuste saatmine ebaõnnestus. Kontrolli internetiühendust ja proovi uuesti — sisestatud vastused ei kao.' );
        }
        return;
      }
      setResponseId(String(data.responseId??''));
      setComplete(true);
      window.scrollTo({top:0,behavior:'smooth'});
    }catch{
      setError(ru?'Нет связи с сервером. Ответы остаются на этой странице — попробуй отправить ещё раз позже.':'Serveriga ei saadud ühendust. Vastused jäävad sellele lehele — proovi hiljem uuesti saata.');
    }finally{
      setSubmitting(false);
    }
  };

  if(complete)return <div className="research-shell">
    <ResearchHeader lang={lang} setLang={setLang}/>
    <main className="research-complete">
      <span className="research-kicker">{ru?'ОТВЕТ ПРИНЯТ':'VASTUS ON VASTU VÕETUD'}</span>
      <h1>{ru?'Спасибо за участие.':'Aitäh osalemast.'}</h1>
      <p>{ru?'Обезличенные ответы сохранены в приватной Google-таблице исследования и уведомление отправлено организатору в Telegram.':'Isikustamata vastused salvestati uuringu privaatsesse Google Sheetsi tabelisse ning korraldajale saadeti Telegrami teavitus.'}</p>
      {responseId&&<div className="research-code"><span>{ru?'ID ответа':'Vastuse ID'}</span><code>{responseId}</code></div>}
      <div className="research-complete-actions"><button className="research-secondary" type="button" onClick={download}>{ru?'Скачать свою копию JSON':'Laadi oma JSON-koopia alla'}</button></div>
      <div className="research-help"><strong>{ru?'Если тема затронула тебя лично':'Kui teema puudutas sind isiklikult'}</strong><p>{ru?'Можно поговорить с человеком, которому доверяешь, или обратиться к медицинскому или психологическому специалисту.':'Võid rääkida inimesega, keda usaldad, või pöörduda tervishoiu- või vaimse tervise spetsialisti poole.'}</p></div>
      <a className="research-home-large" href="../">{ru?'Вернуться на основной сайт':'Tagasi põhilehele'}</a>
    </main>
  </div>;

  return <div className="research-shell">
    <ResearchHeader lang={lang} setLang={setLang}/>
    <main className="research-main">
      <section className="research-hero">
        <span className="research-kicker">{ru?'АНОНИМНЫЙ УЧЕБНО-ИССЛЕДОВАТЕЛЬСКИЙ ОПРОС 18+':'ANONÜÜMNE ÕPPE- JA UURIMISKÜSITLUS 18+'}</span>
        <h1>{ru?'Помоги лучше понять, как алкоголь влияет на человека и его окружение.':'Aita paremini mõista, kuidas alkohol mõjutab inimest ja tema lähedasi.'}</h1>
        <p>{ru?'Около 4–6 минут. Здесь нет правильных ответов — важен реальный опыт и мнение.':'Umbes 4–6 minutit. Õigeid vastuseid ei ole — oluline on tegelik kogemus ja arvamus.'}</p>
        <div className="research-trust"><div><strong>18+</strong><span>{ru?'Опрос предназначен только для совершеннолетних.':'Küsitlus on mõeldud ainult täisealistele.'}</span></div><div><strong>{ru?'Без идентификации':'Ilma tuvastamiseta'}</strong><span>{ru?'Не спрашиваем имя, e-mail, школу или точную дату рождения.':'Me ei küsi nime, e-posti, kooli ega täpset sünnikuupäeva.'}</span></div><div><strong>{ru?'Два места хранения':'Kaks salvestuskohta'}</strong><span>{ru?'После отправки ответы сохраняются в приватной Google Sheet и дублируются сообщением в Telegram организатора.':'Pärast saatmist salvestatakse vastused privaatsesse Google Sheetsi ning koopia saadetakse korraldaja Telegrami.'}</span></div></div>
      </section>

      <section className="research-card">
        <div className="research-progress-head"><div><span>{ru?'ШАГ':'SAMM'} {step+1}/{steps.length}</span><strong>{current.title}</strong></div><b>{Math.round((step+1)/steps.length*100)}%</b></div>
        <div className="research-progress" aria-hidden="true"><span style={{width:`${(step+1)/steps.length*100}%`}}/></div>
        <div className="research-steps">{steps.map((item,index)=><span key={item.title} className={index===step?'active':index<step?'done':''}><b>{index+1}</b><small>{item.title}</small></span>)}</div>
        <div className="research-step">
          <h2>{current.title}</h2><p className="research-step-intro">{current.intro}</p>
          {step===0&&<div className="research-privacy"><strong>{ru?'Приватность и хранение':'Privaatsus ja säilitamine'}</strong><p>{ru?'Мы не запрашиваем имя, e-mail, школу, телефон или точную дату рождения. После финального подтверждения обезличенные ответы передаются через сервер проекта в приватную Google-таблицу и Telegram организатора. До отправки участие можно прекратить в любой момент.':'Me ei küsi nime, e-posti, kooli, telefoni ega täpset sünnikuupäeva. Pärast lõplikku kinnitamist saadetakse isikustamata vastused projekti serveri kaudu privaatsesse Google Sheetsi tabelisse ja korraldaja Telegrami. Enne saatmist võib osalemise igal ajal katkestada.'}</p></div>}
          {visible.map(q=><QuestionBlock key={q.id} question={q} value={answers[q.id]} onChange={value=>update(q.id,value)} lang={lang}/>)}
          {step===0&&(answers.adult==='no'||answers.consent==='no')&&<div className="research-stop">{ru?'Этот опрос нельзя продолжить. Участие добровольное и предназначено только для 18+.':'Seda küsitlust ei saa jätkata. Osalemine on vabatahtlik ja küsitlus on mõeldud ainult 18+ osalejatele.'}</div>}
          {step===steps.length-1&&<div className="research-privacy"><strong>{ru?'Перед отправкой':'Enne saatmist'}</strong><p>{ru?'Нажимая «Отправить ответы», ты подтверждаешь передачу обезличенных ответов в приватную Google-таблицу исследования и Telegram организатора. Имя и контактные данные не собираются.':'Nupule „Saada vastused“ vajutades kinnitad isikustamata vastuste edastamise uuringu privaatsesse Google Sheetsi tabelisse ja korraldaja Telegrami. Nime ega kontaktandmeid ei koguta.'}</p></div>}
        </div>
        {error&&<div className="research-error" role="alert">{error}</div>}
        <div className="research-actions">{step>0?<button className="research-secondary" type="button" onClick={()=>move(-1)} disabled={submitting}>{ru?'Назад':'Tagasi'}</button>:<a className="research-secondary" href="../">{ru?'Выйти':'Välju'}</a>}{step<steps.length-1?<button className="research-primary" type="button" onClick={()=>move(1)} disabled={step===0&&!ageGate}>{ru?'Продолжить':'Jätka'}</button>:<button className="research-primary" type="button" onClick={submit} disabled={submitting}>{submitting?(ru?'Отправка…':'Saatmine…'):(ru?'Отправить ответы':'Saada vastused')}</button>}</div>
      </section>
    </main>
  </div>;
}

function ResearchHeader({lang,setLang}:{lang:Lang;setLang:(lang:Lang)=>void}){
  const ru=lang==='ru';
  return <header className="research-header"><a className="research-brand" href="../"><img src="../logo-mark.svg" alt=""/><span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a><a className="research-home" href="../">{ru?'Основной сайт':'Põhileht'}</a><div className="research-lang" role="group" aria-label={ru?'Язык':'Keel'}><button type="button" className={lang==='et'?'active':''} onClick={()=>setLang('et')}>ET</button><button type="button" className={lang==='ru'?'active':''} onClick={()=>setLang('ru')}>RU</button></div></header>;
}
