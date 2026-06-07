/**
 * One-command DB setup + seed:
 *   npm run seed
 * Creates the schema (db/schema.sql) and inserts sample data.
 * Reads DB creds from .env. Safe to re-run (clears content tables first).
 */
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
require('dotenv').config()

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
}
const DB = process.env.DB_NAME || 'pac'

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')

  // 1. Run schema (multipleStatements lets us execute the whole file)
  const setup = await mysql.createConnection({ ...cfg, multipleStatements: true })
  await setup.query(schema)
  await setup.end()

  // 2. Connect to the database and seed
  const db = await mysql.createConnection({ ...cfg, database: DB })

  const tables = [
    'events', 'creators', 'blog_posts', 'gallery_items', 'products',
    'testimonials', 'stats', 'team_members', 'partners', 'rsvps',
  ]
  await db.query('SET FOREIGN_KEY_CHECKS = 0')
  for (const t of tables) await db.query(`TRUNCATE TABLE ${t}`)
  await db.query('SET FOREIGN_KEY_CHECKS = 1')

  const img = (seed, w = 800, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`

  // Events
  const events = [
    ['anime-karaoke-night', 'Anime Karaoke Night', 'Music', '2026-06-14 18:00', 'The Mix Cafe, Koregaon Park', img('karaoke'), 'Belt out your favourite openings and endings with fellow fans. Prizes for the best performance!', 'Free entry', null, 0],
    ['cosplay-meetup-summer', 'Summer Cosplay Meetup', 'Cosplay', '2026-06-21 16:00', 'Pune Central, FC Road', img('cosplay1'), 'Bring your best summer cosplays for a photo walk, mini-contest and lots of community vibes.', '₹199', null, 0],
    ['drawing-meetup', 'Anime Drawing Meetup', 'Workshops', '2026-07-05 15:00', 'Pagdandi Books, Baner', img('drawing'), 'Sketch together, swap techniques and learn manga-style inking from community artists.', 'Free entry', null, 0],
    ['anime-music-night', 'Anime Music Night', 'Music', '2026-07-19 19:00', 'High Spirits, Koregaon Park', img('musicnight'), 'A live DJ set of anime OSTs, J-pop and city-pop. Dance the night away with the community.', '₹299', null, 0],
    ['manga-workshop', 'Manga Storytelling Workshop', 'Workshops', '2026-08-02 14:00', 'Online (Zoom)', img('manga'), 'Learn paneling, pacing and character design from a published manga artist.', '₹149', null, 0],
    ['convention-trip-comiccon', 'Comic Con Trip', 'Conventions', '2026-08-23 08:00', 'Mumbai (group travel from Pune)', img('comiccon'), 'Travel together to Comic Con with the PAC crew. Group passes, transport and after-party.', '₹1,499', null, 0],
    ['winter-cosplay-2025', 'Winter Cosplay Carnival', 'Cosplay', '2025-12-20 16:00', 'Phoenix Marketcity', img('winter'), 'Our biggest cosplay event yet with 300+ attendees and a full contest stage.', null, 320, 1],
    ['anime-quiz-night-2025', 'Anime Quiz Night', 'Meetups', '2025-11-08 18:30', 'Doolally Taproom', img('quiz'), 'Teams battled across five rounds of anime trivia. Intense, hilarious and unforgettable.', null, 90, 1],
    ['amv-screening-2025', 'Community AMV Screening', 'Screenings', '2025-10-12 17:00', 'The Box, Aundh', img('amv'), 'We screened the best community-made AMVs on the big screen with an audience vote.', null, 120, 1],
    ['monsoon-meetup-2025', 'Monsoon Anime Meetup', 'Meetups', '2025-07-27 16:00', 'German Bakery, KP', img('monsoon'), 'Chai, pakoras and endless anime debates on a rainy Pune afternoon.', null, 65, 1],
  ]
  await db.query(
    'INSERT INTO events (slug, title, category, start_at, venue, image, excerpt, price, attendance, is_past) VALUES ?',
    [events]
  )

  // Creators + cosplayers
  const creators = [
    ['aarya-ink', 'Aarya Ink', 'creator', 'Artists', null, 'Open', img('aarya', 300, 300), img('aaryacover', 800, 400), 'Digital illustrator obsessed with shonen color palettes and dynamic poses. Commissions open.', JSON.stringify({ instagram: 'https://instagram.com', behance: 'https://behance.net' }), 1],
    ['rohan-cuts', 'Rohan Cuts', 'creator', 'Editors', null, 'Open', img('rohan', 300, 300), img('rohancover', 800, 400), 'AMV editor and motion designer. Award-winning edits with buttery transitions.', JSON.stringify({ youtube: 'https://youtube.com', instagram: 'https://instagram.com' }), 1],
    ['mira-voice', 'Mira Voice', 'creator', 'Voice Actors', null, 'Closed', img('mira', 300, 300), img('miracover', 800, 400), 'Voice artist dubbing fan-projects and original anime shorts in Hindi and English.', JSON.stringify({ instagram: 'https://instagram.com' }), 1],
    ['kenji-beats', 'Kenji Beats', 'creator', 'Musicians', null, 'Open', img('kenji', 300, 300), img('kenjicover', 800, 400), 'Lo-fi and city-pop producer making anime-inspired tracks. Spotify verified.', JSON.stringify({ spotify: 'https://spotify.com', youtube: 'https://youtube.com' }), 0],
    ['lens-by-sam', 'Lens by Sam', 'creator', 'Photographers', null, 'Open', img('sam', 300, 300), img('samcover', 800, 400), 'Cosplay & convention photographer capturing the magic of every shoot.', JSON.stringify({ instagram: 'https://instagram.com' }), 0],
    ['tara-streams', 'Tara Streams', 'creator', 'Streamers', null, 'Closed', img('tara', 300, 300), img('taracover', 800, 400), 'Variety streamer playing anime games and hosting weekly watch-alongs.', JSON.stringify({ youtube: 'https://youtube.com', instagram: 'https://instagram.com' }), 0],
    ['zoro-by-dev', 'Dev as Zoro', 'cosplayer', 'Shonen', 'Advanced', null, img('zoro', 300, 300), img('zorocover', 800, 400), 'Three years of cosplay, specialising in sword props and armor builds.', JSON.stringify({ instagram: 'https://instagram.com' }), 1],
    ['nezuko-by-isha', 'Isha as Nezuko', 'cosplayer', 'Demon Slayer', 'Intermediate', null, img('nezuko', 300, 300), img('nezukocover', 800, 400), 'Makeup-focused cosplayer who loves bringing soft characters to life.', JSON.stringify({ instagram: 'https://instagram.com' }), 1],
    ['gojo-by-arnav', 'Arnav as Gojo', 'cosplayer', 'Jujutsu Kaisen', 'Advanced', null, img('gojo', 300, 300), img('gojocover', 800, 400), 'Wig styling specialist and contest regular.', JSON.stringify({ instagram: 'https://instagram.com' }), 0],
    ['marin-by-priya', 'Priya as Marin', 'cosplayer', 'Dress-Up Darling', 'Intermediate', null, img('marin', 300, 300), img('marincover', 800, 400), 'Sewing her own costumes from scratch. Loves teaching beginners.', JSON.stringify({ instagram: 'https://instagram.com' }), 0],
  ]
  await db.query(
    'INSERT INTO creators (slug, name, kind, specialty, level, commissions, avatar, cover, bio, socials, featured) VALUES ?',
    [creators]
  )

  // Blog
  const posts = [
    ['best-anime-cafes-pune', 'Best Anime Cafes in Pune', 'Culture', 'Riya D.', '2026-05-12', img('cafe', 800, 450), 'From themed lattes to manga shelves — our roundup of Pune spots every otaku should visit.', 'Pune has quietly become a great city for anime fans looking for a cozy spot to hang out. In this guide we walk through our favourite cafes that lean into anime culture — whether through decor, events or just a manga-friendly vibe.\n\nEach of these spots has hosted (or would happily host) a PAC meetup. Grab a friend, order something matcha, and settle in.'],
    ['beginners-guide-cosplay', "A Beginner's Guide to Cosplay", 'Cosplay', 'Isha', '2026-04-28', img('cosguide', 800, 450), 'Thinking about your first cosplay? Here is everything we wish we knew when we started.', 'Cosplay can feel intimidating at first, but it is one of the most rewarding parts of fandom. Start with a character you love and a budget you are comfortable with.\n\nThis guide covers picking your first character, where to source materials in Pune, basic wig care, and how to feel confident at your first event.'],
    ['top-anime-of-the-season', 'Top Anime of the Season', 'Recommendations', 'Karan M.', '2026-04-10', img('season', 800, 450), 'Our community voted — here are the shows everyone is watching this season.', 'Every season the PAC community runs a poll for the most-watched and most-loved anime. The results are in, and there are a few surprises this time around.\n\nWe break down the top five, why people love them, and where to start if you are jumping in late.'],
    ['pac-winter-recap', 'PAC Winter Carnival Recap', 'Events', 'Vivek T.', '2026-01-05', img('recap', 800, 450), 'A look back at our biggest cosplay event yet — 320 attendees and one unforgettable stage.', 'The Winter Cosplay Carnival was our largest event to date. We had a full contest stage, an artist alley, food stalls and a photo zone that stayed busy all day.\n\nThank you to every volunteer, cosplayer and attendee who made it special. Here is the recap and a few of our favourite moments.'],
  ]
  await db.query(
    'INSERT INTO blog_posts (slug, title, category, author, published_at, image, excerpt, body) VALUES ?',
    [posts]
  )

  // Gallery
  const cats = ['Cosplay', 'Meetups', 'Conventions', 'Workshops', 'Music Events', 'Community']
  const gallery = Array.from({ length: 18 }).map((_, i) => [
    cats[i % cats.length],
    `https://picsum.photos/seed/gal${i + 1}/600/${i % 3 === 0 ? 800 : 500}`,
  ])
  await db.query('INSERT INTO gallery_items (category, src) VALUES ?', [gallery])

  // Products
  const products = [
    ['pac-tee', 'PAC Logo Tee', 'Apparel', '₹699', img('tee', 500, 500), 'Best Seller'],
    ['pac-hoodie', 'Neon Senpai Hoodie', 'Apparel', '₹1,499', img('hoodie', 500, 500), 'Limited'],
    ['sticker-pack', 'Anime Sticker Pack', 'Stickers', '₹199', img('stickers', 500, 500), null],
    ['wall-poster', 'Manga Panel Poster', 'Posters', '₹349', img('poster', 500, 500), null],
    ['keychain', 'PAC Chibi Keychain', 'Accessories', '₹149', img('keychain', 500, 500), null],
    ['event-band', 'Event Wristband', 'Accessories', '₹99', img('band', 500, 500), null],
    ['wallpaper-pack', 'Digital Wallpaper Pack', 'Digital', '₹0', img('wallpaper', 500, 500), 'Free'],
    ['art-print', 'Community Art Print', 'Posters', '₹299', img('print', 500, 500), null],
  ]
  await db.query('INSERT INTO products (slug, name, category, price, image, tag) VALUES ?', [products])

  // Testimonials
  const testimonials = [
    ['Sneha P.', 'Cosplayer', img('sneha', 120, 120), 'PAC helped me meet amazing anime fans and gave me the confidence to start cosplaying.'],
    ['Aditya R.', 'Artist', img('aditya', 120, 120), 'I found my whole creative circle here. The meetups feel like coming home every time.'],
    ['Fatima K.', 'Member', img('fatima', 120, 120), 'From quiz nights to conventions, PAC events are always the highlight of my month.'],
  ]
  await db.query('INSERT INTO testimonials (name, role, avatar, quote) VALUES ?', [testimonials])

  // Stats
  const stats = [
    ['Community Members', '10,000+', 1],
    ['Events Hosted', '100+', 2],
    ['Cosplayers Connected', '500+', 3],
    ['Collaborations', '50+', 4],
  ]
  await db.query('INSERT INTO stats (label, value, sort_order) VALUES ?', [stats])

  // Team
  const team = [
    ['Karan M.', 'Founder', 'Founders', img('karan', 240, 240)],
    ['Ananya S.', 'Co-Founder', 'Founders', img('ananya', 240, 240)],
    ['Vivek T.', 'Events Lead', 'Event Team', img('vivek', 240, 240)],
    ['Riya D.', 'Creative Lead', 'Creative Team', img('riya', 240, 240)],
    ['Sahil J.', 'Community Manager', 'Admin Team', img('sahil', 240, 240)],
    ['Neha G.', 'Volunteer Lead', 'Volunteer Team', img('neha', 240, 240)],
  ]
  await db.query('INSERT INTO team_members (name, role, team_group, avatar) VALUES ?', [team])

  // Partners
  const partners = [['Comic Con India'], ['Crunchyroll'], ['Local Cafe Co.'], ['Pune Makers'], ['AnimeStore.in'], ['CosplayHub']]
  await db.query('INSERT INTO partners (name) VALUES ?', [partners])

  await db.end()
  console.log('✓ Database "%s" created and seeded.', DB)
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
