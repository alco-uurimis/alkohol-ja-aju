import { useEffect, useMemo, useState } from 'react';
import { Section, SourceReference } from '../components/Shared';
import { readGameMetrics, type GameMetrics } from '../utils/gameMetrics';

type Lang='et'|'ru';
type Depth='quick'|'deeper'|'science';
type RegionId='prefrontal'|'hippocampus'|'reward'|'cerebellum'|'brainstem';

const regionOrder:RegionId[]=['prefrontal','hippocampus','reward','cerebellum','brainstem'];

const glossary=[
  {term:'GABA',et:'Peamine pidurdav virgatsaine ajus. Alkohol võib võimendada GABA-A retseptoritega seotud pidurdavat signaali.',ru:'Главный тормозный медиатор мозга. Алкоголь может усиливать тормозные сигналы, связанные с GABA-A-рецепторами.',refs:[6,9]},
  {term:'Glutamaat',ruTerm:'Глутамат',et:'Oluline ergastav virgatsaine. Alkohol võib vähendada NMDA-tüüpi glutamaadiretseptorite aktiivsust.',ru:'Важный возбуждающий медиатор. Алкоголь может снижать активность NMDA-рецепторов глутамата.',refs:[6,9]},
  {term:'Dopamiin',ruTerm:'Дофамин',et:'Tasustamise, õppimise ja motivatsiooniga seotud signaalmolekul. Alkohol võib muuta tasuradade dopamiinisignaali.',ru:'Сигнальная молекула, связанная с вознаграждением, обучением и мотивацией. Алкоголь может менять дофаминовую передачу в системе вознаграждения.',refs:[6]},
  {term:'Hipokampus',ruTerm:'Гиппокамп',et:'Ajustruktuur, mis osaleb uute episoodiliste mälestuste kujunemises.',ru:'Структура мозга, участвующая в формировании новых эпизодических воспоминаний.',refs:[2]},
  {term:'Prefrontaalne ajukoor',ruTerm:'Префронтальная кора',et:'Ajukoore osa, mis osaleb planeerimises, otsustamises ja impulsside kontrollis.',ru:'Область коры, участвующая в планировании, принятии решений и контроле импульсов.',refs:[1,10]},
  {term:'Mälulünk',ruTerm:'Провал памяти',et:'Periood, mille sündmusi hiljem ei mäletata, kuigi inimene võis sel ajal olla ärkvel ja tegutseda.',ru:'Период, события которого позже не вспоминаются, хотя человек мог оставаться в сознании и действовать.',refs:[2]},
  {term:'Tolerants',ruTerm:'Толерантность',et:'Kohanemine, mille korral sama subjektiivse toime saavutamiseks võib vaja minna suuremat kogust alkoholi.',ru:'Адаптация, при которой для того же субъективного эффекта может потребоваться больше алкоголя.',refs:[6,7]},
  {term:'Alkoholi tarvitamise häire',ruTerm:'Расстройство, связанное с употреблением алкоголя',et:'Kliiniline häire, mida hinnatakse sümptomite ja funktsioneerimise järgi; seda ei diagnoosita veebimängu põhjal.',ru:'Клиническое расстройство, которое оценивают по симптомам и нарушениям функционирования; его нельзя диагностировать по веб-игре.',refs:[7]},
  {term:'Täidesaatvad funktsioonid',ruTerm:'Исполнительные функции',et:'Planeerimise, tähelepanu juhtimise, töömälu ja impulsside kontrolliga seotud vaimsed protsessid.',ru:'Когнитивные процессы, связанные с планированием, управлением вниманием, рабочей памятью и контролем импульсов.',refs:[10]},
  {term:'Korrelatsioon',ruTerm:'Корреляция',et:'Statistiline seos kahe nähtuse vahel. Korrelatsioon üksi ei tõesta, et üks nähtus põhjustab teist.',ru:'Статистическая связь между явлениями. Сама по себе корреляция не доказывает, что одно явление вызывает другое.',refs:[10]},
];

