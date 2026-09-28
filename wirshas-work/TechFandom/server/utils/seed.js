require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require("../models/User");
const Character = require("../models/Character");
const Article = require("../models/Article");
const Content = require("../models/Content");
const Media = require("../models/Media");
const Event = require("../models/Event");
const Release = require("../models/Release");
const Merch = require("../models/Merch");
const Bookmark = require("../models/Bookmark");
const Submission = require("../models/Submission");
const Feedback = require("../models/Feedback");

const now = new Date();
const daysFromNow = (d, hour = 18) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
};
const pick = (arr, i) => arr[i % arr.length];
const IMG = (w, h, seed) =>
  `https://picsum.photos/seed/fanhub-${seed || Math.floor(Math.random() * 9999)}/${w}/${h}`;

const ARTICLE_SEEDS = [
  "anime-naruto", "gaming-kratos", "kpop-nova9", "movies-nolan",
  "comics-batman", "anime-dubsub", "gaming-glados", "kpop-photocard",
  "movies-mcu", "gaming-esports", "music-vinyl", "comics-wonderwoman",
  "sports-coach", "anime-asuka",
];

const CHARACTER_SEEDS = [
  "char-naruto", "char-goku", "char-levi", "char-asuka",
  "char-kratos", "char-masterchief", "char-lara", "char-glados",
  "char-ironman", "char-batman", "char-ripley", "char-luna",
  "char-jhwan", "char-spiderman", "char-wonderwoman", "char-spawn",
  "char-djnebula", "char-aria", "char-coach", "char-understudy",
];

const CONTENT_SEEDS = [
  "content-shonen", "content-nova9", "content-podcast", "content-panel",
  "content-speedrun", "content-idoldiet", "content-score", "content-cosplay",
  "content-gacha", "content-choreo", "content-playlist", "content-subdub",
  "content-sports", "content-batcave", "content-commentary", "content-vinyl",
];

const MEDIA_SEEDS = [
  "media-nova9", "media-shonen", "media-podcast", "media-batcave",
  "media-gacha", "media-idolradio", "media-adaptation", "media-stadium",
  "media-supercut", "media-speedrun", "media-sports", "media-asmr",
  "media-multiverse", "media-teaser", "media-cape", "media-halftime",
  "media-ninetails", "media-aperture",
];

const usersData = [
  { name: "Admin Diva", email: "admin@fanhub.com", passwordHash: "admin123", role: "admin", favoriteFandoms: ["Anime", "Gaming"] },
  { name: "Demo Fan", email: "user@fanhub.com", passwordHash: "user123", role: "user", favoriteFandoms: ["K-Pop", "Anime", "Gaming"] },
  { name: "Ayesha K.", email: "ayesha@fanhub.com", passwordHash: "demo123", role: "user", favoriteFandoms: ["K-Pop"] },
  { name: "Marco V.", email: "marco@fanhub.com", passwordHash: "demo123", role: "user", favoriteFandoms: ["Gaming", "Comics"] },
  { name: "Lena R.", email: "lena@fanhub.com", passwordHash: "demo123", role: "user", favoriteFandoms: ["Movies", "Music"] },
];

