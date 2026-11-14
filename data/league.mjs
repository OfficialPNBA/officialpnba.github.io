// Publish confirmed league information only.
export const league = { name:'NPBA', fullName:'National Practical Basketball Association', discordUrl:null, robloxUrl:null };
// Team: { id, name, abbreviation, conference, logo, officialRank }
export const teams = [];
// Game: { id, week, homeId, awayId, tipoff (ISO with offset), status,
//         homeScore, awayScore, replayUrl }. Status: scheduled | final | postponed.
export const games = [];
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
