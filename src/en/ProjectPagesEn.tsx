import EstoniaData, { EstoniaDataLink } from '../components/EstoniaData';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import PeerNorm from '../components/PeerNorm';
import ResultsChart, { type ResultItem } from '../components/ResultsChart';

/** English versions of the project pages and the English home page. Same classes as ProjectPagesAppV2. */

export type EnPage = 'home' | 'topics' | 'methodology' | 'fact-check' | 'data-policy' | 'results' | 'changelog';
type SetLang = (l: 'et' | 'ru' | 'en') => void;

const copy: Record<EnPage, { title: string; lead: string }> = {
  home: { title: 'Alcohol and the brain', lead: 'Understand what research shows, and what it does not prove.' },
  topics: { title: 'Science topics', lead: 'Eight separate pages: question, study design, result, limits and source.' },
  methodology: { title: 'Research methodology', lead: 'What the survey measures, whom it describes and which conclusions can be drawn from it.' },
  'fact-check': { title: 'How facts were checked', lead: 'The rules by which scientific claims reach the site.' },
  'data-policy': { title: 'Data and privacy', lead: 'What data is collected, where it goes and what is not shown publicly.' },
  results: { title: 'Survey results', lead: 'Aggregated descriptive statistics only, no raw responses.' },
  changelog: { title: 'Changelog', lead: 'The main changes to content, interface and the research part.' },
};

const kindLabels = { meta: 'Meta-analysis', systematic: 'Systematic review', official: 'Official evidence review', review: 'Evidence review', longitudinal: 'Systematic review of longitudinal studies' } as const;
const topics: { href: string; cat: string; title: string; kind: keyof typeof kindLabels }[] = [
  { href: 'acute-effects/', cat: 'brain', title: 'Acute effects: working memory', kind: 'meta' },
  { href: 'memory-blackouts/', cat: 'brain', title: 'Memory and blackouts', kind: 'official' },
  { href: 'adolescent-brain/', cat: 'youth', title: 'The adolescent brain', kind: 'systematic' },
  { href: 'self-control/', cat: 'brain', title: 'Self-control and response inhibition', kind: 'meta' },
  { href: 'alcohol-and-sleep/', cat: 'sleep', title: 'Alcohol, sleep and breathing', kind: 'meta' },
  { href: 'alcohol-and-driving/', cat: 'safety', title: 'Alcohol and driving', kind: 'official' },
  { href: 'reward-and-habits/', cat: 'brain', title: 'The reward system and habits', kind: 'review' },
  { href: 'recovery-and-brain/', cat: 'recovery', title: 'Recovery of cognitive functions', kind: 'longitudinal' },
];

function Shell({ page, setLang, children }: { page: EnPage; setLang: SetLang; children: ReactNode }) {
  const up = '../';
  const c = copy[page];
  return <div className="project-shell">
    <header className="project-header">
      <a href={page === 'home' ? './' : '../en/'} className="project-brand" aria-label="alcohol and the brain"><img src={up + 'logo-mark.svg'} alt="" /><span>alcohol and the brain</span></a>
      <nav aria-label="Project sections"><a href="../topics/">Science topics</a><a className="project-research-link" href={up + 'science/?lang=en'}>Survey</a><a href={up + 'methodology/'}>Methodology</a></nav>
      <div className="project-lang" role="group" aria-label="Language">
        <button type="button" aria-pressed="false" onClick={() => setLang('et')}>ET</button>
        <button type="button" aria-pressed="false" onClick={() => setLang('ru')}>RU</button>
        <button type="button" className="active" aria-pressed="true" onClick={() => setLang('en')}>EN</button>
      </div>
    </header>
    <main>
      <section className="project-hero"><p className="project-kicker">ALKOHOL JA AJU · v2.2</p><h1>{c.title}</h1><p>{c.lead}</p></section>
      {children}
    </main>
    <footer><a href={up}>Main site</a><a href={up + 'topics/'}>Science topics</a><a href={up + 'science/?lang=en'}>Survey</a><a href={up + 'data-policy/'}>Data and privacy</a><a href={up + 'fact-check/'}>Fact-check</a><a href={up + 'changelog/'}>Changelog</a></footer>
  </div>;
}

function TopicCards({ list, prefix }: { list: typeof topics; prefix: string }) {
  return <div className="project-grid">{list.map(t => <a className="project-card" href={prefix + t.href} key={t.href}><span>{kindLabels[t.kind]}</span><h2>{t.title}</h2><p>Question → what was measured → result → limits of the conclusion → source.</p></a>)}</div>;
}

