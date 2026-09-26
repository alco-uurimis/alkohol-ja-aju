import { useState } from 'react';
import type { FormEvent } from 'react';
import { clearGameMetrics, readGameMetrics } from '../utils/gameMetrics';
import type { GameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';
type Status='idle'|'sending'|'sent'|'error';

const endpoint='https://alkohol-ja-aju.vercel.app/api/feedback';
const scaleValues=['1','2','3','4','5'];
const legacySections=new Set(['brain','memory','attention','quiz']);

function Scale({name,value,onChange,label,low,high}:{name:string;value:string;onChange:(value:string)=>void;label:string;low:string;high:string}){
  return <fieldset className="survey-question survey-scale-question">
    <legend>{label}</legend>
    <div className="survey-scale" role="radiogroup" aria-label={label}>
      {scaleValues.map(v=><label key={v} className={value===v?'selected':''}><input required type="radio" name={name} value={v} checked={value===v} onChange={e=>onChange(e.target.value)}/><span>{v}</span></label>)}
    </div>
    <div className="survey-scale-labels" aria-hidden="true"><span>1 — {low}</span><span>5 — {high}</span></div>
  </fieldset>;
}

function gameMetricsCompact(metrics:GameMetrics){
  const parts:string[]=[];
  if(metrics.reaction)parts.push(`reaction_latest=${metrics.reaction.latestMs}ms`,`reaction_best=${metrics.reaction.bestMs}ms`,`reaction_attempts=${metrics.reaction.attempts}`);
  if(metrics.stroop)parts.push(`stroop=${metrics.stroop.score}/${metrics.stroop.rounds}`,`stroop_avg=${metrics.stroop.averageMs}ms`,`stroop_total=${metrics.stroop.totalMs}ms`,`stroop_attempts=${metrics.stroop.attempts}`);
  if(metrics.signal)parts.push(`signal_level=${metrics.signal.reachedLength}`,`signal_done=${metrics.signal.completed?'yes':'no'}`,`signal_time=${metrics.signal.durationMs}ms`,`signal_attempts=${metrics.signal.attempts}`);
  return parts.join('; ');
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
  const [status,setStatus]=useState<Status>('idle');
  const [errorDetail,setErrorDetail]=useState('');

  const reset=()=>{
    setKnowledgeBefore('');setKnowledgeAfter('');setClarity('');setInterest('');setNavigation('');setVisuals('');
    setMemoryDifficulty('');setAttentionDifficulty('');setGamesUseful('');setConfidence('');setUseful('');setLeastClear('');
    setPace('');setLearned('');setRecommend('');setComment('');setConsent(false);
  };

  const buildStructuredComment=(metrics:GameMetrics)=>{
    const compact=[
      `kb=${knowledgeBefore}`,`ka=${knowledgeAfter}`,`cl=${clarity}`,`in=${interest}`,`nav=${navigation}`,`vis=${visuals}`,
      `mem=${memoryDifficulty}`,`att=${attentionDifficulty}`,`games=${gamesUseful}`,`conf=${confidence}`,
      `use=${useful}`,`unclear=${leastClear}`,`pace=${pace}`,`learned=${learned}`,`rec=${recommend}`,
    ].join('; ');
    const games=gameMetricsCompact(metrics);
    const cleanComment=comment.trim().replace(/\s+/g,' ');
    return [compact,games,cleanComment].filter(Boolean).join('\n').slice(0,1000);
  };

  async function post(body:unknown){
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),12000);
    try{
      return await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
    }finally{
      window.clearTimeout(timeout);
    }
  }

  async function submit(e:FormEvent){
    e.preventDefault();
    if(!consent||status==='sending')return;
    setStatus('sending');
    setErrorDetail('');

    const gameMetrics=readGameMetrics();
    const structuredComment=buildStructuredComment(gameMetrics);
    const modernPayload={
      knowledgeBefore,knowledgeAfter,clarity,interest,navigation,visuals,memoryDifficulty,attentionDifficulty,gamesUseful,confidence,
      useful,leastClear,pace,learned,recommend,comment:structuredComment,language:lang,gameMetrics,
    };

    try{
      let res=await post(modernPayload);

      // Backward-compatible retry for an older Vercel API. Game metrics are also embedded
      // in the structured comment, so they still reach Telegram on the legacy schema.
      if(!res.ok && [400,404,405,422].includes(res.status)){
        const legacyUseful=legacySections.has(useful)?useful:'quiz';
        const legacyRecommend=recommend==='no'?'no':'yes';
        res=await post({clarity,useful:legacyUseful,recommend:legacyRecommend,comment:structuredComment,language:lang});
      }

      if(!res.ok){
        let detail='';
        try{const data=await res.json() as {error?:string};detail=data.error??'';}catch{/* no-op */}
        throw new Error(detail||`HTTP ${res.status}`);
      }

      setStatus('sent');
      clearGameMetrics();
      reset();
    }catch(error){
      setStatus('error');
      setErrorDetail(error instanceof Error?error.message:'unknown_error');
    }
  }

  const sectionOptions=[
    ['brain',ru?'Мозг и алкоголь':'Aju ja alkohol'],
    ['memory',ru?'Упражнение на память':'Mäluharjutus'],
    ['attention',ru?'Упражнение на внимание':'Tähelepanuharjutus'],
    ['lab',ru?'Игровая лаборатория':'Mängulabor'],
    ['quiz',ru?'Миф или факт':'Müüt või fakt'],
    ['sources',ru?'Источники и выводы':'Allikad ja kokkuvõte'],
  ];

  return <form className="feedback-form" onSubmit={submit} noValidate={false}>
    <div className="survey-intro-card">
      <span className="pill">{ru?'АНОНИМНО':'ANONÜÜMNE'}</span>
      <div><strong>{ru?'15 вопросов · около 3–4 минут':'15 küsimust · umbes 3–4 minutit'}</strong><p>{ru?'Ответы нужны для общей статистики проекта. Если ты проходил(а) мини-игры в этой вкладке, вместе с опросом будут отправлены их результаты: время и баллы. Имя и контакты не запрашиваются.':'Vastuseid kasutatakse projekti üldstatistikaks. Kui tegid selles vahelehes minimänge, saadetakse koos küsitlusega ka nende tulemused: aeg ja punktid. Nime ega kontaktandmeid ei küsita.'}</p></div>
    </div>

    <div className="survey-block"><div className="survey-block-head"><span>01</span><h3>{ru?'Знания и понимание':'Teadmised ja arusaamine'}</h3></div>
      <Scale name="knowledgeBefore" value={knowledgeBefore} onChange={setKnowledgeBefore} label={ru?'Как ты оцениваешь свои знания об алкоголе и работе мозга до просмотра материала?':'Kuidas hindad oma teadmisi alkoholi ja aju toimimise kohta enne materjali läbimist?'} low={ru?'почти ничего не знал(а)':'teadsin väga vähe'} high={ru?'знал(а) много':'teadsin palju'}/>
      <Scale name="knowledgeAfter" value={knowledgeAfter} onChange={setKnowledgeAfter} label={ru?'Как ты оцениваешь свои знания после просмотра материала?':'Kuidas hindad oma teadmisi pärast materjali läbimist?'} low={ru?'знаю очень мало':'tean väga vähe'} high={ru?'знаю намного больше':'tean palju rohkem'}/>
      <Scale name="clarity" value={clarity} onChange={setClarity} label={ru?'Насколько понятным был материал?':'Kui arusaadav oli õppematerjal?'} low={ru?'совсем непонятно':'üldse mitte arusaadav'} high={ru?'очень понятно':'väga arusaadav'}/>
      <Scale name="confidence" value={confidence} onChange={setConfidence} label={ru?'Насколько уверенно ты теперь отличаешь мифы об алкоголе от фактов?':'Kui kindlalt oskad nüüd alkoholi kohta käivaid müüte faktidest eristada?'} low={ru?'совсем не уверен(а)':'üldse mitte kindlalt'} high={ru?'очень уверен(а)':'väga kindlalt'}/>
    </div>

    <div className="survey-block"><div className="survey-block-head"><span>02</span><h3>{ru?'Интерес и удобство':'Huvi ja kasutusmugavus'}</h3></div>
      <Scale name="interest" value={interest} onChange={setInterest} label={ru?'Насколько интересным был сайт в целом?':'Kui huvitav oli veebileht tervikuna?'} low={ru?'совсем неинтересно':'üldse mitte huvitav'} high={ru?'очень интересно':'väga huvitav'}/>
      <Scale name="navigation" value={navigation} onChange={setNavigation} label={ru?'Насколько легко было ориентироваться на сайте?':'Kui lihtne oli veebilehel liikuda?'} low={ru?'очень сложно':'väga keeruline'} high={ru?'очень легко':'väga lihtne'}/>
      <Scale name="visuals" value={visuals} onChange={setVisuals} label={ru?'Насколько тебе понравилось визуальное оформление?':'Kui hästi meeldis sulle visuaalne kujundus?'} low={ru?'совсем не понравилось':'ei meeldinud üldse'} high={ru?'очень понравилось':'meeldis väga'}/>
      <label className="survey-question survey-select">{ru?'Как бы ты описал(а) темп материала?':'Kuidas kirjeldaksid materjali tempot?'}<select required value={pace} onChange={e=>setPace(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option><option value="too_short">{ru?'Слишком коротко':'Liiga lühike'}</option><option value="balanced">{ru?'В самый раз':'Paras'}</option><option value="too_long">{ru?'Слишком длинно':'Liiga pikk'}</option></select></label>
    </div>

    <div className="survey-block"><div className="survey-block-head"><span>03</span><h3>{ru?'Упражнения и игры':'Harjutused ja mängud'}</h3></div>
      <Scale name="memoryDifficulty" value={memoryDifficulty} onChange={setMemoryDifficulty} label={ru?'Насколько сложным было упражнение на память?':'Kui keeruline oli mäluharjutus?'} low={ru?'очень легко':'väga lihtne'} high={ru?'очень сложно':'väga keeruline'}/>
      <Scale name="attentionDifficulty" value={attentionDifficulty} onChange={setAttentionDifficulty} label={ru?'Насколько сложным было упражнение на внимание?':'Kui keeruline oli tähelepanuharjutus?'} low={ru?'очень легко':'väga lihtne'} high={ru?'очень сложно':'väga keeruline'}/>
      <Scale name="gamesUseful" value={gamesUseful} onChange={setGamesUseful} label={ru?'Насколько игровые задания помогли понять тему?':'Kui palju aitasid mängulised ülesanded teemat mõista?'} low={ru?'совсем не помогли':'ei aidanud üldse'} high={ru?'очень помогли':'aitasid väga palju'}/>
    </div>

    <div className="survey-block"><div className="survey-block-head"><span>04</span><h3>{ru?'Что сработало лучше всего':'Mis töötas kõige paremini'}</h3></div>
      <div className="survey-two-col">
        <label className="survey-question survey-select">{ru?'Какой раздел оказался самым полезным?':'Milline osa oli kõige kasulikum?'}<select required value={useful} onChange={e=>setUseful(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option>{sectionOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label className="survey-question survey-select">{ru?'Какой раздел был наименее понятным?':'Milline osa jäi kõige ebaselgemaks?'}<select required value={leastClear} onChange={e=>setLeastClear(e.target.value)}><option value="">{ru?'Выбери вариант':'Vali vastus'}</option><option value="none">{ru?'Всё было понятно':'Kõik oli arusaadav'}</option>{sectionOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <fieldset className="survey-question"><legend>{ru?'Узнал(а) ли ты что-то новое?':'Kas said midagi uut teada?'}</legend><div className="survey-inline"><label><input required type="radio" name="learned" value="yes" checked={learned==='yes'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Да':'Jah'}</span></label><label><input type="radio" name="learned" value="partly" checked={learned==='partly'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Частично':'Osaliselt'}</span></label><label><input type="radio" name="learned" value="no" checked={learned==='no'} onChange={e=>setLearned(e.target.value)}/><span>{ru?'Нет':'Ei'}</span></label></div></fieldset>
      <fieldset className="survey-question"><legend>{ru?'Посоветовал(а) бы ты этот материал однокласснику?':'Kas soovitaksid seda õppematerjali klassikaaslasele?'}</legend><div className="survey-inline"><label><input required type="radio" name="recommend" value="yes" checked={recommend==='yes'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Да':'Jah'}</span></label><label><input type="radio" name="recommend" value="maybe" checked={recommend==='maybe'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Возможно':'Võib-olla'}</span></label><label><input type="radio" name="recommend" value="no" checked={recommend==='no'} onChange={e=>setRecommend(e.target.value)}/><span>{ru?'Нет':'Ei'}</span></label></div></fieldset>
    </div>

    <div className="survey-finish">
      <label className="survey-question survey-comment">{ru?'Что стоит улучшить или добавить? (необязательно)':'Mida võiks parandada või lisada? (valikuline)'}<textarea maxLength={1000} rows={5} value={comment} onChange={e=>setComment(e.target.value)} placeholder={ru?'Не указывай имя, контакты, сведения о здоровье или другие личные данные.':'Ära lisa nime, kontaktandmeid, terviseandmeid ega muid isikuandmeid.'}/><span className="survey-counter">{comment.length}/1000</span></label>
      <label className="check-label survey-consent"><input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{ru?'Я согласен(-на) отправить анонимные ответы и, если они есть, результаты мини-игр (время и баллы) автору проекта для общей статистики.':'Nõustun saatma projekti autorile üldstatistika jaoks anonüümsed vastused ja olemasolu korral minimängude tulemused (aja ja punktid).'}</span></label>
      <button className="button primary survey-submit" disabled={status==='sending'} type="submit">{status==='sending'?(ru?'Отправка…':'Saadan…'):(ru?'Отправить ответы':'Saada vastused')}</button>
      {status==='sent'&&<p className="survey-status success" role="status">{ru?'Спасибо. Ответы и результаты игр успешно отправлены.':'Aitäh. Vastused ja mängutulemused on edukalt saadetud.'}</p>}
      {status==='error'&&<div className="survey-status error" role="alert"><strong>{ru?'Не удалось отправить ответы.':'Vastuste saatmine ebaõnnestus.'}</strong><span>{ru?'Проверь соединение и попробуй ещё раз.':'Kontrolli ühendust ja proovi uuesti.'}{errorDetail?` (${errorDetail})`:''}</span></div>}
    </div>
  </form>;
}
