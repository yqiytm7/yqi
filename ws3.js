(function(){
var css=document.createElement('style');css.textContent='#edf,#prf{position:fixed!important;left:-9999px!important;right:auto!important;top:auto!important;bottom:0!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;overflow:hidden!important}'
+'#tlf{position:fixed;right:14px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:75;width:48px;height:48px;border-radius:50%;border:0;background:var(--acc,#3D6B22);color:var(--onacc,#fff);display:none;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.28);cursor:pointer;padding:0;transition:transform .18s}'
+'#tlf:active{transform:scale(.93)}#tlf svg{width:22px;height:22px}'
+'#tlp{position:fixed;right:14px;bottom:calc(74px + env(safe-area-inset-bottom,0px));z-index:75;display:none;flex-direction:column;gap:6px;background:var(--card,#fff);border:1px solid var(--line,#D8E2D0);border-radius:14px;padding:6px;box-shadow:0 12px 32px rgba(0,0,0,.25);min-width:170px}'
+'#tlp.on{display:flex}#tlp button{display:flex;align-items:center;gap:10px;border:0;background:transparent;color:var(--ink,#13261A);font:600 14px/1 system-ui,sans-serif;padding:13px 12px;border-radius:9px;cursor:pointer;text-align:left}#tlp button:hover{background:rgba(125,184,46,.16)}#tlp svg{width:18px;height:18px;flex:none}'
+'body.edon #tlf{background:#13261A;color:#CBEA7A}@media print{#tlf,#tlp{display:none!important}}';
document.head.appendChild(css);
var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';
var fab=document.createElement('button');fab.id='tlf';fab.setAttribute('aria-label','Tools');fab.innerHTML=ICON+'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
var pop=document.createElement('div');pop.id='tlp';
document.body.appendChild(fab);document.body.appendChild(pop);
function vis(id){var e=document.getElementById(id);return !!e&&getComputedStyle(e).display!=='none'}
function wdoc(){var w=null;var a=document.getElementById('app');if(!a||a.className!=='insp')return null;document.querySelectorAll('iframe').forEach(function(f){try{var d=f.contentDocument;if(d&&d.getElementById('yqWLb'))w=d}catch(e){}});return w}
function sync(){var ed=vis('edf')&&!document.body.classList.contains('oninsp'),pr=vis('prf'),wd=wdoc(),wl=!!wd,wa=wl&&!!wd.getElementById('yqWcard')&&!document.body.classList.contains('yqro');
 var on=document.body.classList.contains('edon');
 pop.innerHTML=(ed?'<button data-t="ed">'+ICON+'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>'+(on?'Done editing':'Edit')+'</button>':'')+(pr?'<button data-t="pr">'+ICON+'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 21h8M12 16v5"/></svg>Presentation</button>':'')+(wl?'<button data-t="wl">'+ICON+'<path d="M9 5h10M9 12h10M9 19h10"/><circle cx="4.5" cy="5" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="19" r="1"/></svg>Wastage list</button>':'')+(wa?'<button data-t="wa">'+ICON+'<path d="M12 5v14M5 12h14"/></svg>Add wastage</button>':'');
 fab.style.display=(ed||pr||wl)?'flex':'none';if(!(ed||pr||wl))pop.classList.remove('on')}
var last='';setInterval(function(){var k=[vis('edf'),vis('prf'),document.body.className,!!wdoc()].join('|');if(k!==last){last=k;sync()}},400);sync();
fab.addEventListener('click',function(e){e.stopPropagation();sync();pop.classList.toggle('on')});
pop.addEventListener('click',function(e){e.stopPropagation();var b=e.target.closest('button');if(!b)return;pop.classList.remove('on');var t=b.dataset.t;if(t==='wl'){var d=wdoc(),x=d&&d.getElementById('yqWLb');if(x)x.click();return}if(t==='wa'){if(window.yqGoWastage)window.yqGoWastage();return}var el=document.getElementById(t==='ed'?'edf':'prf');if(el)el.click()});
document.addEventListener('click',function(e){if(!e.target.closest('#tlf,#tlp'))pop.classList.remove('on')},true);
})();