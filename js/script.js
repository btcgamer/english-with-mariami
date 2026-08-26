const feedback=document.getElementById('feedback');
document.querySelectorAll('.answers button').forEach(button=>{
  button.addEventListener('click',()=>{
    if(button.dataset.answer==='correct'){
      feedback.textContent='🎉 Correct! Great job!';
    }else{
      feedback.textContent='💡 Not quite — try again!';
    }
  });
});
