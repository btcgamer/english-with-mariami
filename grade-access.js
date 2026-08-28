/*
=========================================================
ENGLISH WITH MARIAMI
GRADE ACCESS SYSTEM
2026
=========================================================

წესები:

datogringo@gmail.com
→ სრული წვდომა

parent
→ grade 2 + grade 3 + grade 4

student grade 2
→ მხოლოდ grade2.html

student grade 3
→ მხოლოდ grade3.html

student grade 4
→ მხოლოდ grade4.html
=========================================================
*/

(function(){

"use strict";


/*
=========================================================
სრული წვდომის მქონე ანგარიში
=========================================================
*/

const FULL_ACCESS_EMAIL =
"datogringo@gmail.com";


/*
=========================================================
დაშვებული კლასები
=========================================================
*/

const ALLOWED_GRADES =
[2,3,4];


/*
=========================================================
გვერდიდან კლასის ამოცნობა
=========================================================
*/

function getCurrentGrade(){

const file =
(
window.location.pathname
.split("/")
.pop()
|| ""
).toLowerCase();


const match =
file.match(/^grade([234])\.html$/);


if(!match){

return 0;

}


return Number(match[1]);

}


/*
=========================================================
მთავარი ფუნქცია
=========================================================
*/

async function checkGradeAccess(){

const client =
window.__ENGLISH_MARIAMI_SUPABASE_CLIENT;


if(!client){

console.error(
"Supabase client ვერ მოიძებნა."
);

return;

}


const currentGrade =
getCurrentGrade();


/*
თუ grade გვერდზე არ ვართ
*/

if(!currentGrade){

return;

}


/*
=========================================================
მომხმარებლის მიღება
=========================================================
*/

const result =
await client.auth.getUser();


const user =
result.data?.user;


if(!user){

/*
არ არის შესული
*/

location.replace(
"login.html?redirect="+
encodeURIComponent(
window.location.pathname
)
);

return;

}


const email =
String(
user.email || ""
).trim()
.toLowerCase();


/*
=========================================================
FULL ACCESS
=========================================================
*/

if(email === FULL_ACCESS_EMAIL){

console.log(
"FULL ACCESS: allowed"
);

return;

}


/*
=========================================================
PROFILE
=========================================================
*/

let role="";
let grade=0;

try{

const r =
await client
.from("profiles")
.select("role,grade")
.eq("user_id",user.id)
.maybeSingle();


if(r.data){

role=
String(
r.data.role || ""
).toLowerCase();

grade=
Number(
r.data.grade || 0
);

}

}catch(error){

console.error(
"Profile access error:",
error
);

}


/*
=========================================================
PARENT
=========================================================

მშობელს შეუძლია ნახოს:

grade2
grade3
grade4
=========================================================
*/

if(role === "parent"){

if(ALLOWED_GRADES.includes(currentGrade)){

console.log(
"PARENT ACCESS: grade "+currentGrade
);

return;

}

}


/*
=========================================================
STUDENT
=========================================================

მოსწავლეს შეუძლია მხოლოდ თავისი კლასი.
=========================================================
*/

if(
[2,3,4].includes(grade)
&&
grade === currentGrade
){

console.log(
"STUDENT ACCESS: grade "+currentGrade
);

return;

}


/*
=========================================================
წვდომა არ აქვს
=========================================================
*/

console.warn(
"ACCESS DENIED",
{
email,
role,
grade,
currentGrade
}
);


/*
მოსწავლე ყოველთვის ბრუნდება
თავის კლასში
*/

if([2,3,4].includes(grade)){

location.replace(
"grade"+grade+".html"
);

return;

}


/*
თუ მშობელია, მაგრამ უცნაური გვერდია
*/

if(role === "parent"){

location.replace(
"academy.html"
);

return;

}


/*
სხვა შემთხვევა
*/

location.replace(
"login.html"
);

}


/*
=========================================================
გვერდის დაცვა
=========================================================
*/

checkGradeAccess();


/*
=========================================================
გლობალური ფუნქცია
=========================================================
*/

window.ENGLISH_MARIAMI_GRADE_ACCESS = {

check:
checkGradeAccess,

getCurrentGrade:
getCurrentGrade

};

})();
