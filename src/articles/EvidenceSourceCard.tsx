import type { ArticleLang, EvidenceSourceArticle } from './types';
import './article-support.css';

type Props = {
  article: EvidenceSourceArticle;
  lang: ArticleLang;
};

const labels = {
  ru: {
    heading: 'КАРТОЧКА ИСТОЧНИКА',
    kind: 'Тип материала',
    sample: 'Выборка / материал',
    identifier: 'Идентификатор',
    limit: 'Граница вывода',
    pubmed: 'Открыть в PubMed',
    sourceLink: 'Открыть источник',
    doi: 'DOI',
    pmid: 'PMID',
  },
  et: {
    heading: 'ALLIKA KAART',
    kind: 'Materjali tüüp',
    sample: 'Valim / materjal',
    identifier: 'Tunnus',
    limit: 'Järelduse piir',
    pubmed: 'Ava PubMedis',
    sourceLink: 'Ava allikas',
    doi: 'DOI',
    pmid: 'PMID',
  },
} as const;

function isPubMed(url: string) {
  try {
    return new URL(url).hostname.endsWith('pubmed.ncbi.nlm.nih.gov');
  } catch {
    return false;
  }
}

export function EvidenceSourceCard({ article, lang }: Props) {
  const copy = labels[lang];
  const hasIdentifier = Boolean(article.evidence.pmid || article.evidence.doi);

  return (
    <section className="evidence-source-card" aria-labelledby="source-card-title">
      <div className="evidence-source-card__heading">
        <span>{copy.heading}</span>
        <h2 id="source-card-title">{article.source}</h2>
        <p>{article.citation}</p>
      </div>

      <dl className="evidence-source-card__facts">
        <div>
          <dt>{copy.kind}</dt>
          <dd>{article.evidence.kind[lang]}</dd>
        </div>
        {article.evidence.sample && <div>
          <dt>{copy.sample}</dt>
          <dd>{article.evidence.sample[lang]}</dd>
        </div>}
        {hasIdentifier && <div>
          <dt>{copy.identifier}</dt>
          <dd className="evidence-source-card__identifiers">
            {article.evidence.pmid && <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.evidence.pmid}/`} target="_blank" rel="noreferrer">{copy.pmid} {article.evidence.pmid}</a>}
            {article.evidence.doi && <a href={`https://doi.org/${article.evidence.doi}`} target="_blank" rel="noreferrer">{copy.doi} {article.evidence.doi}</a>}
          </dd>
        </div>}
      </dl>

      <div className="evidence-source-card__limit">
        <strong>{copy.limit}</strong>
        <p>{article.limits[lang]}</p>
      </div>

      <a className="evidence-source-card__link" href={article.url} target="_blank" rel="noreferrer">
        {isPubMed(article.url) ? copy.pubmed : copy.sourceLink}
      </a>
    </section>
  );
}

