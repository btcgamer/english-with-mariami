/* Magic Me V10 — private-on-this-device pending avatar handoff (not encryption). */
(()=>{'use strict';
  const PREFIX='ewm-magic-me-v10-pending:';
  const AVATAR='ewm-magic-me-v10:';
  const TTL=7*24*60*60*1000;
  async function key(email){
    const normalized=String(email||'').trim().toLowerCase();
    if(!normalized||!crypto?.subtle||!window.isSecureContext)return null;
    const bits=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(normalized));
    return PREFIX+Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function save(email,avatar){
    try{
      const k=await key(email);
      if(!k||!avatar||typeof avatar!=='object')return false;
      // Only known avatar appearance indices are stored, never identifying content.
      const fields=['gender','style','skin','hair','haircut','outfit','eyes','accessory','footwear'];
      const clean={};
      for(const field of fields){const value=Number(avatar[field]);if(Number.isInteger(value)&&value>=0&&value<=10)clean[field]=value;}
      localStorage.setItem(k,JSON.stringify({avatar:clean,createdAt:Date.now()}));
      return true;
    }catch{return false}
  }
  async function restore(user){
    try{
      if(!user||!user.id||!user.email||!user.email_confirmed_at)return false;
      const k=await key(user.email);if(!k)return false;
      const existing=localStorage.getItem(AVATAR+user.id);
      const pending=localStorage.getItem(k);if(!pending)return !!existing;
      if(existing){localStorage.removeItem(k);return true}
      const data=JSON.parse(pending);
      if(!data||typeof data!=='object'||!data.avatar||typeof data.avatar!=='object'||!Number.isFinite(data.createdAt)||Date.now()-data.createdAt>TTL||data.createdAt>Date.now()+60000){localStorage.removeItem(k);return false}
      const fields=['gender','style','skin','hair','haircut','outfit','eyes','accessory','footwear'];
      const clean={};
      for(const field of fields){const value=Number(data.avatar[field]);if(Number.isInteger(value)&&value>=0&&value<=10)clean[field]=value;}
      localStorage.setItem(AVATAR+user.id,JSON.stringify(clean));
      // Remove the temporary copy ONLY after the account-specific record was written.
      localStorage.removeItem(k);
      return true;
    }catch{return false}
  }
  window.EWM_MAGIC_V10_PENDING=Object.freeze({save,restore});
})();