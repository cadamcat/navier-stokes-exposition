/* A chosen field, its residual, and an exact smooth flat function. */
import {stage3d} from "../three3d/stage3d.js";
import {particles3d} from "../lib/particles3d.js";
import {styleTrails} from "../ns/trails.js";
import {U, fromWorld, SCALE} from "../c2/field.js";
installBeats(window.__BEATS__);

const INTRO = need("c6b1", "lead", 2.25, "title card held 2 s, first picture 0.25 s before the first word");
const MOVE = need("c6b1", "left", 1.0, "terms cross the equals sign");
const LIFT = need("c6b2", "The", 0.6, "equation moves up");
const CLIMB = need("c6b2", "blowup", 1.0, "peak speed climbs");
const FORCE = need("c6b2", "leftover", 1.0, "naive force climbs");
const BUMP = need("c6b2", "smooth", 1.0, "smooth force draws on");
const CLEAR = need("c6b3", "This", 0.35, "blowup plot clears");
const DRAW = need("c6b3", "function", 1.0, "flat function draws on");
const OUT = need("c6b3", "tail", 0.8, "picture fades out");


const {op,gate,swap,powerOut,powerIn,sineInOut,mix}=KIT;
const T={vel:cue("c6b1","velocity"),put:cue("c6b1","put"),left:cue("c6b1","left"),def:cue("c6b1","definition"),
 chart:cue("c6b2","The"),blow:cue("c6b2","blowup"),force:cue("c6b2","leftover"),allow:cue("c6b2","allowed"),smooth:cue("c6b2","smooth"),
 flat:beatStart("c6b3"),fn:cue("c6b3","function"),every:cue("c6b3","every"),smoothness:cue("c6b3","official")};
T.positive=BEATS.byId.c6b3.words.filter(w=>w.word.toLowerCase()==="not").at(-1).start;
const chapter=chapterLabel({n:6,title:"Designing the force",intro:2.0});
const opening=KIT.layer(), plot=KIT.layer(), flat=KIT.layer();
const osvg=KIT.overlay(opening), psvg=KIT.overlay(plot), fsvg=KIT.overlay(flat);
const txt=(parent,name,text,x,y,kind="aux",w)=>KIT.text(parent,name,text,{x,y,w,kind});
const st=stage3d({left:120,top:270,width:300,height:300,fov:32,parent:opening});
const map=magnitudeMap();
const field=(x,y,z)=>U(...fromWorld(x,y,z)).map(v=>v*SCALE*0.3);
const trails=particles3d({parent:st.scene,camera:st.camera,field,
 scalar:(x,y,z)=>Math.hypot(...U(...fromWorld(x,y,z))),
 seeding:{min:[-1,-1,-1],max:[1,1,1]},count:560,seed:601,lifetime:5,trailLength:3,
 startTime:0,duration:window.__BEATS__.duration,step:1/90,segments:48,width:3.6,fade:0.6,
 color:s=>map.css(Math.log1p(5*s)/Math.log1p(10*Math.sqrt(3))),opacity:0.85});
trails.setViewport(300,300);
const style=styleTrails(trails,st,{unit:s=>s/(2*Math.sqrt(3)),width:[0.8,1],alpha:[0.95,1],depth:2,far:0.7});
const chosen=txt(opening,"chosen","$u$, $p$",120,600,"label");
const choice=txt(opening,"choice","choose $u$, $p$",1256,136,"strong");
const clock=KIT.note(opening,"clock","exact field; speed log scale; tracer clock ×0.3");
const arrow=KIT.svgEl(osvg,"path",{d:"M394 420 H410 M398 411 L410 420 L398 429",fill:"none",stroke:"var(--ink)","stroke-width":2});

