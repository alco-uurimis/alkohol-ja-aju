import BrainDiagram from '../components/BrainDiagram';
import { useEffect, useMemo, useState } from 'react';
import { ProgressBar, Section, SourceReference } from '../components/Shared';
import { readGameMetrics, type GameMetrics } from '../utils/gameMetrics';
import { T } from '../data/siteT';

type Lang='et'|'ru'|'en';
type Depth='quick'|'deeper'|'science';
type RegionId='prefrontal'|'hippocampus'|'reward'|'cerebellum'|'brainstem';

const regionOrder:RegionId[]=['prefrontal','hippocampus','reward','cerebellum','brainstem'];

const glossary=[
  {term:'GABA',enTerm:'GABA',en:'The main inhibitory neurotransmitter in the brain. Alcohol can strengthen the inhibitory signal linked with GABA-A receptors.',et:'Peamine pidurdav virgatsaine ajus. Alkohol võib võimendada GABA-A retseptoritega seotud pidurdavat signaali.',ru:'Главный тормозный медиатор мозга. Алкоголь может усиливать тормозные сигналы, связанные с GABA-A-рецепторами.',refs:[6,9]},
  {term:'Glutamaat',enTerm:'Glutamate',en:'An important excitatory neurotransmitter. Alcohol can reduce the activity of NMDA-type glutamate receptors.',ruTerm:'Глутамат',et:'Oluline ergastav virgatsaine. Alkohol võib vähendada NMDA-tüüpi glutamaadiretseptorite aktiivsust.',ru:'Важный возбуждающий медиатор. Алкоголь может снижать активность NMDA-рецепторов глутамата.',refs:[6,9]},
  {term:'Dopamiin',enTerm:'Dopamine',en:'A signalling molecule linked with reward, learning and motivation. Alcohol can change dopamine signalling in the reward pathways.',ruTerm:'Дофамин',et:'Tasustamise, õppimise ja motivatsiooniga seotud signaalmolekul. Alkohol võib muuta tasuradade dopamiinisignaali.',ru:'Сигнальная молекула, связанная с вознаграждением, обучением и мотивацией. Алкоголь может менять дофаминовую передачу в системе вознаграждения.',refs:[6]},
  {term:'Hipokampus',enTerm:'Hippocampus',en:'A brain structure involved in forming new episodic memories.',ruTerm:'Гиппокамп',et:'Ajustruktuur, mis osaleb uute episoodiliste mälestuste kujunemises.',ru:'Структура мозга, участвующая в формировании новых эпизодических воспоминаний.',refs:[2]},
  {term:'Prefrontaalne ajukoor',enTerm:'Prefrontal cortex',en:'The part of the cortex involved in planning, decision-making and impulse control.',ruTerm:'Префронтальная кора',et:'Ajukoore osa, mis osaleb planeerimises, otsustamises ja impulsside kontrollis.',ru:'Область коры, участвующая в планировании, принятии решений и контроле импульсов.',refs:[1,10]},
  {term:'Mälulünk',enTerm:'Memory blackout',en:'A period whose events are not remembered later, although the person may have been awake and acting at the time.',ruTerm:'Провал памяти',et:'Periood, mille sündmusi hiljem ei mäletata, kuigi inimene võis sel ajal olla ärkvel ja tegutseda.',ru:'Период, события которого позже не вспоминаются, хотя человек мог оставаться в сознании и действовать.',refs:[2]},
  {term:'Tolerants',enTerm:'Tolerance',en:'An adaptation in which more alcohol may be needed to reach the same subjective effect.',ruTerm:'Толерантность',et:'Kohanemine, mille korral sama subjektiivse toime saavutamiseks võib vaja minna suuremat kogust alkoholi.',ru:'Адаптация, при которой для того же субъективного эффекта может потребоваться больше алкоголя.',refs:[6,7]},
  {term:'Alkoholi tarvitamise häire',enTerm:'Alcohol use disorder',en:'A clinical disorder assessed by symptoms and functioning; it is not diagnosed from a web game.',ruTerm:'Расстройство, связанное с употреблением алкоголя',et:'Kliiniline häire, mida hinnatakse sümptomite ja funktsioneerimise järgi; seda ei diagnoosita veebimängu põhjal.',ru:'Клиническое расстройство, которое оценивают по симптомам и нарушениям функционирования; его нельзя диагностировать по веб-игре.',refs:[7]},
  {term:'Täidesaatvad funktsioonid',enTerm:'Executive functions',en:'Mental processes linked with planning, directing attention, working memory and impulse control.',ruTerm:'Исполнительные функции',et:'Planeerimise, tähelepanu juhtimise, töömälu ja impulsside kontrolliga seotud vaimsed protsessid.',ru:'Когнитивные процессы, связанные с планированием, управлением вниманием, рабочей памятью и контролем импульсов.',refs:[10]},
  {term:'Korrelatsioon',enTerm:'Correlation',en:'A statistical association between two phenomena. Correlation alone does not prove that one phenomenon causes the other.',ruTerm:'Корреляция',et:'Statistiline seos kahe nähtuse vahel. Korrelatsioon üksi ei tõesta, et üks nähtus põhjustab teist.',ru:'Статистическая связь между явлениями. Сама по себе корреляция не доказывает, что одно явление вызывает другое.',refs:[10]},
];

