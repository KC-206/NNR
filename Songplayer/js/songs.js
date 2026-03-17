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
  title: "Yousef",
  artist: "Huntress",
  album: "",
  duration: 181,
  src: "audio/yousef.mp3",
  artwork: "https://picsum.photos/seed/hh8/400/400",
  tags: ["instrumental", "power", "theme"],
  notes: "The opening track. No lyrics — just atmosphere and intent.",
  dateAdded: "2024-01-05",
  downloadable: true,
  },
  {
    id: "s003",
    title: "Woo hoo",
    artist: "",
    album: "",
    duration: 290,
    src: "audio/Woo hoo.mp3",
    artwork: "art/woo-hoo.jpg",
    tags: ["precious brat"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s004",
    title: "Down by the Shore",
    artist: "",
    album: "",
    duration: 235,
    src: "audio/Down by the Shore.mp3",
    artwork: "art/down-by-the-shore.jpg",
    tags: ["portia"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s005",
    title: "Emotional Support Salmon",
    artist: "",
    album: "",
    duration: 136,
    src: "audio/Emotional Support Salmon.mp3",
    artwork: "art/emotional-support-salmon.jpg",
    tags: ["laurie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s006",
    title: "Every Jess needs a Kristy (Remix)",
    artist: "",
    album: "",
    duration: 253,
    src: "audio/Every Jess needs a Kristy.mp3",
    artwork: "art/every-jess-needs-a-kristy-remix.jpg",
    tags: ["jessica","kristy"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s007",
    title: "Italo Disco",
    artist: "",
    album: "",
    duration: 222,
    src: "audio/Everysong Needs Italo Disco.mp3",
    artwork: "",
    tags: ["precious brat"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s008",
    title: "Gonna be all right",
    artist: "",
    album: "",
    duration: 242,
    src: "audio/Gonna be all right.mp3",
    artwork: "",
    tags: ["allie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s009",
    title: "Half Rescue, Half Riot",
    artist: "",
    album: "",
    duration: 205,
    src: "audio/Half Rescue, Half Riot.mp3",
    artwork: "art/half-rescue-half-riot.jpg",
    tags: ["jessica","kristy"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s010",
    title: "I Am but their Humble Servant",
    artist: "",
    album: "",
    duration: 168,
    src: "audio/I Am but their Humble Servant.mp3",
    artwork: "",
    tags: ["jessica"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s011",
    title: "I want the Tiddies not the Responsibilities",
    artist: "",
    album: "",
    duration: 230,
    src: "audio/I want the Tiddies not the Responsibilities.mp3",
    artwork: "",
    tags: ["alice","kristy"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s012",
    title: "It's All Good in the Hood",
    artist: "",
    album: "",
    duration: 162,
    src: "audio/It's All Good in the Hood.mp3",
    artwork: "art/its-all-good-in-the-hood-cover.jpg",
    tags: ["candice"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s013",
    title: "Jenny",
    artist: "",
    album: "",
    duration: 210,
    src: "audio/Jenny.mp3",
    artwork: "",
    tags: [],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s014",
    title: "Kaleidomancer",
    artist: "",
    album: "",
    duration: 174,
    src: "audio/Kaleidomancer.mp3",
    artwork: "",
    tags: ["holly","alice"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s015",
    title: "Lady Nike and the Plundered Booty",
    artist: "",
    album: "",
    duration: 168,
    src: "audio/Lady Nike and the Plundered Booty.mp3",
    artwork: "art/sea-shanty.jpg",
    tags: [],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s016",
    title: "She was Left Unsupervised",
    artist: "",
    album: "",
    duration: 265,
    src: "audio/Left Unsupervised.mp3",
    artwork: "art/left-unsupervised-remastered.jpg",
    tags: ["kristy","jessica"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s017",
    title: "Safety Scarf",
    artist: "",
    album: "",
    duration: 185,
    src: "audio/Safety Scarf.mp3",
    artwork: "art/safety-scarf.jpg",
    tags: ["pb", "precious"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s018",
    title: "Sandy Cheeks",
    artist: "",
    album: "",
    duration: 165,
    src: "audio/Sandy Cheeks.mp3",
    artwork: "art/sandy-cheeks-remix.jpg",
    tags: ["alice"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s019",
    title: "Trixie has Space Crabs",
    artist: "",
    album: "",
    duration: 221,
    src: "audio/Space Crabs.mp3",
    artwork: "art/space-crabs.jpg",
    tags: ["trixie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s020",
    title: "The land of TimBits",
    artist: "",
    album: "",
    duration: 229,
    src: "audio/The land of timbits.mp3",
    artwork: "",
    tags: ["laurie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s021",
    title: "The Universe Blinked and I Found You",
    artist: "",
    album: "",
    duration: 224,
    src: "audio/The Universe Blinked and I Found You.mp3",
    artwork: "art/universe-cover-cover-cover-cover.jpg",
    tags: ["holly", "alice"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s022",
    title: "Trixie's Prickly Precious",
    artist: "",
    album: "",
    duration: 244,
    src: "audio/Trixie's Prickly Precious.mp3",
    artwork: "art/trixie.jpg",
    tags: ["trixie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s023",
    title: "Whats in your coffee",
    artist: "",
    album: "",
    duration: 207,
    src: "audio/Whats in your coffee.mp3",
    artwork: "art/whats-in-your-coffee.jpg",
    tags: [],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s024",
    title: "She Froze Her Dingaling Off",
    artist: "",
    album: "",
    duration: 238,
    src: "audio/Winter's Bite.mp3",
    artwork: "art/winters-bite.jpg",
    tags: ["trixie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s025",
    title: "Abi",
    artist: "",
    album: "",
    duration: 161,
    src: "audio/Abi.mp3",
    artwork: "art/abi.jpg",
    tags: ["precious", "abi"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s026",
    title: "The Carpets Don't Match The Drapes",
    artist: "",
    album: "",
    duration: 217,
    src: "audio/Carpet Dont Match The Drapes.mp3",
    artwork: "art/redhead-cover.jpg",
    tags: [],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s027",
    title: "Dont Feed Trixie's Ego",
    artist: "",
    album: "",
    duration: 312,
    src: "audio/Dont Feed Trixie's Ego.mp3",
    artwork: "art/trixie-cover.jpg",
    tags: ["trixie"],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },

  {
    id: "s028",
    title: "Pam Queen of the Pole",
    artist: "",
    album: "",
    duration: 170,
    src: "audio/Pam Queen of the Pole.mp3",
    artwork: "",
    tags: [],
    notes: "",
    dateAdded: "2026-03-17",
    downloadable: true,
  },
];
