import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "./App.css";
import Message from "./components/Message";

type Sender = "You" | "Alex";
type ChatMessage = { id: string; sender: Sender; text: string; timestamp: string };

const STORAGE_KEY = "practice-chat-messages-v1";

const seedMessages: ChatMessage[] = [
  { id: "seed-1", sender: "Alex", text: "Hi there! I’m ready to chat.", timestamp: "10:00 AM" },
  { id: "seed-2", sender: "You", text: "Perfect — I’m here too.", timestamp: "10:01 AM" },
];

const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto 
  ? crypto.randomUUID() 
  : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const pickRandom = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

const createReply = (text: string) => {
  const cleaned = text.trim().toLowerCase();

  if (cleaned.includes("hello") || cleaned.includes("hi")) {
    return pickRandom([
      "Hey there — I’m happy you messaged me.",
      "Hi! What’s on your mind today?",
      "Hello! I’m ready to keep this chat going.",
    ]);
  }

  if (cleaned.includes("thanks")) {
    return pickRandom([
      "Absolutely — I’m glad I could help.",
      "You’re very welcome, and I’m here for more.",
      "No problem at all — that’s what I’m here for.",
    ]);
  }

  if (cleaned.includes("how")) {
    return pickRandom([
      "I’m doing pretty well, and I’m curious what you’re up to.",
      "Doing good — how about you?",
      "Pretty good, thanks. I’m interested to hear your take on this.",
    ]);
  }

  return pickRandom([
    "That sounds like a solid idea — I’m on board.",
    "Nice, I like where this is going.",
    "I can definitely see that. Let’s keep the conversation rolling.",
    "That makes sense to me — tell me more.",
  ]);
};

const App = () => {
  // Lazy initialization: Check local storage ONCE before the first render
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* Fall through to seedMessages */ }
    return seedMessages;
  });

  const [draft, setDraft] = useState("");
  const [activeUser, setActiveUser] = useState<Sender>("You");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Sync to local storage whenever messages change
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const isYou = activeUser === "You";
    const outgoing: ChatMessage = { id: makeId(), sender: activeUser, text: trimmed, timestamp: formatTime(new Date()) };
    
    setMessages((prev) => [...prev, outgoing]);
    setDraft("");

    // Simulate reply
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: isYou ? "Alex" : "You",
          text: createReply(trimmed),
          timestamp: formatTime(new Date()),
        },
      ]);
    }, 700);

    // Note: In a larger app with routing, you would store timerId in a ref and clear it on unmount.
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="app-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Practice chat app</p>
            <h1>Two-user messaging</h1>
            <p className="subtle">Switch between “You” and “Alex”, send messages, and scroll history.</p>
          </div>
          <div className="status-pill">Saved locally</div>
        </header>

        <div className="chat-topbar">
          <label className="sender-picker">
            <span>Send as</span>
            <select value={activeUser} onChange={(e) => setActiveUser(e.target.value as Sender)}>
              <option value="You">You</option>
              <option value="Alex">Alex</option>
            </select>
          </label>
        </div>

        <section className="message-panel" aria-label="Conversation history">
          {messages.length === 0 ? (
            <p className="empty-state">Start the conversation by typing your first message.</p>
          ) : (
            messages.map((msg) => (
              <Message key={msg.id} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} isSelf={msg.sender === activeUser} />
            ))
          )}
          <div ref={endOfMessagesRef} />
        </section>

        <footer className="composer">
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." />
          <button type="button" onClick={sendMessage}>Send</button>
        </footer>
      </section>
    </main>
  );
};

export default App;