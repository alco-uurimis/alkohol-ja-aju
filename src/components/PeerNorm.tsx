import { useId, useState } from 'react';
import { lowUseShare, type NormInput } from '../lib/norms';
import './peer-norm.css';

const t = {
  et: {
    title: 'Mida arvad, kui paljud vastanud tarvitavad harva?',
    lead: 'Pakkumine enne tulemuse nägemist: kui paljud sajast küsitlusele vastanust ütlesid, et tarvitasid viimase 12 kuu jooksul alkoholi harvem kui kord kuus või üldse mitte?',
    guess: 'Sinu pakkumine', res: 'Küsitlus', of: 'sajast', reveal: 'Näita tulemust',
    real: (p: number, n: number) => `Küsitluses vastas nii ${p} sajast (vastanuid ${n}).`,
    close: 'Su pakkumine oli peaaegu täpne.', low: (d: number) => `Alahindasid ${d} punkti võrra.`, high: (d: number) => `Ülehindasid ${d} punkti võrra.`,
    note: 'See on vabatahtliku, ise valinud valimi tulemus. See ei kirjelda kõiki noori ega Eestit tervikuna.',
  },
  ru: {
    title: 'Как думаешь, сколько ответивших пьют редко?',
    lead: 'Угадай до результата: сколько из ста ответивших на опрос сказали, что за последние 12 месяцев пили реже раза в месяц или не пили совсем?',
    guess: 'Твоя оценка', res: 'Опрос', of: 'из ста', reveal: 'Показать результат',
    real: (p: number, n: number) => `В опросе так ответили ${p} из ста (ответивших: ${n}).`,
    close: 'Твоя оценка почти точная.', low: (d: number) => `Ты недооценил(а) на ${d} п.`, high: (d: number) => `Ты переоценил(а) на ${d} п.`,
    note: 'Это результат добровольной выборки, которую люди формируют сами. Он не описывает всех подростков и Эстонию в целом.',
  },
  en: {
    title: 'How many respondents do you think drink rarely?',
    lead: 'Guess before you see the result: out of a hundred people who answered the survey, how many said that in the last 12 months they drank less than once a month or not at all?',
    guess: 'Your guess', res: 'Survey', of: 'out of', reveal: 'Show the result',
    real: (p: number, n: number) => `In the survey ${p} out of 100 said so (respondents: ${n}).`,
    close: 'Your guess was almost exact.', low: (d: number) => `You underestimated by ${d} points.`, high: (d: number) => `You overestimated by ${d} points.`,
    note: 'This is the result of a voluntary, self-selected sample. It does not describe all young people or Estonia as a whole.',
  },
} as const;

/** "Guess, then see": appears only when the public aggregate yields an exact, majority figure (see lib/norms). */
export default function PeerNorm({ data, lang }: { data: NormInput; lang: 'et' | 'ru' | 'en' }) {
  const S = t[lang];
  const id = useId();
  const [guess, setGuess] = useState(50);
  const [shown, setShown] = useState(false);
  const norm = lowUseShare(data);
  if (!norm) return null;
  const diff = guess - norm.percent;
  return (
    <section className="peer-norm" aria-labelledby={id}>
      <h2 id={id}>{S.title}</h2>
      <p>{S.lead}</p>
      <label className="peer-norm__guess">
        <span>{S.guess}: <b>{guess}</b> {S.of} 100</span>
        <input type="range" min={0} max={100} step={1} value={guess} onChange={e => { setGuess(Number(e.target.value)); setShown(false); }} />
      </label>
      <button type="button" className="peer-norm__btn" onClick={() => setShown(true)}>{S.reveal}</button>
      <div role="status" aria-live="polite" className="peer-norm__out">
        {shown && <>
          <div className="peer-norm__bars" aria-hidden="true">
            <span>{S.guess}: {guess}</span><i style={{ width: `${guess}%` }} /><span>{S.res}: {norm.percent}</span><i className="real" style={{ width: `${norm.percent}%` }} />
          </div>
          <p><b>{S.real(norm.percent, norm.base)}</b> {Math.abs(diff) <= 5 ? S.close : diff < 0 ? S.low(-diff) : S.high(diff)}</p>
        </>}
      </div>
      <p className="result-base">{S.note}</p>
    </section>
  );
}
