(function(){
var css=document.createElement('style');css.textContent='.l3c{isolation:isolate}@media(max-width:560px){.l3ca{width:40%!important}}.l3ca{position:absolute;right:0;top:0;bottom:0;width:42%;height:100%;z-index:-1;pointer-events:none;display:block;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 46%);mask-image:linear-gradient(90deg,transparent 0,#000 46%)}';document.head.appendChild(css);
var items=[],rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,dpr=Math.min(window.devicePixelRatio||1,2),raf=0,lt=0,t0=performance.now();
function G(x,y0,y1,a){var g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(154,205,58,'+a+')');g.addColorStop(1,'rgba(61,125,31,'+(a*.6)+')');return g}
function bed(x,W,H,t){
 for(var k=0;k<5;k++){var y0=H*(.28+k*.12),amp=7+k*1.6,ph=t*(.8+k*.12)+k*1.3;
  x.beginPath();x.moveTo(0,H);for(var i=0;i<=W;i+=4){var y=y0+Math.sin(i*.032+ph)*amp+Math.sin(i*.011-ph*.7)*amp*.7;x.lineTo(i,y)}x.lineTo(W,H);x.closePath();
  var g=x.createLinearGradient(0,y0-amp,0,H);g.addColorStop(0,'rgba('+(154-k*14)+','+(205-k*10)+','+(58+k*6)+','+(.30+k*.06)+')');g.addColorStop(1,'rgba(61,125,31,.05)');x.fillStyle=g;x.fill();
  x.beginPath();for(var i=0;i<=W;i+=4){var y=y0+Math.sin(i*.032+ph)*amp+Math.sin(i*.011-ph*.7)*amp*.7;i?x.lineTo(i,y):x.moveTo(i,y)}x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=1.3;x.stroke()}
 for(var p=0;p<12;p++){var sx=((p*53.7)%W),sp=.05+((p*7)%5)*.012,yy=H-((t*sp*H*1.6+p*37)%(H*1.1)),xx=sx+Math.sin(t*.8+p)*8,r=1.6+(p%3)*.9;
  var a=Math.sin(Math.PI*Math.min(1,Math.max(0,(H-yy)/(H*1.0))));var gr=x.createRadialGradient(xx,yy,0,xx,yy,r*3.2);gr.addColorStop(0,'rgba(255,255,255,'+(.95*a)+')');gr.addColorStop(.4,'rgba(190,228,120,'+(.55*a)+')');gr.addColorStop(1,'rgba(190,228,120,0)');x.fillStyle=gr;x.beginPath();x.arc(xx,yy,r*3.2,0,6.283);x.fill()}}
function insp(x,W,H,t){
 var n=7,bw=W/(n*1.7),gap=(W-bw*n)/(n+1),base=H*.9,sc=((t*.32)%1.25)*W*1.0-W*.1,pts=[];
 for(var i=0;i<n;i++){var tr=.34+.5*(i/(n-1)),hv=tr*(.82+.18*Math.sin(t*1.2+i*.9)),intro=Math.min(1,Math.max(0,(t*1.4-i*.12))),h=H*.78*hv*(1-Math.pow(1-intro,3)),bx=gap+i*(bw+gap),by=base-h;
  var near=Math.max(0,1-Math.abs(sc-(bx+bw/2))/(W*.2));x.fillStyle=G(x,by,base,.55+.4*near);var r=Math.min(6,bw/2);x.beginPath();x.moveTo(bx,base);x.lineTo(bx,by+r);x.quadraticCurveTo(bx,by,bx+r,by);x.lineTo(bx+bw-r,by);x.quadraticCurveTo(bx+bw,by,bx+bw,by+r);x.lineTo(bx+bw,base);x.closePath();x.fill();
  if(near>0){x.fillStyle='rgba(255,255,255,'+(.35*near)+')';x.fillRect(bx,by,bw,Math.min(6,h))}pts.push([bx+bw/2,by-8-6*Math.sin(t*1.5+i)])}
 x.beginPath();pts.forEach(function(p,i){i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.strokeStyle='#2F6B1F';x.lineWidth=2.4;x.lineJoin='round';x.lineCap='round';x.stroke();
 if(n<2) return;
 var u=(t*.28)%1;if(!(u>=0))u=0;var seg=u*(n-1),i0=Math.max(0,Math.min(n-2,Math.floor(seg))),f=seg-i0,px=pts[i0][0]+(pts[i0+1][0]-pts[i0][0])*f,py=pts[i0][1]+(pts[i0+1][1]-pts[i0][1])*f;
 var gr=x.createRadialGradient(px,py,0,px,py,16);gr.addColorStop(0,'rgba(220,255,140,.95)');gr.addColorStop(1,'rgba(154,205,58,0)');x.fillStyle=gr;x.beginPath();x.arc(px,py,16,0,6.283);x.fill();x.fillStyle='#fff';x.strokeStyle='#2F6B1F';x.lineWidth=2;x.beginPath();x.arc(px,py,4,0,6.283);x.fill();x.stroke();
 x.fillStyle='rgba(125,184,46,.45)';x.fillRect(sc-1,H*.1,2,base-H*.1)}
function draw(it,t){var cv=it.cv,w=cv.clientWidth,h=cv.clientHeight;if(w<20||h<20)return;var W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
 var x=it.x;x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);it.k==='bed'?bed(x,w,h,t):insp(x,w,h,t)}
function tick(n){raf=requestAnimationFrame(tick);if(document.hidden||rm)return;if(n-lt<33)return;lt=n;var t=(n-t0)/1000,any=false;
 items=items.filter(function(it){return it.cv.isConnected});items.forEach(function(it){if(it.vis){any=true;draw(it,t)}})}
function mount(c){if(c.querySelector('.l3ca'))return;var k=c.dataset.v;if(k!=='bed'&&k!=='insp')return;var cv=document.createElement('canvas');cv.className='l3ca';cv.setAttribute('aria-hidden','true');c.insertBefore(cv,c.firstChild);
 var it={cv:cv,x:cv.getContext('2d'),k:k,vis:true};items.push(it);try{new IntersectionObserver(function(e){it.vis=e[0].isIntersecting}).observe(cv)}catch(e){}draw(it,rm?3:(performance.now()-t0)/1000+1.2)}
function scan(){document.querySelectorAll('.l3c').forEach(mount);if(items.length&&!raf)raf=requestAnimationFrame(tick)}
var app=document.getElementById('app');if(app)new MutationObserver(scan).observe(app,{childList:true,subtree:true});scan();
})();