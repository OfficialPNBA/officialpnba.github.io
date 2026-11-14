// NPBA admin panel. Edits data/teams.json in the website's GitHub repository.
// Saving commits the file, which rebuilds and republishes the site (about a minute).
// The admin key is a GitHub fine-grained token with Contents read/write on this repository;
// it is kept only in this browser.
(() => {
  const REPO = 'OfficialPNBA/officialpnba.github.io';
  const FILE = 'data/teams.json';
  const API = `https://api.github.com/repos/${REPO}`;
  const KEY = 'npba-admin-key';
  const $ = s => document.querySelector(s);
  const store = {
    get: () => { try { return localStorage.getItem(KEY); } catch { return null; } },
    set: v => { try { localStorage.setItem(KEY, v); localStorage.setItem('npba-admin', '1'); } catch {} },
    clear: () => { try { localStorage.removeItem(KEY); localStorage.removeItem('npba-admin'); } catch {} },
  };
  let token = store.get(), sha = null, saved = [], teams = [], tab = 'all', logos = [];
  fetch('/assets/teams/logos.json', { cache: 'no-store' }).then(r => r.json()).then(l => { logos = l; if (teams.length) render(); }).catch(() => {});

  const gh = (path, opts = {}) => fetch(API + path, { ...opts, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) } });
  const decode = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, '')), c => c.charCodeAt(0)));
  const encode = str => { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b)); return btoa(bin); };
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const confKey = c => /west/i.test(c || '') ? 'west' : /east/i.test(c || '') ? 'east' : '';
  const clean = list => list.map(t => {
    const o = { id: t.id, name: t.name.trim(), abbreviation: (t.abbreviation || '').trim().toUpperCase(), conference: t.conference, color: t.color };
    if (t.logo) o.logo = t.logo;
    o.seed = Number.isFinite(t.seed) ? t.seed : null;
    o.wins = Number.isFinite(t.wins) ? t.wins : 0;
    o.losses = Number.isFinite(t.losses) ? t.losses : 0;
    return o;
  });
  const serialize = list => JSON.stringify(clean(list), null, 2) + '\n';
  const dirty = () => serialize(teams) !== serialize(saved);

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
    render();
  }

  function seedOptions(t) {
    const out = ['<option value="">—</option>'];
    for (let i = 1; i <= 7; i++) out.push(`<option value="${i}"${t.seed === i ? ' selected' : ''}>#${i}</option>`);
    return out.join('');
  }

  function render() {
    const rows = $('[data-rows]');
    const shown = teams.map((t, i) => ({ t, i })).filter(({ t }) => tab === 'all' || confKey(t.conference) === tab)
      .sort((a, b) => (confKey(a.t.conference) === confKey(b.t.conference) ? 0 : confKey(a.t.conference) === 'west' ? -1 : 1) || (a.t.seed ?? 99) - (b.t.seed ?? 99) || a.t.name.localeCompare(b.t.name));
    rows.innerHTML = shown.map(({ t, i }) => `<tr data-i="${i}" class="${confKey(t.conference)}">
      <td><div class="logo-cell"><span class="admin-logo">${t.logo ? `<img src="${esc(t.logo)}" alt="">` : ''}</span><select class="admin-input logo" data-k="logo" aria-label="Logo"><option value="">No logo</option>${logos.map(l => `<option value="${esc(l.logo)}"${l.logo === t.logo ? ' selected' : ''}>${esc(l.name)}</option>`).join('')}${t.logo && !logos.some(l => l.logo === t.logo) ? `<option value="${esc(t.logo)}" selected>Current logo</option>` : ''}</select></div></td>
      <td><input class="admin-input wide" data-k="name" value="${esc(t.name)}" placeholder="Team name" aria-label="Team name"></td>
      <td><input class="admin-input abbr" data-k="abbreviation" value="${esc(t.abbreviation)}" maxlength="4" placeholder="ABC" aria-label="Abbreviation"></td>
      <td><select class="admin-input" data-k="conference" aria-label="Conference"><option value="Western"${confKey(t.conference) === 'west' ? ' selected' : ''}>Western</option><option value="Eastern"${confKey(t.conference) === 'east' ? ' selected' : ''}>Eastern</option></select></td>
      <td><input type="color" class="admin-color" data-k="color" value="${/^#[0-9a-f]{6}$/i.test(t.color || '') ? t.color : '#3a3f47'}" aria-label="Card color"></td>
      <td><select class="admin-input seed" data-k="seed" aria-label="Seed">${seedOptions(t)}</select></td>
      <td><input type="number" min="0" max="99" class="admin-input num" data-k="wins" value="${Number.isFinite(t.wins) ? t.wins : 0}" aria-label="Wins"></td>
      <td><input type="number" min="0" max="99" class="admin-input num" data-k="losses" value="${Number.isFinite(t.losses) ? t.losses : 0}" aria-label="Losses"></td>
      <td><button class="admin-x" data-remove title="Remove team" aria-label="Remove ${esc(t.name)}">✕</button></td></tr>`).join('');
    $('[data-empty]').hidden = shown.length > 0;
    document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === tab)));
    status();
  }

  function problems() {
    const out = [];
    teams.forEach(t => { if (!t.name.trim()) out.push('Every team needs a name.'); });
    for (const c of ['west', 'east']) {
      const seeds = teams.filter(t => confKey(t.conference) === c && Number.isFinite(t.seed)).map(t => t.seed);
      const dup = seeds.find((s, i) => seeds.indexOf(s) !== i);
      if (dup) out.push(`Two ${c === 'west' ? 'Western' : 'Eastern'} teams are both seed #${dup}.`);
      const n = teams.filter(t => confKey(t.conference) === c).length;
      if (n > 7) out.push(`${c === 'west' ? 'Western' : 'Eastern'} has ${n} teams; the standings show 7.`);
    }
    return [...new Set(out)];
  }

  function status() {
    const d = dirty(), p = problems();
    $('[data-save]').disabled = !d || p.some(x => !x.includes('show 7'));
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
      const body = { message: 'Update standings from the admin panel', content: encode(serialize(teams)), sha, branch: 'main' };
      const r = await gh(`/contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
      if (r.status === 409 || r.status === 422) throw new Error('Someone else saved first. Reload the page to get the latest teams, then make your change again.');
      if (!r.ok) throw new Error(`Save failed (GitHub said ${r.status}).`);
      sha = (await r.json()).content.sha;
      saved = structuredClone(clean(teams)); teams = structuredClone(saved);
      render();
      msg($('[data-save-msg]'), 'Saved! The standings page updates in about a minute.', 'ok');
    } catch (e) {
      msg($('[data-save-msg]'), e.message, 'error'); btn.disabled = false;
    }
  }

  // events
  $('[data-signin-form]').addEventListener('submit', e => { e.preventDefault(); signIn(new FormData(e.target).get('key')); });
  $('[data-signout]').addEventListener('click', () => { if (dirty() && !confirm('Sign out without saving your changes?')) return; store.clear(); location.reload(); });
  $('[data-add]').addEventListener('click', () => {
    teams.push({ id: '', name: 'New team', abbreviation: '', conference: tab === 'east' ? 'Eastern' : 'Western', color: '#3a3f47', seed: null, wins: 0, losses: 0 });
    render();
    const inputs = document.querySelectorAll('[data-k="name"]'); const last = [...inputs].find(i => i.value === 'New team'); last?.focus(); last?.select();
  });
  $('[data-revert]').addEventListener('click', () => { teams = structuredClone(saved); render(); });
  $('[data-save]').addEventListener('click', save);
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; render(); }));
  const rows = $('[data-rows]');
  const update = e => {
    const tr = e.target.closest('tr'); const k = e.target.dataset.k; if (!tr || !k) return;
    const t = teams[+tr.dataset.i]; let v = e.target.value;
    if (k === 'seed') v = v === '' ? null : +v;
    if (k === 'wins' || k === 'losses') v = Math.max(0, Math.min(99, parseInt(v, 10) || 0));
    t[k] = v;
    if (k === 'conference' || k === 'seed' || k === 'logo') render(); else status();
  };
  rows.addEventListener('input', e => { if (e.target.tagName !== 'SELECT') update(e); });
  rows.addEventListener('change', update);
  rows.addEventListener('click', e => {
    if (!e.target.closest('[data-remove]')) return;
    const t = teams[+e.target.closest('tr').dataset.i];
    if (confirm(`Remove ${t.name || 'this team'}? It disappears from the site after you save.`)) { teams.splice(teams.indexOf(t), 1); render(); }
  });
  window.addEventListener('beforeunload', e => { if (dirty()) { e.preventDefault(); e.returnValue = ''; } });
  if (location.hash === '#east' || location.hash === '#west') tab = location.hash.slice(1);
  if (token) signIn(token);
})();
