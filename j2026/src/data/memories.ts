import type { EndingContent, IntroContent, LandingContent, MemoryEntry } from "../types";

export const playlist = [
  "/audio/T1.mp3",
  "/audio/T2.mp3",
  "/audio/placeholder-track-3.wav",
];

export const introContent: IntroContent = {
  eyebrow: "For you",
  title: "Every year, every moment.",
  subtitle:
    "A quiet room, dim light, and the soft ache of remembering what made us us.",
  buttonLabel: "Begin",
  gradient: ["#060606", "#2b0f1f", "#10171d"],
};

export const landingContent: LandingContent = {
  eyebrow: "Private Entrance",
  title: "A little world I made for you.",
  subtitle:
    "One image, one password, and then the room opens into every memory I wanted to keep close.",
  promptLabel: "Enter the password",
  placeholder: "Your secret word",
  buttonLabel: "Unlock",
  helperText:
    "Edit this page's image, text, and password in src/data/memories.ts when you're ready.",
  password: "birthday",
  image: "/images/placeholder-landing.svg",
  gradient: ["#050505", "#2a0d21", "#121923"],
};

export const memories: MemoryEntry[] = [
  {
    id: "year-one",
    year: "Year 1",
    title: "When Everything Tilted Toward You",
    image: "/images/2021.PNG",
    imageFit: "contain",
    frameWidth: 720,
    frameHeight: 460,
    displayScale: 2.5,
    text: "The way the night slowed down around your laugh made the whole room feel softer.",
    gradient: ["#0f0f12", "#4f132d", "#1f2434"],
    accent: "#f59ec6",
    secretMessage: "You were unforgettable long before either of us said it out loud.",
    altMessage: "If I could relive one ordinary moment, I would choose one with you in it.",
    highlight: true,
  },
  {
    id: "year-two",
    year: "Year 2",
    title: "A Language Only We Knew",
    image: "/images/2022.PNG",
    imageFit: "contain",
    frameWidth: 590,
    frameHeight: 334,
    displayScale: 2.5,
    text: "Somewhere between late-night glances and half-finished sentences, you became home.",
    gradient: ["#08070c", "#31203d", "#10262f"],
    accent: "#dfb5ff",
    song: "/audio/placeholder-track-2.wav",
    secretMessage: "I still remember the exact feeling of wanting the night to stretch a little longer.",
    altMessage: "There are versions of me that only exist because you were kind enough to stay.",
  },
  {
    id: "year-three",
    year: "Year 3",
    title: "The Warmth Between Quiet Things",
    image: "/images/2023.PNG",
    imageFit: "contain",
    frameWidth: 580,
    frameHeight: 256,
    displayScale: 2.5,
    text: "Even the silences felt alive with you, like they had a pulse and knew our names.",
    gradient: ["#050608", "#5b1d16", "#1e2233"],
    accent: "#ffc8a3",
    song: "/audio/placeholder-track-3.wav",
    secretMessage: "You made stillness feel safe.",
    altMessage: "Holding your hand felt like the simplest answer to every hard thing.",
  },
  {
    id: "year-four",
    year: "Year 4",
    title: "The Kind of Memory That Lingers",
    image: "/images/2025.PNG",
    imageFit: "contain",
    frameWidth: 1095,
    frameHeight: 859,
    displayScale: 2.5,
    text: "Not because it was loud, but because it felt so deeply true, it refused to fade.",
    gradient: ["#0a0709", "#3f0e22", "#16212d"],
    accent: "#f2a2b8",
    secretMessage: "This is where the hidden memory begins to surface.",
    altMessage: "I would choose this life with you again, even knowing how tender it would make me.",
    highlight: true,
  },
];

export const hiddenMemory: MemoryEntry = {
  id: "hidden-memory",
  year: "Unspoken",
  title: "The Memory I Kept Nearest",
  image: "/images/placeholder-hidden-memory.svg",
  imageFit: "contain",
  frameWidth: 860,
  frameHeight: 1060,
  text: "There was always one memory I held back, not because it mattered less, but because it mattered most.",
  gradient: ["#050505", "#5f0d2f", "#0f1b28"],
  accent: "#ffd6e7",
  song: "/audio/placeholder-track-1.wav",
  secretMessage: "Thank you for becoming part of my favorite version of the world.",
  altMessage: "Some feelings ask to be whispered so they can stay delicate and true.",
  highlight: true,
};

export const endingContent: EndingContent = {
  title: "Still yours, in every memory.",
  message:
    "Replace these placeholders with your real moments, and this becomes a private little world built just for her birthday.",
  buttonLabel: "Watch Again",
  gradient: ["#040404", "#2a0d21", "#11151f"],
};
