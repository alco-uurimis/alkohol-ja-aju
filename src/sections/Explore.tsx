import { useEffect, useMemo, useRef, useState } from 'react';
import { Section, SourceReference } from '../components/Shared';
import { readGameMetrics } from '../utils/gameMetrics';
import './explore.css';

type Lang = 'et' | 'ru' | 'en';

const text = {
  et: {
    more: { title: 'Veel uurimiseks', est: 'Eesti andmed: graafik ja tõlgendamisülesanne', estSub: 'Kooliõpilaste uuringu kolm lainet ja küsimus, mida neist järeldada saab.', ride: 'Mida sina teeksid?', rideSub: 'Hargnev olukord: valid sammu ja näed, mis edasi juhtub.' },
    number: '06A / AVASTA', title: 'Graafikud ja lisaülesanne',
    intro: 'Neli lühikest lisa: mida tähendab reaktsiooniaeg meetrites, kuidas võib öö skemaatiliselt välja näha, kuidas muutub signaal sünapsis ja kuidas eristada vaatlust, seost ja põhjuslikku järeldust.',
    d: {
      pill: 'ARVUTUS', title: 'Reaktsiooniaeg meetrites',
      lead: 'Enne kui inimene jõuab reageerida, liigub sõiduk edasi. See on puhas füüsika: teepikkus = kiirus × aeg.',
      speed: 'Kiirus', time: 'Reaktsiooniaeg', yours: 'Kasuta minu mängutulemust', noResult: 'Mängi enne reaktsioonimängu, siis saad siin oma tulemust kasutada.',
      result: (m: string) => `Selle ajaga läbib sõiduk ${m} m, enne kui midagi juhtuma hakkab.`,
      extra: (m: string) => `Iga lisanduv 100 ms tähendab sellel kiirusel veel ${m} m.`,
      chart: 'Sama reaktsiooniaeg eri kiirustel', unit: 'm', kmh: 'km/h', msUnit: 'ms',
      note: 'Ekraanil klõpsamine on lihtsam kui päris liikluses märkamine, otsustamine ja pidurdamine, seega on tegelik reageerimine tavaliselt pikem. Arvutus ei hinda joovet ega sõidukõlblikkust. Alkohol võib reageerimist aeglustada.',
    },
    s: {
      pill: 'SKEEM', title: 'Kaks ööd — skemaatiliselt',
      lead: 'Joonis ei ole mõõtmistulemus. See näitab lihtsustatult, mida allikas kirjeldab: uinumine võib olla kiirem, kuid uni katkendlikum ja ärkamine varasem.',
      normal: 'Tavaline öö', alcohol: 'Öö pärast alkoholi', awake: 'ärkvel', deep: 'sügav uni', hours: 'tunnid',
      points: ['Uinumine võib tulla kiiremini.', 'Öö teises pooles võib uni olla katkendlikum.', 'Ärkamine võib tulla varem.'],
      aria: (n: string) => `Skemaatiline unegraafik: ${n}`,
    },
    y: {
      pill: 'ANIMATSIOON', title: 'Sünaps: pidurdus ja ergastus',
      lead: 'Lihtsustatud mudel kahest signaalisüsteemist. Virgatsaine liigub ühest rakust teise; alkohol muudab seda, kui tugevalt vastuvõttev rakk reageerib.',
      off: 'Ilma alkoholita', on: 'Alkoholi mõjul', gaba: 'GABA · pidurdav', glu: 'Glutamaat · ergastav',
      inh: 'Pidurdav vastus', exc: 'Ergastav vastus', stronger: 'tugevam', weaker: 'nõrgem', base: 'tavaline',
      note: 'Mudel on skemaatiline: tulpade pikkus ei ole mõõtmistulemus. Etanool toimib paljudele sihtmärkidele ning mõju sõltub annusest ja inimesest.',
      aria: (m: string) => `Animeeritud sünapsi skeem: ${m}`,
    },
    q: {
      pill: 'ÜLESANNE', title: 'Vaatlus, seos või põhjuslik järeldus?',
      lead: 'Näited on väljamõeldud. Otsusta, mis tüüpi väitega on tegu.',
      obs: 'Vaatlus', assoc: 'Seos', cause: 'Põhjuslik järeldus', next: 'Järgmine', again: 'Alusta uuesti', right: 'Õige.', wrong: 'Mitte päris.',
      done: (a: number, b: number) => `Tulemus: ${a} / ${b}. See kontrollib mõistmist, mitte tervist.`,
      items: [
        ['Osalejad tegid mäluülesande 20 sõnaga.', 'obs', 'See kirjeldab, mida tehti ja mõõdeti. Järeldust siin veel ei ole.'],
        ['Vähem maganud õpilaste tulemused olid keskmiselt madalamad.', 'assoc', 'Kaks nähtust esinevad koos. See ei näita veel, kumb kumba mõjutab.'],
        ['Unepuudus põhjustas madalamad tulemused.', 'cause', 'See on põhjuslik väide. Ainult seosest selle tõestamiseks ei piisa.'],
        ['Rühma A keskmine reaktsiooniaeg oli 310 ms.', 'obs', 'See on mõõtmistulemus ilma tõlgenduseta.'],
        ['Jälgimisuuringutes oli noorukiea rohkem tarvitamine seotud kehvemate tähelepanutulemustega.', 'assoc', 'Sõna „seotud“ tähistab seost. Põhjuse kohta tuleb olla ettevaatlik.'],
        ['Kuna osalejad jagati rühmadesse juhuslikult, võib erinevuse omistada joogile.', 'cause', 'Juhuslik jaotamine on see, mis lubab katses põhjuslikku järeldust teha.'],
      ],
    },
  },
  ru: {
    more: { title: 'Ещё для исследования', est: 'Данные Эстонии: график и задание на интерпретацию', estSub: 'Три волны школьного опроса и вопрос, какой вывод из них можно сделать.', ride: 'Что бы ты сделал(а)?', rideSub: 'Ветвящаяся ситуация: выбираешь шаг и видишь, что происходит дальше.' },
    number: '06A / ИССЛЕДУЙ', title: 'Графики и новое задание',
    intro: 'Четыре коротких дополнения: что значит время реакции в метрах, как схематично может выглядеть ночь, как меняется сигнал в синапсе и как отличать наблюдение, связь и причинный вывод.',
    d: {
      pill: 'РАСЧЁТ', title: 'Время реакции в метрах',
      lead: 'Пока человек не успел отреагировать, транспорт продолжает ехать. Это чистая физика: путь = скорость × время.',
      speed: 'Скорость', time: 'Время реакции', yours: 'Взять мой результат из игры', noResult: 'Сначала сыграй в игру на реакцию, и здесь можно будет взять свой результат.',
      result: (m: string) => `За это время транспорт проедет ${m} м, прежде чем что-то начнёт происходить.`,
      extra: (m: string) => `Каждые лишние 100 мс на этой скорости — ещё ${m} м.`,
      chart: 'То же время реакции на разных скоростях', unit: 'м', kmh: 'км/ч', msUnit: 'мс',
      note: 'Нажать на экран проще, чем в реальном движении заметить, решить и затормозить, поэтому настоящая реакция обычно дольше. Расчёт не оценивает опьянение или способность водить. Алкоголь может замедлять реакцию.',
    },
    s: {
      pill: 'СХЕМА', title: 'Две ночи — схематично',
      lead: 'Рисунок не является результатом измерений. Он упрощённо показывает то, что описывает источник: заснуть можно быстрее, но сон бывает более прерывистым, а пробуждение — более ранним.',
      normal: 'Обычная ночь', alcohol: 'Ночь после алкоголя', awake: 'бодрствование', deep: 'глубокий сон', hours: 'часы',
      points: ['Засыпание может наступить быстрее.', 'Во второй половине ночи сон может быть более прерывистым.', 'Пробуждение может наступить раньше.'],
      aria: (n: string) => `Схематичный график сна: ${n}`,
    },
    y: {
      pill: 'АНИМАЦИЯ', title: 'Синапс: торможение и возбуждение',
      lead: 'Упрощённая модель двух сигнальных систем. Медиатор переходит от одной клетки к другой; алкоголь меняет то, насколько сильно отвечает принимающая клетка.',
      off: 'Без алкоголя', on: 'Под действием алкоголя', gaba: 'GABA · тормозный', glu: 'Глутамат · возбуждающий',
      inh: 'Тормозный ответ', exc: 'Возбуждающий ответ', stronger: 'сильнее', weaker: 'слабее', base: 'обычный',
      note: 'Модель схематична: длина полос не является результатом измерений. Этанол действует на многие мишени, а эффект зависит от дозы и человека.',
      aria: (m: string) => `Анимированная схема синапса: ${m}`,
    },
    q: {
      pill: 'ЗАДАНИЕ', title: 'Наблюдение, связь или причинный вывод?',
      lead: 'Примеры вымышленные. Реши, к какому типу относится утверждение.',
      obs: 'Наблюдение', assoc: 'Связь', cause: 'Причинный вывод', next: 'Дальше', again: 'Начать заново', right: 'Верно.', wrong: 'Не совсем.',
      done: (a: number, b: number) => `Результат: ${a} / ${b}. Это проверка понимания, а не здоровья.`,
      items: [
        ['Участники выполнили задание на память с 20 словами.', 'obs', 'Здесь описано, что делали и измеряли. Вывода пока нет.'],
        ['У школьников, которые меньше спали, результаты в среднем были ниже.', 'assoc', 'Два явления встречаются вместе. Это ещё не показывает, что на что влияет.'],
        ['Недосып стал причиной более низких результатов.', 'cause', 'Это причинное утверждение. Одной связи для его доказательства недостаточно.'],
        ['Среднее время реакции группы A составило 310 мс.', 'obs', 'Это результат измерения без интерпретации.'],
        ['В наблюдательных исследованиях более частое употребление в подростковом возрасте было связано с худшими результатами по вниманию.', 'assoc', 'Слово «связано» означает связь. С причиной нужно быть осторожным.'],
        ['Поскольку участников распределили по группам случайно, различие можно отнести на счёт напитка.', 'cause', 'Именно случайное распределение позволяет делать причинный вывод в эксперименте.'],
      ],
    },
  },
  en: {
    more: { title: 'More to explore', est: 'Data from Estonia: a chart and an interpretation task', estSub: 'Three waves of the school survey and the question of what can be concluded from them.', ride: 'What would you do?', rideSub: 'A branching situation: you choose a step and see what happens next.' },
    number: '06A / EXPLORE', title: 'Charts and an extra task',
    intro: 'Four short additions: what reaction time means in metres, what a night can look like as a schematic, how the signal changes at a synapse, and how to tell observation, association and causal conclusion apart.',
    d: {
      pill: 'CALCULATION', title: 'Reaction time in metres',
      lead: 'Until a person has reacted, the vehicle keeps moving. This is plain physics: distance = speed × time.',
      speed: 'Speed', time: 'Reaction time', yours: 'Use my game result', noResult: 'Play the reaction game first, then you can use your own result here.',
      result: (m: string) => `In that time the vehicle travels ${m} m before anything starts to happen.`,
      extra: (m: string) => `Every extra 100 ms at this speed means another ${m} m.`,
      chart: 'The same reaction time at different speeds', unit: 'm', kmh: 'km/h', msUnit: 'ms',
      note: 'Clicking on a screen is simpler than noticing, deciding and braking in real traffic, so real reactions usually take longer. The calculation does not assess intoxication or fitness to drive. Alcohol can slow reactions.',
    },
    s: {
      pill: 'SCHEMATIC', title: 'Two nights — as a schematic',
      lead: 'The drawing is not measured data. It shows in a simplified way what the source describes: falling asleep can be quicker, but sleep more broken and waking earlier.',
      normal: 'An ordinary night', alcohol: 'A night after alcohol', awake: 'awake', deep: 'deep sleep', hours: 'hours',
      points: ['Falling asleep can come sooner.', 'In the second half of the night sleep can be more broken.', 'Waking can come earlier.'],
      aria: (n: string) => `Schematic sleep chart: ${n}`,
    },
    y: {
      pill: 'ANIMATION', title: 'The synapse: inhibition and excitation',
      lead: 'A simplified model of two signalling systems. A neurotransmitter passes from one cell to the next; alcohol changes how strongly the receiving cell responds.',
      off: 'Without alcohol', on: 'Under the influence of alcohol', gaba: 'GABA · inhibitory', glu: 'Glutamate · excitatory',
      inh: 'Inhibitory response', exc: 'Excitatory response', stronger: 'stronger', weaker: 'weaker', base: 'usual',
      note: 'The model is schematic: the length of the bars is not measured data. Ethanol acts on many targets, and the effect depends on the dose and the person.',
      aria: (m: string) => `Animated synapse diagram: ${m}`,
    },
    q: {
      pill: 'TASK', title: 'Observation, association or causal conclusion?',
      lead: 'The examples are made up. Decide what type of statement each one is.',
      obs: 'Observation', assoc: 'Association', cause: 'Causal conclusion', next: 'Next', again: 'Start again', right: 'Correct.', wrong: 'Not quite.',
      done: (a: number, b: number) => `Result: ${a} / ${b}. This checks understanding, not health.`,
      items: [
        ['Participants did a memory task with 20 words.', 'obs', 'This describes what was done and measured. There is no conclusion yet.'],
        ['Students who slept less had lower results on average.', 'assoc', 'Two things occur together. That does not yet show which affects which.'],
        ['Lack of sleep caused the lower results.', 'cause', 'This is a causal claim. An association alone is not enough to prove it.'],
        ['The average reaction time of group A was 310 ms.', 'obs', 'This is a measurement without interpretation.'],
        ['In follow-up studies, heavier drinking in adolescence was associated with poorer attention results.', 'assoc', 'The word “associated” marks an association. Be careful about the cause.'],
        ['Because participants were assigned to groups at random, the difference can be attributed to the drink.', 'cause', 'Random assignment is what allows a causal conclusion in an experiment.'],
      ],
    },
  },
} as const;

