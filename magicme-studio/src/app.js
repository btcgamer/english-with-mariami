/* MAGIC ME PRO — Child avatars V1.2. Standalone only. Rigged models + authored motion clips. */
import * as THREE from 'three';
import {GLTFLoader} from '../vendor/loaders/GLTFLoader.js';
import {clone as cloneSkinned} from '../vendor/utils/SkeletonUtils.js';
import {MeshoptDecoder} from '../vendor/libs/meshopt_decoder.module.js';

const $=id=>document.getElementById(id);
const stage=$('stage');
const status=t=>{ $('sceneStatus').textContent=t; $('notice').textContent=t; };
const qa=(id,t,k='pass')=>{const e=$(id);e.textContent=t;e.className=k;};
const motionButtons=Array.from(document.querySelectorAll('[data-motion]'));
const genderButtons=Array.from(document.querySelectorAll('[data-gender]'));
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}
catch(e){status('ამ მოწყობილობაზე WebGL ვერ ჩაირთო.');qa('qaModel','WebGL unavailable','fail');throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.setAttribute('aria-label','საბავშვო 3D ავატარის დათვალიერება');
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(33,1,.05,60);
scene.add(new THREE.HemisphereLight(0xe7f5ff,0x73829c,2.05));
const sun=new THREE.DirectionalLight(0xfff3e4,3.0);
sun.position.set(-3,6,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-3;sun.shadow.camera.right=3;
sun.shadow.camera.top=4;sun.shadow.camera.bottom=-3;scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0d0ff,1.5);fill.position.set(4,3,2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xe6dcff,.9);rim.position.set(1,4,-4);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(3.4,64),new THREE.MeshStandardMaterial({color:0x2c3d5f,roughness:1,transparent:true,opacity:.72}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;scene.add(floor);

// MAGICME_PRO_ENGLISH_VILLAGE_V1 — decorative scene; avatar and animation code unchanged.
const magicTown = new THREE.Group();
magicTown.name='English Village — Behind Avatar';
scene.add(magicTown);
const townClouds=[];
const townLamps=[];
const townMaterial=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:0.94,metalness:0});
const townWallColors=[0xd7b9a8,0xb3c8db,0xe9d19a,0xb5cfbf,0xe4b2bd,0xc0c6e0];
const townRoofColors=[0x5c607b,0x864d52,0x4c687f,0x705672];
const townWindowGlow=new THREE.MeshBasicMaterial({color:0xffe4a7,transparent:true,opacity:.88});
const townPane=new THREE.MeshStandardMaterial({color:0xfaf4e9,roughness:1});
const townBrown=townMaterial(0x65516a);
const townBlue=townMaterial(0x476b87);
const townGreen=townMaterial(0x5e9775);
const townFloor=new THREE.Mesh(new THREE.PlaneGeometry(20,12),townMaterial(0x6b8b7b));
townFloor.rotation.x=-Math.PI/2;townFloor.position.set(0,-.03,-7.0);townFloor.receiveShadow=false;magicTown.add(townFloor);
// The skyline is behind the characters and its sky uses a lightweight canvas texture.
const townSkyCanvas=document.createElement('canvas');townSkyCanvas.width=16;townSkyCanvas.height=256;
const townCtx=townSkyCanvas.getContext('2d');
if(townCtx){
 const townGradient=townCtx.createLinearGradient(0,0,0,256);
 townGradient.addColorStop(0,'#6fbbec');townGradient.addColorStop(.6,'#b4d8ef');townGradient.addColorStop(1,'#e2d8c8');
 townCtx.fillStyle=townGradient;townCtx.fillRect(0,0,16,256);
 const townSkyTex=new THREE.CanvasTexture(townSkyCanvas);
 townSkyTex.colorSpace=THREE.SRGBColorSpace;
 const townSky=new THREE.Mesh(new THREE.PlaneGeometry(36,17),new THREE.MeshBasicMaterial({map:townSkyTex,depthWrite:false}));
 townSky.position.set(0,3,-13.5);townSky.renderOrder=-100;magicTown.add(townSky);
}
function townAddHouse(x,z,w,h,colorIndex){
 const d=.58;
 const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),townMaterial(townWallColors[colorIndex%townWallColors.length]));
 wall.position.set(x,h/2,z);wall.receiveShadow=false;magicTown.add(wall);
 const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.83,.64,4),townMaterial(townRoofColors[colorIndex%townRoofColors.length]));
 roof.rotation.y=Math.PI/4;roof.position.set(x,h+.30,z);magicTown.add(roof);
 const door=new THREE.Mesh(new THREE.BoxGeometry(.30,.66,.05),townBrown);
 door.position.set(x,.33,z+d/2+.03);magicTown.add(door);
 const front=z+d/2+.035;
 for(const level of [.45,.79]){
  for(const side of [-1,1]){
   const lit=new THREE.Mesh(new THREE.BoxGeometry(.23,.28,.025),townWindowGlow);
   lit.position.set(x+side*w*.275,h*level,front);magicTown.add(lit);
   const bar=new THREE.Mesh(new THREE.BoxGeometry(.025,.30,.035),townPane);
   bar.position.set(lit.position.x,lit.position.y,front+.021);magicTown.add(bar);
   const sill=new THREE.Mesh(new THREE.BoxGeometry(.29,.035,.05),townPane);
   sill.position.set(lit.position.x,lit.position.y-.16,front+.03);magicTown.add(sill);
  }
 }
 const chimney=new THREE.Mesh(new THREE.BoxGeometry(.19,.46,.19),townMaterial(0x886d6e));
 chimney.position.set(x+w*.21,h+.55,z-.09);magicTown.add(chimney);
}
[
 [-4.35,-6.25,1.18,2.02,0],[-2.96,-6.60,1.12,2.35,1],
 [-1.57,-6.70,1.20,2.16,2],[.02,-6.95,1.40,2.62,3],
 [1.65,-6.65,1.24,2.10,4],[3.20,-6.40,1.19,2.38,5],
 [4.57,-6.15,1.10,2.13,0]
].forEach(p=>townAddHouse(...p));
function townAddTree(x,z){
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.075,.11,.73,8),townBrown);
 trunk.position.set(x,.36,z);magicTown.add(trunk);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.46,12,9),townGreen);
 crown.position.set(x,1.0,z);crown.scale.set(1,1.18,.82);magicTown.add(crown);
}
townAddTree(-4.95,-4.65);townAddTree(4.95,-4.65);townAddTree(2.5,-5.2);
const townRed=new THREE.MeshStandardMaterial({color:0xc73848,roughness:.67});
const townPhone=new THREE.Mesh(new THREE.BoxGeometry(.43,1.12,.4),townRed);
townPhone.position.set(-2.70,.56,-4.73);magicTown.add(townPhone);
const townPhoneWindow=new THREE.Mesh(new THREE.BoxGeometry(.29,.60,.026),new THREE.MeshBasicMaterial({color:0xafd4ec}));
townPhoneWindow.position.set(-2.70,.66,-4.51);magicTown.add(townPhoneWindow);
for(const x of [-3.85,3.86]){
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,1.45,9),townBrown);
 post.position.set(x,.725,-4.75);magicTown.add(post);
 const glow=new THREE.Mesh(new THREE.SphereGeometry(.14,12,10),new THREE.MeshBasicMaterial({color:0xffe4ad,transparent:true,opacity:.9}));
 glow.position.set(x,1.50,-4.75);magicTown.add(glow);townLamps.push(glow);
}
function townAddCloud(x,y,z,scale){
 const cloud=new THREE.Group();
 const cloudMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.66,depthWrite:false});
 [[-.24,0,.23],[0,.09,.30],[.29,0,.24]].forEach(p=>{
  const puff=new THREE.Mesh(new THREE.SphereGeometry(p[2]*scale,12,8),cloudMat);
  puff.position.set(p[0]*scale,p[1]*scale,0);cloud.add(puff);
 });
 cloud.position.set(x,y,z);cloud.userData.originX=x;magicTown.add(cloud);townClouds.push(cloud);
}
townAddCloud(-2.7,3.85,-8.4,1.5);townAddCloud(1.75,3.5,-8.5,1.25);townAddCloud(4.75,4.1,-9,1.3);

