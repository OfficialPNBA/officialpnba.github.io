import { readFileSync } from 'node:fs';
// Publish confirmed league information only.
export const league = { name:'NPBA', fullName:'National Practical Basketball Association', discordUrl:null, robloxUrl:null };
// Teams live in data/teams.json so the Admin page (/admin/) can edit and save them.
// Team: { id, name, abbreviation, conference ('Super'), logo, color ('#hex' card color),
//        seed (number or null for blank), wins, losses (numbers; when set they replace records from games) }
export const teams = JSON.parse(readFileSync(new URL('./teams.json', import.meta.url), 'utf8'));
// Players live in data/players.json (edited from /admin/). Player: { id, name, teamId (null = free agent),
//   position, number, formerTeamId (last team, shown for free agents) }
export const players = JSON.parse(readFileSync(new URL('./players.json', import.meta.url), 'utf8'));
// One NPBA Super Conference: 14 teams. Seeds 1-6 Playoffs, 7-10 Play-In, 11-14 Out Of Playoffs.
export const standingsFormat = { teamsPerConference:14, playoffSpots:6, playInSpots:4 };
// Game: { id, week, homeId, awayId, tipoff (ISO with offset), status,
//         homeScore, awayScore, replayUrl }. Status: scheduled | final | postponed.
export const games = [];
// Post: league-insider style message shown at the top of Media (message above, picture below).
// { id, name, handle (no @), avatar, date ('YYYY-MM-DD'), text (wrap words in **double stars** to bold them), image, imageAlt,
//   teamIds: [] (optional: teams this post is about; team/player names in the text are matched too) }
export const posts = [
  { id:'welcome-post', name:'Spitboy', handle:'spitboy', avatar:'/assets/media/spitboy.webp', date:'2026-11-14',
    text:'Welcome To The **League**! Media Will Provide **Storylines**, **League Updates**, and Other Information to Keep Up With the **Season**. I look Forward to Provide **Game Articles**, **Power Rankings**, and Even Show some of the **Insane Season Stats**. Who Will Win **Awards**? Who Will Become the **Biggest League Villain**? **What will Happen Next?**',
    image:'/assets/media/welcome-post.webp', imageAlt:'NPBA logo' }
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
  { id:'welcome-to-npba', title:'A new home for the game.', category:'Announcements',
    summary:'Meet the new NPBA league hub. The competition, the community, and every next possession — in one place.',
    image:'/assets/npba-logo.png', body:[
      'Welcome to the official home of the National Practical Basketball Association, a Practical Basketball league on Roblox.',
      'This is your place to follow the standings, find upcoming matchups, catch league coverage, and keep up with roster moves. Official teams, schedules, and results will appear as they are published.',
      'The new gold, silver, and black NPBA badge leads the way. Find it in Brand assets, ready to download with a transparent background.'
    ]
  },
  { id:'official-npba-badge', title:'The mark of our league.', category:'Brand assets',
    summary:'The official NPBA badge. Gold basketball, silver lettering, and a transparent background.',
    image:'/assets/npba-logo.png', download:'/assets/npba-logo.png' }
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
