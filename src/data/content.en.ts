import type { Question } from './content';

/** English myth/fact statements. Same ids, answers and source numbers as the Estonian originals in content.ts. */
export const questionsEn: Question[] = [
  { id: 'coffee', statement: 'Coffee quickly sobers a person up.', fact: false, explanation: 'Coffee can increase alertness, but it does not restore the coordination or judgement impaired by alcohol. The body needs time to break alcohol down.', refs: [4], status: 'verified' },
  { id: 'blackout', statement: 'A person can be awake during a memory blackout.', fact: true, explanation: 'A blackout is not the same as losing consciousness. A person can be awake even though new memories are not being stored.', refs: [2], status: 'verified' },
  { id: 'attention', statement: 'Alcohol can make it harder to follow two tasks at once.', fact: true, explanation: 'Alcohol can disrupt divided attention, that is, following several activities at the same time.', refs: [3], status: 'verified' },
  { id: 'reaction', statement: 'Alcohol makes reacting to an unexpected situation faster.', fact: false, explanation: 'Alcohol can slow reaction and disrupt information processing and the coordination of movements.', refs: [3], status: 'verified' },
  { id: 'sleep', statement: 'Falling asleep faster after alcohol always means better sleep.', fact: false, explanation: 'Although falling asleep may be faster, sleep can become fragmented and waking up can come earlier.', refs: [5], status: 'verified' },
  { id: 'decisions', statement: 'Alcohol can weaken impulse control.', fact: true, explanation: 'Alcohol can disrupt decision-making and make it harder to hold back momentary impulses.', refs: [1], status: 'verified' },
  { id: 'development', statement: 'Brain development is already complete by upper-secondary school age.', fact: false, explanation: 'Brain development continues beyond adolescence. Regions involved in planning and decision-making are still maturing in young adulthood.', refs: [1], status: 'verified' },
  { id: 'recover', statement: 'Events from a complete alcohol-related blackout may not be recalled later.', fact: true, explanation: 'If memories were not formed, they cannot be restored simply by trying to remember.', refs: [2], status: 'verified' },
  { id: 'gaba', statement: 'Alcohol affects only one brain neurotransmitter system.', fact: false, explanation: 'Alcohol affects several systems. Key targets include GABA and glutamate/NMDA signalling, and alcohol also acts on the reward and dopamine systems.', refs: [6, 9], status: 'verified' },
  { id: 'wholebody', statement: 'The health risks of alcohol are limited to the brain and the liver.', fact: false, explanation: 'Alcohol use is linked to a wide range of health problems, including injuries, cardiovascular disease and several types of cancer.', refs: [8], status: 'verified' },
];
