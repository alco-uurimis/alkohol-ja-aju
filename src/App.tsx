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
import { questionsRu } from './data/content.ru';

type Lang='et'|'ru';
type NavItem=[string,string];
type ReturnPoint={id:string;y:number;label:string};
const trackedIds=['valik','aju','infograafika','teadmised','malu','tahelepanu','labor','viktoriin','samoprov','obsuzhdenie','tegevus','klassiruum'];
const progressKey='alkohol-ja-aju:visited-sections';
const savedProgressKey='alkohol-ja-aju:saved-visited-sections';
const savedProgressEnabledKey='alkohol-ja-aju:save-progress-on-device';
const languageKey='alkohol-ja-aju:language';
const quizScoreKey='alkohol-ja-aju:quiz-score';

function readVisited(){if(typeof window==='undefined')return new Set<string>();try{const saved=window.localStorage.getItem(savedProgressEnabledKey)==='1';const raw=(saved?window.localStorage.getItem(savedProgressKey):null)??window.sessionStorage.getItem(progressKey)??'[]';return new Set<string>((JSON.parse(raw) as string[]).filter(id=>trackedIds.includes(id)));}catch{return new Set<string>();}}
function readsSavedProgress(){if(typeof window==='undefined')return false;try{return window.localStorage.getItem(savedProgressEnabledKey)==='1';}catch{return false;}}
function readLanguage():Lang{if(typeof window==='undefined')return'et';try{return window.localStorage.getItem(languageKey)==='ru'?'ru':'et';}catch{return'et';}}
function readQuizScore(){if(typeof window==='undefined')return null;try{const raw=window.sessionStorage.getItem(quizScoreKey);if(raw===null)return null;const value=Number(raw);return Number.isInteger(value)&&value>=0&&value<=10?value:null;}catch{return null;}}

