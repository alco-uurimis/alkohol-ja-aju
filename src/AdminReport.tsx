import { useState } from 'react';
import ResultsChart, { type ResultItem } from './components/ResultsChart';
import { adminQuestions } from './adminLabels';
import { signTestP, wilson } from './lib/stats';
import { bucketAge, discloseCounts, discloseMulti, MIN_CELL, MIN_N, OTHER } from './lib/disclosure';
import { A, adminLocale } from './adminI18n';

export type PrePostSummary = { nPre: number; nPost: number; matched: number; meanPre: number | null; meanPost: number | null; improved: number; same: number; worse: number; total: number; items: { id: string; pre: number | null; post: number | null }[] };
export type ReportData = { n: number; excluded: number; lastUpdated: string; fields: Record<string, Record<string, number>>; answered: Record<string, number>; prepost?: PrePostSummary };

const itemLabels: Record<string, string> = { blackout: A('Во время провала памяти человек может быть в сознании'), attention: A('Алкоголь затрудняет следить за двумя задачами сразу'), reaction: A('Алкоголь ускоряет реакцию на неожиданную ситуацию'), sleep: A('Быстрое засыпание после алкоголя всегда означает лучший сон'), decisions: A('Алкоголь может ослаблять контроль импульсов'), development: A('В гимназическом возрасте развитие мозга уже завершено') };
const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

const fmtP = (p: number) => (p < 0.001 ? 'p < 0,001' : `p = ${p.toFixed(3).replace('.', ',')}`);

/** Effect summary from counts only: share of improvers with a Wilson interval and an exact sign test. Descriptive, not causal. */
function Effect({ d }: { d: PrePostSummary }) {
  const moved = d.improved + d.worse;
  const ci = wilson(d.improved, moved);
  const p = signTestP(d.improved, d.worse);
  const diff = d.meanPre !== null && d.meanPost !== null ? d.meanPost - d.meanPre : null;
  return (
    <div className="admin-effect">
      {diff !== null && <p><b>{A('Изменение среднего балла:')}</b> {diff >= 0 ? '+' : '−'}{Math.abs(diff).toFixed(2)}{A(' из ')}{d.total}</p>}
      {ci && p !== null && moved >= 5
        ? <p><b>{A('Среди тех, чей балл изменился (')}{moved}):</b>{A(' улучшили ')}{Math.round((d.improved / moved) * 100)}{A('% (95% ДИ ')}{Math.round(ci[0] * 100)}–{Math.round(ci[1] * 100)}{A('%), знаковый критерий ')}{fmtP(p)}.</p>
        : <p className="admin-meta">{A('Для оценки эффекта нужно не меньше 5 пар, у которых балл изменился. Сейчас: ')}{moved}.</p>}
      <p className="result-base">{A('Это описание изменения в самоотобранной группе, а не доказательство эффекта сайта: нет контрольной группы, часть людей не доходит до «после», а повторное прохождение даёт эффект практики.')}</p>
    </div>
  );
}

/** Admin card: anonymous before/after check. Pairs are matched by a random browser token only. */
export function PrePostCard({ data, publicMode = false }: { data?: PrePostSummary; publicMode?: boolean }) {
  if (!data) return null;
  const hidden = publicMode && data.matched < MIN_N;
  return (
    <div className="admin-q admin-prepost">
      <h3>{A('Проверка «до и после» (анонимная)')}</h3>
      <p className="admin-meta">{A('Прошли «до»: ')}<b>{data.nPre}</b>{A(' · прошли «после»: ')}<b>{data.nPost}</b>{A(' · пар с общим кодом: ')}<b>{data.matched}</b></p>
      {hidden ? <p className="admin-meta">{A('Для публикации нужно не меньше ')}{MIN_N}{A(' пар. Сейчас: ')}{data.matched}.</p> : data.matched === 0 ? <p className="admin-meta">{A('Пока нет ни одной пары «до и после».')}</p> : <>
        <p className="admin-prepost__means">{A('Средний балл (из ')}{data.total}): <b>{data.meanPre?.toFixed(2)}</b> → <b>{data.meanPost?.toFixed(2)}</b>{A(' · улучшили: ')}{data.improved}{A(', без изменений: ')}{data.same}{A(', ухудшили: ')}{data.worse}</p>
        <Effect d={data} />
        <table className="admin-table"><thead><tr><th>{A('Утверждение')}</th><th>{A('До')}</th><th>{A('После')}</th></tr></thead><tbody>{data.items.map(i => <tr key={i.id}><td>{itemLabels[i.id] ?? i.id}</td><td>{pct(i.pre)}</td><td>{pct(i.post)}</td></tr>)}</tbody></table>
        <p className="result-base">{A('Доля верных ответов среди пар. Пары собираются по случайному коду в браузере: человек, который проходил проверку на другом устройстве или очистил данные, в пары не попадает.')}</p>
      </>}
    </div>
  );
}

function items(key: string, entries: [string, number][]): ResultItem[] {
  const order = Object.keys(adminQuestions[key]?.codes ?? {});
  const pos = (c: string) => (c === OTHER ? 98 : order.indexOf(c) < 0 ? 99 : order.indexOf(c));
  return entries.map(([code, count]) => ({ code, label: code === OTHER ? A('Другие (малые группы объединены)') : code === '18_plus' ? A('18 и старше') : adminQuestions[key]?.codes[code] ?? code, count })).sort((a, b) => pos(a.code) - pos(b.code));
}

