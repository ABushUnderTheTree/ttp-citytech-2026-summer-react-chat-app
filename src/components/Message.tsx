import type { CSSProperties } from "react";

// The two possible senders in the chat UI.
type Sender = "You" | "Alex";

// These props tell each chat bubble how to display its sender, content, and optional image.
type MessageProps = {
  sender: Sender;
  text: string;
  timestamp: string;
  isSelf: boolean;
  bubbleStyle?: CSSProperties;
  imageUrl?: string;
};

// Render one message bubble, including any image attachment and the sender information.
const Message = ({ sender, text, timestamp, isSelf, bubbleStyle, imageUrl }: MessageProps) => {
  return (
    <article className={`message-row ${isSelf ? "self" : "other"}`}>
      <div className="message-bubble" style={bubbleStyle}>
        <div className="message-meta">
          <strong>{sender}</strong>
          <span>{timestamp}</span>
        </div>
        {imageUrl ? (
          <div className="message-media">
            <img src={imageUrl} alt={text || "Shared image attachment"} className="message-image" />
          </div>
        ) : null}
        {text ? <p>{text}</p> : null}
      </div>
    </article>
  );
};

export default Message;
