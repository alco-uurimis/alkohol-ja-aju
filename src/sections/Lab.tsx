import { useEffect, useRef, useState } from 'react';
import { ExerciseNote, Section } from '../components/Shared';

type Lang = 'et' | 'ru';
type ReactionState = 'idle' | 'waiting' | 'go' | 'result' | 'false-start';
type SignalPhase = 'idle' | 'showing' | 'input' | 'result';
type Ink = 'violet' | 'lime' | 'cyan' | 'coral';

const inks: Ink[] = ['violet', 'lime', 'cyan', 'coral'];
const signalNodes = [0, 1, 2, 3];

function ReactionGame({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';
  const [state, setState] = useState<ReactionState>('idle');
  const [result, setResult] = useState<number | null>(null);
  const timer = useRef<number | null>(null);
  const startedAt = useRef(0);

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => () => clearTimer(), []);
  useEffect(() => {
    clearTimer();
    setState('idle');
    setResult(null);
  }, [lang]);

  const start = () => {
    clearTimer();
    setResult(null);
    setState('waiting');
    const delay = 1200 + Math.random() * 2200;
    timer.current = window.setTimeout(() => {
      startedAt.current = performance.now();
      setState('go');
      timer.current = null;
    }, delay);
  };

  const tap = () => {
    if (state === 'waiting') {
      clearTimer();
      setState('false-start');
      return;
    }
    if (state === 'go') {
      setResult(Math.round(performance.now() - startedAt.current));
      setState('result');
    }
  };

  const label = state === 'waiting'
    ? (ru ? 'Жди сигнала…' : 'Oota märguannet…')
    : state === 'go'
      ? (ru ? 'ЖМИ!' : 'VAJUTA!')
      : state === 'result'
        ? `${result} ms`
        : state === 'false-start'
          ? (ru ? 'Слишком рано' : 'Liiga vara')
          : (ru ? 'Тест реакции' : 'Reaktsioonitest');

  return <article className="lab-card reaction-game">
    <div className="lab-card-top"><span>01</span><span>{ru ? 'РЕАКЦИЯ' : 'REAKTSIOON'}</span></div>
    <h3>{ru ? 'Поймай зелёный сигнал' : 'Püüa roheline signaal'}</h3>
    <p>{ru ? 'Нажми «Старт», дождись смены поля и кликни как можно быстрее.' : 'Vajuta „Start“, oota välja muutumist ja reageeri nii kiiresti kui saad.'}</p>
    <button className={`reaction-pad state-${state}`} onClick={tap} disabled={state === 'idle' || state === 'result' || state === 'false-start'} aria-live="polite">
      <span className="reaction-dot" aria-hidden="true" />
      <strong>{label}</strong>
      <small>{state === 'waiting' ? (ru ? 'Не нажимай заранее' : 'Ära vajuta enne signaali') : (ru ? 'мс = миллисекунды' : 'ms = millisekundid')}</small>
    </button>
    {(state === 'idle' || state === 'result' || state === 'false-start') && <button className="button primary" onClick={start}>{state === 'idle' ? (ru ? 'Начать' : 'Alusta') : (ru ? 'Ещё раз' : 'Proovi uuesti')}</button>}
  </article>;
}

function buildStroopRounds() {
  return Array.from({ length: 8 }, () => {
    const word = Math.floor(Math.random() * inks.length);
    let ink = Math.floor(Math.random() * inks.length);
    while (ink === word) ink = Math.floor(Math.random() * inks.length);
    return { word: inks[word], ink: inks[ink] };
  });
}