function Home({ setLang }: { setLang: SetLang }) {
  return <>
    <section className="project-section">
      <div className="project-grid">
        <a className="project-card" href="../start/"><span>5 minutes</span><h2>Quick overview</h2><p>The main idea, one diagram and a short myth-or-fact check.</p></a>
        <a className="project-card" href="../start/?mode=full"><span>20 minutes</span><h2>Learn the basics</h2><p>Four steps: explanation, a study, reading the conclusion and a quiz.</p></a>
        <a className="project-card" href="../teacher/"><span>For teachers</span><h2>45-minute lesson plan</h2><p>A ready plan with discussion questions and links to sources.</p></a>
      </div>
    </section>
    <section className="project-section"><h2>Science topics</h2><TopicCards list={topics} prefix="../" /><p><a href="../topics/">All science topics</a></p></section>
    <section className="project-callout"><strong>Need help?</strong><p>In immediate danger call <a href="tel:112">112</a>. To talk or get advice, Lasteabi <a href="tel:116111">116 111</a> is free and open around the clock in Estonian, Russian and English. <a href="../help/">More on getting help</a></p></section>
    <section className="project-callout"><strong>Optional: see what you learned</strong><p>An anonymous before-and-after check of six statements. Nothing is linked to your name or an account. <a href="../check/">Open the check</a></p></section>
    <section className="project-callout"><strong>Exercises, games and the survey</strong><p>The memory and attention exercises and the mini-games are currently available in Estonian and Russian only. The voluntary research survey (15+) is available in English too: <a href="../science/?lang=en">open the survey</a>. <a href="../?lang=et" onClick={() => setLang('et')}>Open the Estonian site</a> · <a href="../?lang=ru" onClick={() => setLang('ru')}>Open the Russian site</a></p></section>
  </>;
}

function Topics() {
  const [filter, setFilter] = useState('all');
  const labels: Record<string, string> = { all: 'All', brain: 'Brain', youth: 'Teenagers', sleep: 'Sleep', safety: 'Safety', recovery: 'Recovery' };
  const list = filter === 'all' ? topics : topics.filter(t => t.cat === filter);
  return <section className="project-section"><div className="topic-filters" role="group" aria-label="Topic filter">{Object.entries(labels).map(([k, v]) => <button type="button" key={k} className={filter === k ? 'active' : ''} aria-pressed={filter === k} onClick={() => setFilter(k)}>{v}</button>)}</div><TopicCards list={list} prefix="../" /><EstoniaDataLink lang="en" /></section>;
}

function Methodology() {
  return <><section className="project-section project-prose">
    <h2>What this project is</h2><p>“Alcohol and the brain” is an upper-secondary-school learning and research website. It combines science-based explanations, interactive exercises and a separate voluntary survey, “Help science”.</p>
    <h2>Research question</h2><p>How do participants aged 15 and over describe their own contact with alcohol, the alcohol use of people close to them, and the possible effect of this experience on everyday well-being, study or work and sense of safety?</p>
    <h2>Sample</h2><p>The survey is open to participants aged 15+. It is a voluntary sample recruited through an open link, so the results describe the collected sample and do not automatically represent all residents of Estonia or all people aged 15+.</p>
    <h2>What is measured</h2><p>Age group, frequency of own use over 12 months, typical number of alcohol units, episodes of 6+ units, use by people close to the participant, conflict and feeling unsafe, possible effect on sleep, study or work and mood, social pressure and knowledge of where to get help. This is not a diagnostic test.</p>
    <h2>Ethics and participants aged 15–17</h2><p>The form contains separate information and a confirmation for 15–17-year-olds. The web form itself is not an ethics approval: the organiser must separately check which requirements apply to the specific study and its organiser.</p>
    <h2>Analysis plan</h2><p>The main analysis is descriptive statistics: the number of valid responses of the current schema, shares of categories and distributions. Old test and legacy schemas are not included in the current aggregates. The public page publishes nothing until there are at least 10 valid responses, and single categories with fewer than 5 responses are suppressed or merged into an “Other” row. No causal conclusions are drawn from this survey.</p>
    <h2>Language of the survey</h2><p>The survey was designed in Estonian and Russian. The English version is a translation that has not been validated: its answers are stored with the language code “en”, and comparisons between language versions should be made with caution because wording can shift meaning.</p>
  </section><section className="project-callout"><strong>Main limitation</strong><p>Self-selection of participants and self-report can create systematic bias. The results cannot be interpreted as a representative estimate of the population.</p></section></>;
}

