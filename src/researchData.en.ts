/** English overlay for the survey: step titles and intros by position, questions by id, option labels by value. */
export const stepsEn: { title: string; intro: string }[] = [
  { title: 'Consent and age', intro: 'The survey is for participants aged 15 and older. Participation is voluntary: you do not have to answer a sensitive question, and you can stop before sending. People aged 15–17 give a separate, independent informed consent.' },
  { title: 'Your experience', intro: 'This part is about the last 12 months. For counting, one portion is roughly a small bottle or can of beer (250 ml), a small glass of wine (100 ml) or one shot of spirits (30 ml).' },
  { title: 'People close to you', intro: 'Every question in this part is about the last 12 months. You do not need to give names. “A close person” means someone with whom you have an important personal relationship.' },
  { title: 'Effect on you', intro: 'Every question below is about the last 12 months and only about situations connected with the drinking of people around you.' },
  { title: 'Environment and support', intro: 'The last part is about social pressure, being able to say no, and knowing where to find help.' },
];

const prefer = 'I prefer not to answer';
const freq = { never: 'Never', rare: 'Rarely', sometimes: 'Sometimes', often: 'Often', prefer_not: prefer };

export const questionsEn: Record<string, { title: string; hint?: string; options: Record<string, string> }> = {
  ageEligible15Plus: { title: 'Are you at least 15 years old?', options: { yes: 'Yes', no: 'No' } },
  ageGroup: { title: 'Age group', options: { '15_17': '15–17', '18_20': '18–20', '21_25': '21–25', '26_35': '26–35', '36_plus': '36+' } },
  consent: { title: 'Do you voluntarily agree to take part and to send answers without direct identifiers for learning and research analysis?', hint: 'Before sending, you can stop taking part without giving a reason.', options: { yes: 'Yes, I understand the conditions', no: 'No' } },
  minorConsent: { title: 'If you are 15–17: do you understand that the questions concern alcohol, people close to you and your sense of safety, and do you voluntarily agree to take part independently?', hint: 'This form is not an ethics approval for the study. The organiser must separately make sure that independent consent from 15–17-year-olds is permitted for the specific study.', options: { yes: 'Yes, I understand and agree', no: 'No' } },
  ownUse: { title: 'In the last 12 months, how often did you drink an alcoholic beverage?', options: { never: 'Never', less_monthly: 'Less than once a month', monthly: 'About once a month', two_four_month: '2–4 times a month', two_three_week: '2–3 times a week', four_plus_week: '4 times a week or more', prefer_not: prefer } },
  typicalUnits: { title: 'On a typical day when you drank, how many such portions did you usually have?', hint: 'See the examples above. If the drinks were different, add them up roughly. This is not a medical test or a diagnosis.', options: { '1_2': '1–2 portions', '3_4': '3–4 portions', '5_6': '5–6 portions', '7_9': '7–9 portions', '10_plus': '10 portions or more', prefer_not: prefer } },
  sixPlus: { title: 'In the last 12 months, how often did you have 6 or more such portions on one occasion?', hint: 'Use the portion examples above.', options: { never: 'Never', less_monthly: 'Less than once a month', monthly: 'About once a month', weekly: 'About once a week', daily_almost: 'Daily or almost daily', prefer_not: prefer } },
  contexts: { title: 'In which situations did drinking happen most often?', options: { friends: 'With friends', family: 'With family or relatives', event: 'At a party or event', alone: 'Alone', other: 'Other', prefer_not: prefer } },
  peerNorm: { title: 'How common is drinking alcohol among people of roughly your age around you?', options: { rare: 'Hardly ever', some: 'Some people do', common: 'Fairly common', very_common: 'Very common', unsure: 'I don’t know', prefer_not: prefer } },
  closeExposure: { title: 'In the last 12 months, how often did you see a close person clearly intoxicated?', options: freq },
  closeRelations: { title: 'Who was it? You can choose several answers.', options: { partner: 'Partner', family: 'Family member or relative', friend: 'Friend', other: 'Another close person', prefer_not: prefer } },
  closeHousehold: { title: 'Did any of these people live with you for at least part of the last 12 months?', options: { yes: 'Yes', sometimes: 'Part of the time', no: 'No', prefer_not: prefer } },
  closeConflict: { title: 'In the last 12 months, how often did a close person’s drinking lead to conflict or tension around you?', options: freq },
  closeUnsafe: { title: 'In the last 12 months, how often did a situation feel unpredictable or unsafe because of a close person’s drinking?', options: freq },
  worry: { title: 'I worried because of a close person’s drinking.', options: freq },
  sleep: { title: 'Because of this it was harder for me to sleep or rest peacefully.', options: freq },
  study: { title: 'Because of this it was harder to concentrate on study or work.', options: freq },
  mood: { title: 'This noticeably affected my mood.', options: freq },
  avoid: { title: 'I tried to avoid the person or the situation because of alcohol.', options: freq },
  unsafe: { title: 'I felt unsafe because of other people’s drinking.', options: freq },
  extraResponsibility: { title: 'I had to take on extra duties, look after the person or deal with the consequences of their drinking.', options: freq },
  overallImpact: { title: 'Overall, how strongly did other people’s drinking negatively affect your wellbeing in the last 12 months?', options: { none: 'It did not affect me', slight: 'Slightly', moderate: 'Moderately', strong: 'Strongly', very_strong: 'Very strongly', prefer_not: prefer } },
  pressure: { title: 'In the last 12 months, how often did you feel pressure from a group to drink alcohol?', options: freq },
  refusalNormal: { title: 'How normal is it in your circle to turn down alcohol without explaining?', options: { yes: 'Completely normal', mostly: 'Rather normal', unsure: 'Not sure', mostly_no: 'Rather difficult', no: 'Very difficult', prefer_not: prefer } },
  helpKnowledge: { title: 'Do you know where to turn if a close person’s drinking starts to bother, worry or frighten you?', options: { yes: 'Yes', partly: 'I have a rough idea', no: 'No', prefer_not: prefer } },
  supportChoice: { title: 'Who would it be easiest for you to turn to in such a situation?', options: { friend: 'A friend', family: 'A close adult', school: 'A school or university specialist', doctor: 'A medical or psychological professional', helpline: 'An anonymous helpline', none: 'None of these', prefer_not: prefer } },
};
