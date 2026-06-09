import { useEffect, useRef, useState, type ChangeEvent } from "react";
import "./App.css";
import Message from "./components/Message";
import SendPhoto from "./components/sendPhoto";
import type { ChatMessage, Sender } from "./types";
import { STORAGE_KEY, backgroundPresets, MAX_IMAGE_SIZE_BYTES, seedMessages } from "./components/constants";
import { createReply, formatTime, makeId } from "./components/chatHelper";

// Make sure the user only picks a real image/GIF that fits the app limits.
const validateFile = (file?: File): string | null => {
  if (!file) return "No file selected.";
  if (!file.type.startsWith("image/")) return "Please choose an image or GIF.";
  if (file.size > MAX_IMAGE_SIZE_BYTES) return "File must be 2 MB or smaller.";
  return null;
};

const App = () => {
  // Theme colors for each sender so every bubble can keep its own look.
  const [colors, setColors] = useState({ You: "#4338ca", Alex: "#111827" });

  // Chat history is stored in localStorage so the conversation survives refreshes.

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
      if (parsed.length) return parsed.map((m: ChatMessage) => ({ ...m, bubbleColor: m.bubbleColor || colors[m.sender] }));
    } catch {}
    return seedMessages.map((m) => ({ ...m, bubbleColor: colors[m.sender] }));
  });

  // Composer and active sender state for the message box.
  const [draft, setDraft] = useState("");
  const [activeUser, setActiveUser] = useState<Sender>("You");

  // Backdrop settings are applied to the message panel only, not the whole page.
  const [bgPreset, setBgPreset] = useState<string>(backgroundPresets[0].value);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgMsg, setBgMsg] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save the conversation whenever the message list changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Storage quota exceeded. Clear history to save more images.");
      setBgMsg("Warning: Local storage full. Messages with images may not save.");
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => { if (bgImage) URL.revokeObjectURL(bgImage); };
  }, [bgImage]);

  // Load a custom image for the chat panel backdrop.
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const error = validateFile(file);
    if (error) return setBgMsg(error), (e.target.value = "");

    if (bgImage) URL.revokeObjectURL(bgImage);
    setBgImage(URL.createObjectURL(file!));
    setBgMsg("Custom image background applied.");
    e.target.value = "";
  };

  const handleMediaSelect = (file: File) => {
    const error = validateFile(file);
    if (error) return setBgMsg(error);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAttachment({ url: reader.result, name: file.name });
        setBgMsg(`Ready to send ${file.type === "image/gif" ? "GIF" : "image"}: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove the uploaded image and fall back to the preset theme in the chat panel.
  const clearImageBackground = () => {
    if (bgImage) URL.revokeObjectURL(bgImage);
    setBgImage(null);
    setBgMsg("Image background removed. Back to preset.");
  };

  // Send the user's text or attached image/GIF and create a short Alex reply.
  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed && !attachment) return;

    const outgoing: ChatMessage = {
      id: makeId(), sender: activeUser, text: trimmed || "Sent an image/GIF",
      timestamp: formatTime(new Date()), imageUrl: attachment?.url, bubbleColor: colors[activeUser],
    };

    setMessages((prev) => [...prev, outgoing]);
    setDraft("");
    setAttachment(null);

    const replySender = activeUser === "You" ? "Alex" : "You";
    window.setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: makeId(), sender: replySender, text: createReply(trimmed || "shared an image"),
        timestamp: formatTime(new Date()), bubbleColor: colors[replySender],
      }]);
    }, 700);
  };

  // Use the selected image or preset only inside the conversation panel, not on the whole page shell.
  const messagePanelStyle = bgImage
    ? {
        backgroundImage: `linear-gradient(rgba(8, 15, 25, 0.68), rgba(8, 15, 25, 0.88)), url(${bgImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundColor: "#020617",
      }
    : {
        background: bgPreset,
        backgroundColor: bgPreset,
      };

  return (
    <main className="app-shell">
      <section className="chat-card">
        <header className="chat-header">
          <div>
            <p className="eyebrow">Neural interface</p>
            <h1>Futuristic chat command center</h1>
            <p className="subtle">Switch personas, send live messages, and explore a brighter neon-style conversation space.</p>
          </div>
          <div className="status-pill">Local sync ready</div>
        </header>

        <div className="chat-topbar">
          <label className="sender-picker">
            <span>Active profile</span>
            <select value={activeUser} onChange={(e) => setActiveUser(e.target.value as Sender)}>
              <option value="You">You</option>
              <option value="Alex">Alex</option>
            </select>
          </label>
        </div>

        <section className="background-controls" aria-label="Background options">
          <div>
            <h2>Scene controls</h2>
            <p className="background-note">Tune the environment with neon presets or a custom visual backdrop.</p>
          </div>

          <div className="preset-row">
            {backgroundPresets.map((preset) => (
              <button key={preset.name} type="button" className={`preset-chip ${bgPreset === preset.value && !bgImage ? "active" : ""}`} onClick={() => { setBgPreset(preset.value); setBgImage(null); setBgMsg(""); }} style={{ background: preset.value }}>
                {preset.name}
              </button>
            ))}
          </div>

          <div className="background-actions">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden-file-input" onChange={handleImageUpload} />
            <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()}>Load image backdrop</button>
            <button type="button" className="ghost-button secondary" onClick={clearImageBackground}>Reset to neon theme</button>
          </div>

          <div className="color-row">
            <label className="color-picker">
              <span>Your bubble color</span>
              <input type="color" value={colors.You} onChange={(e) => setColors({ ...colors, You: e.target.value })} />
            </label>
            <label className="color-picker">
              <span>Alex bubble color</span>
              <input type="color" value={colors.Alex} onChange={(e) => setColors({ ...colors, Alex: e.target.value })} />
            </label>
          </div>

          {bgMsg && <p className="background-status">{bgMsg}</p>}
        </section>

        <section
          className="message-panel"
          aria-label="Conversation history"
          style={messagePanelStyle}
        >
          {messages.length === 0 ? <p className="empty-state">Type a message to start.</p> : messages.map((msg) => (
            <Message key={msg.id} sender={msg.sender} text={msg.text} timestamp={msg.timestamp} isSelf={msg.sender === activeUser} imageUrl={msg.imageUrl} bubbleStyle={{ background: msg.bubbleColor }} />
          ))}
          <div ref={endOfMessagesRef} />
        </section>

        <footer className="composer">
          <div className="composer-main">
            <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendMessage())} placeholder="Type a message..." />
            <SendPhoto onFileSelect={handleMediaSelect} />
          </div>
          <div className="composer-actions">
            {attachment && (
              <button type="button" className="attachment-chip" onClick={() => setAttachment(null)}>
                <span>📎 {attachment.name}</span><small>Remove</small>
              </button>
            )}
            <button type="button" onClick={sendMessage}>Transmit</button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default App;