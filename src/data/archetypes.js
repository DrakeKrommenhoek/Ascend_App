export const ARCHETYPES = {
  eagle: {
    id: 'eagle',
    name: 'Eagle',
    subtitle: 'The Strategist',
    animal: 'Eagle',
    emoji: '🦅',
    color: '#4F8EF7',
    image: '/eagle1.png',
    keyPhrase: 'Does this task actually move the needle, or are you just flapping your wings?',
    description: "You know exactly where you're going. Ascend helps you build the bridge between ambition and execution — tracking every recruiting milestone so nothing falls through the cracks.",
    petIntroMessage: (name) =>
      `Good. You know what you want, ${name}. I'm here to make sure you don't waste the window. Let's not overthink this — open your dashboard and show me what you're working with.`,
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    subtitle: 'The Explorer',
    animal: 'Fox',
    emoji: '🦊',
    color: '#F5C842',
    image: '/fox1.png',
    keyPhrase: 'That path looks blocked — how can we outsmart the gatekeeper?',
    description: 'You are building the map as you go — and that takes real courage. Ascend helps you stay curious without losing momentum, surfacing the right opportunities at the right time.',
    petIntroMessage: (name) =>
      `Nice to meet you, ${name}. I've already spotted three paths you haven't considered yet. Come see your dashboard — things are about to get interesting.`,
  },
  bear: {
    id: 'bear',
    name: 'Bear',
    subtitle: 'The Operator',
    animal: 'Bear',
    emoji: '🐻',
    color: '#34D399',
    image: '/bear2.png',
    keyPhrase: "The plan doesn't care how you feel today. Show up and do the reps.",
    description: 'You are juggling a lot — and you are doing it. Ascend brings structure to the chaos, turning your scattered commitments into a unified command center.',
    petIntroMessage: (name) =>
      `Hey ${name}. No speech needed. You already know what to do. Let's just make sure you do it. Your dashboard is ready.`,
  },
}

