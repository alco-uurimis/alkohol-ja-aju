import type { ArticleLang, ArticleTopicLink } from './types';
import './article-support.css';

type Step = {
  href: string;
  eyebrow: Record<ArticleLang, string>;
  title: Record<ArticleLang, string>;
  description: Record<ArticleLang, string>;
};

type StepPlan = {
  main: Step;
  practice: Step;
  nextArticleId: string;
};

const quiz: Step = {
  href: '../#viktoriin',
  eyebrow: { ru: 'ПРОВЕРЬ', et: 'KONTROLLI' },
  title: { ru: 'Проверить мифы и факты', et: 'Kontrolli müüte ja fakte' },
  description: { ru: 'Десять коротких вопросов с объяснениями и источниками.', et: 'Kümme lühikest küsimust koos selgituste ja allikatega.' },
};

const plans: Record<string, StepPlan> = {
  'acute-effects': {
    main: {
      href: '../#teadmised', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Вернуться к научной базе', et: 'Tagasi teadusliku aluse juurde' },
      description: { ru: 'Посмотри, как сайт отделяет факт исследования от личного вывода.', et: 'Vaata, kuidas leht eristab uuringufakti isiklikust järeldusest.' },
    },
    practice: {
      href: '../#labor', eyebrow: { ru: 'ПОПРОБОВАТЬ', et: 'PROOVI' },
      title: { ru: 'Мини-игры на реакцию и внимание', et: 'Reaktsiooni- ja tähelepanumängud' },
      description: { ru: 'Результат описывает попытку, а не действие алкоголя и не состояние человека.', et: 'Tulemus kirjeldab katset, mitte alkoholi mõju ega inimese seisundit.' },
    },
    nextArticleId: 'memory-blackouts',
  },
  'memory-blackouts': {
    main: {
      href: '../#teadmised', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Карта памяти и терминов', et: 'Mälu ja mõistete kaart' },
      description: { ru: 'Свяжи запись воспоминаний с работой систем мозга в упрощённой схеме.', et: 'Seo mälestuste talletamine aju süsteemidega lihtsustatud skeemil.' },
    },
    practice: {
      href: '../#malu', eyebrow: { ru: 'ПОПРОБОВАТЬ', et: 'PROOVI' },
      title: { ru: 'Упражнение на память', et: 'Mäluharjutus' },
      description: { ru: 'Потренируй запоминание и узнавание без связи с употреблением алкоголя.', et: 'Harjuta meeldejätmist ja äratundmist ilma seoseta alkoholitarvitamisega.' },
    },
    nextArticleId: 'adolescent-brain',
  },
  'adolescent-brain': {
    main: {
      href: '../#aju', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Посмотреть функции мозга', et: 'Vaata aju funktsioone' },
      description: { ru: 'Интерактивная схема помогает различать функции, но не предсказывает судьбу человека.', et: 'Interaktiivne skeem aitab eristada funktsioone, kuid ei ennusta inimese tulevikku.' },
    },
    practice: {
      href: '../#tahelepanu', eyebrow: { ru: 'ПОПРОБОВАТЬ', et: 'PROOVI' },
      title: { ru: 'Упражнение на внимание', et: 'Tähelepanuülesanne' },
      description: { ru: 'Попробуй учебную задачу: её балл не является оценкой здоровья или развития.', et: 'Proovi õppeülesannet: selle tulemus ei ole tervise ega arengu hinnang.' },
    },
    nextArticleId: 'self-control',
  },
  'self-control': {
    main: {
      href: '../#aju', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Функции внимания и решений', et: 'Tähelepanu ja otsustamise funktsioonid' },
      description: { ru: 'Посмотри, почему торможение реакции — только одна часть самоконтроля.', et: 'Vaata, miks reaktsiooni pidurdamine on vaid üks osa enesekontrollist.' },
    },
    practice: {
      href: '../#labor', eyebrow: { ru: 'ПОПРОБОВАТЬ', et: 'PROOVI' },
      title: { ru: 'Игры с реакцией и конфликтом', et: 'Reaktsiooni- ja konfliktimängud' },
      description: { ru: 'Они показывают устройство задач, но не измеряют способность человека безопасно действовать.', et: 'Need näitavad ülesannete ülesehitust, kuid ei mõõda inimese võimet ohutult tegutseda.' },
    },
    nextArticleId: 'alcohol-and-sleep',
  },
  'alcohol-and-sleep': {
    main: {
      href: '../#teadmised', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Как читать научный вывод', et: 'Kuidas teadusjäreldust lugeda' },
      description: { ru: 'Сравни тип исследования, группу участников и границы того, что можно утверждать.', et: 'Võrdle uuringutüüpi, osalejate rühma ja väite piire.' },
    },
    practice: {
      href: '../#samoprov', eyebrow: { ru: 'ПРОВЕРИТЬ ХОД МЫСЛИ', et: 'KONTROLLI ARUTLUST' },
      title: { ru: 'Самопроверка научного утверждения', et: 'Teadusväite enesekontroll' },
      description: { ru: 'Потренируйся отличать связь, причину и вывод о конкретном человеке.', et: 'Harjuta seose, põhjuse ja ühe inimese kohta tehtava järelduse eristamist.' },
    },
    nextArticleId: 'alcohol-and-driving',
  },
  'alcohol-and-driving': {
    main: {
      href: '../#aju', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Внимание, реакция и решения', et: 'Tähelepanu, reaktsioon ja otsused' },
      description: { ru: 'Увидь, почему безопасность зависит от сочетания функций, а не одного показателя.', et: 'Näe, miks ohutus sõltub funktsioonide koosmõjust, mitte ühest näitajast.' },
    },
    practice: {
      href: '../#labor', eyebrow: { ru: 'ПОПРОБОВАТЬ', et: 'PROOVI' },
      title: { ru: 'Понять границы мини-игр', et: 'Mõista minimängude piire' },
      description: { ru: 'Игры не проверяют готовность к вождению и не могут подтвердить безопасность за рулём.', et: 'Mängud ei kontrolli sõiduvalmidust ega saa kinnitada roolis ohutust.' },
    },
    nextArticleId: 'reward-and-habits',
  },
  'reward-and-habits': {
    main: {
      href: '../#teadmised', eyebrow: { ru: 'РАЗОБРАТЬСЯ', et: 'MÕISTA' },
      title: { ru: 'Термины и системы сигналов', et: 'Mõisted ja signaalisüsteemid' },
      description: { ru: 'Посмотри упрощённую схему нейромедиаторов без сведения поведения к одному веществу.', et: 'Vaata lihtsustatud neuromediaatorite skeemi, taandamata käitumist ühele ainele.' },
    },
    practice: {
      href: '../#obsuzhdenie', eyebrow: { ru: 'ОБСУДИТЬ', et: 'ARUTLE' },
      title: { ru: 'Вопросы о среде и привычках', et: 'Küsimused keskkonna ja harjumuste kohta' },
      description: { ru: 'Обсуди влияние ситуаций и окружения без необходимости рассказывать личный опыт.', et: 'Arutle olukordade ja keskkonna mõju üle, ilma et peaksid isiklikust kogemusest rääkima.' },
    },
    nextArticleId: 'recovery-and-brain',
  },
  'recovery-and-brain': {
    main: {
      href: '../#meelespea', eyebrow: { ru: 'ОБРАТИТЬСЯ К ГЛАВНОМУ', et: 'VÕTA KAASA PEAMINE' },
      title: { ru: 'Главные выводы маршрута', et: 'Teekonna põhipunktid' },
      description: { ru: 'Вернись к короткому резюме и отдели возможное улучшение от обещания результата.', et: 'Naase lühikokkuvõtte juurde ja erista võimalikku paranemist tulemuse lubamisest.' },
    },
    practice: {
      href: '../#samoprov', eyebrow: { ru: 'ПРОВЕРИТЬ ХОД МЫСЛИ', et: 'KONTROLLI ARUTLUST' },
      title: { ru: 'Самопроверка научного вывода', et: 'Teadusjärelduse enesekontroll' },
      description: { ru: 'Проверь, как не переносить групповой результат на одного человека.', et: 'Kontrolli, kuidas mitte kanda rühmatulemust üle ühele inimesele.' },
    },
    nextArticleId: 'acute-effects',
  },
};

