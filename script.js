/* 
  The Morning Reset — © 2026 DeLoach Studios. All Rights Reserved.
  Official site: https://www.deloachstudios.com

  NOTE:
  This app runs entirely in the browser. That means the front-end code is delivered to the user’s device.
  You may use the app via the official hosted link, but you may not copy, redistribute, resell, or republish
  this code or content without written permission. See LICENSE.txt and terms.html for details.
*/

/* The Morning Reset
  Stability + UX polish:
  - Self-check: core + modals
  - If modal trap detected: toast + force-close (soft fix only; no refresh)
*/

const STORAGE_KEY = "morningReset.saved.v7";
const MAX_SAVES = 30;
const SEEN_HINT_KEY = "morningReset.seenHint.v1";

const DECK_PREFIX = "morningReset.deck.";
const DECK_VERSION = "v2";

// ---------- SAFE STORAGE ----------
const _memStore = {};
const safeStorage = {
  get(key) {
    try {
      return window.localStorage ? localStorage.getItem(key) : (_memStore[key] ?? null);
    } catch {
      return (_memStore[key] ?? null);
    }
  },
  set(key, val) {
    try {
      if (window.localStorage) localStorage.setItem(key, val);
      else _memStore[key] = val;
    } catch {
      _memStore[key] = val;
    }
  },
  remove(key) {
    try {
      if (window.localStorage) localStorage.removeItem(key);
      else delete _memStore[key];
    } catch {
      delete _memStore[key];
    }
  }
};

// ---------- DATA ----------
const MOODS = [
  { name: "Calm",        set: "calm",     role: "REGULATE" },
  { name: "Focused",     set: "steady",   role: "STABILIZE" },
  { name: "Motivated",   set: "boost",    role: "ENERGIZE" },
  { name: "Confident",   set: "feelgood", role: "UPLIFT" },
  { name: "Grounded",    set: "calm",     role: "REGULATE" },
  { name: "Hopeful",     set: "feelgood", role: "UPLIFT" },

  { name: "Anxious",     set: "calm",     role: "REGULATE" },
  { name: "Overwhelmed", set: "steady",   role: "STABILIZE" },
  { name: "Scattered",   set: "steady",   role: "STABILIZE" },
  { name: "Tired",       set: "boost",    role: "ENERGIZE" },
  { name: "Irritated",   set: "feelgood", role: "UPLIFT" },
  { name: "Unmotivated", set: "boost",    role: "ENERGIZE" }
];

const SET_LABELS = {
  calm: "Calm Mode",
  boost: "Boost Mode",
  steady: "Steady Mode",
  feelgood: "Feel-Good Mode"
};

const INTENSITY_OPTIONS = [
  { label: "Soft", value: 1 },
  { label: "Steady", value: 2 },
  { label: "Strong", value: 3 }
];

function compileMessages(templates) {
  return templates.map(t => (names) => t.replace(/\{names\}/g, names));
}