// MAGICME_PRO_CITY_STYLE_V4_20261031
// Decorative, lightweight animation only. Character bones, pose, animation mixer never touched.
// All decorations are mounted on the preexisting English Village group behind the avatar.
const mmv4Decor = new THREE.Group();
mmv4Decor.name='English Town Living Details V4';
magicTown.add(mmv4Decor);
const mmv4Mat=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.85,metalness:0});
const mmv4Unlit=(c)=>new THREE.MeshBasicMaterial({color:c});
const mmv4Red=mmv4Mat(0xc33342),mmv4Dark=mmv4Mat(0x24364a),mmv4Glass=mmv4Mat(0xa9d6ea);
const mmv4Gold=mmv4Unlit(0xffefb2),mmv4Leaf=mmv4Mat(0x5b987b);
const mmv4Box=(group,x,y,z,w,h,d,material)=>{
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=false;group.add(o);return o;
};
// A small red London bus travels behind the child, without intersecting the avatar scene.
const mmv4Bus=new THREE.Group();mmv4Decor.add(mmv4Bus);
mmv4Box(mmv4Bus,0,.42,0,1.17,.72,.46,mmv4Red);
mmv4Box(mmv4Bus,0,.80,0,1.10,.08,.46,mmv4Red);
mmv4Box(mmv4Bus,0,.57,.243,1.02,.23,.025,mmv4Glass);
mmv4Box(mmv4Bus,0,.34,.245,.98,.16,.025,mmv4Glass);
mmv4Box(mmv4Bus,0,.47,.26,1.11,.035,.035,mmv4Gold);
const mmv4Wheels=[];
for(const x of [-.37,.37])for(const z of [-.24,.24]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.125,.125,.075,12),mmv4Dark);
 wheel.rotation.x=Math.PI/2;wheel.position.set(x,.16,z);mmv4Bus.add(wheel);mmv4Wheels.push(wheel);
}
// Bushes sway gently. They do not cast shadows and are rendered behind the model.
const mmv4Bushes=[];
for(const [x,z,s] of [[-3.6,-5.0,.65],[3.3,-5.2,.65],[-1.0,-6.1,.50]]){
 const g=new THREE.Group();g.position.set(x,0,z);mmv4Decor.add(g);
 mmv4Box(g,0,.32,0,.10,.64,.10,mmv4Dark);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.34*s,10,8),mmv4Leaf);
 crown.position.set(0,.77*s,0);crown.scale.set(1,1.22,.82);g.add(crown);
 mmv4Bushes.push(g);
}
// Two distant birds flap their wings slowly (simple 3D decorative silhouettes).
const mmv4Birds=[];
const mmv4BirdMat=mmv4Mat(0x536986);
for(let i=0;i<2;i++){
 const bird=new THREE.Group();bird.position.set(i===0?-2.5:2.0,3.15+i*.30,-7.8);
 const center=new THREE.Mesh(new THREE.SphereGeometry(.065,8,6),mmv4BirdMat);bird.add(center);
 const wings=[];
 for(const s of [-1,1]){
  const wing=new THREE.Group();wing.position.x=s*.05;bird.add(wing);
  const span=mmv4Box(wing,s*.15,0,0,.29,.018,.08,mmv4BirdMat);
  span.rotation.z=s*.17;wings.push({wing,s});
 }
 mmv4Decor.add(bird);mmv4Birds.push({bird,wings,x:bird.position.x,y:bird.position.y});
}
// Soft chimney puffs; no particles in front of the characters.
const mmv4Puffs=[];
const mmv4PuffGeo=new THREE.SphereGeometry(.12,9,6);
for(const [x,z,h] of [[-2.96,-6.6,2.85],[1.65,-6.65,2.65]]){
 for(let i=0;i<3;i++){
  const mat=new THREE.MeshBasicMaterial({color:0xeaf0f1,transparent:true,opacity:.10,depthWrite:false});
  const puff=new THREE.Mesh(mmv4PuffGeo,mat);
  puff.position.set(x,h,z);mmv4Decor.add(puff);mmv4Puffs.push({puff,x,z,h,phase:i/3});
 }
}
// Scene animation runs inside the existing renderer loop; no extra RAF or observer.
const mmv4Reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function mmv4AnimateTown(now){
 if(mmv4Reduced.matches||document.hidden)return;
 const t=now*.001;
 const travel=((t/29)%1);
 mmv4Bus.position.set(-4.7+travel*9.4,0,-4.28);
 mmv4Wheels.forEach(w=>{w.rotation.z=-t*.47;});
 mmv4Bushes.forEach((g,i)=>{g.rotation.z=.035*Math.sin(t*.58+i*1.7);});
 mmv4Birds.forEach((b,i)=>{
  b.bird.position.x=b.x+.55*Math.sin(t*.19+i*2.0);
  b.bird.position.y=b.y+.07*Math.sin(t*.49+i);
  b.wings.forEach(({wing,s})=>{wing.rotation.z=s*(.12+.31*Math.sin(t*2.5+i*.8));});
 });
 mmv4Puffs.forEach(({puff,x,z,h,phase})=>{
  const f=(t*.18+phase)%1;
  puff.position.set(x+.35*f,h+.7*f,z);
  puff.scale.setScalar(.6+f*.75);
  puff.material.opacity=.13*(1-f);
 });
}

// MAGICME_PRO_LIVING_VILLAGE_V5_20261031
// Decorative visual replacement only. No avatar, clothing, auth, or animation-mixer edits.
// Keep V1/V4 installed for safe rollback, hide their visual containers.
magicTown.visible=false;
const mmv5Village = new THREE.Group();
mmv5Village.name='English Storybook Village V5';
scene.add(mmv5Village);
const mmv5Reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const mmv5Mat=(hex,roughness=.88)=>new THREE.MeshStandardMaterial({color:hex,roughness,metalness:0});
const mmv5Basic=(hex)=>new THREE.MeshBasicMaterial({color:hex});
const mmv5Accent=mmv5Mat(0xf8f1df),mmv5Frame=mmv5Mat(0xfffaf0),mmv5Ink=mmv5Mat(0x293f5e),mmv5Glass=mmv5Mat(0x9ac9da,.26);
const mmv5Stone=mmv5Mat(0xb2b9b3),mmv5Flower=[mmv5Mat(0xff739e),mmv5Mat(0xffd26a),mmv5Mat(0xc6a5ef)];
function mmv5Mesh(group,geometry,material,x=0,y=0,z=0){
 const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=false;group.add(m);return m;
}
const mmv5Box=(g,mat,x,y,z,w,h,d)=>mmv5Mesh(g,new THREE.BoxGeometry(w,h,d),mat,x,y,z);
const mmv5Sphere=(g,mat,x,y,z,r)=>mmv5Mesh(g,new THREE.SphereGeometry(r,10,8),mat,x,y,z);
const mmv5Cyl=(g,mat,x,y,z,r1,r2,h,n=10)=>mmv5Mesh(g,new THREE.CylinderGeometry(r1,r2,h,n),mat,x,y,z);
const mmv5RoofPalette=[0x6d6382,0x527892,0x936873,0x765b78,0x617f7b];
const mmv5Walls=[0xe5d1bc,0xe7c5c6,0xbfd6d2,0xd4d4ec,0xf2deb7];

// Sky and distant greenery. The foreground where the child stands remains untouched.
const mmv5SkyCanvas=document.createElement('canvas');mmv5SkyCanvas.width=8;mmv5SkyCanvas.height=256;
const mmv5SkyCtx=mmv5SkyCanvas.getContext('2d');
if(mmv5SkyCtx){
 const grad=mmv5SkyCtx.createLinearGradient(0,0,0,256);
 grad.addColorStop(0,'#86bbdb');grad.addColorStop(.55,'#c4e4ee');grad.addColorStop(1,'#f4e5cc');
 mmv5SkyCtx.fillStyle=grad;mmv5SkyCtx.fillRect(0,0,8,256);
 const tex=new THREE.CanvasTexture(mmv5SkyCanvas);tex.colorSpace=THREE.SRGBColorSpace;
 const sky=mmv5Mesh(mmv5Village,new THREE.PlaneGeometry(38,17),new THREE.MeshBasicMaterial({map:tex,depthWrite:false}),0,3.3,-13);
 sky.renderOrder=-100;
}
const mmv5Grass=mmv5Mat(0x8fac93),mmv5Path=mmv5Mat(0xbbbac0);
const mmv5Horizon=mmv5Box(mmv5Village,mmv5Grass,0,-.16,-6.7,21,.30,5.5);
mmv5Box(mmv5Village,mmv5Path,0,-.025,-4.10,19,.03,.85);
for(let i=-12;i<=12;i++)mmv5Box(mmv5Village,mmv5Stone,i*.72,-.009,-3.66,.055,.013,.82);

