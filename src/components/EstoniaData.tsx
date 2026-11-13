import './estonia-data.css';

type Lang = 'et' | 'ru' | 'en';

const sourceUrl = 'https://tai.ee/et/valjaanded/Eesti-koolinoorte-uimastitarvitamise-uuring-2024';
const earlierSourceUrl = 'https://tai.ee/sites/default/files/2021-03/159103814529_Uimastite_tarvitamine_koolinoorte_seas_2019.pdf';
const waves = [
  { year: 2015, percent: 38 },
  { year: 2019, percent: 39 },
  { year: 2024, percent: 31 },
];

const copy = {
  et: {
    title: 'Mida näitavad Eesti andmed?',
    measure: 'Kui suur osa Eesti 15–16-aastastest kooliõpilastest teatas, et oli viimase 30 päeva jooksul alkoholi tarvitanud vähemalt korra?',
    source: 'TAI allikad',
    exercise: 'Tõlgenda graafikut',
    prompt: 'Kui palju näitaja muutus aastatel 2015–2024 ja 2019–2024? Kas see langes igas uuringulaines? Miks ei saa võrrelda 2024. aasta tulemust otse selle veebilehe vabatahtliku küsitlusega?',
    reveal: 'Vaata vastust',
    change: 'Aastatel 2015–2024 langes näitaja 7 protsendipunkti, aastatel 2019–2024 aga 8 protsendipunkti. 2015. ja 2019. aasta tulemused olid lähedased (38% ja 39%). Kolm uuringulainet ei näita vahepealsete aastate tulemusi ega selgita muutuse põhjust.',
    samples: 'ESPAD küsitles Eesti 15–16-aastasi kooliõpilasi viimase 30 päeva kohta. Selle veebilehe küsitlusele vastavad vabatahtlikud alates 15. eluaastast ning avalik tarvitamissagedus käib viimase 12 kuu kohta. Võrdluseks peaksid vanuserühm, osalejate valik ja küsimuse ajavahemik olema võrreldavad.',
    method: 'Veebiküsitluse metoodika',
  },
  ru: {
    title: 'Что показывают данные Эстонии?',
    measure: 'Какая доля школьников Эстонии 15–16 лет сообщила, что употребляла алкоголь хотя бы раз за последние 30 дней?',
    source: 'Источники TAI',
    exercise: 'Объясни график',
    prompt: 'На сколько изменилась доля с 2015 по 2024 год и с 2019 по 2024 год? Снижалась ли она в каждой волне? Почему результат 2024 года нельзя напрямую сравнить с добровольным опросом на сайте?',
    reveal: 'Посмотреть ответ',
    change: 'С 2015 по 2024 год доля снизилась на 7 процентных пунктов, а с 2019 по 2024 год — на 8. В 2015 и 2019 годах показатели были близкими (38% и 39%). Три волны опроса не показывают, что происходило между ними, и не объясняют причину снижения.',
    samples: 'ESPAD опрашивал школьников Эстонии 15–16 лет о последних 30 днях. В опросе сайта участвуют добровольцы от 15 лет, а опубликованный показатель частоты употребления относится к последним 12 месяцам. Для прямого сравнения нужны сопоставимые группы, способ отбора и период вопроса.',
    method: 'Методология опроса сайта',
  },
  en: {
    title: 'What do the data from Estonia show?',
    measure: 'What share of students aged 15–16 in Estonia reported drinking alcohol at least once in the past 30 days?',
    source: 'TAI sources',
    exercise: 'Interpret the chart',
    prompt: 'How much did the share change from 2015 to 2024 and from 2019 to 2024? Did it fall in every wave? Why can’t you directly compare the 2024 figure with this website’s voluntary survey?',
    reveal: 'Show the answer',
    change: 'The share fell by 7 percentage points from 2015 to 2024 and by 8 from 2019 to 2024. The 2015 and 2019 figures were similar (38% and 39%). Three survey waves cannot show what happened between them or explain the decline.',
    samples: 'ESPAD asked students aged 15–16 in Estonia about the past 30 days. This website recruits volunteers aged 15 and over, and its published frequency of use refers to the past 12 months. A direct comparison would require comparable age groups, recruitment and time periods.',
    method: 'Website survey methodology',
  },
};

export default function EstoniaData({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <section id="estonia-data" className="project-section estonia-data" aria-labelledby="estonia-data-title">
      <h2 id="estonia-data-title">{t.title}</h2>
      <figure aria-labelledby="estonia-data-measure">
        <figcaption id="estonia-data-measure">{t.measure}</figcaption>
        <ul className="estonia-data__bars">
          {waves.map(({ year, percent }) => (
            <li key={year}>
              <span>{year}</span>
              <span className="estonia-data__track" aria-hidden="true">
                <span style={{ width: percent + '%' }} />
              </span>
              <strong>{percent}%</strong>
            </li>
          ))}
        </ul>
        <div className="estonia-data__axis" aria-hidden="true"><span>0%</span><span>50%</span><span>100%</span></div>
        <p className="estonia-data__source">{t.source} · <a href={earlierSourceUrl}>ESPAD 2019 (PDF)</a> · <a href={sourceUrl}>ESPAD 2024</a></p>
      </figure>
      <h3>{t.exercise}</h3>
      <p>{t.prompt}</p>
      <details>
        <summary>{t.reveal}</summary>
        <p>{t.change}</p>
        <p>{t.samples}</p>
        <a href={'../methodology/?lang=' + lang}>{t.method}</a>
      </details>
    </section>
  );
}

export function EstoniaDataLink({ lang }: { lang: Lang }) {
  return <a className="estonia-data-link" href={'../science/results/?lang=' + lang + '#estonia-data'}>{copy[lang].title}</a>;
}
