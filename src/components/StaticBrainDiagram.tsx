type Lang='et'|'ru';

export default function StaticBrainDiagram({lang,className=''}:{lang:Lang;className?:string}){
  const ru=lang==='ru';
  return <figure className={'static-brain-diagram '+className}>
    <div className="static-brain-canvas">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/0e/Lobes_of_the_brain_NL.svg"
        alt={ru?'Схема долей головного мозга':'Ajusagarate skeem'}
      />
      <svg className="static-brain-overlay" viewBox="0 0 800 560" role="img" aria-label={ru?'Учебная схема областей мозга и связанных с ними функций':'Õppeskeem ajupiirkondadest ja nendega seotud funktsioonidest'}>
        <g className="brain-annotation brain-annotation-decision">
          <path d="M246 103 L246 164 L236 224"/>
          <circle cx="236" cy="224" r="7"/>
          <rect x="24" y="28" width="286" height="78" rx="18"/>
          <text x="46" y="58" className="brain-label-title">{ru?'Префронтальная кора':'Prefrontaalne ajukoor'}</text>
          <text x="46" y="84" className="brain-label-copy">{ru?'решения · самоконтроль':'otsused · enesekontroll'}</text>
        </g>

        <g className="brain-annotation brain-annotation-attention">
          <path d="M572 105 L532 145 L470 188"/>
          <circle cx="470" cy="188" r="7"/>
          <rect x="518" y="28" width="258" height="78" rx="18"/>
          <text x="540" y="58" className="brain-label-title">{ru?'Лобно-теменная сеть':'Frontoparietaalne võrgustik'}</text>
          <text x="540" y="84" className="brain-label-copy">{ru?'внимание · фокус':'tähelepanu · fookus'}</text>
        </g>

        <g className="brain-annotation brain-annotation-memory">
          <path d="M283 457 L334 411 L402 342"/>
          <circle cx="402" cy="342" r="7"/>
          <rect x="24" y="448" width="322" height="84" rx="18"/>
          <text x="46" y="478" className="brain-label-title">{ru?'Гиппокамп':'Hipokampus'}</text>
          <text x="46" y="504" className="brain-label-copy">{ru?'память · внутренняя структура':'mälu · sisemine struktuur'}</text>
        </g>

        <g className="brain-annotation brain-annotation-reaction">
          <path d="M552 452 L570 420 L588 393"/>
          <circle cx="588" cy="393" r="7"/>
          <rect x="502" y="448" width="274" height="84" rx="18"/>
          <text x="524" y="478" className="brain-label-title">{ru?'Мозжечок и моторные системы':'Väikeaju ja motoorsed süsteemid'}</text>
          <text x="524" y="504" className="brain-label-copy">{ru?'координация · скорость реакции':'koordinatsioon · reaktsioonikiirus'}</text>
        </g>
      </svg>
    </div>
    <figcaption>
      <span>{ru?'Упрощённая учебная схема: функции распределены по сетям мозга, а не принадлежат одной точке.':'Lihtsustatud õppeskeem: funktsioonid jaotuvad ajuvõrgustikes ega kuulu üheleainsale punktile.'}</span>
      <small>Gray’s Anatomy / Henry Vandyke Carter · Wikimedia Commons · public domain</small>
    </figcaption>
  </figure>;
}