function mmv5Label(g,text,x,y,z,w,h,fg='#ffffff',bg='#38516c'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const context=canvas.getContext('2d');if(!context)return;
 context.fillStyle=bg;context.fillRect(0,0,512,128);
 context.fillStyle=fg;context.font='bold 57px Arial,sans-serif';context.textAlign='center';context.textBaseline='middle';context.fillText(text,256,64,492);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 mmv5Mesh(g,new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,depthWrite:false}),x,y,z);
}
function mmv5House(x,z,w,h,idx,sign){
 const g=new THREE.Group();mmv5Village.add(g);g.position.set(x,0,z);
 const wall=mmv5Mat(mmv5Walls[idx%mmv5Walls.length]);
 const roof=mmv5Mat(mmv5RoofPalette[idx%mmv5RoofPalette.length]);
 const depth=.72,front=depth/2+.012;
 mmv5Box(g,wall,0,h/2,0,w,h,depth);
 // Gabled roof (extruded triangle) with slender edge trims.
 const profile=new THREE.Shape();profile.moveTo(-w*.58,0);profile.lineTo(0,.55);profile.lineTo(w*.58,0);profile.closePath();
 const roofGeometry=new THREE.ExtrudeGeometry(profile,{depth:depth+.16,bevelEnabled:false,steps:1});
 mmv5Mesh(g,roofGeometry,roof,0,h,-depth/2-.08);
 for(const direction of [-1,1]){
  const trim=mmv5Box(g,mmv5Accent,direction*w*.29,h+.275,front+.045,w*.78,.045,.045);
  trim.rotation.z=-direction*.52;
 }
 // One individually framed door with brass knob and doorstep.
 const doorX=idx%2===0?0:w*.18;
 mmv5Box(g,mmv5Ink,doorX,.39,front,.36,.78,.055);
 mmv5Box(g,mmv5Frame,doorX,.79,front,.42,.042,.08);
 mmv5Sphere(g,mmv5Basic(0xffd577),doorX+.12,.37,front+.06,.018);
 mmv5Box(g,mmv5Stone,doorX,.018,front+.19,.50,.07,.32);
 // Distinct upper/lower windows; curtains, muntins, flower boxes.
 for(const row of [0,1])for(const side of [-1,1]){
  const xx=side*w*.29;
  if(row===0&&Math.abs(xx-doorX)<.40)continue;
  const yy=row===1?h*.71:h*.40;
  mmv5Box(g,mmv5Frame,xx,yy,front,.35,.43,.07);
  mmv5Box(g,mmv5Glass,xx,yy,front+.042,.28,.36,.01);
  mmv5Box(g,mmv5Frame,xx,yy,front+.055,.025,.37,.014);
  mmv5Box(g,mmv5Frame,xx,yy,front+.055,.29,.023,.014);
  mmv5Box(g,mmv5Stone,xx,yy-.23,front+.08,.43,.055,.16);
  for(const dx of [-.10,0,.10]){
   mmv5Sphere(g,mmv5Flower[(idx+row+(dx>0?1:0))%3],xx+dx,yy-.17,front+.14,.042);
  }
 }
 if(sign)mmv5Label(g,sign,0,h*.91,front+.045,.69,.18,'#ffffff','#3a5d70');
 // Brick-lined chimney built above and behind roofline.
 const chimX=w*.26;
 mmv5Box(g,mmv5Mat(0x9c7d78),chimX,h+.48,-.17,.18,.54,.19);
 mmv5Box(g,mmv5Stone,chimX,h+.75,-.17,.25,.06,.25);
 return {group:g,chimney:{x:x+chimX,y:h+.80,z:z-.17}};
}
const mmv5Homes=[
 mmv5House(-4.06,-5.65,1.45,2.05,0,null),
 mmv5House(-2.25,-5.98,1.51,2.30,1,'BOOKS'),
 mmv5House(-.40,-6.25,1.75,2.58,2,'BAKERY'),
 mmv5House(1.68,-6.05,1.52,2.35,3,'ENGLISH'),
 mmv5House(3.55,-5.72,1.49,2.11,4,null)
];

// Street tree crowns have small cluster shapes instead of single spheres.
const mmv5Trees=[];
function mmv5Tree(x,z,scale){
 const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);mmv5Village.add(g);
 const bark=mmv5Mat(0x6c614e),leaf1=mmv5Mat(0x537b62),leaf2=mmv5Mat(0x6b9b70);
 mmv5Cyl(g,bark,0,.43,0,.08,.12,.85);
 for(const [a,b,c,r,v] of [[-.17,1.05,0,.34,0],[.18,1.11,0,.32,1],[0,1.29,-.07,.32,0],[0,.98,.15,.29,1]]){
  const crown=mmv5Sphere(g,v?leaf2:leaf1,a,b,c,r);crown.scale.set(1.0,.90,.88);
 }
 mmv5Trees.push(g);
}
mmv5Tree(-4.92,-4.87,1);mmv5Tree(4.95,-4.89,1.06);mmv5Tree(2.75,-5.02,.65);

// Recognizable red telephone box and black street lamp.
const mmv5Phone=new THREE.Group();mmv5Phone.position.set(-3.05,0,-4.48);mmv5Village.add(mmv5Phone);
const mmv5Red=mmv5Mat(0xc7353e,.64),mmv5PhoneDark=mmv5Mat(0x912d35);
mmv5Box(mmv5Phone,mmv5Red,0,.71,0,.47,1.42,.42);
mmv5Box(mmv5Phone,mmv5PhoneDark,0,1.45,0,.56,.11,.50);
for(const side of [-1,1]){
 mmv5Box(mmv5Phone,mmv5Glass,side*.115,.84,.221,.17,.73,.022);
 for(const yy of [.63,.87,1.11])mmv5Box(mmv5Phone,mmv5Frame,side*.115,yy,.235,.17,.024,.018);
}
mmv5Label(mmv5Phone,'TELEPHONE',0,1.30,.233,.40,.095,'#ffeec8','#b6323c');
const mmv5Lamps=[];
for(const x of [-3.60,3.85]){
 const g=new THREE.Group();g.position.set(x,0,-4.56);mmv5Village.add(g);
 mmv5Cyl(g,mmv5Ink,0,.71,0,.032,.048,1.42);
 mmv5Box(g,mmv5Ink,0,1.52,0,.28,.10,.28);
 const glass=mmv5Mesh(g,new THREE.CylinderGeometry(.12,.16,.28,4),new THREE.MeshBasicMaterial({color:0xffe3a0,transparent:true,opacity:.86}),0,1.68,0);
 glass.rotation.y=Math.PI/4;
 mmv5Sphere(g,mmv5Basic(0x283b52),0,1.86,0,.067);mmv5Lamps.push(glass);
}

// Red London double-decker bus: distinct two rows of windows, grille, route display, rotating wheels.
const mmv5Bus=new THREE.Group();mmv5Village.add(mmv5Bus);
const mmv5BusRed=mmv5Mat(0xca2939,.50),mmv5BusRoof=mmv5Mat(0xa71f2b),mmv5Tyre=mmv5Mat(0x252b35),mmv5Hub=mmv5Mat(0xbfc7d2,.24);
mmv5Box(mmv5Bus,mmv5BusRed,0,.62,0,1.75,1.18,.55);
mmv5Box(mmv5Bus,mmv5BusRoof,0,1.25,0,1.77,.12,.56);
const mmv5Front=.279;
for(const row of [.57,1.05])for(const xx of [-.59,-.27,.05,.37,.69]){
 mmv5Box(mmv5Bus,mmv5Ink,xx,row,mmv5Front,.25,.33,.015);
 mmv5Box(mmv5Bus,mmv5Glass,xx,row,mmv5Front+.016,.21,.29,.009);
}
mmv5Box(mmv5Bus,mmv5Accent,0,.32,mmv5Front+.017,1.56,.12,.022);
mmv5Label(mmv5Bus,'LONDON 24',-.30,1.32,.30,.78,.12,'#f9db78','#252f42');
// Slightly protruding headlights, front grille and black rear step.
for(const xx of [-.70,.70])mmv5Sphere(mmv5Bus,mmv5Basic(0xffefc4),xx,.26,.31,.055);
mmv5Box(mmv5Bus,mmv5Ink,0,.20,.30,.45,.10,.024);
const mmv5BusWheels=[];
for(const xx of [-.61,.60])for(const zz of [-.31,.31]){
 const anchor=new THREE.Group();anchor.position.set(xx,.18,zz);mmv5Bus.add(anchor);
 const tyre=mmv5Cyl(anchor,mmv5Tyre,0,0,0,.17,.17,.10,16);tyre.rotation.x=Math.PI/2;
 const hub=mmv5Cyl(anchor,mmv5Hub,0,0,(zz>0?.057:-.057),.075,.075,.008,12);hub.rotation.x=Math.PI/2;
 mmv5BusWheels.push(anchor);
}
mmv5Bus.position.set(-7,0,-4.80);

// Clouds are grouped soft puffs; birds are small two-curve silhouettes, not boxy drones.
const mmv5Clouds=[];
const mmv5CloudMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.76,depthWrite:false});
for(const [i,x,y,z,s] of [[0,-3.2,3.65,-8.1,1.15],[1,1.35,3.85,-8.6,1.25],[2,4.0,3.35,-8.7,.91]]){
 const g=new THREE.Group();g.position.set(x,y,z);g.userData.baseX=x;g.userData.baseY=y;
 for(const [dx,dy,r] of [[-.38,0,.29],[-.09,.15,.39],[.32,.02,.31],[.05,-.10,.31]]){
  const puff=mmv5Sphere(g,mmv5CloudMat,dx*s,dy*s,0,r*s);puff.scale.z=.67;
 }
 mmv5Village.add(g);mmv5Clouds.push(g);
}
const mmv5Birds=[];
const mmv5BirdMat=mmv5Mat(0x50697c);
for(let i=0;i<3;i++){
 const bird=new THREE.Group();bird.position.set(-2.4+i*1.7,3.0+(i%2)*.30,-6.6);mmv5Village.add(bird);
 const wings=[];
 for(const dir of [-1,1]){
  const pivot=new THREE.Group();pivot.position.x=dir*.015;bird.add(pivot);
  const wing=mmv5Mesh(pivot,new THREE.CapsuleGeometry(.012,.17,2,4),mmv5BirdMat,dir*.11,.02,0);
  wing.rotation.z=dir*1.05;wings.push({pivot,dir});
 }
 mmv5Birds.push({bird,wings,baseX:bird.position.x,baseY:bird.position.y});
}

