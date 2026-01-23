// Test fixtures for posts domain
import type { InsertPost } from "@db/schema";

export const testPosts = {
  textPost: {
    userId: 1, // Will be set dynamically in tests
    content: "Just had an amazing tango night! 💃🕺",
    visibility: "public",
    type: "text",
  } as InsertPost,

  imagePost: {
    userId: 1,
    content: "Check out this beautiful venue!",
    visibility: "public",
    type: "image",
    mediaUrls: ["https://example.com/venue1.jpg"],
  } as InsertPost,

  videoPost: {
    userId: 1,
    content: "My performance from last night",
    visibility: "public",
    type: "video",
    mediaUrls: ["https://example.com/performance.mp4"],
  } as InsertPost,

  friendsOnly: {
    userId: 1,
    content: "Private post for friends only",
    visibility: "friends",
    type: "text",
  } as InsertPost,

  pollPost: {
    userId: 1,
    content: "Which day works best for the next practica?",
    visibility: "public",
    type: "poll",
  } as InsertPost,
};
