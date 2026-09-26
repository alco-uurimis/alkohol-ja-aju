import { useEffect, useRef, useState } from 'react';
import Brain from './sections/Brain';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import LearningCenter, { FinalSummary } from './sections/LearningCenter';
import Closing from './sections/Closing';
import { Section } from './components/Shared';
import { Quiz } from './components/Quiz';
import { questions } from './data/content';
import { questionsRu } from './data/content.ru';

type Lang='et'|'ru';

const trackedIds=['aju','teadmised','malu','tahelepanu','labor','viktoriin','tagasiside'];
const progressKey='alkohol-ja-aju:visited-sections';

function readVisited(){
  if(typeof window==='undefined')return new Set<string>();
  try{return new Set<string>(JSON.parse(window.sessionStorage.getItem(progressKey)??'[]'));}catch{return new Set<string>();}
}

export default function App(){
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('avaleht');
  const [lang,setLang]=useState<Lang>('et');
  const [visited,setVisited]=useState<Set<string>>(readVisited);
  const [quizScore,setQuizScore]=useState<number|null>(null);
  const menuButton=useRef<HTMLButtonElement>(null);
  const ru=lang==='ru';
  const links=[
    ['aju',ru?'Как влияет алкоголь':'Alkoholi mõju'],
    ['teadmised',ru?'База знаний':'Teadusbaas'],
    ['malu',ru?'Память':'Mälu'],
    ['tahelepanu',ru?'Внимание':'Tähelepanu'],
    ['labor',ru?'Игры':'Mängud'],
    ['viktoriin',ru?'Проверка знаний':'Teadmiste kontroll'],
    ['tagasiside',ru?'Опрос':'Küsitlus'],
    ['allikad',ru?'Источники':'Allikad'],
  ];
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[lang]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const id=entry.target.id;setVisited(current=>{if(current.has(id))return current;const next=new Set(current);next.add(id);try{window.sessionStorage.setItem(progressKey,JSON.stringify([...next]));}catch{/* storage can be unavailable */}return next;});}},{threshold:.28});
    trackedIds.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  },[]);
  const switchLanguage=(next:Lang)=>{setLang(next);setMenu(false);};
  const progress=Math.round(Math.min(1,visited.size/trackedIds.length)*100);
  return <>
    <a className="skip" href="#sisu">{ru?'Перейти к содержанию':'Liigu põhisisu juurde'}</a>
    <header className="header">
      <a className="brand" href="#avaleht"><img className="brand-mark" src="logo-mark.svg" alt=""/> <span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a>
      <div className="header-actions"><div className="language-switch" role="group" aria-label={ru?'Язык':'Keel'}><button className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button><button className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button></div><button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{ru?'Меню':'Menüü'} {menu?'−':'+'}</button></div>
      <nav onKeyDown={e=>{if(e.key==='Escape'){setMenu(false);menuButton.current?.focus();}}} id="navigation" aria-label={ru?'Главное меню':'Peamenüü'} className={menu?'open':''}>{links.map(([id,name])=><a key={id} aria-current={active===id?'location':undefined} href={'#'+id} onClick={()=>setMenu(false)}>{name}</a>)}</nav>
    </header>
    <div className="learning-progress" aria-label={ru?'Прогресс по сайту':'Lehe läbimise progress'}>
      <div className="learning-progress-row"><span>{ru?'Пройденные разделы':'Läbitud osad'}</span><strong>{visited.size} / {trackedIds.length} · {progress}%</strong></div>
      <div className="learning-progress-track" aria-hidden="true"><div className="learning-progress-fill" style={{width:`${progress}%`}}/></div>
    </div>
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
        <div className="hero-visual"><div className="visual-top"><span>{ru?'ЧЕТЫРЕ ФУНКЦИИ, КОТОРЫЕ МЫ ИССЛЕДУЕМ':'NELI VÕIMET, MIDA UURIME'}</span><span aria-hidden="true">01 / 05</span></div><div className="signal" aria-hidden="true"><div className="signal-ring ring-one"/><div className="signal-ring ring-two"/><div className="signal-ring ring-three"/><span className="signal-core">{ru?'мозг':'aju'}</span><span className="signal-label label-one">{ru?'Память':'Mälu'}</span><span className="signal-label label-two">{ru?'Внимание':'Tähelepanu'}</span><span className="signal-label label-three">{ru?'Реакция':'Reaktsioon'}</span><span className="signal-label label-four">{ru?'Решения':'Otsustamine'}</span></div><p>{ru?'Каждый следующий раздел показывает одну часть общей картины.':'Iga järgmine osa näitab üht osa tervikpildist.'}</p><div className="visual-bottom"><span>{ru?'Начать с объяснения':'Alusta selgitusest'}</span><a href="#aju" aria-label={ru?'Перейти к разделу о влиянии алкоголя':'Liigu alkoholi mõju osa juurde'}>↓</a></div></div>
      </section>

      <div className="intro-strip"><span><b>01</b> {ru?'Разберись':'Mõista'}</span><span><b>02</b> {ru?'Углубись':'Süvene'}</span><span><b>03</b> {ru?'Попробуй':'Proovi'}</span><span><b>04</b> {ru?'Проверь':'Kontrolli'}</span><span><b>05</b> {ru?'Поделись мнением':'Anna tagasisidet'}</span></div>

      <section id="teejuht" className="site-guide" aria-labelledby="guide-title">
        <div className="site-guide-heading"><p className="eyebrow">{ru?'МАРШРУТ ПО САЙТУ':'LEHE TEEJUHT'}</p><h2 id="guide-title">{ru?'Что здесь делать?':'Mida siin teha?'}</h2><p>{ru?'Лучше идти по порядку: сначала разобраться в теме, затем попробовать задания и только после этого оценить материал.':'Kõige loogilisem on liikuda järjekorras: esmalt mõista teemat, siis proovida ülesandeid ja alles lõpus anda tagasisidet.'}</p></div>
        <div className="guide-grid">
          <a href="#aju" className="guide-card"><span>01</span><strong>{ru?'Понять влияние':'Mõista mõju'}</strong><p>{ru?'Разберись, какие функции мозга связаны с темой.':'Vaata, millised aju funktsioonid on teemaga seotud.'}</p><em>{ru?'Начни здесь →':'Alusta siit →'}</em></a>
          <a href="#teadmised" className="guide-card"><span>02</span><strong>{ru?'Углубиться':'Süvene'}</strong><p>{ru?'Карта мозга, глоссарий, научные уровни и мини-интерактивы.':'Ajukaart, sõnastik, teadustasemed ja miniinteraktiivid.'}</p><em>{ru?'Открыть базу →':'Ava teadusbaas →'}</em></a>
          <a href="#malu" className="guide-card"><span>03</span><strong>{ru?'Попробовать':'Proovi'}</strong><p>{ru?'Сначала память и внимание, затем три короткие игры.':'Esmalt mälu ja tähelepanu, seejärel kolm lühikest mängu.'}</p><em>{ru?'К упражнениям →':'Harjutuste juurde →'}</em></a>
          <a href="#viktoriin" className="guide-card"><span>04</span><strong>{ru?'Проверить знания':'Kontrolli teadmisi'}</strong><p>{ru?'Ответь на десять утверждений и сразу прочитай объяснения.':'Vasta kümnele väitele ja loe kohe selgitusi.'}</p><em>{ru?'Начать проверку →':'Alusta kontrolli →'}</em></a>
          <a href="#tagasiside" className="guide-card"><span>05</span><strong>{ru?'Оценить материал':'Anna tagasisidet'}</strong><p>{ru?'После прохождения сайта заполни анонимный опрос для статистики проекта.':'Pärast lehe läbimist täida projekti statistika jaoks anonüümne küsitlus.'}</p><em>{ru?'К опросу →':'Küsitluse juurde →'}</em></a>
        </div>
      </section>

      <Brain lang={lang}/><LearningCenter lang={lang}/><Memory lang={lang}/><Attention lang={lang}/><Lab lang={lang}/>
      <Section id="viktoriin" number={ru?'05 / ПРОВЕРЬ ЗНАНИЯ':'05 / KONTROLLI TEADMISI'} title={ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?'} intro={ru?'Десять утверждений о теме. Для каждого выбери «миф» или «факт», затем прочитай объяснение.':'Kümme väidet teema kohta. Vali iga väite puhul „müüt“ või „fakt“ ja loe seejärel selgitust.'} className="quiz-section"><Quiz questions={ru?questionsRu:questions} lang={lang} onComplete={setQuizScore}/></Section>
      <FinalSummary lang={lang} quizScore={quizScore} visited={visited.size} totalSections={trackedIds.length}/>
      <Closing lang={lang}/>
    </main>
    <footer>{ru?'Алкоголь и мозг':'Alkohol ja aju'} <span>{ru?'Практическая работа гимназии':'Gümnaasiumi praktiline töö'}</span></footer>
  </>;
}
