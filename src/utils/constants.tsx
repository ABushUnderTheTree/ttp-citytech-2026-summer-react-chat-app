import type { ChatMessage } from "../types";

// The localStorage key used to save chat history.
export const STORAGE_KEY = "practice-chat-messages-v1";

// Maximum file size for uploaded background images.
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

// Predefined color themes the user can switch between.
export const backgroundPresets = [
  { name: "Midnight", value: "linear-gradient(135deg, #09111f, #111827 55%, #0f172a)" },
  { name: "Lavender", value: "linear-gradient(135deg, #1f2937, #312e81 55%, #7c3aed)" },
  { name: "Forest", value: "linear-gradient(135deg, #052e16, #14532d 55%, #166534)" },
  { name: "Sunset", value: "linear-gradient(135deg, #3f1d0f, #9a5b00 55%, #fb7185)" },
] as const;

// Starter conversation shown when no saved messages exist yet.
export const seedMessages: ChatMessage[] = [
  { id: "seed-1", sender: "Alex", text: "Hi there! I’m ready to chat.", timestamp: "10:00 AM" },
  { id: "seed-2", sender: "You", text: "Perfect — I’m here too.", timestamp: "10:01 AM" },
];
