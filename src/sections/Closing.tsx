import type { ReactNode } from 'react';
import { project,sources,takeaways } from '../data/content';
import { sourcesRu,takeawaysRu } from '../data/content.ru';
import { InfoCard,Section,SourceReference } from '../components/Shared';
import FeedbackSurvey from '../components/FeedbackSurvey';
import ReferenceGlossary from '../components/ReferenceGlossary';

export default function Closing({lang,summary}:{lang:'et'|'ru';summary?:ReactNode}){
  const ru=lang==='ru';
  const localizedSources=ru?sourcesRu:sources;
  const localizedTakeaways=ru?takeawaysRu:takeaways;

  return <>
    <Section id="meelespea" number={ru?'08 / ГЛАВНОЕ':'08 / VÕTA KAASA'} title={ru?'Что стоит запомнить?':'Mida tasub meeles pidada?'} intro={ru?'Короткое резюме после упражнений, игр и проверки знаний.':'Lühikokkuvõte pärast harjutusi, mänge ja teadmiste kontrolli.'}>
      <div className="takeaways">{localizedTakeaways.map((t,i)=><InfoCard key={t.title} title={t.title}><span className="takeaway-number" aria-hidden="true">0{i+1}</span><p>{t.text} <SourceReference ids={t.refs} lang={lang}/></p></InfoCard>)}</div>
      <div className="closing-note"><strong>{ru?'Результат упражнения — не диагноз.':'Harjutuse tulemus ei ole diagnoos.'}</strong><p>{ru?'Здесь можно заметить собственный опыт и проверить знания. Выводы о влиянии алкоголя основаны на учебнике, обзорах организаций здравоохранения и научных публикациях, а не на одной сумме баллов.':'Siin saad oma kogemust märgata ja teadmisi kontrollida. Alkoholi mõju käsitlevad järeldused põhinevad õpikul, terviseasutuste ülevaadetel ja teaduspublikatsioonidel, mitte ühel punktisummal.'}</p></div>
    </Section>

    <Section id="tagasiside" number={ru?'09 / ОБРАТНАЯ СВЯЗЬ':'09 / TAGASISIDE'} title={ru?'Анонимный опрос о сайте':'Anonüümne küsitlus veebilehe kohta'} intro={ru?'Теперь основной материал завершён. Оцени понятность, интерес, сложность заданий и удобство сайта. Не указывай имя, контакты, сведения о здоровье или другую личную информацию.':'Põhimaterjal on nüüd läbitud. Hinda arusaadavust, huvi, ülesannete raskust ja veebilehe kasutusmugavust. Ära lisa nime, kontaktandmeid, terviseandmeid ega muud isiklikku teavet.'}>
      <FeedbackSurvey lang={lang}/>
    </Section>

    <Section id="projektist" number={ru?'10 / О ПРОЕКТЕ':'10 / PROJEKTIST'} title={ru?'Как устроен этот проект':'Kuidas see projekt on tehtud'} className="about-section">
      <div className="about-grid"><div><p>{ru?'«Алкоголь и мозг» — учебный материал для практической работы гимназии о влиянии алкоголя на память, внимание, принятие решений и другие функции, особенно важные в молодом возрасте.':'„Alkohol ja aju“ on gümnaasiumi praktilise töö jaoks loodud õppematerjal alkoholi mõjust mälule, tähelepanule, otsustamisele ja teistele noores eas olulistele funktsioonidele.'}</p><p>{ru?'Упражнения работают в браузере. Результаты мини-игр временно хранятся только в текущей вкладке и могут быть отправлены вместе с финальным опросом только после явного согласия пользователя.':'Harjutused töötavad brauseris. Minimängude tulemusi hoitakse ajutiselt ainult praeguses vahelehes ning need saab lõpuküsitlusega saata ainult kasutaja selgesõnalisel nõusolekul.'}</p></div><dl><div><dt>{ru?'Автор':'Autor'}</dt><dd>{project.author}</dd></div><div><dt>{ru?'Школа':'Kool'}</dt><dd>{project.school}</dd></div><div><dt>{ru?'Руководитель':'Juhendaja'}</dt><dd>{project.supervisor}</dd></div><div><dt>{ru?'Год':'Aasta'}</dt><dd>{project.year}</dd></div></dl></div>
    </Section>

    {summary}

    <ReferenceGlossary lang={lang}/>

    <Section id="allikad" number={ru?'13 / ИСТОЧНИКИ':'13 / ALLIKAD'} title={ru?'Источники и литература':'Allikad ja kirjandus'} intro={ru?'Последний раздел сайта — библиография. Номера рядом с научными утверждениями ведут прямо к соответствующей записи здесь.':'Lehe viimane osa on bibliograafia. Teadusväidete kõrval olevad numbrid viivad otse vastava allikani siin.'} className="sources-section">
      <ol className="sources">{localizedSources.map(s=><li key={s.id} id={'allikas-'+s.id} tabIndex={-1}><span className="source-index">[{s.id}]</span><div><p className="source-org">{s.organization}</p><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title} <span aria-label={ru?'открывается в новой вкладке':'avaneb uuel vahelehel'}>↗</span></a></h3><p>{s.note}</p><span className="small">{s.year??(ru?'Год публикации не указан':'Ilmumisaasta puudub')} · {ru?'Проверено':'Vaadatud'} {s.accessed.split('-').reverse().join('.')}</span></div></li>)}</ol>
      <p className="small">{ru?'Это учебная подборка, а не систематический обзор всей литературы. В карточках отдельно отмечаются ограничения и различие между ассоциацией и причинностью.':'See on õppeotstarbeline allikavalik, mitte kogu teaduskirjanduse süstemaatiline ülevaade. Kaartidel tuuakse eraldi välja piirangud ning seose ja põhjuslikkuse erinevus.'}</p>
    </Section>
  </>;
}
