import { useEffect, useRef, useState } from 'react';
import { SourceReference } from '../components/Shared';

type Lang = 'et' | 'ru' | 'en';

const text = {
  et: {
    dual: {
      pill: 'KATSE ISEENDAGA', title: 'Üks ülesanne või kaks korraga?',
      lead: 'Kaks lühikest vooru. Esimeses vajutad nuppu, kui ring muutub roheliseks. Teises teed sama ja loed samal ajal, mitu korda vilgub nurgas ruut.',
      start: 'Alusta 1. vooru', startDual: 'Alusta 2. vooru', press: 'Vajuta, kui ring on roheline', wait: 'Oota…', go: 'VAJUTA!', early: 'Liiga vara — oota rohelist.',
      round1: '1. voor: ainult reaktsioon', round2: '2. voor: reaktsioon + loendamine', trial: (a: number, b: number) => `Katse ${a} / ${b}`,
      howMany: 'Mitu korda ruut vilkus?', check: 'Vaata tulemust', single: 'Üks ülesanne', double: 'Kaks ülesannet', ms: 'ms',
      count: (g: number, r: number) => g === r ? `Loendasid õigesti: ${r}.` : `Sinu vastus: ${g}, tegelikult: ${r}.`,
      slower: (d: number) => `Kahe ülesandega oli keskmine reaktsioon ${d} ms aeglasem.`, faster: (d: number) => `Kahe ülesandega oli keskmine reaktsioon ${d} ms kiirem — üks katse on juhuslik, proovi uuesti.`, same: 'Keskmine reaktsioon oli peaaegu sama.',
      note: 'Tähelepanu jagamine kahe ülesande vahel teeb sageli ühe neist aeglasemaks või ebatäpsemaks. Üks lühike katse seda ei tõesta ega simuleeri joovet. Alkohol võib tähelepanu jagamist häirida.',
      again: 'Proovi uuesti', flash: 'vilkuv ruut',
    },
    dev: {
      pill: 'SKEEM', title: 'Aju ei küpse ühtlaselt',
      lead: 'Lihtsustatud joonis sellest, mida allikad kirjeldavad: tasu ja emotsioonidega seotud süsteemid küpsevad varem kui planeerimise ja enesekontrolli võrgustikud.',
      reward: 'Tasu ja emotsioonid', control: 'Planeerimine ja enesekontroll', age: 'Vanus', y: 'küpsus (skemaatiline)', years: 'a',
      gap: 'Varjutatud ala on kahe süsteemi vahe.',
      note: 'Kõverad ei ole mõõtmistulemused ja arengutempo on inimestel erinev. Aju areng jätkub noores täiskasvanueas.',
      aria: (a: number) => `Skemaatiline aju arengu joonis, valitud vanus ${a} aastat`,
    },
  },
  ru: {
    dual: {
      pill: 'ОПЫТ НА СЕБЕ', title: 'Одна задача или две сразу?',
      lead: 'Два коротких раунда. В первом нажимаешь кнопку, когда круг становится зелёным. Во втором делаешь то же и одновременно считаешь, сколько раз в углу мигнёт квадрат.',
      start: 'Начать 1-й раунд', startDual: 'Начать 2-й раунд', press: 'Нажми, когда круг зелёный', wait: 'Жди…', go: 'ЖМИ!', early: 'Слишком рано — дождись зелёного.',
      round1: 'Раунд 1: только реакция', round2: 'Раунд 2: реакция + счёт', trial: (a: number, b: number) => `Попытка ${a} / ${b}`,
      howMany: 'Сколько раз мигнул квадрат?', check: 'Посмотреть результат', single: 'Одна задача', double: 'Две задачи', ms: 'мс',
      count: (g: number, r: number) => g === r ? `Счёт верный: ${r}.` : `Твой ответ: ${g}, на самом деле: ${r}.`,
      slower: (d: number) => `С двумя задачами средняя реакция была на ${d} мс медленнее.`, faster: (d: number) => `С двумя задачами средняя реакция была на ${d} мс быстрее — одна попытка случайна, попробуй ещё раз.`, same: 'Средняя реакция почти не изменилась.',
      note: 'Когда внимание делится между двумя задачами, одна из них часто выполняется медленнее или менее точно. Одна короткая попытка этого не доказывает и не имитирует опьянение. Алкоголь может нарушать распределение внимания.',
      again: 'Попробовать ещё раз', flash: 'мигающий квадрат',
    },
    dev: {
      pill: 'СХЕМА', title: 'Мозг созревает неравномерно',
      lead: 'Упрощённый рисунок того, что описывают источники: системы, связанные с вознаграждением и эмоциями, созревают раньше, чем сети планирования и самоконтроля.',
      reward: 'Вознаграждение и эмоции', control: 'Планирование и самоконтроль', age: 'Возраст', y: 'зрелость (схематично)', years: '',
      gap: 'Закрашенная область — разрыв между двумя системами.',
      note: 'Кривые не являются результатами измерений, а темп развития у людей разный. Развитие мозга продолжается и в молодом взрослом возрасте.',
      aria: (a: number) => `Схематичный рисунок развития мозга, выбранный возраст: ${a}`,
    },
  },
  en: {
    dual: {
      pill: 'AN EXPERIMENT ON YOURSELF', title: 'One task or two at once?',
      lead: 'Two short rounds. In the first you press the button when the circle turns green. In the second you do the same and, at the same time, count how many times a square flashes in the corner.',
      start: 'Start round 1', startDual: 'Start round 2', press: 'Press when the circle is green', wait: 'Wait…', go: 'PRESS!', early: 'Too early — wait for green.',
      round1: 'Round 1: reaction only', round2: 'Round 2: reaction + counting', trial: (a: number, b: number) => `Trial ${a} / ${b}`,
      howMany: 'How many times did the square flash?', check: 'See the result', single: 'One task', double: 'Two tasks', ms: 'ms',
      count: (g: number, r: number) => g === r ? `You counted correctly: ${r}.` : `Your answer: ${g}, actually: ${r}.`,
      slower: (d: number) => `With two tasks your average reaction was ${d} ms slower.`, faster: (d: number) => `With two tasks your average reaction was ${d} ms faster — one attempt is noisy, try again.`, same: 'Your average reaction was almost the same.',
      note: 'When attention is shared between two tasks, one of them is often done more slowly or less accurately. One short attempt does not prove this and does not simulate intoxication. Alcohol can disrupt the sharing of attention.',
      again: 'Try again', flash: 'flashing square',
    },
    dev: {
      pill: 'SCHEMATIC', title: 'The brain does not mature evenly',
      lead: 'A simplified drawing of what the sources describe: systems linked with reward and emotion mature earlier than the networks for planning and self-control.',
      reward: 'Reward and emotion', control: 'Planning and self-control', age: 'Age', y: 'maturity (schematic)', years: 'years',
      gap: 'The shaded area is the gap between the two systems.',
      note: 'The curves are not measured data, and people develop at different paces. Brain development continues into young adulthood.',
      aria: (a: number) => `Schematic drawing of brain development, selected age ${a} years`,
    },
  },
} as const;

