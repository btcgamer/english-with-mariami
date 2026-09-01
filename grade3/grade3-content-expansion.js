/* English with Mariami — Grade 3 content expansion layer.
   Safe additive layer: keeps existing mission IDs, progress keys and UI logic intact.
*/
(function(){'use strict';
  const extra = [
    [['good morning','დილა მშვიდობისა'],['good evening','საღამო მშვიდობისა'],['my name is','მე მქვია'],['nice to meet you','სასიამოვნოა შენი გაცნობა'],['see you later','მოგვიანებით გნახავ'],['sorry','ბოდიში']],
    [['four','ოთხი'],['five','ხუთი'],['six','ექვსი'],['eleven','თერთმეტი'],['thirty','ოცდაათი'],['hundred','ასი']],
    [['orange','ნარინჯისფერი'],['pink','ვარდისფერი'],['black','შავი'],['white','თეთრი'],['brown','ყავისფერი'],['bright','კაშკაშა']],
    [['grandmother','ბებია'],['grandfather','ბაბუა'],['parents','მშობლები'],['cousin','ბიძაშვილი/დეიდაშვილი'],['baby','ჩვილი'],['kind','კეთილი']],
    [['living room','მისაღები ოთახი'],['bathroom','აბაზანა'],['garden','ბაღი'],['table','მაგიდა'],['chair','სკამი'],['window','ფანჯარა']],
    [['lion','ლომი'],['elephant','სპილო'],['monkey','მაიმუნი'],['fish','თევზი'],['rabbit','კურდღელი'],['swim','ცურვა']],
    [['banana','ბანანი'],['orange','ფორთოხალი'],['rice','ბრინჯი'],['cheese','ყველი'],['juice','წვენი'],['healthy','ჯანსაღი']],
    [['pencil','ფანქარი'],['pen','კალამი'],['desk','მერხი'],['classroom','საკლასო ოთახი'],['math','მათემატიკა'],['English','ინგლისური']],
    [['windy','ქარიანი'],['snowy','თოვლიანი'],['warm','თბილი'],['cool','გრილი'],['spring','გაზაფხული'],['winter','ზამთარი']],
    [['arm','მკლავი'],['leg','ფეხი'],['nose','ცხვირი'],['mouth','პირი'],['shoulder','მხარი'],['run','სირბილი']],
    [['calm','მშვიდი'],['worried','შეშფოთებული'],['scared','შეშინებული'],['proud','ამაყი'],['bored','მოწყენილი'],['surprised','გაკვირვებული']],
    [['be','ყოფნა'],['has','აქვს'],['do','კეთება'],['does','აკეთებს'],['not','არა'],['question','კითხვა']],
    [['brush','დავარცხნა'],['wash','დაბანა'],['study','სწავლა'],['work','მუშაობა'],['watch','ყურება'],['every day','ყოველდღე']],
    [['Monday','ორშაბათი'],['Tuesday','სამშაბათი'],['Friday','პარასკევი'],['week','კვირა'],['month','თვე'],['o’clock','საათი']],
    [['between','შუაში'],['near','ახლოს'],['far from','შორს'],['in front of','წინ'],['above','ზემოთ'],['below','ქვემოთ']],
    [['character','პერსონაჟი'],['beginning','დასაწყისი'],['middle','შუა'],['end','დასასრული'],['because','იმიტომ რომ'],['before','მანამდე']],
    [['speaker','მოსაუბრე'],['voice','ხმა'],['key word','საკვანძო სიტყვა'],['detail','დეტალი'],['first','პირველი'],['last','ბოლო']],
    [['question','კითხვა'],['answer','პასუხი'],['where','სად'],['when','როდის'],['why','რატომ'],['because','იმიტომ რომ']],
    [['tall','მაღალი'],['short','დაბალი'],['young','ახალგაზრდა'],['old','ხანდაზმული'],['clean','სუფთა'],['dirty','ბინძური']],
    [['option','ვარიანტი'],['score','ქულა'],['timer','ტაიმერი'],['hint','მინიშნება'],['check','შემოწმება'],['retry','თავიდან ცდა']],
    [['first','პირველი'],['next','შემდეგი'],['last','ბოლო'],['same','იგივე'],['different','განსხვავებული'],['clue','მინიშნება']],
    [['strong','ძლიერი'],['weak','სუსტი'],['easy','ადვილი'],['difficult','რთული'],['improve','გაუმჯობესება'],['goal','მიზანი']],
    [['adapt','მორგება'],['focus','ფოკუსი'],['hint','მინიშნება'],['attempt','მცდელობა'],['master','დაუფლება'],['level','დონე']],
    [['grammar','გრამატიკა'],['vocabulary','ლექსიკა'],['reading','კითხვა'],['listening','მოსმენა'],['speaking','საუბარი'],['confidence','თავდაჯერება']]
  ];
  const worlds = window.GRADE3_FUTURISTIC_CONTENT && window.GRADE3_FUTURISTIC_CONTENT.worlds;
  if(!Array.isArray(worlds)) return;
  worlds.forEach((w,i)=>{
    if(!Array.isArray(w.words)) w.words=[];
    const seen=new Set(w.words.map(v=>String(v[0]).toLowerCase()));
    (extra[i]||[]).forEach(v=>{if(!seen.has(String(v[0]).toLowerCase())){w.words.push(v);seen.add(String(v[0]).toLowerCase())}});
  });
})();