// Decorative chimney vapour. All puffs stay behind the avatar.
const mmv5Smoke=[];
const mmv5SmokeGeo=new THREE.SphereGeometry(.09,8,6);
for(const idx of [1,3]){
 const p=mmv5Homes[idx].chimney;
 for(let k=0;k<3;k++){
  const mat=new THREE.MeshBasicMaterial({color:0xf0f1ef,transparent:true,opacity:0,depthWrite:false});
  const puff=mmv5Mesh(mmv5Village,mmv5SmokeGeo,mat,p.x,p.y,p.z);
  mmv5Smoke.push({puff,p,k,idx});
 }
}
function mmv5Tick(now){
 if(document.hidden||mmv5Reduced.matches)return;
 const t=now*.001;
 mmv5Clouds.forEach((g,i)=>{g.position.x=g.userData.baseX+Math.sin(t*.15+i*1.9)*.28;g.position.y=g.userData.baseY+Math.sin(t*.26+i)*.035;});
 mmv5Trees.forEach((g,i)=>{g.rotation.z=.017*Math.sin(t*.70+i*2.1);});
 mmv5Lamps.forEach((l,i)=>{l.material.opacity=.83+.10*Math.sin(t*1.6+i);});
 // Once the bus exits the frame, wrap outside camera view (no sudden middle-frame jump).
 const u=(t/28)%1;
 mmv5Bus.position.x=-6.8+u*13.6;
 mmv5BusWheels.forEach(a=>{a.rotation.z=-t*.95;});
 mmv5Birds.forEach((b,i)=>{
  b.bird.position.x=b.baseX+Math.sin(t*.16+i)*.65;
  b.bird.position.y=b.baseY+Math.sin(t*.66+i)*.08;
  b.wings.forEach(({pivot,dir})=>{pivot.rotation.z=dir*(.09+Math.sin(t*2.4+i)*.31);});
 });
 mmv5Smoke.forEach(({puff,p,k,idx})=>{
  const u=(t*.14+k/3+idx*.12)%1;
  puff.position.set(p.x+.12*u,p.y+.61*u,p.z);
  puff.scale.setScalar(.6+u*1.1);
  puff.material.opacity=.16*(1-u);
 });
}

// MAGICME_PRO_FLOATING_ALPHABET_V6_20261031
// Village-only addition. No humanoid bones, animation mixer, outfit or auth edits.
// V5 bus is kept as an object for easy rollback, but is never drawn.
mmv5Bus.visible = false;

const mmv6Alphabet = new THREE.Group();
mmv6Alphabet.name = 'Soft Floating English Alphabet V6';
mmv5Village.add(mmv6Alphabet);

const mmv6Glyphs = [];
  // MAGICME_PRO_ALPHABET_26_V7
  // Exactly 26 small floating English letters, A-Z.
  // Decorations stay behind the avatar.

  const mmv6Letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map((letter,i) => {

    const row = Math.floor(i / 9);
    const col = i % 9;
    const count = row === 2 ? 8 : 9;

    const x = (col - (count - 1) / 2) * 0.76;
    const y = 2.88 + row * 0.43 + Math.sin(i * 1.3) * 0.035;
    const z = -5.35 - (i % 3) * 0.12;

    const scale = 0.265;

    const palette = [
      '#e2784c',
      '#487bad',
      '#9665b5',
      '#388b83',
      '#c06d86',
      '#657ac5',
      '#b88b43'
    ];

    return [
      letter,
      x,
      y,
      z,
      scale,
      palette[i % palette.length]
    ];
  });

