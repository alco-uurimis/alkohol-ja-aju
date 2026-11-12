import type { ReactNode } from 'react';
import { sources } from '../data/content';
import { sourcesRu } from '../data/content.ru';
import { additionalSourcesEt,additionalSourcesRu } from '../data/additionalSources';
import { Section } from '../components/Shared';
import FeedbackSurvey from '../components/FeedbackSurvey';
import ReferenceGlossary from '../components/ReferenceGlossary';

export default function Closing({lang,summary}:{lang:'et'|'ru';summary?:ReactNode}){
  const ru=lang==='ru';
  const localizedSources=[...(ru?sourcesRu:sources),...(ru?additionalSourcesRu:additionalSourcesEt)];

  return <>
    <Section id="meelespea" number={ru?"ИТОГ":"KOKKUVÕTE"} title={ru?"Факт и граница вывода":"Fakt ja järelduse piir"}>
      <p>{ru?"Назови один факт, который можешь объяснить, и один вывод, который эти данные сделать не позволяют.":"Nimeta üks fakt, mida oskad selgitada, ja üks järeldus, mida nende andmete põhjal teha ei saa."}</p>
      <a href="acute-effects/">{ru?"Свериться с карточкой исследования":"Vaata võrdluseks uuringukaarti"}</a>
    </Section>

    {summary}

    <Section id="tagasiside" number={ru?'13 / ОБРАТНАЯ СВЯЗЬ':'13 / TAGASISIDE'} title={ru?'Обратная связь о сайте':'Tagasiside veebilehe kohta'} intro={ru?'По желанию оцени понятность, интерес, сложность заданий и удобство сайта. Не указывай имя, контакты, сведения о здоровье или другую личную информацию.':'Soovi korral hinda arusaadavust, huvi, ülesannete raskust ja veebilehe kasutusmugavust. Ära lisa nime, kontaktandmeid, terviseandmeid ega muud isiklikku teavet.'}>
      <FeedbackSurvey lang={lang}/>
    </Section>

    <Section id="projektist" number={ru?'14 / О ПРОЕКТЕ':'14 / PROJEKTIST'} title={ru?'Как устроен этот проект':'Kuidas see projekt on tehtud'} className="about-section">
      <div className="about-grid"><div><p>{ru?'«Алкоголь и мозг» — учебный материал о влиянии алкоголя на память, внимание, принятие решений и другие функции, особенно важные в молодом возрасте.':'„Alkohol ja aju“ on õppematerjal alkoholi mõjust mälule, tähelepanule, otsustamisele ja teistele noores eas olulistele funktsioonidele.'}</p><p>{ru?'Упражнения работают в браузере. Результаты мини-игр временно хранятся только в текущей вкладке и могут быть отправлены вместе с финальным опросом только после явного согласия пользователя.':'Harjutused töötavad brauseris. Minimängude tulemusi hoitakse ajutiselt ainult selles vahelehes ning need saab lõpuküsitlusega saata ainult kasutaja selgesõnalisel nõusolekul.'}</p></div><dl><div><dt>{ru?'Автор':'Autor'}</dt><dd>{ru?'София Чайка':'Sofija Tsaika'}</dd></div><div><dt>{ru?'Школа':'Kool'}</dt><dd>Tallinna Laagna Gümnaasium</dd></div><div><dt>{ru?'Формат':'Vorm'}</dt><dd>{ru?'Учебный сайт':'Õppeveeb'}</dd></div><div><dt>{ru?'Языки':'Keeled'}</dt><dd>{ru?'Русский и эстонский':'Vene ja eesti'}</dd></div><div><dt>{ru?'Данные игр':'Mängude andmed'}</dt><dd>{ru?'В текущей вкладке':'Ainult selles vahelehes'}</dd></div><div><dt>{ru?'Год':'Aasta'}</dt><dd>2026</dd></div></dl></div>
    </Section>

    {summary}

    <ReferenceGlossary lang={lang}/>

    <Section id="allikad" number={ru?'17 / ИСТОЧНИКИ':'17 / ALLIKAD'} title={ru?'Источники и литература':'Allikad ja kirjandus'} intro={ru?'Последний раздел сайта — библиография. Номера рядом с научными утверждениями ведут прямо к соответствующей записи здесь.':'Lehe viimane osa on bibliograafia. Teadusväidete kõrval olevad numbrid viivad otse vastava allikani siin.'} className="sources-section">
      <ol className="sources">{localizedSources.map(s=><li key={s.id} id={'allikas-'+s.id} tabIndex={-1}><span className="source-index">[{s.id}]</span><div><p className="source-org">{s.organization}</p><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></h3><p>{s.note}</p><span className="small">{s.year??(ru?'Год публикации не указан':'Ilmumisaasta puudub')} · {ru?'Проверено':'Vaadatud'} {s.accessed.split('-').reverse().join('.')}</span></div></li>)}</ol>
      <p className="small">{ru?'Это учебная подборка, а не систематический обзор всей литературы. В карточках отдельно отмечаются ограничения и различие между ассоциацией и причинностью.':'See on õppeotstarbeline allikavalik, mitte kogu teaduskirjanduse süstemaatiline ülevaade. Kaartidel tuuakse eraldi välja piirangud ning seose ja põhjuslikkuse erinevus.'}</p>
    </Section>
  </>;
}
