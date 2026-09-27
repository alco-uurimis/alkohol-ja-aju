type Lang='et'|'ru';

export default function PathChooser({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const routes=[
    {href:'#quick-route',number:'05',title:ru?'У меня пять минут':'Mul on viis minutit',text:ru?'Три конкретных шага: главное, одна схема и проверка знаний.':'Kolm konkreetset sammu: põhiline, üks skeem ja teadmiste kontroll.',cta:ru?'Открыть маршрут':'Ava kiirtee'},
    {href:'#klassiruum',number:'15–20',title:ru?'Мне нужен материал для урока':'Vajan materjali tunniks',text:ru?'Готовый план занятия, вопросы для разговора и короткое задание.':'Valmis tunnikava, aruteluküsimused ja lühike ülesanne.',cta:ru?'К плану урока':'Tunnikava juurde'},
    {href:'#tegevus',number:ru?'СЕЙЧАС':'PRAEGU',title:ru?'Хочу понять, что делать':'Soovin teada, mida teha',text:ru?'Спокойные шаги для ситуации с другом, дорогой домой или давлением компании.':'Rahulikud sammud sõbra, kojumineku või seltskonnasurve olukorraks.',cta:ru?'Открыть подсказки':'Ava tegevusjuhised'},
  ];

  const quickSteps=ru?[
    {time:'0–1',href:'#aju',title:'Главная мысль',text:'Открой четыре функции и выбери одну, которую хочешь понять.'},
    {time:'1–3',href:'#infograafika',title:'Одна схема',text:'Посмотри, как сайт отделяет механизм, наблюдение и вывод.'},
    {time:'3–5',href:'#viktoriin',title:'Проверь вывод',text:'Ответь на несколько вопросов и прочитай объяснения.'},
  ]:[
    {time:'0–1',href:'#aju',title:'Põhiidee',text:'Ava neli funktsiooni ja vali üks, mida soovid mõista.'},
    {time:'1–3',href:'#infograafika',title:'Üks skeem',text:'Vaata, kuidas leht eristab mehhanismi, vaatlust ja järeldust.'},
    {time:'3–5',href:'#viktoriin',title:'Kontrolli järeldust',text:'Vasta mõnele küsimusele ja loe selgitusi.'},
  ];

  return <section id="valik" className="intent-routes" aria-labelledby="intent-routes-title">
    <div className="intent-routes-heading"><p className="eyebrow">{ru?'ВЫБЕРИ СВОЙ МАРШРУТ':'VALI OMA TEEKOND'}</p><h2 id="intent-routes-title">{ru?'С чего начать?':'Millest alustada?'}</h2><p>{ru?'Не нужно проходить всё подряд: выбери задачу, которая важна тебе сейчас.':'Sa ei pea kõike järjest läbima: vali praegu oluline eesmärk.'}</p></div>
    <div className="intent-routes-grid">{routes.map(route=><a href={route.href} className="intent-route" key={route.href}><span>{route.number}</span><div><h3>{route.title}</h3><p>{route.text}</p></div><b>{route.cta}</b></a>)}</div>
    <aside id="quick-route" className="quick-route" aria-labelledby="quick-route-title">
      <div><p className="eyebrow">{ru?'5 МИНУТ':'5 MINUTIT'}</p><h3 id="quick-route-title">{ru?'Короткий маршрут без игр':'Lühike teekond ilma mängudeta'}</h3><p>{ru?'Три шага дают общий контекст; они не заменяют более подробное изучение темы.':'Kolm sammu annavad üldpildi; need ei asenda teema põhjalikumat uurimist.'}</p></div>
      <ol>{quickSteps.map((step,index)=><li key={step.href}><span>{String(index+1).padStart(2,'0')}</span><div><small>{step.time} {ru?'мин':'min'}</small><a href={step.href}>{step.title}</a><p>{step.text}</p></div></li>)}</ol>
    </aside>
  </section>;
}