function FactCheck() {
  const steps = ['Prefer systematic reviews, meta-analyses and official evidence reviews when they fit the question.', 'Check the size and type of the sample, the study design and the measured outcome.', 'Separate acute effects from long-term associations.', 'Do not turn a correlation into a causal claim.', 'Do not transfer a group’s average effect to an individual.', 'Show limitations next to the conclusion.', 'Give a direct link, PMID or DOI when available.', 'Check that the translation preserves the level of certainty of the original claim.'];
  return <section className="project-section"><div className="checklist">{steps.map((s, i) => <div key={s}><b>{String(i + 1).padStart(2, '0')}</b><p>{s}</p></div>)}</div><div className="evidence-key"><h2>Source type describes the design, not a judgement of the author</h2><p>The site uses neutral labels: meta-analysis, systematic review, longitudinal study, controlled experiment and official evidence review. They help to understand which question a source can answer.</p><p><strong>The main scientific sources were re-checked on 28 September 2026.</strong></p></div></section>;
}

function DataPolicy() {
  return <section className="project-section project-prose">
    <h2>What the learning site stores</h2><p>Exercise results and visited sections may be kept in the current tab. Longer-term saving of progress on the device is used only after the user explicitly chooses it.</p>
    <h2>Account (optional)</h2><p>If you create an account, your e-mail (or the name and photo from your Google profile) and the registration time are stored. The data is kept with the Supabase service. An account is not needed to read the materials and is not linked to the responses of the research survey.</p>
    <h2>Anonymous before-and-after check (optional)</h2><p>The optional knowledge check stores a random code created in your browser, the answers to six statements, the score and the language. It does not ask for or store a name, e-mail, school or IP address (the hosting service may keep ordinary technical logs). It is not linked to an account or to the survey, and you can use the check without sending anything.</p>
    <h2>What “Help science” collects</h2><p>The age group and answers to questions about alcohol, people close to you and possible effects. The form does not ask for a name, e-mail, phone number, school, address or exact date of birth.</p>
    <h2>Where responses are sent</h2><p>A response is saved in the study’s private Google Sheets spreadsheet and in a backup copy in the Supabase database (access only for the organiser). The anonymous before-and-after check (random code, six right/wrong marks, score, language) is stored the same way: in the same spreadsheet and the copy. Telegram may receive a notification that a response was saved, without the answers, the response ID or the participant’s age.</p>
    <h2>What appears in public results</h2><p>Only aggregate values of the current v4 schema. Raw rows are not published. Until there are at least 10 valid responses, distributions are not published; single categories with fewer than 5 responses are also suppressed, and small categories are merged into an “Other” row.</p>
    <h2>Who to contact</h2><p>The project author is Sofija Tsaika, Tallinna Laagna Gümnaasium. The survey organiser’s contact has not yet been published. For general information about the school project, contact the school. <a href="https://laagna.tln.edu.ee/kontakt/">School contacts</a></p>
    <h2>Retention period</h2><p>The retention period and the procedure for withdrawing a submitted response have not yet been published. If you want to clarify the terms of participation or the possibility of deletion, ask the organiser before submitting. After submitting, keep the response code if you plan to contact us about your record.</p>
    <h2>Why we do not write “fully anonymous”</h2><p>The absence of a name does not guarantee absolute anonymity of a dataset. That is why the precise wording “without direct identifiers” is used.</p>
  </section>;
}

function Changelog() {
  const releases: [string, string, string][] = [
    ['v2.2', '13.11.2026', 'Added an English version (start page, lesson, help, science topics, methodology, data and privacy, results) and an anonymous before-and-after knowledge check.'],
    ['v2.1', '28.09.2026', 'Full quality audit: fixed v4/legacy analytics, localisation of service pages, responsiveness, accessibility and survey navigation.'],
    ['v2.0', '27.09.2026', 'Added science pages, methodology, data policy, public aggregates and the updated 15+ survey.'],
  ];
  return <section className="project-section"><div className="timeline">{releases.map(([v, date, text]) => <article key={v}><div><strong>{v}</strong><span>{date}</span></div><p>{text}</p></article>)}</div></section>;
}

