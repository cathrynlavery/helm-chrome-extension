export interface Quote {
  text: string;
  author: string;
}

export const motivationalQuotes: Quote[] = [
  {
    text: "Mindful boundaries create limitless potential.",
    author: "Helm"
  },
  {
    text: "Focus on the moment, not the distractions.",
    author: "Unknown"
  },
  {
    text: "Your attention is your most valuable resource.",
    author: "Unknown"
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln"
  },
  {
    text: "The successful warrior is the average person with laser-like focus.",
    author: "Bruce Lee"
  },
  {
    text: "Where focus goes, energy flows.",
    author: "Tony Robbins"
  },
  {
    text: "Don't count the days, make the days count.",
    author: "Muhammad Ali"
  },
  {
    text: "Either you run the day or the day runs you.",
    author: "Jim Rohn"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "It's not about having time, it's about making time.",
    author: "Unknown"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  }
];

export function getRandomQuote(): Quote {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}