function mmv6LetterTexture(letter, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Floating alphabet canvas unavailable');
  ctx.clearRect(0, 0, 256, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 166px Arial, sans-serif';
  ctx.lineWidth = 9;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(255,255,255,.40)';
  ctx.shadowBlur = 17;
  ctx.strokeStyle = 'rgba(44,70,108,.70)';
  ctx.strokeText(letter, 128, 135);
  ctx.shadowBlur = 0;
  ctx.fillStyle = color;
  ctx.fillText(letter, 128, 135);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

for (let i = 0; i < mmv6Letters.length; i++) {
  const [letter, x, y, z, scale, color] = mmv6Letters[i];
  const texture = mmv6LetterTexture(letter, color);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: .79,
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = 'English floating letter ' + letter;
  sprite.position.set(x, y, z);
  sprite.scale.set(scale, scale, 1);
  mmv6Alphabet.add(sprite);
  mmv6Glyphs.push({sprite, x, y, phase: i * .71});
}

// A few low-cost light motes add life without introducing extra lights/shadows.
const mmv6DustCount = 18;
const mmv6DustCoordinates = new Float32Array(mmv6DustCount * 3);
for (let i = 0; i < mmv6DustCount; i++) {
  const k = i * 3;
  mmv6DustCoordinates[k] = ((i * 23 % 31) / 30 - .5) * 7.4;
  mmv6DustCoordinates[k + 1] = 2.2 + (i * 17 % 23) / 23 * 2.1;
  mmv6DustCoordinates[k + 2] = -5.1 - (i % 4) * .17;
}
const mmv6DustGeometry = new THREE.BufferGeometry();
mmv6DustGeometry.setAttribute('position', new THREE.BufferAttribute(mmv6DustCoordinates, 3));
const mmv6DustMaterial = new THREE.PointsMaterial({
  size: .046,
  color: 0xfff7de,
  transparent: true,
  opacity: .52,
  depthWrite: false,
  sizeAttenuation: true
});
const mmv6Dust = new THREE.Points(mmv6DustGeometry, mmv6DustMaterial);
mmv6Dust.name = 'English town subtle sparkle';
mmv6Alphabet.add(mmv6Dust);

function mmv6AnimateAlphabet(now) {
  // Reduced motion is a browser preference, not a request to hide the letters.
  if (document.hidden || mmv5Reduced.matches) return;
  const t = now * .001;
  for (const g of mmv6Glyphs) {
    g.sprite.position.y = g.y + .085 * Math.sin(t * .57 + g.phase);
    g.sprite.position.x = g.x + .048 * Math.cos(t * .33 + g.phase);
    g.sprite.material.opacity = .72 + .11 * Math.sin(t * .63 + g.phase);
  }
  mmv6DustMaterial.opacity = .43 + .11 * Math.sin(t * .75);
}

const holder=new THREE.Group();scene.add(holder);
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const sourceCache=new Map(),clipCache=new Map();
const motionNames=['idle','walk','wave','highfive','dance'];
const clipFiles={
  girl:{idle:'f_idle_neutral_01.glb',walk:'f_walk_neutral_01.glb',wave:'f_wave_01.glb',highfive:'f_cheer_01.glb',dance:'f_dancing_neutral.glb'},
  boy:{idle:'m_idle_neutral_01.glb',walk:'m_walk_neutral_01.glb',wave:'m_wave_01.glb',highfive:'m_cheer_01.glb',dance:'m_dancing_neutral.glb'}
};
const loadedClips=new Map();
let character=null,mixer=null,currentAction=null,currentMode='idle',currentGender='girl',loadToken=0;
let selectedAngle=0,dragPointer=null,eyeTargets=[],blinkStart=-1,last=performance.now(),frames=0,fpsAt=last;
const clamp=THREE.MathUtils.clamp;
const clipUrl=(gender,motion)=>`/magicme-studio/assets/animations/${clipFiles[gender][motion]}`;
function fetchModel(gender){
 if(!sourceCache.has(gender))sourceCache.set(gender,loader.loadAsync(`/magicme-studio/assets/models/${gender}.glb`).catch(e=>{sourceCache.delete(gender);throw e;}));
 return sourceCache.get(gender);
}
function fetchClip(gender,motion){
 const key=`${gender}:${motion}`;
 if(!clipCache.has(key))clipCache.set(key,loader.loadAsync(clipUrl(gender,motion)).then(g=>{
   if(!g.animations.length)throw Error(`Motion has no tracks: ${key}`);
   return g.animations[0];
 }).catch(e=>{clipCache.delete(key);throw e;}));
 return clipCache.get(key);
}
function rebindClip(clip,nodes){
 // Source animation skeletons use Bip01; child rigs use Bip02.
 // Only bones present in this particular child model are retained.
 const tracks=[];
 for(const original of clip.tracks){
   const track=original.clone();
   let target=track.name.slice(0,track.name.lastIndexOf('.'));
   const suffix=track.name.slice(track.name.lastIndexOf('.'));
   if(target.startsWith('Bip01'))target='Bip02'+target.slice(5);
   if(!nodes.has(target))continue;
   track.name=target+suffix;
   tracks.push(track);
 }
 if(tracks.length<8)throw Error(`Rig mismatch: only ${tracks.length} matching animation tracks (${clip.name})`);
 return {clip:new THREE.AnimationClip(clip.name,clip.duration,tracks),tracks:tracks.length};
}
function readEyes(root){
 const result=[];let bones=0,skins=0;
 root.traverse(o=>{
  if(o.isBone)bones++;
  if(o.isSkinnedMesh)skins++;
  if(o.isMesh){o.castShadow=true; o.frustumCulled=false;
   if(o.morphTargetDictionary&&o.morphTargetInfluences)
    for(const [name,index] of Object.entries(o.morphTargetDictionary))
     if(/blink|eye.?close|eye.?shut/i.test(name))result.push({mesh:o,index});
  }
 });
 qa('qaSkeleton',`${skins} SkinnedMesh / ${bones} bones`,skins&&bones?'pass':'fail');
 qa('qaBlink',result.length?'მორფ-ანიმაცია ხელმისაწვდომია':'Blink targets არ არის','warn');
 const blinkButton=motionButtons.find(b=>b.dataset.motion==='blink');
 blinkButton.disabled=!result.length;
 return {result,skins,bones};
}
function setSelectedButtons(){
 genderButtons.forEach(b=>{const v=b.dataset.gender===currentGender;b.classList.toggle('selected',v);b.setAttribute('aria-pressed',String(v));});
 motionButtons.forEach(b=>{const v=b.dataset.motion===currentMode;b.classList.toggle('selected',v);b.setAttribute('aria-pressed',String(v));});
}
function playMotion(mode){
 if(!character||!mixer||!loadedClips.has(`${currentGender}:${mode}`))return;
 const clip=loadedClips.get(`${currentGender}:${mode}`);
 const next=mixer.clipAction(clip);
 if(next===currentAction)return;
 next.reset().enabled=true;
 next.setEffectiveTimeScale(1).setEffectiveWeight(1);
 const looping=mode==='idle'||mode==='walk'||mode==='dance';
 next.setLoop(looping?THREE.LoopRepeat:THREE.LoopOnce,looping?Infinity:1);
 next.clampWhenFinished=!looping;
 next.fadeIn(.28).play();
 if(currentAction&&currentAction!==next)currentAction.fadeOut(.28);
 currentAction=next;currentMode=mode;setSelectedButtons();
 qa('qaArms',mode==='highfive'?'Cheer კლიპი (High Five ჯერ არაა სრულყოფილი)':'მზა ანიმაციები: Wave / Dance','warn');
 status(`${currentGender==='girl'?'Girl':'Boy'} · ${mode}${mode==='highfive'?' — Cheer-ის ჟესტი (High Five საცდელი)':''}`);
}
async function selectGender(gender){
 if(!['girl','boy'].includes(gender))return;
 const token=++loadToken;
 status(`${gender==='girl'?'გოგოს':'ბიჭის'} საბავშვო 3D მოდელი იტვირთება…`);
 qa('qaModel','იტვირთება…','warn');
 for(const b of motionButtons)b.disabled=true;
 try{
  await MeshoptDecoder.ready;
  const [gltf,...motionSources]=await Promise.all([fetchModel(gender),...motionNames.map(n=>fetchClip(gender,n))]);
  if(token!==loadToken)return;
  const model=cloneSkinned(gltf.scene);
  const modelNodes=new Set();model.traverse(o=>{if(o.name)modelNodes.add(o.name);});
  const rebound=new Map();let nTracks=0;
  for(let i=0;i<motionNames.length;i++){
   const result=rebindClip(motionSources[i],modelNodes);
   rebound.set(motionNames[i],result.clip);nTracks+=result.tracks;
  }
  // Validate every clip BEFORE touching the visible character.
  const beforeSize=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());if(beforeSize.z>beforeSize.y*1.7){model.rotation.x=-Math.PI/2;model.updateMatrixWorld(true);}const rawBox=new THREE.Box3().setFromObject(model),dimensions=rawBox.getSize(new THREE.Vector3());
  console.info('MAGIC ME PRO CHILD SIZE X='+dimensions.x+' Y='+dimensions.y+' Z='+dimensions.z);if(!Number.isFinite(dimensions.y)||dimensions.y<=0.0001||dimensions.y>10000)throw Error('Invalid child model dimensions: '+dimensions.y);
  if(mixer)mixer.stopAllAction();
  holder.clear();holder.position.set(0,0,0);holder.rotation.set(0,0,0);
  const scale=1.5/dimensions.y;model.scale.setScalar(scale);holder.add(model);
  model.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(model),center=bb.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(center.x,bb.min.y,center.z));model.updateMatrixWorld(true);
  character=model;mixer=new THREE.AnimationMixer(model);currentAction=null;currentMode='none';currentGender=gender;selectedAngle=0;
  const eyes=readEyes(model);eyeTargets=eyes.result;blinkStart=-1;
  for(const [name,clip] of rebound)loadedClips.set(`${gender}:${name}`,clip);
  qa('qaModel',`${gender==='girl'?'Girl':'Boy'} · Child GLB`,'pass');
  qa('qaClips',`5 native clips · ${nTracks} bone tracks`,'pass');
  for(const b of motionButtons)b.disabled=b.dataset.motion==='blink'&&!eyeTargets.length;
  playMotion('idle');
  // MAGICME_PRO_ANIMATED_UPRIGHT_V1
  mixer.update(.35);
  model.updateMatrixWorld(true);
  const alignmentBones=[];
  model.traverse(o=>{if(o.isBone)alignmentBones.push(o);});
  const headBone=alignmentBones.find(o=>/(?:^|[ _])head$/i.test(o.name));
  const footBones=alignmentBones.filter(o=>/(?:^|[ _])(?:l |r |left |right )?foot$/i.test(o.name));
  if(headBone&&footBones.length>=2){
    const headPosition=headBone.getWorldPosition(new THREE.Vector3());
    const feetPosition=new THREE.Vector3();
    for(const foot of footBones)feetPosition.add(foot.getWorldPosition(new THREE.Vector3()));
    feetPosition.divideScalar(footBones.length);
    const up=headPosition.sub(feetPosition);
    if(up.lengthSq()>.01){
      const q=new THREE.Quaternion().setFromUnitVectors(up.normalize(),new THREE.Vector3(0,1,0));
      model.quaternion.premultiply(q);
      model.updateMatrixWorld(true);
    }
    model.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox();}});
    const posedBox=new THREE.Box3().setFromObject(model);
    if(!posedBox.isEmpty()){
      const posedCenter=posedBox.getCenter(new THREE.Vector3());
      model.position.sub(new THREE.Vector3(posedCenter.x,posedBox.min.y,posedCenter.z));
      model.updateMatrixWorld(true);
    }
  }else{
    console.warn('MAGIC ME PRO: head/foot alignment bones not found');
  }
 }catch(e){
  if(token!==loadToken)return;
  console.error('MAGIC ME PRO CHILD AVATAR LOAD FAILED:',e);
  qa('qaModel',`ჩატვირთვის ხარვეზი: ${e.message}`,'fail');
  status('საბავშვო ავატარი ვერ ჩაიტვირთა. ნახე Console (Ctrl+Shift+J).');
  for(const b of motionButtons)b.disabled=true;
 }
}
function selectMotion(mode){
 if(!character)return;
 if(mode==='blink'){
  if(!eyeTargets.length){status('მოდელს თვალის დახურვის მონაცემები არ აქვს; Blink მიუწვდომელია.');return;}
  blinkStart=performance.now();status('Blink · დამოუკიდებელი სახის ანიმაცია');return;
 }
 playMotion(mode);
}
function fit(){
 const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
 camera.aspect=w/h;
 const vfov=THREE.MathUtils.degToRad(camera.fov),hfov=2*Math.atan(Math.tan(vfov/2)*camera.aspect);
 const distance=Math.max(1.91/(2*Math.tan(vfov/2)),1.7/(2*Math.tan(hfov/2)),2.95);
 camera.position.set(0,.79,distance);camera.lookAt(0,.76,0);camera.updateProjectionMatrix();
 renderer.setSize(w,h,false);
}
const observer=new ResizeObserver(fit);observer.observe(stage);fit();
function draw(now){
 const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 if(mixer&&character){
  if(!document.hidden&&!reduced.matches)mixer.update(dt);
  holder.rotation.y=selectedAngle;
  if(eyeTargets.length){
   const cycle=now%4900;
   const automatic=cycle<150?Math.sin(Math.PI*cycle/150):0;
   const t=(now-blinkStart)/1000;
   const manual=blinkStart>=0&&t>=0&&t<=.32?Math.sin(Math.PI*t/.32):0;
   for(const target of eyeTargets)target.mesh.morphTargetInfluences[target.index]=Math.max(automatic,manual);
  }
 }
 
 // MAGICME_PRO_ENGLISH_VILLAGE_FRAME_V1 — gentle motion without changing avatar pose.
 const townClock=performance.now()*.001;
 townClouds.forEach((cloud,i)=>{
  cloud.position.x=cloud.userData.originX+.35*Math.sin(townClock*.12+i*1.9);
  cloud.position.y=(i===0?3.85:i===1?3.5:4.1)+.035*Math.sin(townClock*.36+i);
 });
 townLamps.forEach((lamp,i)=>{lamp.material.opacity=.82+.12*Math.sin(townClock*1.7+i*2);});

 mmv4AnimateTown(now);
 mmv5Tick(now);
 mmv6AnimateAlphabet(now);
 renderer.render(scene,camera);
 frames++;if(now-fpsAt>1300){qa('qaFps',String(Math.round(frames*1000/(now-fpsAt))),'warn');fpsAt=now;frames=0;}
}
// Non-looping gesture returns naturally to Idle after source clip finishes.
// Subscribe after mixer construction in the animation frame through a safe one-time guard.
let observedMixer=null;
renderer.setAnimationLoop(now=>{
 if(mixer&&observedMixer!==mixer){
  observedMixer=mixer;
  mixer.addEventListener('finished',e=>{
   if(e.action===currentAction&&['wave','highfive'].includes(currentMode))playMotion('idle');
  });
 }
 draw(now);
});
let pointerX=null;
stage.addEventListener('pointerdown',e=>{pointerX=e.clientX;try{stage.setPointerCapture(e.pointerId)}catch(_){}});
stage.addEventListener('pointermove',e=>{if(pointerX===null)return;selectedAngle=clamp(selectedAngle+(e.clientX-pointerX)*.008,-1.5,1.5);pointerX=e.clientX;});
for(const evt of ['pointerup','pointercancel','lostpointercapture'])stage.addEventListener(evt,()=>{pointerX=null;});
for(const b of genderButtons)b.addEventListener('click',()=>selectGender(b.dataset.gender));
for(const b of motionButtons)b.addEventListener('click',()=>selectMotion(b.dataset.motion));
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);status('WebGL შეწყდა. გადატვირთე გვერდი.');});
window.addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);observer.disconnect();});
selectGender('girl');
// MAGICME_PRO_OUTFITS_V1
const MAGICME_PRO_OUTFITS={
  girl:[
    {label:'💗 Pink Street',top:0xf23cae,sleeve:0xf5f7fb,pants:0xd9e4f5,shoes:0xffb3df},
    {label:'💙 Sky Denim',top:0x74b9ff,sleeve:0xeef5ff,pants:0x93a9c7,shoes:0xffffff},
    {label:'💚 Mint Fresh',top:0x5ed3b3,sleeve:0xf4fffb,pants:0xe7edf5,shoes:0xfff2d8}
  ],
  boy:[
    {label:'💙 Blue Street',top:0x2979ff,sleeve:0x2979ff,pants:0xb8c7d9,shoes:0xf5f7fb},
    {label:'❤️ Red Urban',top:0xe54848,sleeve:0xe54848,pants:0x30384a,shoes:0xffffff},
    {label:'🖤 Black Sport',top:0x1f2430,sleeve:0x1f2430,pants:0x9aa7b8,shoes:0xdddfe6}
  ]
};
const magicMeOutfitState={girl:0,boy:0};

