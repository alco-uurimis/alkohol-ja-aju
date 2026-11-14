import { useEffect, useRef, useState } from 'react';
import Brain from './sections/Brain';
import Infographics from './sections/Infographics';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import LearningCenter from './sections/LearningCenter';
import Closing from './sections/Closing';
import FinalSummary from './components/FinalSummary';
import Reflection from './components/Reflection';
import { Section } from './components/Shared';
import { Quiz } from './components/Quiz';
import PathChooser from './components/PathChooser';
import ClassroomKit from './sections/ClassroomKit';
import ActionHub from './sections/ActionHub';
import { questions } from './data/content';
import { getEn, loadEn } from './data/en';
import { getRu, loadRu } from './data/ru';
import { T } from './data/siteT';

type Lang='et'|'ru'|'en';
type NavItem=[string,string];
function sectionId(hash:string){try{return decodeURIComponent(hash.slice(1));}catch{return '';}}

type ReturnPoint={id:string;y:number;label:string};
const trackedIds=['valik','aju','infograafika','teadmised','malu','tahelepanu','labor','viktoriin','samoprov','obsuzhdenie','tegevus','klassiruum'];
const progressKey='alkohol-ja-aju:visited-sections';
const savedProgressKey='alkohol-ja-aju:saved-visited-sections';
const savedProgressEnabledKey='alkohol-ja-aju:save-progress-on-device';
const languageKey='alkohol-ja-aju:language';
const quizScoreKey='alkohol-ja-aju:quiz-score';

function readVisited(){if(typeof window==='undefined')return new Set<string>();try{const saved=window.localStorage.getItem(savedProgressEnabledKey)==='1';const raw=(saved?window.localStorage.getItem(savedProgressKey):null)??window.sessionStorage.getItem(progressKey)??'[]';return new Set<string>((JSON.parse(raw) as string[]).filter(id=>trackedIds.includes(id)));}catch{return new Set<string>();}}
function readsSavedProgress(){if(typeof window==='undefined')return false;try{return window.localStorage.getItem(savedProgressEnabledKey)==='1';}catch{return false;}}
function readLanguage():Lang{if(typeof window==='undefined')return'et';try{const v=new URLSearchParams(window.location.search).get('lang')??window.localStorage.getItem(languageKey);return v==='ru'||v==='en'?v:'et';}catch{return'et';}}
function readQuizScore(){if(typeof window==='undefined')return null;try{const raw=window.sessionStorage.getItem(quizScoreKey);if(raw===null)return null;const value=Number(raw);return Number.isInteger(value)&&value>=0&&value<=10?value:null;}catch{return null;}}

// The page is long (15 sections). Mounting it all in one go blocked the main thread for >1.5 s on phones, so the sections below the
// first screen are mounted in idle-time steps. A link to a not-yet-mounted section (or a #hash on load) mounts everything at once.
const STAGES=5;
type IdleWindow=Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void};

