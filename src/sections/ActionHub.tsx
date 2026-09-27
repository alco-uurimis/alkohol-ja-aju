import { useState } from 'react';
import { Section } from '../components/Shared';
import './action-hub.css';

type Lang = 'et' | 'ru';
type ScenarioId = 'friend' | 'journey' | 'pressure' | 'warning';

type Scenario = {
  id: ScenarioId;
  number: string;
  tab: string;
  title: string;
  lead: string;
  steps: string[];
  prompt: string;
  promptAnswer: string;
};

const scenarios: Record<Lang, Scenario[]> = {
  ru: [
    {
      id: 'friend',
      number: '01',
      tab: 'Друг выпил',
      title: 'Если другу стало нехорошо после алкоголя',
      lead: 'Не нужно угадывать степень опьянения. Лучше убрать лишние риски и оставаться рядом.',
      steps: [
        'Перейдите в спокойное и безопасное место; не оставляй человека одного.',
        'Если человек сонный или без сознания, но дышит, поверни его на бок и следи за дыханием, пока ждёте помощь.',
        'Не предлагай ещё алкоголь, лекарства или другие вещества. Кофе, душ и прогулка не отменяют действие алкоголя.',
        'Если знаешь, запомни, что и когда было выпито и были ли другие вещества: это может помочь медикам.',
      ],
      prompt: 'Что важнее всего в первые минуты?',
      promptAnswer: 'Безопасное место, наблюдение и обращение за помощью при сомнении — а не попытка «протрезвить» человека.',
    },
    {
      id: 'journey',
      number: '02',
      tab: 'Дорога домой',
      title: 'Как безопаснее добраться домой',
      lead: 'Самочувствие не показывает, безопасно ли управлять транспортом или ехать с тем, кто выпил.',
      steps: [
        'Не садись за руль и не садись в транспорт, которым управляет человек после алкоголя.',
        'До выхода выбери понятный вариант: трезвый водитель, такси, общественный транспорт или ночёвка.',
        'Держи телефон заряженным и сообщи надёжному человеку, куда направляешься.',
        'Если план меняется, выбирай более безопасный вариант, даже если это неудобно или занимает больше времени.',
      ],
      prompt: 'Как сказать «нет» поездке с выпившим водителем?',
      promptAnswer: 'Коротко и прямо: «Я поеду другим способом» или «Я не сяду в машину, если водитель пил». Объяснение не обязательно.',
    },
    {
      id: 'pressure',
      number: '03',
      tab: 'Давление компании',
      title: 'Если на тебя давят или торопят',
      lead: 'Отказ не требует оправданий. Заранее подготовленная короткая фраза облегчает выход из ситуации.',
      steps: [
        'Выбери фразу, которую легко повторить: «Нет, спасибо», «Я сегодня без алкоголя» или «Я ухожу».',
        'Договорись с другом о сигнале или времени ухода до встречи.',
        'Смени место, тему разговора или обратись к взрослому, которому доверяешь, если давление не прекращается.',
        'Поддержи человека рядом, который тоже хочет отказаться: вдвоём легче удержать границу.',
      ],
      prompt: 'Нужно ли доказывать свой отказ?',
      promptAnswer: 'Нет. Граница становится яснее, когда ответ короткий, спокойный и не превращается в спор.',
    },
    {
      id: 'warning',
      number: '04',
      tab: 'Тревожные признаки',
      title: 'Когда нужна срочная помощь',
      lead: 'Не жди, пока появятся все признаки. В ситуации с возможным отравлением безопаснее действовать раньше.',
      steps: [
        'Срочно свяжись с местной экстренной службой, если человека трудно разбудить, он не реагирует, у него судороги, повторная рвота или медленное либо нерегулярное дыхание.',
        'Также тревожны спутанность сознания, очень холодная, липкая, бледная или синюшная кожа.',
        'Оставайся рядом. Если человек без сознания, но дышит, поверни его на бок; следуй инструкциям диспетчера.',
        'Не рассчитывай, что человек «проспится»: состояние может ухудшаться и после того, как он перестал пить.',
      ],
      prompt: 'Нужно ли быть уверенным, что это именно отравление алкоголем?',
      promptAnswer: 'Нет. При опасных признаках задача — получить срочную помощь, а не поставить причину самостоятельно.',
    },
  ],
  et: [
    {
      id: 'friend',
      number: '01',
      tab: 'Sõber jõi',
      title: 'Kui sõbral hakkab pärast alkoholi tarvitamist halb',
      lead: 'Joobe tugevust ei ole vaja ära arvata. Olulisem on vähendada lisariske ja jääda inimese juurde.',
      steps: [
        'Liikuge rahulikku ja turvalisse kohta; ära jäta inimest üksi.',
        'Kui inimene on unine või teadvuseta, kuid hingab, keera ta külili ja jälgi hingamist abi saabumiseni.',
        'Ära anna juurde alkoholi, ravimeid ega muid aineid. Kohv, dušš ja kõndimine ei tühista alkoholi mõju.',
        'Kui tead, jäta meelde, mida ja millal tarvitati ning kas kasutati ka muid aineid: see võib meditsiinitöötajaid aidata.',
      ],
      prompt: 'Mis on esimestel minutitel kõige olulisem?',
      promptAnswer: 'Turvaline koht, inimese jälgimine ja kahtluse korral abi kutsumine — mitte inimese „kaineks tegemise” katse.',
    },
    {
      id: 'journey',
      number: '02',
      tab: 'Tee koju',
      title: 'Kuidas turvalisemalt koju jõuda',
      lead: 'Enesetunne ei näita, kas sõiduki juhtimine või alkoholi tarvitanud juhiga sõitmine on ohutu.',
      steps: [
        'Ära juhi ise ega istu sõidukisse, mida juhib alkoholi tarvitanud inimene.',
        'Vali enne lahkumist selge võimalus: kaine juht, takso, ühistransport või ööbimine.',
        'Hoia telefon laetud ja anna usaldusväärsele inimesele teada, kuhu lähed.',
        'Kui plaan muutub, vali turvalisem võimalus isegi siis, kui see on ebamugavam või võtab rohkem aega.',
      ],
      prompt: 'Kuidas keelduda alkoholi tarvitanud juhiga sõitmisest?',
      promptAnswer: 'Lühidalt ja otse: „Ma lähen teist moodi” või „Ma ei istu autosse, kui juht on joonud.” Põhjendus ei ole vajalik.',
    },
    {
      id: 'pressure',
      number: '03',
      tab: 'Eakaaslaste surve',
      title: 'Kui sind survestatakse või kiirustatakse',
      lead: 'Keeldumine ei vaja vabandust. Ette valmistatud lühike lause aitab olukorrast välja tulla.',
      steps: [
        'Vali lause, mida on lihtne korrata: „Ei, aitäh”, „Ma ei joo täna” või „Ma lähen nüüd”.',
        'Lepi sõbraga enne kohtumist kokku märguanne või lahkumisaeg.',
        'Vaheta kohta või teemat või pöördu usaldusväärse täiskasvanu poole, kui surve ei lõpe.',
        'Toeta enda kõrval olevat inimest, kes soovib samuti keelduda: koos on lihtsam piiri hoida.',
      ],
      prompt: 'Kas oma keeldumist peab tõestama?',
      promptAnswer: 'Ei. Piir on selgem, kui vastus on lühike, rahulik ega muutu vaidluseks.',
    },
    {
      id: 'warning',
      number: '04',
      tab: 'Ohumärgid',
      title: 'Millal on vaja kiiret abi',
      lead: 'Ära oota kõigi märkide ilmumist. Võimaliku mürgistuse korral on turvalisem tegutseda varem.',
      steps: [
        'Võta kohe ühendust kohaliku hädaabiga, kui inimest on raske äratada, ta ei reageeri, tal on krambid, korduv oksendamine või aeglane või ebaregulaarne hingamine.',
        'Ohumärgid on ka segasus ning väga külm, niiske, kahvatu või sinakas nahk.',
        'Jää inimese juurde. Kui ta on teadvuseta, kuid hingab, keera ta külili ja järgi hädaabi juhiseid.',
        'Ära eelda, et inimene „magab selle välja”: seisund võib halveneda ka pärast joomise lõppemist.',
      ],
      prompt: 'Kas peab olema kindel, et tegu on just alkoholimürgistusega?',
      promptAnswer: 'Ei. Ohtlike märkide korral on oluline saada kiiresti abi, mitte ise põhjust diagnoosida.',
    },
  ],
};

