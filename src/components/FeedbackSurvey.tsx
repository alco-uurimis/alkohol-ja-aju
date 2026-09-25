import { useState } from 'react';
import type { FormEvent } from 'react';

type Lang='et'|'ru';
const endpoint='https://alkohol-ja-aju.vercel.app/api/feedback';
const scaleValues=['1','2','3','4','5'];

function Scale({name,value,onChange,label,low,high}:{name:string;value:string;onChange:(value:string)=>void;label:string;low:string;high:string}){
  return <fieldset><legend>{label}</legend><div className="survey-scale">{scaleValues.map(v=><label key={v}><input required type="radio" name={name} value={v} checked={value===v} onChange={e=>onChange(e.target.value)}/><span>{v}</span></label>)}</div><p className="small">1 — {low}, 5 — {high}</p></fieldset>;
}

export default function FeedbackSurvey({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [knowledgeBefore,setKnowledgeBefore]=useState('');
  const [knowledgeAfter,setKnowledgeAfter]=useState('');
  const [clarity,setClarity]=useState('');
  const [interest,setInterest]=useState('');
  const [navigation,setNavigation]=useState('');
  const [visuals,setVisuals]=useState('');
  const [memoryDifficulty,setMemoryDifficulty]=useState('');
  const [attentionDifficulty,setAttentionDifficulty]=useState('');
  const [gamesUseful,setGamesUseful]=useState('');
  const [confidence,setConfidence]=useState('');
  const [useful,setUseful]=useState('');
  const [leastClear,setLeastClear]=useState('');
  const [pace,setPace]=useState('');
  const [learned,setLearned]=useState('');
  const [recommend,setRecommend]=useState('');
  const [comment,setComment]=useState('');
  const [consent,setConsent]=useState(false);
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');

  const reset=()=>{
    setKnowledgeBefore('');setKnowledgeAfter('');setClarity('');setInterest('');setNavigation('');setVisuals('');
    setMemoryDifficulty('');setAttentionDifficulty('');setGamesUseful('');setConfidence('');setUseful('');setLeastClear('');
    setPace('');setLearned('');setRecommend('');setComment('');setConsent(false);
  };

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!consent)return;
    setStatus('sending');
    try{
      const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        knowledgeBefore,knowledgeAfter,clarity,interest,navigation,visuals,memoryDifficulty,attentionDifficulty,gamesUseful,confidence,useful,leastClear,pace,learned,recommend,comment,language:lang
      })});
      if(!res.ok)throw new Error('submit failed');
      setStatus('sent');reset();
    }catch{setStatus('error');}
  }

  const sectionOptions=[
    ['brain',ru?'Мозг и алкоголь':'Aju ja alkohol'],
    ['memory',ru?'Упражнение на память':'Mäluharjutus'],
    ['attention',ru?'Упражнение на внимание':'Tähelepanuharjutus'],
    ['lab',ru?'Игровая лаборатория':'Mängulabor'],
    ['quiz',ru?'Миф или факт':'Müüt või fakt'],
    ['sources',ru?'Источники и выводы':'Allikad ja kokkuvõte'],
  ];

  return <form className="feedback-form" onSubmit={submit}>
    <div className="survey-block"><h3>{ru?'1. Знания и понимание':'1. Teadmised ja arusaamine'}</h3>
      <Scale name="knowledgeBefore" value={knowledgeBefore} onChange={setKnowledgeBefore} label={ru?'Как ты оцениваешь свои знания об алкоголе и работе мозга до просмотра материала?':'Kuidas hindad oma teadmisi alkoholi ja aju toimimise kohta enne materjali läbimist?'} low={ru?'почти ничего не знал(а)':'teadsin väga vähe'} high={ru?'знал(а) много':'teadsin palju'}/>
      <Scale name="knowledgeAfter" value={knowledgeAfter} onChange={setKnowledgeAfter} label={ru?'Как ты оцениваешь свои знания после просмотра материала?':'Kuidas hindad oma teadmisi pärast materjali läbimist?'} low={ru?'знаю очень мало':'tean väga vähe'} high={ru?'знаю намного больше':'tean palju rohkem'}/>
      <Scale name="clarity" value={clarity} onChange={setClarity} label={ru?'Насколько понятным был материал?':'Kui arusaadav oli õppematerjal?'} low={ru?'совсем непонятно':'üldse mitte arusaadav'} high={ru?'очень понятно':'väga arusaadav'}/>
      <Scale name="confidence" value={confidence} onChange={setConfidence} label={ru?'Насколько уверенно ты теперь отличаешь мифы об алкоголе от фактов?':'Kui kindlalt oskad nüüd alkoholi kohta käivaid müüte faktidest eristada?'} low={ru?'совсем не уверен(а)':'üldse mitte kindlalt'} high={ru?'очень уверен(а)':'väga kindlalt'}/>
    </div>

    <div className="survey-block"><h3>{ru?'2. Интерес и удобство':'2. Huvi ja kasutusmugavus'}</h3>
      <Scale name="interest" value={interest} onChange={setInterest} label={ru?'Насколько интересным был сайт в целом?':'Kui huvitav oli veebileht tervikuna?'} low={ru?'совсем неинтересно':'üldse mitte huvitav'} high={ru?'очень интересно':'väga huvitav'}/>
      <Scale name="navigation" value={navigation} onChange={setNavigation} label={ru?'Насколько легко было ориентироваться на сайте?':'Kui lihtne oli veebilehel liikuda?'} low={ru?'очень сложно':'väga keeruline'} high={ru?'очень легко':'väga lihtne'}/>
      <Scale name="visuals" value={visuals} onChange={setVisuals} label={ru?'Насколько тебе понравилось визуальное оформление?':'Kui hästi meeldis sulle visuaalne kujundus?'} low={ru?'совсем не понравилось':'ei meeldinud üldse'} high={ru?'очень понравилось':'meeldis väga'}/>
      <label>{ru?'Какой темп материала показался тебе наиболее точным описанием?':'Kuidas kirjeldaksid materjali tempot?'}<select required value={pace} onChange={e=>setPace(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option><option value="too_short">{ru?'Слишком коротко':'Liiga lühike'}</option><option value="balanced">{ru?'В самый раз':'Paras'}</option><option value="too_long">{ru?'Слишком длинно':'Liiga pikk'}</option></select></label>
    </div>

    <div className="survey-block"><h3>{ru?'3. Упражнения и игры':'3. Harjutused ja mängud'}</h3>
      <Scale name="memoryDifficulty" value={memoryDifficulty} onChange={setMemoryDifficulty} label={ru?'Насколько сложным было упражнение на память?':'Kui keeruline oli mäluharjutus?'} low={ru?'очень легко':'väga lihtne'} high={ru?'очень сложно':'väga keeruline'}/>
      <Scale name="attentionDifficulty" value={attentionDifficulty} onChange={setAttentionDifficulty} label={ru?'Насколько сложным было упражнение на внимание?':'Kui keeruline oli tähelepanuharjutus?'} low={ru?'очень легко':'väga lihtne'} high={ru?'очень сложно':'väga keeruline'}/>
      <Scale name="gamesUseful" value={gamesUseful} onChange={setGamesUseful} label={ru?'Насколько игровые задания помогли понять тему?':'Kui palju aitasid mängulised ülesanded teemat mõista?'} low={ru?'совсем не помогли':'ei aidanud üldse'} high={ru?'очень помогли':'aitasid väga palju'}/>
    </div>

    <div className="survey-block"><h3>{ru?'4. Что сработало лучше всего':'4. Mis töötas kõige paremini'}</h3>
      <label>{ru?'Какой раздел оказался самым полезным?':'Milline osa oli kõige kasulikum?'}<select required value={useful} onChange={e=>setUseful(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option>{sectionOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <label>{ru?'Какой раздел был наименее понятным?':'Milline osa jäi kõige ebaselgemaks?'}<select required value={leastClear} onChange={e=>setLeastClear(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option><option value="none">{ru?'Всё было понятно':'Kõik oli arusaadav'}</option>{sectionOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      <fieldset><legend>{ru?'Узнал(а) ли ты что-то новое?':'Kas said midagi uut teada?'}</legend><div className="survey-inline"><label><input required type="radio" name="learned" value="yes" checked={learned==='yes'} onChange={e=>setLearned(e.target.value)}/>{ru?' Да':' Jah'}</label><label><input type="radio" name="learned" value="partly" checked={learned==='partly'} onChange={e=>setLearned(e.target.value)}/>{ru?' Частично':' Osaliselt'}</label><label><input type="radio" name="learned" value="no" checked={learned==='no'} onChange={e=>setLearned(e.target.value)}/>{ru?' Нет':' Ei'}</label></div></fieldset>
      <fieldset><legend>{ru?'Посоветовал(а) бы ты этот материал однокласснику?':'Kas soovitaksid seda õppematerjali klassikaaslasele?'}</legend><div className="survey-inline"><label><input required type="radio" name="recommend" value="yes" checked={recommend==='yes'} onChange={e=>setRecommend(e.target.value)}/>{ru?' Да':' Jah'}</label><label><input type="radio" name="recommend" value="maybe" checked={recommend==='maybe'} onChange={e=>setRecommend(e.target.value)}/>{ru?' Возможно':' Võib-olla'}</label><label><input type="radio" name="recommend" value="no" checked={recommend==='no'} onChange={e=>setRecommend(e.target.value)}/>{ru?' Нет':' Ei'}</label></div></fieldset>
    </div>

    <label>{ru?'Что стоит улучшить или добавить? (необязательно)':'Mida võiks parandada või lisada? (valikuline)'}<textarea maxLength={1000} rows={5} value={comment} onChange={e=>setComment(e.target.value)} placeholder={ru?'Не указывай имя, контакты, сведения о здоровье или другие личные данные.':'Ära lisa nime, kontaktandmeid, terviseandmeid ega muid isikuandmeid.'}/></label>
    <label className="check-label"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/>{ru?' Я согласен(-на) отправить эти анонимные ответы автору проекта для анализа общей статистики.':' Nõustun saatma need anonüümsed vastused projekti autorile üldise statistika analüüsimiseks.'}</label>
    <button className="button primary" disabled={status==='sending'}>{status==='sending'?(ru?'Отправка…':'Saadan…'):(ru?'Отправить ответы':'Saada vastused')}</button>
    {status==='sent'&&<p className="survey-status success" role="status">{ru?'Спасибо. Ответы отправлены.':'Aitäh. Vastused on saadetud.'}</p>}
    {status==='error'&&<p className="survey-status error" role="status">{ru?'Не удалось отправить ответы. Попробуй позже.':'Vastuste saatmine ebaõnnestus. Proovi hiljem uuesti.'}</p>}
  </form>;
}