// ---------- CONTENT POOLS (30 each) ----------
const POOLS = {
  calm: {
    messages: compileMessages([
      "We’re lowering the pressure first so you can think clearly. You picked: {names}.",
      "Today is about regulating the noise, not forcing productivity. You picked: {names}.",
      "Less rush. More control. You picked: {names}.",
      "We’re starting gentle so the rest of the day feels doable. You picked: {names}.",
      "Your system wants steadiness, not chaos. You picked: {names}.",
      "Let’s soften the edges and move with intention. You picked: {names}.",
      "Calm doesn’t mean slow — it means centered. You picked: {names}.",
      "We’re protecting your peace and your focus. You picked: {names}.",
      "Your day doesn’t need more pressure; it needs more breathing room. You picked: {names}.",
      "Regulate first, then decide. You picked: {names}.",
      "We’re bringing you back to baseline so you can move smarter. You picked: {names}.",
      "Today’s win is stability, not speed. You picked: {names}.",
      "We’re choosing quiet strength over loud stress. You picked: {names}.",
      "Start softer than you want — it works. You picked: {names}.",
      "Calm is your strategy today, not your mood swing. You picked: {names}.",
      "Take the edge off. Keep the power. You picked: {names}.",
      "No need to sprint. We’re building control. You picked: {names}.",
      "We’re not reacting today — we’re responding. You picked: {names}.",
      "Tiny calm steps beat big stressed leaps. You picked: {names}.",
      "You’re allowed to start with peace. You picked: {names}.",
      "Let’s reset your pace before your pace resets you. You picked: {names}.",
      "Quiet the mind, then move the body. You picked: {names}.",
      "We’re building a calmer launchpad. You picked: {names}.",
      "Today is about steady breathing and simple choices. You picked: {names}.",
      "We’re turning the volume down so you can hear yourself. You picked: {names}.",
      "You don’t need perfect — you need calmer. You picked: {names}.",
      "We’re choosing ease on purpose. You picked: {names}.",
      "Calm first. Confidence next. You picked: {names}.",
      "You’re not behind — you’re recalibrating. You picked: {names}.",
      "We’re going for grounded progress today. You picked: {names}."
    ]),
    quotes: [
      "Breathe first. Decide second.",
      "Slow is smooth. Smooth is fast.",
      "Peace is a strategy.",
      "Calm is power in a quiet outfit.",
      "Your nervous system deserves kindness.",
      "You can be calm and still be ambitious.",
      "Softness is not weakness.",
      "Clarity loves a quiet room.",
      "One breath can change the moment.",
      "Return to center — again and again.",
      "You’re allowed to begin gently.",
      "Less noise. More choice.",
      "Ease is a valid goal.",
      "You don’t have to earn rest.",
      "Grounded beats frantic.",
      "Pause is a skill.",
      "Make space, then make moves.",
      "Calm is how you keep your edge.",
      "Today: steady over scattered.",
      "Peace first, progress next.",
      "Your pace is yours.",
      "Quiet focus wins.",
      "Gentle starts are still starts.",
      "Control starts with breath.",
      "Reset is not failure.",
      "Soft is a strength setting.",
      "Breathe like it matters — because it does.",
      "You can move without rushing.",
      "Calm clears the path.",
      "Start where your feet are."
    ],
    actions: [
      "Take 4 minutes: inhale 4, hold 2, exhale 6 — then do the first step of one small task.",
      "Write down: “What’s the next right move?” Then do the easiest answer.",
      "Reflect for 3 minutes: what can wait without consequences? Write it down.",
      "Jot a short list: what needs attention vs what needs permission to wait.",
      "Note 3 things you can control today. Pick one and take one step.",
      "Brain dump worries for 60 seconds. Circle the one you can influence today.",
      "Journal prompt: “What am I protecting my energy from today?” Answer in 5 lines.",
      "Write a one-sentence intention for today. Then act on it for 5 minutes.",
      "Do a 2-minute body scan. Relax shoulders. Unclench jaw. Then start one task.",
      "List 3 tiny wins you can get before noon. Start with the easiest.",
      "Write: “If I do only one thing well today, it’s ____.” Then do 5 minutes of it.",
      "Jot what’s loud in your head. Turn one item into a single next step.",
      "Reflect: what’s actually urgent? Write it. Ignore the rest for 20 minutes.",
      "Write a “not today” list so your brain stops carrying it.",
      "Take a 5-minute slow walk (or pacing) and breathe evenly the whole time.",
      "Set a 10-minute timer and tidy one small area. Stop when the timer ends.",
      "Note the one boundary you need today. Keep it for the next hour.",
      "Write down the thing you’re avoiding — then shrink it into a 2-minute start.",
      "Journal prompt: “What would calm-me do next?” Answer, then do it.",
      "Make tea/water. Sip slowly for 2 minutes. Then start one focused task.",
      "Write a short “Today I’m allowed to…” statement. Keep it simple.",
      "List 3 inputs you’ll reduce today (noise, scrolling, people, etc.). Pick one.",
      "Reflect: what’s the kindest plan for today? Write it in 1 sentence.",
      "Jot 5 words you want the day to feel like. Choose one action that matches.",
      "Write: “I can handle ____ by doing ____.” Then do the blank.",
      "Do 3 rounds of box breathing (4–4–4–4). Then begin.",
      "Write a micro-plan: Now / Next / Later. Start with Now.",
      "List your top 2 priorities. Cross out everything else for the next 30 minutes.",
      "Journal prompt: “What’s one thing I can release today?” Answer in 3 lines.",
      "Write the smallest version of success for the next hour — then do it."
    ]
  },

  boost: {
    messages: compileMessages([
      "This reset is momentum — not perfect, just moving. You picked: {names}.",
      "We’re creating motivation by starting first. You picked: {names}.",
      "Your energy needs a jumpstart, not a lecture. You picked: {names}.",
      "Start small, build speed. You picked: {names}.",
      "We’re turning “ugh” into “done.” You picked: {names}.",
      "You don’t need the whole plan — you need the first rep. You picked: {names}.",
      "Minimal thinking. Maximum starting. You picked: {names}.",
      "We’re sparking action and letting the mood catch up. You picked: {names}.",
      "Today’s plan: move first, analyze later. You picked: {names}.",
      "If you’re waiting to feel ready… that’s cute. Start anyway. You picked: {names}.",
      "We’re building energy through motion. You picked: {names}.",
      "Let’s light the fuse and keep it simple. You picked: {names}.",
      "Small starts are undefeated. You picked: {names}.",
      "We’re not negotiating with procrastination today. You picked: {names}.",
      "Your job is to begin. The rest will show up. You picked: {names}.",
      "Today is about starting ugly and finishing proud. You picked: {names}.",
      "We’re making progress loud enough to hear. You picked: {names}.",
      "Start the engine — you can steer once you’re moving. You picked: {names}.",
      "We’re building momentum one small win at a time. You picked: {names}.",
      "Let’s convert energy into action. You picked: {names}.",
      "You’re closer than your brain is acting. You picked: {names}.",
      "We’re doing the first step — not the whole staircase. You picked: {names}.",
      "Today: effort over mood. You picked: {names}.",
      "Your future self asked me to say: start now. You picked: {names}.",
      "We’re making the day move with you. You picked: {names}.",
      "One small sprint beats an hour of thinking. You picked: {names}.",
      "Start before you feel inspired. You picked: {names}.",
      "Your reset is “do something tiny, immediately.” You picked: {names}.",
      "We’re choosing movement over perfection. You picked: {names}.",
      "Okay. Let’s start the thing. You picked: {names}."
    ]),
    quotes: [
      "Action creates clarity.",
      "Start tiny. Start now.",
      "Motion beats emotion.",
      "One step changes the day.",
      "Done is a direction.",
      "Energy follows movement.",
      "Start ugly. Improve later.",
      "Progress loves momentum.",
      "You can’t steer a parked car.",
      "Begin where you are.",
      "Small wins stack.",
      "Do the first rep.",
      "Five minutes counts.",
      "Move first. Feel later.",
      "Start before you’re ready.",
      "Consistency is confidence.",
      "Make it real by doing it.",
      "Start messy. Keep going.",
      "One task. One timer.",
      "Less thinking, more starting.",
      "The start is the hard part.",
      "Momentum is built, not found.",
      "Begin imperfectly.",
      "Do it scared. Do it tired.",
      "Start with the next step.",
      "Done beats perfect.",
      "The day changes when you move.",
      "Start small, finish strong.",
      "Do the thing, then celebrate.",
      "Start now — adjust later."
    ],
    actions: [
      "Do a 10-minute sprint on your most important task. No fixing — just start.",
      "Brain dump: write 10 things in your head. Circle ONE. Do 5 minutes on it.",
      "Write a 3-line plan: Must / Should / Nice — then hit Must for 10 minutes.",
      "Set a 12-minute timer and make the ugliest first draft possible. That’s the point.",
      "List your next 3 micro-steps for the task. Do step 1 immediately.",
      "Jot the one thing you’ll feel proud of tonight. Do 5 minutes toward it now.",
      "Pick a task. Set a timer for 8 minutes. Start. Stop when it ends. Repeat once.",
      "Write: “If I only start ONE thing today, it’s ____.” Start it for 7 minutes.",
      "Do one “quick win” that takes under 3 minutes. Then start the real task.",
      "Set a timer for 15 minutes and clean up the first 10% of the task (setup counts).",
      "Journal prompt: “What’s the smallest version of success today?” Write it. Then do it.",
      "Write a list of obstacles. Cross out the ones that are just feelings. Start anyway.",
      "Make a playlist or one song. Start the task before the song ends.",
      "Do 20 seconds of movement (stretch, march, shake it out). Then begin.",
      "Write the first sentence of the thing. Stop. Then write the second sentence.",
      "Open the file/tab. Name it. Add one bullet point. Congrats — you started.",
      "Write your “start line”: ‘I will work on ____ for 10 minutes.’ Then do it.",
      "Pick the easiest part of the task and do that first. Momentum loves easy.",
      "Write down what ‘done’ looks like in one sentence. Work toward that, not perfection.",
      "Set a 5-minute timer and gather everything you need. Then do 10 minutes of work.",
      "Jot: ‘What’s my next action?’ Answer in 3 words. Do it.",
      "Do a 10-minute sprint, then reward yourself with a 2-minute break (timer stays on).",
      "Write a checklist of 5 tiny steps. Do steps 1–2 right now.",
      "Pick a task. Start a ‘bad version.’ Improve later. Your only job is movement.",
      "Journal prompt: “What am I avoiding, and why?” Write 4 lines, then start 5 minutes.",
      "Do the first annoying step (login, open email, gather files). Then you’re in.",
      "Write the top 2 priorities. Start #1 for 12 minutes. Ignore everything else.",
      "Set a ‘no scroll’ timer for 20 minutes and work until it ends.",
      "Write: ‘I start now.’ Then take one physical action immediately.",
      "Do 10 minutes of work. If you still hate it after, you can stop. (You won’t.)"
    ]
  },

  steady: {
    messages: compileMessages([
      "This reset is consistency — calm focus, steady pace. You picked: {names}.",
      "We’re building rhythm today, not drama. You picked: {names}.",
      "Balance wins: stable energy + simple structure. You picked: {names}.",
      "Progress you can repeat is the goal. You picked: {names}.",
      "Steady energy beats random bursts. You picked: {names}.",
      "We’re going for reliable momentum. You picked: {names}.",
      "Stable focus today = less stress later. You picked: {names}.",
      "You don’t need intensity — you need consistency. You picked: {names}.",
      "We’re building a day you can actually finish. You picked: {names}.",
      "Today is simple structure and follow-through. You picked: {names}.",
      "No chaos schedule. Just a plan you can keep. You picked: {names}.",
      "We’re choosing a pace that lasts. You picked: {names}.",
      "Reliable progress beats perfect progress. You picked: {names}.",
      "We’re keeping your energy even and your mind clear. You picked: {names}.",
      "Steady focus is your flex today. You picked: {names}.",
      "We’re aiming for repeatable wins. You picked: {names}.",
      "Doable steps. Calm pace. You picked: {names}.",
      "We’re building momentum that doesn’t crash. You picked: {names}.",
      "Today’s goal is a clean loop: plan → act → reset. You picked: {names}.",
      "We’re stabilizing your day so it stops feeling random. You picked: {names}.",
      "Consistency is the shortcut. You picked: {names}.",
      "We’re choosing structure over stress. You picked: {names}.",
      "Keep it boring. Boring works. You picked: {names}.",
      "Your reset is steady progress with fewer surprises. You picked: {names}.",
      "We’re keeping your brain from juggling too much. You picked: {names}.",
      "Today is a pace you can trust. You picked: {names}.",
      "We’re doing the next step, then the next step. You picked: {names}.",
      "One routine, one outcome: calmer progress. You picked: {names}.",
      "Steady is how you win the week. You picked: {names}.",
      "No rush — just progress. You picked: {names}."
    ]),
    quotes: [
      "Consistency beats intensity.",
      "Small steps, daily.",
      "Structure is self-care.",
      "Boring works.",
      "Repeatable is powerful.",
      "Rhythm creates results.",
      "Keep your promises to yourself.",
      "A plan you follow beats a plan you love.",
      "Steady is a superpower.",
      "Build the habit, then the goal.",
      "One thing at a time.",
      "Simple is sustainable.",
      "Focus loves a plan.",
      "Routine protects your energy.",
      "Progress is made in patterns.",
      "Do it again tomorrow.",
      "Stability is strength.",
      "Consistency is confidence in action.",
      "You don’t need more time — you need a system.",
      "Less decision fatigue.",
      "A calm routine wins.",
      "Start. Pause. Repeat.",
      "Keep it doable.",
      "Practice the basics.",
      "Reliable beats random.",
      "Structure gives freedom.",
      "Your pace is the plan.",
      "Slow progress is still progress.",
      "Make it easy to win.",
      "Steady is the new strong."
    ],
    actions: [
      "Make a list of 3 tasks. Do 10 minutes on each — rotate, don’t spiral.",
      "Write your “start task” and your “stop time.” Begin now and stop on time.",
      "Set a 20-minute focus sprint, then take a 3-minute reset break. Repeat once.",
      "Reflect: what keeps knocking you off track? Write one fix you’ll test today.",
      "Jot the top 3 things that matter today. Do the first one for 10 minutes.",
      "Note one distraction you’ll avoid for the next 30 minutes. Then start.",
      "List what “good enough” looks like (next task) — then do that version.",
      "Write a simple schedule: Now / Midday / Later. Then do Now.",
      "Set a timer for 25 minutes. Work. When it ends, stop and reset.",
      "Write a checklist of 5 steps. Do steps 1–2 now, not later.",
      "Journal prompt: “What routine would make today easier?” Write 3 lines, then do one part.",
      "Pick one task. Break it into 3 chunks. Do chunk #1.",
      "Write your top priority and one reason it matters. Start for 12 minutes.",
      "Plan a 2-minute setup: open tools, gather materials, clear space. Then begin.",
      "Write a ‘minimum standard’ for today. Meet it. Anything extra is a bonus.",
      "Do a 10-minute tidy of your workspace. Then do 10 minutes of focused work.",
      "List 3 small wins you can finish today. Start with the shortest.",
      "Write down: “If I stay consistent, I will ____.” Then do 10 minutes of work.",
      "Create one boundary for your next work block. Keep it until the timer ends.",
      "Reflect: what made yesterday harder? Write one adjustment for today.",
      "Make a ‘later list’ so your brain stops trying to remember everything.",
      "Journal prompt: “What’s one stable thing I can control today?” Write it. Do it.",
      "Pick one task and do the first 5% (setup counts).",
      "Write: ‘Next step: ____.’ Do it. Then write the next next step.",
      "Do 15 minutes on one task. Stop even if you want to keep going (build trust).",
      "List 3 tasks and assign each a time limit. Start the first now.",
      "Choose a single focus window (20–30 min). Commit. Then rest 3 minutes.",
      "Write your priority list in order. Do #1 for 10 minutes.",
      "Reflect for 2 minutes: what’s the most efficient next move? Do that.",
      "Journal prompt: “How do I want today to feel?” Write 5 words, then act on one."
    ]
  },

  feelgood: {
    messages: compileMessages([
      "This reset lifts your mood while still moving forward. You picked: {names}.",
      "We’re aiming for better, not perfect. You picked: {names}.",
      "Support + progress, not pressure. You picked: {names}.",
      "Let’s brighten the vibe without forcing fake positivity. You picked: {names}.",
      "Treat yourself like someone worth caring for today. You picked: {names}.",
      "You’re allowed to feel it AND still handle it. You picked: {names}.",
      "Today is gentle momentum — soft but real. You picked: {names}.",
      "We’re building a day that feels lighter. You picked: {names}.",
      "Your reset is kindness with a plan. You picked: {names}.",
      "We’re choosing care that actually helps. You picked: {names}.",
      "A better mood is built, not wished for. You picked: {names}.",
      "We’re boosting your internal soundtrack today. You picked: {names}.",
      "Today: supportive structure and a little joy. You picked: {names}.",
      "We’re making your day feel more you. You picked: {names}.",
      "We’re not forcing happy — we’re choosing helpful. You picked: {names}.",
      "You don’t have to carry the day alone. You picked: {names}.",
      "Let’s add softness without losing progress. You picked: {names}.",
      "This reset is about uplift with boundaries. You picked: {names}.",
      "We’re building confidence through care. You picked: {names}.",
      "Tiny joy + tiny action = better day. You picked: {names}.",
      "We’re choosing compassion and movement. You picked: {names}.",
      "Let’s make today kinder to you. You picked: {names}.",
      "We’re lifting the vibe and lowering the pressure. You picked: {names}.",
      "You deserve a day that feels supportive. You picked: {names}.",
      "We’re doing real progress, with real kindness. You picked: {names}.",
      "Let’s move forward with a softer grip. You picked: {names}.",
      "We’re turning self-talk into support talk. You picked: {names}.",
      "Today is care + clarity. You picked: {names}.",
      "You’re building a better day on purpose. You picked: {names}.",
      "This reset is your reminder: you matter. You picked: {names}."
    ]),
    quotes: [
      "Be kind to your future self.",
      "Joy is allowed.",
      "You’re doing better than you think.",
      "Care counts.",
      "Gentle can be powerful.",
      "Let “better” be enough.",
      "Soft days still build strong lives.",
      "You deserve patience from you.",
      "Kindness is a strategy.",
      "You can be gentle and effective.",
      "Support yourself like you mean it.",
      "Progress doesn’t require punishment.",
      "Take care. Then take action.",
      "Choose what helps.",
      "Your feelings are real — and you’re capable.",
      "Celebrate tiny wins.",
      "You are not behind — you are becoming.",
      "Make room for joy.",
      "Speak to yourself with respect.",
      "Ease is productive sometimes.",
      "You can reset without guilt.",
      "Care first, then create.",
      "You don’t have to be hard to be strong.",
      "Let today be lighter.",
      "Protect your peace and your goals.",
      "You’re allowed to start again.",
      "Do one kind thing for you.",
      "You’re worthy of a softer approach.",
      "Better is still success.",
      "Be your own safe place."
    ],
    actions: [
      "Journal prompt: “What do I need today?” Answer in 5 honest lines.",
      "Write down 3 wins (tiny counts), then do one small thing that improves your space.",
      "List 5 things you can control today. Pick one and take one step.",
      "Reflect for 3 minutes: what would make today feel more gentle? Write the first idea.",
      "Note one thing you’re proud of this week, then do a 10-minute “future you” task.",
      "Write a kind note to yourself like you would to a friend. Then start one real task.",
      "Jot one boundary you’ll keep today, then do one small “care task” for yourself.",
      "Write: “Today I’m allowed to ____.” Then choose one action that supports it.",
      "Make a short list: 2 responsibilities + 1 joy. Do one responsibility now.",
      "Journal prompt: “What would make me feel supported today?” Answer, then do one item.",
      "Take 5 minutes to reset your space (desk, bag, counter). Then start your next task.",
      "Write a gratitude list of 3 things — then do 10 minutes of a meaningful task.",
      "Text or tell someone one positive thing (optional), then do 8 minutes of work.",
      "Reflect: what’s one thing you can simplify today? Write it and simplify it.",
      "Write a “good enough” goal for the next hour. Hit it.",
      "Choose one thing you’re avoiding and do the easiest 2-minute start.",
      "Journal prompt: “What’s one thing I can forgive myself for today?” Write it.",
      "Do a 3-minute stretch or breathing reset, then start a task for 10 minutes.",
      "Write the nicest truth: “I’m doing my best, and I can do ____ next.” Do next.",
      "List 3 things that lift your mood. Pick one and do it for 3 minutes.",
      "Write: “If today had a theme, it’s ____.” Then do one action that matches.",
      "Reflect for 2 minutes: what’s one thing I can do to feel proud tonight? Start it.",
      "Make a mini plan: care task + work task. Start with the work task for 10 minutes.",
      "Write down your next step and a small reward after 15 minutes. Start now.",
      "Journal prompt: “What would I tell a friend in my situation?” Write it. Apply it.",
      "Do one small act of care (water, snack, tidy), then do 12 minutes of focused work.",
      "Write 5 words you want today to feel like. Choose one action that supports.",
      "List 3 things you’ve handled before. Remind yourself you can handle today too.",
      "Write: “I can be gentle and still get things done.” Then do 10 minutes of work.",
      "Journal prompt: “What’s one thing I want to feel by bedtime?” Write it. Take one step."
    ]
  }
};

