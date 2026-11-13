import { useState } from 'react';
import ResultsChart, { type ResultItem } from './components/ResultsChart';
import { adminQuestions } from './adminLabels';
import { bucketAge, discloseCounts, discloseMulti, MIN_CELL, MIN_N, OTHER } from './lib/disclosure';

export type PrePostSummary = { nPre: number; nPost: number; matched: number; meanPre: number | null; meanPost: number | null; improved: number; same: number; worse: number; total: number; items: { id: string; pre: number | null; post: number | null }[] };
export type ReportData = { n: number; excluded: number; lastUpdated: string; fields: Record<string, Record<string, number>>; answered: Record<string, number>; prepost?: PrePostSummary };

const itemLabels: Record<string, string> = { blackout: 'Во время провала памяти человек может быть в сознании', attention: 'Алкоголь затрудняет следить за двумя задачами сразу', reaction: 'Алкоголь ускоряет реакцию на неожиданную ситуацию', sleep: 'Быстрое засыпание после алкоголя всегда означает лучший сон', decisions: 'Алкоголь может ослаблять контроль импульсов', development: 'В гимназическом возрасте развитие мозга уже завершено' };
const pct = (v: number | null) => (v === null ? '—' : `${Math.round(v * 100)}%`);

/** Admin card: anonymous before/after check. Pairs are matched by a random browser token only. */
export function PrePostCard({ data, publicMode = false }: { data?: PrePostSummary; publicMode?: boolean }) {
  if (!data) return null;
  const hidden = publicMode && data.matched < MIN_N;
  return (
    <div className="admin-q admin-prepost">
      <h3>Проверка «до и после» (анонимная)</h3>
      <p className="admin-meta">Прошли «до»: <b>{data.nPre}</b> · прошли «после»: <b>{data.nPost}</b> · пар с общим кодом: <b>{data.matched}</b></p>
      {hidden ? <p className="admin-meta">Для публикации нужно не меньше {MIN_N} пар. Сейчас: {data.matched}.</p> : data.matched === 0 ? <p className="admin-meta">Пока нет ни одной пары «до и после».</p> : <>
        <p className="admin-prepost__means">Средний балл (из {data.total}): <b>{data.meanPre?.toFixed(2)}</b> → <b>{data.meanPost?.toFixed(2)}</b> · улучшили: {data.improved}, без изменений: {data.same}, ухудшили: {data.worse}</p>
        <table className="admin-table"><thead><tr><th>Утверждение</th><th>До</th><th>После</th></tr></thead><tbody>{data.items.map(i => <tr key={i.id}><td>{itemLabels[i.id] ?? i.id}</td><td>{pct(i.pre)}</td><td>{pct(i.post)}</td></tr>)}</tbody></table>
        <p className="result-base">Доля верных ответов среди пар. Пары собираются по случайному коду в браузере: человек, который проходил проверку на другом устройстве или очистил данные, в пары не попадает.</p>
      </>}
    </div>
  );
}

function items(key: string, entries: [string, number][]): ResultItem[] {
  const order = Object.keys(adminQuestions[key]?.codes ?? {});
  const pos = (c: string) => (c === OTHER ? 98 : order.indexOf(c) < 0 ? 99 : order.indexOf(c));
  return entries.map(([code, count]) => ({ code, label: code === OTHER ? 'Другие (малые группы объединены)' : code === '18_plus' ? '18 и старше' : adminQuestions[key]?.codes[code] ?? code, count })).sort((a, b) => pos(a.code) - pos(b.code));
}

