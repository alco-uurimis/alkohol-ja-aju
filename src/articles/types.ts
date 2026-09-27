export type ArticleLang = 'et' | 'ru';

export type LocalizedText = Record<ArticleLang, string>;

/**
 * Facts that describe the cited source itself. Fields stay optional so an
 * institutional evidence summary is never made to look like a single study.
 */
export type EvidenceCitationMetadata = {
  kind: LocalizedText;
  sample?: LocalizedText;
  pmid?: string;
  doi?: string;
};

export type EvidenceSourceArticle = {
  source: string;
  citation: string;
  url: string;
  limits: LocalizedText;
  evidence: EvidenceCitationMetadata;
};

export type ArticleTopicLink = {
  id: string;
  title: LocalizedText;
};

