// NPBA admin panel. Edits data/teams.json in the website's GitHub repository.
// Saving commits the file, which rebuilds and republishes the site (about a minute).
// The admin key is a GitHub fine-grained token with Contents read/write on this repository;
// it is kept only in this browser.
(() => {
  const REPO = 'OfficialPNBA/officialpnba.github.io';
  // ?league=2 edits the second (red logo) league's standings.
  const LEAGUE = new URLSearchParams(location.search).get('league') === '2' ? 2 : 1;
  const FILE = LEAGUE === 2 ? 'data/teams-2.json' : 'data/teams.json';
  document.querySelectorAll('[data-league-pick]').forEach(a => { if (+a.dataset.leaguePick === LEAGUE) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelectorAll('[data-league-standings]').forEach(a => { a.href = LEAGUE === 2 ? '/league-2/standings/' : '/standings/'; });
  const API = `https://api.github.com/repos/${REPO}`;
  const KEY = 'npba-admin-key';
  const $ = s => document.querySelector(s);
  const store = {
    get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
    set: v => { try { localStorage.setItem(KEY, v); localStorage.setItem('npba-admin', '1'); } catch {} },
    clear: () => { try { localStorage.removeItem(KEY); localStorage.removeItem('npba-admin'); } catch {} },
  };
  let token = store.get(), sha = null, saved = [], teams = [], logos = [];
  let pSha = null, pSaved = [], players = [], section = 'teams', pQuery = '';
  const PFILE = 'data/players.json';
  const MAX = 14; // one Super Conference of 14 teams
  fetch('/assets/teams/logos.json', { cache: 'no-store' }).then(r => r.json()).then(l => { logos = l; if (teams.length) render(); }).catch(() => {});

  const gh = (path, opts = {}) => fetch(API + path, { ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) } });
  const decode = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));
  const encode = str => { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); };
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = list => list.map(t => {
    const o = { id: t.id, name: t.name.trim(), abbreviation: (t.abbreviation || '').trim().toUpperCase(), conference: 'Super', color: t.color, primary: t.primary || '#ffffff', secondary: t.secondary || '#cccccc' };
    if (t.logo) o.logo = t.logo;
    o.seed = Number.isFinite(t.seed) ? t.seed : null;
    o.wins = Number.isFinite(t.wins) ? t.wins : 0;
    o.losses = Number.isFinite(t.losses) ? t.losses : 0;
    return o;
  });
  const serialize = list => JSON.stringify(clean(list), null, 2) + '\n';
  const pClean = list => list.map(p => {
    const o = { id: p.id, name: String(p.name || '').trim(), teamId: p.teamId || null };
    if (p.position) o.position = String(p.position).trim().toUpperCase();
    if (p.headshot) o.headshot = p.headshot;
    ['overall', 'gp', 'min'].forEach(k => { const v = parseInt(p[k], 10); if (Number.isFinite(v) && v >= 0) o[k] = v; });
    if (p.number !== '' && p.number != null) o.number = String(p.number).trim();
    if (!o.teamId && p.formerTeamId) o.formerTeamId = p.formerTeamId;
    if (p.owner) o.owner = true;
    if (p.coach) o.coach = true;
    if (p.captain) o.captain = true;
    { const u = String(p.roblox || '').replace(/^@/, '').trim(); if (u) o.roblox = u; }
    if (p.lineup === 'starter' || p.lineup === 'bench') o.lineup = p.lineup;
    return o;
  });
  const pSerialize = list => JSON.stringify(pClean(list), null, 2) + '\n';
  const teamsDirty = () => serialize(teams) !== serialize(saved);
  const pendingShots = new Map(); // player object -> {base64, preview}
  const playersDirty = () => pendingShots.size > 0 || pSerialize(players) !== pSerialize(pSaved);
  // shrink an uploaded picture to a 160x160 square (top-centred) webp
  const toHeadshot = file => new Promise((res, rej) => {
    const img = new Image(); img.onload = () => {
      const S = 160, c = document.createElement('canvas'); c.width = c.height = S;
      const side = Math.min(img.width, img.height), sx = (img.width - side) / 2, sy = img.height > img.width ? 0 : (img.height - side) / 2;
      c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, S, S);
      const url = c.toDataURL('image/webp', 0.88); URL.revokeObjectURL(img.src);
      res({ preview: url, base64: url.split(',')[1], ext: url.startsWith('data:image/webp') ? 'webp' : 'png' });
    }; img.onerror = () => rej(new Error('That file is not a picture I can read.')); img.src = URL.createObjectURL(file);
  });
  const dirty = () => teamsDirty() || playersDirty();

  function msg(el, text, kind = '') { el.textContent = text; el.dataset.kind = kind; }

  async function signIn(key) {
    token = key.trim();
    const m = $('[data-signin-msg]');
    msg(m, 'Checking key…');
    try {
      const r = await gh('');
      if (!r.ok) throw new Error(r.status === 401 ? 'That key was not accepted.' : `GitHub said ${r.status}.`);
      const repo = await r.json();
      if (!repo.permissions?.push) throw new Error('That key can view the site but cannot edit it.');
      store.set(token);
      await load();
      $('[data-signin]').hidden = true;
      $('[data-app]').hidden = false;
    } catch (e) {
      token = null; store.clear();
      msg(m, e.message || 'Could not sign in.', 'error');
      $('[data-signin]').hidden = false;
      $('[data-app]').hidden = true;
    }
  }

  async function load() {
    const r = await gh(`/contents/${FILE}?ref=main`, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Could not load teams (${r.status}).`);
    const f = await r.json();
    sha = f.sha;
    saved = JSON.parse(decode(f.content) || '[]');
    teams = structuredClone(saved);
    const pr = await gh(`/contents/${PFILE}?ref=main`, { cache: 'no-store' });
    if (pr.status === 404) { pSha = null; pSaved = []; }
    else if (!pr.ok) throw new Error(`Could not load players (${pr.status}).`);
    else { const pf = await pr.json(); pSha = pf.sha; pSaved = JSON.parse(decode(pf.content) || '[]'); }
    players = structuredClone(pSaved);
    render(); renderPlayers();
  }

  function renderPlayers() {
    const rows = $('[data-player-rows]');
    const q = pQuery.trim().toLowerCase();
    const tname = id => teams.find(t => t.id === id)?.name || '';
    const shown = players.map((p, i) => ({ p, i }))
      .filter(({ p }) => !q || [p.name, tname(p.teamId), tname(p.formerTeamId), p.teamId ? '' : 'free agent'].join(' ').toLowerCase().includes(q))
      .sort((a, b) => (a.p.teamId ? 0 : 1) - (b.p.teamId ? 0 : 1) || tname(a.p.teamId).localeCompare(tname(b.p.teamId)) || a.p.name.localeCompare(b.p.name));
    const teamOpts = p => `<option value="">Free Agent</option>${[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(t => `<option value="${esc(t.id)}"${t.id === p.teamId ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}`;
    rows.innerHTML = shown.map(({ p, i }) => `<tr data-pi="${i}">
      <td><input class="admin-input wide" data-pk="name" value="${esc(p.name)}" placeholder="Display name" aria-label="Display name"><input class="admin-input wide rbx" data-pk="roblox" value="${esc(p.roblox || '')}" placeholder="@Roblox username" aria-label="Roblox username"></td>
      <td><select class="admin-input team" data-pk="teamId" aria-label="Team">${teamOpts(p)}</select></td>
      <td><label class="shot-cell" title="Upload headshot"><span class="admin-shot">${pendingShots.get(p) ? `<img src="${pendingShots.get(p).preview}" alt="">` : p.headshot ? `<img src="${esc(p.headshot)}" alt="">` : '+'}</span><input type="file" accept="image/*" data-pshot hidden aria-label="Upload headshot"></label></td>
      <td><input class="admin-input pos" data-pk="position" value="${esc(p.position || '')}" maxlength="14" placeholder="PG/SG" aria-label="Positions"></td>
      <td><input type="number" min="0" max="99" class="admin-input num" data-pk="overall" value="${esc(p.overall ?? '')}" placeholder="–" aria-label="Overall"></td>
      <td><input type="number" min="0" max="999" class="admin-input num" data-pk="gp" value="${esc(p.gp ?? '')}" placeholder="0" aria-label="Games played"></td>
      <td><input type="number" min="0" max="99999" class="admin-input num wide-num" data-pk="min" value="${esc(p.min ?? '')}" placeholder="0" aria-label="Minutes played"></td>
      <td><div class="role-cell"><label class="role-chk"><input type="checkbox" data-pk="owner"${p.owner ? ' checked' : ''}> Owner</label><label class="role-chk"><input type="checkbox" data-pk="coach"${p.coach ? ' checked' : ''}> Coach</label><label class="role-chk"><input type="checkbox" data-pk="captain"${p.captain ? ' checked' : ''}> Captain</label><select class="admin-input lineup" data-pk="lineup" aria-label="Starter or bench"><option value="">—</option><option value="starter"${p.lineup === 'starter' ? ' selected' : ''}>Starter</option><option value="bench"${p.lineup === 'bench' ? ' selected' : ''}>Bench</option></select></div></td>
      <td><input class="admin-input num" data-pk="number" value="${esc(p.number ?? '')}" maxlength="3" placeholder="0" aria-label="Number"></td>
      <td>${p.teamId ? '<span class="pill signed">Signed</span>' : `<span class="pill fa">Free Agent</span>${p.formerTeamId && tname(p.formerTeamId) ? `<small class="former">formerly ${esc(tname(p.formerTeamId))}</small>` : ''}`}</td>
      <td><button class="admin-x" data-premove title="Remove player" aria-label="Remove ${esc(p.name)}">✕</button></td></tr>`).join('');
    $('[data-player-empty]').hidden = players.length > 0;
    status();
  }

  function seedOptions(t) {
    const out = ['<option value="">—</option>'];
    for (let i = 1; i <= Math.max(MAX, teams.length); i++) out.push(`<option value="${i}"${t.seed === i ? ' selected' : ''}>#${i}</option>`);
    return out.join('');
  }

  function render() {
    const rows = $('[data-rows]');
    const shown = teams.map((t, i) => ({ t, i }))
      .sort((a, b) => (a.t.seed ?? 99) - (b.t.seed ?? 99) || a.t.name.localeCompare(b.t.name));
    rows.innerHTML = shown.map(({ t, i }) => `<tr data-i="${i}">
      <td><div class="logo-cell"><span class="admin-logo">${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ''}</span><select class="admin-input logo" data-k="logo" aria-label="Logo"><option value="">No logo</option>${logos.map(l => `<option value="${esc(l.logo)}"${l.logo === t.logo ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}${t.logo && !logos.some(l => l.logo === t.logo) ? `<option value="${esc(t.logo)}" selected>Current logo</option>` : ''}</select></div></td>
      <td><input class="admin-input wide" data-k="name" value="${esc(t.name)}" placeholder="Team name" aria-label="Team name"></td>
      <td><input class="admin-input abbr" data-k="abbreviation" value="${esc(t.abbreviation)}" maxlength="4" placeholder="ABC" aria-label="Abbreviation"></td>
      <td><input type="color" class="admin-color" data-k="color" value="${/^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : '#3a3f47'}" aria-label="Card color"></td>
      <td><span class="admin-pair"><input type="color" class="admin-color" data-k="primary" value="${/^#[0-9a-f]{6}$/i.test(t.primary || '') ? t.primary : '#ffffff'}" aria-label="Name color 1"><input type="color" class="admin-color" data-k="secondary" value="${/^#[0-9a-f]{6}$/i.test(t.secondary || '') ? t.secondary : '#cccccc'}" aria-label="Name color 2"></span></td>
      <td><select class="admin-input seed" data-k="seed" aria-label="Seed">${seedOptions(t)}</select></td>
      <td><input type="number" min="0" max="99" class="admin-input num" data-k="wins" value="${Number.isFinite(t.wins) ? t.wins : 0}" aria-label="Wins"></td>
      <td><input type="number" min="0" max="99" class="admin-input num" data-k="losses" value="${Number.isFinite(t.losses) ? t.losses : 0}" aria-label="Losses"></td>
      <td><button class="admin-x" data-remove title="Remove team" aria-label="Remove ${esc(t.name)}">✕</button></td></tr>`).join('');
    $('[data-empty]').hidden = shown.length > 0;
    status();
  }

  function problems() {
    const out = [];
    teams.forEach(t => { if (!t.name.trim()) out.push('Every team needs a name.'); });
    players.forEach(p => { if (!String(p.name || '').trim()) out.push('Every player needs a name.'); });
    const seeds = teams.filter(t => Number.isFinite(t.seed)).map(t => t.seed);
    const dup = seeds.find((s, i) => seeds.indexOf(s) !== i);
    if (dup) out.push(`Two teams are both seed #${dup}.`);
    if (teams.length > MAX) out.push(`There are ${teams.length} teams; the standings are set up for ${MAX}.`);
    return [...new Set(out)];
  }

  function status() {
    const d = dirty(), p = problems();
    $('[data-save]').disabled = !d || p.some(x => !x.includes('set up for'));
    $('[data-revert]').disabled = !d;
    msg($('[data-save-msg]'), p.length ? p.join(' ') : d ? 'You have unsaved changes.' : 'No unsaved changes.', p.length ? 'error' : d ? 'warn' : '');
  }

  async function save() {
    const btn = $('[data-save]'); btn.disabled = true;
    msg($('[data-save-msg]'), 'Saving…');
    try {
      // ids follow names for new teams; keep existing ids stable
      const used = new Set();
      teams.forEach(t => { if (!t.id) { let id = slug(t.name), n = 2; while (used.has(id) || teams.some(o => o !== t && o.id === id)) id = `${slug(t.name)}-${n++}`; t.id = id; } used.add(t.id); });
      if (teamsDirty()) {
        const body = { message: 'Update standings from the admin panel', content: encode(serialize(teams)), sha, branch: 'main' };
        const r = await gh(`/contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
        if (r.status === 409 || r.status === 422) throw new Error('Someone else saved first. Reload the page to get the latest teams, then make your change again.');
        if (!r.ok) throw new Error(`Save failed (GitHub said ${r.status}).`);
        sha = (await r.json()).content.sha;
        saved = structuredClone(clean(teams)); teams = structuredClone(saved);
      }
      if (playersDirty()) {
        const ids = new Set();
        players.forEach(p => { if (!p.id) { let id = slug(p.name), n = 2; while (ids.has(id) || players.some(o => o !== p && o.id === id)) id = `${slug(p.name)}-${n++}`; p.id = id; } ids.add(p.id); });
        for (const [p, shot] of pendingShots) {
          const path = `public/assets/headshots/${p.id}.${shot.ext}`;
          const cur = await gh(`/contents/${path}?ref=main`);
          const b = { message: `Headshot for ${p.name}`, content: shot.base64, branch: 'main' };
          if (cur.ok) b.sha = (await cur.json()).sha;
          const r = await gh(`/contents/${path}`, { method: 'PUT', body: JSON.stringify(b) });
          if (!r.ok) throw new Error(`Uploading ${p.name}'s headshot failed (GitHub said ${r.status}).`);
          p.headshot = `/assets/headshots/${p.id}.${shot.ext}?v=${Date.now().toString(36)}`;
          pendingShots.delete(p);
        }
        const body = { message: 'Update players from the admin panel', content: encode(pSerialize(players)), branch: 'main' };
        if (pSha) body.sha = pSha;
        const r = await gh(`/contents/${PFILE}`, { method: 'PUT', body: JSON.stringify(body) });
        if (r.status === 409 || r.status === 422) throw new Error('Someone else saved players first. Reload the page, then make your change again.');
        if (!r.ok) throw new Error(`Saving players failed (GitHub said ${r.status}).`);
        pSha = (await r.json()).content.sha;
        pSaved = structuredClone(pClean(players)); players = structuredClone(pSaved);
      }
      render(); renderPlayers();
      msg($('[data-save-msg]'), 'Saved! The standings page updates in about a minute.', 'ok');
    } catch (e) {
      msg($('[data-save-msg]'), e.message, 'error'); btn.disabled = false;
    }
  }

  // events
  $('[data-signin-form]').addEventListener('submit', e => { e.preventDefault(); signIn(new FormData(e.target).get('key')); });
  $('[data-signout]').addEventListener('click', () => { if (dirty() && !confirm('Sign out without saving your changes?')) return; store.clear(); location.reload(); });
  $('[data-add]').addEventListener('click', () => {
    teams.push({ id: '', name: 'New team', abbreviation: '', conference: 'Super', color: '#3a3f47', primary: '#ffffff', secondary: '#cccccc', seed: null, wins: 0, losses: 0 });
    render();
    const inputs = document.querySelectorAll('[data-k="name"]'); const last = [...inputs].find(i => i.value === 'New team'); last?.focus(); last?.select();
  });
  $('[data-revert]').addEventListener('click', () => { pendingShots.clear(); teams = structuredClone(saved); players = structuredClone(pSaved); render(); renderPlayers(); });
  const showSection = key => { section = key; document.querySelectorAll('[data-section]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.section === key))); document.querySelectorAll('[data-section-view]').forEach(v => v.hidden = v.dataset.sectionView !== key); $('[data-add]').hidden = key !== 'teams'; };
  document.querySelectorAll('[data-section]').forEach(b => b.addEventListener('click', () => showSection(b.dataset.section)));
  $('[data-player-search]').addEventListener('input', e => { pQuery = e.target.value; renderPlayers(); });
  $('[data-add-player]').addEventListener('click', () => {
    players.push({ id: '', name: '', teamId: null });
    pQuery = ''; $('[data-player-search]').value = ''; renderPlayers();
    const empty = [...document.querySelectorAll('[data-pk="name"]')].find(i => !i.value); empty?.focus();
  });
  const prows = $('[data-player-rows]');
  const pUpdate = e => {
    const tr = e.target.closest('tr'); const k = e.target.dataset.pk; if (!tr || !k) return;
    const p = players[+tr.dataset.pi];
    if (k === 'teamId') { const v = e.target.value || null; if (!v && p.teamId) p.formerTeamId = p.teamId; if (v) delete p.formerTeamId; p.teamId = v; renderPlayers(); return; }
    if (k === 'owner' || k === 'coach' || k === 'captain') { p[k] = e.target.checked; status(); return; }
    if (k === 'lineup') { p.lineup = e.target.value || null; status(); return; }
    p[k] = e.target.value; status();
  };
  prows.addEventListener('input', e => { if (e.target.tagName !== 'SELECT' && e.target.type !== 'checkbox') pUpdate(e); });
  prows.addEventListener('change', async e => {
    if (e.target.matches('[data-pshot]')) {
      const f = e.target.files[0]; if (!f) return;
      try { pendingShots.set(players[+e.target.closest('tr').dataset.pi], await toHeadshot(f)); renderPlayers(); }
      catch (err) { msg($('[data-save-msg]'), err.message, 'error'); }
      return;
    }
    if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') pUpdate(e);
  });
  prows.addEventListener('click', e => {
    if (!e.target.closest('[data-premove]')) return;
    const p = players[+e.target.closest('tr').dataset.pi];
    if (confirm(`Remove ${p.name || 'this player'} from the player index? To make them a free agent instead, set their team to Free Agent.`)) { pendingShots.delete(p); players.splice(players.indexOf(p), 1); renderPlayers(); }
  });
  $('[data-save]').addEventListener('click', save);
  const rows = $('[data-rows]');
  const update = e => {
    const tr = e.target.closest('tr'); const k = e.target.dataset.k; if (!tr || !k) return;
    const t = teams[+tr.dataset.i]; let v = e.target.value;
    if (k === 'seed') v = v === '' ? null : +v;
    if (k === 'wins' || k === 'losses') v = Math.max(0, Math.min(99, parseInt(v, 10) || 0));
    t[k] = v;
    if (k === 'seed' || k === 'logo') render(); else status();
  };
  rows.addEventListener('input', e => { if (e.target.tagName !== 'SELECT') update(e); });
  rows.addEventListener('change', update);
  rows.addEventListener('click', e => {
    if (!e.target.closest('[data-remove]')) return;
    const t = teams[+e.target.closest('tr').dataset.i];
    if (confirm(`Remove ${t.name || 'this team'}? It disappears from the site after you save.`)) { teams.splice(teams.indexOf(t), 1); render(); }
  });
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  if (token) signIn(token);
})();