const TRIALS = 6;
type Phase = 'idle' | 'single' | 'between' | 'dual' | 'ask' | 'result';
const mean = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);

/** Reaction alone, then reaction while counting flashes: the reader sees their own two averages side by side. */
export function DualTask({ lang }: { lang: Lang }) {
  const t = text[lang].dual;
  const [phase, setPhase] = useState<Phase>('idle');
  const [green, setGreen] = useState(false);
  const [msg, setMsg] = useState('');
  const [flashOn, setFlashOn] = useState(false);
  const [trial, setTrial] = useState(0);
  const [guess, setGuess] = useState(5);
  const [res, setRes] = useState<{ single: number[]; dual: number[]; flashes: number }>({ single: [], dual: [], flashes: 0 });
  const shownAt = useRef(0);
  const timers = useRef<number[]>([]);
  const flashCount = useRef(0);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const later = (fn: () => void, ms: number) => { const id = window.setTimeout(fn, ms); timers.current.push(id); };
  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearAll, []);

  const arm = () => { setGreen(false); later(() => { shownAt.current = performance.now(); setGreen(true); }, 900 + Math.random() * 1500); };
  const flashLoop = () => later(() => {
    if (phaseRef.current !== 'dual') return;
    flashCount.current += 1; setFlashOn(true);
    later(() => setFlashOn(false), 320);
    flashLoop();
  }, 1100 + Math.random() * 1700);

  const begin = (p: 'single' | 'dual') => {
    clearAll(); setMsg(''); setTrial(0); setPhase(p); phaseRef.current = p;
    if (p === 'single') setRes({ single: [], dual: [], flashes: 0 });
    if (p === 'dual') { flashCount.current = 0; flashLoop(); }
    arm();
  };

  const press = () => {
    if (phase !== 'single' && phase !== 'dual') return;
    if (!green) { setMsg(t.early); return; }
    const rt = Math.round(performance.now() - shownAt.current);
    setMsg(''); setGreen(false);
    const next = trial + 1; setTrial(next);
    setRes(r => (phase === 'single' ? { ...r, single: [...r.single, rt] } : { ...r, dual: [...r.dual, rt] }));
    if (next >= TRIALS) {
      clearAll(); setFlashOn(false);
      if (phase === 'single') setPhase('between'); else { setRes(r => ({ ...r, flashes: flashCount.current })); setPhase('ask'); }
    } else arm();
  };

  const running = phase === 'single' || phase === 'dual';
  const a = mean(res.single), b = mean(res.dual), diff = b - a, max = Math.max(a, b, 1);
  return (
    <article className="explore-card">
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead}</p>
      {phase === 'idle' && <button type="button" className="button primary" onClick={() => begin('single')}>{t.start}</button>}
      {phase === 'between' && <div className="explore-quiz"><p><b>{t.round1}:</b> {a} {t.ms}</p><button type="button" className="button primary" onClick={() => begin('dual')}>{t.startDual}</button></div>}
      {running && (
        <div className="dual-stage">
          <p className="explore-count">{phase === 'single' ? t.round1 : t.round2} · {t.trial(Math.min(trial + 1, TRIALS), TRIALS)}</p>
          <div className="dual-field">
            <i className={'dual-lamp' + (green ? ' go' : '')} aria-hidden="true" />
            {phase === 'dual' && <i className={'dual-flash' + (flashOn ? ' on' : '')} role="img" aria-label={t.flash} />}
          </div>
          <button type="button" className="dual-press" onClick={press}>{green ? t.go : t.wait}<small>{t.press}</small></button>
          <p role="status" className="dual-msg">{msg}</p>
        </div>
      )}
      {phase === 'ask' && (
        <div className="explore-quiz">
          <label className="dual-ask">{t.howMany}
            <span><button type="button" aria-label="−1" onClick={() => setGuess(g => Math.max(0, g - 1))}>−</button><output>{guess}</output><button type="button" aria-label="+1" onClick={() => setGuess(g => Math.min(30, g + 1))}>+</button></span>
          </label>
          <button type="button" className="button primary" onClick={() => setPhase('result')}>{t.check}</button>
        </div>
      )}
      {phase === 'result' && (
        <div className="explore-quiz" role="status">
          <figure className="explore-bars dual-bars">
            <div><span>{t.single}</span><i style={{ width: `${(a / max) * 100}%` }} /><b>{a} {t.ms}</b></div>
            <div className="active"><span>{t.double}</span><i style={{ width: `${(b / max) * 100}%` }} /><b>{b} {t.ms}</b></div>
          </figure>
          <p><strong>{Math.abs(diff) < 15 ? t.same : diff > 0 ? t.slower(diff) : t.faster(-diff)}</strong> {t.count(guess, res.flashes)}</p>
          <button type="button" className="button" onClick={() => { setGuess(5); begin('single'); }}>{t.again}</button>
        </div>
      )}
      <p className="small">{t.note} <SourceReference ids={[3]} lang={lang} /></p>
    </article>
  );
}