// ---------- DOM ----------
const moodGrid = document.getElementById("moodGrid");
const selectedList = document.getElementById("selectedList");
const limitMsg = document.getElementById("limitMsg");

const goBtn = document.getElementById("goBtn");
const changeMoodsBtn = document.getElementById("changeMoodsBtn");
const resetBtn = document.getElementById("resetBtn");
const afterGoRow = document.getElementById("afterGoRow");
const saveBtn = document.getElementById("saveBtn");

const resultsWrap = document.getElementById("resultsWrap");
const modeLabelEl = document.getElementById("modeLabel");
const modeMessageEl = document.getElementById("modeMessage");
const modeQuoteEl = document.getElementById("modeQuote");
const modeActionEl = document.getElementById("modeAction");

const whyToggleBtn = document.getElementById("whyToggleBtn");
const whyWrap = document.getElementById("whyWrap");
const whyTextEl = document.getElementById("whyText");

const journalWrap = document.getElementById("journalWrap");
const journalInput = document.getElementById("journalInput");

const toastEl = document.getElementById("toast");

// Hint
const hintBar = document.getElementById("hintBar");
const hintCloseBtn = document.getElementById("hintCloseBtn");

// History
const historySection = document.getElementById("historySection");
const historyToggleBtn = document.getElementById("historyToggleBtn");
const historyChevron = document.getElementById("historyChevron");
const historyCountText = document.getElementById("historyCountText");
const historyPreview = document.getElementById("historyPreview");
const historyActions = document.getElementById("historyActions");
const historyBody = document.getElementById("historyBody");
const historyList = document.getElementById("historyList");