const brainRegions={
  prefrontal:{
    et:{name:'Prefrontaalne ajukoor',role:'Planeerimine, otsustamine ja impulsside kontroll.',effect:'Alkohol võib ajutiselt halvendada otsustusvõimet ja enesekontrolli. Noorukieas arenevad need võrgustikud veel edasi.',refs:[1,10]},
    ru:{name:'Префронтальная кора',role:'Планирование, принятие решений и контроль импульсов.',effect:'Алкоголь может временно ухудшать принятие решений и самоконтроль. В подростковом возрасте эти сети ещё продолжают развиваться.',refs:[1,10]},
  },
  hippocampus:{
    et:{name:'Hipokampus',role:'Uute mälestuste kujunemine ja kinnistamine.',effect:'Suured alkoholikogused võivad häirida uute mälestuste talletamist ning olla seotud mälulünkadega.',refs:[2]},
    ru:{name:'Гиппокамп',role:'Формирование и закрепление новых воспоминаний.',effect:'Большие количества алкоголя могут нарушать запись новых воспоминаний и быть связаны с провалами памяти.',refs:[2]},
  },
  reward:{
    et:{name:'Tasustamissüsteem',role:'Motivatsioon, tasu õppimine ja harjumuste kujunemine.',effect:'Alkohol võib mõjutada dopamiinisignaali ja tugevdada seoseid joogi ning olukordade või vihjete vahel.',refs:[6]},
    ru:{name:'Система вознаграждения',role:'Мотивация, обучение на вознаграждении и формирование привычек.',effect:'Алкоголь может менять дофаминовую передачу и усиливать связь напитка с ситуациями или сигналами окружения.',refs:[6]},
  },
  cerebellum:{
    et:{name:'Väikeaju',role:'Liigutuste koordineerimine, tasakaal ja motoorne õppimine.',effect:'Alkohol võib häirida koordinatsiooni ja täpset liikumist; mõju sõltub muu hulgas annusest.',refs:[9]},
    ru:{name:'Мозжечок',role:'Координация движений, равновесие и моторное обучение.',effect:'Алкоголь может нарушать координацию и точность движений; выраженность зависит в том числе от дозы.',refs:[9]},
  },
  brainstem:{
    et:{name:'Ajutüvi',role:'Elutähtsate automaatsete funktsioonide juhtimine.',effect:'Väga suur alkoholikogus võib pärssida kesknärvisüsteemi ohtlikul määral. Raske mürgistus on erakorraline seisund.',refs:[8]},
    ru:{name:'Ствол мозга',role:'Регуляция жизненно важных автоматических функций.',effect:'Очень большие количества алкоголя могут опасно угнетать центральную нервную систему. Тяжёлое отравление — неотложное состояние.',refs:[8]},
  },
};

