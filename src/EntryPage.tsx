import { useEffect, useState } from 'react';
import { Quiz } from './components/Quiz';
import { ProgressBar } from './components/Shared';
import { questions } from './data/content';
import { questionsRu } from './data/content.ru';
import { useStageFocus } from './hooks/useStageFocus';
import './entry-pages.css';

type Lang = 'et' | 'ru';
type Page = 'start' | 'teacher' | 'help';
const languageKey = 'alkohol-ja-aju:language';

function initialLanguage(): Lang {
  const requested = new URLSearchParams(location.search).get('lang');
  if (requested === 'ru' || requested === 'et') return requested;
  try { return localStorage.getItem(languageKey) === 'ru' ? 'ru' : 'et'; }
  catch { return 'et'; }
}

function BrainOverview({ ru }: { ru: boolean }) {
  return <>
    <figure className="lesson-brain">
      <img width="1024" height="731" src="../brain-anatomy.svg" alt={ru ? 'Вид мозга сбоку. Цвета выделяют области коры.' : 'Aju külgvaade. Värvid tähistavad ajukoore piirkondi.'} />
      <figcaption>{ru ? 'Память, внимание и решения зависят от работы связанных областей мозга.' : 'Mälu, tähelepanu ja otsused sõltuvad omavahel seotud ajupiirkondadest.'} <a href="https://commons.wikimedia.org/wiki/File:Lobes_of_the_brain_NL.svg">Henry Vandyke Carter / Mysid · Wikimedia Commons</a></figcaption>
    </figure>
    <ul className="lesson-facts">
      <li><strong>{ru ? 'Память' : 'Mälu'}</strong><p>{ru ? 'Человек может оставаться в сознании, пока новые воспоминания формируются плохо. Так бывает при алкогольном провале памяти.' : 'Inimene võib olla teadvusel, kuigi uued mälestused talletuvad halvasti. Nii võib juhtuda alkoholist tingitud mälulünga ajal.'} <a href="../memory-blackouts/">{ru ? 'Подробнее и источник' : 'Loe lähemalt ja vaata allikat'}</a></p></li>
      <li><strong>{ru ? 'Внимание и реакция' : 'Tähelepanu ja reaktsioon'}</strong><p>{ru ? 'Алкоголь может затруднить распределение внимания и замедлить реакцию. Самочувствие не даёт надёжной оценки способности вести машину.' : 'Alkohol võib raskendada tähelepanu jagamist ja aeglustada reaktsiooni. Enesetunne ei näita usaldusväärselt juhtimisvõimet.'} <a href="../alcohol-and-driving/">{ru ? 'Подробнее и источник' : 'Loe lähemalt ja vaata allikat'}</a></p></li>
      <li><strong>{ru ? 'Границы вывода' : 'Järelduse piirid'}</strong><p>{ru ? 'Метаанализ показал ухудшение рабочей памяти в среднем у взрослых в лаборатории. Он не предсказывает результат конкретного человека.' : 'Metaanalüüsis halvenes täiskasvanute töömälu laboritingimustes keskmiselt. See ei ennusta ühe inimese tulemust.'} <a href="../acute-effects/">{ru ? 'Посмотреть исследование' : 'Vaata uuringut'}</a></p></li>
    </ul>
  </>;
}

function Evidence({ ru }: { ru: boolean }) {
  return <>
    <p>{ru ? 'Spinola и соавторы объединили 32 исследования с 1 629 участниками. Они сравнили рабочую память после введения алкоголя и в контрольных условиях.' : 'Spinola ja kaasautorid koondasid 32 uuringut 1629 osalejaga. Nad võrdlesid töömälu pärast alkoholi manustamist ja kontrolltingimustes.'}</p>
    <p>{ru ? 'В среднем задания выполнялись хуже, особенно когда информацию требовалось удерживать и преобразовывать. Результат зависел от типа задания и дозы.' : 'Keskmiselt halvenes ülesannete sooritus, eriti kui infot tuli meeles hoida ja töödelda. Tulemus sõltus ülesandest ja annusest.'}</p>
    <details><summary>{ru ? 'Что значит «небольшой–умеренный эффект»?' : 'Mida tähendab „väike kuni mõõdukas mõju“?'}</summary><p>{ru ? 'В метаанализе разница между условиями составила примерно 0,3 стандартного отклонения (g = −0,30). Это мера средней разницы по разным заданиям. Она не означает снижение памяти на 30%.' : 'Metaanalüüsis erinesid tingimused ligikaudu 0,3 standardhälbe võrra (g = −0,30). See mõõdab keskmist erinevust eri ülesannetes. See ei tähenda mälu halvenemist 30% võrra.'}</p></details>
    <p>{ru ? "Запиши, что сравнивали и как измеряли рабочую память. Затем открой карточку источника и проверь свой ответ." : "Pane kirja, mida võrreldi ja kuidas töömälu mõõdeti. Seejärel ava uuringukaart ja kontrolli oma vastust."}</p>
    <p><strong>{ru ? 'Граница вывода' : 'Järelduse piir'}</strong> — {ru ? 'измеряли выполнение задач взрослыми в контролируемых условиях. В исследовании нельзя найти оценку состояния отдельного подростка.' : 'mõõdeti täiskasvanute sooritust kontrollitud tingimustes. Sellest ei saa hinnata üksiku nooruki seisundit.'}</p>
    <a href="../acute-effects/">{ru ? 'Карточка исследования и оригинал' : 'Uuringukaart ja originaalallikas'}</a>
  </>;
}