const toggleHistoryBtn = document.getElementById("toggleHistoryBtn");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const copyExportBtn = document.getElementById("copyExportBtn");
const downloadExportBtn = document.getElementById("downloadExportBtn");

// Export modal
const exportOverlay = document.getElementById("exportOverlay");
const exportCloseX = document.getElementById("exportCloseX");
const exportCancelBtn = document.getElementById("exportCancelBtn");
const exportPrimaryBtn = document.getElementById("exportPrimaryBtn");
const chooseWrap = document.getElementById("chooseWrap");
const chooseList = document.getElementById("chooseList");
const selectAllBtn = document.getElementById("selectAllBtn");
const selectNoneBtn = document.getElementById("selectNoneBtn");
const manualCopyWrap = document.getElementById("manualCopyWrap");
const manualCopyArea = document.getElementById("manualCopyArea");

// Limit modal
const limitOverlay = document.getElementById("limitOverlay");
const limitCloseX = document.getElementById("limitCloseX");
const limitExportBtn = document.getElementById("limitExportBtn");
const limitClearOldestBtn = document.getElementById("limitClearOldestBtn");
const limitCancelBtn = document.getElementById("limitCancelBtn");

// ---------- STATE ----------
let selected = [];
let moodsLocked = false;
let hasLockedOnce = false;
let intensityChanged = false;

let lastResult = null;

let historyShowAll = false;
let historyExpanded = false;

let exportMode = null;
let exportChosenIdx = new Set();

let journalDraft = "";
let pendingSaveIntent = false;

// ---------- UTIL ----------
function showToast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove("show"), 1900);
}