// ---- Results (same privacy rules as the ET/RU page: only categories the API already approved) ----
type Summary = { ok?: boolean; n?: number; publishable?: boolean; minimumGroupSize?: number; lastUpdated?: string; ageGroup?: Record<string, number>; ownUse?: Record<string, number>; overallImpact?: Record<string, number>; helpKnowledge?: Record<string, number>; answered?: Partial<Record<'ageGroup' | 'ownUse' | 'overallImpact' | 'helpKnowledge', number>> };
const resultLabels: Record<string, Record<string, string>> = {
  ageGroup: { '15_17': '15–17', '18_plus': '18 and older', '18_20': '18–20', '21_25': '21–25', '26_35': '26–35', '36_plus': '36+', prefer_not: 'Prefer not to answer' },
  ownUse: { never: 'Never', less_monthly: 'Less than monthly', monthly: 'About monthly', two_four_month: '2–4 times a month', two_three_week: '2–3 times a week', four_plus_week: '4+ times a week', prefer_not: 'Prefer not to answer' },
  overallImpact: { none: 'No effect', slight: 'Slight', moderate: 'Moderate', strong: 'Strong', very_strong: 'Very strong', prefer_not: 'Prefer not to answer' },
  helpKnowledge: { yes: 'Yes', partly: 'Partly', no: 'No', prefer_not: 'Prefer not to answer' },
};
const blocks = [['ageGroup', 'Age groups'], ['ownUse', 'Frequency of use'], ['overallImpact', 'Negative impact'], ['helpKnowledge', 'Knowing where to get help']] as const;

function Results() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch('https://alkohol-ja-aju.vercel.app/api/research-summary').then(r => r.ok ? r.json() : Promise.reject(new Error('http'))).then(d => { if (alive) setData(d); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, []);
  const items = useMemo(() => (key: string, entries: [string, number][]): ResultItem[] => {
    const order = Object.keys(resultLabels[key] ?? {});
    return entries.map(([code, count]) => ({ code, label: code === 'other_small' ? 'Other (small groups merged)' : resultLabels[key]?.[code] ?? code, count }))
      .sort((a, b) => (order.indexOf(a.code) < 0 ? 99 : order.indexOf(a.code)) - (order.indexOf(b.code) < 0 ? 99 : order.indexOf(b.code)));
  }, []);
  const publishable = data?.publishable === true && (data.n ?? 0) >= 10;
  return <section className="project-section">
    {!data && !error && <div className="result-lock"><strong>Loading…</strong></div>}
    {error && <div className="project-callout"><strong>Statistics are temporarily unavailable</strong><p>This does not mean the responses are lost. The public overview and the saving of responses work separately.</p></div>}
    {data && !publishable && <div className="result-lock"><strong>N = {data.n ?? 0}</strong><p>Distributions will appear once there are at least {Math.max(10, data.minimumGroupSize ?? 10)} valid responses of the current schema.</p></div>}
    {data && publishable && <>
      <div className="result-kpi"><span>Valid responses</span><strong>{data.n}</strong><small>{data.lastUpdated ? new Date(data.lastUpdated).toLocaleString('en-GB') : ''}</small></div>
      <div className="result-grid">{blocks.map(([key, title]) => {
        const counts = Object.entries(data[key] || {});
        const base = counts.reduce((sum, [, c]) => sum + c, 0);
        const ok = counts.length > 0 && counts.every(([, c]) => Number.isInteger(c) && c >= 5) && (base === data.n || base === data.answered?.[key]);
        return <div className="result-card" key={key}><h2>{title}</h2>{ok ? <><ResultsChart variant={key === 'helpKnowledge' ? 'stack' : 'bars'} total={base} countWord="resp." ariaLabel={title} items={items(key, counts)} />{base !== data.n && <p className="result-base">{base} of {data.n} answered this question. Percentages are of those who answered.</p>}</> : <p className="result-card-empty">Figures hidden: the distribution contains small groups or incomplete data.</p>}</div>;
      })}</div>
      <PeerNorm data={data} lang="en" />
      <p className="result-note">This is descriptive statistics of a voluntary sample. It does not prove causation and is not a representative estimate of the population of Estonia.</p>
    </>}
  </section>;
}

export default function ProjectPagesEn({ page, setLang }: { page: EnPage; setLang: SetLang }) {
  useEffect(() => {
    document.documentElement.lang = 'en';
    try { localStorage.setItem('alkohol-ja-aju:language', 'en'); } catch { /* ignore */ }
    document.title = `${copy[page].title}${page === 'home' ? ' — teaching website' : ' — Alcohol and the brain'}`;
  }, [page]);
  const content = page === 'home' ? <Home setLang={setLang} /> : page === 'methodology' ? <Methodology /> : page === 'fact-check' ? <FactCheck /> : page === 'data-policy' ? <DataPolicy /> : page === 'results' ? <><Results /><EstoniaData lang="en" /></> : page === 'changelog' ? <Changelog /> : <Topics />;
  return <Shell page={page} setLang={setLang}>{content}</Shell>;
}
