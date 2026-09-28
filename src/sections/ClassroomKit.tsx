import { useMemo, useState } from 'react';
import { Section } from '../components/Shared';
import './ClassroomKit.css';

type Lang='et'|'ru';
type CopyState='idle'|'copied'|'manual';

type LessonStep={
  minutes:string;
  title:string;
  description:string;
  links:{href:string;label:string}[];
};

const copyToClipboard=async(text:string)=>{
  if(navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea=document.createElement('textarea');
  textarea.value=text;
  textarea.setAttribute('readonly','');
  textarea.style.position='fixed';
  textarea.style.opacity='0';
  document.body.append(textarea);
  textarea.select();
  const copied=document.execCommand('copy');
  textarea.remove();
  return copied;
};

export default function ClassroomKit({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [copyState,setCopyState]=useState<CopyState>('idle');

  const lesson=useMemo<LessonStep[]>(()=>ru?[
    {
      minutes:'0–2',
      title:'Открой вопрос',
      description:'Покажи фразу: «Как отличить впечатление от вывода исследования?» Участники отвечают про идею, а не про личный опыт.',
      links:[{href:'#aju',label:'Как влияет алкоголь'}],
    },
    {
      minutes:'2–5',
      title:'Найди механизм',
      description:'Открой интерактивную схему и попроси пары назвать одну функцию мозга и объяснить её своими словами.',
      links:[{href:'#aju',label:'Схема функций'},{href:'#infograafika',label:'Коротко в схемах'}],
    },
    {
      minutes:'5–8',
      title:'Проверь предположение',
      description:'Выберите одно учебное упражнение. До старта класс предсказывает, что оно измеряет и чего оно измерить не может.',
      links:[{href:'#labor',label:'Мини-игры'}],
    },
    {
      minutes:'8–12',
      title:'Посмотри на доказательство',
      description:'Прочитайте карточку исследования: вопрос, дизайн, результат и ограничение. Отдельно обсудите, где заканчивается вывод.',
      links:[{href:'acute-effects/',label:'Острое воздействие'}],
    },
    {
      minutes:'12–16',
      title:'Прими безопасное решение',
      description:'Разберите вымышленную ситуацию: группе нужно вернуться домой после мероприятия. Сформулируйте план до начала события и один способ поддержать друга.',
      links:[{href:'#obsuzhdenie',label:'Вопросы для обсуждения'}],
    },
    {
      minutes:'16–20',
      title:'Зафиксируй вывод',
      description:'Заполните короткий билет выхода: одно доказательство, одно ограничение и одно безопасное действие. Затем откройте проверку знаний.',
      links:[{href:'#viktoriin',label:'Проверка знаний'}],
    },
  ]:[
    {
      minutes:'0–2',
      title:'Ava küsimus',
      description:'Näita lauset „Kuidas eristada muljet uuringu järeldusest?“ Osalejad vastavad idee, mitte isikliku kogemuse põhjal.',
      links:[{href:'#aju',label:'Alkoholi mõju'}],
    },
    {
      minutes:'2–5',
      title:'Leia toimemehhanism',
      description:'Ava interaktiivne skeem ja palu paaridel nimetada üks ajufunktsioon ning selgitada seda oma sõnadega.',
      links:[{href:'#aju',label:'Funktsioonide skeem'},{href:'#infograafika',label:'Lühidalt skeemides'}],
    },
    {
      minutes:'5–8',
      title:'Kontrolli oletust',
      description:'Valige üks õppeharjutus. Enne alustamist ennustab klass, mida see mõõdab ja mida see mõõta ei saa.',
      links:[{href:'#labor',label:'Minimängud'}],
    },
    {
      minutes:'8–12',
      title:'Vaata tõendit',
      description:'Lugege uuringukaarti: küsimus, ülesehitus, tulemus ja piirang. Arutage eraldi, kus järelduse piir jookseb.',
      links:[{href:'acute-effects/',label:'Äge mõju'}],
    },
    {
      minutes:'12–16',
      title:'Tee turvaline otsus',
      description:'Arutage väljamõeldud olukorda: rühm peab pärast üritust koju jõudma. Sõnastage plaan enne sündmust ja üks viis sõpra toetada.',
      links:[{href:'#obsuzhdenie',label:'Aruteluküsimused'}],
    },
    {
      minutes:'16–20',
      title:'Sõnasta järeldus',
      description:'Täida lühike väljumispilet: üks tõend, üks piirang ja üks turvaline tegu. Seejärel ava teadmiste kontroll.',
      links:[{href:'#viktoriin',label:'Teadmiste kontroll'}],
    },
  ],[ru]);

  const objectives=ru?[
    'отделить наблюдение, связь и причинный вывод;',
    'назвать ограничение одного упражнения или исследования;',
    'предложить безопасное действие в вымышленной ситуации.',
  ]:[
    'eristada vaatlust, seost ja põhjuslikku järeldust;',
    'nimetada ühe harjutuse või uuringu piirangut;',
    'pakkuda väljamõeldud olukorras turvalist tegevust.',
  ];

  const prompts=ru?[
    'Какой вывод поддерживает этот источник — и какого вывода он не поддерживает?',
    'Почему результат мини-игры нельзя считать измерением опьянения или здоровья?',
    'Какие условия, кроме алкоголя, могут влиять на реакцию, память или решение?',
    'Как можно поддержать человека, не заставляя его рассказывать личные детали?',
  ]:[
    'Millist järeldust see allikas toetab ja millist see ei toeta?',
    'Miks ei saa minimängu tulemust pidada joobe- ega tervisemõõduks?',
    'Millised tegurid peale alkoholi võivad mõjutada reaktsiooni, mälu või otsust?',
    'Kuidas saab inimest toetada, sundimata teda jagama isiklikke üksikasju?',
  ];

  const activityText=ru?`ВЫХОДНОЙ БИЛЕТ: «Алкоголь и мозг»\n\n1. Один факт или вывод, который я могу объяснить: ____________________\n2. Какой источник или раздел сайта помог мне это понять: ____________________\n3. Ограничение: чего этот факт / упражнение НЕ доказывает: ____________________\n4. В вымышленной ситуации безопасное действие может быть таким: ____________________\n\nЛичные истории, имена и сведения о здоровье писать не нужно.`:`VÄLJUMISPILET: „Alkohol ja aju“\n\n1. Üks fakt või järeldus, mida oskan selgitada: ____________________\n2. Milline allikas või veebilehe osa aitas mul sellest aru saada: ____________________\n3. Piirang: mida see fakt / harjutus EI tõesta: ____________________\n4. Väljamõeldud olukorras võib turvaline tegu olla: ____________________\n\nIsiklikke lugusid, nimesid ega terviseandmeid ei ole vaja kirjutada.`;

  const handleCopy=async()=>{
    try{
      const copied=await copyToClipboard(activityText);
      setCopyState(copied?'copied':'manual');
    }catch{
      setCopyState('manual');
    }
  };

  const handlePrintTicket=()=>{
    const clearPrintMode=()=>document.body.classList.remove('printing-exit-ticket');
    document.body.classList.add('printing-exit-ticket');
    window.addEventListener('afterprint',clearPrintMode,{once:true});
    window.print();
  };

  const ticketQuestions=ru?[
    'Один факт или вывод, который я могу объяснить:',
    'Какой источник или раздел сайта помог мне это понять:',
    'Ограничение: чего этот факт или упражнение НЕ доказывает:',
    'В вымышленной ситуации безопасное действие может быть таким:',
  ]:[
    'Üks fakt või järeldus, mida oskan selgitada:',
    'Milline allikas või veebilehe osa aitas mul sellest aru saada:',
    'Piirang: mida see fakt või harjutus EI tõesta:',
    'Väljamõeldud olukorras võib turvaline tegu olla:',
  ];

  return <Section
    id="klassiruum"
    number={ru?'ДЛЯ УРОКА':'KLASSIRUUMI JAOKS'}
    title={ru?'Готовый маршрут для занятия':'Valmis tunnirada'}
    intro={ru?'Сценарий на 15–20 минут для урока, классного часа или самостоятельной работы в парах. Он использует материалы сайта, но не требует личных рассказов или ответов о здоровье.':'15–20 minuti pikkune stsenaarium tunniks, klassijuhatajatunniks või paaristööks. See kasutab veebilehe materjale, kuid ei eelda isiklike lugude ega terviseandmete jagamist.'}
    className="classroom-kit-section"
  >
    <div className="classroom-kit">
      <div className="classroom-kit__topline">
        <span className="pill">{ru?'ДЛЯ УЧИТЕЛЯ И КЛАССА':'ÕPETAJALE JA KLASSILE'}</span>
        <span>{ru?'15–20 минут':'15–20 minutit'}</span>
      </div>

      <div className="classroom-kit__objectives">
        <div>
          <h3>{ru?'Цель занятия':'Tunni eesmärk'}</h3>
          <p>{ru?'К концу короткого занятия участник сможет:':'Lühikese tunni lõpuks oskab õppija:'}</p>
        </div>
        <ol>
          {objectives.map((objective,index)=><li key={objective}><span aria-hidden="true">0{index+1}</span><p>{objective}</p></li>)}
        </ol>
      </div>

      <aside className="classroom-kit__safe-note" aria-label={ru?'Условия безопасного обсуждения':'Turvalise arutelu tingimused'}>
        <strong>{ru?'Как вести обсуждение':'Kuidas arutelu juhtida'}</strong>
        <p>{ru?'Говорите о вымышленных ситуациях и фактах из источников. Разрешите не отвечать и не просите делиться опытом употребления, здоровьем или данными других людей.':'Rääkige väljamõeldud olukordadest ja allikates toodud faktidest. Luba vastamata jätta ning ära palu jagada tarvitamiskogemust, terviseandmeid ega teiste inimeste infot.'}</p>
      </aside>

      <div className="classroom-kit__schedule" aria-label={ru?'План занятия':'Tunni kava'}>
        {lesson.map((step,index)=><article className="classroom-kit__step" key={step.minutes}>
          <div className="classroom-kit__step-time"><span>{step.minutes}</span><small>{ru?'мин':'min'}</small></div>
          <div>
            <h3><span aria-hidden="true">{String(index+1).padStart(2,'0')}</span>{step.title}</h3>
            <p>{step.description}</p>
            <div className="classroom-kit__links">
              {step.links.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}
            </div>
          </div>
        </article>)}
      </div>

      <div className="classroom-kit__bottom-grid">
        <article className="classroom-kit__prompts">
          <span className="pill">{ru?'ОБСУЖДЕНИЕ':'ARUTELU'}</span>
          <h3>{ru?'Вопросы без правильного ответа':'Küsimused ilma ühe õige vastuseta'}</h3>
          <ul>{prompts.map(prompt=><li key={prompt}>{prompt}</li>)}</ul>
        </article>

        <article className="classroom-kit__worksheet">
          <div className="classroom-kit__worksheet-head">
            <div>
              <span className="pill">{ru?'РАЗДАТОЧНЫЙ МАТЕРИАЛ':'TÖÖLEHT'}</span>
              <h3>{ru?'Билет выхода':'Väljumispilet'}</h3>
            </div>
            <span>{ru?'3–4 минуты':'3–4 minutit'}</span>
          </div>
          <p>{ru?'Готовый лист для печати. Работу можно сдать анонимно.':'Valmis leht printimiseks. Töö võib olla anonüümne.'}</p>
          <div className="classroom-kit__ticket" aria-label={ru?'Билет выхода для заполнения':'Täidetav väljumispilet'}>
            <strong>{ru?'ВЫХОДНОЙ БИЛЕТ · «АЛКОГОЛЬ И МОЗГ»':'VÄLJUMISPILET · „ALKOHOL JA AJU“'}</strong>
            <ol>{ticketQuestions.map(question=><li key={question}><span>{question}</span><i aria-hidden="true"/></li>)}</ol>
            <small>{ru?'Личные истории, имена и сведения о здоровье писать не нужно.':'Isiklikke lugusid, nimesid ega terviseandmeid ei ole vaja kirjutada.'}</small>
          </div>
          <div className="classroom-kit__worksheet-actions">
            <button type="button" className="button primary" onClick={handleCopy}>{copyState==='copied'?(ru?'Скопировано':'Kopeeritud'):(ru?'Скопировать текст':'Kopeeri tekst')}</button>
            <button type="button" className="text-button" onClick={handlePrintTicket}>{ru?'Распечатать билет':'Prindi pilet'}</button>
          </div>
          <p className="sr-only" aria-live="polite">{copyState==='copied'?(ru?'Текст скопирован в буфер обмена.':'Tekst kopeeriti lõikelauale.'):copyState==='manual'?(ru?'Выдели текст в поле и скопируй его вручную.':'Vali väljal olev tekst ning kopeeri see käsitsi.'):''}</p>
        </article>
      </div>
    </div>
  </Section>;
}