function nowDateLabel() {
  const d = new Date();
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function intensityLabel(val) {
  if (val === 1) return "Soft";
  if (val === 3) return "Strong";
  return "Steady";
}

function isWritingPrompt(actionText) {
  const t = (actionText || "").toLowerCase();
  const triggers = ["write","jot","journal","reflect","list","note","brain dump","dump","prompt"];
  return triggers.some(k => t.includes(k));
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cryptoId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function flashButton(btn, text, ms=1600) {
  if (!btn) return;
  const original = btn.textContent;
  btn.textContent = text;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, ms);
}

function formatPreviewTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;

  const date = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${date}, ${time}`;
}

// ---------- STORAGE ----------
function getSaved() {
  try {
    const raw = safeStorage.get(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setSaved(arr) {
  safeStorage.set(STORAGE_KEY, JSON.stringify(arr));
}

function shouldShowHint() {
  try {
    return !safeStorage.get(SEEN_HINT_KEY);
  } catch {
    return false;
  }
}

function markHintSeen() {
  safeStorage.set(SEEN_HINT_KEY, "1");
}

// ---------- HARD NO-REPEAT DECKS (WITH COMMIT) ----------
function deckKey(mode, type) {
  return `${DECK_PREFIX}${DECK_VERSION}.${mode}.${type}`;
}

function secureShuffle(array) {
  const a = array.slice();
  const useCrypto = !!(window.crypto && crypto.getRandomValues);
  for (let i = a.length - 1; i > 0; i--) {
    let j;
    if (useCrypto) {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      j = buf[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function readDeck(mode, type) {
  try {
    const raw = safeStorage.get(deckKey(mode, type));
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || !Array.isArray(parsed.deck) || typeof parsed.pos !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDeck(mode, type, state) {
  safeStorage.set(deckKey(mode, type), JSON.stringify(state));
}

function newDeck(length) {
  return { deck: secureShuffle([...Array(length)].map((_, i) => i)), pos: 0, len: length };
}

function ensureDeck(mode, type, length) {
  if (length <= 1) return newDeck(Math.max(length, 1));

  let state = readDeck(mode, type);
  if (!state || !Array.isArray(state.deck) || state.deck.length !== length || typeof state.pos !== "number") {
    state = newDeck(length);
    writeDeck(mode, type, state);
    return state;
  }

  if (state.pos >= state.deck.length) {
    state = newDeck(length);
    writeDeck(mode, type, state);
  }

  return state;
}

function deckPeek(mode, type, length) {
  if (length <= 1) return { idx: 0, commit: () => {} };

  const state = ensureDeck(mode, type, length);
  const idx = state.deck[state.pos];

  const commit = () => {
    const fresh = ensureDeck(mode, type, length);
    if (fresh.pos >= fresh.deck.length) {
      const reset = newDeck(length);
      writeDeck(mode, type, reset);
      return;
    }
    fresh.pos = Math.min(fresh.pos + 1, fresh.deck.length);
    writeDeck(mode, type, fresh);
  };

  return { idx, commit };
}

function clearAllDecks() {
  const modes = ["calm","boost","steady","feelgood"];
  const types = ["message","quote","action"];
  modes.forEach(m => types.forEach(t => safeStorage.remove(deckKey(m, t))));
}

// ---------- UI RENDER ----------
function renderMoodButtons() {
  if (!moodGrid) return;

  moodGrid.innerHTML = "";

  MOODS.forEach((m) => {
    const btn = document.createElement("button");
    btn.className = "mood-btn";
    btn.type = "button";
    btn.textContent = m.name;

    if (selected.some(x => x.name === m.name)) btn.classList.add("selected");

    if (moodsLocked) {
      btn.classList.add("locked");
      btn.disabled = true;
    }

    btn.addEventListener("click", () => {
      if (moodsLocked) return;
      toggleMood(m);
    });

    moodGrid.appendChild(btn);
  });
}

function toggleMood(mood) {
  if (limitMsg) limitMsg.textContent = "";

  const idx = selected.findIndex(x => x.name === mood.name);
  if (idx >= 0) {
    selected.splice(idx, 1);
  } else {
    if (selected.length >= 3) {
      if (limitMsg) limitMsg.textContent = "Pick up to 3. Unselect one to choose another.";
      showToast("Pick up to 3. Unselect one to choose another.");
      return;
    }
    selected.push({
      name: mood.name,
      set: mood.set,
      role: mood.role,
      intensity: 2
    });
  }

  renderMoodButtons();
  renderSelectedList();
}

function renderSelectedList() {
  if (!selectedList) return;

  if (selected.length === 0) {
    selectedList.classList.add("hidden");
    selectedList.innerHTML = "";
    return;
  }

  selectedList.classList.remove("hidden");
  selectedList.innerHTML = "";

  selected.forEach((m) => {
    const row = document.createElement("div");
    row.className = "selected-item";

    const name = document.createElement("div");
    name.className = "selected-name";
    name.textContent = m.name;

    const select = document.createElement("select");
    select.className = "intensity-select";
    select.setAttribute("aria-label", `Intensity for ${m.name}`);

    INTENSITY_OPTIONS.forEach(opt => {
      const o = document.createElement("option");
      o.value = String(opt.value);
      o.textContent = opt.label;
      select.appendChild(o);
    });

    select.value = String(m.intensity);

    select.addEventListener("change", () => {
      m.intensity = parseInt(select.value, 10);
      if (hasLockedOnce) {
        intensityChanged = true;
        showToast("Intensity updated — tap Update.");
      }
    });

    row.appendChild(name);
    row.appendChild(select);
    selectedList.appendChild(row);
  });
}

// ---------- SCORING (LOCKED — DO NOT CHANGE) ----------
function computeWinner() {
  const totals = { calm: 0, boost: 0, steady: 0, feelgood: 0 };

  selected.forEach(m => {
    totals[m.set] += m.intensity;

    // Modifier: if REGULATE -> calm +1
    if (m.role === "REGULATE") totals.calm += 1;
  });

  const roles = selected.map(m => m.role);
  const has = (r) => roles.includes(r);

  // Modifiers
  if (has("REGULATE") && has("ENERGIZE")) totals.boost += 2;
  if (has("UPLIFT") && has("REGULATE")) totals.steady += 2;
  if (has("UPLIFT") && has("STABILIZE")) totals.feelgood += 1;

  // Tie-break: calm > boost > steady > feelgood
  const order = ["calm","boost","steady","feelgood"];
  let best = order[0];

  order.forEach(k => {
    if (totals[k] > totals[best]) best = k;
    if (totals[k] === totals[best]) {
      if (order.indexOf(k) < order.indexOf(best)) best = k;
    }
  });

  return { winner: best };
}

function buildWhyText(winner, names) {
  const base = {
    calm: `You picked moods that benefit from lowering the pressure first (${names}). The goal is regulation so you can move with control.`,
    boost: `You picked moods that respond best to momentum (${names}). The goal is motion first — then motivation catches up.`,
    steady: `You picked moods that do best with structure and consistency (${names}). The goal is reliable progress you can repeat.`,
    feelgood: `You picked moods that benefit from support and uplift (${names}). The goal is to brighten the vibe without forcing it.`
  };

  if (winner === "boost") {
    return `${base.boost} Yes, we’re doing the “start first, complain later” strategy.`;
  }
  return base[winner] || "";
}

// ---------- RESULTS ----------
function computeResultsPeek() {
  const names = selected.map(m => m.name).join(", ");
  const { winner } = computeWinner();
  const pool = POOLS[winner];

  const mPick = deckPeek(winner, "message", pool.messages.length);
  const qPick = deckPeek(winner, "quote", pool.quotes.length);
  const aPick = deckPeek(winner, "action", pool.actions.length);

  return {
    winner,
    modeLabel: SET_LABELS[winner],
    message: pool.messages[mPick.idx](names),
    quote: pool.quotes[qPick.idx],
    action: pool.actions[aPick.idx],
    whyText: buildWhyText(winner, names),
    _commits: [mPick.commit, qPick.commit, aPick.commit]
  };
}

function commitResults(res) {
  if (!res || !Array.isArray(res._commits)) return;
  res._commits.forEach(fn => {
    try { fn(); } catch {}
  });
}

function snapshotForCompare(res) {
  return JSON.stringify({
    winner: res.winner,
    modeLabel: res.modeLabel,
    message: res.message,
    quote: res.quote,
    action: res.action,
    whyText: res.whyText
  });
}

function applyResults(res, keepWhyOpen=false) {
  if (!resultsWrap) return;
  resultsWrap.classList.remove("hidden");

  modeLabelEl.textContent = res.modeLabel;
  modeMessageEl.textContent = res.message;
  modeQuoteEl.textContent = res.quote;
  modeActionEl.textContent = res.action;

  whyToggleBtn.classList.remove("hidden");
  whyTextEl.textContent = res.whyText;

  if (!keepWhyOpen) {
    whyWrap.classList.add("hidden");
    whyToggleBtn.textContent = "Why this?";
  }

  const showJournal = isWritingPrompt(res.action);
  if (showJournal) {
    journalWrap.classList.remove("hidden");
    requestAnimationFrame(() => journalWrap.classList.add("show"));
    journalInput.value = journalDraft || "";
  } else {
    journalWrap.classList.add("hidden");
    journalWrap.classList.remove("show");
    journalDraft = "";
    journalInput.value = "";
  }
}

function clearResultsOnly() {
  if (resultsWrap) resultsWrap.classList.add("hidden");

  modeLabelEl.textContent = "—";
  modeMessageEl.textContent = "—";
  modeQuoteEl.textContent = "—";
  modeActionEl.textContent = "—";

  whyToggleBtn.classList.add("hidden");
  whyWrap.classList.add("hidden");
  whyToggleBtn.textContent = "Why this?";
  whyTextEl.textContent = "—";

  journalWrap.classList.add("hidden");
  journalWrap.classList.remove("show");
}

// ---------- WHY TOGGLE ----------
function toggleWhy() {
  const isHidden = whyWrap.classList.contains("hidden");
  if (isHidden) {
    whyWrap.classList.remove("hidden");
    whyToggleBtn.textContent = "Hide why";
  } else {
    whyWrap.classList.add("hidden");
    whyToggleBtn.textContent = "Why this?";
  }
}

// ---------- CHANGE MOODS ----------
function changeMoods() {
  if (!hasLockedOnce) return;

  const ok = confirm("You can adjust your moods — your notes will stay. Continue?");
  if (!ok) return;

  clearResultsOnly();
  moodsLocked = false;
  hasLockedOnce = false;
  intensityChanged = false;
  lastResult = null;

  goBtn.textContent = "Lock In My Reset";
  changeMoodsBtn.classList.add("hidden");
  afterGoRow.classList.add("hidden");

  renderMoodButtons();
  renderSelectedList();
  showToast("Moods unlocked. Update your selection, then Lock In.");
}

// ---------- RESET ----------
function resetAll() {
  const ok = confirm("This clears everything so you can start fresh. Continue?");
  if (!ok) return;

  selected = [];
  moodsLocked = false;
  hasLockedOnce = false;
  intensityChanged = false;
  lastResult = null;

  if (limitMsg) limitMsg.textContent = "";
  clearResultsOnly();

  journalDraft = "";
  journalInput.value = "";

  afterGoRow.classList.add("hidden");
  goBtn.textContent = "Lock In My Reset";
  changeMoodsBtn.classList.add("hidden");

  renderMoodButtons();
  renderSelectedList();

  showToast("Reset.");
}

// ---------- HISTORY UI ----------
function updateHistoryPreviewUI() {
  const saved = getSaved();

  if (historyExpanded || saved.length === 0) {
    historyPreview.classList.add("hidden");
    historyPreview.textContent = "";
    return;
  }

  const latest = saved[0];
  const when = formatPreviewTime(latest.timestamp || Date.now());
  historyPreview.textContent = `Most recent: ${latest.modeLabel} — ${when}`;
  historyPreview.classList.remove("hidden");
}

function setHistoryExpanded(next) {
  historyExpanded = next;

  if (historyExpanded) {
    historyBody.classList.remove("hidden");
    historyActions.classList.remove("hidden");
    historyToggleBtn.setAttribute("aria-expanded", "true");
    historyChevron.textContent = "▴";
  } else {
    historyBody.classList.add("hidden");
    historyActions.classList.add("hidden");
    historyToggleBtn.setAttribute("aria-expanded", "false");
    historyChevron.textContent = "▾";
  }

  updateHistoryPreviewUI();
}

function updateHistoryCountUI() {
  const saved = getSaved();
  historyCountText.textContent = `(${saved.length}/${MAX_SAVES})`;
  updateHistoryPreviewUI();
}

function renderHistory() {
  const saved = getSaved();

  if (saved.length === 0) {
    historySection.classList.add("hidden");
    historyList.innerHTML = "";
    updateHistoryCountUI();
    return;
  }

  historySection.classList.remove("hidden");
  updateHistoryCountUI();

  const visible = historyShowAll ? saved : saved.slice(0, 7);

  historyList.innerHTML = "";
  visible.forEach((entry, idx) => {
    const card = document.createElement("div");
    card.className = "history-card";

    const top = document.createElement("div");
    top.className = "history-top";

    const date = document.createElement("div");
    date.className = "history-date";
    date.textContent = entry.dateLabel;

    const chip = document.createElement("div");
    chip.className = "mode-chip";
    chip.textContent = entry.modeLabel;

    top.appendChild(date);
    top.appendChild(chip);

    const num = document.createElement("div");
    num.className = "entry-num";
    num.textContent = `Entry #${idx + 1}`;

    const moodsLine = document.createElement("div");
    moodsLine.className = "history-moods";
    moodsLine.textContent = entry.moods.map(m => `${m.name} (${intensityLabel(m.intensity)})`).join(", ");

    const action = document.createElement("div");
    action.className = "history-action";
    action.textContent = entry.action;

    card.appendChild(top);
    card.appendChild(num);
    card.appendChild(moodsLine);
    card.appendChild(action);

    if ((entry.journal || "").trim()) {
      const j = document.createElement("div");
      j.className = "history-journal";
      j.textContent = entry.journal;
      card.appendChild(j);
    }

    const actions = document.createElement("div");
    actions.className = "history-card-actions";

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn tiny danger";
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";

    removeBtn.addEventListener("click", () => {
      const ok = confirm("Remove this saved entry?");
      if (!ok) return;
      const latest = getSaved();
      const next = latest.filter(x => x.id !== entry.id);
      setSaved(next);
      renderHistory();
      showToast("Removed.");
    });

    actions.appendChild(removeBtn);
    card.appendChild(actions);

    historyList.appendChild(card);
  });

  toggleHistoryBtn.textContent = historyShowAll ? "Show last 7" : "Show all (30)";
}

