import { useEffect, useRef, useState } from 'react';
import Brain from './sections/Brain';
import Infographics from './sections/Infographics';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import LearningCenter from './sections/LearningCenter';
import Closing from './sections/Closing';
import FinalSummary from './components/FinalSummary';
import { Section } from './components/Shared';
import { Quiz } from './components/Quiz';
import { questions } from './data/content';
import { questionsRu } from './data/content.ru';

type Lang='et'|'ru';
type NavItem=[string,string];

const trackedIds=['aju','infograafika','teadmised','malu','tahelepanu','labor','viktoriin','tagasiside'];
const progressKey='alkohol-ja-aju:visited-sections';
const languageKey='alkohol-ja-aju:language';
const quizScoreKey='alkohol-ja-aju:quiz-score';

function readVisited(){
  if(typeof window==='undefined')return new Set<string>();
  try{return new Set<string>(JSON.parse(window.sessionStorage.getItem(progressKey)??'[]'));}catch{return new Set<string>();}
}

function readLanguage():Lang{
  if(typeof window==='undefined')return 'et';
  try{
    const saved=window.localStorage.getItem(languageKey);
    return saved==='ru'?'ru':'et';
  }catch{return 'et';}
}

function readQuizScore(){
  if(typeof window==='undefined')return null;
  try{
    const raw=window.sessionStorage.getItem(quizScoreKey);
    if(raw===null)return null;
    const value=Number(raw);
    return Number.isInteger(value)&&value>=0&&value<=10?value:null;
  }catch{return null;}
}