function InterpretationExercise({ ru, onChoice }: { ru: boolean; onChoice: (correct: boolean) => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const options = ru
    ? ['Алкоголь сам по себе объясняет разницу.', 'Разница может быть связана с несколькими факторами.', 'По результату можно определить состояние каждого.']
    : ['Erinevust selgitab üksnes alkohol.', 'Erinevus võib olla seotud mitme teguriga.', 'Tulemuse järgi saab hinnata iga inimese seisundit.'];
  return <>
    <p>{ru ? 'Две группы выполнили задание на память. Одна в среднем набрала меньше баллов и меньше спала накануне. Какой вывод обоснован?' : 'Kaks rühma tegid mäluülesande. Üks sai keskmiselt vähem punkte ja magas eelmisel ööl vähem. Milline järeldus on põhjendatud?'}</p>
    <div className="lesson-options">{options.map((option, index) =>
      <button type="button" key={index} aria-pressed={choice === index} onClick={() => { setChoice(index); onChoice(index === 1); }}>{option}</button>
    )}</div>
    {choice !== null && <p role="status">{choice === 1
      ? (ru ? 'Верно. Сон — один из факторов, который нужно учесть, прежде чем объяснять разницу.' : 'Õige. Uni on üks tegur, mida tuleb erinevuse selgitamisel arvestada.')
      : (ru ? 'В условии есть различие во сне. Подумай, что оно меняет в выводе о причине.' : 'Rühmad magasid erinevalt. Mõtle, mida see põhjusliku järelduse jaoks tähendab.')}</p>}
    <p><a href="../#labor">{ru ? 'Дополнительно: лаборатория с заданиями на реакцию и внимание' : 'Lisaks: reaktsiooni- ja tähelepanuharjutused'}</a></p>
  </>;
}

function Lesson({ lang, full }: { lang: Lang; full: boolean }) {
  const ru = lang === 'ru';
  const titles = ru ? ['Как алкоголь влияет на мозг', 'Разбери исследование', 'Проверь вывод', 'Миф или факт'] : ['Kuidas alkohol aju mõjutab', 'Loe uuringut', 'Kontrolli järeldust', 'Müüt või fakt'];
  const stages = full ? titles : [titles[0], titles[3]];
  const [step, setStep] = useState(0);
  const [exerciseDone, setExerciseDone] = useState(false);
  const heading = useStageFocus(step);
  const done = step === stages.length;
  const quiz = step === stages.length - 1;
  const quizIds = full ? ['blackout', 'attention', 'reaction', 'decisions'] : ['blackout', 'attention'];
  const quizItems = (ru ? questionsRu : questions).filter(question => quizIds.includes(question.id));
  const advance = () => {
    setStep(current => current + 1);
    window.scrollTo({ top: 0 });
  };
  const progress = ru ? 'Выполнено шагов' : 'Tehtud sammud';
  return <section className="lesson-panel" aria-labelledby="lesson-step">
    <ProgressBar value={step} max={stages.length} label={progress + ' ' + step + '/' + stages.length} />
    <h2 id="lesson-step" ref={heading} tabIndex={-1}>{done ? (ru ? 'Урок завершён' : 'Õpe on läbitud') : stages[step]}</h2>
    {done ? <>
      <p>{ru ? 'Сформулируй своими словами один факт, который можешь объяснить, и одно ограничение исследования.' : 'Sõnasta oma sõnadega üks fakt, mida oskad selgitada, ja üks uuringu piirang.'}</p>
      <details><summary>{ru ? 'Посмотреть пример' : 'Vaata näidet'}</summary><p>{ru ? 'В лаборатории рабочая память взрослых после алкоголя в среднем ухудшалась. По этому результату нельзя оценить состояние одного подростка.' : 'Laboris halvenes täiskasvanute töömälu pärast alkoholi keskmiselt. Selle põhjal ei saa hinnata ühe nooruki seisundit.'}</p></details>
      <div className="lesson-actions"><a className="button primary" href={full ? '../topics/' : '?mode=full'}>{full ? (ru ? 'Посмотреть научные темы' : 'Vaata teadusteemasid') : (ru ? 'Изучить подробнее за 20 минут' : 'Õpi põhjalikumalt 20 minutiga')}</a><a href="../#tagasiside">{ru ? 'Оставить отзыв (по желанию)' : 'Anna soovi korral tagasisidet'}</a></div>
    </> : quiz ? <>
      <p>{ru ? 'Сначала оцени уверенность. Затем выбери «миф» или «факт» и прочитай объяснение.' : 'Hinda esmalt kindlust. Seejärel vali „müüt“ või „fakt“ ja loe selgitust.'}</p>
      <Quiz questions={quizItems} sourceBase="../" lang={lang} onContinue={advance} />
    </> : <>
      {step === 0 && <BrainOverview ru={ru} />}
      {step === 1 && <Evidence ru={ru} />}
      {step === 2 && <InterpretationExercise ru={ru} onChoice={setExerciseDone} />}
      <div className="lesson-actions"><button className="button primary" type="button" onClick={advance} disabled={step === 2 && !exerciseDone}>{ru ? 'Дальше' : 'Edasi'}</button></div>
    </>}
  </section>;
}

function Teacher({ ru }: { ru: boolean }) {
  const plan = ru ? [
    ['0–5', 'Постановка вопроса', 'Что показывают исследования о влиянии алкоголя на мозг? Обсуждайте примеры и источники. Делиться личным опытом не требуется.'],
    ['5–12', 'Объяснение', 'Откройте короткий урок. Попросите пары объяснить одну функцию мозга и привести пример того, как её изучают.'],
    ['12–22', 'Работа с источником', 'Прочитайте карточку рабочей памяти. Выпишите, что сравнивали, кого изучали и где заканчивается вывод.'],
    ['22–32', 'Практическая ситуация', 'Разберите в парах вымышленный случай: после мероприятия знакомый предлагает подвезти, хотя пил. Составьте безопасный план возвращения.'],
    ['32–40', 'Проверка знаний', 'Откройте викторину и обсудите, почему уверенность в ответе может расходиться с доказательствами.'],
    ['40–45', 'Рабочий лист', 'Попросите назвать факт с источником, одно ограничение и одно конкретное безопасное действие. Оцените каждый из этих трёх элементов отдельно.'],
  ] : [
    ['0–5', 'Küsimuse püstitamine', 'Mida näitavad uuringud alkoholi mõjust ajule? Arutage näiteid ja allikaid. Isiklikke kogemusi ei pea jagama.'],
    ['5–12', 'Selgitus', 'Avage lühiõpe. Paluge paaridel selgitada üht ajufunktsiooni ja tuua näide selle uurimisest.'],
    ['12–22', 'Töö allikaga', 'Lugege töömälu uuringukaarti. Pange kirja, mida võrreldi, keda uuriti ja kus on järelduse piir.'],
    ['22–32', 'Praktiline olukord', 'Arutage paaris väljamõeldud olukorda: pärast üritust pakub alkoholi tarvitanud tuttav küüti. Koostage turvaline kojuminekuplaan.'],
    ['32–40', 'Teadmiste kontroll', 'Avage viktoriin ja arutage, miks kindlustunne ja tõendid ei pruugi kokku langeda.'],
    ['40–45', 'Tööleht', 'Paluge nimetada fakt koos allikaga, üks piirang ja üks konkreetne turvaline tegu. Hinnake neid kolme osa eraldi.'],
  ];
  const links = ['../methodology/', '../start/', '../acute-effects/', '../#tegevus', '../#viktoriin', ru ? '../worksheet/ru/' : '../worksheet/et/'];
  return <section className="lesson-panel">
    <h2>{ru ? 'План на 45 минут' : '45 minuti tunnikava'}</h2>
    <p>{ru ? 'Цель урока — объяснить один научный вывод, назвать его ограничение и выбрать безопасное действие в вымышленной ситуации.' : 'Tunni eesmärk on selgitada üht teadusjäreldust, nimetada selle piirang ja valida väljamõeldud olukorras turvaline tegevus.'}</p>
    <ol className="teacher-plan">{plan.map(([time, title, description], index) => <li key={time}><span>{time} min</span><div><h3><a href={links[index]}>{title}</a></h3><p>{description}</p></div></li>)}</ol>
    <div className="lesson-actions"><a className="button primary" href={links[5]}>{ru ? 'Рабочий лист A4 · RU' : 'Tööleht A4 · ET'}</a><a href={ru ? '../worksheet/et/' : '../worksheet/ru/'}>{ru ? 'Рабочий лист · ET' : 'Tööleht · RU'}</a><a href="../#klassiruum">{ru ? 'Короткий план на 15–20 минут' : 'Lühikava 15–20 minutiks'}</a></div>
  </section>;
}

function Help({ ru }: { ru: boolean }) {
  return <section className="lesson-panel help-panel">
    <h2>{ru ? 'Если есть непосредственная опасность' : 'Kui on vahetu oht'}</h2>
    <p>{ru ? 'В Эстонии звони 112. Оставайся рядом и следуй указаниям диспетчера.' : 'Helista Eestis numbril 112. Jää inimese juurde ja järgi päästekorraldaja juhiseid.'}</p>
    <a className="button primary" href="tel:112">{ru ? 'Позвонить 112' : 'Helista 112'}</a>
    <h2>{ru ? 'Если нужно поговорить или получить совет' : 'Kui vajad nõu või soovid rääkida'}</h2>
    <p>{ru ? 'Lasteabi консультирует бесплатно и круглосуточно на русском, эстонском и английском.' : 'Lasteabi nõustab tasuta ööpäev läbi eesti, vene ja inglise keeles.'}</p>
    <div className="lesson-actions"><a className="button" href="tel:116111">Lasteabi 116 111</a><a href="https://www.lasteabi.ee/et/lasteabi-116111">{ru ? 'Сайт Lasteabi' : 'Lasteabi veebileht'}</a></div>
    <p><a href="../#tegevus">{ru ? 'Практические ситуации и другие службы' : 'Praktilised olukorrad ja muud abiteenused'}</a></p>
  </section>;
}

export default function EntryPage({ page }: { page: Page }) {
  const [lang, setLang] = useState<Lang>(initialLanguage);
  const ru = lang === 'ru';
  const full = new URLSearchParams(location.search).get('mode') === 'full';
  const title = page === 'help' ? (ru ? 'Что делать / Нужна помощь' : 'Mida teha / Vajan abi')
    : page === 'teacher' ? (ru ? 'Материалы для учителя' : 'Materjalid õpetajale')
    : full ? (ru ? 'Алкоголь и мозг за 20 минут' : 'Alkohol ja aju 20 minutiga')
    : (ru ? 'Алкоголь и мозг за 5 минут' : 'Alkohol ja aju 5 minutiga');
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;
    try { localStorage.setItem(languageKey, lang); } catch {}
  }, [lang, title]);
  function switchLanguage(next: Lang) {
    const url = new URL(location.href);
    url.searchParams.set('lang', next);
    history.replaceState(null, '', url);
    setLang(next);
  }
  return <div className="entry-page">
    <header className="entry-header">
      <a href="../" className="entry-brand"><img src="../logo-mark.svg" alt="" /><span>{ru ? 'Алкоголь и мозг' : 'Alkohol ja aju'}</span></a>
      <div className="entry-language" role="group" aria-label={ru ? 'Язык' : 'Keel'}>
        <button type="button" aria-pressed={!ru} className={!ru ? 'active' : ''} onClick={() => switchLanguage('et')}>ET</button>
        <button type="button" aria-pressed={ru} className={ru ? 'active' : ''} onClick={() => switchLanguage('ru')}>RU</button>
      </div>
    </header>
    <main>
      <div className="entry-hero"><h1>{title}</h1></div>
      {page === 'start' && <Lesson lang={lang} full={full} />}
      {page === 'teacher' && <Teacher ru={ru} />}
      {page === 'help' && <Help ru={ru} />}
      <a className="entry-back" href="../">{ru ? '← На главную' : '← Avalehele'}</a>
    </main>
  </div>;
}