function mmEnsureOutfitStyles(){
  if(document.getElementById('magicme-outfit-style-v1')) return;
  const st=document.createElement('style');
  st.id='magicme-outfit-style-v1';
  st.textContent=`
    #magicOutfitSection{
      margin-top:14px;padding:12px 12px 13px;border-radius:14px;
      border:1px solid rgba(125,170,255,.28);
      background:linear-gradient(180deg,rgba(14,29,62,.88),rgba(11,23,50,.92));
      box-shadow:0 10px 24px rgba(0,0,0,.18);
      color:#eef6ff
    }
    #magicOutfitSection .magic-outfit-overline{
      font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7fd6ff;margin-bottom:6px
    }
    #magicOutfitSection h3{margin:0 0 8px;font-size:20px;line-height:1.15}
    #magicOutfitCurrent{
      display:inline-block;margin:0 0 8px;padding:6px 10px;border-radius:999px;
      background:rgba(123,92,255,.18);border:1px solid rgba(168,149,255,.28);font-size:12px
    }
    #magicOutfitHint{margin:0 0 10px;color:#bcd6f7;font-size:12px}
    #magicOutfitButtons{display:grid;grid-template-columns:1fr;gap:8px}
    .magic-outfit-btn{
      width:100%;padding:10px 12px;border-radius:12px;cursor:pointer;
      border:1px solid rgba(130,170,255,.24);
      background:rgba(14,27,54,.85);color:#eef6ff;font:inherit;text-align:left;
      transition:transform .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease
    }
    .magic-outfit-btn:hover{
      transform:translateY(-1px);border-color:rgba(115,219,255,.55);
      box-shadow:0 8px 20px rgba(0,0,0,.18)
    }
    .magic-outfit-btn.active{
      background:linear-gradient(180deg,rgba(123,92,255,.30),rgba(51,98,255,.22));
      border-color:rgba(145,199,255,.72)
    }
    body>#magicOutfitSection{
      position:fixed;right:16px;bottom:16px;z-index:25;width:min(320px,calc(100vw - 24px))
    }
    @media (max-width: 980px){
      body>#magicOutfitSection{left:12px;right:12px;bottom:12px;width:auto}
    }
  `;
  document.head.appendChild(st);
}

function mmActiveGender(){
  const active=document.querySelector('[data-gender].selected,[data-gender][aria-pressed="true"],[data-gender].active');
  if(active){
    const raw=String(active.dataset.gender||active.textContent||'').toLowerCase();
    if(raw.includes('boy')) return 'boy';
    if(raw.includes('girl')) return 'girl';
    if(raw==='1' || raw.includes('male')) return 'boy';
    if(raw==='0' || raw.includes('female')) return 'girl';
  }
  const qa=(document.body.innerText||'').toLowerCase();
  if(qa.includes('boy ·') || qa.includes('boy -')) return 'boy';
  return 'girl';
}

function mmEnsureClonedMaterial(node){
  if(Array.isArray(node.material)){
    node.material=node.material.map(m=>{
      if(!m) return m;
      if(m.userData && m.userData.magicOutfitClone) return m;
      const c=m.clone();
      c.userData=Object.assign({},m.userData,{magicOutfitClone:true});
      return c;
    });
  }else if(node.material){
    if(!(node.material.userData && node.material.userData.magicOutfitClone)){
      const c=node.material.clone();
      c.userData=Object.assign({},node.material.userData,{magicOutfitClone:true});
      node.material=c;
    }
  }
}

function mmTintMaterial(mat,hex,kind){
  if(!mat) return;
  if(mat.color) mat.color.setHex(hex);
  if('roughness' in mat){
    if(kind==='shoes'){mat.roughness=.30;mat.metalness=.03}
    else if(kind==='top'){mat.roughness=.70;mat.metalness=.02}
    else{mat.roughness=.82;mat.metalness=.01}
  }
  if('emissive' in mat){
    mat.emissive.setHex(0x000000);
    if(kind==='shoes'){mat.emissive.setHex(0x0f0f12);mat.emissiveIntensity=.02}
  }
  mat.needsUpdate=true;
}

function mmClassifyPart(node,modelBox,nodeBox){
  const matName=Array.isArray(node.material)
    ? node.material.map(m=>m&&m.name||'').join(' ')
    : (node.material&&node.material.name)||'';
  const name=(String(node.name||'')+' '+String(matName||'')).toLowerCase();
  // Shared child body material includes clothes + hands + legs + shoes. Do not recolor it directly.
  if(/\bcf001_body\b|\bcm001_body\b/.test(name)) return null;

  if(/hair|brow|lash|eye|teeth|tooth|mouth|tongue|skin|face|head|ear|neck|hand|finger/.test(name)) return null;
  if(/shoe|sneaker|trainer|boot/.test(name)) return 'shoes';
  if(/pant|trouser|jean|short|leg/.test(name)) return 'pants';
  if(/shirt|sweater|hood|jacket|coat|top|torso|chest|body|tee/.test(name)) return 'top';
  if(/sleeve|arm/.test(name)) return 'sleeve';

  const total=Math.max(0.001,modelBox.max.y-modelBox.min.y);
  const cy=(nodeBox.min.y+nodeBox.max.y)/2;
  const rel=(cy-modelBox.min.y)/total;
  const height=nodeBox.max.y-nodeBox.min.y;
  const width=nodeBox.max.x-nodeBox.min.x;

  if(rel<0.12) return 'shoes';
  if(rel>=0.12 && rel<0.52) return 'pants';
  if(rel>=0.46 && rel<0.84 && width>0.10 && height>0.07) return 'top';
  return null;
}

function mmApplyOutfit(){
  if(!holder || !holder.children || !holder.children.length) return;
  const gender=mmActiveGender();
  const preset=MAGICME_PRO_OUTFITS[gender][magicMeOutfitState[gender]||0];
  const modelBox=new THREE.Box3().setFromObject(holder);

  holder.traverse(node=>{
    if((!node.isMesh && !node.isSkinnedMesh) || !node.material) return;
    mmEnsureClonedMaterial(node);
    const nodeBox=new THREE.Box3().setFromObject(node);
    const kind=mmClassifyPart(node,modelBox,nodeBox);
    if(!kind) return;
    const mats=Array.isArray(node.material)?node.material:[node.material];
    for(const m of mats){
      if(kind==='top') mmTintMaterial(m,preset.top,'top');
      if(kind==='sleeve') mmTintMaterial(m,preset.sleeve || preset.top,'top');
      if(kind==='pants') mmTintMaterial(m,preset.pants,'pants');
      if(kind==='shoes') mmTintMaterial(m,preset.shoes,'shoes');
    }
  });

  const badge=document.getElementById('magicOutfitCurrent');
  if(badge) badge.textContent=(gender==='girl'?'Girl':'Boy')+' · '+preset.label;

  document.querySelectorAll('#magicOutfitButtons .magic-outfit-btn').forEach(btn=>{
    btn.classList.toggle('active',Number(btn.dataset.index)===(magicMeOutfitState[gender]||0));
  });
}

