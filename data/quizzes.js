
async function loadQuizzes(){
  const res = await fetch('data/quizzes.json');
  return res.json();
}
