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
  const links=[
    ['aju',ru?'Как влияет алкоголь':'Alkoholi mõju'],
    ['infograafika',ru?'Инфографика':'Infograafika'],
    ['teadmised',ru?'База знаний':'Teadusbaas'],
    ['malu',ru?'Память':'Mälu'],
    ['tahelepanu',ru?'Внимание':'Tähelepanu'],
    ['labor',ru?'Игры':'Mängud'],
    ['viktoriin',ru?'Проверка знаний':'Teadmiste kontroll'],
    ['tagasiside',ru?'Опрос':'Küsitlus'],
    ['allikad',ru?'Источники':'Allikad'],
  ];

  useEffect(()=>{
    document.documentElement.lang=lang;
    try{window.localStorage.setItem(languageKey,lang);}catch{/* storage can be unavailable */}
    document.title=ru?'Алкоголь и мозг — память, внимание и реакция':'Alkohol ja aju — mälu, tähelepanu ja reaktsioon';
    const description=ru?'Учебный сайт о влиянии алкоголя на мозг: память, внимание, реакция, научные источники, упражнения и мини-игры.':'Õppematerjal alkoholi mõjust ajule: mälu, tähelepanu, reaktsioon, teadusallikad, harjutused ja minimängud.';
    document.querySelector('meta[name="description"]')?.setAttribute('content',description);
  },[lang,ru]);

  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);
    },{rootMargin:'-15% 0px -65% 0px'});
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
      <a className="brand" href="#avaleht" onClick={()=>setMenu(false)}><img className="brand-mark" src="logo-mark.svg" alt=""/> <span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a>
      <div className="header-actions">
        <div className="language-switch" role="group" aria-label={ru?'Язык':'Keel'}>
          <button type="button" className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button>
          <button type="button" className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button>
        </div>
        <button type="button" ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" aria-label={menu?(ru?'Закрыть меню':'Sulge menüü'):(ru?'Открыть меню':'Ava menüü')} onClick={()=>setMenu(v=>!v)}>{ru?'Меню':'Menüü'} <span aria-hidden="true">{menu?'−':'+'}</span></button>
      </div>
      <nav id="navigation" aria-label={ru?'Главное меню':'Peamenüü'} className={menu?'open':''}>{links.map(([id,name])=><a key={id} aria-current={active===id?'location':undefined} href={'#'+id} onClick={()=>setMenu(false)}>{name}</a>)}</nav>
      <div className="header-progress" aria-label={ru?`Изучено этапов: ${visited.size} из ${trackedIds.length}`:`Läbitud etappe: ${visited.size} / ${trackedIds.length}`}>
        <span className="header-progress-label">{ru?'Изучено':'Läbitud'} · {visited.size}/{trackedIds.length}</span>
        <div className="header-progress-track" aria-hidden="true"/>
      </div>
    </header>

    <main id="sisu" tabIndex={-1}>
      <section id="avaleht" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{ru?'ПОНЯТНО О ТОМ, КАК АЛКОГОЛЬ ВЛИЯЕТ НА МОЗГ':'SELGELT ALKOHOLI MÕJUST AJULE'}</p>
          <h1>{ru?'Алкоголь':'Alkohol'}<br/>{ru?'и ':'ja '}<span>{ru?'мозг.':'aju.'}</span></h1>
          <h2>{ru?'Как алкоголь связан с памятью, вниманием и скоростью реакции?':'Kuidas on alkohol seotud mälu, tähelepanu ja reaktsioonikiirusega?'}</h2>
          <p>{ru?'Сначала разберись в основных эффектах и научной базе, затем попробуй короткие задания и игры. В конце проверь знания и заполни анонимный опрос.':'Kõigepealt tutvu peamiste mõjude ja teadusliku alusega, seejärel proovi lühikesi harjutusi ja mänge. Lõpus kontrolli teadmisi ning täida anonüümne küsitlus.'}</p>
          <div className="actions"><a className="button primary" href="#teejuht">{ru?'Как пользоваться сайтом':'Kuidas lehte kasutada'} <span aria-hidden="true">↓</span></a><a className="text-link" href="#teadmised">{ru?'К базе знаний':'Teadusbaasi juurde'} <span aria-hidden="true">→</span></a></div>
          <p className="hero-note">{ru?'Учебный материал для старшеклассников · результаты заданий не являются медицинской оценкой':'Õppematerjal gümnaasiumiõpilasele · harjutuste tulemused ei ole tervisehinnang'}</p>
        </div>
        <div className="hero-visual"><div className="visual-top"><span>{ru?'ЧЕТЫРЕ ФУНКЦИИ, КОТОРЫЕ МЫ ИССЛЕДУЕМ':'NELI VÕIMET, MIDA UURIME'}</span><span>{ru?'СТАРТ':'ALGUS'}</span></div><div className="signal brain-photo-hero" aria-label={ru?'Фотография человеческого мозга с подписями функций':'Inimaju foto koos funktsioonide siltidega'}><span className="signal-label label-one">{ru?'Память':'Mälu'}</span><span className="signal-label label-two">{ru?'Внимание':'Tähelepanu'}</span><span className="signal-label label-three">{ru?'Реакция':'Reaktsioon'}</span><span className="signal-label label-four">{ru?'Решения':'Otsustamine'}</span></div><p>{ru?'Каждый следующий раздел показывает одну часть общей картины.':'Iga järgmine osa näitab üht osa tervikpildist.'}</p><div className="visual-bottom"><span>{ru?'Начать с объяснения':'Alusta selgitusest'}</span><a href="#aju" aria-label={ru?'Перейти к разделу о влиянии алкоголя':'Liigu alkoholi mõju osa juurde'}>↓</a></div></div>
      </section>

      <div className="intro-strip"><span><b>01</b> {ru?'Разберись':'Mõista'}</span><span><b>02</b> {ru?'Углубись':'Süvene'}</span><span><b>03</b> {ru?'Попробуй':'Proovi'}</span><span><b>04</b> {ru?'Проверь':'Kontrolli'}</span><span><b>05</b> {ru?'Поделись мнением':'Anna tagasisidet'}</span></div>

      <section id="teejuht" className="site-guide" aria-labelledby="guide-title">
        <div className="site-guide-heading"><p className="eyebrow">{ru?'МАРШРУТ ПО САЙТУ':'LEHE TEEJUHT'}</p><h2 id="guide-title">{ru?'Что здесь делать?':'Mida siin teha?'}</h2><p>{ru?'Лучше идти по порядку: сначала разобраться в теме, затем попробовать задания и только после этого оценить материал.':'Kõige loogilisem on liikuda järjekorras: esmalt mõista teemat, siis proovida ülesandeid ja alles lõpus anda tagasisidet.'}</p></div>
        <div className="guide-grid">
          <a href="#aju" className="guide-card"><span>01</span><strong>{ru?'Понять влияние':'Mõista mõju'}</strong><p>{ru?'Разберись, какие функции мозга связаны с темой.':'Vaata, millised aju funktsioonid on teemaga seotud.'}</p><em>{ru?'Начни здесь →':'Alusta siit →'}</em></a>
          <a href="#teadmised" className="guide-card"><span>02</span><strong>{ru?'Углубиться':'Süvene'}</strong><p>{ru?'Инфографика, карта мозга, глоссарий, научные уровни и мини-интерактивы.':'Infograafika, ajukaart, sõnastik, teadustasemed ja miniinteraktiivid.'}</p><em>{ru?'Открыть базу →':'Ava teadusbaas →'}</em></a>
          <a href="#malu" className="guide-card"><span>03</span><strong>{ru?'Попробовать':'Proovi'}</strong><p>{ru?'Сначала память и внимание, затем три короткие игры.':'Esmalt mälu ja tähelepanu, seejärel kolm lühikest mängu.'}</p><em>{ru?'К упражнениям →':'Harjutuste juurde →'}</em></a>
          <a href="#viktoriin" className="guide-card"><span>04</span><strong>{ru?'Проверить знания':'Kontrolli teadmisi'}</strong><p>{ru?'Ответь на десять утверждений и сразу прочитай объяснения.':'Vasta kümnele väitele ja loe kohe selgitusi.'}</p><em>{ru?'Начать проверку →':'Alusta kontrolli →'}</em></a>
          <a href="#tagasiside" className="guide-card"><span>05</span><strong>{ru?'Оценить материал':'Anna tagasisidet'}</strong><p>{ru?'После прохождения сайта заполни анонимный опрос для статистики проекта.':'Pärast lehe läbimist täida projekti statistika jaoks anonüümne küsitlus.'}</p><em>{ru?'К опросу →':'Küsitluse juurde →'}</em></a>
        </div>
      </section>

      <Brain lang={lang}/>
      <Infographics lang={lang}/>
      <LearningCenter lang={lang}/>
      <Memory lang={lang}/>
      <Attention lang={lang}/>
      <Lab lang={lang}/>
      <Section id="viktoriin" number={ru?'05 / ПРОВЕРЬ ЗНАНИЯ':'05 / KONTROLLI TEADMISI'} title={ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?'} intro={ru?'Десять утверждений о теме. Для каждого выбери «миф» или «факт», затем прочитай объяснение.':'Kümme väidet teema kohta. Vali iga väite puhul „müüt“ või „fakt“ ja loe seejärel selgitust.'} className="quiz-section"><Quiz questions={ru?questionsRu:questions} lang={lang} onComplete={handleQuizComplete}/></Section>
      <Closing lang={lang} summary={<FinalSummary lang={lang} quizScore={quizScore} visitedIds={[...visited]} totalSections={trackedIds.length}/>}/>
    </main>

    <footer>{ru?'Алкоголь и мозг':'Alkohol ja aju'} <span>{ru?'Практическая работа гимназии':'Gümnaasiumi praktiline töö'}</span></footer>
    <button type="button" className={'back-to-top '+(showTop?'visible':'')} tabIndex={showTop?0:-1} aria-hidden={!showTop} aria-label={ru?'Наверх страницы':'Lehe algusesse'} onClick={goTop}><span aria-hidden="true">↑</span></button>
  </>;
}
