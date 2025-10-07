// Load quizzes JSON safely from /data (no caching so updates show up)
async function loadQuizzes() {
  try {
    const res = await fetch('data/quizzes.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('quizzes.json not found');
    return await res.json();
  } catch (e) {
    console.error('Quiz load error:', e);
    return {}; // don't break the UI if JSON missing
  }
}