const brainRegions={
  prefrontal:{
    et:{name:'Prefrontaalne ajukoor',role:'Planeerimine, otsustamine ja impulsside kontroll.',effect:'Alkohol võib ajutiselt halvendada otsustusvõimet ja enesekontrolli. Noorukieas arenevad need võrgustikud veel edasi.',refs:[1,10]},
    ru:{name:'Префронтальная кора',role:'Планирование, принятие решений и контроль импульсов.',effect:'Алкоголь может временно ухудшать принятие решений и самоконтроль. В подростковом возрасте эти сети ещё продолжают развиваться.',refs:[1,10]},
    en:{name:'Prefrontal cortex',role:'Planning, decision-making and impulse control.',effect:'Alcohol can temporarily worsen judgement and self-control. In adolescence these networks are still developing.',refs:[1,10]},
  },
  hippocampus:{
    et:{name:'Hipokampus',role:'Uute mälestuste kujunemine ja kinnistamine.',effect:'Suured alkoholikogused võivad häirida uute mälestuste talletamist ning olla seotud mälulünkadega.',refs:[2]},
    ru:{name:'Гиппокамп',role:'Формирование и закрепление новых воспоминаний.',effect:'Большие количества алкоголя могут нарушать запись новых воспоминаний и быть связаны с провалами памяти.',refs:[2]},
    en:{name:'Hippocampus',role:'Forming and consolidating new memories.',effect:'Large amounts of alcohol can disrupt the storing of new memories and be linked with memory blackouts.',refs:[2]},
  },
  reward:{
    et:{name:'Tasustamissüsteem',role:'Motivatsioon, tasu õppimine ja harjumuste kujunemine.',effect:'Alkohol võib mõjutada dopamiinisignaali ja tugevdada seoseid joogi ning olukordade või vihjete vahel.',refs:[6]},
    ru:{name:'Система вознаграждения',role:'Мотивация, обучение на вознаграждении и формирование привычек.',effect:'Алкоголь может менять дофаминовую передачу и усиливать связь напитка с ситуациями или сигналами окружения.',refs:[6]},
    en:{name:'Reward system',role:'Motivation, learning from reward and the formation of habits.',effect:'Alcohol can affect dopamine signalling and strengthen links between the drink and situations or cues.',refs:[6]},
  },
  cerebellum:{
    et:{name:'Väikeaju',role:'Liigutuste koordineerimine, tasakaal ja motoorne õppimine.',effect:'Alkohol võib häirida koordinatsiooni ja täpset liikumist; mõju sõltub muu hulgas annusest.',refs:[9]},
    ru:{name:'Мозжечок',role:'Координация движений, равновесие и моторное обучение.',effect:'Алкоголь может нарушать координацию и точность движений; выраженность зависит в том числе от дозы.',refs:[9]},
    en:{name:'Cerebellum',role:'Coordinating movements, balance and motor learning.',effect:'Alcohol can disrupt coordination and precise movement; the effect depends, among other things, on the dose.',refs:[9]},
  },
  brainstem:{
    et:{name:'Ajutüvi',role:'Elutähtsate automaatsete funktsioonide juhtimine.',effect:'Väga suur alkoholikogus võib pärssida kesknärvisüsteemi ohtlikul määral. Raske mürgistus on erakorraline seisund.',refs:[8]},
    ru:{name:'Ствол мозга',role:'Регуляция жизненно важных автоматических функций.',effect:'Очень большие количества алкоголя могут опасно угнетать центральную нервную систему. Тяжёлое отравление — неотложное состояние.',refs:[8]},
    en:{name:'Brainstem',role:'Controlling vital automatic functions.',effect:'A very large amount of alcohol can suppress the central nervous system to a dangerous degree. Severe poisoning is an emergency.',refs:[8]},
  },
};