const SPEEDS = [30, 50, 90] as const;
const metres = (kmh: number, ms: number) => (kmh / 3.6) * (ms / 1000);
const fmt = (v: number, lang: Lang) => v.toFixed(1).replace('.', lang === 'en' ? '.' : ',');

function ReactionDistance({ lang }: { lang: Lang }) {
  const t = text[lang].d;
  const [speed, setSpeed] = useState<number>(50);
  const [ms, setMs] = useState(300);
  const [own, setOwn] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => { const r = readGameMetrics().reaction as { medianMs?: number; bestMs?: number } | undefined; setOwn(r ? Math.round(r.medianMs ?? r.bestMs ?? 0) || null : null); };
    sync(); addEventListener('alkohol-game-metrics', sync);
    return () => removeEventListener('alkohol-game-metrics', sync);
  }, []);
  const d = metres(speed, ms);
  const max = metres(90, 1500);
  return (
    <article className="explore-card">
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead}</p>
      <div className="explore-controls">
        <div role="group" aria-label={t.speed} className="explore-seg">{SPEEDS.map(s => <button key={s} type="button" aria-pressed={speed === s} className={speed === s ? 'active' : ''} onClick={() => setSpeed(s)}>{s} {t.kmh}</button>)}</div>
        <label className="explore-range"><span>{t.time}: <b>{ms} {t.msUnit}</b></span><input type="range" min={150} max={1500} step={10} value={ms} onChange={e => setMs(Number(e.target.value))} /></label>
        {own ? <button type="button" className="text-button" onClick={() => setMs(Math.min(1500, Math.max(150, own)))}>{t.yours} ({own} {t.msUnit})</button> : <small>{t.noResult}</small>}
      </div>
      <div className="explore-road" aria-hidden="true"><i style={{ width: `${Math.max(2, (d / max) * 100)}%` }}><b /></i></div>
      <p className="explore-result" role="status"><strong>{t.result(fmt(d, lang))}</strong> {t.extra(fmt(metres(speed, 100), lang))}</p>
      <figure className="explore-bars"><figcaption>{t.chart}</figcaption>
        {SPEEDS.map(s => { const v = metres(s, ms); return <div key={s} className={s === speed ? 'active' : ''}><span>{s} {t.kmh}</span><i style={{ width: `${(v / max) * 100}%` }} /><b>{fmt(v, lang)} {t.unit}</b></div>; })}
      </figure>
      <p className="small">{t.note} <SourceReference ids={[3]} lang={lang} /></p>
    </article>
  );
}