const charactersData = [
  { name: "Naruto Uzumaki", fandom: "Anime", category: "Protagonist", traits: ["Determined", "Loyal", "Energetic"], bio: "A loud, stubborn ninja of Konoha who dreams of becoming Hokage. Carries the Nine-Tails and never gives up on his friends." },
  { name: "Son Goku", fandom: "Anime", category: "Legendary", traits: ["Pure-hearted", "Fearless", "Appetite of legends"], bio: "A Saiyan raised on Earth who lives for the next strong opponent. His power level is, in fact, over 9000." },
  { name: "Levi Ackerman", fandom: "Anime", category: "Mentor", traits: ["Disciplined", "Ruthless", "Clean freak"], bio: "Humanity's strongest soldier. Squad captain of the Survey Corps and terror of untidy rooms." },
  { name: "Asuka Langley", fandom: "Anime", category: "Rival", traits: ["Proud", "Fiery", "Pilot prodigy"], bio: "Evangelion pilot and self-proclaimed genius who competes with everyone, especially herself." },
  { name: "Kratos", fandom: "Gaming", category: "Antagonist", traits: ["Rage incarnate", "Regretful father", "Godslayer"], bio: "The Ghost of Sparta, now a wiser father teaching his boy the ways of the Norse wilds." },
  { name: "Master Chief", fandom: "Gaming", category: "Protagonist", traits: ["Stoic", "Duty-bound", "Lucky"], bio: "Spartan-117. Finishing this fight since 2552, one halo at a time." },
  { name: "Lara Croft", fandom: "Gaming", category: "Protagonist", traits: ["Adventurous", "Brilliant", "Unstoppable"], bio: "Archaeologist, adventurer and the reason 'tomb raider' is a job title." },
  { name: "GLaDOS", fandom: "Gaming", category: "Antagonist", traits: ["Passive-aggressive", "Genius AI", "Cake enthusiast (allegedly)"], bio: "Enrichment-center overlord whose test chambers come with a side of sarcasm." },
  { name: "Iron Man", fandom: "Movies", category: "Protagonist", traits: ["Genius", "Billionaire", "Philanthropist"], bio: "Tony Stark built the suit in a cave. With a box of scraps. Deal with it." },
  { name: "Batman", fandom: "Movies", category: "Protagonist", traits: ["Detective", "Prepared", "Night-phobic"], bio: "Gotham's Dark Knight — peak human, zero powers, one very full utility belt." },
  { name: "Ellen Ripley", fandom: "Movies", category: "Legendary", traits: ["Survivor", "No-nonsense", "Alien-bane"], bio: "Warrant officer of the Nostromo who turned 'get away from her' into cinema history." },
  { name: "Luna Kim", fandom: "K-Pop", category: "Idol", traits: ["Main vocalist", "Charismatic", "Fashion icon"], bio: "Leader of the fictional group NOVA9, famous for high notes and higher fashion." },
  { name: "J-Hwan", fandom: "K-Pop", category: "Idol", traits: ["Main dancer", "Choreographer", "Variety-show gold"], bio: "NOVA9's dance machine — practices until the mirrors beg for mercy." },
  { name: "Spider-Man", fandom: "Comics", category: "Protagonist", traits: ["Quippy", "Responsible", "Scientist"], bio: "Friendly neighborhood hero who learned early that with great power comes great admin." },
  { name: "Wonder Woman", fandom: "Comics", category: "Legendary", traits: ["Warrior", "Diplomat", "Truth-lasso licensed"], bio: "Princess of Themyscira, champion of truth, and owner of the best invisible jet in comics." },
  { name: "Spawn", fandom: "Comics", category: "Antagonist", traits: ["Hellspawn", "Tragic", "Caped vengeance"], bio: "Al Simmons returned from the wrong afterlife with a grudge and a very red cape." },
  { name: "DJ Nebula", fandom: "Music", category: "Mentor", traits: ["Beat architect", "Producer", "Vinyl purist"], bio: "Legendary turntablist who says the drop is a spiritual experience. We believe them." },
  { name: "Aria 'Bolt' Chen", fandom: "Sports", category: "Rival", traits: ["Sprinter", "Showboat", "Record-breaker"], bio: "Track star who ties her shoes at the starting line out of pure disrespect for gravity." },
  { name: "Coach Ramirez", fandom: "Sports", category: "Mentor", traits: ["Motivational", "Old-school", "Whistle poetry"], bio: "Believes every underdog story starts at 5 AM practice. Usually right." },
  { name: "The Understudy", fandom: "Anime", category: "Supporting", traits: ["Loyal friend", "Comic relief", "Hidden depths"], bio: "Always second on the poster, first in our hearts. Their arc is coming, promise." },
].map((c, i) => ({
  ...c,
  imageUrl: IMG(600, 750, pick(CHARACTER_SEEDS, i)),
  relatedContent: [],
}));

