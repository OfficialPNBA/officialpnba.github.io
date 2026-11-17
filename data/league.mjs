import { readFileSync } from 'node:fs';
// Publish confirmed league information only.
export const league = { name:'RNBA', fullName:'Roblox National Basketball Association', discordUrl:'https://discord.gg/officialrnba', robloxUrl:null };
// Teams live in data/teams.json so the Admin page (/admin/) can edit and save them.
// Team: { id, name, abbreviation, conference ('Super'), logo, color ('#hex' card color),
//        seed (number or null for blank), wins, losses (numbers; when set they replace records from games) }
export const teams = JSON.parse(readFileSync(new URL('./teams.json', import.meta.url), 'utf8'));
// Players live in data/players.json (edited from /admin/). Player: { id, name, teamId (null = free agent),
//   position, number, formerTeamId (last team, shown for free agents),
//   owner (true = Franchise Owner), coach (true = Head Coach), lineup ('starter' | 'bench' | null) }
export const players = JSON.parse(readFileSync(new URL('./players.json', import.meta.url), 'utf8'));
// Red RNBA league (league 2) players, from the S15 Mastersheet. Edited from /admin/?league=2.
export const players2 = JSON.parse(readFileSync(new URL('./players-2.json', import.meta.url), 'utf8'));
// One RNBA Super Conference: 14 teams. Seeds 1-6 Playoffs, 7-10 Play-In, 11-14 Out Of Playoffs.
export const standingsFormat = { teamsPerConference:14, playoffSpots:6, playInSpots:4 };
// Red RNBA league: 10 teams. Seeds 1-7 playoffs, 8-9 play-in, 10 out.
export const standingsFormat2 = { teamsPerConference:10, playoffSpots:7, playInSpots:2 };
// Game: { id, week, homeId, awayId, tipoff (ISO with offset), status,
//         homeScore, awayScore, replayUrl }. Status: scheduled | final | postponed.
// Listed in order: first team shown on the left (awayId), second on the right (homeId). No tipoff = time TBA.
export const games = [
  { id:'w1-g1', week:1, awayId:'golden-state-warriors', homeId:'memphis-grizzlies', status:'scheduled' },
  { id:'w1-g2', week:1, awayId:'cleveland-cavaliers', homeId:'houston-rockets', status:'scheduled' },
  { id:'w1-g3', week:1, awayId:'oklahoma-city-thunder', homeId:'philadelphia-76ers', status:'scheduled' },
  { id:'w1-g4', week:1, awayId:'minnesota-timberwolves', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w1-g5', week:1, awayId:'chicago-bulls', homeId:'denver-nuggets', status:'scheduled' },
  { id:'w1-g6', week:1, awayId:'brooklyn-nets', homeId:'boston-celtics', status:'scheduled' },
  { id:'w1-g7', week:1, awayId:'miami-heat', homeId:'new-york-knicks', status:'scheduled' },
  { id:'w2-g1', week:2, awayId:'memphis-grizzlies', homeId:'houston-rockets', status:'scheduled' },
  { id:'w2-g2', week:2, awayId:'oklahoma-city-thunder', homeId:'golden-state-warriors', status:'scheduled' },
  { id:'w2-g3', week:2, awayId:'cleveland-cavaliers', homeId:'minnesota-timberwolves', status:'scheduled' },
  { id:'w2-g4', week:2, awayId:'chicago-bulls', homeId:'philadelphia-76ers', status:'scheduled' },
  { id:'w2-g5', week:2, awayId:'brooklyn-nets', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w2-g6', week:2, awayId:'denver-nuggets', homeId:'miami-heat', status:'scheduled' },
  { id:'w2-g7', week:2, awayId:'boston-celtics', homeId:'new-york-knicks', status:'scheduled' },
  { id:'w3-g1', week:3, awayId:'oklahoma-city-thunder', homeId:'memphis-grizzlies', status:'scheduled' },
  { id:'w3-g2', week:3, awayId:'houston-rockets', homeId:'minnesota-timberwolves', status:'scheduled' },
  { id:'w3-g3', week:3, awayId:'golden-state-warriors', homeId:'chicago-bulls', status:'scheduled' },
  { id:'w3-g4', week:3, awayId:'brooklyn-nets', homeId:'cleveland-cavaliers', status:'scheduled' },
  { id:'w3-g5', week:3, awayId:'philadelphia-76ers', homeId:'miami-heat', status:'scheduled' },
  { id:'w3-g6', week:3, awayId:'new-york-knicks', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w3-g7', week:3, awayId:'boston-celtics', homeId:'denver-nuggets', status:'scheduled' },
  { id:'w4-g1', week:4, awayId:'minnesota-timberwolves', homeId:'memphis-grizzlies', status:'scheduled' },
  { id:'w4-g2', week:4, awayId:'oklahoma-city-thunder', homeId:'chicago-bulls', status:'scheduled' },
  { id:'w4-g3', week:4, awayId:'houston-rockets', homeId:'brooklyn-nets', status:'scheduled' },
  { id:'w4-g4', week:4, awayId:'miami-heat', homeId:'golden-state-warriors', status:'scheduled' },
  { id:'w4-g5', week:4, awayId:'cleveland-cavaliers', homeId:'new-york-knicks', status:'scheduled' },
  { id:'w4-g6', week:4, awayId:'philadelphia-76ers', homeId:'boston-celtics', status:'scheduled' },
  { id:'w4-g7', week:4, awayId:'denver-nuggets', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w5-g1', week:5, awayId:'memphis-grizzlies', homeId:'chicago-bulls', status:'scheduled' },
  { id:'w5-g2', week:5, awayId:'minnesota-timberwolves', homeId:'brooklyn-nets', status:'scheduled' },
  { id:'w5-g3', week:5, awayId:'oklahoma-city-thunder', homeId:'miami-heat', status:'scheduled' },
  { id:'w5-g4', week:5, awayId:'houston-rockets', homeId:'new-york-knicks', status:'scheduled' },
  { id:'w5-g5', week:5, awayId:'boston-celtics', homeId:'golden-state-warriors', status:'scheduled' },
  { id:'w5-g6', week:5, awayId:'cleveland-cavaliers', homeId:'denver-nuggets', status:'scheduled' },
  { id:'w5-g7', week:5, awayId:'philadelphia-76ers', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w6-g1', week:6, awayId:'brooklyn-nets', homeId:'memphis-grizzlies', status:'scheduled' },
  { id:'w6-g2', week:6, awayId:'chicago-bulls', homeId:'miami-heat', status:'scheduled' },
  { id:'w6-g3', week:6, awayId:'minnesota-timberwolves', homeId:'new-york-knicks', status:'scheduled' },
  { id:'w6-g4', week:6, awayId:'oklahoma-city-thunder', homeId:'boston-celtics', status:'scheduled' },
  { id:'w6-g5', week:6, awayId:'houston-rockets', homeId:'denver-nuggets', status:'scheduled' },
  { id:'w6-g6', week:6, awayId:'golden-state-warriors', homeId:'portland-trail-blazers', status:'scheduled' },
  { id:'w6-g7', week:6, awayId:'cleveland-cavaliers', homeId:'philadelphia-76ers', status:'scheduled' },
];
// Post: league-insider style message shown at the top of Media (message above, picture below).
// { id, name, handle (no @), avatar, date ('YYYY-MM-DD'), text (wrap words in **double stars** to bold them), image, imageAlt,
//   teamIds: [] (optional: teams this post is about; team/player names in the text are matched too) }
export const posts = [
  { id:'welcome-post', name:'Spitboy', handle:'spitboy', avatar:'/assets/media/spitboy.webp', date:'2026-11-14',
    text:'Welcome To The **League**! Media Will Provide **Storylines**, **League Updates**, and Other Information to Keep Up With the **Season**. I look Forward to Provide **Game Articles**, **Power Rankings**, and Even Show some of the **Insane Season Stats**. Who Will Win **Awards**? Who Will Become the **Biggest League Villain**? **What will Happen Next?**',
    image:'/assets/media/welcome-post.webp', imageAlt:'RNBA logo' }
];
// Standings spotlight: one card shows beside the standings and it rotates to the next one on every page refresh.
// { id, player, teamId, image, look: 'fire' | 'stinker' | 'dnp',
//   stats: { pts, ast, reb, min, to } (any can be left out), opponentId (team they played, or missed for 'dnp'), date ('YYYY-MM-DD') }
export const spotlights = [
  { id:'spitboy-56', player:'Spitboy', teamId:'minnesota-sabers', image:'/assets/spotlight/spitboy.webp', look:'fire',
    opponentId:'boston-rebels', date:'2026-11-13', stats:{ pts:56, ast:10, reb:7, min:28, to:0 } },
  { id:'spitboy-zero', player:'Spitboy', teamId:'minnesota-sabers', image:'/assets/spotlight/spitboy.webp', look:'stinker',
    opponentId:'chicago-vortex', date:'2026-11-12', stats:{ pts:0, ast:0, reb:1, to:5 } },
  { id:'spitboy-dnp', player:'Spitboy', teamId:'minnesota-sabers', image:'/assets/spotlight/spitboy.webp', look:'dnp',
    opponentId:'washington-griffins', date:'2026-11-11' }
];
// Article: { id, title, category, summary, image, body, url, download }
export const media = [
  { id:'welcome-to-rnba', title:'A new home for the game.', category:'Announcements',
    summary:'Meet the new RNBA league hub. The competition, the community, and every next possession — in one place.',
    image:'/assets/rnba-logo.png', body:[
      'Welcome to the official home of the Roblox National Basketball Association, a basketball league on Roblox.',
      'This is your place to follow the standings, find upcoming matchups, catch league coverage, and keep up with roster moves. Official teams, schedules, and results will appear as they are published.',
      'The new red, white, and blue RNBA badge leads the way. Find it in Brand assets, ready to download with a transparent background.'
    ]
  },
  { id:'official-rnba-badge', title:'The mark of our league.', category:'Brand assets',
    summary:'The official RNBA badge. Red, white, and blue on a black shield, with a transparent background.',
    image:'/assets/rnba-logo.png', download:'/assets/rnba-logo.png' }
];
// Transaction: { id, title, type, date, teamIds, players, summary,
//                received: [{ teamId, assets: [] }] }
// Type: Trade | Signing | Release | Other.
export const transactions = [];
// Home page banner: players shown in panels around the logo, listed from the
// logo outward and alternating left/right. Image goes in public/assets/banner/.
// Player: { team, image, color }. An odd count adds a "next franchise" teaser panel.
export const bannerPlayers = [
  // Order: left side inner → outer, then right side inner → outer. scale = size relative to a standing player.
  { team:'Chicago Vortex', image:'/assets/banner/vortex.webp', color:'#22d3c5', side:'left', scale:1 },
  { team:'Minnesota Sabers', image:'/assets/banner/sabers.webp', color:'#8b4cf0', side:'left', scale:1 },
  { team:'Los Angeles Ember', image:'/assets/banner/ember.webp', color:'#f06a1f', side:'left', scale:1 },
  { team:'Charlotte Knights', image:'/assets/banner/knights.webp', color:'#1fbf6a', side:'right', scale:1 },
  { team:'Sin City Vice', image:'/assets/banner/vice.webp', color:'#e0233a', side:'right', scale:.9, shift:1 },
  { team:'Phoenix Redrocks', image:'/assets/banner/redrocks.webp', color:'#e0482a', side:'right', scale:.95, shift:1.5 }
];
// Homepage hub: the leagues on the revolving logo carousel (front to back).
// logo: image path (null shows a "coming soon" placeholder badge). href: where "Enter" goes (null = not open yet).
export const hubLeagues = [
  { id:'rnba', name:'RNBA', fullName:'Roblox National Basketball Association', logo:'/assets/rnba-logo.png', href:'/standings/', color:'#f5b632', discordUrl:'https://discord.gg/k3NgzhHYrb', discordName:'Roblox National Basketball Association™ (Practical Basketball)', discordBanner:null },
  { id:'league-2', name:'RNBA', fullName:'Roblox National Basketball Association', logo:'/assets/league2-logo.png', href:'/league-2/standings/', color:'#e5262b', discordUrl:'https://discord.gg/officialrnba', discordName:'RNBA™ (Season 15)', discordBanner:'/assets/discord-banner.webp' },
];