const NIGHTS = {
  normal: 'M0,30 L40,30 L60,120 L120,150 L160,90 L200,140 L260,150 L300,80 L340,130 L400,120 L440,70 L480,110 L540,70 L570,40 L600,30',
  alcohol: 'M0,30 L15,30 L30,150 L140,160 L200,150 L230,60 L250,30 L265,90 L310,110 L330,35 L350,80 L390,100 L410,35 L430,75 L470,90 L490,30 L600,30',
};

function SleepNight({ lang }: { lang: Lang }) {
  const t = text[lang].s;
  const [night, setNight] = useState<'normal' | 'alcohol'>('normal');
  const name = night === 'normal' ? t.normal : t.alcohol;
  return (
    <article className="explore-card">
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead} <SourceReference ids={[5]} lang={lang} /></p>
      <div role="group" aria-label={t.title} className="explore-seg">
        <button type="button" aria-pressed={night === 'normal'} className={night === 'normal' ? 'active' : ''} onClick={() => setNight('normal')}>{t.normal}</button>
        <button type="button" aria-pressed={night === 'alcohol'} className={night === 'alcohol' ? 'active' : ''} onClick={() => setNight('alcohol')}>{t.alcohol}</button>
      </div>
      <svg className="explore-sleep" viewBox="-6 0 612 215" role="img" aria-label={t.aria(name)}>
        <text x="2" y="20">{t.awake}</text><text x="2" y="178">{t.deep}</text>
        <line x1="0" y1="30" x2="600" y2="30" className="grid" /><line x1="0" y1="160" x2="600" y2="160" className="grid" />
        {[0, 2, 4, 6, 8].map(h => <text key={h} x={h * 75} y="192" textAnchor="middle">{h}</text>)}
        <text x="300" y="211" textAnchor="middle">{t.hours}</text>
        <path key={night} d={NIGHTS[night]} pathLength={1} className={'line ' + night} />
      </svg>
      {night === 'alcohol' && <ol className="explore-points">{t.points.map(p => <li key={p}>{p}</li>)}</ol>}
    </article>
  );
}