const articlesData = [
  { title: "Why Naruto's Speech Jutsu Still Wins in 2026", author: "Wirsha", fandom: "Anime", category: "Theories", featured: true, views: 15420, excerpt: "Talk-no-Jutsu remains the strongest technique in shonen — here's the framework behind it." },
  { title: "Kratos vs. Everyone: A Parenting Tier List", author: "Marco V.", fandom: "Gaming", category: "Reviews", featured: false, views: 9820, excerpt: "From Valhalla to Vanaheim, we rank the Ghost of Sparta's family counseling methods." },
  { title: "NOVA9's Comeback, Frame by Frame", author: "Ayesha K.", fandom: "K-Pop", category: "News", featured: true, views: 22110, excerpt: "The lore video hides eleven clues. We paused every one of them for science." },
  { title: "The Nolan Test: Is Your Crossover Cinema or Chaos?", author: "Lena R.", fandom: "Movies", category: "Opinion", featured: false, views: 4310, excerpt: "A totally serious rubric for whether your multiverse movie deserves a third act." },
  { title: "Speedrunning Batman's Prep Time", author: "Marco V.", fandom: "Comics", category: "Guides", featured: false, views: 6740, excerpt: "How many contingencies fit in one utility belt? A categorically unhinged analysis." },
  { title: "Dub vs. Sub: The Eternal Ladder Match", author: "Wirsha", fandom: "Anime", category: "Opinion", featured: false, views: 11290, excerpt: "Both sides bring receipts. The ring announcer is still buffering." },
  { title: "GLaDOS Dictation: A Study in Menace", author: "Lena R.", fandom: "Gaming", category: "Reviews", featured: false, views: 3380, excerpt: "Aperture's finest AI read the news for a week. Ratings up, staff down." },
  { title: "K-Pop Photocard Economics 101", author: "Ayesha K.", fandom: "K-Pop", category: "Editorials", featured: false, views: 18760, excerpt: "Supply, demand and one particular bias wrecking the entire curve." },
  { title: "The MCU Multiverse Bingo Card", author: "Lena R.", fandom: "Movies", category: "Theories", featured: false, views: 7550, excerpt: "Cameo square. Variant square. Sad dad square. Free space is Tony crying." },
  { title: "From Tutorial to Tournament: A Rookie's FPS Diary", author: "Marco V.", fandom: "Gaming", category: "Guides", featured: false, views: 2410, excerpt: "Week one: 12 kills. Week eight: negative respect but positive vibes." },
  { title: "Vinyl Resurgence: DJs on the Comeback", author: "Wirsha", fandom: "Music", category: "News", featured: false, views: 5120, excerpt: "Why the hottest drop of the year is 33⅓ RPM." },
  { title: "Wonder Woman's Diplomacy Playbook", author: "Wirsha", fandom: "Comics", category: "Fan Fiction", featured: false, views: 6020, excerpt: "The Lasso of Truth enters a United Nations session. Chaos, honestly." },
  { title: "5 AM with Coach Ramirez", author: "Wirsha", fandom: "Sports", category: "Interviews", featured: false, views: 990, excerpt: "The legendary coach on underdogs, whistles, and why talent shows up late." },
  { title: "Asuka vs. The Narrative", author: "Wirsha", fandom: "Anime", category: "Theories", featured: false, views: 8830, excerpt: "Sync ratio 100% on this essay about pride, piloting and being fourteen." },
].map((a, i) => ({
  ...a,
  body: `
    <p>${a.excerpt}</p>
    <h2>Why it matters</h2>
    <p>The fandom has debated this for years, but the 2026 discourse hit different. Between the comeback teasers, the tournament arcs and one very honest interview, the context finally clicked into place.</p>
    <blockquote>"Fans don't follow characters — they follow the feeling of being understood."</blockquote>
    <h3>The receipts</h3>
    <ul>
      <li>Frame-perfect callbacks in the latest teaser</li>
      <li>A soundtrack shift that mirrors the character arc</li>
      <li>Word-of-God confirmation that vindicated the theorists</li>
    </ul>
    <p>Whether you're a day-one fan or a trailer-only tourist, this one's worth your evening.</p>
    <p><em>What do you think? Drop your take in the feedback form — we read every submission.</em></p>
  `,
  imageUrls: [IMG(1200, 675, pick(ARTICLE_SEEDS, i))],
  status: "published",
  publishedAt: daysFromNow(-14 + i, 12),
}));

const contentData = [
  { title: "Shonen Power Scaling — Explained", category: "Anime", type: "article", popularity: 92 },
  { title: "NOVA9 Debut Stage", category: "K-Pop", type: "video", popularity: 88 },
  { title: "Fandom Lore Podcast #12", category: "Gaming", type: "audio", popularity: 74 },
  { title: "Iconic Frame: The Red Sunset Panel", category: "Comics", type: "image", popularity: 61 },
  { title: "Speedrun World Record Breakdown", category: "Gaming", type: "video", popularity: 95 },
  { title: "Idol Diet Myths, Debunked", category: "K-Pop", type: "article", popularity: 55 },
  { title: "Score Study: Themes of the Multiverse", category: "Movies", type: "audio", popularity: 67 },
  { title: "Convention Cosplay Gallery 2025", category: "Anime", type: "image", popularity: 83 },
  { title: "The Economics of Gacha", category: "Gaming", type: "article", popularity: 79 },
  { title: "Choreography Deep-Dive: Mirror Mode", category: "K-Pop", type: "video", popularity: 71 },
  { title: "Stadium Anthems Playlist", category: "Music", type: "audio", popularity: 64 },
  { title: "Frame Wars: Sub vs Dub Meme Review", category: "Anime", type: "video", popularity: 90 },
  { title: "Sports Anime Truthfulness Index", category: "Sports", type: "article", popularity: 58 },
  { title: "Prop Design of the Batcave", category: "Comics", type: "image", popularity: 66 },
  { title: "Director's Commentary Reread", category: "Movies", type: "article", popularity: 49 },
  { title: "Vinyl Pressing Plant Tour", category: "Music", type: "video", popularity: 72 },
].map((c, i) => ({
  ...c,
  description: `A crowd-favorite ${c.type} about ${c.title.toLowerCase()} — curated by the Fan Hub team for maximum fandom value.`,
  releaseDate: daysFromNow(-60 + i * 3, 10),
  imageUrl: IMG(800, 450, pick(CONTENT_SEEDS, i)),
  publishedAt: daysFromNow(-60 + i * 3, 10),
}));

