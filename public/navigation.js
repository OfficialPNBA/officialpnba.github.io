const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('.main-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');menu?.setAttribute('aria-label','Open navigation');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const expanded=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(expanded));menu.setAttribute('aria-label',expanded?'Close navigation':'Open navigation');nav.classList.toggle('is-open',expanded);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.header'))closeMenu();});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.dialog);if(dialog&&!dialog.open)dialog.showModal();}));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',event=>{const r=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
});
document.querySelectorAll('[data-filter-region]').forEach(region=>{
  let category='all';
  const items=[...region.querySelectorAll('[data-filter-item]')];
  const search=region.querySelector('[data-search]');
  const week=region.querySelector('select[data-week]');
  const empty=region.querySelector('.empty-state');
  const noResults=region.querySelector('[data-no-results]');
  function filter(){
    const query=(search?.value||'').trim().toLowerCase();let visible=0;
    for(const item of items){const matches=(category==='all'||item.dataset.category===category)&&(!query||(item.dataset.searchValue||item.textContent).toLowerCase().includes(query))&&(!week||week.value==='all'||item.dataset.week===week.value);item.hidden=!matches;if(matches)visible++;}
    const filtering=category!=='all'||query||(week&&week.value!=='all');
    if(noResults)noResults.hidden=visible>0||(!items.length&&!filtering);
    if(empty)empty.hidden=Boolean(filtering);
  }
  region.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.filter;region.querySelectorAll('[data-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});filter();}));
  search?.addEventListener('input',filter);week?.addEventListener('change',filter);
  region.querySelector('[data-reset]')?.addEventListener('click',()=>{if(search)search.value='';if(week)week.value='all';region.querySelector('[data-filter="all"]')?.click();});
});
document.querySelector('[data-timezone]')?.addEventListener('change',event=>{const timeZone=event.target.value==='local'?Intl.DateTimeFormat().resolvedOptions().timeZone:event.target.value;document.querySelectorAll('[data-time]').forEach(time=>{time.textContent=new Intl.DateTimeFormat('en-US',{timeZone,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(time.dataset.time));});});

document.querySelectorAll('[data-standings]').forEach(board=>{
  const buttons=[...board.querySelectorAll('[data-conf]')];const views=[...board.querySelectorAll('[data-conf-view]')];
  function show(key){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.conf===key)));views.forEach(v=>v.hidden=v.dataset.confView!==key);try{history.replaceState(null,'','#'+key);}catch{}}
  buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.conf)));
  const start=location.hash.slice(1);if(buttons.some(b=>b.dataset.conf===start))show(start);
});
// Show admin-only controls (Edit Standings) to signed-in admins on this browser.
try{if(localStorage.getItem('npba-admin'))document.querySelectorAll('[data-admin-only]').forEach(el=>el.hidden=false);}catch{}
// Locked pages (Schedule, Media, League Rules, Transactions): public sees a lock screen; signed-in admins are taken to the real page.
try{if(localStorage.getItem('npba-admin')){const S='/staff-7q4k2x/';
  document.querySelectorAll('a[data-locked]').forEach(a=>{a.href=S+a.dataset.locked+'/';});
  const lp=document.querySelector('[data-locked-page]');if(lp)location.replace(S+lp.dataset.lockedPage+'/'+location.hash);}}catch{}
// Standings: hover (mouse) previews a team's roster; click/tap pins it open (one open at a time).
(()=>{const cards=[...document.querySelectorAll('.seed-card[aria-controls]')];if(!cards.length)return;
  const canHover=matchMedia('(hover:hover) and (pointer:fine)').matches;
  const drawerOf=c=>document.getElementById(c.getAttribute('aria-controls'));
  const set=(c,open,pinned)=>{const d=drawerOf(c);if(!d)return;c.setAttribute('aria-expanded',String(open));c.dataset.pinned=open&&pinned?'1':'';d.hidden=!open;c.closest('.seed-row')?.classList.toggle('open',open);};
  const closeOthers=c=>cards.forEach(o=>{if(o!==c&&o.getAttribute('aria-expanded')==='true')set(o,false);});
  cards.forEach(card=>{const row=card.closest('.seed-row');let tOpen,tClose;
    const toggle=()=>{clearTimeout(tOpen);clearTimeout(tClose);const isOpen=card.getAttribute('aria-expanded')==='true',pinned=card.dataset.pinned==='1';
      if(isOpen&&pinned){set(card,false);return;}closeOthers(card);set(card,true,true);};
    card.addEventListener('click',toggle);
    card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
    if(canHover&&row){
      row.addEventListener('mouseenter',()=>{clearTimeout(tClose);if(card.getAttribute('aria-expanded')==='true')return;
        tOpen=setTimeout(()=>{if(cards.some(o=>o!==card&&o.dataset.pinned==='1'))return;closeOthers(card);set(card,true,false);},260);});
      row.addEventListener('mouseleave',e=>{if(e.relatedTarget?.closest?.('.dc-menu'))return;clearTimeout(tOpen);if(card.dataset.pinned==='1')return;tClose=setTimeout(()=>{if(card.dataset.pinned!=='1')set(card,false);},220);});
    }});
})();
// Standings spotlight: show the next card on each page load (cycles through all of them).
(()=>{const cards=[...document.querySelectorAll('[data-spotlight]')];if(cards.length<2)return;
  let n;try{n=(parseInt(localStorage.getItem('npba-spotlight')||'-1',10)+1)%cards.length;localStorage.setItem('npba-spotlight',String(n));}catch{n=Math.floor(Math.random()*cards.length);}
  if(!Number.isFinite(n))n=0;cards.forEach((c,i)=>c.hidden=i!==n);})();

