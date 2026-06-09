// The two available chat participants.
export type Sender = "You" | "Alex";

// The structure for every message stored in the chat history.
export type ChatMessage = {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  imageUrl?: string;
  bubbleColor?: string;
};
