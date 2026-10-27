/* English with Mariami: Magic Me V1 — local illustrated avatar builder.
 * No image uploads, network requests, external AI services, photos, or profile writes.
 * Avatar style data is kept on this device, scoped to the signed-in account.
 */
(() => {
  'use strict';
  const context = window.MARIAMI_MAGIC_ME_CONTEXT;
  if (!context || !context.userId || !document.getElementById('ewm-progress')) return;
  const html = document.documentElement;
  if (context.isOwner === true) {
    html.classList.add('magic-me-owner');
    return;
  }
  html.classList.add('magic-me-student');
  const hero = document.querySelector('#ewm-progress .pg-hero');
  if (!hero) return;

  const key = 'ewm-magic-me-v1:' + String(context.userId);
  const P = {
    skin: ['#f5ccac','#e6b08f','#c8875d','#a86c48','#80513c','#51352d'],
    hair: ['#29213c','#704630','#d6aa6a','#151d32','#974e54','#dde8f7'],
    outfit: ['#38bdf8','#8b5cf6','#2dd4bf','#f472b6','#f7ae56','#5975ea'],
    style: ['მოკლე','კულულები','გრძელი','ვარსკვლავური'],
    mood: ['მხიარული','მომღიმარი','ცნობისმოყვარე'],
    buddy: ['⭐','🐉','🤖','🦊','🦄']
  };
  const defaults = {skin:1,hair:0,outfit:0,style:1,mood:0,buddy:0};
  const valid = (raw) => {
    const data = {};
    for (const k of Object.keys(defaults)) {
      const n = Number(raw && raw[k]);
      data[k] = Number.isInteger(n) && n >= 0 && n < P[k].length ? n : defaults[k];
    }
    return data;
  };
  const read = () => {
    try { const raw=localStorage.getItem(key); return raw ? valid(JSON.parse(raw)) : null; }
    catch { return null; }
  };
  const el=(tag,cls,text) => {const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e};
  let saved=read(), draft=valid(saved || defaults);

  const hairStyles = [
    '<path d="M43 77 Q42 26 91 27 Q139 28 137 79 L132 59 Q103 67 92 47 Q72 75 46 65 Z"/>',
    '<path d="M43 73 Q33 49 50 42 Q42 24 66 29 Q80 13 95 30 Q116 19 122 39 Q145 40 136 70 Q133 79 128 70 Q116 55 104 50 Q88 69 53 66 Z"/>',
    '<path d="M42 79 Q35 26 90 24 Q144 25 139 80 L145 157 L126 151 L125 63 Q91 61 61 53 L57 151 L37 156 Z"/>',
    '<path d="M38 77 L48 43 L55 53 L68 18 L83 39 L99 14 L111 39 L132 27 L141 82 L131 70 Q92 54 47 70 Z"/>'
  ];
  function svg(c) {
    // All interpolated colors and artwork come exclusively from fixed local presets.
    const h=P.hair[c.hair],s=P.skin[c.skin],o=P.outfit[c.outfit];
    const mouth=c.mood===1?'<path d="M78 107 Q90 121 103 107" fill="none" stroke="#7b4050" stroke-width="3" stroke-linecap="round"/>':c.mood===2?'<path d="M84 111 Q94 107 104 112" fill="none" stroke="#7b4050" stroke-width="2.5" stroke-linecap="round"/>':'<path d="M80 108 Q90 115 100 108" fill="none" stroke="#7b4050" stroke-width="3" stroke-linecap="round"/>';
    return `<svg viewBox="0 0 180 210" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect width="180" height="210" rx="18" fill="#082747"/><circle cx="29" cy="28" r="3" fill="#70e7ff"/><circle cx="152" cy="42" r="4" fill="#fce68b"/><circle cx="138" cy="153" r="3" fill="#d4a2ff"/>
      <g class="magic-me-character"><ellipse cx="91" cy="198" rx="52" ry="8" fill="#010b23" opacity=".45"/>
      <path d="M61 158 L57 198 L81 198 L89 159 M95 159 L105 198 L127 198 L119 158" stroke="#253052" stroke-width="18" stroke-linecap="round"/>
      <path class="magic-me-arm" d="M55 139 Q35 150 35 165" fill="none" stroke="${o}" stroke-width="19" stroke-linecap="round"/>
      <path class="magic-me-wave-arm" d="M126 139 Q147 125 148 105" fill="none" stroke="${o}" stroke-width="19" stroke-linecap="round"/>
      <path d="M55 144 Q59 127 74 125 L109 125 Q128 130 129 149 L134 171 L49 171 Z" fill="${o}" stroke="#e9ffff" stroke-opacity=".4" stroke-width="2"/>
      <path d="M75 126 L90 145 L106 126" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
      <rect x="81" y="109" width="20" height="24" rx="8" fill="${s}"/>
      <ellipse cx="90" cy="79" rx="46" ry="50" fill="${s}"/>
      <g fill="${h}">${hairStyles[c.style]}</g>
      <circle cx="75" cy="90" r="3.8" fill="#20243b"/><circle cx="105" cy="90" r="3.8" fill="#20243b"/>
      <circle cx="76" cy="89" r="1.1" fill="#fff"/><circle cx="106" cy="89" r="1.1" fill="#fff"/>
      <ellipse cx="65" cy="102" rx="7" ry="3" fill="#ec8c9b" opacity=".4"/><ellipse cx="115" cy="102" rx="7" ry="3" fill="#ec8c9b" opacity=".4"/>
      ${mouth}</g></svg>`;
  }

  const card=el('div','magic-me-card');
  const viewport=el('div','magic-me-viewport');
  viewport.setAttribute('role','img'); viewport.setAttribute('aria-label','ჩემი შექმნილი მულტფილმის ავატარი');
  const caption=el('div','magic-me-caption');
  const badge=el('span','magic-me-buddy');
  const title=el('strong','', '✨ MAGIC ME');
  const captionText=el('small','', 'ჩემი პერსონაჟი');
  caption.append(title,captionText);
  const actions=el('div','magic-me-actions');
  const edit=el('button','','🎨 ავატარის აწყობა');edit.type='button';
  const dance=el('button','','💃 აცეკვე');dance.type='button';
  actions.append(edit,dance);
  card.append(viewport,badge,caption,actions);
  hero.prepend(card);

  const editor=el('section','magic-me-editor');
  editor.setAttribute('aria-label','Magic Me პერსონაჟის კონსტრუქტორი');
  const heading=el('h3','', '✨ Magic Me — შექმენი შენი გმირი');
  const note=el('p','', 'აირჩიე ფერები და სტილი ან მოიფიქრე ახალი ვარიანტი ერთი შეხებით. არ არის საჭირო ფოტო, სახელი ან პირადი მონაცემები.');
  const preview=el('div','magic-me-preview');preview.setAttribute('aria-label','ავატარის წინასწარი ნახვა');
  const fields=el('div','magic-me-fields');
  const fieldsMap = {};
  const definitions=[
    ['skin','კანის ფერი',['ღია','თბილი','მუქი თბილი','ყავისფერი','მუქი','ღრმა']],
    ['hair','თმის ფერი',['მუქი','წაბლისფერი','ქერა','შავი','წითური','ვერცხლისფერი']],
    ['style','თმის სტილი',P.style],
    ['outfit','სამოსის ფერი',['ცისფერი','იისფერი','მწვანე','ვარდისფერი','ოქროსფერი','ლურჯი']],
    ['mood','გამომეტყველება',P.mood],
    ['buddy','ჯადოსნური მეგობარი',['ვარსკვლავი','დრაკონი','რობოტი','მელია','უნიკორნი']]
  ];
  for(const [name,label,values] of definitions){
    const wrap=el('label','magic-me-field'); const span=el('span','',label);const select=el('select');select.setAttribute('aria-label',label);
    for(let i=0;i<values.length;i++){const opt=el('option','',values[i]);opt.value=String(i);select.append(opt)}
    select.value=String(draft[name]);fieldsMap[name]=select;
    select.addEventListener('change',()=>{draft[name]=Number(select.value);render()});
    wrap.append(span,select);fields.append(wrap);
  }
  const buttons=el('div','magic-me-editor-buttons');
  const random=el('button','magic-me-primary','✨ ჯადოსნური ვარიანტი');random.type='button';
  const save=el('button','magic-me-primary','💾 ჩემი გმირის შენახვა');save.type='button';
  const clear=el('button','magic-me-danger','🗑️ ავატარის წაშლა');clear.type='button';
  const close=el('button','','დახურვა');close.type='button';
  const info=el('p','magic-me-info','AI-სტილის ვიზუალური გენერატორი მუშაობს ადგილობრივად. ეს არ არის გარე AI მოდელი. არჩევანი ინახება მხოლოდ ამ ბრაუზერში და სხვა მოწყობილობაზე ავტომატურად არ გადავა.');
  const status=el('p','magic-me-status');status.setAttribute('role','status');
  buttons.append(random,save,clear,close);
  editor.append(heading,note,preview,fields,buttons,info,status);
  hero.insertAdjacentElement('afterend',editor);
  function render(){
    viewport.innerHTML=svg(saved || draft);
    preview.innerHTML=svg(draft);
    badge.textContent=P.buddy[(saved || draft).buddy];
    captionText.textContent=saved?'ჩემი პირადი პერსონაჟი':'ჯერ შევქმნათ პერსონაჟი';
  }
  const open=()=>{draft=valid(saved || defaults);for(const k of Object.keys(draft))fieldsMap[k].value=String(draft[k]);render();editor.hidden=false;editor.scrollIntoView({block:'nearest',behavior:'auto'});};
  const animate=()=>{
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c=viewport.querySelector('.magic-me-character');if(!c)return;
    c.classList.remove('magic-me-dance');void c.getBoundingClientRect();c.classList.add('magic-me-dance');
  };
  edit.addEventListener('click',open);dance.addEventListener('click',animate);
  random.addEventListener('click',()=>{
    const bytes=new Uint32Array(6);
    if(window.crypto?.getRandomValues)window.crypto.getRandomValues(bytes);
    else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*4294967295);
    Object.keys(draft).forEach((k,i)=>{draft[k]=bytes[i]%P[k].length;fieldsMap[k].value=String(draft[k])});
    render();status.textContent='✨ ახალი ვარიანტი მზადაა. მოგწონს? შეინახე!';
  });
  save.addEventListener('click',()=>{
    saved=valid(draft);
    try{localStorage.setItem(key,JSON.stringify(saved));status.textContent='✅ შენახულია მხოლოდ ამ ბრაუზერში.';}
    catch{status.textContent='⚠️ შენახვა დაბლოკილია: ავატარი მიმდინარე სესიაში იმუშავებს, მაგრამ შეიძლება არ დარჩეს.';}
    render();editor.hidden=true;animate();
  });
  clear.addEventListener('click',()=>{
    if(!window.confirm('წავშალოთ ამ მოწყობილობაზე შენახული ავატარი?'))return;
    try{localStorage.removeItem(key);}catch{}
    saved=null;draft=valid(defaults);for(const k of Object.keys(draft))fieldsMap[k].value=String(draft[k]);
    render();editor.hidden=false;status.textContent='ავატარი წაიშალა. შეგიძლია ახალი შექმნა.';
  });
  close.addEventListener('click',()=>{editor.hidden=true});
  editor.hidden=!!saved;
  render();
  if(saved)animate();
})();