function OneMinute({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const facts=ru?[
    ['Алкоголь влияет не на одну область мозга, а на несколько систем передачи сигналов.',[6,9]],
    ['Провал памяти — не то же самое, что потеря сознания.',[2]],
    ['Внимание, реакция и принятие решений могут ухудшаться ещё до того, как человек субъективно считает себя сильно пьяным.',[3,9]],
    ['Более быстрое засыпание после алкоголя не означает более качественный сон.',[5]],
    ['Мозг подростка и молодого взрослого ещё развивается.',[1,10]],
    ['Риски алкоголя касаются не только мозга и печени, но и травм, сердечно-сосудистых заболеваний и некоторых видов рака.',[8]],
    ['Результат одной мини-игры не может показать степень опьянения, зависимость или состояние здоровья.',[6,7]],
  ]:[
    ['Alkohol mõjutab mitut ajusignaali süsteemi, mitte ainult üht ajupiirkonda.',[6,9]],
    ['Mälulünk ei ole sama mis teadvusekaotus.',[2]],
    ['Tähelepanu, reaktsioon ja otsustamine võivad halveneda enne, kui inimene peab end subjektiivselt väga joobnuks.',[3,9]],
    ['Kiirem uinumine alkoholi järel ei tähenda paremat und.',[5]],
    ['Nooruki ja noore täiskasvanu aju areneb veel edasi.',[1,10]],
    ['Alkoholi riskid ei piirdu aju ja maksaga, vaid hõlmavad ka vigastusi, südame-veresoonkonna haigusi ja mitut vähivormi.',[8]],
    ['Ühe minimängu tulemus ei näita joobe taset, sõltuvust ega terviseseisundit.',[6,7]],
  ];
  return <div className="minute-card"><div className="minute-head"><span>60 s</span><div><h3>{ru?'Тема за одну минуту':'Teema ühe minutiga'}</h3><p>{ru?'Семь фактов, которые стоит вынести с сайта.':'Seitse mõtet, mida tasub lehelt kaasa võtta.'}</p></div></div><ol>{facts.map(([text,refs],i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{text as string} <SourceReference ids={refs as number[]} lang={lang}/></p></li>)}</ol></div>;
}

function DepthExplainer({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [depth,setDepth]=useState<Depth>('quick');
  const content={
    quick:ru?'Алкоголь замедляет и меняет обмен сигналами между нервными клетками. Поэтому могут страдать память, внимание, координация и решения.':'Alkohol muudab ja aeglustab närvirakkude vahelist signaalivahetust. Seetõttu võivad kannatada mälu, tähelepanu, koordinatsioon ja otsustamine.',
    deeper:ru?'В общих чертах алкоголь усиливает тормозные эффекты GABA-системы и ослабляет возбуждающую передачу через глутамат/NMDA. Одновременно он влияет на систему вознаграждения и дофамин. Эти эффекты зависят от дозы и контекста.':'Üldpildis võimendab alkohol GABA-süsteemi pidurdavat mõju ja vähendab glutamaadi/NMDA kaudu toimuvat ergastavat ülekannet. Samal ajal mõjutab see tasustamissüsteemi ja dopamiini. Mõju sõltub annusest ja olukorrast.',
    science:ru?'Этанол действует на несколько молекулярных мишеней, а не на один «рецептор алкоголя». Среди наиболее изученных — GABA-A-рецепторы, NMDA-рецепторы и цепи вознаграждения. Поведенческий эффект является суммой изменений во многих сетях, поэтому простая схема не описывает индивидуальную реакцию полностью.':'Etanool toimib mitmele molekulaarsele sihtmärgile, mitte ühele „alkoholiretseptorile“. Enim uuritud on muu hulgas GABA-A- ja NMDA-retseptorid ning tasustamisrajad. Käitumuslik toime tekib paljude võrgustike muutuste summana, seega ei kirjelda lihtne skeem ühe inimese reaktsiooni täielikult.',
  };
  return <article className="depth-card"><div className="depth-top"><div><span className="pill">{ru?'3 УРОВНЯ':'3 TASET'}</span><h3>{ru?'Насколько глубоко объяснять?':'Kui sügavale minna?'}</h3></div><div className="depth-tabs" role="tablist" aria-label={ru?'Уровень объяснения':'Selgituse tase'}>{(['quick','deeper','science'] as Depth[]).map(key=><button key={key} role="tab" aria-selected={depth===key} className={depth===key?'active':''} onClick={()=>setDepth(key)}>{key==='quick'?(ru?'Кратко':'Lühidalt'):key==='deeper'?(ru?'Подробнее':'Põhjalikumalt'):(ru?'Научно':'Teaduslikult')}</button>)}</div></div><div className="depth-body" role="tabpanel"><p>{content[depth]} <SourceReference ids={[6,9]} lang={lang}/></p></div></article>;
}

function BrainMap({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [selected,setSelected]=useState<RegionId>('prefrontal');
  const data=brainRegions[selected][lang];
  return <div className="brain-map-wrap"><div className="brain-map-visual" aria-label={ru?'Интерактивная схема мозга':'Interaktiivne ajuskeem'}><div className="brain-silhouette" aria-hidden="true"><span/><span/><span/></div>{regionOrder.map((id,i)=><button key={id} className={`brain-point point-${id} ${selected===id?'active':''}`} onClick={()=>setSelected(id)} aria-pressed={selected===id}><span>{i+1}</span><b>{brainRegions[id][lang].name}</b></button>)}</div><article className="brain-map-panel" aria-live="polite"><span className="pill">{ru?'ОБЛАСТЬ МОЗГА':'AJUPIIRKOND'}</span><h3>{data.name}</h3><dl><div><dt>{ru?'Что делает':'Mida teeb'}</dt><dd>{data.role}</dd></div><div><dt>{ru?'Связь с алкоголем':'Seos alkoholiga'}</dt><dd>{data.effect} <SourceReference ids={data.refs} lang={lang}/></dd></div></dl><p className="small">{ru?'Схема упрощена: функции мозга распределены по сетям и не ограничиваются одной точкой.':'Skeem on lihtsustatud: ajufunktsioonid jaotuvad võrgustikesse ega piirdu ühe punktiga.'}</p></article></div>;
}

function Glossary({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [query,setQuery]=useState('');
  const filtered=useMemo(()=>glossary.filter(item=>`${item.term} ${item.ruTerm??''} ${ru?item.ru:item.et}`.toLowerCase().includes(query.toLowerCase())),[query,ru]);
  return <div className="glossary"><div className="glossary-tools"><div><span className="pill">{ru?'ГЛОССАРИЙ':'SÕNASTIK'}</span><h3>{ru?'Термины без лишнего жаргона':'Mõisted ilma liigse žargoonita'}</h3></div><label><span className="sr-only">{ru?'Поиск термина':'Otsi mõistet'}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={ru?'Поиск: GABA, память…':'Otsi: GABA, mälu…'}/></label></div><div className="glossary-grid">{filtered.map(item=><details key={item.term}><summary>{ru?(item.ruTerm??item.term):item.term}</summary><p>{ru?item.ru:item.et} <SourceReference ids={item.refs} lang={lang}/></p></details>)}{filtered.length===0&&<p className="empty-state">{ru?'Ничего не найдено. Попробуй другое слово.':'Midagi ei leitud. Proovi teist sõna.'}</p>}</div></div>;
}

function MemoryPath({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const steps=ru?['Сигнал / событие','Кодирование информации','Закрепление воспоминания','Позднее воспроизведение']:['Sündmus / signaal','Info kodeerimine','Mälestuse kinnistumine','Hilisem meenutamine'];
  const [chosen,setChosen]=useState<number[]>([]);
  const [message,setMessage]=useState('');
  const pick=(index:number)=>{
    if(chosen.includes(index))return;
    if(index!==chosen.length){setMessage(ru?'Не совсем: выбери следующий этап по порядку.':'Mitte päris: vali järgmine etapp õiges järjekorras.');return;}
    const next=[...chosen,index];
    setChosen(next);
    if(next.length===steps.length)setMessage(ru?'Готово. Чтобы воспоминание можно было позже вызвать, информация сначала должна быть закодирована и закреплена.':'Valmis. Et mälestust hiljem meenutada, peab info esmalt kodeeruma ja kinnistuma.');else setMessage('');
  };
  const reset=()=>{setChosen([]);setMessage('');};
  return <article className="science-game"><span className="pill">{ru?'МИНИ-ИНТЕРАКТИВ':'MINIINTERAKTIIV'}</span><h3>{ru?'Собери путь воспоминания':'Pane kokku mälestuse teekond'}</h3><p>{ru?'Нажимай этапы в логическом порядке — от события до воспроизведения.':'Vali etapid loogilises järjekorras sündmusest meenutamiseni.'}</p><div className="path-options">{steps.map((step,i)=><button key={step} className={chosen.includes(i)?'used':''} disabled={chosen.includes(i)} onClick={()=>pick(i)}><span>{chosen.indexOf(i)>=0?chosen.indexOf(i)+1:'·'}</span>{step}</button>)}</div>{message&&<p className="science-game-feedback" role="status">{message} <SourceReference ids={[2]} lang={lang}/></p>}<button className="text-button" onClick={reset}>{ru?'Начать заново':'Alusta uuesti'}</button></article>;
}

function NeuroMatch({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const items=ru?[
    {q:'Какой медиатор в этой упрощённой модели связан прежде всего с торможением?',a:'GABA',opts:['GABA','Глутамат','Дофамин']},
    {q:'Какой медиатор связан с возбуждающей NMDA-передачей?',a:'Глутамат',opts:['Дофамин','Глутамат','GABA']},
    {q:'Какой сигнал особенно важен для обучения на вознаграждении?',a:'Дофамин',opts:['Глутамат','GABA','Дофамин']},
  ]:[
    {q:'Milline virgatsaine seostub selles lihtsustatud mudelis eeskätt pidurdusega?',a:'GABA',opts:['GABA','Glutamaat','Dopamiin']},
    {q:'Milline virgatsaine seostub ergastava NMDA-ülekandega?',a:'Glutamaat',opts:['Dopamiin','Glutamaat','GABA']},
    {q:'Milline signaal on eriti oluline tasupõhises õppimises?',a:'Dopamiin',opts:['Glutamaat','GABA','Dopamiin']},
  ];
  const [index,setIndex]=useState(0);const [score,setScore]=useState(0);const [done,setDone]=useState(false);const [picked,setPicked]=useState<string|null>(null);
  const choose=(value:string)=>{if(picked)return;setPicked(value);if(value===items[index].a)setScore(v=>v+1);};
  const next=()=>{if(index===items.length-1){setDone(true);}else{setIndex(v=>v+1);setPicked(null);}};
  const restart=()=>{setIndex(0);setScore(0);setDone(false);setPicked(null);};
  return <article className="science-game"><span className="pill">{ru?'МИНИ-ИНТЕРАКТИВ':'MINIINTERAKTIIV'}</span><h3>{ru?'Сопоставь систему сигналов':'Sobita signaalisüsteem'}</h3>{done?<div className="science-mini-result"><strong>{score} / {items.length}</strong><p>{ru?'Это проверка терминов, а не оценка мозга или здоровья.':'See kontrollib mõisteid, mitte aju ega tervist.'}</p><button className="button" onClick={restart}>{ru?'Ещё раз':'Proovi uuesti'}</button></div>:<><p>{items[index].q}</p><div className="neuro-options">{items[index].opts.map(opt=><button key={opt} disabled={picked!==null} className={picked===opt?(opt===items[index].a?'correct':'incorrect'):''} onClick={()=>choose(opt)}>{opt}</button>)}</div>{picked&&<div className="science-game-feedback" role="status"><strong>{picked===items[index].a?(ru?'Верно.':'Õige.'):(ru?`Правильный ответ: ${items[index].a}.`:`Õige vastus: ${items[index].a}.`)}</strong> <SourceReference ids={[6,9]} lang={lang}/><br/><button className="text-button" onClick={next}>{index===items.length-1?(ru?'Показать результат':'Vaata tulemust'):(ru?'Следующий':'Järgmine')}</button></div>}</>}</article>;
}

function ResearchLimits({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const rows=ru?[
    ['Корреляция ≠ причина','Если два явления связаны, это ещё не доказывает, что одно вызвало другое.'],
    ['Группа ≠ один человек','Среднее значение в исследовании не позволяет точно предсказать реакцию конкретного человека.'],
    ['Доза и контекст важны','Результат зависит от количества алкоголя, скорости употребления, возраста, сна, лекарств и других факторов.'],
    ['Веб-игра ≠ клинический тест','Игры на этом сайте предназначены для обучения и не определяют опьянение, зависимость или пригодность к вождению.'],
  ]:[
    ['Korrelatsioon ≠ põhjus','Kui kaks nähtust esinevad koos, ei tõesta see veel, et üks põhjustas teise.'],
    ['Rühm ≠ üks inimene','Uuringu keskmine tulemus ei ennusta täpselt ühe konkreetse inimese reaktsiooni.'],
    ['Annus ja olukord loevad','Tulemus sõltub kogusest, tarvitamise kiirusest, vanusest, unest, ravimitest ja muudest teguritest.'],
    ['Veebimäng ≠ kliiniline test','Selle lehe mängud on õppimiseks ega määra joovet, sõltuvust või sõidukõlblikkust.'],
  ];
  return <div className="method-card"><div><span className="pill">{ru?'КАК ЧИТАТЬ НАУКУ':'KUIDAS TEADUST LUGEDA'}</span><h3>{ru?'Четыре ограничения, которые важно помнить':'Neli piirangut, mida tasub meeles pidada'}</h3></div><div className="method-grid">{rows.map(([title,text])=><article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div><p className="small">{ru?'Эти принципы особенно важны при интерпретации исследований подростков и долгосрочных последствий.':'Need põhimõtted on eriti olulised noorukite ja pikaajaliste mõjude uuringute tõlgendamisel.'} <SourceReference ids={[10]} lang={lang}/></p></div>;
}

export default function LearningCenter({lang}:{lang:Lang}){
  const ru=lang==='ru';
  return <Section id="teadmised" number={ru?'01A / НАУЧНАЯ БАЗА':'01A / TEADUSLIK ALUS'} title={ru?'Разберись глубже — без стены текста':'Mõista sügavamalt, ilma tekstiseinata'} intro={ru?'Выбери нужную глубину: быстрые факты, интерактивная карта мозга, термины и короткие задания. Научные утверждения связаны с источниками в конце страницы.':'Vali sobiv sügavus: kiired faktid, interaktiivne ajukaart, mõisted ja lühikesed ülesanded. Teadusväited on seotud lehe lõpus olevate allikatega.'} className="learning-section">
    <OneMinute lang={lang}/>
    <DepthExplainer lang={lang}/>
    <div className="learning-subhead"><span className="eyebrow">{ru?'ИНТЕРАКТИВНАЯ КАРТА':'INTERAKTIIVNE KAART'}</span><h3>{ru?'Нажми на область мозга':'Vali ajupiirkond'}</h3><p>{ru?'Это учебная схема, а не анатомический атлас. Она показывает, с какими функциями чаще связывают разные области.':'See on õppemudel, mitte anatoomiline atlas. See näitab, milliste funktsioonidega eri piirkondi sageli seostatakse.'}</p></div>
    <BrainMap lang={lang}/>
    <Glossary lang={lang}/>
    <div className="science-games-grid"><MemoryPath lang={lang}/><NeuroMatch lang={lang}/></div>
    <ResearchLimits lang={lang}/>
  </Section>;
}

export function FinalSummary({lang,quizScore,visited,totalSections}:{lang:Lang;quizScore:number|null;visited:number;totalSections:number}){
  const ru=lang==='ru';
  const [metrics,setMetrics]=useState<GameMetrics>(()=>readGameMetrics());
  useEffect(()=>{const sync=()=>setMetrics(readGameMetrics());window.addEventListener('alkohol-game-metrics',sync);window.addEventListener('focus',sync);return()=>{window.removeEventListener('alkohol-game-metrics',sync);window.removeEventListener('focus',sync);};},[]);
  const games=[metrics.reaction,metrics.stroop,metrics.signal].filter(Boolean).length;
  return <Section id="isiklik-kokkuvote" number={ru?'05A / ТВОЙ ИТОГ':'05A / SINU KOKKUVÕTE'} title={ru?'Что ты уже прошёл(а)':'Mida oled juba teinud'} intro={ru?'Итог существует только в этой вкладке и не является медицинской оценкой.':'Kokkuvõte eksisteerib ainult selles vahelehes ega ole tervisehinnang.'} className="personal-summary">
    <div className="summary-stats"><article><span>{ru?'Разделы':'Osad'}</span><strong>{visited} / {totalSections}</strong><p>{ru?'Открыто в этой сессии':'Avatud selles seansis'}</p></article><article><span>{ru?'Мини-игры':'Minimängud'}</span><strong>{games} / 3</strong><p>{ru?'Есть сохранённый результат':'Tulemus on salvestatud'}</p></article><article><span>{ru?'Викторина':'Viktoriin'}</span><strong>{quizScore===null?'—':`${quizScore} / 10`}</strong><p>{quizScore===null?(ru?'Ещё не завершена':'Veel lõpetamata'):(ru?'Последняя попытка':'Viimane katse')}</p></article></div>
    <div className="summary-detail"><div><h3>{ru?'Результаты игр':'Mängude tulemused'}</h3>{games===0?<p>{ru?'Пока нет результатов. Сыграй хотя бы в одну игру в лаборатории.':'Tulemusi veel pole. Proovi vähemalt üht mängu mängulaboris.'}</p>:<ul>{metrics.reaction&&<li>{ru?'Реакция':'Reaktsioon'}: <strong>{metrics.reaction.latestMs} ms</strong> · {ru?'лучшее':'parim'} {metrics.reaction.bestMs} ms</li>}{metrics.stroop&&<li>Stroop: <strong>{metrics.stroop.score}/{metrics.stroop.rounds}</strong> · {ru?'среднее':'keskmine'} {metrics.stroop.averageMs} ms</li>}{metrics.signal&&<li>{ru?'Цепочка':'Signaalirada'}: <strong>{ru?'уровень':'tase'} {metrics.signal.reachedLength}</strong> · {metrics.signal.completed?(ru?'завершено':'läbitud'):(ru?'не завершено':'pooleli')}</li>}</ul>}</div><div className="summary-next"><h3>{ru?'Что дальше?':'Mis edasi?'}</h3><p>{quizScore===null?(ru?'Пройди «Миф или факт», затем вернись сюда — итог обновится автоматически.':'Tee „Müüt või fakt“ läbi ja tule siia tagasi — kokkuvõte uueneb automaatselt.'):(ru?'Просмотри объяснения к ошибкам и источники. Если хочешь, затем заполни анонимный опрос.':'Vaata üle vigade selgitused ja allikad. Soovi korral täida seejärel anonüümne küsitlus.')}</p><a className="button" href={quizScore===null?'#viktoriin':'#tagasiside'}>{quizScore===null?(ru?'К викторине':'Viktoriini juurde'):(ru?'К опросу':'Küsitluse juurde')}</a></div></div>
  </Section>;
}
