// All landing-page copy lives here so layout components never hardcode text.
// Edit this file to change what the page says without touching JSX/layout.

export const CONTACT_EMAIL = 'drake.krommenhoek@gmail.com'

export const TRACKS = ['Investment Banking', 'Consulting', 'Private Equity', 'Tech', 'Other']

export const GRAD_YEARS = [2026, 2027, 2028, 2029, 2030, 2031]

export const nav = {
  wordmark: 'ASCEND',
  links: [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#features', label: 'Features' },
    { href: '#faq', label: 'FAQ' },
  ],
  demoLink: 'Try the demo',
  cta: 'Join the waitlist',
  dashboardLink: 'Open dashboard',
}

export const hero = {
  eyebrow: 'YOUR EDGE, ORGANIZED.',
  headline: 'Never miss the deadline that costs you the offer.',
  subhead:
    'Ascend pulls Canvas, your recruiting pipeline, and your calendar into one weekly game plan, built for students who mean it.',
  microcopy: 'Founding Cohort gets Pro free. No spam, unsubscribe anytime.',
  demoLink: 'Or try the live demo →',
}

export const problem = {
  checkpoint: 'CP-01 · 1,200 FT',
  heading: 'Five tabs. Three calendars. One missed coffee chat.',
  body:
    'Your recruiting timeline lives in Handshake. Your classes live in Canvas. Your network lives in your inbox and LinkedIn. Ascend is the one place all of it actually has to show up.',
  icons: [
    { id: 'canvas', src: '/Canvas.png', label: 'Canvas' },
    { id: 'gcal', src: '/GC.png', label: 'Google Calendar' },
    { id: 'gmail', src: '/Gmail.png', label: 'Gmail' },
    { id: 'linkedin', src: '/LinkedIn.png', label: 'LinkedIn' },
    { id: 'handshake', src: '/Handshake.png', label: 'Handshake' },
  ],
}

export const howItWorks = {
  checkpoint: 'CP-02 · 4,400 FT',
  heading: 'The system, in three moves.',
  checkpoints: [
    {
      id: 'connect',
      index: '01',
      title: 'Connect',
      body: 'Canvas, your calendars, and your inbox sync in once. No re-entering deadlines by hand.',
    },
    {
      id: 'plan',
      index: '02',
      title: 'Plan',
      body: 'Every Sunday, the Sunday Preview reads your week and hands you the three moves that matter most.',
    },
    {
      id: 'execute',
      index: '03',
      title: 'Execute',
      body: 'The deadline board keeps score in real time, and your accountability partner notices when you slip.',
    },
  ],
}

export const deadlineBoardTasks = [
  { id: 't1', label: 'Econ 210 problem set', due: 'Due Mon 9am' },
  { id: 't2', label: 'Evercore coffee chat: prep 3 Qs', due: 'Due Tue 2pm' },
  { id: 't3', label: 'Canvas: Phil 101 reading', due: 'Due Wed 11am' },
  { id: 't4', label: 'Submit Bain app', due: 'Due 11:59pm' },
  { id: 't5', label: 'Lift + 30 min run', due: 'Due Fri' },
]

export const features = {
  checkpoint: 'CP-03 · 7,800 FT',
  heading: 'What actually runs the week.',
  items: [
    {
      index: '01',
      title: 'This Week board',
      body: 'Academics, recruiting, and life in one weekly board, so nothing gets lost between three different apps.',
    },
    {
      index: '02',
      title: 'Sunday Preview',
      body: 'A short AI read of your week ahead, condensed into the handful of actions that move the needle.',
    },
    {
      index: '03',
      title: 'Accountability partner',
      body: 'Pick an archetype — eagle, fox, or bear — that checks in on your week and calls out what you dropped.',
      images: [
        { src: '/eagle1.png', alt: 'Eagle archetype' },
        { src: '/fox1.png', alt: 'Fox archetype' },
        { src: '/bear2.png', alt: 'Bear archetype' },
      ],
    },
    {
      index: '04',
      title: 'Networking tracker',
      body: 'Every coffee chat and follow-up logged in one place, with a clean Excel export for your own records.',
    },
  ],
}

export const foundingCohort = {
  checkpoint: 'CP-04 · 11,200 FT',
  heading: 'The Founding Cohort',
  body: 'The first students in shape what Ascend becomes. In exchange:',
  perks: [
    'Pro access, free, for as long as you use it',
    'A direct line to the founder — your feedback ships',
    'A hand in the roadmap before anyone else sees it',
  ],
}

export const faq = {
  checkpoint: 'FAQ',
  heading: 'Questions worth answering upfront.',
  items: [
    {
      id: 'cost',
      question: 'What does it cost?',
      answer: 'Founding Cohort members get Pro free. Pricing for everyone else will be announced before launch.',
    },
    {
      id: 'launch',
      question: 'When does it launch?',
      answer: 'We’re onboarding the Founding Cohort now. Joining the waitlist puts you in that group.',
    },
    {
      id: 'schools',
      question: 'Which schools?',
      answer: 'Any school. Ascend was built at Washington and Lee, but it works wherever you’re recruiting from.',
    },
    {
      id: 'data',
      question: 'What do you do with my data?',
      answer: 'We explain exactly what we collect and why on the privacy page.',
      link: { to: '/privacy', label: 'Read the privacy page' },
    },
    {
      id: 'demo',
      question: 'Can I try it now?',
      answer: 'Yes. The live demo walks through the real product with sample data — no signup required.',
    },
  ],
}

export const finalCta = {
  heading: 'Recruiting season doesn’t wait. Neither should you.',
}

export const footer = {
  copyright: '© 2026 Ascend',
  privacyLabel: 'Privacy',
  contactLabel: 'Contact',
}

export const waitlistForm = {
  placeholder: 'you@school.edu',
  ctaIdle: 'Join the waitlist',
  ctaSubmitting: 'Joining…',
  microcopy: 'Founding Cohort gets Pro free. No spam, unsubscribe anytime.',
  successHeading: 'Check your inbox to confirm your spot.',
  genericError: 'Something went wrong. Try again.',
}

export const profileStep = {
  heading: 'A little more helps us place you right (optional).',
  schoolLabel: 'School',
  gradYearLabel: 'Grad year',
  trackLabel: 'Track',
  saveLabel: 'Save',
  savingLabel: 'Saving…',
  skipLabel: 'Skip for now',
}

export const referralPanel = {
  heading: 'Every friend who joins moves the Founding Cohort forward.',
  copyLabel: 'Copy link',
  copiedLabel: 'Copied',
}
