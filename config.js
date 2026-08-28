const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";

/* ==================================================
   🔐 ACADEMY LOGOUT BUTTON
   Adds the logout button only to academy.html.
================================================== */

(function(){
  if(!/\/academy\.html$/i.test(window.location.pathname)) return;

  function addLogoutButton(){
    const nav = document.querySelector('.navlinks');
    if(!nav || document.getElementById('academyLogoutBtn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #academyLogoutBtn{
        border:1px solid #ff6b6b99!important;
        background:linear-gradient(135deg,#ff5b5b,#d91e63)!important;
        color:#fff!important;
        font-weight:1000!important;
        cursor:pointer;
        box-shadow:0 0 18px #ff3b5b55;
      }
      #academyLogoutBtn:hover{
        background:linear-gradient(135deg,#ff7777,#ef2f75)!important;
        color:#fff!important;
        box-shadow:0 0 25px #ff416c99!important;
      }
    `;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'academyLogoutBtn';
    button.type = 'button';
    button.textContent = '🚪 გამოსვლა';

    button.addEventListener('click', async function(){
      button.disabled = true;
      button.textContent = 'გამოსვლა...';

      try{
        const client = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
        const {error} = await client.auth.signOut();

        if(error) throw error;

        window.location.replace('login.html');
      }catch(error){
        console.error('Logout error:',error);
        button.disabled = false;
        button.textContent = '🚪 გამოსვლა';
        alert('გამოსვლისას მოხდა შეცდომა. სცადე თავიდან.');
      }
    });

    nav.appendChild(button);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',addLogoutButton);
  }else{
    addLogoutButton();
  }
})();
