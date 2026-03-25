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
    weeklyStrategy: [
      'Lock your prep blocks now. No exceptions.',
      'One recruiting action per day — pick the highest-leverage one.',
      'Confirm every deadline before Thursday.',
    ],
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
    weeklyStrategy: [
      'Find the angle others are ignoring this week.',
      'Run one new outreach before Friday. Just one.',
      'Map your options before you narrow anything down.',
    ],
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
    weeklyStrategy: [
      "Block deep work time first — protect it.",
      "Don't add to the list. Finish what's already on it.",
      'Show up for the reps, especially when you don\'t feel like it.',
    ],
  },
  wolf: {
    id: 'wolf',
    name: 'Wolf',
    subtitle: 'The Pack Leader',
    animal: 'Wolf',
    emoji: '🐺',
    color: '#8B5CF6',
    image: null, // placeholder — replace with /wolf1.png when asset is ready
    keyPhrase: 'The team moves as fast as the slowest person you are willing to carry.',
    description: 'You lead by example and lift others as you climb. Ascend helps you track group projects, coordinate with teammates, and never let a collaborative deadline slip.',
    petIntroMessage: (name) =>
      `Let's move together, ${name}. Your dashboard is ready — show me who's counting on you this week.`,
    weeklyStrategy: [
      'Check in with two teammates before Friday.',
      'Delegate one task you would normally hold onto.',
      'Block time for a group sync before any deadlines.',
    ],
  },
  owl: {
    id: 'owl',
    name: 'Owl',
    subtitle: 'The Analyst',
    animal: 'Owl',
    emoji: '🦉',
    color: '#06B6D4',
    image: null, // placeholder — replace with /owl1.png when asset is ready
    keyPhrase: 'You cannot optimize what you have not measured.',
    description: "You see patterns others miss. Ascend surfaces the data behind your week — tracking completion rates, recruiting velocity, and academic trends so you can make smarter decisions.",
    petIntroMessage: (name) =>
      `The data is in, ${name}. Three things stand out this week. Open your dashboard and let's look at the numbers.`,
    weeklyStrategy: [
      "Review last week's completion rate before setting new goals.",
      'Identify the one bottleneck slowing your recruiting pipeline.',
      'Build in one analysis block — 30 minutes is enough.',
    ],
  },
  falcon: {
    id: 'falcon',
    name: 'Falcon',
    subtitle: 'The Executor',
    animal: 'Falcon',
    emoji: '🦅',
    color: '#F97316',
    image: null, // placeholder — replace with /falcon1.png when asset is ready
    keyPhrase: 'Speed is a strategy. Most people just call it urgency.',
    description: "You execute fast and adapt faster. Ascend helps you maintain precision under pressure — surfacing what is most urgent before you even think to look.",
    petIntroMessage: (name) =>
      `No delays, ${name}. Here is what needs to happen today. Your dashboard is already sorted by urgency.`,
    weeklyStrategy: [
      'Do the highest-stakes task first, every day.',
      'Cut one low-value activity from your schedule.',
      'Set a hard stop time — speed means nothing without recovery.',
    ],
  },
  lion: {
    id: 'lion',
    name: 'Lion',
    subtitle: 'The Connector',
    animal: 'Lion',
    emoji: '🦁',
    color: '#EF4444',
    image: null, // placeholder — replace with /lion1.png when asset is ready
    keyPhrase: 'Relationships are your infrastructure. Maintain them.',
    description: "Your network is your most valuable asset. Ascend tracks every coffee chat, follow-up, and recruiting contact so no relationship falls through the cracks.",
    petIntroMessage: (name) =>
      `Who have you followed up with this week, ${name}? Let's check your networking dashboard — three people are waiting to hear from you.`,
    weeklyStrategy: [
      'Send one follow-up email before noon today.',
      'Add one new contact to your networking tracker.',
      'Schedule a coffee chat for next week now, not later.',
    ],
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

  'wolf.straight': {
    morning:            (n) => `Morning, ${n}. Who on your team needs a check-in before Friday? Handle it today.`,
    taskComplete:       (n) => `Good. One less thing holding the team back. What's next?`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. You prepped. Make sure your study partner did too.`,
    recruitingDeadline: (n) => `Goldman deadline tonight, ${n}. Submit yours, then check in on your group members.`,
    allComplete:        (n) => `Clean execution, ${n}. Now make sure the people around you are on track too.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Introduce yourself to someone you haven't met. Pull someone in.`,
    progressComment:    (n) => `4 to 6, ${n}. Momentum is building. Keep the team moving.`,
  },
  'wolf.sarcastic': {
    morning:            (n) => `Morning, ${n}. Your teammates aren't going to check in on themselves. Might want to do that.`,
    taskComplete:       (n) => `Look at that — you did a thing. Have you checked if your team has done their things?`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. Still not sure if your study group actually prepared? Bold strategy.`,
    recruitingDeadline: (n) => `Goldman deadline tonight. You. Submitted. Your team? That's their problem, ${n}. Or is it?`,
    allComplete:        (n) => `All done, ${n}. Now go ask your teammates if they can say the same. I'll wait.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Maybe try networking with people who aren't in your usual circle.`,
    progressComment:    (n) => `4 to 6, ${n}. Slow clap. Now make sure you brought someone else up with you.`,
  },
  'wolf.hype': {
    morning:            (n) => `LET'S GO ${n}! The pack moves together! Check on your team and let's DOMINATE this week!`,
    taskComplete:       (n) => `YES, ${n}! That's the energy! The pack is strong when you lead like this!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You AND your team are ready! Go show them what preparation looks like!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! Submit that app and help your people get theirs in too!`,
    allComplete:        (n) => `EVERY SINGLE TASK, ${n}! PACK LEADER ENERGY! Now go make sure everyone else is set too!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! Walk in like the room needs you — because it does!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! THE PACK IS ACCELERATING! KEEP LEADING!`,
  },
  'wolf.zen': {
    morning:            (n) => `Who needs your presence today, ${n}? The pack feels strongest when you're fully there.`,
    taskComplete:       (n) => `One step forward. The team moves when you move.`,
    examTomorrow:       (n) => `The exam is tomorrow, ${n}. You've done your part. Trust the work you've done together.`,
    recruitingDeadline: (n) => `Submit with intention, ${n}. Then breathe. You've done what you could.`,
    allComplete:        (n) => `Full presence today, ${n}. The team is lucky to have you show up like this.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Go in open. The best connections happen when you're not trying.`,
    progressComment:    (n) => `Steady progress, ${n}. From 4 to 6. The pack grows stronger quietly.`,
  },

  'owl.straight': {
    morning:            (n) => `Morning, ${n}. What's the completion rate this week so far? Let's make sure we're on track.`,
    taskComplete:       (n) => `Logged. The pattern is becoming clearer.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. You've reviewed the data. You know your weak spots. Address them tonight.`,
    recruitingDeadline: (n) => `Goldman deadline tonight, ${n}. Your application reflects your research. Submit it.`,
    allComplete:        (n) => `Full execution, ${n}. The data confirms: you operate best with clear task lists.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Come with one question you actually want answered. Don't wing it.`,
    progressComment:    (n) => `4 to 6, ${n}. 50% improvement week-over-week. The trend is valid.`,
  },
  'owl.sarcastic': {
    morning:            (n) => `Good morning, ${n}. The data says you've been productive 60% of mornings this month. Today's a good day to improve that number.`,
    taskComplete:       (n) => `Task complete. One data point in the right direction. You only need about forty more.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. The analysis says you know 70% of this material. The other 30% is where exams live.`,
    recruitingDeadline: (n) => `Goldman deadline tonight. Statistically, applications submitted after 9pm underperform. Just saying, ${n}.`,
    allComplete:        (n) => `All tasks complete, ${n}. Unprecedented. Logging this as a statistical outlier.`,
    saturday:           (n) => `Alumni lunch today, ${n}. I'd tell you to prepare questions, but you've already made a spreadsheet, haven't you.`,
    progressComment:    (n) => `4 to 6, ${n}. That's a 50% improvement. Statistically significant. Replicate the conditions.`,
  },
  'owl.hype': {
    morning:            (n) => `GOOD MORNING ${n}! You SEE things others miss! Today is your day to use that EDGE!`,
    taskComplete:       (n) => `YES, ${n}! The data points are adding up and they are ALL POINTING UP!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've studied the patterns! NOW GO SHOW WHAT YOU KNOW!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! Your research is your superpower — let it show in that application!`,
    allComplete:        (n) => `EVERY SINGLE TASK, ${n}! THE OWL IS OPERATING AT PEAK CAPACITY!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! Go learn something nobody else in that room will think to ask!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! THE DATA DOESN'T LIE — YOU'RE ACCELERATING!`,
  },
  'owl.zen': {
    morning:            (n) => `What does the data tell you today, ${n}? Sit with it before you decide where to focus.`,
    taskComplete:       (n) => `One more pattern confirmed. The picture grows clearer.`,
    examTomorrow:       (n) => `You've done the analysis, ${n}. Trust the preparation. The exam is just one more data point.`,
    recruitingDeadline: (n) => `Submit what you've built, ${n}. The work speaks for itself.`,
    allComplete:        (n) => `Full execution, ${n}. Notice what conditions made today possible.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Go in curious. The best insights come from unexpected places.`,
    progressComment:    (n) => `Quiet improvement, ${n}. From 4 to 6. The pattern is becoming consistent.`,
  },

  'falcon.straight': {
    morning:            (n) => `Morning, ${n}. What's the highest-stakes item today? Do that first. Everything else waits.`,
    taskComplete:       (n) => `Done. What's next? Keep moving.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. One sharp review session tonight. Sleep by midnight. Execute tomorrow.`,
    recruitingDeadline: (n) => `Goldman deadline tonight, ${n}. Submit it fast, submit it well. No second-guessing.`,
    allComplete:        (n) => `Full execution, ${n}. Speed and precision. That's the standard.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Walk in with your one ask clear. Don't waste their time or yours.`,
    progressComment:    (n) => `4 to 6, ${n}. The velocity is building. Keep the pace.`,
  },
  'falcon.sarcastic': {
    morning:            (n) => `Good morning, ${n}. The tasks aren't going to complete themselves while you read this message. Just saying.`,
    taskComplete:       (n) => `Done. Was that really so hard? What's taking so long on the next one?`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. You've had a week to prep. Cramming is just admitting you were slow. Let's go.`,
    recruitingDeadline: (n) => `Goldman deadline tonight. Still not submitted? The Falcon is disappointed in your velocity, ${n}.`,
    allComplete:        (n) => `All done, ${n}. Took long enough. What else can we knock out before midnight?`,
    saturday:           (n) => `Alumni lunch today, ${n}. Have your elevator pitch ready. Nobody has time for a ramble.`,
    progressComment:    (n) => `4 to 6, ${n}. Better. Still not fast enough. What's slowing you down?`,
  },
  'falcon.hype': {
    morning:            (n) => `LET'S GO ${n}! Fastest from idea to done — that's YOU! What are we EXECUTING on today?!`,
    taskComplete:       (n) => `DONE ALREADY, ${n}?! THE FALCON DOES NOT SLOW DOWN! NEXT TARGET!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've been BUILDING to this! Execute with precision tomorrow!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! Fastest submission, best preparation — that's the FALCON WAY!`,
    allComplete:        (n) => `EVERY SINGLE TASK, ${n}! SPEED AND PRECISION! THAT'S THE STANDARD!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! Walk in fast, make an impression, and leave them wanting more!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! THE VELOCITY IS BUILDING! DON'T DECELERATE NOW!`,
  },
  'falcon.zen': {
    morning:            (n) => `What is the one thing today, ${n}, that moves fastest with the least friction? Start there.`,
    taskComplete:       (n) => `Swift and clean. Move to the next.`,
    examTomorrow:       (n) => `The exam is tomorrow, ${n}. Your preparation has been your practice. Execute with clarity.`,
    recruitingDeadline: (n) => `Submit it, ${n}. You've done the work. The application is complete. Let it go.`,
    allComplete:        (n) => `Swift execution, ${n}. Notice how much energy you have left when you move without resistance.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Move into it light. The best connections are effortless.`,
    progressComment:    (n) => `From 4 to 6, ${n}. The path is clearing. Keep moving with intention.`,
  },

  'lion.straight': {
    morning:            (n) => `Morning, ${n}. Who haven't you followed up with this week? Send that email before noon.`,
    taskComplete:       (n) => `Good. One relationship maintained. The network grows stronger.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. You've built the relationships that matter. Now show your own work.`,
    recruitingDeadline: (n) => `Goldman deadline tonight, ${n}. Your application should reflect the people who vouched for you.`,
    allComplete:        (n) => `Everything done, ${n}. Your network sees you showing up. That matters.`,
    saturday:           (n) => `Alumni lunch today, ${n}. You know how to work a room. Do it with intention today.`,
    progressComment:    (n) => `4 to 6, ${n}. The connections you've built are paying off. Keep tending them.`,
  },
  'lion.sarcastic': {
    morning:            (n) => `Good morning, ${n}. How many follow-up emails have you not sent this week? I counted. It's three.`,
    taskComplete:       (n) => `Task done. Have you mentioned it to the three people who needed to know? No? Interesting.`,
    examTomorrow:       (n) => `Exam tomorrow, ${n}. The relationship you need is with the material. Hope you've been nurturing that one.`,
    recruitingDeadline: (n) => `Goldman deadline tonight. Your network got you the referral. Try not to submit something mediocre, ${n}.`,
    allComplete:        (n) => `All done, ${n}. Now go tell someone about it. You know you want to.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Please don't spend the whole time talking to people you already know.`,
    progressComment:    (n) => `4 to 6, ${n}. Up 50%. Did you have anyone helping you, or did you actually do this alone?`,
  },
  'lion.hype': {
    morning:            (n) => `GOOD MORNING ${n}! You own every room you walk into! WHO ARE WE CONNECTING WITH TODAY?!`,
    taskComplete:       (n) => `YES, ${n}! The Lion gets things done AND brings people along! Keep going!`,
    examTomorrow:       (n) => `ECON MIDTERM TOMORROW ${n}! You've built relationships with professors, TAs, study groups — NOW USE THEM!`,
    recruitingDeadline: (n) => `GOLDMAN DEADLINE TONIGHT ${n}! Your network got you this far — your application takes you the rest of the way!`,
    allComplete:        (n) => `EVERY SINGLE TASK, ${n}! THE LION SHOWS UP AND DELIVERS! Now go celebrate with your people!`,
    saturday:           (n) => `ALUMNI LUNCH TODAY ${n}! This is your ARENA! Walk in and OWN IT!`,
    progressComment:    (n) => `FROM 4 TO 6, ${n}! THE LION IS BUILDING MOMENTUM — AND BRINGING THE WHOLE PRIDE WITH YOU!`,
  },
  'lion.zen': {
    morning:            (n) => `Who in your world needs to feel seen today, ${n}? Start there.`,
    taskComplete:       (n) => `Well done. The relationships you tend grow quietly, but they grow strong.`,
    examTomorrow:       (n) => `The exam is tomorrow, ${n}. You've been present in every class. That presence shows.`,
    recruitingDeadline: (n) => `Submit it, ${n}. The connections you've made opened the door. Your work will carry you through.`,
    allComplete:        (n) => `You showed up for yourself and for others today, ${n}. That's the Lion way.`,
    saturday:           (n) => `Alumni lunch today, ${n}. Go in genuinely curious about the people there. The connections will follow.`,
    progressComment:    (n) => `From 4 to 6, ${n}. Quiet progress. The relationships are holding you up even when you don't notice.`,
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