function mmRenderOutfitButtons(){
  const wrap=document.getElementById('magicOutfitButtons');
  if(!wrap) return;
  const gender=mmActiveGender();
  const title=document.getElementById('magicOutfitHint');
  if(title) title.textContent=gender==='girl'
    ? 'ანამედროვე outfit-ები გოგოსვის'
    : 'ანამედროვე outfit-ები ბიისვის';
  wrap.innerHTML='';
  MAGICME_PRO_OUTFITS[gender].forEach((item,index)=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='magic-outfit-btn'+((magicMeOutfitState[gender]||0)===index?' active':'');
    b.dataset.index=String(index);
    b.textContent=item.label;
    b.addEventListener('click',()=>{
      magicMeOutfitState[gender]=index;
      mmApplyOutfit();
      mmRenderOutfitButtons();
    });
    wrap.appendChild(b);
  });
  mmApplyOutfit();
}

function mmEnsureOutfitPanel(){
  mmEnsureOutfitStyles();
  if(document.getElementById('magicOutfitSection')) return;
  const panel=document.createElement('section');
  panel.id='magicOutfitSection';
  panel.innerHTML='' +
    '<div class="magic-outfit-overline">04 / STYLE</div>' +
    '<h3>Outfit Selector</h3>' +
    '<div id="magicOutfitCurrent">Girl · Pink Street</div>' +
    '<p id="magicOutfitHint">ანამედროვე outfit-ები გოგოსვის</p>' +
    '<div id="magicOutfitButtons"></div>';

  const motionButton=document.querySelector('[data-motion]');
  const parent=
    document.querySelector('.right-panel,.sidebar,.controls-panel,.ui-right,.ui-side') ||
    (motionButton ? motionButton.closest('section,div')?.parentElement : null) ||
    document.body;

  parent.appendChild(panel);
  mmRenderOutfitButtons();
}

function mmQueueOutfitApply(){
  clearTimeout(window.__magicMeOutfitTimer);
  window.__magicMeOutfitTimer=setTimeout(()=>{
    mmRenderOutfitButtons();
    mmApplyOutfit();
  },140);
}

mmEnsureOutfitPanel();
mmQueueOutfitApply();

document.querySelectorAll('[data-gender]').forEach(btn=>{
  btn.addEventListener('click',()=>setTimeout(mmQueueOutfitApply,120));
});

const mmOutfitObserver=new MutationObserver(()=>mmQueueOutfitApply());
// Fixed: THREE.Group is not a DOM Node. Gender buttons already refresh outfits.
window.addEventListener('resize',mmQueueOutfitApply);


// MAGICME_PRO_STYLE_STAGE2_20261031
// Standalone optional sneaker material palettes, hair color, and bone-attached wristband.
// Does not add/remodel footwear geometry, and does not change humanoid animations.
{
  const mm2Prefs={
    girl:{shoe:0,hair:0,band:0},
    boy:{shoe:0,hair:0,band:0}
  };
  const mm2Shoes=[
    {name:'Classic White',color:0xf7f8ff},
    {name:'Sky Blue',color:0x7ed2ff},
    {name:'Sunset Pink',color:0xff98c2},
    {name:'Midnight',color:0x202736}
  ];
  const mm2Hair=[
    {name:'Natural',color:null},
    {name:'Chestnut',color:0x70452e},
    {name:'Warm Brown',color:0x9b6641},
    {name:'Dark Brown',color:0x2f2323}
  ];
  const mm2Bands=[
    {name:'None',color:null},
    {name:'Sky Bracelet',color:0x54c8ec},
    {name:'Pink Bracelet',color:0xe68ecf},
    {name:'Silver Bracelet',color:0xc4d2e3}
  ];
  let mm2CurrentAvatar=null;
  let mm2OriginalHair=new WeakMap();
  let mm2Accessory=null;
  let mm2UpdateScheduled=false;
  let mm2Parts=[];
  let mm2HairParts=[];
  function mm2Gender(){return currentGender==='boy'?'boy':'girl';}
  function mm2Model(){return character&&character.isObject3D?character:null;}
  function mm2ArrayMat(node){return Array.isArray(node.material)?node.material:[node.material];}
  function mm2EnsureMaterials(node){
    if(typeof mmEnsureClonedMaterial==='function')mmEnsureClonedMaterial(node);
  }
  function mm2DiscoverParts(){
    const model=mm2Model();mm2Parts=[];mm2HairParts=[];
    if(!model)return;
    const bounds=new THREE.Box3().setFromObject(model);
    if(bounds.isEmpty())return;
    const total=Math.max(.01,bounds.max.y-bounds.min.y);
    model.traverse(node=>{
      if(!node.isMesh||!node.material)return;
      const nbox=new THREE.Box3().setFromObject(node);
      if(nbox.isEmpty())return;
      const cy=(nbox.min.y+nbox.max.y)*.5;
      const label=[node.name,...mm2ArrayMat(node).map(m=>m?.name||'')].join(' ').toLowerCase();
      const low=nbox.max.y<bounds.min.y+total*.28 && cy<bounds.min.y+total*.22;
      const shoeNamed=/(?:shoe|sneaker|trainer|boot|sole|shoelace|footwear)/.test(label);
      const skinNamed=/(?:skin|face|head|hair|mouth|eyes?|brows?|lashes|teeth|finger|hand)/.test(label);
      if((shoeNamed&&cy<bounds.min.y+total*.37)||(low&&!skinNamed))mm2Parts.push(node);
      // Hair never uses height-only guessing: that could accidentally recolor face/skin.
      if(/(?:hair|ponytail|braid|fringe|bangs)/.test(label)&&!/(?:skin|eye|face)/.test(label))mm2HairParts.push(node);
    });
  }
  function mm2SetMatColor(mat,hex){
    if(!mat?.color)return;
    mat.color.setHex(hex);
    if('roughness' in mat)mat.roughness=.43;
    if('metalness' in mat)mat.metalness=.035;
    mat.needsUpdate=true;
  }
  function mm2PaintShoe(){
    const pref=mm2Prefs[mm2Gender()];
    const palette=mm2Shoes[pref.shoe];
    let count=0;
    for(const mesh of mm2Parts){
      mm2EnsureMaterials(mesh);
      for(const mat of mm2ArrayMat(mesh)){if(mat?.color){mm2SetMatColor(mat,palette.color);count++;}}
    }
    return count;
  }
  function mm2PaintHair(){
    const pref=mm2Prefs[mm2Gender()];
    const palette=mm2Hair[pref.hair];
    let count=0;
    for(const mesh of mm2HairParts){
      mm2EnsureMaterials(mesh);
      for(const mat of mm2ArrayMat(mesh)){
        if(!mat?.color)continue;
        if(!mm2OriginalHair.has(mat))mm2OriginalHair.set(mat,mat.color.clone());
        if(palette.color===null)mat.color.copy(mm2OriginalHair.get(mat));
        else mat.color.setHex(palette.color);
        mat.needsUpdate=true;count++;
      }
    }
    return count;
  }
  function mm2FindHand(){
    const model=mm2Model();if(!model)return null;
    const candidates=[];
    model.traverse(n=>{if(n.isBone)candidates.push(n);});
    return candidates.find(n=>/\b(?:right|r)\s*(?:hand|wrist)\b/i.test(n.name)) ||
       candidates.find(n=>/(?:bip02|bip01).*rhand\b/i.test(n.name)) || null;
  }
  function mm2BandUpdate(){
    const preset=mm2Bands[mm2Prefs[mm2Gender()].band];
    if(!preset.color){
      if(mm2Accessory?.parent)mm2Accessory.parent.remove(mm2Accessory);
      mm2Accessory=null;
      return true;
    }
    const bone=mm2FindHand();if(!bone)return false;
    if(mm2Accessory?.parent===bone){
      mm2Accessory.material.color.setHex(preset.color);
      return true;
    }
    if(mm2Accessory?.parent)mm2Accessory.parent.remove(mm2Accessory);
    // Small ring attached to the wrist/hand bone, not a free-floating 3D object.
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(.022,.006,7,18),
      new THREE.MeshStandardMaterial({color:preset.color,roughness:.45,metalness:.17})
    );
    ring.name='MagicMeOptionalWristband';
    ring.rotation.x=Math.PI/2;
    ring.castShadow=false;
    bone.add(ring);mm2Accessory=ring;
    return true;
  }
  function mm2MakeButtons(container,items,key){
    container.replaceChildren();const gender=mm2Gender();
    for(let index=0;index<items.length;index++){
      const data=items[index],btn=document.createElement('button');
      btn.type='button';btn.className='mm2-choice';btn.textContent=data.name;
      btn.setAttribute('aria-pressed',String(mm2Prefs[gender][key]===index));
      if(mm2Prefs[gender][key]===index)btn.classList.add('active');
      btn.addEventListener('click',()=>{
        mm2Prefs[mm2Gender()][key]=index;
        mm2Apply();
      });
      container.appendChild(btn);
    }
  }
  function mm2Apply(){
    const model=mm2Model();if(!model)return;
    if(model!==mm2CurrentAvatar){
      mm2CurrentAvatar=model;
      mm2OriginalHair=new WeakMap();
      mm2DiscoverParts();
      mm2Accessory=null;
    }
    const shoes=mm2PaintShoe(),hair=mm2PaintHair(),band=mm2BandUpdate();
    const hint=document.getElementById('mm2Status');
    if(hint)hint.textContent=`Sneaker parts: ${shoes?shoes:'not found'} · Hair parts: ${hair?hair:'not found'}${band?'':' · Wrist bone unavailable'}. These are material styles, not replacement 3D footwear.`;
    const shoeEl=document.getElementById('mm2Shoe'),hairEl=document.getElementById('mm2Hair'),bandEl=document.getElementById('mm2Band');
    if(shoeEl)mm2MakeButtons(shoeEl,mm2Shoes,'shoe');
    if(hairEl)mm2MakeButtons(hairEl,mm2Hair,'hair');
    if(bandEl)mm2MakeButtons(bandEl,mm2Bands,'band');
  }
  function mm2Queue(){
    if(mm2UpdateScheduled)return;
    mm2UpdateScheduled=true;
    setTimeout(()=>{mm2UpdateScheduled=false;mm2Apply();},210);
  }
  const mm2Style=document.createElement('style');
  mm2Style.id='magicme-style-stage2-css';
  mm2Style.textContent=`
  #mm2Panel{margin-top:12px}
  #mm2Panel h2{margin:5px 0 10px;font-size:1.1rem}
  #mm2Panel h3{font-size:.83rem;line-height:1.4;margin:12px 0 7px}
  #mm2Panel .mm2-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
  #mm2Panel .mm2-choice{font:inherit;color:#eff8ff;background:rgba(47,71,113,.54);border:1px solid #45638b;border-radius:9px;padding:8px 4px;cursor:pointer;min-height:35px}
  #mm2Panel .mm2-choice.active,#mm2Panel .mm2-choice[aria-pressed="true"]{background:#554c88;border-color:#bba4ef}
  #mm2Panel .mm2-choice:focus-visible{outline:2px solid #91d9ff;outline-offset:2px}
  #mm2Panel .mm2-note{font-size:.71rem;color:#afc5e7;line-height:1.55;margin-top:8px}
  `;
  document.head.appendChild(mm2Style);
  const mm2Panel=document.createElement('section');
  mm2Panel.id='mm2Panel';mm2Panel.className='panel';
  mm2Panel.innerHTML=`<p class="eyebrow">05 / SNEAKERS & ACCESSORIES</p><h2>Style Details</h2>
    <h3>👟 Sneaker Colors</h3><div class="mm2-options" id="mm2Shoe"></div>
    <h3>💇 Hair Colors</h3><div class="mm2-options" id="mm2Hair"></div>
    <h3>⌚ Optional Wristband</h3><div class="mm2-options" id="mm2Band"></div>
    <p id="mm2Status" class="mm2-note" role="status">3D model finishing…</p>`;
  const mm2Target=document.querySelector('.controls') || document.querySelector('aside') || document.body;
  mm2Target.appendChild(mm2Panel);
  // Existing outfit selector calls this after each recolor. Keep sneaker/hair choices on top.
  if(typeof mmApplyOutfit==='function'){
    const previous=mmApplyOutfit;
    mmApplyOutfit=function(...args){
      const result=previous.apply(this,args);
      mm2Queue();
      return result;
    };
  }
  // STYLE V2 FIX: Three.js objects are not HTML nodes.
  const mm2AvatarCheck=setInterval(()=>{
    if(mm2Model()!==mm2CurrentAvatar)mm2Queue();
  },400);
  window.addEventListener('pagehide',()=>{
    clearInterval(mm2AvatarCheck);
  },{once:true});
  for(const b of document.querySelectorAll('[data-gender]'))b.addEventListener('click',()=>setTimeout(mm2Queue,300));
  mm2Queue();
}