const mediaData = [
  { title: "NOVA9 — 'Starlight' Official MV", mediaType: "video", fandom: "K-Pop", category: "Music Video", tags: ["mv", "official"], releaseYear: 2026 },
  { title: "Shonen Fight Choreography, Explained", mediaType: "explainer", fandom: "Anime", category: "Lore Explainer", tags: ["analysis"], releaseYear: 2025 },
  { title: "Godslayer Podcast Ep. 7", mediaType: "audio", fandom: "Gaming", category: "Podcast", tags: ["podcast", "lore"], releaseYear: 2026 },
  { title: "Batcave Set Tour", mediaType: "video", fandom: "Movies", category: "Behind the Scenes", tags: ["bts"], releaseYear: 2024 },
  { title: "How Gacha Rates Really Work", mediaType: "explainer", fandom: "Gaming", category: "Lore Explainer", tags: ["economy"], releaseYear: 2026 },
  { title: "Idol Radio: Ep. 22", mediaType: "audio", fandom: "K-Pop", category: "Podcast", tags: ["radio"], releaseYear: 2025 },
  { title: "Comic Panel to Screen: Adaptation Diaries", mediaType: "explainer", fandom: "Comics", category: "Lore Explainer", tags: ["adaptation"], releaseYear: 2025 },
  { title: "Stadium Tour Cinematic Recap", mediaType: "video", fandom: "Music", category: "Live", tags: ["live"], releaseYear: 2026 },
  { title: "Training Arc Supercut", mediaType: "video", fandom: "Anime", category: "Supercut", tags: ["supercut"], releaseYear: 2024 },
  { title: "Speedrun Commentary: Any% Glitchless", mediaType: "video", fandom: "Gaming", category: "Speedrun", tags: ["speedrun"], releaseYear: 2026 },
  { title: "Sport Anime vs Real Athletics", mediaType: "explainer", fandom: "Sports", category: "Lore Explainer", tags: ["analysis"], releaseYear: 2025 },
  { title: "Vinyl Pressing ASMR", mediaType: "audio", fandom: "Music", category: "Ambient", tags: ["asmr"], releaseYear: 2026 },
  { title: "Multiverse Cameo Tracker", mediaType: "explainer", fandom: "Movies", category: "Lore Explainer", tags: ["multiverse"], releaseYear: 2026 },
  { title: "Comeback Teaser Breakdown", mediaType: "video", fandom: "K-Pop", category: "Analysis", tags: ["teaser", "analysis"], releaseYear: 2026 },
  { title: "Cape Physics: A Scholarly Analysis", mediaType: "explainer", fandom: "Comics", category: "Lore Explainer", tags: ["science"], releaseYear: 2024 },
  { title: "Half-Time Show Drum Cam", mediaType: "video", fandom: "Sports", category: "Live", tags: ["live"], releaseYear: 2025 },
  { title: "Lore Cast: The Nine-Tails Reckoning", mediaType: "audio", fandom: "Anime", category: "Podcast", tags: ["podcast"], releaseYear: 2026 },
  { title: "Aperture Test Chamber Walkthrough", mediaType: "video", fandom: "Gaming", category: "Walkthrough", tags: ["walkthrough"], releaseYear: 2023 },
].map((m, i) => ({
  ...m,
  embedUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ?list=fanhub-${i}`,
  thumbnailUrl: IMG(640, 360, pick(MEDIA_SEEDS, i)),
}));

const eventsData = [
  { title: "Starfall Con 2026", eventType: "convention", city: "Tokyo", address: "Tokyo Big Sight", lat: 35.6297, long: 139.7756, start: 45, end: 47, tickets: "https://www.eventbrite.com/" },
  { title: "Neon Nights Premiere", eventType: "premiere", city: "Seoul", address: "CGV Yongsan", lat: 37.5326, long: 126.9903, start: 12, end: 12, tickets: "https://www.ticketmaster.com/" },
  { title: "Midnight Screening Marathon", eventType: "screening", city: "Los Angeles", address: "New Beverly Cinema", lat: 34.0981, long: -118.3639, start: 0, end: 0, tickets: "https://www.tickets.com/" },
  { title: "Cosplay Picnic Meetup", eventType: "cosplay-meetup", city: "Dubai", address: "Zabeel Park", lat: 25.2354, long: 55.3099, start: 20, end: 20, tickets: "" },
  { title: "Heroes & Halos Con", eventType: "convention", city: "London", address: "ExCeL London", lat: 51.5081, long: 0.0294, start: -30, end: -28, tickets: "https://www.stubhub.com/" },
  { title: "Vinyl & Villains Night", eventType: "screening", city: "New York", address: "Nitehawk Cinema", lat: 40.7213, long: -73.9505, start: -7, end: -7, tickets: "https://www.axs.com/" },
  { title: "K-Culture Fan Fest", eventType: "convention", city: "Seoul", address: "COEX Hall D", lat: 37.5115, long: 127.0595, start: 60, end: 62, tickets: "https://www.seetickets.com/" },
  { title: "Cosplay Workshop: Armor Basics", eventType: "cosplay-meetup", city: "Tokyo", address: "Akihabara UDX", lat: 35.7021, long: 139.7729, start: 8, end: 8, tickets: "" },
  { title: "Director's Cut Premiere Gala", eventType: "premiere", city: "London", address: "BFI Southbank", lat: 51.5069, long: -0.1156, start: -60, end: -60, tickets: "https://www.ticketmaster.co.uk/" },
  { title: "Retro Gaming LAN Screening", eventType: "screening", city: "Dubai", address: "DECC Hall 4", lat: 25.2325, long: 55.3656, start: 90, end: 91, tickets: "https://www.atgtickets.com/" },
].map((e, i) => {
  const eventImages = [
    "starfall-con.jpg",
    "neon-nights.jpg",
    "midnight-screening.jpg",
    "cosplay-picnic.jpg",
    "heroes-halos.jpg",
    "vinyl-villains.jpg",
    "kculture-fest.jpg",
    "cosplay-workshop.jpg",
    "directors-cut.jpg",
    "retro-gaming.jpg",
  ];
  return {
    title: e.title,
    eventType: e.eventType,
    city: e.city,
    address: e.address,
    lat: e.lat,
    long: e.long,
    startDate: daysFromNow(e.start, 17),
    endDate: daysFromNow(e.end, 22),
    ticketUrl: e.tickets,
    story: `
      <p>${e.title} brings the fandom together for ${e.eventType.replace("-", " ")} energy — panels, exclusives, and the kind of hallway conversations that become group chats.</p>
      <h3>What to expect</h3>
      <ul><li>Guest panels and signing sessions</li><li>Exclusive merch drops on-site</li><li>Community cosplay showcase</li></ul>
      <p>Bring water, bring your camera, and bring your best panel question.</p>
    `,
    imageUrl: `/images/Events/${eventImages[i % eventImages.length]}`,
  };
});

const releasesData = [
  { title: "Neon Requiem — Season 2", releaseType: "anime", fandom: "Anime", category: "Season", status: "upcoming", offset: 30, image: "neon-requiem-season-2.jpg" },
  { title: "Shadow Protocol", releaseType: "game", fandom: "Gaming", category: "Original", status: "upcoming", offset: 75, image: "shadow-protocol.jpg" },
  { title: "The Last Crossover", releaseType: "movie", fandom: "Movies", category: "Original", status: "upcoming", offset: 15, image: "the-last-crossover.jpg" },
  { title: "NOVA9: Orbit — The Album", releaseType: "merch", fandom: "K-Pop", category: "Special", status: "upcoming", offset: 21, image: "orbit-the-album.jpg" },
  { title: "Panel Man #12", releaseType: "comic", fandom: "Comics", category: "Original", status: "upcoming", offset: 9, image: "panel-man-12.jpg" },
  { title: "Detective Kaoru — Finale", releaseType: "show", fandom: "Anime", category: "Season", status: "upcoming", offset: 50, image: "detective-kaoru-finale.jpg" },
  { title: "Realm of Rust: Expansion", releaseType: "game", fandom: "Gaming", category: "Expansion", status: "delayed", offset: 120, image: "realm-of-rust.jpg" },
  { title: "Starlight Cinema Event", releaseType: "movie", fandom: "Movies", category: "Special", status: "released", offset: -20, image: "starlight-cinema-event.jpg" },
  { title: "Idol Doujin Anthology Vol. 3", releaseType: "comic", fandom: "K-Pop", category: "Original", status: "released", offset: -45, image: "idol-doujin-anthology-vol-3.jpg" },
  { title: "Retro Kart Remaster", releaseType: "game", fandom: "Gaming", category: "Reboot", status: "released", offset: -90, image: "retro-kart-remaster.jpg" },
  { title: "Heirs of Themyscira", releaseType: "comic", fandom: "Comics", category: "Sequel", status: "delayed", offset: 200, image: "heirs-of-themyscira.jpg" },
  { title: "Vinyl Legends Box Set", releaseType: "merch", fandom: "Music", category: "Special", status: "upcoming", offset: 40, image: "vinyl-legends-box-set.jpg" },
  { title: "Titan Academy — Final Cour", releaseType: "anime", fandom: "Anime", category: "Sequel", status: "upcoming", offset: 100, image: "titan-academy-final-cour.jpg" },
  { title: "Bloodborne Directors' Cut (Someday™)", releaseType: "game", fandom: "Gaming", category: "Reboot", status: "delayed", offset: 400, image: "bloodborne-directors-cut.jpg" },
  { title: "Midnight matinee: 4K Restoration", releaseType: "movie", fandom: "Movies", category: "Reboot", status: "upcoming", offset: 33, image: "midnight-matinee.jpg" },
  { title: "Choreo Chronicles Docuseries", releaseType: "show", fandom: "K-Pop", category: "Original", status: "upcoming", offset: 66, image: "choreo-chronicles-docuseries.jpg" },
].map((r) => ({
  title: r.title,
  releaseType: r.releaseType,
  fandom: r.fandom,
  category: r.category,
  releaseDate: daysFromNow(r.offset, 12),
  imageUrl: `/images/Releases/${r.image}`,
  status: r.status,
  externalUrl: `https://official.example/${r.releaseType}/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
}));

