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
      const glow=ctx.createLinearGradient(0,y,0,y+length);glow.addColorStop(0,'rgba(145,250,255,.25)');glow.addColorStop(.45,'rgba(37,208,255,.20)');glow.addColorStop(1,'rgba(69,193,255,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(x-w*.65,y);ctx.lineTo(x+w*.65,y);ctx.lineTo(x+w*.42,y+length);ctx.lineTo(x-w*.42,y+length);ctx.fill();
      // Falling strands: each bright segment follows gravity and a little turbulence.
      for(let i=0;i<13;i++) {
        const phase=((time*(.28+i*.008)+i*.139+fall.seed*.17)%1);
        const progress=phase*phase;
        const strandX=x+((i/12)-.5)*w*.85+Math.sin(time*1.6+i+fall.seed)*w*.035;
        const strandY=y+progress*length;
        const segment=length*(.10+(i%3)*.025);
        const stream=ctx.createLinearGradient(0,strandY,0,strandY+segment);stream.addColorStop(0,'rgba(85,227,255,0)');stream.addColorStop(.55,'rgba(110,239,255,.60)');stream.addColorStop(1,'rgba(218,255,255,0)');
        ctx.strokeStyle=stream;ctx.lineWidth=Math.max(.7,w*.025);ctx.beginPath();ctx.moveTo(strandX,strandY);ctx.quadraticCurveTo(strandX+w*.04*Math.sin(i+time),strandY+segment*.5,strandX+w*.015,strandY+segment);ctx.stroke();
      }
      const mist=ctx.createRadialGradient(x,y+length*.95,0,x,y+length*.95,w*1.5);mist.addColorStop(0,'rgba(95,220,255,.13)');mist.addColorStop(1,'rgba(95,220,255,0)');ctx.fillStyle=mist;ctx.fillRect(x-w*1.5,y+length*.95-w*1.5,w*3,w*3);
      for(let i=0;i<11;i++){
        const phase=(time*.55+i*.173+fall.seed)%1;
        const velocity=((i%2)?1:-1)*w*(.3+(i%4)*.15);
        const dx=x+velocity*phase;
        const dy=y+length*.96-w*1.1*phase+w*1.65*phase*phase;
        ctx.fillStyle=`rgba(185,249,255,${(1-phase)*.55})`;ctx.beginPath();ctx.ellipse(dx,dy,Math.max(.6,w*.017),Math.max(1,w*.035),.3,0,Math.PI*2);ctx.fill();
      }
      // A moving glint at the lip connects the flow to the illustrated water source.
      ctx.strokeStyle='rgba(188,255,255,.38)';ctx.lineWidth=Math.max(.8,w*.022);ctx.beginPath();ctx.ellipse(x,y,w*.58,w*.10,0,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  }
  function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
  function sync(){
    const active=!paused()&&layers.some(l=>l.ready&&l.visible);
    layers.forEach(layer=>{layer.canvas.dataset.waterState=!layer.ready?'loading':paused()?'paused':layer.visible?'running':'offscreen';});
    if(active&&!frame)frame=requestAnimationFrame(tick);else if(!active)stop();
  }
  function tick(now){frame=0;if(paused()){sync();return;}if(last&&now-last<33){frame=requestAnimationFrame(tick);return;}const dt=last?Math.min((now-last)/1000,.08):0;last=now;elapsed+=dt;layers.forEach(l=>{if(l.ready&&l.visible)paint(l,elapsed);});if(layers.some(l=>l.ready&&l.visible))frame=requestAnimationFrame(tick);}
  const visibility=new IntersectionObserver(entries=>{entries.forEach(entry=>{const layer=layers.find(l=>l.image===entry.target);if(layer)layer.visible=entry.isIntersecting;});sync();},{threshold:.02});
  const resize=new ResizeObserver(()=>{layers.forEach(l=>{size(l);if(l.ready)paint(l,elapsed);});sync();});
  layers.forEach(layer=>{visibility.observe(layer.image);resize.observe(layer.host);layer.image.decode().then(()=>{layer.ready=true;size(layer);paint(layer,elapsed);sync();}).catch(()=>{layer.canvas.remove();});});
  const classes=new MutationObserver(sync);classes.observe(document.body,{attributes:true,attributeFilter:['class']});
  const authorization=new MutationObserver(sync);authorization.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
  addEventListener('pagehide',stop);addEventListener('pageshow',sync);
})();
