/**
 * songs.js — Your music catalog
 *
 * This is the file you'll edit most often — add, remove, or update
 * songs here. Each entry is one song object.
 *
 * Fields:
 *   id          {string}   Unique identifier — never reuse or change once set
 *   title       {string}   Song title
 *   artist      {string}   Artist name
 *   album       {string}   Album or EP name
 *   duration    {number}   Length in seconds (used for display only)
 *   src         {string}   Path or URL to the audio file
 *   artwork     {string}   Path or URL to the album art image (square recommended)
 *   tags        {string[]} Array of tag strings (lowercase, no spaces)
 *   notes       {string}   Lyrics, liner notes, or any freeform text
 *   dateAdded   {string}   ISO date string "YYYY-MM-DD" for sorting
 *   downloadable {boolean} Show download button for this track (true/false)
 *
 * Audio tips:
 *   — Put .mp3 files in the /audio/ folder and reference as "audio/filename.mp3"
 *   — For large files (>50MB), host on Google Drive and use the direct link:
 *     "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
 *
 * Artwork tips:
 *   — Put images in the /art/ folder and reference as "art/filename.jpg"
 *   — Square images (e.g. 500×500px) work best in the card grid
 *   — External URLs (imgur, etc.) also work fine
 */

const SONGS = [
  {
    id: "s001",
    title: "Into the Wild",
    artist: "Huntress",
    album: "First Light",
    duration: 213,
    src: "audio/into-the-wild.mp3",
    artwork: "https://picsum.photos/seed/hh1/400/400",
    tags: ["trixie", "nature", "dark"],
    notes: "Written during a late autumn walk through the woods.\n\nLyrics:\nInto the wild I go alone\nWhere the ancient trees have grown\nNo map to guide, no star to see\nJust the forest calling me\n\nThrough the roots and through the rain\nI will find my way again",
    dateAdded: "2024-01-10",
    downloadable: true,
  },
  {
    id: "s002",
    title: "Silver Arrow",
    artist: "Huntress",
    album: "First Light",
    duration: 187,
    src: "audio/silver-arrow.mp3",
    artwork: "https://picsum.photos/seed/hh2/400/400",
    tags: ["upbeat", "power", "fast"],
    notes: "The one about chasing dreams at full speed. High energy, meant to be played loud.",
    dateAdded: "2024-01-15",
    downloadable: true,
  },
  {
    id: "s003",
    title: "Trixie's Lament",
    artist: "Huntress",
    album: "Moon Songs",
    duration: 248,
    src: "audio/trixies-lament.mp3",
    artwork: "https://picsum.photos/seed/hh3/400/400",
    tags: ["trixie", "sad", "acoustic"],
    notes: "Written for Trixie. A quiet, aching song.\n\nLyrics:\nSoft paws on midnight floors\nWhiskers brush against the doors\nYou were here and now you're not\nBut every song you haven't forgot\n\nI'll leave the light on when I sleep\nYour memory is mine to keep",
    dateAdded: "2024-02-01",
    downloadable: true,
  },
  {
    id: "s004",
    title: "Ember & Ash",
    artist: "Huntress",
    album: "Moon Songs",
    duration: 196,
    src: "audio/ember-and-ash.mp3",
    artwork: "https://picsum.photos/seed/hh4/400/400",
    tags: ["atmospheric", "dark", "slow"],
    notes: "Ambient and slow. Best experienced with headphones in a dark room.",
    dateAdded: "2024-02-14",
    downloadable: false,
  },
  {
    id: "s005",
    title: "Morning Ritual",
    artist: "Huntress",
    album: "Dawnbreaker",
    duration: 172,
    src: "audio/morning-ritual.mp3",
    artwork: "https://picsum.photos/seed/hh5/400/400",
    tags: ["upbeat", "acoustic", "morning"],
    notes: "Written while drinking my first coffee of the day. Very caffeinated energy.",
    dateAdded: "2024-03-05",
    downloadable: true,
  },
  {
    id: "s006",
    title: "Trixie's Return",
    artist: "Huntress",
    album: "Dawnbreaker",
    duration: 229,
    src: "audio/trixies-return.mp3",
    artwork: "https://picsum.photos/seed/hh6/400/400",
    tags: ["trixie", "hopeful", "upbeat"],
    notes: "The happy answer to Trixie's Lament. Same melody, different heart.",
    dateAdded: "2024-03-20",
    downloadable: true,
  },
  {
    id: "s007",
    title: "Nightshade",
    artist: "Huntress",
    album: "Moon Songs",
    duration: 204,
    src: "audio/nightshade.mp3",
    artwork: "https://picsum.photos/seed/hh7/400/400",
    tags: ["dark", "atmospheric", "slow"],
    notes: "A moody late-night piece. Inspired by insomnia and overcast skies.",
    dateAdded: "2024-02-28",
    downloadable: true,
  },
  {
  id: "s009",
  title: "Yousef",
  artist: "Huntress",
  album: "First Light",
  duration: 181,
  src: "audio/yousef.mp3",
  artwork: "https://picsum.photos/seed/hh8/400/400",
  tags: ["instrumental", "power", "theme"],
  notes: "The opening track. No lyrics — just atmosphere and intent.",
  dateAdded: "2024-01-05",
  downloadable: true,
  },
];