const merchData = [
  { name: "NOVA9 'Orbit' Tour Hoodie", fandom: "K-Pop", category: "Apparel", tags: ["Limited Edition", "Pre-Order"], isUpcoming: true },
  { name: "Godslayer Leviathan Axe Replica", fandom: "Gaming", category: "Collectibles", tags: ["Collectible", "Limited Edition"], isUpcoming: true },
  { name: "Nine-Tails Chakra Poster Set", fandom: "Anime", category: "Posters", tags: ["Restock"], isUpcoming: false },
  { name: "Spartan-117 Helmet Bookends", fandom: "Gaming", category: "Collectibles", tags: ["Collectible"], isUpcoming: false },
  { name: "Bat-Signal Desk Lamp", fandom: "Movies", category: "Accessories", tags: ["Exclusive"], isUpcoming: false },
  { name: "Wonder Woman Star Studs", fandom: "Comics", category: "Accessories", tags: ["Restock"], isUpcoming: false },
  { name: "Web-Thrower Water Blaster", fandom: "Comics", category: "Collectibles", tags: ["Collectible", "Exclusive"], isUpcoming: true },
  { name: "Aperture Science Mug", fandom: "Gaming", category: "Stationery", tags: ["Restock"], isUpcoming: false },
  { name: "Plush Levi (9in, judgemental)", fandom: "Anime", category: "Plushies", tags: ["Collectible"], isUpcoming: false },
  { name: "Neon Tour Lightstick v2", fandom: "K-Pop", category: "Accessories", tags: ["Pre-Order", "Limited Edition"], isUpcoming: true },
  { name: "Vinyl Nebula Slipmat Set", fandom: "Music", category: "Vinyl", tags: ["Restock"], isUpcoming: false },
  { name: "Championship Whistle Pendant", fandom: "Sports", category: "Accessories", tags: ["Collectible"], isUpcoming: false },
  { name: "Kaiju Kaiju Kaiju Plush Trio", fandom: "Movies", category: "Plushies", tags: ["Collectible", "Exclusive"], isUpcoming: true },
  { name: "Saiyan Gi Training Tee", fandom: "Anime", category: "Apparel", tags: ["Restock"], isUpcoming: false },
  { name: "Tomb Raider Compass Replica", fandom: "Gaming", category: "Collectibles", tags: ["Limited Edition"], isUpcoming: true },
  { name: "Starlight Photo Binder", fandom: "K-Pop", category: "Stationery", tags: ["Pre-Order"], isUpcoming: false },
  { name: "Spidey Skate Deck (Web-White)", fandom: "Comics", category: "Accessories", tags: ["Exclusive"], isUpcoming: false },
  { name: "Stadium Anthem Cassette", fandom: "Music", category: "Vinyl", tags: ["Limited Edition"], isUpcoming: true },
  { name: "Coach's Clipboard Art Print", fandom: "Sports", category: "Posters", tags: ["Restock"], isUpcoming: false },
  { name: "EVA Unit Umbrella (Purple)", fandom: "Anime", category: "Accessories", tags: ["Pre-Order"], isUpcoming: true },
].map((m, i) => {
  const merchImages = [
    "aperture-science-mug.jpg",
    "bat-signal-desk-lamp.jpg",
    "championship-whistle-pendant.jpg",
    "coachs-clipboard-art-print.jpg",
    "eva-unit-umbrella.jpg",
    "godslayer-leviathan-axe-replica.jpg",
    "kaiju-kaiju-kaiju-plush-trio.jpg",
    "neon-tour-lightstick-v2.jpg",
    "nine-tails-chakra-poster-set.jpg",
    "nova9-orbit-tour-hoodie.jpg",
    "plush-levi.jpg",
    "saiyan-gi-training-tee.jpg",
    "spartan-117-helmet-bookends.jpg",
    "spidey-skate-deck.png",
    "stadium-anthem-cassette.jpg",
    "starlight-photo-binder.jpg",
    "tomb-raider-compass-replica.jpg",
    "vinyl-nebula-slipmat-set.jpg",
    "web-thrower-water-blaster.jpg",
    "wonder-woman-star-studs.png",
  ];
  const merchExternalUrls = [
    "https://www.amazon.com/",
    "https://www.etsy.com/",
    "https://www.redbubble.com/",
    "https://www.crunchyroll.com/store",
    "https://www.fangamer.com/",
    "https://www.hottopic.com/",
  ];
  const img = `/images/Merch/${merchImages[i % merchImages.length]}`;
  return {
    name: m.name,
    fandom: m.fandom,
    category: m.category,
    images: [img, img],
    tags: m.tags,
    description: `<p><strong>${m.name}</strong> — an official-grade ${m.category.toLowerCase()} piece for ${m.fandom} fans. Material details, sizing and authenticity card included.</p><p>Showcase item: purchases happen on the official store via the link below.</p>`,
    externalUrl: merchExternalUrls[i % merchExternalUrls.length],
    isUpcoming: m.isUpcoming,
  };
});