// ---------- SAVE ----------
function buildEntryFromState() {
  return {
    id: cryptoId(),
    timestamp: Date.now(),
    dateLabel: nowDateLabel(),
    moods: selected.map(m => ({
      name: m.name,
      set: m.set,
      role: m.role,
      intensity: m.intensity
    })),
    winner: lastResult.winner,
    modeLabel: lastResult.modeLabel,
    message: lastResult.message,
    quote: lastResult.quote,
    action: lastResult.action,
    whyText: lastResult.whyText,
    journal: (journalDraft || "").trim()
  };
}

function performSave({ clearOldest=false } = {}) {
  const saved = getSaved();

  if (saved.length >= MAX_SAVES && !clearOldest) {
    pendingSaveIntent = true;
    openLimitModal();
    return;
  }

  const entry = buildEntryFromState();
  let next = saved.slice();

  if (next.length >= MAX_SAVES && clearOldest) next.pop();
  next.unshift(entry);
  if (next.length > MAX_SAVES) next = next.slice(0, MAX_SAVES);

  setSaved(next);
  pendingSaveIntent = false;

  renderHistory();
  historySection.classList.remove("hidden");
  setHistoryExpanded(true);

  showToast("Saved ✓");
}

function onSaveClick() {
  if (!hasLockedOnce || !lastResult) {
    showToast("Lock your reset first.");
    return;
  }

  const saved = getSaved();
  if (saved.length >= MAX_SAVES) {
    pendingSaveIntent = true;
    openLimitModal();
    return;
  }

  performSave();
}

