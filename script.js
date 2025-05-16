document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('news-form');
  const input = document.getElementById('news-input');
  const feed = document.getElementById('news-feed');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (text === '') return;

    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item');
    newsItem.textContent = `${new Date().toLocaleString()}: ${text}`;
    
    feed.prepend(newsItem); // newest first
    input.value = '';
  });
});
