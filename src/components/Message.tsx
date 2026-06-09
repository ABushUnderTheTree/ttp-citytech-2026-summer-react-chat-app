// The two possible people who can send a message in this chat.
type Sender = "You" | "Alex";

type MessageProps = {
  sender: Sender;
  text: string;
  timestamp: string;
  isSelf: boolean;
};

// This component draws one chat bubble with the sender name and time.
const Message = ({ sender, text, timestamp, isSelf }: MessageProps) => {
  return (
    <article className={`message-row ${isSelf ? "self" : "other"}`}>
      <div className="message-bubble">
        <div className="message-meta">
          <strong>{sender}</strong>
          <span>{timestamp}</span>
        </div>
        <p>{text}</p>
      </div>
    </article>
  );
};

export default Message;