/** Printable report. "Для публикации" applies the same thresholds as the public site; "Внутренний" shows everything. */
export function AdminReport({ data }: { data: ReportData }) {
  const [publicMode, setPublicMode] = useState(true);
  const today = new Date().toLocaleDateString('ru-RU');
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
    if (q.multi) { const d = discloseMulti(raw); return { k, q, entries: d?.items ?? null, answered: data.n, note: d && d.hidden > 0 ? `Категории меньше ${MIN_CELL} ответов не показаны (${d.hidden}).` : '' }; }
    const d = discloseCounts(raw, answered);
    return { k, q, entries: d?.items ?? null, answered, note: d?.merged ? `Категории меньше ${MIN_CELL} ответов объединены в строку «Другие».` : '' };
  });
  const publishable = !publicMode || data.n >= MIN_N;
  return (
    <section className="admin-report" aria-label="Отчёт">
      <div className="admin-report__controls">
        <h2>Отчёт по исследованию</h2>
        <div role="group" aria-label="Версия отчёта" className="admin-report__mode">
          <button type="button" aria-pressed={publicMode} className={publicMode ? 'active' : ''} onClick={() => setPublicMode(true)}>Для публикации (пороги {MIN_CELL}/{MIN_N})</button>
          <button type="button" aria-pressed={!publicMode} className={!publicMode ? 'active' : ''} onClick={() => setPublicMode(false)}>Внутренний (все данные)</button>
        </div>
        <button type="button" className="admin-signin" onClick={print}>Печать / сохранить как PDF</button>
      </div>
      <article className="admin-report__page">
        <header>
          <p className="admin-kicker">{publicMode ? 'ВЕРСИЯ ДЛЯ ПУБЛИКАЦИИ' : 'ВНУТРЕННИЙ ОТЧЁТ · НЕ ПУБЛИКОВАТЬ'}</p>
          <h1>«Алкоголь и мозг»: итоги добровольного опроса 15+</h1>
          <p>Дата отчёта: {today} · данные обновлены {new Date(data.lastUpdated).toLocaleString('ru-RU')}</p>
        </header>
        <h2>1. Выборка</h2>
        {publishable ? <p>Валидных ответов текущей схемы (v4, возраст 15+, согласие): <b>{data.n}</b>. Исключено при подсчёте (старые схемы, без согласия): {data.excluded}.</p> : <p>Валидных ответов меньше {MIN_N}, результаты в публичной версии не показываются.</p>}
        <h2>2. Метод</h2>
        <p>Добровольный анонимный онлайн-опрос по открытой ссылке для участников от 15 лет, на эстонском и русском языках. Данные не содержат имени, e-mail, телефона, школы и точной даты рождения. Опрос описывает собранную выборку и не является репрезентативной оценкой населения Эстонии; причинные выводы не делаются. Форма не заменяет этическое согласование: организатор отдельно проверяет применимые требования, в том числе для участников 15–17 лет.</p>
        <h2>3. Правила публикации</h2>
        <p>{publicMode ? `Результаты не публикуются, пока валидных ответов меньше ${MIN_N}. Отдельные категории меньше ${MIN_CELL} ответов не показываются: они объединяются в строку «Другие», а если остаток меньше ${MIN_CELL}, к нему присоединяется самая малая из показанных категорий. Возрастные группы от 18 лет объединены. Проценты считаются от числа ответивших на вопрос.` : 'Это внутренняя версия: показаны все категории без подавления малых групп. Не передавайте её и не публикуйте.'}</p>
        {publishable && <>
          <h2>4. Результаты</h2>
          <div className="admin-report__grid">{blocks.map(b => (
            <div className="admin-q admin-report__q" key={b.k}>
              <h3>{b.q.title}</h3>
              {b.entries ? <ResultsChart items={items(b.k, b.entries)} total={b.answered} ariaLabel={b.q.title} countWord="отв." /> : <p className="result-base">Скрыто правилом порога.</p>}
              <p className="result-base">{b.q.multi ? `Доля от всех участников (${data.n}); можно выбрать несколько.` : `Ответили ${b.answered} из ${data.n}.`} {b.note}</p>
            </div>))}</div>
          {data.prepost && (<><h2>5. Проверка знаний до и после</h2><PrePostCard data={data.prepost} publicMode={publicMode} /></>)}
        </>}
        <h2>{publishable ? '6' : '4'}. Ограничения</h2>
        <p>Самоотбор участников и самоотчёт могут создавать систематические смещения. Анонимные пары «до и после» сопоставляются по случайному коду на устройстве, поэтому часть участников выпадает из пар. Результаты описывают выборку, а не причины.</p>
        <footer className="admin-report__foot">Сформировано автоматически из закрытой панели сайта alkohol-ja-aju.</footer>
      </article>
    </section>
  );
}