const feedbackData = [
  { type: "bug", subject: "Bookmark icon flickers on Safari", message: "When I double-tap the bookmark button on iOS Safari, the icon flickers between states. Repro: iPhone 15, Safari 17, Characters page.", status: "open", rating: 5 },
  { type: "suggestion", subject: "Add dark/light toggle for events map", message: "The map is gorgeous but maybe a darker tile layer for night owls? Keep up the amazing work!", status: "in-progress", rating: 4 },
  { type: "query", subject: "Will there be a mobile app?", message: "Loving the hub! Any plans for a native app or is PWA the plan?", status: "resolved", rating: 3 },
  { type: "bug", subject: "Countdown shows negative days", message: "Releases that just dropped show 'in -2 days' for a few minutes after midnight. Probably a timezone thing.", status: "open", rating: 2 },
  { type: "suggestion", subject: "Near Me radius slider", message: "It would be nice to filter events within X km instead of just sorting by distance.", status: "open", rating: 5 },
  { type: "query", subject: "How do I submit fan fiction?", message: "Is the submissions feature open to everyone? Asking for a friend who writes 40k words of it.", status: "in-progress", rating: 4 },
  { type: "suggestion", subject: "Aura glow on public pages too", message: "The dashboard Aura is so cool. Imagine it on the home page based on trending fandom!", status: "resolved", rating: 5 },
];

