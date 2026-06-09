import type { CSSProperties } from "react";

// The two possible senders in the chat UI.
type Sender = "You" | "Alex";

// The props this message bubble needs to render itself.
type MessageProps = {
  sender: Sender;
  text: string;
  timestamp: string;
  isSelf: boolean;
  bubbleStyle?: CSSProperties;
  imageUrl?: string;
};

// Render one message bubble with the sender, timestamp, and text.
const Message = ({ sender, text, timestamp, isSelf, bubbleStyle, imageUrl }: MessageProps) => {
  return (
    <article className={`message-row ${isSelf ? "self" : "other"}`}>
      <div className="message-bubble" style={bubbleStyle}>
        <div className="message-meta">
          <strong>{sender}</strong>
          <span>{timestamp}</span>
        </div>
        {imageUrl ? <img src={imageUrl} alt="Shared attachment" className="message-image" /> : null}
        {text ? <p>{text}</p> : null}
      </div>
    </article>
  );
};

export default Message;
