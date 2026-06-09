// The two identities used in the chat.
export type Sender = "You" | "Alex";

// The shape of each message stored in the chat state.
export type ChatMessage = { 
  id: string; 
  sender: Sender; 
  text: string; 
  timestamp: string; 
};