function HelpLinks({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';

  return (
    <div className="action-hub-help">
      <div>
        <p className="action-hub-kicker">{ru ? 'ПОДДЕРЖКА' : 'TOETUS'}</p>
        <h3>{ru ? 'Где искать надёжную помощь' : 'Kust leida usaldusväärset abi'}</h3>
        <p>
          {ru
            ? 'Если ситуация не экстренная, начни с семейного врача, школьной медсестры, психолога или службы, которая помогает сократить употребление алкоголя. За советом можно обратиться и из-за близкого человека.'
            : 'Kui olukord ei ole erakorraline, alusta perearsti või -õe, kooliõe, psühholoogi või alkoholitarvitamise vähendamise teenusega. Nõu võib küsida ka lähedase inimese pärast.'}
        </p>
      </div>
      <a
        className="action-hub-help-link"
        href="https://selge.alkoinfo.ee/kuhupoorduda"
        target="_blank"
        rel="noopener noreferrer"
      >
          {ru ? 'Открыть официальный справочник помощи в Эстонии' : 'Ava Eesti ametlik abiinfo'}
      </a>
    </div>
  );
}

export default function ActionHub({ lang }: { lang: Lang }) {
  const ru = lang === 'ru';
  const localized = scenarios[lang];
  const [active, setActive] = useState<ScenarioId>('friend');
  const activeScenario = localized.find((scenario) => scenario.id === active) ?? localized[0];

  return (
    <Section
      id="tegevus"
      number={ru ? '10 / ДЕЙСТВУЙ' : '10 / TEGUTSE'}
      title={ru ? 'Что делать в реальной ситуации?' : 'Mida teha päriselus?'}
      intro={ru
        ? 'Это не диагностика и не оценка человека. Выбери знакомую ситуацию, чтобы заранее продумать спокойный и более безопасный следующий шаг.'
        : 'See ei ole diagnoos ega inimese hindamine. Vali tuttav olukord, et mõelda rahulikult läbi turvalisem järgmine samm.'}
      className="action-hub-section"
    >
      <div className="action-hub-shell">
        <div className="action-hub-intro">
          <p className="action-hub-kicker">{ru ? 'СЦЕНАРИИ БЕЗ ЗАПУГИВАНИЯ' : 'OLUKORRAD ILMA HIRMUTAMISETA'}</p>
          <p>
            {ru
              ? 'В неопределённой ситуации безопаснее обратиться за помощью раньше. Не нужно доказывать, что человеку «достаточно плохо», чтобы поддержать его.'
              : 'Ebaselges olukorras on turvalisem abi otsida varem. Inimese toetamiseks ei pea tõestama, et tal on „piisavalt halb”.'}
          </p>
        </div>

        <div className="action-hub-layout">
          <div className="action-hub-tabs" role="group" aria-label={ru ? 'Практические ситуации' : 'Praktilised olukorrad'}>
            {localized.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                aria-pressed={activeScenario.id === scenario.id}
                className={activeScenario.id === scenario.id ? 'is-active' : ''}
                onClick={() => setActive(scenario.id)}
              >
                <span className="action-hub-tab-number" aria-hidden="true">{scenario.number}</span>
                <span>{scenario.tab}</span>
              </button>
            ))}
          </div>

          <article
            className={`action-hub-card action-hub-card--${activeScenario.id}`}
          >
            <div className="action-hub-card-top">
              <span aria-hidden="true">{activeScenario.number}</span>
              <p>{ru ? 'ПРАКТИЧЕСКИЙ ШАГ' : 'PRAKTILINE SAMM'}</p>
            </div>
            <h3>{activeScenario.title}</h3>
            <p className="action-hub-lead">{activeScenario.lead}</p>
            <ol className="action-hub-steps">
              {activeScenario.steps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{index + 1}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
            <div className="action-hub-answer">
              <p>{activeScenario.prompt}</p>
              <strong>{activeScenario.promptAnswer}</strong>
            </div>
          </article>
        </div>

        <aside className="action-hub-emergency" aria-label={ru ? 'Когда действовать срочно' : 'Millal tegutseda kiiresti'}>
          <div className="action-hub-emergency-index" aria-hidden="true">!</div>
          <div>
            <p className="action-hub-kicker">{ru ? 'ПРИ СОМНЕНИИ — ДЕЙСТВУЙ' : 'KAHTLUSE KORRAL TEGUTSE'}</p>
            <h3>{ru ? 'Без сознания или трудно дышит?' : 'Teadvuseta või raske hingata?'}</h3>
            <p>
              {ru
                ? 'В Эстонии звони 112. Оставайся рядом и следуй инструкциям диспетчера. Не оставляй человека «проспаться» одного.'
                : 'Eestis helista 112. Jää inimese juurde ja järgi hädaabi juhiseid. Ära jäta teda üksinda „välja magama”.'}
            </p>
          </div>
          <a href={ru?'https://www.112.ee/en/instruction/emergency-phone-number-112':'https://www.112.ee/et/juhend/hadaabinumber-112'} target="_blank" rel="noopener noreferrer">
            {ru ? 'Экстренная помощь в Эстонии — 112' : 'Hädaabi Eestis — 112'}
          </a>
        </aside>

        <HelpLinks lang={lang} />

        <div className="action-hub-limit" role="note">
          <span aria-hidden="true">01</span>
          <p>
            <strong>{ru ? 'Граница этого раздела. ' : 'Selle osa piir. '}</strong>
            {ru
              ? 'Карточки помогают выбрать безопасное действие в распространённых ситуациях, но не определяют степень опьянения, диагноз или индивидуальный риск. Если есть опасные признаки, ориентируйся на срочную помощь, а не на результат игры или внешний вид человека.'
              : 'Kaardid aitavad levinud olukordades valida turvalisemat tegevust, kuid ei määra joobe astet, diagnoosi ega inimese riski. Ohumärkide korral lähtu kiirest abist, mitte mängutulemusest või inimese väljanägemisest.'}
          </p>
        </div>
      </div>
    </Section>
  );
}