// Two logistic curves on an age axis of 10–25 years. Purely illustrative: only the ORDER (reward earlier, control later) comes from the sources.
const X = (age: number) => ((age - 10) / 15) * 600;
const curve = (mid: number, k: number) => (age: number) => 1 / (1 + Math.exp(-k * (age - mid)));
const reward = curve(13.5, 0.75), control = curve(19, 0.5);
const Y = (v: number) => 180 - v * 150;
const path = (f: (a: number) => number) => Array.from({ length: 61 }, (_, i) => 10 + i * 0.25).map((a, i) => `${i ? 'L' : 'M'}${X(a).toFixed(1)},${Y(f(a)).toFixed(1)}`).join(' ');
const gapArea = (() => { const ages = Array.from({ length: 61 }, (_, i) => 10 + i * 0.25); return `M${ages.map(a => `${X(a).toFixed(1)},${Y(reward(a)).toFixed(1)}`).join(' L')} L${[...ages].reverse().map(a => `${X(a).toFixed(1)},${Y(control(a)).toFixed(1)}`).join(' L')} Z`; })();

export function BrainDevelopment({ lang }: { lang: Lang }) {
  const t = text[lang].dev;
  const [age, setAge] = useState(16);
  return (
    <article className="explore-card">
      <span className="pill">{t.pill}</span><h3>{t.title}</h3><p>{t.lead} <SourceReference ids={[1, 10]} lang={lang} /></p>
      <svg className="explore-dev" viewBox="-6 0 612 222" role="img" aria-label={t.aria(age)}>
        <path d={gapArea} className="gap" />
        <line x1="0" y1="180" x2="600" y2="180" className="axis" />
        {[10, 15, 20, 25].map(a => <text key={a} x={X(a)} y="200" textAnchor={a === 10 ? 'start' : a === 25 ? 'end' : 'middle'}>{a}</text>)}
        <text x="2" y="16">{t.y}</text>
        <path d={path(reward)} className="line reward" /><path d={path(control)} className="line control" />
        <line x1={X(age)} y1="24" x2={X(age)} y2="180" className="marker" />
        <circle cx={X(age)} cy={Y(reward(age))} r="6" className="dot reward" /><circle cx={X(age)} cy={Y(control(age))} r="6" className="dot control" />
      </svg>
      <div className="explore-dev-legend" aria-hidden="true"><span className="reward">{t.reward}</span><span className="control">{t.control}</span></div>
      <label className="explore-range"><span>{t.age}: <b>{age} {t.years}</b></span><input type="range" min={10} max={25} step={1} value={age} onChange={e => setAge(Number(e.target.value))} /></label>
      <p className="small">{t.gap} {t.note}</p>
    </article>
  );
}