/* Unchanged differential terms keep their identity as the residual is isolated. */
const colored=(cls,tex)=>"\\htmlClass{"+cls+"}{"+tex+"}";
const u=colored("obj-u","u"), f=colored("obj-f","f"), nu=colored("obj-nu","\\nu");
const terms=[
 ["dt","\\partial_t "+u,460,573,90],
 ["adv","("+u+"\\cdot\\nabla)"+u,628,741,205],
 ["visc",nu+"\\Delta "+u,1143,1019,120],
 ["grad","\\nabla p",980,1217,80],
 ["force",f,1341,460,40],
].map(([name,tex,a,b,w])=>({name,a:420+(a-460)*0.83,b:420+(b-460)*0.83,
 f:KIT.formula(opening,name,tex,{x:420+(a-460)*0.83,y:375,w:w*0.86,h:90})}));
const oldSigns=[ ["plus-a","+",564,48],["equal","=",855,48],["minus-p","-",927,48],["plus-v","+",1079,48],["plus-f","+",1277,48] ]
 .map(([n,tex,x,w])=>KIT.formula(opening,n,tex,{x:420+(x-460)*0.83,y:375,w:w*0.86,h:90}));
const newSigns=[ ["equal-new","=",509,48],["plus-new","+",677,48],["minus-new","-",960,48],["plus-p-new","+",1153,48] ]
 .map(([n,tex,x,w])=>KIT.formula(opening,n,tex,{x:420+(x-460)*0.83,y:375,w:w*0.86,h:90}));
const residual=txt(opening,"residual","residual $\\mathcal R(u,p)$",1256,240,"label");
const holds=txt(opening,"holds","holds by definition",1256,338,"label");
const tick=KIT.svgEl(osvg,"path",{d:"M1204 355 L1213 364 L1232 341",fill:"none",stroke:"var(--ink)","stroke-width":3});

const ch=KIT.chart(plot,psvg,{box:"blowup-chart",x:120,y:150,w:1112,h:600,xr:[0,1.5],yr:[0,6],xTicks:[{v:1,text:"1"}]});
const velFn=s=>Math.pow(1-s,-0.7), forceFn=s=>Math.pow(1-s,-0.5);
const vEnd=1-Math.pow(6,-1/0.7), fEnd=1-1/36;
const velocity=ch.curve({token:"--velocity",fn:velFn,from:0,to:vEnd,clipTop:6.001});
const force=ch.curve({token:"--force",fn:forceFn,from:0.04,to:fEnd,clipTop:6.001,dashed:true,width:3.5});
const bumpValue=s=>{const z=(s-0.85)/0.6;return Math.abs(z)>=1?0:2.4*Math.exp(-1/(1-z*z));};
const bump=ch.curve({token:"--force",fn:bumpValue,from:0.25,to:1.45});
const blowLine=KIT.svgEl(psvg,"line",{x1:ch.X(1),x2:ch.X(1),y1:150,y2:750,stroke:"var(--ink-muted)","stroke-width":2,"stroke-dasharray":"6 7"});
const size=txt(plot,"size","size",120,104);
const peak=txt(plot,"peak-speed","peak speed $\\to\\infty$",ch.X(vEnd)-225,100,"label");peak.style.color="var(--velocity)";
const naive=txt(plot,"naive-force","naive force",ch.X(1)+14,162,"label");naive.style.color="var(--force)";
const time=txt(plot,"blowup-time","$t=1$: blowup time",ch.X(1)+80,780);
const zero=txt(plot,"time-zero","0",120,762);
const cross=KIT.svgEl(psvg,"path",{d:`M${ch.X(0.82)-12} ${ch.Y(forceFn(0.82))-12} l24 24 m0 -24 l-24 24`,fill:"none",stroke:"var(--ink)","stroke-width":3});
const notOk=txt(plot,"not-admissible","not admissible",ch.X(0.82)-300,ch.Y(forceFn(0.82))-63,"label");
const smoothLab=txt(plot,"smooth-force","smooth force",ch.X(1.2)+16,ch.Y(bumpValue(1.2))-42,"label");smoothLab.style.color="var(--force)";
const schematic=KIT.note(plot,"schematic","schematic");
const required=KIT.note(plot,"required","schematic; required: smooth through $t=1$");
const railResidual=KIT.formula(plot,"rail-residual","\\begin{aligned}"+f+"&=\\partial_t "+u+"\\\\&\\quad+("+u+"\\cdot\\nabla)"+u+"\\\\&\\quad-"+nu+"\\Delta "+u+"+\\nabla p\\end{aligned}",{x:1256,y:96,w:544,h:240});
const powers=KIT.formula(plot,"powers","\\begin{gathered}\\tau^{-a-1},\\ \\tau^{-2a},\\ \\tau^{-a}\\end{gathered}",{x:1256,y:546,w:544,h:100});
const trial=KIT.formula(plot,"trial",u+"=\\tau^{-a}V(x)",{x:1256,y:396,w:544,h:90});
const forTrial=txt(plot,"for-trial","trial field",1256,350);
const tau=txt(plot,"tau","$\\tau=1-t$",1256,490);
const through=txt(plot,"through","required: smooth through $t=1$",1256,720,"label");

