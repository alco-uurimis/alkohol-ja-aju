/** English texts of the classroom kit, keyed by the Estonian source string (real newlines where the source has \n). */
export const classroomEn: Record<string, string> = {
  'VÄLJUMISPILET: „Alkohol ja aju“\n\n1. Üks fakt või järeldus, mida oskan selgitada: ____________________\n2. Milline allikas või veebilehe osa aitas mul sellest aru saada: ____________________\n3. Piirang: mida see fakt / harjutus EI tõesta: ____________________\n4. Väljamõeldud olukorras võib turvaline tegu olla: ____________________\n\nIsiklikke lugusid, nimesid ega terviseandmeid ei ole vaja kirjutada.':
    'EXIT TICKET: “Alcohol and the brain”\n\n1. One fact or conclusion I can explain: ____________________\n2. Which source or section of the website helped me understand it: ____________________\n3. Limitation: what this fact / exercise does NOT prove: ____________________\n4. In a fictional situation a safe action could be: ____________________\n\nYou do not need to write personal stories, names or health information.',
  'KLASSIRUUMI JAOKS': 'FOR THE CLASSROOM',
  'Valmis tunnirada': 'A ready lesson route',
  '15–20 minuti pikkune stsenaarium tunniks, klassijuhatajatunniks või paaristööks. See kasutab veebilehe materjale, kuid ei eelda isiklike lugude ega terviseandmete jagamist.': 'A 15–20 minute scenario for a lesson, a homeroom period or pair work. It uses the website’s materials but does not require sharing personal stories or health information.',
  'ÕPETAJALE JA KLASSILE': 'FOR THE TEACHER AND THE CLASS',
  '15–20 minutit': '15–20 minutes',
  'Tunni eesmärk': 'Lesson goal',
  'Lühikese tunni lõpuks oskab õppija:': 'By the end of the short lesson the learner can:',
  'Turvalise arutelu tingimused': 'Conditions for a safe discussion',
  'Kuidas arutelu juhtida': 'How to lead the discussion',
  'Rääkige väljamõeldud olukordadest ja allikates toodud faktidest. Luba vastamata jätta ning ära palu jagada tarvitamiskogemust, terviseandmeid ega teiste inimeste infot.': 'Talk about fictional situations and the facts given in the sources. Allow students to pass, and do not ask anyone to share drinking experience, health information or information about other people.',
  'Prindi tunnikava (PDF)': 'Print the lesson plan (PDF)',
  'Prindiaknas vali „Salvesta PDF-ina“.': 'In the print window choose “Save as PDF”.',
  'kava, küsimused, väljumispilet': 'plan, questions, exit ticket',
  'Tunni kava': 'Lesson plan',
  'min': 'min',
  'ARUTELU': 'DISCUSSION',
  'Küsimused ilma ühe õige vastuseta': 'Questions without a single right answer',
  'TÖÖLEHT': 'WORKSHEET',
  'Väljumispilet': 'Exit ticket',
  '3–4 minutit': '3–4 minutes',
  'Valmis leht printimiseks. Töö võib olla anonüümne.': 'A ready sheet for printing. The work can be anonymous.',
  'Täidetav väljumispilet': 'Fillable exit ticket',
  'VÄLJUMISPILET · „ALKOHOL JA AJU“': 'EXIT TICKET · “ALCOHOL AND THE BRAIN”',
  'Isiklikke lugusid, nimesid ega terviseandmeid ei ole vaja kirjutada.': 'You do not need to write personal stories, names or health information.',
  'Kopeeritud': 'Copied',
  'Kopeeri tekst': 'Copy the text',
  'Prindi pilet': 'Print the ticket',
  'Tekst kopeeriti lõikelauale.': 'The text was copied to the clipboard.',
  'Vali väljal olev tekst ning kopeeri see käsitsi.': 'Select the text in the field and copy it by hand.',
};

export const lessonEn = [
  { minutes: '0–2', title: 'Open the question', description: 'Show the sentence “How do you tell an impression from a research conclusion?” Participants answer from the idea, not from personal experience.', links: [{ href: '../start/?lang=en', label: 'Effects of alcohol' }] },
  { minutes: '2–5', title: 'Find the mechanism', description: 'Open the interactive diagram and ask pairs to name one brain function and explain it in their own words.', links: [{ href: '../start/?mode=full&lang=en', label: 'Diagram of functions' }] },
  { minutes: '5–8', title: 'Test an assumption', description: 'Choose one learning exercise. Before starting, the class predicts what it measures and what it cannot measure.', links: [{ href: 'practice.html#labor', label: 'Mini-games' }] },
  { minutes: '8–12', title: 'Look at the evidence', description: 'Read a study card: question, design, result and limitation. Discuss separately where the limit of the conclusion lies.', links: [{ href: '../acute-effects/', label: 'Acute effects' }] },
  { minutes: '12–16', title: 'Make a safe decision', description: 'Discuss a fictional situation: a group has to get home after an event. Put the plan into words before the event, and one way to support a friend.', links: [{ href: '#obsuzhdenie', label: 'Discussion questions' }] },
  { minutes: '16–20', title: 'Put the conclusion into words', description: 'Fill in the short exit ticket: one piece of evidence, one limitation and one safe action. Then open the knowledge check.', links: [{ href: '../start/?mode=full&lang=en', label: 'Knowledge check' }] },
];
export const objectivesEn = [
  'tell observation, association and causal conclusion apart;',
  'name a limitation of one exercise or study;',
  'suggest a safe action in a fictional situation.',
];
export const promptsEn = [
  'Which conclusion does this source support — and which conclusion does it not support?',
  'Why can a mini-game result not be treated as a measure of intoxication or health?',
  'What conditions other than alcohol can affect reaction, memory or a decision?',
  'How can you support a person without making them share personal details?',
];
export const ticketQuestionsEn = [
  'One fact or conclusion I can explain:',
  'Which source or section of the website helped me understand it:',
  'Limitation: what this fact or exercise does NOT prove:',
  'In a fictional situation a safe action could be:',
];
