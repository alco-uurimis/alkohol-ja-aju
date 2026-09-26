import { useMemo, useState } from 'react';
import { Section, SourceReference } from './Shared';

type Lang='et'|'ru';

const terms=[
  {term:'GABA',et:'Peamine pidurdav virgatsaine ajus. Alkohol võib võimendada GABA-A retseptoritega seotud pidurdavat signaali.',ru:'Главный тормозный медиатор мозга. Алкоголь может усиливать тормозные сигналы, связанные с GABA-A-рецепторами.',refs:[6,9]},
  {term:'Glutamaat',ruTerm:'Глутамат',et:'Oluline ergastav virgatsaine. Alkohol võib vähendada NMDA-tüüpi glutamaadiretseptorite aktiivsust.',ru:'Важный возбуждающий медиатор. Алкоголь может снижать активность NMDA-рецепторов глутамата.',refs:[6,9]},
  {term:'Dopamiin',ruTerm:'Дофамин',et:'Tasustamise, õppimise ja motivatsiooniga seotud signaalmolekul. Alkohol võib muuta tasuradade dopamiinisignaali.',ru:'Сигнальная молекула, связанная с вознаграждением, обучением и мотивацией. Алкоголь может менять дофаминовую передачу в системе вознаграждения.',refs:[6]},
  {term:'Hipokampus',ruTerm:'Гиппокамп',et:'Ajustruktuur, mis osaleb uute episoodiliste mälestuste kujunemises.',ru:'Структура мозга, участвующая в формировании новых эпизодических воспоминаний.',refs:[2]},
  {term:'Prefrontaalne ajukoor',ruTerm:'Префронтальная кора',et:'Ajukoore osa, mis osaleb planeerimises, otsustamises ja impulsside kontrollis.',ru:'Область коры, участвующая в планировании, принятии решений и контроле импульсов.',refs:[1,10]},
  {term:'Mälulünk',ruTerm:'Провал памяти',et:'Periood, mille sündmusi hiljem ei mäletata, kuigi inimene võis sel ajal olla ärkvel ja tegutseda.',ru:'Период, события которого позже не вспоминаются, хотя человек мог оставаться в сознании и действовать.',refs:[2]},
  {term:'Tolerants',ruTerm:'Толерантность',et:'Kohanemine, mille korral sama subjektiivse toime saavutamiseks võib vaja minna suuremat kogust alkoholi.',ru:'Адаптация, при которой для того же субъективного эффекта может потребоваться больше алкоголя.',refs:[6,7]},
  {term:'Alkoholi tarvitamise häire',ruTerm:'Расстройство, связанное с употреблением алкоголя',et:'Kliiniline häire, mida hinnatakse sümptomite ja funktsioneerimise järgi; seda ei diagnoosita veebimängu põhjal.',ru:'Клиническое расстройство, которое оценивают по симптомам и нарушениям функционирования; его нельзя диагностировать по веб-игре.',refs:[7]},
  {term:'Täidesaatvad funktsioonid',ruTerm:'Исполнительные функции',et:'Planeerimise, tähelepanu juhtimise, töömälu ja impulsside kontrolliga seotud vaimsed protsessid.',ru:'Когнитивные процессы, связанные с планированием, управлением вниманием, рабочей памятью и контролем импульсов.',refs:[10]},
  {term:'Korrelatsioon',ruTerm:'Корреляция',et:'Statistiline seos kahe nähtuse vahel. Korrelatsioon üksi ei tõesta, et üks nähtus põhjustab teist.',ru:'Статистическая связь между явлениями. Сама по себе корреляция не доказывает, что одно явление вызывает другое.',refs:[10]},
];

export default function ReferenceGlossary({lang}:{lang:Lang}){
  const ru=lang==='ru';
  const [query,setQuery]=useState('');
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q)return terms;
    return terms.filter(item=>{
      const name=ru?(item.ruTerm??item.term):item.term;
      const body=ru?item.ru:item.et;
      return `${name} ${body}`.toLowerCase().includes(q);
    });
  },[query,ru]);

  return <Section
    id="moisted"
    number={ru?'12 / СПРАВОЧНИК':'12 / SÕNASTIK'}
    title={ru?'Термины без лишнего жаргона':'Mõisted ilma liigse žargoonita'}
    intro={ru?'Справочный блок перенесён ближе к источникам: возвращайся сюда, если встречается незнакомый научный термин.':'Sõnastik on toodud allikatele lähemale: tule siia tagasi, kui mõni teadustermin jääb ebaselgeks.'}
    className="reference-glossary-section"
  >
    <div className="glossary reference-glossary">
      <div className="glossary-tools">
        <div><span className="pill">{ru?'БЫСТРЫЙ СПРАВОЧНИК':'KIIRE SÕNASTIK'}</span><h3>{ru?'Найди термин':'Leia mõiste'}</h3></div>
        <label><span className="sr-only">{ru?'Поиск по терминам':'Otsi mõistet'}</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ru?'Например: дофамин':'Näiteks: dopamiin'}/></label>
      </div>
      <div className="glossary-grid">
        {filtered.map(item=><details key={item.term}><summary>{ru?(item.ruTerm??item.term):item.term}</summary><p>{ru?item.ru:item.et} <SourceReference ids={item.refs} lang={lang}/></p></details>)}
        {filtered.length===0&&<p className="empty-state">{ru?'Ничего не найдено. Попробуй другое слово.':'Midagi ei leitud. Proovi teist sõna.'}</p>}
      </div>
    </div>
  </Section>;
}