export default function App(){
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('avaleht');
  const [lang,setLang]=useState<Lang>(readLanguage);
  const [visited,setVisited]=useState<Set<string>>(readVisited);
  const [quizScore,setQuizScore]=useState<number|null>(readQuizScore);
  const [showTop,setShowTop]=useState(false);
  const menuButton=useRef<HTMLButtonElement>(null);
  const ru=lang==='ru';

  const navGroups:{label:string;items:NavItem[]}[]=[
    {label:ru?'ИЗУЧИ':'ÕPI',items:[
      ['aju',ru?'Как влияет алкоголь':'Alkoholi mõju'],
      ['infograafika',ru?'Коротко в схемах':'Lühidalt skeemides'],
      ['teadmised',ru?'Научная база':'Teadusbaas'],
    ]},
    {label:ru?'ПОПРОБУЙ':'PROOVI',items:[
      ['malu',ru?'Память':'Mälu'],
      ['tahelepanu',ru?'Внимание':'Tähelepanu'],
      ['labor',ru?'Мини-игры':'Minimängud'],
    ]},
    {label:ru?'ПРОВЕРЬ':'KONTROLLI',items:[
      ['viktoriin',ru?'Проверка знаний':'Teadmiste kontroll'],
    ]},
    {label:ru?'ЗАВЕРШИ':'LÕPETA',items:[
      ['tagasiside',ru?'Опрос':'Küsitlus'],
      ['isiklik-kokkuvote',ru?'Твой итог':'Sinu kokkuvõte'],
      ['allikad',ru?'Источники':'Allikad'],
    ]},
  ];
  const links=navGroups.flatMap(group=>group.items);
  const currentPhase=navGroups.find(group=>group.items.some(([id])=>id===active))?.label ?? (ru?'НАЧАЛО':'ALGUS');

  useEffect(()=>{
    document.documentElement.lang=lang;
    try{window.localStorage.setItem(languageKey,lang);}catch{/* storage can be unavailable */}
    document.title=ru?'Алкоголь и мозг — память, внимание и реакция':'Alkohol ja aju — mälu, tähelepanu ja reaktsioon';
    const description=ru?'Учебный сайт о влиянии алкоголя на мозг: научная база, упражнения, мини-игры, проверка знаний и источники.':'Õppematerjal alkoholi mõjust ajule: teadusbaas, harjutused, minimängud, teadmiste kontroll ja allikad.';
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
  },[lang,ru]);

  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
    },{rootMargin:'-18% 0px -68% 0px'});
    links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  },[lang]);

  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        const id=entry.target.id;
        setVisited(current=>{
          if(current.has(id))return current;
          const next=new Set(current);next.add(id);
          try{window.sessionStorage.setItem(progressKey,JSON.stringify([...next]));}catch{/* storage can be unavailable */}
          return next;
        });
      }
    },{threshold:.28});
    trackedIds.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(!menu)return;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){
        setMenu(false);
        window.requestAnimationFrame(()=>menuButton.current?.focus());
      }
    };
    const onResize=()=>{if(window.innerWidth>1100)setMenu(false);};
    window.addEventListener('keydown',onKey);
    window.addEventListener('resize',onResize,{passive:true});
    return()=>{
      document.body.style.overflow=previousOverflow;
      window.removeEventListener('keydown',onKey);
      window.removeEventListener('resize',onResize);
    };
  },[menu]);

  useEffect(()=>{
    const sync=()=>setShowTop(window.scrollY>900);
    sync();
    window.addEventListener('scroll',sync,{passive:true});
    return()=>window.removeEventListener('scroll',sync);
  },[]);

  const switchLanguage=(next:Lang)=>{setLang(next);setMenu(false);};
  const goTop=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  const handleQuizComplete=(score:number)=>{
    setQuizScore(score);
    try{window.sessionStorage.setItem(quizScoreKey,String(score));}catch{/* storage can be unavailable */}
  };

  return <>
    <a className="skip" href="#sisu">{ru?'Перейти к содержанию':'Liigu põhisisu juurde'}</a>
    <header className="header">
      <a className="brand" href="#avaleht" onClick={()=>setMenu(false)}><img className="brand-mark" src="logo-mark.svg" alt=""/><span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a>
      <div className="header-context" aria-hidden="true"><span>{currentPhase}</span></div>
      <div className="header-actions">
        <div className="language-switch" role="group" aria-label={ru?'Язык':'Keel'}>
          <button type="button" className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button>
          <button type="button" className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button>
        </div>
        <button type="button" ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" aria-label={menu?(ru?'Закрыть меню':'Sulge menüü'):(ru?'Открыть меню':'Ava menüü')} onClick={()=>setMenu(v=>!v)}>{ru?'Меню':'Menüü'}<span aria-hidden="true">{menu?'×':'☰'}</span></button>
      </div>
      <nav id="navigation" aria-label={ru?'Главное меню':'Peamenüü'} className={menu?'open':''}>
        <div className="nav-groups">
          {navGroups.map(group=><div className="nav-group" key={group.label}><span className="nav-group-label">{group.label}</span>{group.items.map(([id,name])=><a key={id} aria-current={active===id?'location':undefined} href={'#'+id} onClick={()=>setMenu(false)}>{name}<span aria-hidden="true">→</span></a>)}</div>)}
        </div>
      </nav>
      <div className="header-progress" aria-label={ru?`Изучено этапов: ${visited.size} из ${trackedIds.length}`:`Läbitud etappe: ${visited.size} / ${trackedIds.length}`}>
        <span className="header-progress-label">{currentPhase} · {visited.size}/{trackedIds.length}</span>
        <div className="header-progress-track" aria-hidden="true"/>
      </div>
    </header>

    <main id="sisu" tabIndex={-1}>
      <section id="avaleht" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{ru?'УЧЕБНЫЙ МАРШРУТ: ОТ ФАКТОВ К ПРАКТИКЕ':'ÕPPERADA: FAKTIDEST PRAKTIKANI'}</p>
          <h1>{ru?'Алкоголь':'Alkohol'}<br/>{ru?'и ':'ja '}<span>{ru?'мозг.':'aju.'}</span></h1>
          <h2>{ru?'Пойми влияние, попробуй задания и проверь знания.':'Mõista mõju, proovi ülesandeid ja kontrolli teadmisi.'}</h2>
          <p>{ru?'Сайт устроен как последовательный маршрут из четырёх этапов. Можно идти по порядку или открыть нужный раздел через меню.':'Leht on üles ehitatud nelja järjestikuse etapina. Võid liikuda järjekorras või avada vajaliku osa menüüst.'}</p>
          <div className="actions"><a className="button primary" href="#teejuht">{ru?'Показать маршрут':'Vaata teekonda'}<span aria-hidden="true">↓</span></a><a className="text-link" href="#aju">{ru?'Сразу начать':'Alusta kohe'}<span aria-hidden="true">→</span></a></div>
          <div className="hero-facts" aria-label={ru?'Структура сайта':'Lehe struktuur'}><span><b>01</b>{ru?'Изучи':'Õpi'}</span><span><b>02</b>{ru?'Попробуй':'Proovi'}</span><span><b>03</b>{ru?'Проверь':'Kontrolli'}</span><span><b>04</b>{ru?'Заверши':'Lõpeta'}</span></div>
          <p className="hero-note">{ru?'Учебный материал · упражнения не являются медицинской оценкой':'Õppematerjal · harjutused ei ole tervisehinnang'}</p>
        </div>
        <div className="hero-visual"><div className="visual-top"><span>{ru?'ЧЕТЫРЕ ФУНКЦИИ':'NELI FUNKTSIOONI'}</span><span>{ru?'МОЗГ':'AJU'}</span></div><div className="signal brain-photo-hero" aria-label={ru?'Фотография человеческого мозга с подписями функций':'Inimaju foto koos funktsioonide siltidega'}><span className="signal-label label-one">{ru?'Память':'Mälu'}</span><span className="signal-label label-two">{ru?'Внимание':'Tähelepanu'}</span><span className="signal-label label-three">{ru?'Реакция':'Reaktsioon'}</span><span className="signal-label label-four">{ru?'Решения':'Otsustamine'}</span></div><p>{ru?'Эти функции работают вместе. Дальше сайт показывает, как алкоголь может быть с ними связан.':'Need funktsioonid töötavad koos. Edasi näitab leht, kuidas alkohol võib nendega seotud olla.'}</p><div className="visual-bottom"><span>{ru?'Начать с влияния алкоголя':'Alusta alkoholi mõjust'}</span><a href="#aju" aria-label={ru?'Перейти к разделу о влиянии алкоголя':'Liigu alkoholi mõju osa juurde'}>↓</a></div></div>
      </section>

      <section id="teejuht" className="site-guide" aria-labelledby="guide-title">
        <div className="site-guide-heading"><p className="eyebrow">{ru?'КАК УСТРОЕН САЙТ':'KUIDAS LEHT TÖÖTAB'}</p><h2 id="guide-title">{ru?'Четыре понятных этапа':'Neli selget etappi'}</h2><p>{ru?'Каждый этап имеет одну задачу. Для полного прохождения двигайся слева направо; для быстрого доступа нажми на нужную карточку.':'Igal etapil on üks eesmärk. Täielikuks läbimiseks liigu vasakult paremale; kiireks ligipääsuks vali sobiv kaart.'}</p></div>
        <div className="guide-grid guide-grid-four">
          <a href="#aju" className="guide-card"><span>01</span><div className="guide-card-copy"><strong>{ru?'Изучи':'Õpi'}</strong><p>{ru?'Влияние алкоголя, две инфографики и научная база.':'Alkoholi mõju, kaks infograafikut ja teadusbaas.'}</p><small>{ru?'Разделы 01–03':'Osad 01–03'}</small></div><em>{ru?'Начать →':'Alusta →'}</em></a>
          <a href="#malu" className="guide-card"><span>02</span><div className="guide-card-copy"><strong>{ru?'Попробуй':'Proovi'}</strong><p>{ru?'Упражнения на память и внимание плюс три мини-игры.':'Mälu- ja tähelepanuharjutused ning kolm minimängu.'}</p><small>{ru?'Разделы 04–06':'Osad 04–06'}</small></div><em>{ru?'К практике →':'Praktikasse →'}</em></a>
          <a href="#viktoriin" className="guide-card"><span>03</span><div className="guide-card-copy"><strong>{ru?'Проверь':'Kontrolli'}</strong><p>{ru?'Десять утверждений «миф или факт» с объяснениями.':'Kümme „müüt või fakt“ väidet koos selgitustega.'}</p><small>{ru?'Раздел 07':'Osa 07'}</small></div><em>{ru?'Проверить →':'Kontrolli →'}</em></a>
          <a href="#meelespea" className="guide-card"><span>04</span><div className="guide-card-copy"><strong>{ru?'Заверши':'Lõpeta'}</strong><p>{ru?'Ключевые выводы, опрос, итог прохождения и источники.':'Põhijäreldused, küsitlus, kokkuvõte ja allikad.'}</p><small>{ru?'Разделы 08–12':'Osad 08–12'}</small></div><em>{ru?'К финалу →':'Lõppu →'}</em></a>
        </div>
      </section>

      <div className="phase-divider"><span>01</span><div><strong>{ru?'Изучи тему':'Õpi teemat'}</strong><small>{ru?'Сначала факты и объяснения':'Esmalt faktid ja selgitused'}</small></div></div>
      <Brain lang={lang}/>
      <Infographics lang={lang}/>
      <LearningCenter lang={lang}/>

      <div className="phase-divider"><span>02</span><div><strong>{ru?'Попробуй на практике':'Proovi praktikas'}</strong><small>{ru?'Учебные упражнения и игры':'Õppeharjutused ja mängud'}</small></div></div>
      <Memory lang={lang}/>
      <Attention lang={lang}/>
      <Lab lang={lang}/>

      <div className="phase-divider"><span>03</span><div><strong>{ru?'Проверь знания':'Kontrolli teadmisi'}</strong><small>{ru?'Миф или факт — 10 вопросов':'Müüt või fakt — 10 küsimust'}</small></div></div>
      <Section id="viktoriin" number={ru?'ПРОВЕРЬ ЗНАНИЯ':'KONTROLLI TEADMISI'} title={ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?'} intro={ru?'Для каждого утверждения выбери «миф» или «факт». После ответа сразу появится короткое объяснение.':'Vali iga väite puhul „müüt“ või „fakt“. Pärast vastust näed kohe lühikest selgitust.'} className="quiz-section"><Quiz questions={ru?questionsRu:questions} lang={lang} onComplete={handleQuizComplete}/></Section>

      <div className="phase-divider"><span>04</span><div><strong>{ru?'Заверши маршрут':'Lõpeta teekond'}</strong><small>{ru?'Выводы, обратная связь и итог':'Järeldused, tagasiside ja kokkuvõte'}</small></div></div>
      <Closing lang={lang} summary={<FinalSummary lang={lang} quizScore={quizScore} visitedIds={[...visited]} totalSections={trackedIds.length}/>}/>
    </main>

    <footer>{ru?'Алкоголь и мозг':'Alkohol ja aju'}<span>{ru?'Практическая работа гимназии':'Gümnaasiumi praktiline töö'}</span></footer>
    <button type="button" className={'back-to-top '+(showTop?'visible':'')} tabIndex={showTop?0:-1} aria-hidden={!showTop} aria-label={ru?'Наверх страницы':'Lehe algusesse'} onClick={goTop}><span aria-hidden="true">↑</span></button>
  </>;
}
