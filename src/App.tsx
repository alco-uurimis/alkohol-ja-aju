import { useEffect, useRef, useState } from 'react';
import Brain from './sections/Brain';
import Memory from './sections/Memory';
import Attention from './sections/Attention';
import Lab from './sections/Lab';
import Closing from './sections/Closing';
import { Section } from './components/Shared';
import { Quiz } from './components/Quiz';
import { questions } from './data/content';
import { questionsRu } from './data/content.ru';

type Lang='et'|'ru';

export default function App(){
  const [menu,setMenu]=useState(false);
  const [active,setActive]=useState('avaleht');
  const [lang,setLang]=useState<Lang>('et');
  const menuButton=useRef<HTMLButtonElement>(null);
  const ru=lang==='ru';
  const links=[
    ['aju',ru?'Как влияет алкоголь':'Alkoholi mõju'],
    ['malu',ru?'Память':'Mälu'],
    ['tahelepanu',ru?'Внимание':'Tähelepanu'],
    ['labor',ru?'Игры':'Mängud'],
    ['viktoriin',ru?'Проверка знаний':'Teadmiste kontroll'],
    ['tagasiside',ru?'Опрос':'Küsitlus'],
    ['allikad',ru?'Источники':'Allikad'],
  ];
  useEffect(()=>{document.documentElement.lang=lang;},[lang]);
  useEffect(()=>{const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.id);},{rootMargin:'-15% 0px -65% 0px'});links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});return()=>observer.disconnect();},[lang]);
  const switchLanguage=(next:Lang)=>{setLang(next);setMenu(false);};
  return <>
    <a className="skip" href="#sisu">{ru?'Перейти к содержанию':'Liigu põhisisu juurde'}</a>
    <header className="header">
      <a className="brand" href="#avaleht"><img className="brand-mark" src="logo-mark.svg" alt=""/> <span>{ru?'алкоголь и мозг':'alkohol ja aju'}</span></a>
      <div className="header-actions"><div className="language-switch" role="group" aria-label={ru?'Язык':'Keel'}><button className={lang==='et'?'active':''} aria-pressed={lang==='et'} onClick={()=>switchLanguage('et')}>ET</button><button className={lang==='ru'?'active':''} aria-pressed={lang==='ru'} onClick={()=>switchLanguage('ru')}>RU</button></div><button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={()=>setMenu(!menu)}>{ru?'Меню':'Menüü'} {menu?'−':'+'}</button></div>
      <nav onKeyDown={e=>{if(e.key==='Escape'){setMenu(false);menuButton.current?.focus();}}} id="navigation" aria-label={ru?'Главное меню':'Peamenüü'} className={menu?'open':''}>{links.map(([id,name])=><a key={id} aria-current={active===id?'location':undefined} href={'#'+id} onClick={()=>setMenu(false)}>{name}</a>)}</nav>
    </header>
    <main id="sisu" tabIndex={-1}>
      <section id="avaleht" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{ru?'ПОНЯТНО О ТОМ, КАК АЛКОГОЛЬ ВЛИЯЕТ НА МОЗГ':'SELGELT ALKOHOLI MÕJUST AJULE'}</p>
          <h1>{ru?'Алкоголь':'Alkohol'}<br/>{ru?'и ':'ja '}<span>{ru?'мозг.':'aju.'}</span></h1>
          <h2>{ru?'Как алкоголь связан с памятью, вниманием и скоростью реакции?':'Kuidas on alkohol seotud mälu, tähelepanu ja reaktsioonikiirusega?'}</h2>
          <p>{ru?'Сначала разберись в основных эффектах, затем попробуй короткие задания и игры. В конце проверь знания и заполни анонимный опрос.':'Kõigepealt tutvu peamiste mõjudega, seejärel proovi lühikesi harjutusi ja mänge. Lõpus kontrolli teadmisi ning täida anonüümne küsitlus.'}</p>
          <div className="actions"><a className="button primary" href="#teejuht">{ru?'Как пользоваться сайтом':'Kuidas lehte kasutada'} <span aria-hidden="true">↓</span></a><a className="text-link" href="#aju">{ru?'Сразу к теме':'Mine kohe teema juurde'} <span aria-hidden="true">→</span></a></div>
          <p className="hero-note">{ru?'Учебный материал для старшеклассников · результаты заданий не являются медицинской оценкой':'Õppematerjal gümnaasiumiõpilasele · harjutuste tulemused ei ole tervisehinnang'}</p>
        </div>
        <div className="hero-visual"><div className="visual-top"><span>{ru?'ЧЕТЫРЕ ФУНКЦИИ, КОТОРЫЕ МЫ ИССЛЕДУЕМ':'NELI VÕIMET, MIDA UURIME'}</span><span aria-hidden="true">01 / 05</span></div><div className="signal" aria-hidden="true"><div className="signal-ring ring-one"/><div className="signal-ring ring-two"/><div className="signal-ring ring-three"/><span className="signal-core">{ru?'мозг':'aju'}</span><span className="signal-label label-one">{ru?'Память':'Mälu'}</span><span className="signal-label label-two">{ru?'Внимание':'Tähelepanu'}</span><span className="signal-label label-three">{ru?'Реакция':'Reaktsioon'}</span><span className="signal-label label-four">{ru?'Решения':'Otsustamine'}</span></div><p>{ru?'Каждый следующий раздел показывает одну часть общей картины.':'Iga järgmine osa näitab üht osa tervikpildist.'}</p><div className="visual-bottom"><span>{ru?'Начать с объяснения':'Alusta selgitusest'}</span><a href="#aju" aria-label={ru?'Перейти к разделу о влиянии алкоголя':'Liigu alkoholi mõju osa juurde'}>↓</a></div></div>
      </section>

      <div className="intro-strip"><span><b>01</b> {ru?'Разберись':'Mõista'}</span><span><b>02</b> {ru?'Попробуй':'Proovi'}</span><span><b>03</b> {ru?'Проверь':'Kontrolli'}</span><span><b>04</b> {ru?'Поделись мнением':'Anna tagasisidet'}</span></div>

      <section id="teejuht" className="site-guide" aria-labelledby="guide-title">
        <div className="site-guide-heading"><p className="eyebrow">{ru?'МАРШРУТ ПО САЙТУ':'LEHE TEEJUHT'}</p><h2 id="guide-title">{ru?'Что здесь делать?':'Mida siin teha?'}</h2><p>{ru?'Можно идти по порядку — это займёт примерно несколько коротких этапов. Или сразу открыть нужный раздел.':'Võid liikuda järjekorras või avada kohe selle osa, mis sind huvitab.'}</p></div>
        <div className="guide-grid">
          <a href="#aju" className="guide-card"><span>01</span><strong>{ru?'Понять влияние':'Mõista mõju'}</strong><p>{ru?'Коротко разберись, какие функции мозга связаны с темой.':'Vaata lühidalt, millised aju funktsioonid on teemaga seotud.'}</p><em>{ru?'Начни здесь →':'Alusta siit →'}</em></a>
          <a href="#malu" className="guide-card"><span>02</span><strong>{ru?'Попробовать задания':'Proovi harjutusi'}</strong><p>{ru?'Проверь память и внимание в двух отдельных упражнениях.':'Proovi eraldi mälu- ja tähelepanuharjutust.'}</p><em>{ru?'Перейти к памяти →':'Mine mälu juurde →'}</em></a>
          <a href="#labor" className="guide-card"><span>03</span><strong>{ru?'Поиграть':'Mängi'}</strong><p>{ru?'Три коротких игры: реакция, Stroop и последовательность сигналов.':'Kolm lühikest mängu: reaktsioon, Stroop ja signaalijada.'}</p><em>{ru?'Открыть игры →':'Ava mängud →'}</em></a>
          <a href="#viktoriin" className="guide-card"><span>04</span><strong>{ru?'Проверить знания':'Kontrolli teadmisi'}</strong><p>{ru?'Ответь на восемь утверждений и сразу прочитай объяснения.':'Vasta kaheksale väitele ja loe kohe selgitusi.'}</p><em>{ru?'Начать проверку →':'Alusta kontrolli →'}</em></a>
        </div>
      </section>

      <Brain lang={lang}/><Memory lang={lang}/><Attention lang={lang}/><Lab lang={lang}/>
      <Section id="viktoriin" number={ru?'05 / ПРОВЕРЬ ЗНАНИЯ':'05 / KONTROLLI TEADMISI'} title={ru?'Что ты запомнил(а)?':'Mida sa meelde jätsid?'} intro={ru?'Восемь утверждений о теме. Для каждого выбери «миф» или «факт», затем прочитай объяснение.':'Kaheksa väidet teema kohta. Vali iga väite puhul „müüt“ või „fakt“ ja loe seejärel selgitust.'} className="quiz-section"><Quiz questions={ru?questionsRu:questions} lang={lang}/></Section>
      <Closing lang={lang}/>
    </main>
    <footer>{ru?'Алкоголь и мозг':'Alkohol ja aju'} <span>{ru?'Практическая работа гимназии':'Gümnaasiumi praktiline töö'}</span></footer>
  </>;
}