// ── Humor × Archetype message matrix ─────────────────────────────────────────
// contexts: morning | taskComplete | examTomorrow | recruitingDeadline |
//           allComplete | saturday | progressComment
export const HUMOR_MESSAGES = {
  'eagle.straight': {
    morning:            (n) => `Three things today, ${n}. Goldman prep, ECON review, done. Move.`,
    taskComplete:       (n) => `Good. One less variable. What's next?`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. Review your weak spots tonight. Sleep by midnight. No excuses.`,
    recruitingDeadline: (n) => `Goldman deadline is tonight, ${n}. Submit. Do not wait until 11pm.`,
    allComplete:        (n) => `Clean execution, ${n}. That's how it compounds.`,
    saturday:           (n) => `Tux and alumni lunch today, ${n}. The lunch matters more. Prep two talking points.`,
    progressComment:    (n) => `Up from 4 to 6, ${n}. That's the only metric that matters. Keep building.`,
  },
  'eagle.sarcastic': {
    morning:            (n) => `Oh good, you opened the app, ${n}. Gold star. Now — does this task actually move the needle, or are you procrastinating with extra steps?`,
    taskComplete:       (n) => `Well, look at that. You did a thing. Only three more to go.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. Still think "I'll wing it" is a strategy? Thought so. Study.`,
    recruitingDeadline: (n) => `The Goldman deadline is not moving just because you are, ${n}. Application. Now.`,
    allComplete:        (n) => `Well well well. Look who actually finished everything. Shocked, ${n}. Truly shocked.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Maybe actually prepare a question this time instead of just smiling.`,
    progressComment:    (n) => `4 last week, 6 this week. Progress. Still not a perfect score, but we're raising the floor.`,
  },
  'eagle.hype': {
    morning:            (n) => `LET'S GO ${n}! Today is the day! Goldman prep, ECON review — you were BUILT for this window!`,
    taskComplete:       (n) => `THAT'S WHAT I'M TALKING ABOUT, ${n}! Keep stacking those wins!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've been building toward this moment! ONE MORE NIGHT OF FOCUS!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! This is YOUR moment — submit and make it count!`,
    allComplete:        (n) => `EVERY. SINGLE. TASK. ${n} YOU ARE BUILT DIFFERENT!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! Every connection is a door — walk in ready to open it!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! You're accelerating! Don't stop now!`,
  },
  'eagle.zen': {
    morning:            (n) => `What is the one thing today, ${n}, that will matter most a year from now?`,
    taskComplete:       (n) => `The path forward is one step at a time.`,
    examTomorrow:       (n) => `Your preparation has been your work, ${n}. Rest tonight. The exam is just a reflection.`,
    recruitingDeadline: (n) => `The deadline is near, ${n}. Trust the preparation. Submit with clarity.`,
    allComplete:        (n) => `You moved with intention today, ${n}. Notice that.`,
    saturday:           (n) => `The alumni lunch is an opportunity, ${n}. Go in curious, not anxious.`,
    progressComment:    (n) => `Steady improvement, ${n}. The work is accumulating in ways you cannot yet see.`,
  },

  'fox.straight': {
    morning:            (n) => `Morning, ${n}. The coffee chat Wednesday is your real opening this week. Prep for it.`,
    taskComplete:       (n) => `Smart. One more angle cleared.`,
    examTomorrow:       (n) => `ECON midterm tomorrow. You know more than you think. Quick review, sharp mind, go.`,
    recruitingDeadline: (n) => `Goldman deadline tonight. Your differentiator is the coffee chat follow-up. Use it, ${n}.`,
    allComplete:        (n) => `Everything cleared, ${n}. Now you're free to focus on what's actually interesting.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Have one sharp question ready. Make them remember you.`,
    progressComment:    (n) => `4 to 6, ${n}. You're finding your angles. Keep optimizing.`,
  },
  'fox.sarcastic': {
    morning:            (n) => `Good morning, ${n}. Yes, the Goldman deadline is still Sunday. No, it won't magically become Monday.`,
    taskComplete:       (n) => `Oh wow, you did the thing. Truly revolutionary. What's next on the list?`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. Cramming is a well-established tradition. Doesn't make it a good one.`,
    recruitingDeadline: (n) => `The deadline doesn't care how interesting your other projects are, ${n}. Application. Now.`,
    allComplete:        (n) => `All done, ${n}. Your productivity is almost suspicious. What are you avoiding?`,
    saturday:           (n) => `Alumni lunch today, ${n}. Please have at least one question that isn't about their career path.`,
    progressComment:    (n) => `4 last week. 6 this week. Suspicious improvement, ${n}. What changed?`,
  },
  'fox.hype': {
    morning:            (n) => `GOOD MORNING ${n}! Three paths, infinite options — you've already spotted the angle nobody else saw!`,
    taskComplete:       (n) => `YES, ${n}! That's the energy! Outmaneuvering the competition one task at a time!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've been connecting dots all semester — now it's time to show it!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE IS YOUR MOMENT, ${n}! Submit that app and let's see what doors open!`,
    allComplete:        (n) => `EVERY. SINGLE. TASK. ${n} YOU ARE BUILT DIFFERENT!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! Every conversation is a clue — go find the angles!`,
    progressComment:    (n) => `UP FROM 4 TO 6, ${n}! The fox is finding its stride!`,
  },
  'fox.zen': {
    morning:            (n) => `The path will reveal itself, ${n}. You've already taken the first step. What feels most alive right now?`,
    taskComplete:       (n) => `One thread pulled, and the whole picture gets clearer.`,
    examTomorrow:       (n) => `Tomorrow's exam is a checkpoint, ${n}. You have been preparing. Trust the work.`,
    recruitingDeadline: (n) => `Let the application speak for itself, ${n}. You've done the work. Submit with confidence.`,
    allComplete:        (n) => `Everything flows when you move with intention, ${n}. Well done.`,
    saturday:           (n) => `Go into the alumni lunch open, ${n}. You might be surprised what emerges.`,
    progressComment:    (n) => `The pattern is shifting, ${n}. From 4 to 6 — you're finding what works.`,
  },

  'bear.straight': {
    morning:            (n) => `Morning, ${n}. Goldman Sunday, midterm Friday. Block the time. Do the reps.`,
    taskComplete:       (n) => `One down. Keep going.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. Review your notes, get to bed on time. You've done the work.`,
    recruitingDeadline: (n) => `Goldman is due tonight, ${n}. You've prepared. Submit it.`,
    allComplete:        (n) => `Everything done, ${n}. That's the discipline.`,
    saturday:           (n) => `Tux and alumni lunch today, ${n}. Don't be late for either.`,
    progressComment:    (n) => `4 last week. 6 this week. The streak is building, ${n}. Don't break it.`,
  },
  'bear.sarcastic': {
    morning:            (n) => `Oh look, ${n} showed up. As expected. Let's go.`,
    taskComplete:       (n) => `Nice, you did the thing you were supposed to do. That's called being an adult, ${n}.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. The bear doesn't cram. The bear shows up because the bear did the work. You did, right?`,
    recruitingDeadline: (n) => `Goldman deadline tonight. Still haven't submitted? The bear is judging you, ${n}.`,
    allComplete:        (n) => `Well well well. Look who actually finished everything. Shocked, truly shocked.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Try not to talk about yourself for the first five minutes. Just try.`,
    progressComment:    (n) => `4 to 6, ${n}. Slow clap. The bar was on the floor and you stepped over it.`,
  },
  'bear.hype': {
    morning:            (n) => `LET'S GO ${n}! You showed up today and that's already more than most people! Now let's do the reps!`,
    taskComplete:       (n) => `YES! That's it, ${n}! Every rep counts! Keep stacking!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've been putting in the WORK! ONE MORE SESSION AND YOU'RE READY!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! You've been building for this! SUBMIT THAT APPLICATION!`,
    allComplete:        (n) => `LET'S GO ${n}! EVERY SINGLE TASK! That's the Bear energy right there!`,
    saturday:           (n) => `ALUMNI LUNCH AND TUXEDO DAY, ${n}! You're showing up in every way today!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! THE BEAR IS BUILDING MOMENTUM! DON'T STOP NOW!`,
  },
  'bear.zen': {
    morning:            (n) => `Hey ${n}. Breathe. You've shown up before and you'll show up today. One thing at a time.`,
    taskComplete:       (n) => `Good. You did what needed doing. Rest a moment, then continue.`,
    examTomorrow:       (n) => `The exam is tomorrow, ${n}. Sleep matters more than one more hour of notes tonight.`,
    recruitingDeadline: (n) => `Goldman tonight, ${n}. You showed up all week. One more thing to complete. Then rest.`,
    allComplete:        (n) => `You showed up completely today, ${n}. That is enough.`,
    saturday:           (n) => `The alumni lunch is today, ${n}. Go in present. Listen more than you speak.`,
    progressComment:    (n) => `Steady improvement, ${n}. From 4 to 6. The work is accumulating quietly.`,
  },
}

