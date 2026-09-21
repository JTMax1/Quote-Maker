/**
 * Rich collection of curated quotes across multiple themes
 */

export const SAMPLE_QUOTES = [
  {
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "Philosophy",
    handle: "@stoicwisdom"
  },
  {
    quote: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "Design",
    handle: "@artandmind"
  },
  {
    quote: "The future belongs to those who learn more skills and combine them in creative ways.",
    author: "Robert Greene",
    category: "Mastery",
    handle: "@strategicmind"
  },
  {
    quote: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    category: "Innovation",
    handle: "@techvisions"
  },
  {
    quote: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    category: "Leadership",
    handle: "@trailblazers"
  },
  {
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Mindset",
    handle: "@meditations"
  },
  {
    quote: "Code is like humor. When you have to explain it, it’s bad.",
    author: "Cory House",
    category: "Tech",
    handle: "@cleancode"
  },
  {
    quote: "The only limit to our realization of tomorrow will be our doubts of today.",
    author: "Franklin D. Roosevelt",
    category: "Motivation",
    handle: "@dailycourage"
  },
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Wisdom",
    handle: "@curiousmind"
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "Perseverance",
    handle: "@unbroken"
  },
  {
    quote: "To live is the rarest thing in the world. Most people exist, that is all.",
    author: "Oscar Wilde",
    category: "Poetry",
    handle: "@wildewisdom"
  },
  {
    quote: "Action is the foundational key to all success.",
    author: "Pablo Picasso",
    category: "Creativity",
    handle: "@creativefire"
  }
];

export function getRandomQuote() {
  const index = Math.floor(Math.random() * SAMPLE_QUOTES.length);
  return SAMPLE_QUOTES[index];
}
