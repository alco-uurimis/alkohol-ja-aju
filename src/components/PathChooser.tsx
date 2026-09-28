type Lang='et'|'ru';

export default function PathChooser({lang,visitedIds=[]}:{lang:Lang;visitedIds?:string[]}){
  const ru=lang==='ru';
  const completed=new Set(visitedIds);
  const ordered=['aju','infograafika','teadmised','malu','tahelepanu','labor','viktoriin','samoprov','obsuzhdenie','tegevus','klassiruum','tagasiside'];
  const nextId=ordered.find(id=>!completed.has(id))||'isiklik-kokkuvote';
  const nextNames:Record<string,[string,string]>={aju:['Как влияет алкоголь','Alkoholi mõju'],infograafika:['Коротко в схемах','Lühidalt skeemides'],teadmised:['Научная база','Teadusbaas'],malu:['Память','Mälu'],tahelepanu:['Внимание','Tähelepanu'],labor:['Мини-игры','Minimängud'],viktoriin:['Проверка знаний','Teadmiste kontroll'],samoprov:['Самопроверка','Enesekontroll'],obsuzhdenie:['Обсуждение','Arutelu'],tegevus:['Что делать','Mida teha'],klassiruum:['Материал для урока','Materjal tunniks'],tagasiside:['Финальный опрос','Lõpuküsitlus'],'isiklik-kokkuvote':['Итог','Kokkuvõte']};
  const routes=[
    {href:'#aju',time:ru?'5 мин':'5 min',title:ru?'Быстро понять':'Kiire ülevaade',text:ru?'Главная идея → одна схема → несколько вопросов. Без игр и длинных текстов.':'Põhiidee → üks skeem → mõned küsimused. Ilma mängude ja pika tekstita.',accent:'quick'},
    {href:'#aju',time:ru?'20 мин':'20 min',title:ru?'Изучить подробно':'Õpi põhjalikult',text:ru?'Факты, научная база, упражнения, мини-игры и проверка знаний.':'Faktid, teadusbaas, harjutused, minimängud ja teadmiste kontroll.',accent:'full'},
    {href:'#klassiruum',time:ru?'45 мин':'45 min',title:ru?'Для урока':'Tunniks',text:ru?'Готовый сценарий занятия, вопросы, рабочий лист и материалы для обсуждения.':'Valmis tunnikava, küsimused, tööleht ja arutelumaterjalid.',accent:'class'}
  ];
  return <section id="valik" className="intent-routes" aria-labelledby="intent-routes-title">
    <div className="intent-routes-heading"><p className="eyebrow">{ru?'ВЫБЕРИ ФОРМАТ':'VALI VORM'}</p><h2 id="intent-routes-title">{ru?'Как ты хочешь пройти сайт?':'Kuidas soovid lehte kasutada?'}</h2><p>{ru?'Три понятных режима вместо длинного списка разделов. В любой момент можно открыть меню.':'Kolm selget režiimi pika jaotiste loendi asemel. Menüü saab igal ajal avada.'}</p></div>
    {completed.size>0&&<a className="continue-card" href={'#'+nextId}><span>{ru?'ПРОДОЛЖИТЬ':'JÄTKA'}</span><strong>{nextNames[nextId]?.[ru?0:1]??nextId}</strong><small>{ru?`Пройдено разделов: ${completed.size}`:`Läbitud osi: ${completed.size}`}</small></a>}
    <div className="intent-routes-grid intent-routes-simple">{routes.map(route=><a href={route.href} className={'intent-route mode-'+route.accent} key={route.title}><span>{route.time}</span><div><h3>{route.title}</h3><p>{route.text}</p></div><b>{ru?'Начать':'Alusta'}</b></a>)}</div>
    <div className="route-tools route-tools-no-search"><div className="route-links"><a className="route-link-featured" href="topics/">{ru?'Научные темы':'Teadusteemad'}</a><a className="route-link-science" href="science/">{ru?'Помоги науке':'Aita teadust'}</a><a href="methodology/">{ru?'Методология':'Metoodika'}</a></div></div>
  </section>;
}