// Players page: sort dropdown (Alphabetical / By Ranked Team / Free Agents) + search
(()=>{const root=document.querySelector('[data-players]');if(!root)return;
  const sel=root.querySelector('[data-pview-select]'),q=root.querySelector('[data-search]'),none=root.querySelector('[data-pnone]');
  try{const saved=localStorage.getItem('npba-pview');if(saved&&sel.querySelector(`option[value="${saved}"]`))sel.value=saved;}catch{}
  const apply=()=>{const v=sel.value,term=(q?.value||'').trim().toLowerCase();let shown=0;
    root.querySelectorAll('[data-pview]').forEach(view=>{const on=view.dataset.pview===v;view.hidden=!on;if(!on)return;
      view.querySelectorAll('.player-card,[data-rp-search]').forEach(c=>{const m=!term||(c.dataset.searchValue||c.dataset.rpSearch||'').toLowerCase().includes(term);c.hidden=!m;if(m)shown++;});
      view.querySelectorAll('[data-pgroup]').forEach(g=>{g.hidden=!!term&&!g.querySelector('.player-card:not([hidden]),[data-rp-search]:not([hidden])');});});
    if(none)none.hidden=!(term&&!shown);};
  sel.addEventListener('change',()=>{try{localStorage.setItem('npba-pview',sel.value)}catch{}apply();});
  q?.addEventListener('input',apply);apply();})();
(()=>{let menu,cur;
  const close=()=>{if(menu)menu.hidden=true;cur?.classList.remove('is-open');cur=null;};
  const open=(el,x,y)=>{if(!menu){menu=document.createElement('div');menu.className='dc-menu';menu.setAttribute('role','menu');menu.hidden=true;
      menu.innerHTML='<a role="menuitem" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2Z" transform="translate(-2 0)"/></svg><span>Message On Discord</span></a>';
      document.body.appendChild(menu);menu.addEventListener('click',close);
      menu.addEventListener('mouseleave',e=>{const row=cur?.closest('.seed-row');if(!row||row.contains(e.relatedTarget))return;close();row.dispatchEvent(new MouseEvent('mouseleave',{relatedTarget:e.relatedTarget}));});}
    close();cur=el;el.classList.add('is-open');
    menu.querySelector('a').href='https://discord.com/users/'+el.dataset.discordId;
    menu.hidden=false;const w=menu.offsetWidth,h=menu.offsetHeight;
    menu.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+'px';menu.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+'px';
    menu.querySelector('a').focus({preventScroll:true});};
  const at=el=>{const r=el.getBoundingClientRect();return[r.left,r.bottom+6];};
  document.addEventListener('contextmenu',e=>{const el=e.target.closest?.('.dc-mention');if(!el)return;e.preventDefault();open(el,e.clientX,e.clientY);});
  document.addEventListener('click',e=>{const el=e.target.closest?.('.dc-mention');if(el){e.preventDefault();e.stopPropagation();if(cur===el)return close();open(el,...at(el));return;}if(menu&&!menu.contains(e.target))close();},true);
  document.addEventListener('keydown',e=>{const el=e.target.closest?.('.dc-mention');if(el&&(e.key==='Enter'||e.key===' '||e.key==='ContextMenu')){e.preventDefault();open(el,...at(el));}else if(e.key==='Escape')close();});
  addEventListener('scroll',close,{passive:true});addEventListener('resize',close);})();
