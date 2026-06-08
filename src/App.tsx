import { useState, type KeyboardEvent } from "react";

const Message = ({ text }: { text: string }) => {
  return (
    <div className="message">
      <p>{text}</p>
    </div>
  );
};

const App = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, trimmed]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="app">
      <h1>Chat room</h1>

      <div className="messages">
        {messages.length === 0 ? (
          <p className="empty">Type a message and press Enter.</p>
        ) : (
          messages.map((text, index) => <Message key={index} text={text} />)
        )}
      </div>

      <div className="input-row">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
