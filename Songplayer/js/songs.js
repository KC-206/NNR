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
];