// MAGICME_PRO_TEXTURE_STYLE_V3_20261031
// Targeted atlas recoloring: body clothes/shoes only. Head and skin UV pixels are byte-for-byte unchanged.
// No geometry changes or new animation loops. Standalone MagicMe-PRO only.
{
  const mmv3Cache = new Map();
  let mmv3Avatar = null;
  let mmv3Applied = '';
  let mmv3Request = 0;
  const mmv3Status = document.createElement('p');
  mmv3Status.id='mmv3Status';
  mmv3Status.setAttribute('role','status');
  mmv3Status.className='mm2-note';
  const mmv3Panel = document.getElementById('mm2Panel');
  if(mmv3Panel) {
    mmv3Status.textContent='Texture V3: ვამზადებთ სამოსის ფერებს…';
    mmv3Panel.appendChild(mmv3Status);
  }
  const mmv3Loader=new THREE.TextureLoader();
  function mmv3OutfitIndex(){
    const b=document.querySelector('#magicOutfitButtons .magic-outfit-btn.active');
    const i=Number(b?.dataset?.index ?? 0);
    return Number.isInteger(i) && i>=0 && i<3 ? i : 0;
  }
  function mmv3ShoeIndex(){
    const buttons=Array.from(document.querySelectorAll('#mm2Shoe .mm2-choice'));
    const index=buttons.findIndex(b=>b.classList.contains('active')||b.getAttribute('aria-pressed')==='true');
    return index>=0&&index<4?index:0;
  }
  function mmv3GetMap(gender,outfit,shoe){
    const key=`${gender}-o${outfit}-s${shoe}`;
    if(!mmv3Cache.has(key)) {
      mmv3Cache.set(key,mmv3Loader.loadAsync(`/magicme-studio/assets/style-v4/${key}.webp`).catch(error=>{
        mmv3Cache.delete(key);
        throw error;
      }));
    }
    return mmv3Cache.get(key);
  }
  async function mmv3Apply(){
    const model=character;
    if(!model?.isObject3D)return;
    const gender=currentGender==='boy'?'boy':'girl';
    const outfit=mmv3OutfitIndex(),shoe=mmv3ShoeIndex();
    const identity=`${gender}:${outfit}:${shoe}`;
    if(mmv3Avatar===model && mmv3Applied===identity)return;
    mmv3Avatar=model;
    const request=++mmv3Request;
    if(mmv3Status)mmv3Status.textContent='Texture V3: სამოსისა და სნიკერის ფერი იტვირთება…';
    try{
      const map=await mmv3GetMap(gender,outfit,shoe);
      if(request!==mmv3Request||character!==model||currentGender!==gender)return;
      let painted=0;
      const matching=gender==='girl'?'cf001_body':'cm001_body';
      model.traverse(node=>{
        if(!node.isMesh||!node.material)return;
        const oldMats=Array.isArray(node.material)?node.material:[node.material];
        let changed=false;
        const nextMats=oldMats.map(mat=>{
          if(!mat || !String(mat.name||'').toLowerCase().includes(matching))return mat;
          const c=mat.userData?.mmv3OwnMaterial?mat:mat.clone();
          c.userData={...(c.userData||{}),mmv3OwnMaterial:true};
          // Preserve glTF texture-coordinate convention (flipY=false), texture sampler, and UV transform.
          const oldTexture=c.map;
          if(oldTexture){
            map.flipY=oldTexture.flipY;
            map.wrapS=oldTexture.wrapS;map.wrapT=oldTexture.wrapT;
            map.offset.copy(oldTexture.offset);map.repeat.copy(oldTexture.repeat);
            map.rotation=oldTexture.rotation;map.center.copy(oldTexture.center);
            map.channel=oldTexture.channel;
          }else{map.flipY=false;}
          map.colorSpace=THREE.SRGBColorSpace;
          map.needsUpdate=true;
          c.map=map;
          c.color.set(0xffffff);
          c.needsUpdate=true;
          changed=true;painted++;
          return c;
        });
        if(changed)node.material=Array.isArray(node.material)?nextMats:nextMats[0];
      });
      if(!painted)throw Error('Matching child body material not found');
      mmv3Applied=identity;
      if(mmv3Status)mmv3Status.textContent=`Texture V3 ✓ ${gender==='girl'?'Girl':'Boy'} · Outfit ${outfit+1} · Sneakers ${shoe+1}. ხელებისა და სახის ფერი უცვლელია.`;
    }catch(error){
      console.error('MAGIC ME TEXTURE V3:',error);
      if(mmv3Status)mmv3Status.textContent='Texture V3: ფერის ჩატვირთვა ვერ მოხერხდა. ძველი ტექსტურა შენარჩუნდა.';
    }
  }
  let mmv3Timer=0;
  function mmv3Schedule(){
    clearTimeout(mmv3Timer);
    mmv3Timer=setTimeout(mmv3Apply,180);
  }
  // Clicking the existing Outfit / Sneaker choices changes the source preferences first.
  document.addEventListener('click',e=>{
    if(e.target.closest('#magicOutfitButtons, #mm2Shoe, [data-gender]'))mmv3Schedule();
  });
  // Three.js Groups are not DOM Nodes; use identity checks, never MutationObserver.observe(holder).
  const mmv3Poll=setInterval(()=>{
    const model=character;
    if(model && (model!==mmv3Avatar||mmv3Applied!==`${currentGender}:${mmv3OutfitIndex()}:${mmv3ShoeIndex()}`))mmv3Schedule();
  },650);
  window.addEventListener('pagehide',()=>{clearInterval(mmv3Poll);clearTimeout(mmv3Timer);},{once:true});
  mmv3Schedule();
}

