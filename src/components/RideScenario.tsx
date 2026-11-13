import { useEffect, useId, useRef, useState } from 'react';
import './ride-scenario.css';

const copy = {
  ru: {
    title: 'Что бы ты сделал?',
    story: 'После вечеринки знакомый предлагает подвезти тебя. Ты видел, что он пил. Он говорит: «Я нормально себя чувствую, ехать всего пять минут».',
    prompt: 'Как ты поступишь?',
    choices: [
      ['Сяду в машину. Пять минут — это недолго.', 'Даже короткая поездка может потребовать быстрой реакции. Расстояние не убирает риск.'],
      ['Попрошу его выпить кофе и подожду.', 'Кофе может взбодрить, но не возвращает способность безопасно вести машину. Лучше выбрать другой транспорт.'],
      ['Откажусь и найду другой способ добраться домой.', 'Так ты избегаешь поездки с водителем, который пил. Можно позвонить трезвому знакомому, взять такси или проверить общественный транспорт.'],
    ],
    phrase: 'Можно сказать: «Спасибо, я поеду другим способом. Давай и тебе найдём, как добраться домой».',
    source: 'Советы Департамента транспорта Эстонии',
  },
  et: {
    title: 'Mida sina teeksid?',
    story: 'Pärast pidu pakub tuttav sulle küüti. Nägid, et ta jõi alkoholi. Ta ütleb: „Tunnen end hästi, sõit kestab vaid viis minutit.“',
    prompt: 'Kuidas sa tegutsed?',
    choices: [
      ['Istun autosse. Viis minutit on lühike aeg.', 'Ka lühikesel sõidul võib vaja minna kiiret reaktsiooni. Lühike vahemaa ei kõrvalda ohtu.'],
      ['Palun tal kohvi juua ja ootan.', 'Kohv võib teha erksamaks, kuid ei taasta ohutu juhtimise võimet. Vali teine sõiduvõimalus.'],
      ['Keeldun ja leian teise võimaluse koju jõuda.', 'Nii väldid sõitu alkoholi tarvitanud juhiga. Võid helistada kainele tuttavale, võtta takso või vaadata ühistranspordi võimalusi.'],
    ],
    phrase: 'Võid öelda: „Aitäh, ma lähen teistmoodi. Leiame ka sulle viisi koju jõuda.“',
    source: 'Transpordiameti soovitused',
  },
  en: {
    title: 'What would you do?',
    story: 'After a party, someone you know offers you a lift. You saw them drinking. They say, “I feel fine. It’s only a five-minute drive.”',
    prompt: 'What would you do next?',
    choices: [
      ['Get in. Five minutes isn’t far.', 'Even a short drive can require quick reactions. A short distance does not remove the risk.'],
      ['Ask them to have a coffee and wait.', 'Coffee may make someone feel more alert, but it does not restore their ability to drive safely. Choose another way home.'],
      ['Decline and find another way home.', 'You avoid riding with someone who has been drinking. You could call someone sober, take a taxi, or check public transport.'],
    ],
    phrase: 'You could say, “Thanks, I’ll get home another way. Let’s find a ride for you too.”',
    source: 'Advice from the Estonian Transport Administration (in Estonian)',
  },
};

export default function RideScenario({ lang }: { lang: keyof typeof copy }) {
  const [choice, setChoice] = useState<number | null>(null);
  const titleId = useId();
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    if (location.hash === "#what-would-you-do") section.current?.scrollIntoView();
  }, []);
  const t = copy[lang];

  return (
    <section ref={section} id="what-would-you-do" className="ride-scenario" aria-labelledby={titleId}>
      <h2 id={titleId}>{t.title}</h2>
      <p>{t.story}</p>
      <fieldset>
        <legend>{t.prompt}</legend>
        <div className="ride-scenario__choices">
          {t.choices.map(([label], index) => (
            <button type="button" key={index} aria-pressed={choice === index} onClick={() => setChoice(index)}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div role="status">
        {choice !== null && <div className="ride-scenario__feedback">
          <p>{t.choices[choice][1]}</p>
          <p>{t.phrase}</p>
        </div>}
      </div>
      <a href="https://www.transpordiamet.ee/mootorsoidukijuht">{t.source}</a>
    </section>
  );
}