function OneMinute({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const facts=lang==='en'?[
    ['Alcohol affects not one brain region but several signalling systems.',[6,9]],
    ['A memory blackout is not the same as loss of consciousness.',[2]],
    ['Attention, reaction and decision-making can get worse before a person subjectively feels very drunk.',[3,9]],
    ['Falling asleep faster after alcohol does not mean better-quality sleep.',[5]],
    ['The brain of an adolescent and a young adult is still developing.',[1,10]],
    ['The risks of alcohol are not limited to the brain and liver but also include injuries, cardiovascular disease and some cancers.',[8]],
    ['The result of one mini-game cannot show the level of intoxication, dependence or health status.',[6,7]],
  ]:ru?[
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
  return <div className="minute-card"><div className="minute-head"><span>60 s</span><div><h3>{T(lang,ru?'Тема за одну минуту':'Teema ühe minutiga')}</h3><p>{T(lang,ru?'Семь фактов, которые стоит вынести с сайта.':'Seitse mõtet, mida tasub lehelt kaasa võtta.')}</p></div></div><ol>{facts.map(([text,refs],i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span><p>{text as string} <SourceReference ids={refs as number[]} lang={lang}/></p></li>)}</ol></div>;
}

function DepthExplainer({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [depth,setDepth]=useState<Depth>('quick');
  const content={
    quick:T(lang,ru?'Алкоголь замедляет и меняет обмен сигналами между нервными клетками. Поэтому могут страдать память, внимание, координация и решения.':'Alkohol muudab ja aeglustab närvirakkude vahelist signaalivahetust. Seetõttu võivad kannatada mälu, tähelepanu, koordinatsioon ja otsustamine.'),
    deeper:T(lang,ru?'В общих чертах алкоголь усиливает тормозные эффекты GABA-системы и ослабляет возбуждающую передачу через глутамат/NMDA. Одновременно он влияет на систему вознаграждения и дофамин. Эти эффекты зависят от дозы и контекста.':'Üldpildis võimendab alkohol GABA-süsteemi pidurdavat mõju ja vähendab glutamaadi/NMDA kaudu toimuvat ergastavat ülekannet. Samal ajal mõjutab see tasustamissüsteemi ja dopamiini. Mõju sõltub annusest ja olukorrast.'),
    science:T(lang,ru?'Этанол действует на несколько молекулярных мишеней, а не на один «рецептор алкоголя». Среди наиболее изученных — GABA-A-рецепторы, NMDA-рецепторы и цепи вознаграждения. Поведенческий эффект является суммой изменений во многих сетях, поэтому простая схема не описывает индивидуальную реакцию полностью.':'Etanool toimib mitmele molekulaarsele sihtmärgile, mitte ühele „alkoholiretseptorile“. Enim uuritud on muu hulgas GABA-A- ja NMDA-retseptorid ning tasustamisrajad. Käitumuslik toime tekib paljude võrgustike muutuste summana, seega ei kirjelda lihtne skeem ühe inimese reaktsiooni täielikult.'),
  };
  return <article className="depth-card"><div className="depth-top"><div><span className="pill">{T(lang,ru?'3 УРОВНЯ':'3 TASET')}</span><h3>{T(lang,ru?'Насколько глубоко объяснять?':'Kui sügavale minna?')}</h3></div><div className="depth-tabs" role="tablist" aria-label={T(lang,ru?'Уровень объяснения':'Selgituse tase')}>{(['quick','deeper','science'] as Depth[]).map(key=><button key={key} role="tab" aria-selected={depth===key} className={depth===key?'active':''} onClick={()=>setDepth(key)}>{key==='quick'?(T(lang,ru?'Кратко':'Lühidalt')):key==='deeper'?(T(lang,ru?'Подробнее':'Põhjalikumalt')):(T(lang,ru?'Научно':'Teaduslikult'))}</button>)}</div></div><div className="depth-body" role="tabpanel"><p>{content[depth]} <SourceReference ids={[6,9]} lang={lang}/></p></div></article>;
}

function BrainMap({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [selected,setSelected]=useState<RegionId>('prefrontal');
  const data=brainRegions[selected][lang];
  return <div className="brain-map-wrap"><div className="brain-map-visual" aria-label={T(lang,ru?'Интерактивная схема мозга':'Interaktiivne ajuskeem')}><BrainDiagram selected={selected} onSelect={setSelected}/>{regionOrder.map((id,i)=><button key={id} className={`brain-point point-${id} ${selected===id?'active':''}`} onClick={()=>setSelected(id)} aria-pressed={selected===id}><span>{i+1}</span><b>{brainRegions[id][lang].name}</b></button>)}</div><article className="brain-map-panel" aria-live="polite"><span className="pill">{T(lang,ru?'ОБЛАСТЬ МОЗГА':'AJUPIIRKOND')}</span><h3>{data.name}</h3><dl><div><dt>{T(lang,ru?'Что делает':'Mida teeb')}</dt><dd>{data.role}</dd></div><div><dt>{T(lang,ru?'Связь с алкоголем':'Seos alkoholiga')}</dt><dd>{data.effect} <SourceReference ids={data.refs} lang={lang}/></dd></div></dl><p className="small">{T(lang,ru?'Схема упрощена: функции мозга распределены по сетям и не ограничиваются одной точкой.':'Skeem on lihtsustatud: ajufunktsioonid jaotuvad võrgustikesse ega piirdu ühe punktiga.')}</p></article></div>;
}

function Glossary({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [query,setQuery]=useState('');
  const filtered=useMemo(()=>glossary.filter(item=>`${item.term} ${item.ruTerm??''} ${item.enTerm??''} ${lang==='en'?item.en:ru?item.ru:item.et}`.toLowerCase().includes(query.toLowerCase())),[query,ru,lang]);
  return <div className="glossary"><div className="glossary-tools"><div><span className="pill">{T(lang,ru?'ГЛОССАРИЙ':'SÕNASTIK')}</span><h3>{T(lang,ru?'Термины без лишнего жаргона':'Mõisted ilma liigse žargoonita')}</h3></div><label><span className="sr-only">{T(lang,ru?'Поиск термина':'Otsi mõistet')}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={T(lang,ru?'Поиск: GABA, память…':'Otsi: GABA, mälu…')}/></label></div><div className="glossary-grid">{filtered.map(item=><details key={item.term}><summary>{lang==='en'?item.enTerm:ru?(item.ruTerm??item.term):item.term}</summary><p>{lang==='en'?item.en:ru?item.ru:item.et} <SourceReference ids={item.refs} lang={lang}/></p></details>)}{filtered.length===0&&<p className="empty-state">{T(lang,ru?'Ничего не найдено. Попробуй другое слово.':'Midagi ei leitud. Proovi teist sõna.')}</p>}</div></div>;
}

function MemoryPath({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const steps=lang==='en'?['Event / signal','Encoding the information','Consolidating the memory','Recalling it later']:ru?['Сигнал / событие','Кодирование информации','Закрепление воспоминания','Позднее воспроизведение']:['Sündmus / signaal','Info kodeerimine','Mälestuse kinnistumine','Hilisem meenutamine'];
  const [chosen,setChosen]=useState<number[]>([]);
  const [message,setMessage]=useState('');
  const pick=(index:number)=>{
    if(chosen.includes(index))return;
    if(index!==chosen.length){setMessage(T(lang,ru?'Не совсем: выбери следующий этап по порядку.':'Mitte päris: vali järgmine etapp õiges järjekorras.'));return;}
    const next=[...chosen,index];
    setChosen(next);
    if(next.length===steps.length)setMessage(T(lang,ru?'Готово. Чтобы воспоминание можно было позже вызвать, информация сначала должна быть закодирована и закреплена.':'Valmis. Et mälestust hiljem meenutada, peab info esmalt kodeeruma ja kinnistuma.'));else setMessage('');
  };
  const reset=()=>{setChosen([]);setMessage('');};
  return <article className="science-game"><span className="pill">{T(lang,ru?'МИНИ-ИНТЕРАКТИВ':'MINIINTERAKTIIV')}</span><h3>{T(lang,ru?'Собери путь воспоминания':'Pane kokku mälestuse teekond')}</h3><p>{T(lang,ru?'Нажимай этапы в логическом порядке — от события до воспроизведения.':'Vali etapid loogilises järjekorras sündmusest meenutamiseni.')}</p><div className="path-options">{steps.map((step,i)=><button key={step} className={chosen.includes(i)?'used':''} disabled={chosen.includes(i)} onClick={()=>pick(i)}><span>{chosen.indexOf(i)>=0?chosen.indexOf(i)+1:'·'}</span>{step}</button>)}</div>{message&&<p className="science-game-feedback" role="status">{message} <SourceReference ids={[2]} lang={lang}/></p>}<button className="text-button" onClick={reset}>{T(lang,ru?'Начать заново':'Alusta uuesti')}</button></article>;
}

function NeuroMatch({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const items=lang==='en'?[
    {q:'Which neurotransmitter is linked mainly with inhibition in this simplified model?',a:'GABA',opts:['GABA','Glutamate','Dopamine']},
    {q:'Which neurotransmitter is linked with excitatory NMDA transmission?',a:'Glutamate',opts:['Dopamine','Glutamate','GABA']},
    {q:'Which signal is especially important in learning from reward?',a:'Dopamine',opts:['Glutamate','GABA','Dopamine']},
  ]:ru?[
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
  return <article className="science-game"><span className="pill">{T(lang,ru?'МИНИ-ИНТЕРАКТИВ':'MINIINTERAKTIIV')}</span><h3>{T(lang,ru?'Сопоставь систему сигналов':'Sobita signaalisüsteem')}</h3>{done?<div className="science-mini-result"><strong>{score} / {items.length}</strong><p>{T(lang,ru?'Это проверка терминов, а не оценка мозга или здоровья.':'See kontrollib mõisteid, mitte aju ega tervist.')}</p><button className="button" onClick={restart}>{T(lang,ru?'Ещё раз':'Proovi uuesti')}</button></div>:<><p>{items[index].q}</p><div className="neuro-options">{items[index].opts.map(opt=><button key={opt} disabled={picked!==null} className={picked===opt?(opt===items[index].a?'correct':'incorrect'):''} onClick={()=>choose(opt)}>{opt}</button>)}</div>{picked&&<div className="science-game-feedback" role="status"><strong>{picked===items[index].a?(T(lang,ru?'Верно.':'Õige.')):((lang==='en'?`Correct answer: ${items[index].a}.`:ru?`Правильный ответ: ${items[index].a}.`:`Õige vastus: ${items[index].a}.`))}</strong> <SourceReference ids={[6,9]} lang={lang}/><br/><button className="text-button" onClick={next}>{index===items.length-1?(T(lang,ru?'Показать результат':'Vaata tulemust')):(T(lang,ru?'Следующий':'Järgmine'))}</button></div>}</>}</article>;
}

function ResearchLimits({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const rows=lang==='en'?[
    ['Correlation ≠ cause','If two things occur together, that does not yet prove that one caused the other.'],
    ['Group ≠ one person','The average result of a study does not exactly predict the reaction of one particular person.'],
    ['Dose and context matter','The result depends on the amount of alcohol, the speed of drinking, age, sleep, medicines and other factors.'],
    ['Web game ≠ clinical test','The games on this site are for learning and do not determine intoxication, dependence or fitness to drive.'],
  ]:ru?[
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
  return <div className="method-card"><div><span className="pill">{T(lang,ru?'КАК ЧИТАТЬ НАУКУ':'KUIDAS TEADUST LUGEDA')}</span><h3>{T(lang,ru?'Четыре ограничения, которые важно помнить':'Neli piirangut, mida tasub meeles pidada')}</h3></div><div className="method-grid">{rows.map(([title,text])=><article key={title}><strong>{title}</strong><p>{text}</p></article>)}</div><p className="small">{T(lang,ru?'Эти принципы особенно важны при интерпретации исследований подростков и долгосрочных последствий.':'Need põhimõtted on eriti olulised noorukite ja pikaajaliste mõjude uuringute tõlgendamisel.')} <SourceReference ids={[10]} lang={lang}/></p></div>;
}

function shuffle<T>(items:T[]){
  return [...items].sort(()=>Math.random()-.5);
}

function MemoryPathPlus({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const rounds=lang==='en'?[
    {title:'Level 1: how a memory forms',steps:['The event','Attention to the event','Encoding the information','Consolidating the memory','Recalling it later']},
    {title:'Level 2: the path of study material',steps:['New information','Holding attention','Meaningful encoding','A pause and consolidation','Recognising it later']},
    {title:'Level 3: find the weak link',steps:['The signal','Selecting what is important','Storing the new experience','Forming the memory trace','Recalling it with a cue']},
  ]:ru?[
    {title:'Уровень 1: как возникает воспоминание',steps:['Событие','Внимание к событию','Кодирование информации','Закрепление воспоминания','Позднее воспроизведение']},
    {title:'Уровень 2: путь учебного материала',steps:['Новая информация','Удержание внимания','Осмысленное кодирование','Пауза и закрепление','Узнавание позже']},
    {title:'Уровень 3: найди слабое звено',steps:['Сигнал','Выбор важного','Запись нового опыта','Формирование следа','Воспоминание по подсказке']},
  ]:[
    {title:'1. tase: kuidas mälestus tekib',steps:['Sündmus','Tähelepanu sündmusele','Info kodeerimine','Mälestuse kinnistumine','Hilisem meenutamine']},
    {title:'2. tase: õppematerjali teekond',steps:['Uus teave','Tähelepanu hoidmine','Mõtestatud kodeerimine','Paus ja kinnistumine','Hilisem äratundmine']},
    {title:'3. tase: leia nõrk lüli',steps:['Signaal','Olulise valimine','Uue kogemuse talletamine','Mälestusjälje kujunemine','Vihjega meenutamine']},
  ];
  const [round,setRound]=useState(0); const [step,setStep]=useState(0); const [used,setUsed]=useState<string[]>([]); const [feedback,setFeedback]=useState('');
  const options=useMemo(()=>shuffle(rounds[round].steps),[round,lang]);
  const restart=()=>{setRound(0);setStep(0);setUsed([]);setFeedback('');};
  const choose=(choice:string)=>{
    if(used.includes(choice))return;
    if(choice!==rounds[round].steps[step]){setFeedback(T(lang,ru?'Попробуй ещё раз: сначала выбери этап, который идёт следующим.':'Proovi uuesti: vali kõigepealt järgmine õige etapp.'));return;}
    const next=[...used,choice];setUsed(next);
    if(next.length===rounds[round].steps.length){setFeedback(round===rounds.length-1?(T(lang,ru?'Все уровни пройдены. Путь показывает, что воспоминание формируется поэтапно.':'Kõik tasemed on läbitud. Teekond näitab, et mälestus kujuneb etappide kaupa.')):(T(lang,ru?'Уровень пройден. Открой следующий вариант.':'Tase on läbitud. Ava järgmine variant.')));}else setStep(v=>v+1);
  };
  const complete=used.length===rounds[round].steps.length;
  return <article className="science-game enhanced-science-game"><div className="science-game-top"><span className="pill">{T(lang,ru?'ПАМЯТЬ':'MÄLU')}</span><span>{round+1} / {rounds.length}</span></div><h3>{T(lang,ru?'Собери путь воспоминания':'Pane kokku mälestuse teekond')}</h3><p>{T(lang,ru?'Три варианта задания: выбери каждый этап в правильном порядке.':'Kolm ülesande varianti: vali iga etapp õiges järjekorras.')}</p><div className="science-game-level"><strong>{rounds[round].title}</strong><span>{step} / {rounds[round].steps.length}</span></div><ProgressBar value={step} max={rounds[round].steps.length} label={T(lang,ru?'Этапы уровня':'Taseme etapid')}/><div className="path-options enhanced-path-options">{options.map(option=><button key={option} className={used.includes(option)?'used':''} disabled={used.includes(option)} onClick={()=>choose(option)}><span>{used.indexOf(option)>=0?used.indexOf(option)+1:T(lang,ru?'?' :'?')}</span>{option}</button>)}</div>{feedback&&<p className="science-game-feedback" role="status">{feedback} <SourceReference ids={[2]} lang={lang}/></p>}{complete&&round<rounds.length-1&&<button className="button primary science-next" onClick={()=>{setRound(v=>v+1);setStep(0);setUsed([]);setFeedback('');}}>{T(lang,ru?'Следующий уровень':'Järgmine tase')}</button>}<button className="text-button" onClick={restart}>{T(lang,ru?'Начать заново':'Alusta uuesti')}</button></article>;
}

function NeuroMatchPlus({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const items=lang==='en'?[
    {q:'Which neurotransmitter is linked mainly with inhibition in this model?',a:'GABA',opts:['GABA','Glutamate','Dopamine']},
    {q:'Which neurotransmitter is linked with excitatory NMDA transmission?',a:'Glutamate',opts:['Dopamine','Glutamate','GABA']},
    {q:'Which signal is important in learning from reward?',a:'Dopamine',opts:['Glutamate','GABA','Dopamine']},
    {q:'Which system can alcohol strengthen in the simplified model?',a:'GABA',opts:['GABA','Glutamate','Dopamine']},
    {q:'Which transmission can alcohol weaken in the simplified model?',a:'Glutamate',opts:['Dopamine','Glutamate','GABA']},
    {q:'Which signal links an experience with the motivation to repeat it?',a:'Dopamine',opts:['Glutamate','GABA','Dopamine']},
  ]:ru?[
    {q:'Какой медиатор в этой модели связан прежде всего с торможением?',a:'GABA',opts:['GABA','Глутамат','Дофамин']},
    {q:'Какой медиатор связан с возбуждающей NMDA-передачей?',a:'Глутамат',opts:['Дофамин','Глутамат','GABA']},
    {q:'Какой сигнал важен для обучения на вознаграждении?',a:'Дофамин',opts:['Глутамат','GABA','Дофамин']},
    {q:'Какую систему алкоголь может усиливать в упрощённой модели?',a:'GABA',opts:['GABA','Глутамат','Дофамин']},
    {q:'Какую передачу алкоголь может ослаблять в упрощённой модели?',a:'Глутамат',opts:['Дофамин','Глутамат','GABA']},
    {q:'Какой сигнал связывает опыт с мотивацией повторить его?',a:'Дофамин',opts:['Глутамат','GABA','Дофамин']},
  ]:[
    {q:'Milline virgatsaine seostub selles mudelis eeskätt pidurdusega?',a:'GABA',opts:['GABA','Glutamaat','Dopamiin']},
    {q:'Milline virgatsaine seostub ergastava NMDA-ülekandega?',a:'Glutamaat',opts:['Dopamiin','Glutamaat','GABA']},
    {q:'Milline signaal on oluline tasupõhises õppimises?',a:'Dopamiin',opts:['Glutamaat','GABA','Dopamiin']},
    {q:'Millist süsteemi võib alkohol lihtsustatud mudelis võimendada?',a:'GABA',opts:['GABA','Glutamaat','Dopamiin']},
    {q:'Millist ülekannet võib alkohol lihtsustatud mudelis nõrgendada?',a:'Glutamaat',opts:['Dopamiin','Glutamaat','GABA']},
    {q:'Milline signaal seob kogemuse motivatsiooniga seda korrata?',a:'Dopamiin',opts:['Glutamaat','GABA','Dopamiin']},
  ];
  const [index,setIndex]=useState(0);const [score,setScore]=useState(0);const [picked,setPicked]=useState<string|null>(null);const [done,setDone]=useState(false);
  const choose=(value:string)=>{if(picked)return;setPicked(value);if(value===items[index].a)setScore(v=>v+1);};
  const next=()=>{if(index===items.length-1)setDone(true);else{setIndex(v=>v+1);setPicked(null);}};
  const restart=()=>{setIndex(0);setScore(0);setPicked(null);setDone(false);};
  const level=Math.floor(index/3)+1;
  return <article className="science-game enhanced-science-game"><div className="science-game-top"><span className="pill">{T(lang,ru?'СИГНАЛЫ':'SIGNAALID')}</span><span>{done?items.length:index+1} / {items.length}</span></div><h3>{T(lang,ru?'Сопоставь систему сигналов':'Sobita signaalisüsteem')}</h3>{done?<div className="science-mini-result"><strong>{score} / {items.length}</strong><p>{T(lang,ru?'Ты прошёл(ла) два уровня. Это проверка терминов, а не оценка мозга или здоровья.':'Läbisid kaks taset. See kontrollib mõisteid, mitte aju ega tervist.')}</p><button className="button primary science-next" onClick={restart}>{T(lang,ru?'Пройти снова':'Proovi uuesti')}</button></div>:<><p>{T(lang,ru?'Шесть вариантов в двух уровнях: выбери наиболее точный ответ.':'Kuus varianti kahes tasemes: vali kõige täpsem vastus.')}</p><div className="science-game-level"><strong>{T(lang,ru?'Уровень':'Tase')} {level} / 2</strong><span>{items[index].q}</span></div><ProgressBar value={index%3} max={3} label={T(lang,ru?'Вопросы уровня':'Taseme küsimused')}/><div className="neuro-options enhanced-neuro-options">{items[index].opts.map(opt=><button key={opt} disabled={picked!==null} className={picked===opt?(opt===items[index].a?'correct':'incorrect'):''} onClick={()=>choose(opt)}>{opt}</button>)}</div>{picked&&<div className="science-game-feedback" role="status"><strong>{picked===items[index].a?(T(lang,ru?'Верно.':'Õige.')):((lang==='en'?`Correct answer: ${items[index].a}.`:ru?`Правильный ответ: ${items[index].a}.`:`Õige vastus: ${items[index].a}.`))}</strong> <SourceReference ids={[6,9]} lang={lang}/><button className="button primary science-next" onClick={next}>{index===items.length-1?(T(lang,ru?'Показать результат':'Vaata tulemust')):(T(lang,ru?'Следующий вопрос':'Järgmine küsimus'))}</button></div>}</>}</article>;
}

export default function LearningCenter({lang}:{lang:Lang}){
  const ru=lang==='ru';
  return <Section id="teadmised" number={T(lang,ru?'01A / НАУЧНАЯ БАЗА':'01A / TEADUSLIK ALUS')} title={T(lang,ru?'Разберись глубже — без стены текста':'Mõista sügavamalt, ilma tekstiseinata')} intro={T(lang,ru?'Выбери нужную глубину: быстрые факты, интерактивная карта мозга, термины и короткие задания. Научные утверждения связаны с источниками в конце страницы.':'Vali sobiv sügavus: kiired faktid, interaktiivne ajukaart, mõisted ja lühikesed ülesanded. Teadusväited on seotud lehe lõpus olevate allikatega.')} className="learning-section">
    <OneMinute lang={lang}/>
    <DepthExplainer lang={lang}/>
    <div className="learning-subhead"><span className="eyebrow">{T(lang,ru?'ИНТЕРАКТИВНАЯ КАРТА':'INTERAKTIIVNE KAART')}</span><h3>{T(lang,ru?'Нажми на область мозга':'Vali ajupiirkond')}</h3><p>{T(lang,ru?'Это учебная схема, а не анатомический атлас. Она показывает, с какими функциями чаще связывают разные области.':'See on õppemudel, mitte anatoomiline atlas. See näitab, milliste funktsioonidega eri piirkondi sageli seostatakse.')}</p></div>
    <BrainMap lang={lang}/>
    <Glossary lang={lang}/>
    <div className="science-games-grid"><MemoryPathPlus lang={lang}/><NeuroMatchPlus lang={lang}/></div>
    <ResearchLimits lang={lang}/>
  </Section>;
}

export function FinalSummary({lang,quizScore,visited,totalSections}:{lang:Lang;quizScore:number|null;visited:number;totalSections:number}){
  const ru=lang==='ru';
  const [metrics,setMetrics]=useState<GameMetrics>(()=>readGameMetrics());
  useEffect(()=>{const sync=()=>setMetrics(readGameMetrics());window.addEventListener('alkohol-game-metrics',sync);window.addEventListener('focus',sync);return()=>{window.removeEventListener('alkohol-game-metrics',sync);window.removeEventListener('focus',sync);};},[]);
  const games=[metrics.reaction,metrics.stroop,metrics.signal].filter(Boolean).length;
  return <Section id="isiklik-kokkuvote" number={T(lang,ru?'05A / ТВОЙ ИТОГ':'05A / SINU KOKKUVÕTE')} title={T(lang,ru?'Что ты уже прошёл(а)':'Mida oled juba teinud')} intro={T(lang,ru?'Итог существует только в этой вкладке и не является медицинской оценкой.':'Kokkuvõte eksisteerib ainult selles vahelehes ega ole tervisehinnang.')} className="personal-summary">
    <div className="summary-stats"><article><span>{T(lang,ru?'Разделы':'Osad')}</span><strong>{visited} / {totalSections}</strong><p>{T(lang,ru?'Открыто в этой сессии':'Avatud selles seansis')}</p></article><article><span>{T(lang,ru?'Мини-игры':'Minimängud')}</span><strong>{games} / 3</strong><p>{T(lang,ru?'Есть сохранённый результат':'Tulemus on salvestatud')}</p></article><article><span>{T(lang,ru?'Викторина':'Viktoriin')}</span><strong>{quizScore===null?'—':`${quizScore} / 10`}</strong><p>{quizScore===null?(T(lang,ru?'Ещё не завершена':'Veel lõpetamata')):(T(lang,ru?'Последняя попытка':'Viimane katse'))}</p></article></div>
    <div className="summary-detail"><div><h3>{T(lang,ru?'Результаты игр':'Mängude tulemused')}</h3>{games===0?<p>{T(lang,ru?'Пока нет результатов. Сыграй хотя бы в одну игру в лаборатории.':'Tulemusi veel pole. Proovi vähemalt üht mängu mängulaboris.')}</p>:<ul>{metrics.reaction&&<li>{T(lang,ru?'Реакция':'Reaktsioon')}: <strong>{metrics.reaction.latestMs} ms</strong> · {T(lang,ru?'лучшее':'parim')} {metrics.reaction.bestMs} ms</li>}{metrics.stroop&&<li>Stroop: <strong>{metrics.stroop.score}/{metrics.stroop.rounds}</strong> · {T(lang,ru?'среднее':'keskmine')} {metrics.stroop.averageMs} ms</li>}{metrics.signal&&<li>{T(lang,ru?'Цепочка':'Signaalirada')}: <strong>{T(lang,ru?'уровень':'tase')} {metrics.signal.reachedLength}</strong> · {metrics.signal.completed?(T(lang,ru?'завершено':'läbitud')):(T(lang,ru?'не завершено':'pooleli'))}</li>}</ul>}</div><div className="summary-next"><h3>{T(lang,ru?'Что дальше?':'Mis edasi?')}</h3><p>{quizScore===null?(T(lang,ru?'Пройди «Миф или факт», затем вернись сюда — итог обновится автоматически.':'Tee „Müüt või fakt“ läbi ja tule siia tagasi — kokkuvõte uueneb automaatselt.')):(T(lang,ru?'Просмотри объяснения к ошибкам и источники. Если хочешь, затем заполни анонимный опрос.':'Vaata üle vigade selgitused ja allikad. Soovi korral täida seejärel anonüümne küsitlus.'))}</p><a className="button" href={quizScore===null?'#viktoriin':'#tagasiside'}>{quizScore===null?(T(lang,ru?'К викторине':'Viktoriini juurde')):(T(lang,ru?'К опросу':'Küsitluse juurde'))}</a></div></div>
  </Section>;
}