type Props = {
  articleId: string;
  topics: ArticleTopicLink[];
  lang: ArticleLang;
};

function StepCard({ step, lang }: { step: Step; lang: ArticleLang }) {
  return <a className="related-next-steps__card" href={step.href}>
    <span>{step.eyebrow[lang]}</span>
    <strong>{step.title[lang]}</strong>
    <p>{step.description[lang]}</p>
  </a>;
}

export function RelatedNextSteps({ articleId, topics, lang }: Props) {
  const plan = plans[articleId];
  if (!plan) return null;
  const nextTopic = topics.find(topic => topic.id === plan.nextArticleId);
  const nextStep: Step | null = nextTopic ? {
    href: `../${nextTopic.id}/`,
    eyebrow: { ru: 'СЛЕДУЮЩАЯ ТЕМА', et: 'JÄRGMINE TEEMA' },
    title: { ru: nextTopic.title.ru, et: nextTopic.title.et },
    description: { ru: 'Продолжи чтение с другой стороны темы.', et: 'Jätka lugemist teema teisest küljest.' },
  } : null;

  return <section className="related-next-steps" aria-labelledby="related-next-steps-title">
    <div className="related-next-steps__intro">
      <span>{lang === 'ru' ? 'ПРОДОЛЖИТЬ МАРШРУТ' : 'JÄTKA ÕPPERADA'}</span>
      <h2 id="related-next-steps-title">{lang === 'ru' ? 'Связать тему с практикой' : 'Seo teema praktikaga'}</h2>
      <p>{lang === 'ru' ? 'Выбери следующий шаг: схема, учебное задание, проверка знаний или соседняя научная тема.' : 'Vali järgmine samm: skeem, õppeülesanne, teadmiste kontroll või järgmine teadusteema.'}</p>
    </div>
    <div className="related-next-steps__grid">
      <StepCard step={plan.main} lang={lang} />
      <StepCard step={plan.practice} lang={lang} />
      <StepCard step={quiz} lang={lang} />
      {nextStep && <StepCard step={nextStep} lang={lang} />}
    </div>
  </section>;
}