function clearSavedAll() {
  const ok = confirm("Clear all saved entries?");
  if (!ok) return;

  setSaved([]);
  clearAllDecks();

  renderHistory();
  setHistoryExpanded(false);

  showToast("Cleared.");
}

// ---------- EXPORT ----------
function openExportModal(mode) {
  const saved = getSaved();
  if (saved.length === 0) {
    showToast("Save something first, then export.");
    return;
  }

  exportMode = mode;
  exportChosenIdx = new Set();

  manualCopyWrap.classList.add("hidden");
  manualCopyArea.value = "";

  exportOverlay.classList.remove("hidden");
  exportOverlay.setAttribute("aria-hidden", "false");

  const last7 = document.querySelector('input[name="exportScope"][value="last7"]');
  if (last7) last7.checked = true;

  chooseWrap.classList.add("hidden");
  buildChooseList();
}

function forceCloseExportOverlay() {
  if (!exportOverlay) return;
  exportOverlay.classList.add("hidden");
  exportOverlay.setAttribute("aria-hidden", "true");
  exportMode = null;
  exportChosenIdx = new Set();
  if (chooseWrap) chooseWrap.classList.add("hidden");
  if (manualCopyWrap) manualCopyWrap.classList.add("hidden");
  if (manualCopyArea) manualCopyArea.value = "";
}

function closeExportModal() {
  forceCloseExportOverlay();
}

function onScopeChange() {
  const val = document.querySelector('input[name="exportScope"]:checked')?.value || "last7";
  if (val === "choose") {
    chooseWrap.classList.remove("hidden");
    buildChooseList();
  } else {
    chooseWrap.classList.add("hidden");
  }
}

function buildChooseList() {
  const saved = getSaved();
  chooseList.innerHTML = "";
  exportChosenIdx = new Set();

  saved.forEach((entry, idx) => {
    const row = document.createElement("label");
    row.className = "choose-row";

    const cb = document.createElement("input");
    cb.type = "checkbox";

    const meta = document.createElement("div");
    meta.className = "choose-meta";
    meta.innerHTML =
      `<div><strong>Entry #${idx + 1}</strong> — ${escapeHtml(entry.modeLabel)} — ${escapeHtml(entry.dateLabel)}</div>
       <div>${escapeHtml(entry.moods.map(m => `${m.name} (${intensityLabel(m.intensity)})`).join(", "))}</div>`;

    cb.addEventListener("change", () => {
      if (cb.checked) exportChosenIdx.add(idx);
      else exportChosenIdx.delete(idx);
    });

    row.appendChild(cb);
    row.appendChild(meta);
    chooseList.appendChild(row);
  });
}

function getExportEntries() {
  const saved = getSaved();
  const scope = document.querySelector('input[name="exportScope"]:checked')?.value || "last7";

  if (scope === "all") return saved;
  if (scope === "choose") {
    const picks = Array.from(exportChosenIdx).sort((a,b)=>a-b).map(i => saved[i]).filter(Boolean);
    return picks.length ? picks : [];
  }
  return saved.slice(0, 7);
}

function buildExportText(entries) {
  const lines = [];
  lines.push("The Morning Reset — Saved History");
  lines.push("");
  entries.forEach((e, i) => {
    lines.push(`Entry #${i + 1}`);
    lines.push(`Date: ${e.dateLabel}`);
    lines.push(`Mode: ${e.modeLabel}`);
    lines.push(`Moods: ${e.moods.map(m => `${m.name} (${intensityLabel(m.intensity)})`).join(", ")}`);
    lines.push(`Message: ${e.message}`);
    lines.push(`Quote: ${e.quote}`);
    lines.push(`Action: ${e.action}`);
    lines.push(`Why: ${e.whyText}`);
    if ((e.journal || "").trim()) lines.push(`Journal: ${e.journal}`);
    lines.push("");
    lines.push("— — —");
    lines.push("");
  });
  return lines.join("\n");
}

async function doCopyExport() {
  const entries = getExportEntries();
  if (!entries.length) {
    showToast("Choose at least one entry.");
    return;
  }

  const text = buildExportText(entries);

  try {
    await navigator.clipboard.writeText(text);
    closeExportModal();
    flashButton(copyExportBtn, "Copied ✓", 1600);
  } catch {
    manualCopyWrap.classList.remove("hidden");
    manualCopyArea.value = text;
    manualCopyArea.focus();
    manualCopyArea.select();
  }
}

function doDownloadExport() {
  const entries = getExportEntries();
  if (!entries.length) {
    showToast("Choose at least one entry.");
    return;
  }

  const text = buildExportText(entries);

  const html = `
<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body>
<pre style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre-wrap;">
${escapeHtml(text)}
</pre>
</body>
</html>`.trim();

  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `morning-reset-${Date.now()}.doc`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);

  closeExportModal();
  flashButton(downloadExportBtn, "Downloaded ✓", 1600);
}

// ---------- 30 LIMIT MODAL ----------
function openLimitModal() {
  limitOverlay.classList.remove("hidden");
  limitOverlay.setAttribute("aria-hidden", "false");
}

function forceCloseLimitOverlay() {
  if (!limitOverlay) return;
  limitOverlay.classList.add("hidden");
  limitOverlay.setAttribute("aria-hidden", "true");
  pendingSaveIntent = false;
}

function closeLimitModal() {
  forceCloseLimitOverlay();
}

function onLimitExport() {
  closeLimitModal();
  openExportModal("download");
}

function onLimitClearOldestSave() {
  if (!pendingSaveIntent) return;
  closeLimitModal();
  performSave({ clearOldest: true });
}

// ---------- GO / UPDATE ----------
function lockOrUpdate() {
  if (selected.length === 0) {
    showToast("Pick 1–3 moods first.");
    return;
  }

  if (!hasLockedOnce) {
    const peek = computeResultsPeek();
    const snap = snapshotForCompare(peek);

    commitResults(peek);
    lastResult = { ...peek, _snap: snap };

    applyResults(peek, false);

    moodsLocked = true;
    hasLockedOnce = true;
    intensityChanged = false;

    goBtn.textContent = "Update My Reset";
    changeMoodsBtn.classList.remove("hidden");
    afterGoRow.classList.remove("hidden");

    renderMoodButtons();
    showToast("Locked ✓");
    return;
  }

  if (!intensityChanged) {
    showToast("No intensity changes yet.");
    return;
  }

  const peek = computeResultsPeek();
  const newSnap = snapshotForCompare(peek);

  if (newSnap === (lastResult?._snap || "")) {
    showToast("No change — same reset.");
    intensityChanged = false;
    return;
  }

  commitResults(peek);
  lastResult = { ...peek, _snap: newSnap };

  const keepWhyOpen = !whyWrap.classList.contains("hidden");
  applyResults(peek, keepWhyOpen);

  intensityChanged = false;
  showToast("Updated ✓");
}