/** Printable report. "Для публикации" applies the same thresholds as the public site; "Внутренний" shows everything. */
export function AdminReport({ data }: { data: ReportData }) {
  const [publicMode, setPublicMode] = useState(true);
  const today = new Date().toLocaleDateString(adminLocale);
  const print = () => {
    const clear = () => document.body.classList.remove('printing-report');
    document.body.classList.add('printing-report');
    addEventListener('afterprint', clear, { once: true });
    window.print();
  };
  const keys = Object.keys(adminQuestions).filter(k => data.fields[k] && Object.keys(data.fields[k]).length > 0 && k !== 'language');
  const blocks = keys.map(k => {
    const q = adminQuestions[k];
    const raw = k === 'ageGroup' && publicMode ? bucketAge(data.fields[k]) : data.fields[k];
    const answered = data.answered[k] ?? data.n;
    if (!publicMode) return { k, q, entries: Object.entries(raw) as [string, number][], answered, note: '' };
    if (q.multi) { const d = discloseMulti(raw); return { k, q, entries: d?.items ?? null, answered: data.n, note: d && d.hidden > 0 ? A('Категории меньше {0} ответов не показаны ({1}).', MIN_CELL, d.hidden) : '' }; }
    const d = discloseCounts(raw, answered);
    return { k, q, entries: d?.items ?? null, answered, note: d?.merged ? A('Категории меньше {0} ответов объединены в строку «Другие».', MIN_CELL) : '' };
  });
  const publishable = !publicMode || data.n >= MIN_N;
  return (
    <section className="admin-report" aria-label={A('Отчёт')}>
      <div className="admin-report__controls">
        <h2>{A('Отчёт по исследованию')}</h2>
        <div role="group" aria-label={A('Версия отчёта')} className="admin-report__mode">
          <button type="button" aria-pressed={publicMode} className={publicMode ? 'active' : ''} onClick={() => setPublicMode(true)}>{A('Для публикации (пороги ')}{MIN_CELL}/{MIN_N})</button>
          <button type="button" aria-pressed={!publicMode} className={!publicMode ? 'active' : ''} onClick={() => setPublicMode(false)}>{A('Внутренний (все данные)')}</button>
        </div>
        <button type="button" className="admin-signin" onClick={print}>{A('Печать / сохранить как PDF')}</button>
      </div>
      <article className="admin-report__page">
        <header>
          <p className="admin-kicker">{publicMode ? A('ВЕРСИЯ ДЛЯ ПУБЛИКАЦИИ') : A('ВНУТРЕННИЙ ОТЧЁТ · НЕ ПУБЛИКОВАТЬ')}</p>
          <h1>{A('«Алкоголь и мозг»: итоги добровольного опроса 15+')}</h1>
          <p>{A('Дата отчёта: ')}{today}{A(' · данные обновлены ')}{new Date(data.lastUpdated).toLocaleString(adminLocale)}</p>
        </header>
        <h2>{A('1. Выборка')}</h2>
        {publishable ? <p>{A('Валидных ответов текущей схемы (v4, возраст 15+, согласие): ')}<b>{data.n}</b>{A('. Исключено при подсчёте (старые схемы, без согласия): ')}{data.excluded}.</p> : <p>{A('Валидных ответов меньше ')}{MIN_N}{A(', результаты в публичной версии не показываются.')}</p>}
        <h2>{A('2. Метод')}</h2>
        <p>{A('Добровольный анонимный онлайн-опрос по открытой ссылке для участников от 15 лет, на эстонском, русском и английском языках. Данные не содержат имени, e-mail, телефона, школы и точной даты рождения. Опрос описывает собранную выборку и не является репрезентативной оценкой населения Эстонии; причинные выводы не делаются. Форма не заменяет этическое согласование: организатор отдельно проверяет применимые требования, в том числе для участников 15–17 лет.')}</p>
        <h2>{A('3. Правила публикации')}</h2>
        <p>{publicMode ? A('Результаты не публикуются, пока валидных ответов меньше {0}. Отдельные категории меньше {1} ответов не показываются: они объединяются в строку «Другие», а если остаток меньше {2}, к нему присоединяется самая малая из показанных категорий. Возрастные группы от 18 лет объединены. Проценты считаются от числа ответивших на вопрос.', MIN_N, MIN_CELL, MIN_CELL) : A('Это внутренняя версия: показаны все категории без подавления малых групп. Не передавайте её и не публикуйте.')}</p>
        {publishable && <>
          <h2>{A('4. Результаты')}</h2>
          <div className="admin-report__grid">{blocks.map(b => (
            <div className="admin-q admin-report__q" key={b.k}>
              <h3>{b.q.title}</h3>
              {b.entries ? <ResultsChart items={items(b.k, b.entries)} total={b.answered} ariaLabel={b.q.title} countWord={A('отв.')} /> : <p className="result-base">{A('Скрыто правилом порога.')}</p>}
              <p className="result-base">{b.q.multi ? A('Доля от всех участников ({0}); можно выбрать несколько.', data.n) : A('Ответили {0} из {1}.', b.answered, data.n)} {b.note}</p>
            </div>))}</div>
          {data.prepost && (<><h2>{A('5. Проверка знаний до и после')}</h2><PrePostCard data={data.prepost} publicMode={publicMode} /></>)}
        </>}
        <h2>{publishable ? '6' : '4'}{A('. Ограничения')}</h2>
        <p>{A('Самоотбор участников и самоотчёт могут создавать систематические смещения. Анонимные пары «до и после» сопоставляются по случайному коду на устройстве, поэтому часть участников выпадает из пар. Результаты описывают выборку, а не причины.')}</p>
        <footer className="admin-report__foot">{A('Сформировано автоматически из закрытой панели сайта alkohol-ja-aju.')}</footer>
      </article>
    </section>
  );
}
