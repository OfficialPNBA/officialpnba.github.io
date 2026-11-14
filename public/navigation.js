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
// Standings: click/tap a team card to open its roster and latest media (one open at a time).
document.querySelectorAll('.seed-card[aria-controls]').forEach(card=>{
  const toggle=()=>{const drawer=document.getElementById(card.getAttribute('aria-controls'));if(!drawer)return;const open=card.getAttribute('aria-expanded')!=='true';
    document.querySelectorAll('.seed-card[aria-expanded="true"]').forEach(c=>{if(c!==card){c.setAttribute('aria-expanded','false');const d=document.getElementById(c.getAttribute('aria-controls'));if(d)d.hidden=true;c.closest('.seed-row')?.classList.remove('open');}});
    card.setAttribute('aria-expanded',String(open));drawer.hidden=!open;card.closest('.seed-row')?.classList.toggle('open',open);};
  card.addEventListener('click',toggle);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
});
// Standings spotlight: show the next card on each page load (cycles through all of them).
(()=>{const cards=[...document.querySelectorAll('[data-spotlight]')];if(cards.length<2)return;
  let n;try{n=(parseInt(localStorage.getItem('npba-spotlight')||'-1',10)+1)%cards.length;localStorage.setItem('npba-spotlight',String(n));}catch{n=Math.floor(Math.random()*cards.length);}
  if(!Number.isFinite(n))n=0;cards.forEach((c,i)=>c.hidden=i!==n);})();
