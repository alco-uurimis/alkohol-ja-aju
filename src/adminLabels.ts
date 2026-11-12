/** Russian labels for the admin view. Unknown codes fall back to the raw code, so new answers never disappear. */
const LV = { never: 'Никогда', rare: 'Редко', sometimes: 'Иногда', often: 'Часто', prefer_not: 'Предпочитаю не отвечать' };
type Q = { title: string; multi?: boolean; codes: Record<string, string> };
export const adminQuestions: Record<string, Q> = {
  language: { title: 'Язык анкеты', codes: { et: 'Эстонский', ru: 'Русский' } },
  ageGroup: { title: 'Возрастные группы', codes: { '15_17': '15–17', '18_20': '18–20', '21_25': '21–25', '26_35': '26–35', '36_plus': '36+', prefer_not: 'Предпочитаю не отвечать' } },
  ownUse: { title: 'Частота употребления за 12 месяцев', codes: { never: 'Никогда', less_monthly: 'Реже раза в месяц', monthly: 'Раз в месяц', two_four_month: '2–4 раза в месяц', two_three_week: '2–3 раза в неделю', four_plus_week: '4+ раза в неделю', prefer_not: 'Предпочитаю не отвечать' } },
  typicalUnits: { title: 'Единиц алкоголя в обычный день', codes: { '1_2': '1–2', '3_4': '3–4', '5_6': '5–6', '7_9': '7–9', '10_plus': '10+', prefer_not: 'Предпочитаю не отвечать' } },
  sixPlus: { title: 'Частота 6+ единиц за один раз', codes: { never: 'Никогда', less_monthly: 'Реже раза в месяц', monthly: 'Раз в месяц', weekly: 'Раз в неделю', daily_almost: 'Почти каждый день', prefer_not: 'Предпочитаю не отвечать' } },
  contexts: { title: 'Где и с кем употребляют (можно несколько)', multi: true, codes: { friends: 'С друзьями', family: 'В семье', event: 'На мероприятиях', alone: 'В одиночестве', other: 'Другое', prefer_not: 'Предпочитаю не отвечать' } },
  peerNorm: { title: 'Насколько распространено среди ровесников', codes: { rare: 'Редко', some: 'У некоторых', common: 'Часто', very_common: 'Очень часто', unsure: 'Не уверен(а)', prefer_not: 'Предпочитаю не отвечать' } },
  closeExposure: { title: 'Близкий был заметно пьян (12 мес.)', codes: LV },
  closeRelations: { title: 'Кто из близких (можно несколько)', multi: true, codes: { partner: 'Партнёр', family: 'Семья', friend: 'Друг', other: 'Другое', prefer_not: 'Предпочитаю не отвечать' } },
  closeHousehold: { title: 'Жил(а) вместе с этим человеком', codes: { yes: 'Да', sometimes: 'Иногда', no: 'Нет', prefer_not: 'Предпочитаю не отвечать' } },
  closeConflict: { title: 'Конфликты из-за чужого употребления', codes: LV },
  closeUnsafe: { title: 'Непредсказуемость и небезопасность из-за близкого', codes: LV },
  worry: { title: 'Переживания из-за чужого употребления', codes: LV },
  sleep: { title: 'Влияние на сон и отдых', codes: LV },
  study: { title: 'Влияние на учёбу или работу', codes: LV },
  mood: { title: 'Влияние на настроение', codes: LV },
  avoid: { title: 'Избегание человека или ситуации', codes: LV },
  unsafe: { title: 'Чувство небезопасности', codes: LV },
  extraResponsibility: { title: 'Дополнительные обязанности', codes: LV },
  overallImpact: { title: 'Общее негативное влияние', codes: { none: 'Не повлияло', slight: 'Незначительно', moderate: 'Умеренно', strong: 'Сильно', very_strong: 'Очень сильно', prefer_not: 'Предпочитаю не отвечать' } },
  pressure: { title: 'Давление компании выпить (12 мес.)', codes: LV },
  refusalNormal: { title: 'Нормально ли отказаться без объяснений', codes: { yes: 'Да', mostly: 'Скорее да', unsure: 'Не уверен(а)', mostly_no: 'Скорее нет', no: 'Нет', prefer_not: 'Предпочитаю не отвечать' } },
  helpKnowledge: { title: 'Знает, куда обратиться за помощью', codes: { yes: 'Да', partly: 'Частично', no: 'Нет', prefer_not: 'Предпочитаю не отвечать' } },
  supportChoice: { title: 'К кому проще обратиться', codes: { friend: 'Друг', family: 'Семья', school: 'Школа', doctor: 'Врач', helpline: 'Телефон доверия', none: 'Ни к кому', prefer_not: 'Предпочитаю не отвечать' } },
};