export default function App(){
  const [stage,setStage]=useState(()=>typeof location!=='undefined'&&location.hash.length>1?STAGES:0);
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('avaleht');
  const [returnPoint,setReturnPoint]=useState<ReturnPoint|null>(null);
  const [lang,setLang]=useState<Lang>(readLanguage);
  const [visited,setVisited]=useState<Set<string>>(readVisited);
  const [quizScore,setQuizScore]=useState<number|null>(readQuizScore);
  const [progressSaved,setProgressSaved]=useState(readsSavedProgress);
  const menuButton=useRef<HTMLButtonElement>(null);
  const activeSection=useRef('avaleht');
  const ru=lang==='ru';
  const navGroups:{label:string;items:NavItem[]}[]=[
    {label:T(lang,ru?'НАЧАТЬ':'ALUSTA'),items:[['valik',T(lang,ru?'Выбрать формат':'Vali vorm')],['tegevus',T(lang,ru?'Что делать в ситуации':'Mida teha olukorras')],['klassiruum',T(lang,ru?'Для урока':'Tunniks')]]},
    {label:T(lang,ru?'ИЗУЧИТЬ':'ÕPI'),items:[['aju',T(lang,ru?'Влияние на мозг':'Mõju ajule')],['infograafika',T(lang,ru?'Схемы':'Skeemid')],['teadmised',T(lang,ru?'Научная база':'Teadusbaas')]]},
    {label:T(lang,ru?'ПОПРОБОВАТЬ':'PROOVI'),items:[['malu',T(lang,ru?'Память':'Mälu')],['tahelepanu',T(lang,ru?'Внимание':'Tähelepanu')],['labor',T(lang,ru?'Мини-игры':'Minimängud')]]},
    {label:T(lang,ru?'ПРОВЕРИТЬ':'KONTROLLI'),items:[['viktoriin',T(lang,ru?'Миф или факт':'Müüt või fakt')],['samoprov',T(lang,ru?'Самопроверка':'Enesekontroll')]]},
    {label:T(lang,ru?'ЗАВЕРШИТЬ':'LÕPETA'),items:[['obsuzhdenie',T(lang,ru?'Обсуждение':'Arutelu')],['tagasiside',T(lang,ru?'Обратная связь о сайте':'Tagasiside veebilehe kohta')],['isiklik-kokkuvote',T(lang,ru?'Итог':'Kokkuvõte')],['allikad',T(lang,ru?'Источники':'Allikad')]]}
  ];
  const links=navGroups.flatMap(g=>g.items);
  const sectionNames=Object.fromEntries([['avaleht',T(lang,ru?'Главная':'Avaleht')],...links]);
  const currentPhase=navGroups.find(g=>g.items.some(([id])=>id===active))?.label??(T(lang,ru?'НАЧАЛО':'ALGUS'));

  useEffect(()=>{if(stage>=STAGES)return;const w=window as IdleWindow;const next=()=>setStage(v=>Math.min(STAGES,v+1));const id=w.requestIdleCallback?w.requestIdleCallback(next,{timeout:400}):window.setTimeout(next,60);return()=>{if(w.cancelIdleCallback)w.cancelIdleCallback(id);window.clearTimeout(id);};},[stage]);
  useEffect(()=>{if(stage>=STAGES)return;const flush=(event:MouseEvent)=>{const link=(event.target as Element|null)?.closest?.('a[href*="#"]') as HTMLAnchorElement|null;if(!link)return;const url=new URL(link.href,location.href);if(url.pathname!==location.pathname||url.hash.length<2)return;const id=sectionId(url.hash);setStage(STAGES);window.setTimeout(()=>document.getElementById(id)?.scrollIntoView(),120);};document.addEventListener('click',flush,true);return()=>document.removeEventListener('click',flush,true);},[stage]);
  useEffect(()=>{window.dispatchEvent(new Event('alkohol-stage'));},[stage]);
  useEffect(()=>{if(location.hash.length<2)return;const id=sectionId(location.hash);const t=window.setTimeout(()=>document.getElementById(id)?.scrollIntoView(),150);return()=>window.clearTimeout(t);},[]);
  useEffect(()=>{document.documentElement.lang=lang;try{window.localStorage.setItem(languageKey,lang);}catch{}document.title=T(lang,ru?'Алкоголь и мозг — научный учебный сайт':'Alkohol ja aju — teaduspõhine õppeveeb');const d=T(lang,ru?'Учебный сайт о влиянии алкоголя на мозг: научные источники, упражнения, мини-игры и исследовательский опрос.':'Teaduspõhine õppematerjal alkoholi mõjust ajule: allikad, harjutused, minimängud ja uurimisküsitlus.');document.querySelector('meta[name="description"]')?.setAttribute('content',d);},[lang,ru]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){activeSection.current=entry.target.id;setActive(entry.target.id);}}, {rootMargin:'-18% 0px -68% 0px'});links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[lang,stage]);
  useEffect(()=>{const captureJump=(event:MouseEvent)=>{const target=event.target;if(!(target instanceof Element))return;const link=target.closest('a[href]') as HTMLAnchorElement|null;if(!link)return;const destination=new URL(link.href,window.location.href);if(destination.origin!==window.location.origin||destination.pathname!==window.location.pathname||!destination.hash)return;const nextId=sectionId(destination.hash);const previousId=activeSection.current;if(!nextId||nextId===previousId)return;setReturnPoint({id:previousId,y:window.scrollY,label:sectionNames[previousId]??(T(lang,ru?'предыдущему месту':'eelmise koha'))});};document.addEventListener('click',captureJump,true);return()=>document.removeEventListener('click',captureJump,true);},[lang]);
  useEffect(()=>{// A section counts as seen when 28% of it is visible, or when it fills at least 40% of the screen (very tall sections can never reach 28% on a phone).
const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;if(entry.intersectionRect.height<Math.min(entry.boundingClientRect.height*.28,window.innerHeight*.4))continue;const id=entry.target.id;setVisited(current=>{if(current.has(id))return current;const next=new Set(current);next.add(id);try{const value=JSON.stringify([...next]);window.sessionStorage.setItem(progressKey,value);if(readsSavedProgress())window.localStorage.setItem(savedProgressKey,value);}catch{}return next;});}},{threshold:[0,.1,.2,.28,.4,.6]});trackedIds.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[stage]);
  useEffect(()=>{if(!menu)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);requestAnimationFrame(()=>menuButton.current?.focus());}};const onResize=()=>{if(innerWidth>1100)setMenu(false);};addEventListener('keydown',onKey);addEventListener('resize',onResize,{passive:true});return()=>{document.body.style.overflow=previous;removeEventListener('keydown',onKey);removeEventListener('resize',onResize);};},[menu]);
  const switchLanguage=(next:Lang)=>{
    const url=new URL(window.location.href);
    url.searchParams.set('lang',next);
    history.replaceState(null,'',url);
    setMenu(false);
    if(next==='ru')loadRu().then(()=>setLang('ru'),()=>{});else if(next==='en')loadEn().then(()=>setLang('en'),()=>{});else setLang(next);
  };
  const handleQuizComplete=(score:number)=>{setQuizScore(score);try{sessionStorage.setItem(quizScoreKey,String(score));}catch{}};
  const saveProgress=()=>{try{localStorage.setItem(savedProgressEnabledKey,'1');localStorage.setItem(savedProgressKey,JSON.stringify([...visited]));setProgressSaved(true);}catch{}};
  const clearSavedProgress=()=>{try{localStorage.removeItem(savedProgressEnabledKey);localStorage.removeItem(savedProgressKey);sessionStorage.removeItem(progressKey);}catch{}setVisited(new Set());setProgressSaved(false);};
  const returnToReadingPlace=()=>{if(!returnPoint)return;const {id,y}=returnPoint;setReturnPoint(null);history.replaceState(null,'','#'+id);window.scrollTo({top:y,behavior:'smooth'});};

  return <>
    <a className="skip" href="#sisu">{T(lang,ru?'Перейти к содержанию':'Liigu põhisisu juurde')}</a>
    <header className="header">
      <a className="brand" aria-label={T(lang,ru?"Алкоголь и мозг":"Alkohol ja aju")} href="#avaleht" onClick={()=>setMenu(false)}><img className="brand-mark" src="logo-mark.svg" alt=""/><span>{T(lang,ru?'алкоголь и мозг':'alkohol ja aju')}</span></a>
      <div className="header-context" aria-hidden="true"><span>{currentPhase}</span></div>
      <div className="header-actions"><div className="language-switch" role="group" aria-label={T(lang,ru?'Язык':'Keel')}><button type="button" className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button><button type="button" className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button><button type="button" className={lang==='en'?'active':''} aria-pressed={lang==='en'} onClick={()=>switchLanguage('en')}>EN</button></div><button ref={menuButton} type="button" className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(v=>!v)}>{menu?(T(lang,ru?'Закрыть':'Sulge')):(T(lang,ru?'Меню':'Menüü'))}</button></div>
      <nav id="navigation" className={menu?'open':''} aria-label={T(lang,ru?'Главное меню':'Peamenüü')}><div className="nav-groups">
        {navGroups.map(group=><div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map(([id,name])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined} onClick={()=>setMenu(false)}>{name}</a>)}</div>)}
        <div className="nav-group nav-project"><span className="nav-group-label">{T(lang,ru?'ПРОЕКТ':'PROJEKT')}</span><a href="start/">{T(lang,ru?"Урок за 5 минут":"Õppetükk 5 minutiga")}</a><a href="start/?mode=full">{T(lang,ru?"Урок за 20 минут":"Õppetükk 20 minutiga")}</a><a href="help/">{T(lang,ru?"Что делать / Нужна помощь":"Mida teha / Vajan abi")}</a><a href="teacher/">{T(lang,ru?'Для учителя':'Õpetajale')}</a><a href="topics/">{T(lang,ru?'Научные темы':'Teadusteemad')}</a><a href="science/">{T(lang,ru?'Добровольный опрос 15+':'Vabatahtlik küsitlus 15+')}</a><a href="methodology/">{T(lang,ru?'Методология':'Metoodika')}</a><a href="fact-check/">{T(lang,ru?'Как проверялись факты':'Kuidas fakte kontrolliti')}</a><a href="data-policy/">{T(lang,ru?'Данные и приватность':'Andmed ja privaatsus')}</a></div>
      </div></nav>
    </header>

    <main id="sisu" tabIndex={-1}>
      <section id="avaleht" className="hero hero-simple"><div className="hero-copy"><p className="eyebrow">{T(lang,ru?'НАУЧНЫЙ УЧЕБНЫЙ САЙТ':'TEADUSPÕHINE ÕPPEVEEB')}</p><h1>{T(lang,ru?'Алкоголь':'Alkohol')}<br/>{T(lang,ru?'и ':'ja ')}<span>{T(lang,ru?'мозг.':'aju.')}</span></h1><h2>{T(lang,ru?'Пойми, что показывают исследования — и чего они не доказывают.':'Mõista, mida uuringud näitavad ja mida need ei tõesta.')}</h2><p>{T(lang,ru?'Разберись, как алкоголь влияет на память, внимание и решения.':'Uuri, kuidas alkohol mõjutab mälu, tähelepanu ja otsuseid.')}</p><div className="actions"><a className="button primary" href="start/">{T(lang,ru?"Пройти урок за 5 минут":"Alusta 5-minutilist õppetükki")}</a><a className="text-link" href="teacher/">{T(lang,ru?"Материалы для учителя":"Materjalid õpetajale")}</a><a className="text-link" href="help/">{T(lang,ru?"Что делать / Нужна помощь":"Mida teha / Vajan abi")}</a></div><p className="hero-note">{T(lang,ru?'Учебный материал · не медицинская оценка':'Õppematerjal · mitte meditsiiniline hinnang')}</p></div><div className="hero-visual"><div className="signal brain-photo-hero" role="img" aria-label={T(lang,ru?'Схема областей мозга':'Ajupiirkondade skeem')}/><ul className="hero-diagram-key"><li>{T(lang,ru?'Префронтальная кора — решения':'Prefrontaalne ajukoor – otsused')}</li><li>{T(lang,ru?'Лобно-теменная сеть — внимание':'Frontoparietaalne võrgustik – tähelepanu')}</li><li>{T(lang,ru?'Гиппокамп — память':'Hipokampus – mälu')}</li><li>{T(lang,ru?'Мозжечок — координация':'Väikeaju – koordinatsioon')}</li></ul><p>{T(lang,ru?'Память, внимание, реакция и принятие решений работают как сети. Ни одна функция не находится в одной точке мозга.':'Mälu, tähelepanu, reaktsioon ja otsustamine toimivad võrgustikena. Ükski funktsioon ei asu ainult ühes ajupunktis.')}</p></div></section>

      <PathChooser lang={lang}/>

      <section className="site-guide science-topics featured-topics" aria-labelledby="science-topics-title"><div className="site-guide-heading"><p className="eyebrow">{T(lang,ru?'НАУЧНЫЕ ТЕМЫ':'TEADUSTEEMAD')}</p><h2 id="science-topics-title">{T(lang,ru?'Изучи научные темы':'Tutvu teadusteemadega')}</h2><p>{T(lang,ru?'На отдельных страницах: что изучали, сколько было участников, что нашли и где заканчивается вывод.':'Eraldi lehtedel: mida uuriti, kui suur oli valim, mida leiti ja kus järeldus lõpeb.')}</p></div><div className="guide-grid guide-grid-four">
        <a href="acute-effects/" className="guide-card"><div className="guide-card-copy"><strong>{T(lang,ru?'Рабочая память':'Töömälu')}</strong><p>{T(lang,ru?'Что изменилось у взрослых в лабораторных заданиях.':'Mis muutus täiskasvanute soorituses laboriülesannetes.')}</p></div></a>
        <a href="adolescent-brain/" className="guide-card"><div className="guide-card-copy"><strong>{T(lang,ru?'Подростковый мозг':'Nooruki aju')}</strong><p>{T(lang,ru?'Большие выборки и ограничения причинных выводов.':'Suured valimid ja põhjuslike järelduste piirid.')}</p></div></a>
        <a href="alcohol-and-sleep/" className="guide-card"><div className="guide-card-copy"><strong>{T(lang,ru?'Сон':'Uni')}</strong><p>{T(lang,ru?'Почему быстро уснуть не значит лучше спать.':'Miks kiire uinumine ei tähenda paremat und.')}</p></div></a>
        <a href="alcohol-and-driving/" className="guide-card"><div className="guide-card-copy"><strong>{T(lang,ru?'Вождение':'Autojuhtimine')}</strong><p>{T(lang,ru?'Почему субъективное самочувствие не измеряет безопасность.':'Miks enesetunne ei mõõda ohutust.')}</p></div></a>
      </div><a className="all-topics-link" href="topics/">{T(lang,ru?'Открыть все 8 научных тем':'Ava kõik 8 teadusteemat')}</a></section>

      {stage>=1&&<><div className="phase-divider"><div><strong>{T(lang,ru?'Изучи':'Õpi')}</strong><small>{T(lang,ru?'Факты, механизмы и ограничения':'Faktid, mehhanismid ja piirangud')}</small></div></div><Brain lang={lang}/></>}
      {stage>=2&&<><Infographics lang={lang}/><LearningCenter lang={lang}/></>}
      {stage>=3&&<><div className="phase-divider"><div><strong>{T(lang,ru?'Попробуй':'Proovi')}</strong><small>{T(lang,ru?'Учебные упражнения, не медицинские тесты':'Õppeharjutused, mitte meditsiinilised testid')}</small></div></div><Memory lang={lang}/><Attention lang={lang}/><Lab lang={lang}/></>}
      {stage>=4&&<><div className="phase-divider"><div><strong>{T(lang,ru?'Проверь':'Kontrolli')}</strong><small>{T(lang,ru?'Знание и уверенность в ответе':'Teadmised ja vastuse kindlus')}</small></div></div><Section id="viktoriin" number={T(lang,ru?'ПРОВЕРЬ ЗНАНИЯ':'KONTROLLI TEADMISI')} title={T(lang,ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?')} intro={T(lang,ru?'Сначала оцени свою уверенность. Затем выбери «миф» или «факт» и прочитай объяснение.':'Hinda esmalt oma kindlust. Seejärel vali „müüt“ või „fakt“ ja loe selgitust.')} className="quiz-section"><Quiz questions={lang==='en'?getEn().questionsEn:ru?getRu().questionsRu:questions} lang={lang} onComplete={handleQuizComplete}/></Section><Reflection lang={lang}/><ActionHub lang={lang}/><ClassroomKit lang={lang}/></>}
      {stage>=5&&<><div className="phase-divider"><div><strong>{T(lang,ru?'Заверши':'Lõpeta')}</strong><small>{T(lang,ru?'Выводы, обратная связь и источники':'Järeldused, tagasiside ja allikad')}</small></div></div><Closing lang={lang} summary={<FinalSummary lang={lang} quizScore={quizScore} visitedIds={[...visited]} totalSections={trackedIds.length} progressSaved={progressSaved} onSaveProgress={saveProgress} onClearSavedProgress={clearSavedProgress}/>}/></>}
    </main>
    {returnPoint&&<button type="button" className="reading-return" onClick={returnToReadingPlace} aria-label={(lang==='en'?`Back to: ${returnPoint.label}`:ru?`Вернуться к месту: ${returnPoint.label}`:`Naase kohta: ${returnPoint.label}`)}><span aria-hidden="true"/><b>{T(lang,ru?'Вернуться':'Tagasi')}</b><small>{returnPoint.label}</small></button>}
    <footer className="site-footer"><div className="footer-brand"><strong>{T(lang,ru?'Алкоголь и мозг':'Alkohol ja aju')}</strong><p>{T(lang,ru?'Учебный сайт о мозге, фактах и безопасных решениях.':'Õppeveeb ajust, faktidest ja turvalistest valikutest.')}</p><span>v2.0 · 2026</span></div><nav aria-label={T(lang,ru?'Информация о проекте':'Projekti info')}><a href="methodology/">{T(lang,ru?'Методология':'Metoodika')}</a><a href="fact-check/">{T(lang,ru?'Проверка фактов':'Faktikontroll')}</a><a href="data-policy/">{T(lang,ru?'Данные и приватность':'Andmed ja privaatsus')}</a><a href="changelog/">Changelog</a></nav><div className="footer-support footer-support-static"><strong>{T(lang,ru?'Нужна помощь?':'Vajad abi?')}</strong><a href="tel:116111">Lasteabi 116 111</a><span>{T(lang,ru?'круглосуточно и бесплатно':'ööpäev läbi ja tasuta')}</span></div></footer>
  </>;
}
