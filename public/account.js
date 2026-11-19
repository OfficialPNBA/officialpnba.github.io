// RNBA accounts: the only way to make an account / sign in is "Connect with Discord".
// Uses Discord's browser sign-in (OAuth2 implicit grant, scope "identify"), so no server or secret is needed.
(()=>{
const CLIENT_ID='1555729173744722041'; // Discord app "NPBA Official Helper"
const KEY='rnba-account', STATE='rnba-discord-state';
const redirect=location.origin+'/account/';
const get=()=>{try{const a=JSON.parse(localStorage.getItem(KEY)||'null');if(a&&a.id)return a;}catch{}return null;};
const save=a=>{try{localStorage.setItem(KEY,JSON.stringify(a));}catch{}};
const clear=()=>{try{localStorage.removeItem(KEY);}catch{}};
const avatar=a=>a.avatar?`https://cdn.discordapp.com/avatars/${a.id}/${a.avatar}.${a.avatar.startsWith('a_')?'gif':'png'}?size=128`:`https://cdn.discordapp.com/embed/avatars/${Number((BigInt(a.id)>>22n)%6n)}.png`;
const name=a=>a.global_name||a.username;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function login(){
  const state=crypto.getRandomValues(new Uint32Array(4)).join('-');
  try{sessionStorage.setItem(STATE,state);sessionStorage.setItem('rnba-return',new URLSearchParams(location.search).get('next')||'');}catch{}
  location.href='https://discord.com/oauth2/authorize?'+new URLSearchParams({client_id:CLIENT_ID,response_type:'token',redirect_uri:redirect,scope:'identify',state,prompt:'none'});
}
window.rnbaAccount={get,login,signOut(){clear();location.href='/account/';}};
// Header button: "Sign in" or the member's Discord avatar + name.
function paintHeader(){const a=get();document.querySelectorAll('[data-account-link]').forEach(el=>{
  if(a){el.classList.add('signed-in');el.innerHTML=`<img src="${esc(avatar(a))}" alt="" width="24" height="24"><span>${esc(name(a))}</span>`;el.setAttribute('aria-label',`Your account: ${name(a)}`);}
});}
paintHeader();
const box=document.querySelector('[data-account]');if(!box)return;
const view=s=>box.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.dataset.view!==s);
const msg=box.querySelector('[data-account-msg]');
box.querySelectorAll('[data-discord-login]').forEach(b=>b.addEventListener('click',login));
box.querySelector('[data-signout]')?.addEventListener('click',()=>{clear();location.replace('/account/');});
function showProfile(a){view('profile');box.querySelector('[data-avatar]').src=avatar(a);box.querySelector('[data-name]').textContent=name(a);box.querySelector('[data-username]').textContent='@'+a.username;
  box.querySelector('[data-since]').textContent=new Date(Number((BigInt(a.id)>>22n)+1420070400000n)).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
  box.querySelector('[data-joined]').textContent=new Date(a.joined||Date.now()).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});}
const h=new URLSearchParams(location.hash.slice(1));
if(h.get('access_token')||h.get('error')){
  history.replaceState(null,'',location.pathname);
  let want=null;try{want=sessionStorage.getItem(STATE);sessionStorage.removeItem(STATE);}catch{}
  if(h.get('error')){view('signin');if(h.get('error')==='access_denied'){msg.textContent='Discord sign-in was cancelled. Click the button to try again.';}else msg.textContent='Discord could not sign you in ('+h.get('error')+'). Please try again.';return;}
  if(!want||want!==h.get('state')){view('signin');msg.textContent='That sign-in link expired. Please click Connect with Discord again.';return;}
  view('loading');
  fetch('https://discord.com/api/users/@me',{headers:{Authorization:'Bearer '+h.get('access_token')}}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(u=>{
    const old=get();const a={id:u.id,username:u.username,global_name:u.global_name||'',avatar:u.avatar||'',joined:old?.id===u.id&&old.joined?old.joined:Date.now()};
    save(a);paintHeader();let back='';try{back=sessionStorage.getItem('rnba-return')||'';sessionStorage.removeItem('rnba-return');}catch{}
    if(back&&back.startsWith('/')&&!back.startsWith('//')){location.replace(back);return;}showProfile(a);
  }).catch(()=>{view('signin');msg.textContent='We couldn’t reach Discord. Please try again in a moment.';});
}else{const a=get();a?showProfile(a):view('signin');}
})();
