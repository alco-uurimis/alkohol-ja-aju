import Collapse from '../components/Collapse';
import type { ReactNode } from 'react';
import { sources } from '../data/content';
import { getRu } from '../data/ru';
import { getEn } from '../data/en';
import { additionalSourcesEt,additionalSourcesRu } from '../data/additionalSources';
import { Section } from '../components/Shared';
import FeedbackSurvey from '../components/FeedbackSurvey';
import ReferenceGlossary from '../components/ReferenceGlossary';
import { T } from '../data/siteT';

export default function Closing({lang,summary}:{lang:'et'|'ru'|'en';summary?:ReactNode}){
  const ru=lang==='ru';
  const localizedSources=lang==='en'?[...getEn().sourcesEn,...getEn().additionalSourcesEn]:[...(ru?getRu().sourcesRu:sources),...(ru?additionalSourcesRu:additionalSourcesEt)];

  return <>
    <Section id="meelespea" number={T(lang,ru?"ИТОГ":"KOKKUVÕTE")} title={T(lang,ru?"Факт и граница вывода":"Fakt ja järelduse piir")}>
      <p>{T(lang,ru?"Назови один факт, который можешь объяснить, и один вывод, который эти данные сделать не позволяют.":"Nimeta üks fakt, mida oskad selgitada, ja üks järeldus, mida nende andmete põhjal teha ei saa.")}</p>
      <a href="acute-effects/">{T(lang,ru?"Свериться с карточкой исследования":"Vaata võrdluseks uuringukaarti")}</a>
    </Section>

    <Section id="tagasiside" number={T(lang,ru?'13 / ОБРАТНАЯ СВЯЗЬ':'13 / TAGASISIDE')} title={T(lang,ru?'Обратная связь о сайте':'Tagasiside veebilehe kohta')} intro={T(lang,ru?'По желанию оцени понятность, интерес, сложность заданий и удобство сайта. Не указывай имя, контакты, сведения о здоровье или другую личную информацию.':'Soovi korral hinda arusaadavust, huvi, ülesannete raskust ja veebilehe kasutusmugavust. Ära lisa nime, kontaktandmeid, terviseandmeid ega muud isiklikku teavet.')}>
      <FeedbackSurvey lang={lang}/>
    </Section>

    <Section id="projektist" number={T(lang,ru?'14 / О ПРОЕКТЕ':'14 / PROJEKTIST')} title={T(lang,ru?'Как устроен этот проект':'Kuidas see projekt on tehtud')} className="about-section">
      <div className="about-grid"><div><p>{T(lang,ru?'«Алкоголь и мозг» — учебный материал о влиянии алкоголя на память, внимание, принятие решений и другие функции, особенно важные в молодом возрасте.':'„Alkohol ja aju“ on õppematerjal alkoholi mõjust mälule, tähelepanule, otsustamisele ja teistele noores eas olulistele funktsioonidele.')}</p><p>{T(lang,ru?'Упражнения работают в браузере. Результаты мини-игр временно хранятся только в текущей вкладке и могут быть отправлены вместе с финальным опросом только после явного согласия пользователя.':'Harjutused töötavad brauseris. Minimängude tulemusi hoitakse ajutiselt ainult selles vahelehes ning need saab lõpuküsitlusega saata ainult kasutaja selgesõnalisel nõusolekul.')}</p></div><dl><div><dt>{T(lang,ru?'Автор':'Autor')}</dt><dd>{T(lang,ru?'София Чайка':'Sofija Tsaika')}</dd></div><div><dt>{T(lang,ru?'Школа':'Kool')}</dt><dd>Tallinna Laagna Gümnaasium</dd></div><div><dt>{T(lang,ru?'Формат':'Vorm')}</dt><dd>{T(lang,ru?'Учебный сайт':'Õppeveeb')}</dd></div><div><dt>{T(lang,ru?'Языки':'Keeled')}</dt><dd>{T(lang,ru?'Русский, эстонский и английский':'Eesti, vene ja inglise')}</dd></div><div><dt>{T(lang,ru?'Данные игр':'Mängude andmed')}</dt><dd>{T(lang,ru?'В текущей вкладке':'Ainult selles vahelehes')}</dd></div><div><dt>{T(lang,ru?'Год':'Aasta')}</dt><dd>2026</dd></div></dl></div>
    </Section>

    {summary}

    <ReferenceGlossary lang={lang}/>

    <Section id="allikad" number={T(lang,ru?'17 / ИСТОЧНИКИ':'17 / ALLIKAD')} title={T(lang,ru?'Источники и литература':'Allikad ja kirjandus')} intro={T(lang,ru?'Последний раздел сайта — библиография. Номера рядом с научными утверждениями ведут прямо к соответствующей записи здесь.':'Lehe viimane osa on bibliograafia. Teadusväidete kõrval olevad numbrid viivad otse vastava allikani siin.')} className="sources-section">
      <Collapse lang={lang} collapsed={[640,640]} count={`${localizedSources.length}`} anchorPrefix="#allikas-"><ol className="sources">{localizedSources.map(s=><li key={s.id} id={'allikas-'+s.id} tabIndex={-1}><span className="source-index">[{s.id}]</span><div><p className="source-org">{s.organization}</p><h3><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></h3><p>{s.note}</p><span className="small">{s.year??(T(lang,ru?'Год публикации не указан':'Ilmumisaasta puudub'))} · {T(lang,ru?'Проверено':'Vaadatud')} {s.accessed.split('-').reverse().join('.')}</span></div></li>)}</ol></Collapse>
      <p className="small">{T(lang,ru?'Это учебная подборка, а не систематический обзор всей литературы. В карточках отдельно отмечаются ограничения и различие между ассоциацией и причинностью.':'See on õppeotstarbeline allikavalik, mitte kogu teaduskirjanduse süstemaatiline ülevaade. Kaartidel tuuakse eraldi välja piirangud ning seose ja põhjuslikkuse erinevus.')}</p>
    </Section>
  </>;
}
