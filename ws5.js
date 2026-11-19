(function(){
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var css=document.createElement('style');css.textContent=
'.gxp,.gxo{fill:none;pointer-events:none;stroke-linecap:round;animation-duration:2.6s;animation-iteration-count:infinite;animation-timing-function:linear;animation-play-state:paused}'
+'.gxp{animation-name:gxrun}.gxo{animation-name:gxorb;animation-duration:3.4s}'
+'@keyframes gxrun{from{stroke-dashoffset:14}to{stroke-dashoffset:-86}}@keyframes gxorb{from{stroke-dashoffset:0}to{stroke-dashoffset:-100}}'
+'.gxd{transform-box:fill-box;transform-origin:center;animation:gxpop 2.2s ease-in-out infinite;animation-play-state:paused}@keyframes gxpop{0%,100%{transform:scale(1)}50%{transform:scale(1.55)}}'
+'.gxb{animation:gxbr 2.8s ease-in-out infinite alternate;animation-play-state:paused}@keyframes gxbr{from{opacity:1}to{opacity:.72}}'
+'.gxv .gxp,.gxv .gxo,.gxv .gxd,.gxv .gxb{animation-play-state:running}'
+'.bar>i{position:relative;overflow:hidden}.bar>i:after{content:"";position:absolute;top:0;bottom:0;left:0;width:60%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-120%);animation:gxsh 2.2s ease-in-out infinite;animation-play-state:paused}'
+'.bar.gxv>i:after{animation-play-state:running}@keyframes gxsh{0%{transform:translateX(-120%)}60%,100%{transform:translateX(220%)}}';
document.head.appendChild(css);
if(!('IntersectionObserver' in window))return;
var NS='http://www.w3.org/2000/svg',io=new IntersectionObserver(function(es){es.forEach(function(en){var t=en.target;t.classList.toggle('gxv',en.isIntersecting);if(en.isIntersecting&&!t.__gx){t.__gx=1;setTimeout(function(){if(t.isConnected)arm(t)},1500)}})},{threshold:.1});
function pend(e){return e.style&&(e.style.clipPath||e.style.transform)}
function arm(t){if(t.tagName==='svg'||t.tagName==='SVG'){
 var ps=t.querySelectorAll('polyline'),i=0;ps.forEach(function(p){if(pend(p)||p.classList.contains('gxp'))return;var c=p.cloneNode(false);c.removeAttribute('vector-effect');c.removeAttribute('style');c.setAttribute('class','gxp');c.setAttribute('pathLength','100');c.setAttribute('stroke','#D6FF7A');c.setAttribute('stroke-opacity','.95');c.setAttribute('stroke-dasharray','14 86');c.setAttribute('stroke-width',t.classList.contains('spk')?'1.7':String((parseFloat(p.getAttribute('stroke-width'))||2)+.3));c.style.animationDelay=(-(i++)*.7)+'s';p.parentNode.insertBefore(c,p.nextSibling)});
 var j=0;t.querySelectorAll('circle:not([stroke-dasharray]):not(.gxo)').forEach(function(c){if((+c.getAttribute('r')||0)>6||pend(c)&&c.style.opacity==='0')return;c.classList.add('gxd');c.style.animationDelay=(-(j++%6)*.35)+'s'});
 t.querySelectorAll('circle[stroke-dasharray]').forEach(function(c){if(c.classList.contains('gxo'))return;var o=c.cloneNode(false);o.removeAttribute('style');o.setAttribute('class','gxo');o.setAttribute('pathLength','100');o.setAttribute('stroke','#D6FF7A');o.setAttribute('stroke-opacity','.9');o.setAttribute('stroke-dasharray','5 95');o.setAttribute('stroke-dashoffset','0');c.parentNode.insertBefore(o,c.nextSibling)});
 var W=(t.viewBox&&t.viewBox.baseVal&&t.viewBox.baseVal.width)||300,H=(t.viewBox&&t.viewBox.baseVal&&t.viewBox.baseVal.height)||150,k=0;if(t.getAttribute('role')==='img')t.querySelectorAll('rect').forEach(function(r){var w=+r.getAttribute('width')||0,h=+r.getAttribute('height')||0;if(!w||!h||w>W*.5||h>H*.92||pend(r))return;r.classList.add('gxb');r.style.animationDelay=(-(k++%7)*.4)+'s'})}}
var tm=0;function scan(){var a=document.getElementById('app');if(!a)return;a.querySelectorAll('svg.spk,svg[role="img"],.bar').forEach(function(e){if(e.__gw)return;e.__gw=1;io.observe(e)});
 a.querySelectorAll('svg').forEach(function(e){if(!e.__gw&&e.querySelector('circle[stroke-dasharray]')){e.__gw=1;io.observe(e)}})}
var app=document.getElementById('app');if(app)new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(scan,150)}).observe(app,{childList:true,subtree:true});scan();
})();