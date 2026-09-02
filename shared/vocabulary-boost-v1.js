/* English with Mariami — Vocabulary Boost v1
   Additive only. Extends the shared Mega Vocabulary library for Grades 2–4.
   No auth, progress, Supabase or lesson-ID changes.
*/
(()=>{'use strict';
const boost={
2:[
['Animals','parrot','თუთიყუში'],['Animals','dolphin','დელფინი'],['Animals','whale','ვეშაპი'],['Animals','turtle','კუ'],['Animals','fox','მელა'],['Animals','deer','ირემი'],['Animals','zebra','ზებრა'],['Animals','penguin','პინგვინი'],
['Home','kitchen','სამზარეულო'],['Home','shelf','თარო'],['Home','pillow','ბალიში'],['Home','blanket','საბანი'],['Home','drawer','უჯრა'],['Home','key','გასაღები'],['Home','stairs','კიბე'],['Home','garden','ბაღი'],
['Food','pasta','მაკარონი'],['Food','sandwich','სენდვიჩი'],['Food','apple','ვაშლი'],['Food','grape','ყურძენი'],['Food','lemon','ლიმონი'],['Food','onion','ხახვი'],['Food','pepper','წიწაკა'],['Food','hungry','მშიერი'],
['School','dictionary','ლექსიკონი'],['School','crayon','ფერადი ფანქარი'],['School','scissors','მაკრატელი'],['School','glue','წებო'],['School','page','გვერდი'],['School','question','კითხვა'],['School','answer','პასუხი'],['School','break','შესვენება'],
['Actions','carry','ტარება'],['Actions','catch','დაჭერა'],['Actions','throw','სროლა'],['Actions','wash','დაბანა'],['Actions','cook','მომზადება'],['Actions','help','დახმარება'],['Actions','share','გაზიარება'],['Actions','wait','ლოდინი'],
['Nature','rain','წვიმა'],['Nature','snowflake','ფიფქი'],['Nature','sunlight','მზის შუქი'],['Nature','branch','ტოტი'],['Nature','seed','თესლი'],['Nature','cloudy','მოღრუბლული'],['Nature','field','მინდორი'],['Nature','hill','ბორცვი'],
['Adjectives','strong','ძლიერი'],['Adjectives','weak','სუსტი'],['Adjectives','tall','მაღალი'],['Adjectives','young','ახალგაზრდა'],['Adjectives','kind','კეთილი'],['Adjectives','funny','სასაცილო'],['Adjectives','quiet','ჩუმი'],['Adjectives','loud','ხმამაღალი']
],
3:[
['Communication','glad','მოხარული'],['Communication','sure','დარწმუნებული'],['Communication','maybe','შეიძლება'],['Communication','probably','ალბათ'],['Communication','welcome','მოგესალმებით'],['Communication','invite','მოწვევა'],['Communication','promise','დაპირება'],['Communication','agree','დათანხმება'],
['People','customer','მომხმარებელი'],['People','visitor','სტუმარი'],['People','team','გუნდი'],['People','coach','მწვრთნელი'],['People','scientist','მეცნიერი'],['People','writer','მწერალი'],['People','musician','მუსიკოსი'],['People','inventor','გამომგონებელი'],
['Daily Life','choose','არჩევა'],['Daily Life','carry','ტარება'],['Daily Life','borrow','თხოვება/სესხება'],['Daily Life','return','დაბრუნება'],['Daily Life','remember','დამახსოვრება'],['Daily Life','forget','დავიწყება'],['Daily Life','practice','ვარჯიში'],['Daily Life','prepare','მომზადება'],
['Places','library','ბიბლიოთეკა'],['Places','theater','თეატრი'],['Places','stadium','სტადიონი'],['Places','bridge','ხიდი'],['Places','square','მოედანი'],['Places','village','სოფელი'],['Places','capital','დედაქალაქი'],['Places','building','შენობა'],
['Grammar','already','უკვე'],['Grammar','still','ჯერ კიდევ'],['Grammar','together','ერთად'],['Grammar','quickly','სწრაფად'],['Grammar','carefully','ფრთხილად'],['Grammar','usually','ჩვეულებრივ'],['Grammar','different','განსხვავებული'],['Grammar','important','მნიშვნელოვანი'],
['Time','early','ადრე'],['Time','late','გვიან'],['Time','soon','მალე'],['Time','next','შემდეგი'],['Time','last','ბოლო'],['Time','during','განმავლობაში'],['Time','minute','წუთი'],['Time','hour','საათი'],
['Nature','forest','ტყე'],['Nature','waterfall','ჩანჩქერი'],['Nature','valley','ხეობა'],['Nature','island','კუნძული'],['Nature','ocean','ოკეანე'],['Nature','desert','უდაბნო'],['Nature','planet','პლანეტა'],['Nature','environment','გარემო'],
['Feelings','confident','თავდაჯერებული'],['Feelings','curious','ცნობისმოყვარე'],['Feelings','lonely','მარტოსული'],['Feelings','relaxed','მოდუნებული'],['Feelings','surprised','გაკვირვებული'],['Feelings','proud','ამაყი'],['Feelings','nervous','ნერვიული'],['Feelings','hopeful','იმედიანი']
],
4:[
['Travel','journey','მოგზაურობა'],['Travel','destination','დანიშნულების ადგილი'],['Travel','passport','პასპორტი'],['Travel','luggage','ბარგი'],['Travel','departure','გამგზავრება'],['Travel','arrival','ჩამოსვლა'],['Travel','platform','ბაქანი'],['Travel','route','მარშრუტი'],
['City','neighborhood','უბანი'],['City','traffic','მოძრაობა'],['City','crosswalk','ქვეითთა გადასასვლელი'],['City','sidewalk','ტროტუარი'],['City','library','ბიბლიოთეკა'],['City','pharmacy','აფთიაქი'],['City','entrance','შესასვლელი'],['City','exit','გასასვლელი'],
['Science','experiment','ექსპერიმენტი'],['Science','energy','ენერგია'],['Science','electricity','ელექტროენერგია'],['Science','machine','მანქანა/მოწყობილობა'],['Science','material','მასალა'],['Science','temperature','ტემპერატურა'],['Science','planet','პლანეტა'],['Science','research','კვლევა'],
['Environment','recycle','გადამუშავება'],['Environment','reusable','მრავალჯერადი გამოყენების'],['Environment','plastic','პლასტმასი'],['Environment','pollution','დაბინძურება'],['Environment','protect','დაცვა'],['Environment','nature','ბუნება'],['Environment','forest','ტყე'],['Environment','wildlife','ველური ბუნება'],
['Communication','opinion','აზრი'],['Communication','reason','მიზეზი'],['Communication','suggest','შეთავაზება'],['Communication','explain','ახსნა'],['Communication','describe','აღწერა'],['Communication','compare','შედარება'],['Communication','decide','გადაწყვეტა'],['Communication','discuss','განხილვა'],
['Grammar','although','მიუხედავად იმისა რომ'],['Grammar','however','თუმცა'],['Grammar','while','სანამ/იმ დროს როცა'],['Grammar','before','სანამ'],['Grammar','after','მას შემდეგ რაც'],['Grammar','because','იმიტომ რომ'],['Grammar','unless','თუ არა'],['Grammar','instead','ამის ნაცვლად'],
['Adjectives','useful','სასარგებლო'],['Adjectives','careful','ფრთხილი'],['Adjectives','creative','შემოქმედებითი'],['Adjectives','dangerous','საშიში'],['Adjectives','peaceful','მშვიდობიანი'],['Adjectives','crowded','ხალხმრავალი'],['Adjectives','modern','თანამედროვე'],['Adjectives','ancient','უძველესი'],
['Study Skills','improve','გაუმჯობესება'],['Study Skills','discover','აღმოჩენა'],['Study Skills','solve','გადაჭრა'],['Study Skills','organize','ორგანიზება'],['Study Skills','review','გამეორება'],['Study Skills','understand','გაგება'],['Study Skills','remember','დამახსოვრება'],['Study Skills','challenge','გამოწვევა'],
['Technology','device','მოწყობილობა'],['Technology','screen','ეკრანი'],['Technology','keyboard','კლავიატურა'],['Technology','website','ვებსაიტი'],['Technology','message','შეტყობინება'],['Technology','robot','რობოტი'],['Technology','digital','ციფრული'],['Technology','online','ონლაინ']
]};
function valid(x){return Array.isArray(x)&&x.length>=3&&x[1]&&x[2]}
function install(){const api=window.ENGLISH_MARIAMI_MEGA_VOCAB;if(!api||typeof api!=='object')return;for(const g of [2,3,4]){if(!Array.isArray(api[g]))api[g]=[];const seen=new Set(api[g].map(x=>Array.isArray(x)?String(x[1]).toLowerCase():'').filter(Boolean));for(const row of boost[g]){if(valid(row)&&!seen.has(String(row[1]).toLowerCase())){api[g].push(row);seen.add(String(row[1]).toLowerCase())}}}window.ENGLISH_MARIAMI_VOCABULARY_BOOST={version:1,counts:{2:boost[2].length,3:boost[3].length,4:boost[4].length}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();