function StroopGame({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';
  const names: Record<Ink, string> = ru
    ? { violet: 'фиолетовый', lime: 'лаймовый', cyan: 'голубой', coral: 'коралловый' }
    : { violet: 'lilla', lime: 'laim', cyan: 'tsüaan', coral: 'korall' };
  const [rounds, setRounds] = useState(buildStroopRounds);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const roundStarted = useRef(0);

  useEffect(() => {
    setActive(false);
    setDone(false);
    setIndex(0);
    setScore(0);
    setTimes([]);
  }, [lang]);

  const start = () => {
    setRounds(buildStroopRounds());
    setIndex(0);
    setScore(0);
    setTimes([]);
    setDone(false);
    setActive(true);
    roundStarted.current = performance.now();
  };

  const answer = (choice: Ink) => {
    if (!active) return;
    const current = rounds[index];
    const nextScore = score + (choice === current.ink ? 1 : 0);
    const nextTimes = [...times, performance.now() - roundStarted.current];
    setScore(nextScore);
    setTimes(nextTimes);
    if (index === rounds.length - 1) {
      setActive(false);
      setDone(true);
    } else {
      setIndex(index + 1);
      roundStarted.current = performance.now();
    }
  };

  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const current = rounds[index];

  return <article className="lab-card stroop-game">
    <div className="lab-card-top"><span>02</span><span>STROOP</span></div>
    <h3>{ru ? 'Смотри на цвет, а не на слово' : 'Vaata värvi, mitte sõna'}</h3>
    <p>{ru ? 'Назови цвет букв. Само слово специально будет мешать.' : 'Vali tähtede värv. Sõna ise püüab sind meelega eksitada.'}</p>
    {!active && !done && <div className="stroop-intro"><span className="stroop-word ink-cyan">{names.violet}</span><p className="small">{ru ? 'Здесь правильный ответ — голубой.' : 'Siin on õige vastus tsüaan.'}</p><button className="button primary" onClick={start}>{ru ? 'Запустить 8 раундов' : 'Alusta 8 vooru'}</button></div>}
    {active && <div className="stroop-stage">
      <div className="stroop-progress"><span>{index + 1} / {rounds.length}</span><span>{ru ? 'Правильно' : 'Õigeid'}: {score}</span></div>
      <div className={`stroop-word ink-${current.ink}`} aria-label={ru ? `Слово ${names[current.word]}, цвет букв ${names[current.ink]}` : `Sõna ${names[current.word]}, tähtede värv ${names[current.ink]}`}>{names[current.word]}</div>
      <div className="stroop-options">{inks.map(ink => <button key={ink} className={`swatch swatch-${ink}`} onClick={() => answer(ink)}><span aria-hidden="true" />{names[ink]}</button>)}</div>
    </div>}
    {done && <div className="mini-result"><strong>{score} / 8</strong><span>{ru ? `Средняя реакция: ${avg} мс` : `Keskmine vastus: ${avg} ms`}</span><button className="button" onClick={start}>{ru ? 'Повторить' : 'Uus katse'}</button></div>}
  </article>;
}

function SignalGame({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';
  const [phase, setPhase] = useState<SignalPhase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [won, setWon] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach(id => window.clearTimeout(id));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);
  useEffect(() => {
    clearTimers();
    setPhase('idle');
    setSequence([]);
    setActiveNode(null);
    setInputIndex(0);
    setWon(false);
  }, [lang]);

  const play = (seq: number[]) => {
    clearTimers();
    setPhase('showing');
    setInputIndex(0);
    seq.forEach((node, i) => {
      timers.current.push(window.setTimeout(() => setActiveNode(node), i * 650 + 250));
      timers.current.push(window.setTimeout(() => setActiveNode(null), i * 650 + 600));
    });
    timers.current.push(window.setTimeout(() => setPhase('input'), seq.length * 650 + 300));
  };

  const start = () => {
    const first = Array.from({ length: 3 }, () => signalNodes[Math.floor(Math.random() * signalNodes.length)]);
    setWon(false);
    setSequence(first);
    play(first);
  };

  const tapNode = (node: number) => {
    if (phase !== 'input') return;
    if (node !== sequence[inputIndex]) {
      setWon(false);
      setPhase('result');
      return;
    }
    if (inputIndex === sequence.length - 1) {
      if (sequence.length >= 6) {
        setWon(true);
        setPhase('result');
        return;
      }
      const next = [...sequence, signalNodes[Math.floor(Math.random() * signalNodes.length)]];
      setSequence(next);
      setPhase('showing');
      timers.current.push(window.setTimeout(() => play(next), 650));
    } else {
      setInputIndex(inputIndex + 1);
    }
  };

  return <article className="lab-card signal-game">
    <div className="lab-card-top"><span>03</span><span>{ru ? 'СИГНАЛ' : 'SIGNAAL'}</span></div>
    <h3>{ru ? 'Повтори путь импульса' : 'Korda impulsi rada'}</h3>
    <p>{ru ? 'Запомни, какие нейроны вспыхивают, и повтори последовательность. Каждый уровень добавляет один сигнал.' : 'Jäta meelde, millised neuronid süttivad, ja korda järjekorda. Iga tase lisab ühe signaali.'}</p>
    <div className={`signal-board phase-${phase}`} aria-label={ru ? 'Поле из четырёх нейронов' : 'Nelja neuroni mänguväli'}>
      <svg viewBox="0 0 100 100" className="signal-lines" aria-hidden="true"><path d="M20 24 C45 18 55 18 80 28M20 24 C35 50 35 70 28 78M80 28 C65 50 68 68 76 78M28 78 C48 68 58 70 76 78M20 24 C50 45 54 54 76 78M80 28 C54 42 46 57 28 78" /></svg>
      {signalNodes.map(node => <button key={node} className={`signal-node node-${node} ${activeNode === node ? 'active' : ''}`} disabled={phase !== 'input'} onClick={() => tapNode(node)} aria-label={(ru ? 'Нейрон ' : 'Neuron ') + (node + 1)}><span /></button>)}
      <div className="signal-board-status" aria-live="polite">{phase === 'idle' ? (ru ? 'Готов?' : 'Valmis?') : phase === 'showing' ? (ru ? 'Смотри…' : 'Vaata…') : phase === 'input' ? (ru ? `Твой ход · ${inputIndex + 1}/${sequence.length}` : `Sinu kord · ${inputIndex + 1}/${sequence.length}`) : won ? (ru ? 'Цепочка из 6 сигналов!' : '6 signaali järjest!') : (ru ? 'Цепочка прервалась' : 'Signaal katkes')}</div>
    </div>
    {(phase === 'idle' || phase === 'result') && <button className="button primary" onClick={start}>{phase === 'idle' ? (ru ? 'Показать последовательность' : 'Näita järjestust') : (ru ? 'Новая цепочка' : 'Uus signaalirada')}</button>}
  </article>;
}

const visualCards = [
  ['visual-brainwaves.svg', 'brain'],
  ['visual-neuron.svg', 'neuron'],
  ['visual-memory.svg', 'memory'],
  ['visual-attention.svg', 'attention'],
  ['visual-reaction.svg', 'reaction'],
  ['visual-network.svg', 'network'],
] as const;

export default function Lab({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';
  const [glow, setGlow] = useState(false);
  const labels = ru
    ? { brain: 'Ритмы мозга', neuron: 'Нейрон', memory: 'Контур памяти', attention: 'Фокус внимания', reaction: 'Импульс реакции', network: 'Нейронная сеть' }
    : { brain: 'Ajurütmid', neuron: 'Neuron', memory: 'Mäluring', attention: 'Tähelepanu fookus', reaction: 'Reaktsiooniimpulss', network: 'Närvivõrk' };

  return <Section id="labor" number={ru ? '04 / ИГРОВАЯ ЛАБОРАТОРИЯ' : '04 / MÄNGULABOR'} title={ru ? 'Три коротких игры для мозга' : 'Kolm lühikest ajumängu'} intro={ru ? 'Измерь реакцию, попробуй не читать слово и повтори цепочку сигналов. Это игровые задания, а не тест трезвости и не медицинская оценка.' : 'Mõõda reaktsiooni, proovi sõna mitte lugeda ja korda signaalijada. Need on mängulised ülesanded, mitte kainuse test ega tervisehinnang.'} className={`lab-section ${glow ? 'glow-mode' : ''}`}>
    <div className="lab-toolbar"><div><span className="pill">{ru ? 'ИНТЕРАКТИВ' : 'INTERAKTIIVNE'}</span><p>{ru ? 'Все результаты остаются только в браузере и исчезают после обновления страницы.' : 'Kõik tulemused jäävad ainult brauserisse ja kaovad lehe värskendamisel.'}</p></div><button className="glow-toggle" aria-pressed={glow} onClick={() => setGlow(v => !v)}><span aria-hidden="true">✦</span>{glow ? (ru ? 'Выключить нейросвечение' : 'Lülita neurohelendus välja') : (ru ? 'Включить нейросвечение' : 'Lülita neurohelendus sisse')}</button></div>
    <ExerciseNote lang={lang} />
    <div className="lab-grid"><ReactionGame lang={lang} /><StroopGame lang={lang} /><SignalGame lang={lang} /></div>
    <div className="visual-gallery-heading"><div><span className="eyebrow">{ru ? 'НЕЙРОВИЗУАЛЫ' : 'NEUROVISUAALID'}</span><h3>{ru ? 'Посмотри, как «говорит» мозг' : 'Vaata, kuidas aju „räägib“'}</h3></div><p>{ru ? 'Шесть визуальных сцен превращают память, внимание, реакцию и нейронные сигналы в понятные образы — не как каталог, а как маленькое путешествие внутри мозга.' : 'Kuus visuaalset stseeni muudavad mälu, tähelepanu, reaktsiooni ja närvisignaalid nähtavaks — mitte kataloogina, vaid väikese teekonnana aju sees.'}</p></div>
    <div className="visual-gallery">{visualCards.map(([src, key], i) => <figure key={src} className={`visual-card visual-card-${i + 1}`}><img src={src} alt={labels[key]} loading="lazy" /><figcaption><span>0{i + 1}</span>{labels[key]}</figcaption></figure>)}</div>
    <div className="neuro-marquee" aria-hidden="true"><span>MEMORY · FOCUS · REACTION · SIGNAL · MEMORY · FOCUS · REACTION · SIGNAL · </span></div>
  </Section>;
}
