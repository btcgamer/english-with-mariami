// Animated water, spray and ripples aligned to the illustrated islands.
// The illustration stays visible when Canvas is unavailable or motion is reduced.
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const sources = [...document.querySelectorAll('[data-magic-water]')];
  if (!sources.length) return;
  const falls = [
    { x: .171, y: .568, length: .253, width: .027, seed: 1 },
    { x: .519, y: .594, length: .302, width: .052, seed: 3 },
    { x: .808, y: .587, length: .235, width: .024, seed: 6 }
  ];
  // Reuse a small mist texture rather than blurring every particle every frame.
  const sprayTexture=document.createElement('canvas');sprayTexture.width=sprayTexture.height=96;
  const sprayContext=sprayTexture.getContext('2d');if(!sprayContext)return;
  const sprayGradient=sprayContext.createRadialGradient(48,48,0,48,48,48);
  sprayGradient.addColorStop(0,'rgba(206,246,255,.6)');sprayGradient.addColorStop(.32,'rgba(133,218,245,.22)');sprayGradient.addColorStop(1,'rgba(88,170,235,0)');sprayContext.fillStyle=sprayGradient;sprayContext.fillRect(0,0,96,96);
  let frame = 0, last = 0, elapsed = 0;
  const paused = () => (document.body.classList.contains('academy-cosmos') && !document.documentElement.classList.contains('mariami-auth-ready')) || reduced.matches || document.hidden || ['motion-paused','academy-motion-paused','auth-magic-paused'].some(c => document.body.classList.contains(c));
  const layers = sources.map(image => {
    const host = image.parentElement;
    const canvas = document.createElement('canvas'); canvas.className = 'magic-water-layer'; canvas.setAttribute('aria-hidden','true'); canvas.dataset.waterState = 'loading';
    host.append(canvas);
    const ctx = canvas.getContext('2d');
    return { image, host, canvas, ctx, visible:false, width:0, height:0, ready:false };
  }).filter(layer => layer.ctx);
  function size(layer) {
    const width = layer.host.clientWidth, height = layer.host.clientHeight;
    if (!width || !height) return;
    if (width !== layer.width || height !== layer.height) {
      layer.width = width; layer.height = height;
      const ratio = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1 : 1.5);
      layer.canvas.width = Math.round(width * ratio); layer.canvas.height = Math.round(height * ratio);
      layer.ctx.setTransform(ratio,0,0,ratio,0,0);
    }
  }
  function paint(layer, time) {
    size(layer);
    const {ctx,image,host,width,height} = layer;
    if (!width || !height || !image.naturalWidth) return;
    ctx.clearRect(0,0,width,height);
    const box=image.getBoundingClientRect(), parent=host.getBoundingClientRect();
    const style=getComputedStyle(image);
    let drawWidth=box.width,drawHeight=box.height,left=box.left-parent.left,top=box.top-parent.top;
    const naturalRatio=image.naturalWidth/image.naturalHeight;
    if (['cover','contain'].includes(style.objectFit)) {
      const factor=style.objectFit==='cover'?Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight):Math.min(box.width/image.naturalWidth,box.height/image.naturalHeight);
      drawWidth=image.naturalWidth*factor;drawHeight=image.naturalHeight*factor;
      left+=(box.width-drawWidth)/2;top+=(box.height-drawHeight)/2;
    } else if (Math.abs(drawWidth/drawHeight-naturalRatio)>.01) { drawHeight=drawWidth/naturalRatio; }
    ctx.save();ctx.beginPath();ctx.rect(box.left-parent.left,box.top-parent.top,box.width,box.height);ctx.clip();
    ctx.globalCompositeOperation='screen';
    for (const fall of falls) {
      const x=left+fall.x*drawWidth,y=top+fall.y*drawHeight,length=fall.length*drawHeight,w=fall.width*drawWidth;
      const center=t=>x+Math.sin(t*8-time*1.5+fall.seed)*w*(.014+t*.035);
      const half=t=>w*(.48-.14*t)*(1+.045*Math.sin(t*13-time*2.1+fall.seed));
      // A coherent sheet gives the falling highlights volume and depth.
      const sheet=ctx.createLinearGradient(x-w*.6,0,x+w*.6,0);
      sheet.addColorStop(0,'rgba(15,111,187,0)');sheet.addColorStop(.18,'rgba(33,166,225,.22)');sheet.addColorStop(.45,'rgba(181,248,255,.22)');sheet.addColorStop(.6,'rgba(222,255,255,.15)');sheet.addColorStop(.84,'rgba(50,184,230,.19)');sheet.addColorStop(1,'rgba(16,106,187,0)');
      ctx.fillStyle=sheet;ctx.beginPath();
      for(let j=0;j<=24;j++){const t=j/24;const px=center(t)-half(t),py=y+t*length;if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
      for(let j=24;j>=0;j--){const t=j/24;ctx.lineTo(center(t)+half(t),y+t*length);}ctx.closePath();ctx.fill();
      for(let i=0;i<9;i++){
        const offset=(i/8-.5)*w*.8;
        ctx.strokeStyle=`rgba(141,232,252,${.045+(i%3)*.018})`;ctx.lineWidth=Math.max(.6,w*.023);ctx.beginPath();
        for(let j=0;j<=18;j++){const t=j/18;const px=center(t)+offset*(1-t*.24)+Math.sin(t*16-time*2+i)*w*.014;if(j===0)ctx.moveTo(px,y);else ctx.lineTo(px,y+t*length);}ctx.stroke();
      }
      const strandCount=innerWidth<760?17:25;
      for(let i=0;i<strandCount;i++){
        const phase=(time*(.37+(i%5)*.018)+i*.137+fall.seed*.11)%1;
        const depth=phase*phase,across=((i+.5)/strandCount-.5)*w*.9;
        const head=y+depth*length,segment=length*(.065+phase*.075+(i%3)*.014),end=Math.min(y+length,head+segment);
        if(end<=head)continue;
        const stream=ctx.createLinearGradient(0,head,0,end);
        stream.addColorStop(0,'rgba(132,234,255,0)');stream.addColorStop(.3,'rgba(139,241,255,.34)');stream.addColorStop(.75,'rgba(232,255,255,.64)');stream.addColorStop(1,'rgba(199,250,255,0)');
        ctx.strokeStyle=stream;ctx.lineWidth=Math.max(.65,w*(.012+(i%3)*.007));ctx.lineCap='round';ctx.beginPath();
        const startX=center(depth)+across*(1-depth*.24);
        ctx.moveTo(startX,head);ctx.quadraticCurveTo(startX+Math.sin(i+time*1.6)*w*.035,head+(end-head)*.5,center(Math.min(1,depth+(end-head)/length))+across*.78,end);ctx.stroke();
      }
      // Ripples, impact foam, mist and ballistic droplets connect the fall to the pool.
      for(let i=0;i<3;i++){
        const phase=(time*.43+i/3+fall.seed*.1)%1;
        ctx.strokeStyle=`rgba(209,255,255,${(1-phase)*.28})`;ctx.lineWidth=Math.max(.7,w*.016);ctx.beginPath();ctx.ellipse(x,y-2-phase*w*.06,w*(.34+phase*.4),w*(.04+phase*.04),0,0,Math.PI*2);ctx.stroke();
      }
      const baseY=y+length*.95;
      for(let i=0;i<3;i++){
        const drift=Math.sin(time*.6+i*2+fall.seed)*w*.28,size=w*(1.8+i*.45);
        ctx.globalAlpha=.22-i*.035;ctx.drawImage(sprayTexture,x-size/2+drift,baseY-size*.46-Math.sin(time*.8+i)*w*.1,size,size*.72);
      }
      ctx.globalAlpha=1;
      for(let i=0;i<3;i++){
        const phase=(time*.4+i/3+fall.seed*.12)%1;
        ctx.strokeStyle=`rgba(174,241,255,${(1-phase)*.21})`;ctx.lineWidth=Math.max(.6,w*.013);ctx.beginPath();ctx.ellipse(x,baseY+phase*w*.18,w*(.4+phase*.85),w*(.07+phase*.12),0,0,Math.PI*2);ctx.stroke();
      }
      const droplets=innerWidth<760?12:20;
      for(let i=0;i<droplets;i++){
        const phase=(time*(.65+(i%4)*.05)+i*.173+fall.seed*.1)%1,direction=i%2?1:-1;
        const velocity=direction*w*(.45+(i%5)*.14),dx=x+velocity*phase,dy=baseY-w*(.6+(i%3)*.13)*phase+w*1.3*phase*phase;
        ctx.fillStyle=`rgba(216,253,255,${(1-phase)*.52})`;ctx.beginPath();ctx.ellipse(dx,dy,Math.max(.45,w*.01),Math.max(.8,w*.023)*(1+phase),direction*.3,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function sync(){
    const active=!paused()&&layers.some(l=>l.ready&&l.visible);
    layers.forEach(layer=>{layer.canvas.dataset.waterState=!layer.ready?'loading':paused()?'paused':layer.visible?'running':'offscreen';});
    if(active&&!frame)frame=requestAnimationFrame(tick);else if(!active)stop();
  }
  function tick(now){frame=0;if(paused()){sync();return;}if(last&&now-last<1000/(innerWidth<760?24:30)){frame=requestAnimationFrame(tick);return;}const dt=last?Math.min((now-last)/1000,.08):0;last=now;elapsed+=dt;layers.forEach(l=>{if(l.ready&&l.visible)paint(l,elapsed);});if(layers.some(l=>l.ready&&l.visible))frame=requestAnimationFrame(tick);}
  const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{const layer=layers.find(l=>l.image===entry.target);if(layer)layer.visible=entry.isIntersecting;});sync();},{threshold:.02});
  const resize=new ResizeObserver(()=>{layers.forEach(l=>{size(l);if(l.ready)paint(l,elapsed);});sync();});
  layers.forEach(layer=>{visibility.observe(layer.image);resize.observe(layer.host);layer.image.decode().then(()=>{layer.ready=true;size(layer);paint(layer,elapsed);sync();}).catch(()=>{layer.canvas.remove();});});
  const classes=new MutationObserver(sync);classes.observe(document.body,{attributes:true,attributeFilter:['class']});
  const authorization=new MutationObserver(sync);authorization.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  addEventListener('pagehide',stop);addEventListener('pageshow',sync);
})();
