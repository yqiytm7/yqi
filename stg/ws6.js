(function(){var CFG={v:'--acc',sel:'.card,.kpis>div,.kpg>div',land:function(){return document.body.classList.contains('onland')},skip:function(){return document.body.classList.contains('oninsp')}};function go(){if(window.__d3bg)return;window.__d3bg=1;
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse=!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)||window.innerWidth<900;
var tx=0,ty=0;
if(!rm){window.addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;tx=e.clientX/window.innerWidth*2-1;ty=1-e.clientY/window.innerHeight*2},{passive:true});
window.addEventListener('deviceorientation',function(e){if(e.gamma==null)return;tx=Math.max(-1,Math.min(1,e.gamma/30));ty=Math.max(-1,Math.min(1,-(e.beta-45)/30))},{passive:true})}
function rgb(s){var m;s=(s||'').trim();if(m=s.match(/^#([0-9a-f]{6})$/i)){var n=parseInt(m[1],16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}if(m=s.match(/^#([0-9a-f]{3})$/i)){var h=m[1];return[parseInt(h[0]+h[0],16)/255,parseInt(h[1]+h[1],16)/255,parseInt(h[2]+h[2],16)/255]}if(m=s.match(/rgba?\(([^)]+)\)/)){var a=m[1].split(',');return[a[0]/255,a[1]/255,a[2]/255]}return[.36,.64,.16]}
function accent(){try{var v=getComputedStyle(document.documentElement).getPropertyValue(CFG.v).trim()||getComputedStyle(document.body).getPropertyValue(CFG.v).trim();return rgb(v||'#5BA32A')}catch(e){return[.36,.64,.16]}}
function dark(){try{var s=getComputedStyle(document.body).backgroundColor;if(!s||/,\s*0\)/.test(s)||s==='transparent')s=getComputedStyle(document.documentElement).backgroundColor;if(!s||/,\s*0\)/.test(s))return 0;var c=rgb(s);return(c[0]*.3+c[1]*.59+c[2]*.11)<.45?1:0}catch(e){return 0}}
function initGL(){
 var cv=document.createElement('canvas');cv.id='d3bg';cv.setAttribute('aria-hidden','true');
 var gl=null;try{gl=cv.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:true,depth:false,stencil:false,powerPreference:'default'})}catch(e){}
 if(!gl)return false;
 function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error('d3 shader',gl.getShaderInfoLog(s));return null}return s}
 function prog(vs,fs){var a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs);if(!a||!b)return null;var p=gl.createProgram();gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error('d3 link',gl.getProgramInfoLog(p));return null}return p}
 var P1=prog('attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}',
 'precision mediump float;uniform vec2 uR;uniform float uT,uI,uD,uQ;uniform vec2 uM;uniform vec3 uC;'+
 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}'+
 'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}'+
 'float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}'+
 'void main(){vec2 uv=gl_FragCoord.xy/uR;vec2 p=(uv-.5)*vec2(uR.x/uR.y,1.)*2.4+uM*.18;'+
 'vec2 q=vec2(fb(p+uT*.045),fb(p+vec2(5.2,1.3)-uT*.04));float f;'+
 'if(uQ>.5){vec2 r=vec2(fb(p+3.*q+vec2(1.7,9.2)+uT*.07),fb(p+3.*q+vec2(8.3,2.8)-uT*.055));f=fb(p+3.*r);}else{f=fb(p+2.*q);}'+
 'vec3 lime=vec3(.80,.92,.48);vec3 tint=mix(uC,lime,smoothstep(.2,.9,q.x));'+
 'float m=smoothstep(.25,.95,f);float fade=smoothstep(1.02,.15,uv.y);'+
 'float a=m*(.3+.22*uD)*fade*uI;'+
 'float d=abs(fract(f*11.+uT*.04)-.5);float ln=smoothstep(.455,.5,d)*(.24+.14*uD)*fade*uI*smoothstep(.2,.6,f);'+
 'vec2 mp=uM*.5+.5;float gw=exp(-length((uv-mp)*vec2(uR.x/uR.y,1.))*3.2)*(.16+.12*uD)*uI;'+
 'float A=clamp(a+ln+gw,0.,1.);vec3 col=mix(tint,lime,min(1.,ln*4.+gw*3.))*A;gl_FragColor=vec4(col,A);}');
 var P2=prog('attribute vec2 aG;uniform float uT,uAsp,uI;uniform vec2 uM;varying float vA,vH;'+
 'void main(){float x=aG.x,z=aG.y;'+
 'float y=.16*sin(x*3.1+uT*.7+z*5.)*cos(z*6.-uT*.55)+.08*sin(x*8.+z*3.5+uT*1.15)+.045*sin(x*14.-uT*1.6+z*9.);'+
 'vec2 mp=vec2(uM.x*.9,.45+uM.y*.3);float dd=length(vec2(x,z*1.3)-vec2(mp.x,mp.y*1.3));y+=.2*exp(-dd*dd*9.);'+
 'vec3 p=vec3(x*3.4,y-.5,z*5.2+.35);float yw=uM.x*.16,c=cos(yw),s=sin(yw);float zx=p.z-2.;p=vec3(c*p.x-s*zx,p.y,s*p.x+c*zx+2.);'+
 'float k=1./(p.z*.55+.5);float ax=1./max(uAsp,1.);'+
 'gl_Position=vec4(p.x*k*.9*ax,p.y*k*.9-.02+uM.y*.04,0.,1.);'+
 'vA=pow(1.-z,.85)*smoothstep(0.,.08,z+.06)*(.35+.65*uI);vH=y;}',
 'precision mediump float;uniform vec3 uC;varying float vA,vH;void main(){vec3 lime=vec3(.80,.92,.48);vec3 col=mix(uC,lime,smoothstep(-.05,.28,vH));float a=vA*.62;gl_FragColor=vec4(col*a,a);}');
 var P3=prog('attribute vec3 aS;uniform float uT,uPS,uI;uniform vec2 uM;varying float vA;'+
 'void main(){float t=uT*.04*(.4+aS.z);float yy=fract(aS.y-t);float xx=aS.x*2.-1.+sin(uT*.4+aS.z*20.)*.04+uM.x*.05*(aS.z+.3);'+
 'gl_Position=vec4(xx,yy*2.-1.,0.,1.);gl_PointSize=(2.+aS.z*7.)*uPS;vA=(.2+aS.z*.5)*smoothstep(0.,.2,yy)*smoothstep(1.,.75,yy)*(.45+.55*uI);}',
 'precision mediump float;uniform vec3 uC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d)*vA;vec3 col=mix(uC,vec3(.8,.92,.48),.5);gl_FragColor=vec4(col*a,a);}');
 var P4=prog('attribute vec2 aP;varying vec2 vU;void main(){vU=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}','precision mediump float;uniform sampler2D uTex;varying vec2 vU;void main(){gl_FragColor=texture2D(uTex,vU);}');
 if(!P1||!P2||!P3||!P4)return false;
 function U(p,n){return gl.getUniformLocation(p,n)}
 var u1={R:U(P1,'uR'),T:U(P1,'uT'),I:U(P1,'uI'),D:U(P1,'uD'),Q:U(P1,'uQ'),M:U(P1,'uM'),C:U(P1,'uC')},u2={T:U(P2,'uT'),A:U(P2,'uAsp'),I:U(P2,'uI'),M:U(P2,'uM'),C:U(P2,'uC')},u3={T:U(P3,'uT'),PS:U(P3,'uPS'),I:U(P3,'uI'),M:U(P3,'uM'),C:U(P3,'uC')};
 var u4=U(P4,'uTex'),a4=gl.getAttribLocation(P4,'aP');
 var a1=gl.getAttribLocation(P1,'aP'),a2=gl.getAttribLocation(P2,'aG'),a3=gl.getAttribLocation(P3,'aS');
 var qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 var GX=coarse?44:60,GZ=coarse?26:36,gv=[],gi=[];for(var j=0;j<=GZ;j++)for(var i=0;i<=GX;i++)gv.push(i/GX*2-1,j/GZ);
 for(var j=0;j<=GZ;j++)for(var i=0;i<GX;i++)gi.push(j*(GX+1)+i,j*(GX+1)+i+1);for(var j=0;j<GZ;j++)for(var i=0;i<=GX;i+=(coarse?2:1))gi.push(j*(GX+1)+i,(j+1)*(GX+1)+i);
 var gb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,gb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(gv),gl.STATIC_DRAW);
 var ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(gi),gl.STATIC_DRAW);var NI=gi.length;
 var NP=coarse?46:90,pv=[];for(var i=0;i<NP;i++)pv.push(Math.random(),Math.random(),Math.random());
 var pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pv),gl.STATIC_DRAW);
 var sc=Math.min(window.devicePixelRatio||1,2),bs=coarse?.42:.6,minBs=.22,q=1,cw=0,ch=0,bw=0,bh=0,tex=gl.createTexture(),fbo=gl.createFramebuffer(),col=accent(),dk=dark(),ct=0,px=0,py=0,I=1,lt=0,ema=16,lastR=0,fc=0,dead=false,lpx=9,lpy=9;
 function size(){var w=Math.max(1,Math.round(window.innerWidth*sc)),h=Math.max(1,Math.round(window.innerHeight*sc));if(w!==cw||h!==ch){cw=w;ch=h;cv.width=w;cv.height=h}
  var w2=Math.max(2,Math.round(window.innerWidth*bs)),h2=Math.max(2,Math.round(window.innerHeight*bs));if(w2!==bw||h2!==bh){bw=w2;bh=h2;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,bw,bh,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}}
 cv.style.cssText='top:0;height:100%';document.body.appendChild(cv);size();
 var rt=0;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(size,120)});
 cv.addEventListener('webglcontextlost',function(e){e.preventDefault();dead=true});
 function draw(t){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,bw,bh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(P1);gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.enableVertexAttribArray(a1);gl.vertexAttribPointer(a1,2,gl.FLOAT,false,0,0);
  gl.uniform2f(u1.R,bw,bh);gl.uniform1f(u1.T,t);gl.uniform1f(u1.I,I);gl.uniform1f(u1.D,dk);gl.uniform1f(u1.Q,q);gl.uniform2f(u1.M,px,py);gl.uniform3f(u1.C,col[0],col[1],col[2]);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disableVertexAttribArray(a1);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cw,ch);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(P4);gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.enableVertexAttribArray(a4);gl.vertexAttribPointer(a4,2,gl.FLOAT,false,0,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(u4,0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.disableVertexAttribArray(a4);
  gl.useProgram(P2);gl.bindBuffer(gl.ARRAY_BUFFER,gb);gl.enableVertexAttribArray(a2);gl.vertexAttribPointer(a2,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  gl.uniform1f(u2.T,t);gl.uniform1f(u2.A,cw/ch);gl.uniform1f(u2.I,I);gl.uniform2f(u2.M,px,py);gl.uniform3f(u2.C,col[0],col[1],col[2]);gl.drawElements(gl.LINES,NI,gl.UNSIGNED_SHORT,0);gl.disableVertexAttribArray(a2);
  gl.useProgram(P3);gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.enableVertexAttribArray(a3);gl.vertexAttribPointer(a3,3,gl.FLOAT,false,0,0);
  gl.uniform1f(u3.T,t);gl.uniform1f(u3.PS,Math.max(1,sc*1.1));gl.uniform1f(u3.I,I);gl.uniform2f(u3.M,px,py);gl.uniform3f(u3.C,col[0],col[1],col[2]);gl.drawArrays(gl.POINTS,0,NP);gl.disableVertexAttribArray(a3)}
 if(rm){draw(3);return true}
 function tick(n){requestAnimationFrame(tick);if(dead)return;var dt=n-lastR;lastR=n;if(dt>0&&dt<400)ema=ema*.93+dt*.07;
  if(document.hidden||(CFG.skip&&CFG.skip()))return;
  if(n-lt<(coarse?30:15))return;lt=n;
  if(++fc%50===0&&ema>30){if(bs>minBs+.02){bs=Math.max(minBs,bs*.78);size()}else if(q>.5){q=0}else{dead=true;return}ema=18}
  var land=CFG.land();I+=((land?1:.6)-I)*.08;px+=(tx-px)*.08;py+=(ty-py)*.08;
  if(!ct--){col=accent();dk=dark();ct=90}
  var L=document.querySelector('.l3');if(L){if(Math.abs(px-lpx)>.004||Math.abs(py+0-lpy)>.004){lpx=px;lpy=py;L.style.setProperty('--px',px.toFixed(3));L.style.setProperty('--py',(-py).toFixed(3))}var cb=L.querySelector('.l3cube');if(cb)cb.style.setProperty('--ry3',((n/1000)*26)%360+'deg')}
  draw(n/1000*.5)}
 requestAnimationFrame(tick);return true}
function cssFallback(){var d=document.createElement('div');d.id='d3bg';d.className='d3css';d.setAttribute('aria-hidden','true');d.style.color='var('+CFG.v+', #5BA32A)';var sv='<svg class="w W" viewBox="0 0 1200 120" preserveAspectRatio="none"><path d="M0 60 Q150 10 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>';d.innerHTML='<i class="b b1"></i><i class="b b2"></i>'+sv.replace('W','w1')+sv.replace('W','w2');document.body.appendChild(d)}
var old=document.getElementById('d3bg');if(old)old.remove();
/* card tilt (mouse only) */
if(rm)return;var cur=null,SEL=CFG.sel,raf=0,ev=null;
function pick(e){var t=e.target&&e.target.closest?e.target.closest(SEL):null;if(!t)return null;var r=t.getBoundingClientRect();if(r.width>640||r.height>360||r.width<90)return null;if(t.querySelector('input,textarea,select,table,canvas,iframe'))return null;return t}
function reset(el){if(!el)return;el.classList.remove('d3t');el.style.removeProperty('--rx');el.style.removeProperty('--ry')}
document.addEventListener('pointermove',function(e){if(e.pointerType&&e.pointerType!=='mouse')return;ev=e;if(raf)return;raf=requestAnimationFrame(function(){raf=0;var t=pick(ev);if(t!==cur){reset(cur);cur=t}
if(!cur)return;var r=cur.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width,y=(ev.clientY-r.top)/r.height;cur.classList.add('d3t');cur.style.setProperty('--ry',((x-.5)*9).toFixed(2)+'deg');cur.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg')})},{passive:true});
document.addEventListener('pointerleave',function(){reset(cur);cur=null},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})();