// ---------- STABILITY: soft recovery ----------
function recoverSoft() {
  try {
    renderMoodButtons();
    renderSelectedList();
    renderHistory();
    updateHistoryPreviewUI();
  } catch {}
}

function recoverIfMoodGridBlank() {
  try {
    if (!moodGrid) return false;
    if (moodGrid.children.length === 0) {
      renderMoodButtons();
      return true;
    }
  } catch {}
  return false;
}

// ---------- MODAL TRAP DETECTION (toast + force-close) ----------
let _modalTrapToastCooldown = 0;

function toastOncePerWindow(msg) {
  const now = Date.now();
  if (now - _modalTrapToastCooldown < 2500) return;
  _modalTrapToastCooldown = now;
  showToast(msg);
}

function isVisibleOverlay(overlayEl) {
  return overlayEl && !overlayEl.classList.contains("hidden");
}

function fixModalTraps(trigger = "check") {
  // Export overlay visible but missing close controls -> force close
  if (isVisibleOverlay(exportOverlay)) {
    const missing = [];
    if (!exportCloseX) missing.push("X");
    if (!exportCancelBtn) missing.push("Cancel");
    // Primary is helpful but not required to exit; still report
    if (!exportPrimaryBtn) missing.push("Export");
    if (missing.length > 0) {
      toastOncePerWindow("Fixed a UI hiccup — closed the popup.");
      forceCloseExportOverlay();
      return true;
    }
  }

  // Limit overlay visible but missing close controls -> force close
  if (isVisibleOverlay(limitOverlay)) {
    const missing = [];
    if (!limitCloseX) missing.push("X");
    if (!limitCancelBtn) missing.push("Cancel");
    if (!limitExportBtn) missing.push("Export");
    if (!limitClearOldestBtn) missing.push("Clear oldest + Save");
    if (missing.length > 0) {
      toastOncePerWindow("Fixed a UI hiccup — closed the popup.");
      forceCloseLimitOverlay();
      return true;
    }
  }

  return false;
}

// ---------- QUIET SELF-CHECK (core + modals) ----------
let _selfCheckLogged = false;

function selfCheckAndRecover(trigger = "init") {
  const problems = [];

  // Core DOM checks
  if (!moodGrid) problems.push("moodGrid missing");
  if (!goBtn) problems.push("goBtn missing");
  if (!resetBtn) problems.push("resetBtn missing");
  if (!selectedList) problems.push("selectedList missing");
  if (!resultsWrap) problems.push("resultsWrap missing");
  if (!historySection) problems.push("historySection missing");

  // Render check
  if (moodGrid && moodGrid.children.length === 0) problems.push("moodGrid empty");

  // Modal DOM checks (presence only)
  if (!exportOverlay) problems.push("exportOverlay missing");
  if (!limitOverlay) problems.push("limitOverlay missing");

  // Trap check (if visible, must have exit paths)
  const trapFixed = fixModalTraps(trigger);

  if (problems.length > 0) {
    if (!_selfCheckLogged) {
      _selfCheckLogged = true;
      console.warn(`Morning Reset self-check (${trigger}): ${problems.join(" | ")} — attempting soft recovery.`);
    }
    recoverSoft();
    setTimeout(() => {
      try {
        if (moodGrid && moodGrid.children.length === 0) renderMoodButtons();
        // re-run trap check once more after recovery
        fixModalTraps("postRecover");
      } catch {}
    }, 60);
    return false;
  }

  // Even with no "problems", we might have fixed a trap
  return !trapFixed;
}

// ---------- EVENTS ----------
goBtn.addEventListener("click", lockOrUpdate);
changeMoodsBtn.addEventListener("click", changeMoods);
resetBtn.addEventListener("click", resetAll);

whyToggleBtn.addEventListener("click", toggleWhy);

journalInput.addEventListener("input", () => {
  journalDraft = journalInput.value;
});

hintCloseBtn.addEventListener("click", () => {
  hintBar.classList.add("hidden");
  markHintSeen();
});

saveBtn.addEventListener("click", () => {
  if (!hasLockedOnce || !lastResult) {
    showToast("Lock your reset first.");
    return;
  }
  const saved = getSaved();
  if (saved.length >= MAX_SAVES) {
    pendingSaveIntent = true;
    openLimitModal();
    return;
  }
  performSave();
});

// History controls
historyToggleBtn.addEventListener("click", () => setHistoryExpanded(!historyExpanded));
toggleHistoryBtn.addEventListener("click", () => { historyShowAll = !historyShowAll; renderHistory(); });

clearSavedBtn.addEventListener("click", clearSavedAll);

// Export open
copyExportBtn.addEventListener("click", () => openExportModal("copy"));
downloadExportBtn.addEventListener("click", () => openExportModal("download"));

// Export close
exportCloseX.addEventListener("click", closeExportModal);
exportCancelBtn.addEventListener("click", closeExportModal);
exportOverlay.addEventListener("click", (e) => { if (e.target === exportOverlay) closeExportModal(); });

document.querySelectorAll('input[name="exportScope"]').forEach(r => r.addEventListener("change", onScopeChange));

selectAllBtn.addEventListener("click", () => {
  exportChosenIdx = new Set();
  const saved = getSaved();
  for (let i = 0; i < saved.length; i++) exportChosenIdx.add(i);
  chooseList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
});

selectNoneBtn.addEventListener("click", () => {
  exportChosenIdx = new Set();
  chooseList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
});

exportPrimaryBtn.addEventListener("click", async () => {
  if (exportMode === "copy") await doCopyExport();
  else if (exportMode === "download") doDownloadExport();
});

// Limit modal close / actions
limitCloseX.addEventListener("click", closeLimitModal);
limitCancelBtn.addEventListener("click", closeLimitModal);
limitOverlay.addEventListener("click", (e) => { if (e.target === limitOverlay) closeLimitModal(); });
limitExportBtn.addEventListener("click", onLimitExport);
limitClearOldestBtn.addEventListener("click", onLimitClearOldestSave);

// Esc closes any open modal
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (exportOverlay && !exportOverlay.classList.contains("hidden")) closeExportModal();
    if (limitOverlay && !limitOverlay.classList.contains("hidden")) closeLimitModal();
  }
});

// Error safety hooks
window.addEventListener("error", () => {
  recoverIfMoodGridBlank();
  selfCheckAndRecover("window.error");
});

window.addEventListener("unhandledrejection", () => {
  recoverIfMoodGridBlank();
  selfCheckAndRecover("promise.reject");
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    recoverIfMoodGridBlank();
    selfCheckAndRecover("visibility");
  }
});

// ---------- INIT ----------
function init() {
  if (shouldShowHint()) hintBar.classList.remove("hidden");
  else hintBar.classList.add("hidden");

  // History collapsed on load ALWAYS
  setHistoryExpanded(false);

  renderMoodButtons();
  renderSelectedList();
  renderHistory();

  clearResultsOnly();

  afterGoRow.classList.add("hidden");
  changeMoodsBtn.classList.add("hidden");

  updateHistoryPreviewUI();

  // Soft self-check after paint
  setTimeout(() => selfCheckAndRecover("init"), 0);
  setTimeout(() => selfCheckAndRecover("postPaint"), 80);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}