import {
  Banknote,
  BarChart3,
  CalendarDays,
  FileSpreadsheet,
  Gamepad2,
  IndianRupee,
  Play,
  Receipt,
  Settings,
  Smartphone,
  Timer,
} from "lucide-react";

// Edit the wording here. The layout doesn't need to change.

export const PROBLEMS = [
  {
    title: "Paper, memory and guesswork",
    text: 'Start times in a notebook, or "who is on PC 7?" Every mistake costs you money or an argument.',
  },
  {
    title: "Arguments over bills",
    text: "Customer and staff disagree about how long someone played. Without a timer, nobody can prove it.",
  },
  {
    title: "No idea what you earned",
    text: "You only learn the day's total when you count the cash at closing, when it is too late to spot a problem.",
  },
];

export const STEPS = [
  {
    icon: Settings,
    title: "Set up in minutes",
    text: "Add your PCs and consoles (PC 01 to PC 20 in one go), then set your hourly price and weekend rate.",
  },
  {
    icon: Play,
    title: "Start and stop with a tap",
    text: "Tap Start when a customer sits down. Pause, resume or stop when they leave. The timer and amount update live.",
  },
  {
    icon: BarChart3,
    title: "See your earnings",
    text: "Check today's revenue, who still owes you, and your daily and monthly totals, from anywhere.",
  },
];

export const FEATURES = [
  {
    icon: Gamepad2,
    title: "Live device board",
    text: "See which PCs and consoles are free, running or paused, with a timer on each one.",
  },
  {
    icon: IndianRupee,
    title: "Automatic billing",
    text: "Bill per minute, or round up to 15 or 30 minutes. Weekend rates and a minimum charge are built in.",
  },
  {
    icon: Banknote,
    title: "Cash, UPI or pay later",
    text: "Record how each customer paid, and keep track of unpaid bills until you collect them.",
  },
  {
    icon: Receipt,
    title: "Honest records",
    text: "Every session becomes a bill. A cancelled bill stays on record with a reason, so nothing quietly disappears.",
  },
  {
    icon: CalendarDays,
    title: "Daily and monthly reports",
    text: "Revenue by day, by month, by device type and by payment method.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export to Excel",
    text: "Download your bills as a spreadsheet for your accountant or your own records.",
  },
  {
    icon: Timer,
    title: "Timers you can trust",
    text: "Time is kept on our server, not on the screen. Close the page or lose signal and nothing is lost.",
  },
  {
    icon: Smartphone,
    title: "Made for your phone",
    text: "Works in the browser on any phone, tablet or computer, in light or dark mode. Nothing to install.",
  },
];

export const NOT_YET = [
  "Locking and unlocking your gaming PCs automatically",
  "Online payments",
  "Table or slot bookings",
  "Separate staff logins",
];

export const FAQ = [
  {
    q: "What does it cost?",
    a: "The 15-day trial is free and needs no card. After that it is a simple monthly plan, and you will be told the price before you pay anything.",
  },
  {
    q: "Do I need special hardware?",
    a: "No. It runs in the browser on any phone, tablet or computer. There is nothing to install on your gaming PCs.",
  },
  {
    q: "Does it lock my gaming PCs?",
    a: "Not yet. Your staff start and stop each session with a tap, and the timer and bill are handled for you. If automatic PC locking matters to you, tell us. It helps us decide what to build next.",
  },
  {
    q: "What about PS5 and Xbox?",
    a: "They work the same way. Tap Start when the customer sits down and Stop when they leave.",
  },
  {
    q: "What if the internet goes down?",
    a: "You need an internet connection to start or stop a session. Timing is kept on our server, so a session already running is not lost if your phone disconnects or you close the page.",
  },
  {
    q: "Is my data private?",
    a: "Each café sees only its own data. We track usage numbers, such as how many sessions a café runs, not your customers' personal details. If your plan ends, nothing is deleted.",
  },
];