// Leaderboards: Season Totals / Per Game tabs + "Show all" on each card
(()=>{const root=document.querySelector('[data-leaderboards]');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-lb-tab]')];
  const pick=k=>{tabs.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lbTab===k)));root.querySelectorAll('[data-lb-view]').forEach(v=>v.hidden=v.dataset.lbView!==k);try{localStorage.setItem('rnba-lb-tab',k)}catch{}};
  tabs.forEach(b=>b.addEventListener('click',()=>pick(b.dataset.lbTab)));
  try{const s=localStorage.getItem('rnba-lb-tab');if(s==='season'||s==='game')pick(s);}catch{}
  root.addEventListener('click',e=>{const b=e.target.closest('[data-lb-more]');if(!b)return;const open=b.getAttribute('aria-expanded')!=='true';
    b.closest('.lb-card').querySelectorAll('[data-lb-extra]').forEach(li=>li.hidden=!open);b.setAttribute('aria-expanded',String(open));
    b.textContent=open?'Show top 5':`Show all ${b.closest('.lb-card').querySelectorAll('.lb-row').length}`;});})();
// Transactions: Release Feed / Signings Feed tabs, sort, search, and live 72-hour release-lock countdowns.
(()=>{const root=document.querySelector('[data-tx]');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-tx-tab]')],q=root.querySelector('[data-search]'),none=root.querySelector('[data-tx-none]');
  let cur='release';try{const s=localStorage.getItem('rnba-tx-tab');if(s==='signings'||s==='release')cur=s;}catch{}
  const view=k=>root.querySelector(`[data-tx-view="${k}"]`);
  const sorters={latest:(a,b)=>Date.parse(b.dataset.signed)-Date.parse(a.dataset.signed),oldest:(a,b)=>Date.parse(a.dataset.signed)-Date.parse(b.dataset.signed),
    soonest:(a,b)=>(+a.dataset.unlock)-(+b.dataset.unlock),
    available:(a,b)=>{const n=Date.now(),ra=+a.dataset.unlock<=n,rb=+b.dataset.unlock<=n;return ra!==rb?(ra?-1:1):(+a.dataset.unlock)-(+b.dataset.unlock);},
    team:(a,b)=>a.dataset.team.localeCompare(b.dataset.team)||a.dataset.name.localeCompare(b.dataset.name),name:(a,b)=>a.dataset.name.localeCompare(b.dataset.name)};
  const apply=()=>{tabs.forEach(t=>t.setAttribute('aria-selected',String(t.dataset.txTab===cur)));
    root.querySelectorAll('[data-tx-view]').forEach(v=>v.hidden=v.dataset.txView!==cur);
    root.querySelectorAll('[data-tx-sortwrap]').forEach(v=>v.hidden=v.dataset.txSortwrap!==cur);
    const v=view(cur),list=v.querySelector('[data-tx-list]'),sel=root.querySelector(`[data-tx-sort="${cur}"]`);
    const cards=[...list.children];cards.sort(sorters[sel.value]||sorters.latest).forEach(c=>list.appendChild(c));
    const term=(q?.value||'').trim().toLowerCase();let shown=0;
    cards.forEach(c=>{const m=!term||(c.dataset.searchValue||'').toLowerCase().includes(term);c.hidden=!m;if(m)shown++;});
    if(none)none.hidden=!(term&&!shown);};
  tabs.forEach(t=>t.addEventListener('click',()=>{cur=t.dataset.txTab;try{localStorage.setItem('rnba-tx-tab',cur)}catch{}apply();}));
  root.querySelectorAll('[data-tx-sort]').forEach(s=>{try{const v=localStorage.getItem('rnba-tx-sort-'+s.dataset.txSort);if(v&&s.querySelector(`option[value="${v}"]`))s.value=v;}catch{}
    s.addEventListener('change',()=>{try{localStorage.setItem('rnba-tx-sort-'+s.dataset.txSort,s.value)}catch{}apply();});});
  q?.addEventListener('input',apply);
  const pad=n=>String(n).padStart(2,'0');
  const tick=()=>{const now=Date.now();root.querySelectorAll('.tx-status[data-unlock]').forEach(st=>{const left=+st.dataset.unlock-now,card=st.closest('.tx-card');
    if(left>0){const s=Math.floor(left/1e3);st.querySelector('.tx-clock').textContent=`${pad(Math.floor(s/3600))}:${pad(Math.floor(s/60)%60)}:${pad(s%60)}`;st.querySelector('.tx-label').textContent='Release lock';card.classList.remove('is-open');}
    else{const days=Math.floor((now-Date.parse(card.dataset.signed))/864e5);st.querySelector('.tx-label').textContent='Available For Release';st.querySelector('.tx-clock').textContent=`${days} day${days===1?'':'s'} on team`;card.classList.add('is-open');}});};
  apply();tick();setInterval(tick,1000);})();
