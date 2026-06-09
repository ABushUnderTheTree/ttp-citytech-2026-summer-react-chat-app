// Create a unique ID for each message, using the browser API when available.
export const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto 
  ? crypto.randomUUID() 
  : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Format a Date object into a simple display time.
export const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// Pick one item at random from an array.
const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

// Generate a simple AI-style reply based on the user's message text.
export const createReply = (text: string) => {
  const cleaned = text.trim().toLowerCase();
  if (cleaned.includes("hello") || cleaned.includes("hi")) {
    return pickRandom(["Hey there — I’m happy you messaged me.", "Hi! What’s on your mind today?"]);
  }
  if (cleaned.includes("thanks")) {
    return pickRandom(["Absolutely — I’m glad I could help.", "You’re very welcome."]);
  }
  return pickRandom(["That sounds like a solid idea.", "Nice, I like where this is going."]);
};