function SynapseHalf({ x, kind, on }: { x: number; kind: 'gaba' | 'glu'; on: boolean }) {
  return (
    <g transform={`translate(${x} 0)`} className={`syn ${kind} ${on ? 'on' : ''}`}>
      <path className="syn-pre" d="M40,8 h120 a14,14 0 0 1 14,14 v36 a40,40 0 0 1 -40,40 h-68 a40,40 0 0 1 -40,-40 v-36 a14,14 0 0 1 14,-14 z" />
      {[0, 1, 2, 3, 4].map(i => <circle key={i} className="syn-dot" cx={62 + i * 19} cy="104" r="5" style={{ animationDelay: `${i * 0.28}s` }} />)}
      <path className="syn-post" d="M26,150 h148 v40 a14,14 0 0 1 -14,14 h-120 a14,14 0 0 1 -14,-14 z" />
      <rect className="syn-glow" x="26" y="150" width="148" height="54" rx="12" />
      {[0, 1, 2, 3].map(i => <path key={i} className="syn-rec" d={`M${52 + i * 30},150 v-9 m12,9 v-9`} />)}
    </g>
  );
}

function Synapse({ lang }: { lang: Lang }) {
  const t = text[lang].y;
  const [on, setOn] = useState(false);
  // The dots loop forever, so they only run while the card is on screen (no repaint work while the reader is elsewhere).
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { rootMargin: '80px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <article className={'explore-card' + (seen ? '' : ' syn-paused')} ref={ref}>
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead} <SourceReference ids={[6, 9]} lang={lang} /></p>
      <div role="group" aria-label={t.title} className="explore-seg">
        <button type="button" aria-pressed={!on} className={!on ? 'active' : ''} onClick={() => setOn(false)}>{t.off}</button>
        <button type="button" aria-pressed={on} className={on ? 'active' : ''} onClick={() => setOn(true)}>{t.on}</button>
      </div>
      <svg className="explore-synapse" viewBox="0 0 420 212" role="img" aria-label={t.aria(on ? t.on : t.off)}>
        <SynapseHalf x={0} kind="gaba" on={on} /><SynapseHalf x={220} kind="glu" on={on} />
      </svg>
      <div className="explore-syn-labels" aria-hidden="true"><span className="gaba">{t.gaba}</span><span className="glu">{t.glu}</span></div>
      <div className="explore-meters" role="status">
        <div className="gaba"><span>{t.inh}: <b>{on ? t.stronger : t.base}</b></span><i style={{ width: on ? '82%' : '50%' }} /></div>
        <div className="glu"><span>{t.exc}: <b>{on ? t.weaker : t.base}</b></span><i style={{ width: on ? '26%' : '50%' }} /></div>
      </div>
      <p className="small">{t.note}</p>
    </article>
  );
}

