export interface AdditionalSource { id:number; organization:string; title:string; originalTitle:string; year:number|null; url:string; accessed:string; note:string }

export const additionalSourcesEt:AdditionalSource[]=[
  {id:12,organization:'CDC · USA haiguste tõrje ja ennetamise keskused',title:'Alkoholitarvitamine alaealiste seas',originalTitle:'About Underage Drinking',year:2025,url:'https://www.cdc.gov/alcohol/underage-drinking/',accessed:'2026-09-27',note:'Noorte alkoholitarvitamise, vigastuste, kooli ja terviseriskide ülevaade.'},
  {id:13,organization:'McPhee jt · Neuroscience & Biobehavioral Reviews',title:'Alkoholi vahetu mõju reaktsiooni pidurdamisele: metaanalüüs',originalTitle:'Meta-analysis of acute alcohol effects on response inhibition',year:2023,url:'https://pubmed.ncbi.nlm.nih.gov/37277010/',accessed:'2026-09-27',note:'Laboriuuringute metaanalüüs Go/No-Go ja Stop Signal ülesannetega.'},
  {id:14,organization:'WHO · Maailma Terviseorganisatsioon',title:'Noorukite tervis: riskid ja lahendused',originalTitle:'Adolescent and young adult health',year:2024,url:'https://www.who.int/news-room/fact-sheets/detail/adolescents-health-risks-and-solutions',accessed:'2026-09-27',note:'Noorukite tervise, sealhulgas alkoholi ja teiste ainete tarvitamise riskide ülevaade.'},
];

export const additionalSourcesRu:AdditionalSource[]=[
  {id:12,organization:'CDC · Центры США по контролю и профилактике заболеваний',title:'Употребление алкоголя несовершеннолетними',originalTitle:'About Underage Drinking',year:2025,url:'https://www.cdc.gov/alcohol/underage-drinking/',accessed:'2026-09-27',note:'Обзор употребления алкоголя молодыми людьми, травм, школьных и медицинских рисков.'},
  {id:13,organization:'McPhee и соавт. · Neuroscience & Biobehavioral Reviews',title:'Острый эффект алкоголя на торможение реакции: метаанализ',originalTitle:'Meta-analysis of acute alcohol effects on response inhibition',year:2023,url:'https://pubmed.ncbi.nlm.nih.gov/37277010/',accessed:'2026-09-27',note:'Метаанализ лабораторных исследований с задачами Go/No-Go и Stop Signal.'},
  {id:14,organization:'ВОЗ · Всемирная организация здравоохранения',title:'Здоровье подростков и молодых взрослых: риски и решения',originalTitle:'Adolescent and young adult health',year:2024,url:'https://www.who.int/news-room/fact-sheets/detail/adolescents-health-risks-and-solutions',accessed:'2026-09-27',note:'Обзор здоровья подростков, включая риски, связанные с алкоголем и другими веществами.'},
];

