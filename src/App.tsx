import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import "./App.css";
import Message from "./components/Message";
import SendPhoto from "./components/sendPhoto";

import type { ChatMessage, Sender } from "./types";
import { STORAGE_KEY, backgroundPresets, MAX_IMAGE_SIZE_BYTES, seedMessages } from "./components/constants";
import { createReply, formatTime, makeId } from "./components/chatHelper";

const App = () => {
  // Load saved chat history from localStorage when the app starts.
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((message) => ({
            ...message,
            bubbleColor:
              message.bubbleColor ??
              (message.sender === "You" ? "#4338ca" : "#111827"),
          }));
        }
      }
    } catch {
      // Fall back to the starter chat when storage cannot be read.
    }

    return seedMessages.map((message) => ({
      ...message,
      bubbleColor: message.sender === "You" ? "#4338ca" : "#111827",
    }));
  });

  // The current text being typed and which person is sending it.
  const [draft, setDraft] = useState("");
  const [activeUser, setActiveUser] = useState<Sender>("You");

  // Background and theme controls for the chat surface.
  const [backgroundMode, setBackgroundMode] = useState<"preset" | "image">("preset");
  const [selectedPreset, setSelectedPreset] = useState<string>(backgroundPresets[0].value);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
  const [backgroundMessage, setBackgroundMessage] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; name: string } | null>(null);
  const [yourBubbleColor, setYourBubbleColor] = useState("#4338ca");
  const [alexBubbleColor, setAlexBubbleColor] = useState("#111827");

  // Refs used to scroll to the latest message and open the image picker.
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save the current conversation and keep the latest message visible.
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Clean up any uploaded image preview URL when the background changes.
  useEffect(() => {
    return () => {
      if (backgroundImageUrl) {
        URL.revokeObjectURL(backgroundImageUrl);
      }
    };
  }, [backgroundImageUrl]);

  // Switch the app background back to one of the preset gradients.
  const applyPresetBackground = (value: string) => {
    setSelectedPreset(value);
    setBackgroundMode("preset");
    setBackgroundMessage("");
  };

  // Accept an image file, validate it, and set it as the chat background.
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setBackgroundMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setBackgroundMessage("Images must be 2 MB or smaller for a quick preview.");
      event.target.value = "";
      return;
    }

    if (backgroundImageUrl) {
      URL.revokeObjectURL(backgroundImageUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setBackgroundImageUrl(previewUrl);
    setBackgroundMode("image");
    setBackgroundMessage("Custom image background applied.");
    event.target.value = "";
  };

  // Accept a GIF or image attachment for the chat message.
  const handleMediaSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setBackgroundMessage("Please choose a GIF or image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setBackgroundMessage("Image and GIF uploads must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPendingAttachment({ url: reader.result, name: file.name });
        setBackgroundMessage(`Ready to send ${file.type === "image/gif" ? "GIF" : "image"}: ${file.name}`);
      }
    };

    reader.readAsDataURL(file);
  };

  // Remove the custom image and fall back to the selected color theme.
  const clearImageBackground = () => {
    if (backgroundImageUrl) {
      URL.revokeObjectURL(backgroundImageUrl);
    }

    setBackgroundImageUrl(null);
    setBackgroundMode("preset");
    setBackgroundMessage("Image background removed. You can switch back to a color preset.");
  };

  // Build the background style based on whether the user is using a preset or an image.
  const backgroundStyle =
    backgroundMode === "image" && backgroundImageUrl
      ? {
          backgroundImage: `linear-gradient(rgba(8, 15, 25, 0.72), rgba(8, 15, 25, 0.82)), url(${backgroundImageUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: "#020617",
        }
      : {
          background: selectedPreset,
          backgroundColor: selectedPreset,
        };

  // Add the user's message, then generate a reply from Alex after a short delay.
  const sendMessage = () => {
    const trimmed = draft.trim();

    if (!trimmed && !pendingAttachment) {
      return;
    }

    const outgoing: ChatMessage = {
      id: makeId(),
      sender: activeUser,
      text: trimmed || (pendingAttachment ? "Sent an image/GIF" : ""),
      timestamp: formatTime(new Date()),
      imageUrl: pendingAttachment?.url,
      bubbleColor: activeUser === "You" ? yourBubbleColor : alexBubbleColor,
    };

    setMessages((prev) => [...prev, outgoing]);
    setDraft("");
    setPendingAttachment(null);

    const replyText = trimmed || (pendingAttachment ? "shared an image or GIF" : "");
    const isYou = activeUser === "You";

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: isYou ? "Alex" : "You",
          text: createReply(replyText),
          timestamp: formatTime(new Date()),
          bubbleColor: (isYou ? "Alex" : "You") === "You" ? yourBubbleColor : alexBubbleColor,
        },
      ]);
    }, 700);
  };

  // Let Enter send the message without needing to click the button.
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="app-shell" style={backgroundStyle}>
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
            <select value={activeUser} onChange={(event) => setActiveUser(event.target.value as Sender)}>
              <option value="You">You</option>
              <option value="Alex">Alex</option>
            </select>
          </label>
          <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()}>
            Upload hologram
          </button>
        </div>

        <section className="background-controls" aria-label="Background options">
          <div>
            <h2>Scene controls</h2>
            <p className="background-note">Tune the environment with neon presets or a custom visual backdrop.</p>
          </div>

          <div className="preset-row">
            {backgroundPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className={`preset-chip ${selectedPreset === preset.value && backgroundMode === "preset" ? "active" : ""}`}
                onClick={() => applyPresetBackground(preset.value)}
                style={{ background: preset.value }}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="background-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handleImageUpload}
            />
            <button type="button" className="ghost-button" onClick={() => fileInputRef.current?.click()}>
              Load image backdrop
            </button>
            <button type="button" className="ghost-button secondary" onClick={clearImageBackground}>
              Reset to neon theme
            </button>
          </div>

          <div className="color-row">
            <label className="color-picker">
              <span>Your bubble color</span>
              <input type="color" value={yourBubbleColor} onChange={(event) => setYourBubbleColor(event.target.value)} />
            </label>
            <label className="color-picker">
              <span>Alex bubble color</span>
              <input type="color" value={alexBubbleColor} onChange={(event) => setAlexBubbleColor(event.target.value)} />
            </label>
          </div>

          {backgroundMessage ? <p className="background-status">{backgroundMessage}</p> : null}
        </section>

        <section className="message-panel" aria-label="Conversation history">
          {messages.length === 0 ? (
            <p className="empty-state">Type a message and press Enter to start the conversation.</p>
          ) : (
            messages.map((message) => (
              <Message
                key={message.id}
                sender={message.sender}
                text={message.text}
                timestamp={message.timestamp}
                isSelf={message.sender === activeUser}
                imageUrl={message.imageUrl}
                bubbleStyle={{
                  background:
                    message.bubbleColor ??
                    (message.sender === "You" ? yourBubbleColor : alexBubbleColor),
                }}
              />
            ))
          )}
          <div ref={endOfMessagesRef} />
        </section>

        <footer className="composer">
          <div className="composer-main">
            <input type="text" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." />
            <SendPhoto onFileSelect={handleMediaSelect} />
          </div>
          <div className="composer-actions">
            {pendingAttachment ? (
              <button type="button" className="attachment-chip" onClick={() => setPendingAttachment(null)}>
                <span>📎 {pendingAttachment.name}</span>
                <small>Remove</small>
              </button>
            ) : null}
            <button type="button" onClick={sendMessage}>Transmit</button>
          </div>
        </footer>
      </section>
    </main>
  );
};

export default App;