const shuffled = (n: number) => { const a = Array.from({ length: n }, (_, k) => k); for (let k = n - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

function EvidenceSort({ lang }: { lang: Lang }) {
  const t = text[lang].q;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  // Shuffled per run (indices, so a language switch keeps the same order): the source list repeats the three types in a fixed pattern.
  const [order, setOrder] = useState(() => shuffled(t.items.length));
  const items = order.map(k => t.items[k]);
  const done = i >= items.length;
  const labels = useMemo(() => ({ obs: t.obs, assoc: t.assoc, cause: t.cause }), [t]);
  const choose = (k: string) => { if (picked) return; setPicked(k); if (k === items[i][1]) setScore(s => s + 1); };
  const restart = () => { setOrder(shuffled(t.items.length)); setI(0); setPicked(null); setScore(0); };
  return (
    <article className="explore-card">
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead}</p>
      {done ? <div className="explore-quiz" role="status"><strong>{t.done(score, items.length)}</strong><button type="button" className="button" onClick={restart}>{t.again}</button></div> : (
        <div className="explore-quiz">
          <p className="explore-count">{i + 1} / {items.length}</p>
          <blockquote>{items[i][0]}</blockquote>
          <div className="explore-choices">{(['obs', 'assoc', 'cause'] as const).map(k => <button key={k} type="button" disabled={!!picked} className={picked ? (k === items[i][1] ? 'right' : k === picked ? 'wrong' : '') : ''} onClick={() => choose(k)}>{labels[k]}</button>)}</div>
          <div role="status" className="explore-feedback">{picked && <><p><b>{picked === items[i][1] ? t.right : t.wrong}</b> {items[i][2]}</p><button type="button" className="button primary" onClick={() => { setI(v => v + 1); setPicked(null); }}>{t.next}</button></>}</div>
        </div>
      )}
    </article>
  );
}

/** Extra visual material after the game lab: a distance calculator, a schematic sleep chart, an animated synapse and a classification task. */
export default function Explore({ lang }: { lang: Lang }) {
  const t = text[lang];
  const up = typeof location !== 'undefined' && /\/en\/[^/]*$/.test(location.pathname) ? '../' : ''; // the English exercises page lives one folder down
  return (
    <Section id="avasta" number={t.number} title={t.title} intro={t.intro} className="explore-section">
      <div className="explore-grid"><ReactionDistance lang={lang} /><SleepNight lang={lang} /><Synapse lang={lang} /><EvidenceSort lang={lang} /></div>
      <nav className="explore-more" aria-label={t.more.title}>
        <a href={`${up}science/results/?lang=${lang}#estonia-data`}><strong>{t.more.est}</strong><span>{t.more.estSub}</span></a>
        <a href={`${up}help/?lang=${lang}#what-would-you-do`}><strong>{t.more.ride}</strong><span>{t.more.rideSub}</span></a>
      </nav>
    </Section>
  );
}
