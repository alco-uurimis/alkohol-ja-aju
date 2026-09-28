import { useMemo, useState } from 'react';

type Lang='et'|'ru';
type Item={href:string;ru:string;et:string;keywords:string};

const items:Item[]=[
  {href:'#aju',ru:'Как алкоголь влияет на мозг',et:'Kuidas alkohol aju mõjutab',keywords:'мозг aju память mälu внимание tähelepanu решения otsustamine'},
  {href:'#infograafika',ru:'Коротко в схемах',et:'Lühidalt skeemides',keywords:'схемы infograafika кратко'},
  {href:'#teadmised',ru:'Научная база',et:'Teadusbaas',keywords:'наука evidence доказательства allikad'},
  {href:'#malu',ru:'Упражнение на память',et:'Mäluharjutus',keywords:'память mälu упражнение'},
  {href:'#tahelepanu',ru:'Упражнение на внимание',et:'Tähelepanuharjutus',keywords:'внимание tähelepanu'},
  {href:'#labor',ru:'Мини-игры',et:'Minimängud',keywords:'реакция reaction stroop сигнал'},
  {href:'#viktoriin',ru:'Миф или факт',et:'Müüt või fakt',keywords:'quiz викторина teadmised'},
  {href:'acute-effects/',ru:'Острое воздействие и рабочая память',et:'Äge mõju ja töömälu',keywords:'acute рабочая память'},
  {href:'memory-blackouts/',ru:'Провалы памяти',et:'Mälulüngad',keywords:'blackout память провал'},
  {href:'adolescent-brain/',ru:'Подростковый мозг',et:'Nooruki aju',keywords:'подростки noored adolescent'},
  {href:'self-control/',ru:'Самоконтроль',et:'Enesekontroll',keywords:'торможение inhibition control'},
  {href:'alcohol-and-sleep/',ru:'Алкоголь и сон',et:'Alkohol ja uni',keywords:'сон uni sleep'},
  {href:'alcohol-and-driving/',ru:'Алкоголь и вождение',et:'Alkohol ja autojuhtimine',keywords:'вождение driving безопасность'},
  {href:'reward-and-habits/',ru:'Вознаграждение и привычки',et:'Tasu ja harjumused',keywords:'дофамин reward привычки'},
  {href:'recovery-and-brain/',ru:'Восстановление мозга',et:'Aju taastumine',keywords:'восстановление recovery'},
  {href:'topics/',ru:'Все научные темы',et:'Kõik teadusteemad',keywords:'темы topics индекс'},
  {href:'methodology/',ru:'Методология проекта',et:'Projekti metoodika',keywords:'методология methodology исследование'},
  {href:'fact-check/',ru:'Как проверялись факты',et:'Kuidas fakte kontrolliti',keywords:'источники факт проверка quality'},
  {href:'data-policy/',ru:'Данные и приватность',et:'Andmed ja privaatsus',keywords:'privacy данные хранение'},
  {href:'science/',ru:'Помоги науке — опрос',et:'Aita teadust — küsitlus',keywords:'опрос survey research'},
  {href:'science/results/',ru:'Результаты опроса',et:'Küsitluse tulemused',keywords:'результаты results статистика'}
];

export default function SiteSearch({lang}:{lang:Lang}){
  const [query,setQuery]=useState('');
  const ru=lang==='ru';
  const matches=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return [];
    return items.filter(item=>`${item.ru} ${item.et} ${item.keywords}`.toLowerCase().includes(q)).slice(0,7);
  },[query]);
  return <div className="site-search" role="search">
    <label htmlFor="site-search-input">{ru?'Найти тему':'Leia teema'}</label>
    <div className="site-search-box"><input id="site-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={ru?'сон, память, подростки…':'uni, mälu, noored…'} autoComplete="off"/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label={ru?'Очистить поиск':'Tühjenda otsing'}>×</button>}</div>
    {query&&<div className="site-search-results" aria-live="polite">{matches.length?matches.map(item=><a key={item.href} href={item.href}><strong>{ru?item.ru:item.et}</strong><span>{item.href.startsWith('#')?(ru?'Раздел на этой странице':'Osa sellel lehel'):(ru?'Отдельная страница':'Eraldi leht')}</span></a>):<p>{ru?'Ничего не найдено. Попробуй другое слово.':'Midagi ei leitud. Proovi teist sõna.'}</p>}</div>}
  </div>;
}