export default function App(){
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
    {label:ru?'НАЧАТЬ':'ALUSTA',items:[['valik',ru?'Выбрать формат':'Vali vorm'],['tegevus',ru?'Что делать в ситуации':'Mida teha olukorras'],['klassiruum',ru?'Для урока':'Tunniks']]},
    {label:ru?'ИЗУЧИТЬ':'ÕPI',items:[['aju',ru?'Влияние на мозг':'Mõju ajule'],['infograafika',ru?'Схемы':'Skeemid'],['teadmised',ru?'Научная база':'Teadusbaas']]},
    {label:ru?'ПОПРОБОВАТЬ':'PROOVI',items:[['malu',ru?'Память':'Mälu'],['tahelepanu',ru?'Внимание':'Tähelepanu'],['labor',ru?'Мини-игры':'Minimängud']]},
    {label:ru?'ПРОВЕРИТЬ':'KONTROLLI',items:[['viktoriin',ru?'Миф или факт':'Müüt või fakt'],['samoprov',ru?'Самопроверка':'Enesekontroll']]},
    {label:ru?'ЗАВЕРШИТЬ':'LÕPETA',items:[['obsuzhdenie',ru?'Обсуждение':'Arutelu'],['tagasiside',ru?'Обратная связь о сайте':'Tagasiside veebilehe kohta'],['isiklik-kokkuvote',ru?'Итог':'Kokkuvõte'],['allikad',ru?'Источники':'Allikad']]}
  ];
  const links=navGroups.flatMap(g=>g.items);
  const sectionNames=Object.fromEntries([['avaleht',ru?'Главная':'Avaleht'],...links]);
  const currentPhase=navGroups.find(g=>g.items.some(([id])=>id===active))?.label??(ru?'НАЧАЛО':'ALGUS');

  useEffect(()=>{document.documentElement.lang=lang;try{window.localStorage.setItem(languageKey,lang);}catch{}document.title=ru?'Алкоголь и мозг — научный учебный сайт':'Alkohol ja aju — teaduspõhine õppeveeb';const d=ru?'Учебный сайт о влиянии алкоголя на мозг: научные источники, упражнения, мини-игры и исследовательский опрос.':'Teaduspõhine õppematerjal alkoholi mõjust ajule: allikad, harjutused, minimängud ja uurimisküsitlus.';document.querySelector('meta[name="description"]')?.setAttribute('content',d);},[lang,ru]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){activeSection.current=entry.target.id;setActive(entry.target.id);}}, {rootMargin:'-18% 0px -68% 0px'});links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[lang]);
  useEffect(()=>{const captureJump=(event:MouseEvent)=>{const target=event.target;if(!(target instanceof Element))return;const link=target.closest('a[href]') as HTMLAnchorElement|null;if(!link)return;const destination=new URL(link.href,window.location.href);if(destination.origin!==window.location.origin||destination.pathname!==window.location.pathname||!destination.hash)return;const nextId=decodeURIComponent(destination.hash.slice(1));const previousId=activeSection.current;if(!nextId||nextId===previousId)return;setReturnPoint({id:previousId,y:window.scrollY,label:sectionNames[previousId]??(ru?'предыдущему месту':'eelmise koha')});};document.addEventListener('click',captureJump,true);return()=>document.removeEventListener('click',captureJump,true);},[lang]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const id=entry.target.id;setVisited(current=>{if(current.has(id))return current;const next=new Set(current);next.add(id);try{const value=JSON.stringify([...next]);window.sessionStorage.setItem(progressKey,value);if(readsSavedProgress())window.localStorage.setItem(savedProgressKey,value);}catch{}return next;});}},{threshold:.28});trackedIds.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[]);
  useEffect(()=>{if(!menu)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);requestAnimationFrame(()=>menuButton.current?.focus());}};const onResize=()=>{if(innerWidth>1100)setMenu(false);};addEventListener('keydown',onKey);addEventListener('resize',onResize,{passive:true});return()=>{document.body.style.overflow=previous;removeEventListener('keydown',onKey);removeEventListener('resize',onResize);};},[menu]);
  const switchLanguage=(next:Lang)=>{
    const url=new URL(window.location.href);
    url.searchParams.set('lang',next);
    history.replaceState(null,'',url);
    setLang(next);
    setMenu(false);
  };
  const handleQuizComplete=(score:number)=>{setQuizScore(score);try{sessionStorage.setItem(quizScoreKey,String(score));}catch{}};
  const saveProgress=()=>{try{localStorage.setItem(savedProgressEnabledKey,'1');localStorage.setItem(savedProgressKey,JSON.stringify([...visited]));setProgressSaved(true);}catch{}};
  const clearSavedProgress=()=>{try{localStorage.removeItem(savedProgressEnabledKey);localStorage.removeItem(savedProgressKey);sessionStorage.removeItem(progressKey);}catch{}setVisited(new Set());setProgressSaved(false);};
  const returnToReadingPlace=()=>{if(!returnPoint)return;const {id,y}=returnPoint;setReturnPoint(null);history.replaceState(null,'','#'+id);window.scrollTo({top:y,behavior:'smooth'});};

  return <>
    <a className="skip" href="#sisu">{ru?'Перейти к содержанию':'Liigu põhisisu juurde'}</a>
    <header className="header">
      <a className="brand" aria-label={ru?"Алкоголь и мозг":"Alkohol ja aju"} href="#avaleht" onClick={()=>setMenu(false)}><img className="brand-mark" src="logo-mark.svg" alt=""/><span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a>
      <div className="header-context" aria-hidden="true"><span>{currentPhase}</span></div>
      <div className="header-actions"><div className="language-switch" role="group" aria-label={ru?'Язык':'Keel'}><button type="button" className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button><button type="button" className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button></div><button ref={menuButton} type="button" className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(v=>!v)}>{menu?(ru?'Закрыть':'Sulge'):(ru?'Меню':'Menüü')}</button></div>
      <nav id="navigation" className={menu?'open':''} aria-label={ru?'Главное меню':'Peamenüü'}><div className="nav-groups">
        {navGroups.map(group=><div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map(([id,name])=><a key={id} href={'#'+id} aria-current={active===id?'location':undefined} onClick={()=>setMenu(false)}>{name}</a>)}</div>)}
        <div className="nav-group nav-project"><span className="nav-group-label">{ru?'ПРОЕКТ':'PROJEKT'}</span><a href="start/">{ru?"Урок за 5 минут":"Õppetükk 5 minutiga"}</a><a href="start/?mode=full">{ru?"Урок за 20 минут":"Õppetükk 20 minutiga"}</a><a href="help/">{ru?"Что делать / Нужна помощь":"Mida teha / Vajan abi"}</a><a href="teacher/">{ru?'Для учителя':'Õpetajale'}</a><a href="topics/">{ru?'Научные темы':'Teadusteemad'}</a><a href="science/">{ru?'Добровольный опрос 15+':'Vabatahtlik küsitlus 15+'}</a><a href="methodology/">{ru?'Методология':'Metoodika'}</a><a href="fact-check/">{ru?'Как проверялись факты':'Kuidas fakte kontrolliti'}</a><a href="data-policy/">{ru?'Данные и приватность':'Andmed ja privaatsus'}</a></div>
      </div></nav>
    </header>

    <main id="sisu" tabIndex={-1}>
      <section id="avaleht" className="hero hero-simple"><div className="hero-copy"><p className="eyebrow">{ru?'НАУЧНЫЙ УЧЕБНЫЙ САЙТ':'TEADUSPÕHINE ÕPPEVEEB'}</p><h1>{ru?'Алкоголь':'Alkohol'}<br/>{ru?'и ':'ja '}<span>{ru?'мозг.':'aju.'}</span></h1><h2>{ru?'Пойми, что показывают исследования — и чего они не доказывают.':'Mõista, mida uuringud näitavad ja mida need ei tõesta.'}</h2><p>{ru?'Разберись, как алкоголь влияет на память, внимание и решения.':'Uuri, kuidas alkohol mõjutab mälu, tähelepanu ja otsuseid.'}</p><div className="actions"><a className="button primary" href="start/">{ru?"Пройти урок за 5 минут":"Alusta 5-minutilist õppetükki"}</a><a className="text-link" href="teacher/">{ru?"Материалы для учителя":"Materjalid õpetajale"}</a><a className="text-link" href="help/">{ru?"Что делать / Нужна помощь":"Mida teha / Vajan abi"}</a></div><p className="hero-note">{ru?'Учебный материал · не медицинская оценка':'Õppematerjal · mitte meditsiiniline hinnang'}</p></div><div className="hero-visual"><div className="signal brain-photo-hero" role="img" aria-label={ru?'Схема областей мозга':'Ajupiirkondade skeem'}/><ul className="hero-diagram-key"><li>{ru?'Префронтальная кора — решения':'Prefrontaalne ajukoor – otsused'}</li><li>{ru?'Лобно-теменная сеть — внимание':'Frontoparietaalne võrgustik – tähelepanu'}</li><li>{ru?'Гиппокамп — память':'Hipokampus – mälu'}</li><li>{ru?'Мозжечок — координация':'Väikeaju – koordinatsioon'}</li></ul><p>{ru?'Память, внимание, реакция и принятие решений работают как сети. Ни одна функция не находится в одной точке мозга.':'Mälu, tähelepanu, reaktsioon ja otsustamine toimivad võrgustikena. Ükski funktsioon ei asu ainult ühes ajupunktis.'}</p></div></section>

      <PathChooser lang={lang}/>

      <section className="site-guide science-topics featured-topics" aria-labelledby="science-topics-title"><div className="site-guide-heading"><p className="eyebrow">{ru?'НАУЧНЫЕ ТЕМЫ':'TEADUSTEEMAD'}</p><h2 id="science-topics-title">{ru?'Изучи научные темы':'Tutvu teadusteemadega'}</h2><p>{ru?'На отдельных страницах: что изучали, сколько было участников, что нашли и где заканчивается вывод.':'Eraldi lehtedel: mida uuriti, kui suur oli valim, mida leiti ja kus järeldus lõpeb.'}</p></div><div className="guide-grid guide-grid-four">
        <a href="acute-effects/" className="guide-card"><div className="guide-card-copy"><strong>{ru?'Рабочая память':'Töömälu'}</strong><p>{ru?'Что изменилось у взрослых в лабораторных заданиях.':'Mis muutus täiskasvanute soorituses laboriülesannetes.'}</p></div></a>
        <a href="adolescent-brain/" className="guide-card"><div className="guide-card-copy"><strong>{ru?'Подростковый мозг':'Nooruki aju'}</strong><p>{ru?'Большие выборки и ограничения причинных выводов.':'Suured valimid ja põhjuslike järelduste piirid.'}</p></div></a>
        <a href="alcohol-and-sleep/" className="guide-card"><div className="guide-card-copy"><strong>{ru?'Сон':'Uni'}</strong><p>{ru?'Почему быстро уснуть не значит лучше спать.':'Miks kiire uinumine ei tähenda paremat und.'}</p></div></a>
        <a href="alcohol-and-driving/" className="guide-card"><div className="guide-card-copy"><strong>{ru?'Вождение':'Autojuhtimine'}</strong><p>{ru?'Почему субъективное самочувствие не измеряет безопасность.':'Miks enesetunne ei mõõda ohutust.'}</p></div></a>
      </div><a className="all-topics-link" href="topics/">{ru?'Открыть все 8 научных тем':'Ava kõik 8 teadusteemat'}</a></section>

      <div className="phase-divider"><div><strong>{ru?'Изучи':'Õpi'}</strong><small>{ru?'Факты, механизмы и ограничения':'Faktid, mehhanismid ja piirangud'}</small></div></div><Brain lang={lang}/><Infographics lang={lang}/><LearningCenter lang={lang}/>
      <div className="phase-divider"><div><strong>{ru?'Попробуй':'Proovi'}</strong><small>{ru?'Учебные упражнения, не медицинские тесты':'Õppeharjutused, mitte meditsiinilised testid'}</small></div></div><Memory lang={lang}/><Attention lang={lang}/><Lab lang={lang}/>
      <div className="phase-divider"><div><strong>{ru?'Проверь':'Kontrolli'}</strong><small>{ru?'Знание и уверенность в ответе':'Teadmised ja vastuse kindlus'}</small></div></div><Section id="viktoriin" number={ru?'ПРОВЕРЬ ЗНАНИЯ':'KONTROLLI TEADMISI'} title={ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?'} intro={ru?'Сначала оцени свою уверенность. Затем выбери «миф» или «факт» и прочитай объяснение.':'Hinda esmalt oma kindlust. Seejärel vali „müüt“ või „fakt“ ja loe selgitust.'} className="quiz-section"><Quiz questions={ru?questionsRu:questions} lang={lang} onComplete={handleQuizComplete}/></Section><Reflection lang={lang}/><ActionHub lang={lang}/><ClassroomKit lang={lang}/>
      <div className="phase-divider"><div><strong>{ru?'Заверши':'Lõpeta'}</strong><small>{ru?'Выводы, обратная связь и источники':'Järeldused, tagasiside ja allikad'}</small></div></div><Closing lang={lang} summary={<FinalSummary lang={lang} quizScore={quizScore} visitedIds={[...visited]} totalSections={trackedIds.length} progressSaved={progressSaved} onSaveProgress={saveProgress} onClearSavedProgress={clearSavedProgress}/>}/>
    </main>
    {returnPoint&&<button type="button" className="reading-return" onClick={returnToReadingPlace} aria-label={ru?`Вернуться к месту: ${returnPoint.label}`:`Naase kohta: ${returnPoint.label}`}><span aria-hidden="true"/><b>{ru?'Вернуться':'Tagasi'}</b><small>{returnPoint.label}</small></button>}
    <footer className="site-footer"><div className="footer-brand"><strong>{ru?'Алкоголь и мозг':'Alkohol ja aju'}</strong><p>{ru?'Учебный сайт о мозге, фактах и безопасных решениях.':'Õppeveeb ajust, faktidest ja turvalistest valikutest.'}</p><span>v2.0 · 2026</span></div><nav aria-label={ru?'Информация о проекте':'Projekti info'}><a href="methodology/">{ru?'Методология':'Metoodika'}</a><a href="fact-check/">{ru?'Проверка фактов':'Faktikontroll'}</a><a href="data-policy/">{ru?'Данные и приватность':'Andmed ja privaatsus'}</a><a href="changelog/">Changelog</a></nav><div className="footer-support footer-support-static"><strong>{ru?'Нужна помощь?':'Vajad abi?'}</strong><a href="tel:116111">Lasteabi 116 111</a><span>{ru?'круглосуточно и бесплатно':'ööpäev läbi ja tasuta'}</span></div></footer>
  </>;
}