const g=s=>s===0?0:Math.exp(-1/(s*s));
const main=KIT.chart(flat,fsvg,{box:"flat-main",x:120,y:340,w:1112,h:390,xr:[-3,3],yr:[0,1],xTicks:[{v:0,text:"0"}],yAxis:false});
const ghost=main.curve({token:"--ink",fn:g,from:-3,to:3});
const gc=main.curve({token:"--ink",fn:g,from:-3,to:3});
const stem=KIT.svgEl(fsvg,"line",{x1:main.X(0),x2:main.X(0),y1:340,y2:730,stroke:"var(--rule)","stroke-width":2});
const zoom=KIT.chart(flat,fsvg,{box:"flat-zoom",x:760,y:124,w:440,h:180,xr:[-0.6,0.6],yr:[0,0.05],xTicks:[],yAxis:false});
const zc=zoom.curve({token:"--ink",fn:g,from:-0.6,to:0.6,clipTop:0.05,n:600});
const frame=KIT.svgEl(fsvg,"rect",{x:760,y:124,width:440,height:180,fill:"none",stroke:"var(--ink-muted)","stroke-width":2});
const win=KIT.svgEl(fsvg,"rect",{x:main.X(-0.6),y:main.Y(0.05),width:main.X(0.6)-main.X(-0.6),height:main.Y(0)-main.Y(0.05),fill:"none",stroke:"var(--ink-muted)","stroke-width":2});
const gf=KIT.formula(flat,"g-definition","g(s)=e^{-1/s^2}",{x:1256,y:160,w:544,h:90});
const domain=txt(flat,"domain","$(s\\ne0)$",1256,258);
const g0=KIT.formula(flat,"g-zero","g(0)=0",{x:1256,y:310,w:544,h:90});
const derivatives=txt(flat,"derivatives","for every $k$: $g^{(k)}(0)=0$",1256,450,"label");
const range=txt(flat,"zoom-range","zoom: $-0.6 \\le s \\le 0.6$",120,154);
const zoomHeight=txt(flat,"zoom-height","$0 \\le g \\le 0.05$",120,202);
const distinction=txt(flat,"distinction","smooth ≠ analytic",1256,96,"strong");
const sLabel=txt(flat,"s-label","$s$",1200,755);
const point=KIT.svgEl(fsvg,"circle",{cx:main.X(0.5),cy:main.Y(g(0.5)),r:5,fill:"var(--velocity)"});
const positive=txt(flat,"positive","$g(s)>0$ for $s\\ne0$",main.X(0.5)+64,650,"label");
const lead=KIT.leader(fsvg);
const clay=txt(flat,"clay","Clay asks for $C^\\infty$",1256,650,"label");
const analytic=txt(flat,"not-analytic","not analytic",1256,700);
const strip=mountStripJX(document.body), subs=mountSubtitles(document.body,window.__BEATS__);
window.sceneDuration=window.__BEATS__.duration;
window.sceneEvents=Object.entries(T).map(([what,t])=>({t,what,beat:t<T.chart?"c6b1":t<T.flat?"c6b2":"c6b3"}));
window.setTime=t=>{
 chapter.setTime(t);subs.setTime(t);
 const stay=1-powerIn(t,beatHoldEnd("c6b3")-0.5,0.5);
 if(t>=2) op(chapter.el,stay);
 strip.setTime(t,stay);
 const a=swap(t,T.chart),b=swap(t,T.flat);
 op(opening,a.oldK*stay);op(plot,a.newK*b.oldK*stay);op(flat,b.newK*stay);
 const reveal=sineInOut(t,cue("c6b1","construction"),3);
 st.orbit([0,0,0],24+12*reveal,24,6.3);
 if(a.oldK>0.001){trails.setTime(Math.min(t,window.__BEATS__.duration),1);style(Math.min(t,window.__BEATS__.duration));st.render();}
 op(chosen,powerOut(t,T.vel,0.35));op(choice,KIT.textIn(t,T.vel));op(arrow,powerOut(t,T.put,0.35));
 op(clock,1);
 const move=sineInOut(t,T.left+MOVE*0.25,MOVE*0.5);
 const lift=sineInOut(t,T.left,MOVE*0.25)*(1-sineInOut(t,T.left+MOVE*0.75,MOVE*0.25));
 const signs={oldK:swap(t,T.left).oldK,newK:powerOut(t,T.left+MOVE,0.35)};
 terms.forEach(term=>{
  term.f.setTime(t);op(term.f.el,1);
  const dy=term.name==="force"?-150*lift:term.name==="grad"?95*lift:0;
  term.f.el.style.transform=`translate(${mix(term.a,term.b,move)-term.a}px,${dy}px)`;
 });
 oldSigns.forEach(f=>{f.setTime(t);op(f.el,signs.oldK);});newSigns.forEach(f=>{f.setTime(t);op(f.el,signs.newK);});
 op(residual,powerOut(t,T.left+MOVE,0.35));op(holds,KIT.textIn(t,T.def));op(tick,KIT.textIn(t,T.def));
 ch.setK(1);op(blowLine,powerOut(t,T.blow,0.3));op(size,1);op(zero,1);
 const vk=powerOut(t,T.blow,CLIMB),fk=powerOut(t,T.force,FORCE),bk=powerOut(t,T.smooth,BUMP);
 velocity.set(vEnd*vk,1-0.25*powerOut(t,T.force,0.3));force.set(0.04+(fEnd-0.04)*fk,fk);bump.set(0.25+1.2*bk,bk);
 op(peak,powerOut(t,T.blow+CLIMB,0.35));op(naive,fk);op(time,powerOut(t,T.blow+CLIMB,0.35));
 op(cross,powerOut(t,T.allow,0.3));op(notOk,powerOut(t,T.allow,0.35));
 op(smoothLab,powerOut(t,T.smooth+BUMP,0.3));op(through,KIT.textIn(t,T.smooth));
 op(schematic,1-powerIn(t,T.smooth+BUMP-0.25,0.25));op(required,powerOut(t,T.smooth+BUMP,0.3));
 railResidual.setTime(t);op(railResidual.el,1);
 [powers,trial].forEach(f=>{f.setTime(t);op(f.el,KIT.textIn(t,T.force));});
 op(forTrial,KIT.textIn(t,T.force));op(tau,KIT.textIn(t,T.force));
 main.setK(1);op(stem,1);gc.set(-3+6*powerOut(t,T.fn,DRAW),powerOut(t,T.fn,DRAW));ghost.set(null,0.2*(1-powerOut(t,T.fn,DRAW)));
 [gf,g0].forEach(f=>{f.setTime(t);op(f.el,KIT.textIn(t,T.fn));});op(domain,KIT.textIn(t,T.fn));op(sLabel,1);
 const zk=powerOut(t,T.every,0.35);zoom.setK(zk);zc.set(0.6,zk);
 [frame,win,range,zoomHeight].forEach(n=>op(n,zk));op(derivatives,KIT.textIn(t,T.every));
 const pk=powerOut(t,T.positive,0.35);op(point,pk);op(positive,pk);
 lead.set(main.X(0.5),main.Y(g(0.5)),main.X(0.5)+52,672,pk);
 op(distinction,KIT.textIn(t,cue("c6b3","Smooth")));op(clay,KIT.textIn(t,T.smoothness));op(analytic,KIT.textIn(t,T.smoothness));
};
window.setTime(0);