export function getPetMessage(archetypeId, humorStyle, context, name) {
  const key  = `${archetypeId}.${humorStyle}`
  const msgs = HUMOR_MESSAGES[key]
  if (!msgs) return ''
  const fn = msgs[context]
  return fn ? fn(name) : ''
}

/**
 * Score the 4-question quiz.
 * Q1: 0=Eagle+3, 1=Fox+3, 2=Bear+3
 * Q2: 0=Eagle+2, 1=Fox+2, 2=Bear+1+Fox+1
 * Q3: 0=Eagle+2, 1=Fox+2, 2=Bear+2
 * Q4: 0=Eagle+4, 1=Fox+4, 2=Bear+4
 * Tiebreaker: Bear > Fox > Eagle
 */
export function scoreQuiz(answers) {
  const scores = { eagle: 0, fox: 0, bear: 0 }

  const q1 = answers[0]
  if (q1 === 0)      scores.eagle += 3
  else if (q1 === 1) scores.fox   += 3
  else if (q1 === 2) scores.bear  += 3

  const q2 = answers[1]
  if (q2 === 0)      scores.eagle += 2
  else if (q2 === 1) scores.fox   += 2
  else if (q2 === 2) { scores.bear += 1; scores.fox += 1 }

  const q3 = answers[2]
  if (q3 === 0)      scores.eagle += 2
  else if (q3 === 1) scores.fox   += 2
  else if (q3 === 2) scores.bear  += 2

  const q4 = answers[3]
  if (q4 === 0)      scores.eagle += 4
  else if (q4 === 1) scores.fox   += 4
  else if (q4 === 2) scores.bear  += 4

  const max  = Math.max(scores.eagle, scores.fox, scores.bear)
  const tied = Object.keys(scores).filter(k => scores[k] === max)
  if (tied.length === 1) return tied[0]
  if (tied.includes('bear')) return 'bear'
  if (tied.includes('fox'))  return 'fox'
  return 'eagle'
}