const submissionsData = [
  { title: "My Fan continuity where Levi drinks tea", fandom: "Anime", category: "Fan Fiction", status: "pending", body: "A 1,200-word short story where Levi opens a café post-war. Mostly dialogue, very cozy, slight angst in chapter two. Hope you enjoy!" },
  { title: "Gaming Gear Guide: Budget Headsets", fandom: "Gaming", category: "Guides", status: "approved", body: "Three headsets under $50 that survived my rage sessions. Includes mic quality tests, durability notes and one that survived a window (RIP window)." },
  { title: "Photocard Storage Life Hacks", fandom: "K-Pop", category: "Guides", status: "rejected", body: "Binder sleeves, trading etiquette and humidity tips for keeping photocards pristine. Note: rejected for duplicate topic coverage, but great write-up!" },
];

async function seedDatabase() {
  await connectDB();

  console.log("🧹 Clearing existing data…");
  await Promise.all([
    User.deleteMany({}),
    Character.deleteMany({}),
    Article.deleteMany({}),
    Content.deleteMany({}),
    Media.deleteMany({}),
    Event.deleteMany({}),
    Release.deleteMany({}),
    Merch.deleteMany({}),
    Bookmark.deleteMany({}),
    Submission.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  console.log("Seeding users…");
  const users = await User.create(usersData);
  const [admin, demoFan, ayesha, marco, lena] = users;

  console.log("Seeding characters…");
  const characters = await Character.create(charactersData);
  console.log(`   → ${characters.length} characters`);

  console.log("Seeding articles…");
  const articles = await Article.create(articlesData);
  console.log(`   → ${articles.length} articles`);

  console.log("Seeding content…");
  const content = await Content.create(contentData);
  console.log(`   → ${content.length} content items`);

  console.log("Seeding media…");
  const media = await Media.create(mediaData);
  console.log(`   → ${media.length} media items`);

  console.log("Seeding events…");
  const events = await Event.create(eventsData);
  console.log(`   → ${events.length} events`);

  console.log("Seeding releases…");
  const releases = await Release.create(releasesData);
  console.log(`   → ${releases.length} releases`);

  console.log("Seeding merch…");
  const merch = await Merch.create(merchData);
  console.log(`   → ${merch.length} merch items`);

  console.log("Seeding feedback…");
  const feedback = await Feedback.create([
    { ...feedbackData[0], userId: demoFan._id, name: demoFan.name, email: demoFan.email },
    { ...feedbackData[1], userId: ayesha._id, name: ayesha.name, email: ayesha.email },
    { ...feedbackData[2], userId: marco._id, name: marco.name, email: marco.email },
    { ...feedbackData[3], userId: lena._id, name: lena.name, email: lena.email },
    { ...feedbackData[4], name: "Guest", email: "guest1@example.com" },
    { ...feedbackData[5], name: "Guest", email: "guest2@example.com" },
    { ...feedbackData[6], userId: demoFan._id, name: demoFan.name, email: demoFan.email },
  ]);
  console.log(`   → ${feedback.length} feedback entries`);

  console.log("Seeding submissions…");
  const submissions = await Submission.create([
    { ...submissionsData[0], userId: demoFan._id },
    { ...submissionsData[1], userId: marco._id },
    { ...submissionsData[2], userId: demoFan._id },
  ]);
  console.log(`   → ${submissions.length} submissions`);

  console.log("Seeding bookmarks…");
  const bookmarks = await Bookmark.create([
    { userId: demoFan._id, itemType: "character", itemId: characters[0]._id },
    { userId: demoFan._id, itemType: "character", itemId: characters[4]._id },
    { userId: demoFan._id, itemType: "article", itemId: articles[0]._id },
    { userId: demoFan._id, itemType: "article", itemId: articles[2]._id },
    { userId: demoFan._id, itemType: "media", itemId: media[0]._id },
    { userId: demoFan._id, itemType: "merch", itemId: merch[0]._id },
    { userId: demoFan._id, itemType: "merch", itemId: merch[1]._id },
    { userId: ayesha._id, itemType: "character", itemId: characters[11]._id },
    { userId: ayesha._id, itemType: "merch", itemId: merch[9]._id },
    { userId: marco._id, itemType: "article", itemId: articles[1]._id },
  ]);
  console.log(`   → ${bookmarks.length} bookmarks`);

  console.log("Linking character relatedContent…");
  const fandomArticles = (fandom) => articles.filter((a) => a.fandom === fandom);
  const fandomMedia = (fandom) => media.filter((m) => m.fandom === fandom);
  const fandomMerch = (fandom) => merch.filter((m) => m.fandom === fandom);

  for (const ch of characters) {
    const rc = [];
    fandomArticles(ch.fandom).slice(0, 2).forEach((a) => rc.push({ kind: "article", item: a._id }));
    fandomMedia(ch.fandom).slice(0, 2).forEach((m) => rc.push({ kind: "media", item: m._id }));
    fandomMerch(ch.fandom).slice(0, 1).forEach((m) => rc.push({ kind: "merch", item: m._id }));
    if (rc.length) await Character.findByIdAndUpdate(ch._id, { relatedContent: rc });
  }

  console.log("\nDatabase seeded successfully!");
  console.log("──────────────────────────────────────────");
  console.log(`   Users: ${users.length} | Characters: ${characters.length} | Articles: ${articles.length}`);
  console.log(`   Content: ${content.length} | Media: ${media.length} | Events: ${events.length}`);
  console.log(`   Releases: ${releases.length} | Merch: ${merch.length} | Feedback: ${feedback.length}`);
  console.log(`   Submissions: ${submissions.length} | Bookmarks: ${bookmarks.length}`);
  console.log("──────────────────────────────────────────");
  console.log("   Admin: admin@fanhub.com / admin123");
  console.log("   User:  user@fanhub.com / user123");
  console.log("──────────────────────────────────────────\n");

  await mongoose.connection.close();
  process.exit(0);
}

seedDatabase().catch(async (err) => {
  console.error("❌ Seed error:", err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});