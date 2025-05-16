const password = "ChatGPT1075!"; 
let authenticated = false;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('news-form');
  const input = document.getElementById('news-input');
  const feed = document.getElementById('news-feed');

  // Load from localStorage
  const newsItems = JSON.parse(localStorage.getItem("news")) || [];
  newsItems.forEach(({ timestamp, text }) => {
    const newsItem = createNewsElement(timestamp, text);
    feed.appendChild(newsItem);
  });

  // Handle password auth
  document.getElementById('password-btn').addEventListener('click', () => {
    const attempt = prompt("Enter post password:");
    if (attempt === password) {
      authenticated = true;
      form.style.display = 'flex';
    } else {
      alert("Incorrect password.");
    }
  });

  // Post new news
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!authenticated) return alert("Unauthorized.");

    const text = input.value.trim();
    if (!text) return;

    const timestamp = new Date().toLocaleString();
    const newsItem = createNewsElement(timestamp, text);
    feed.prepend(newsItem);

    // Save
    const currentNews = JSON.parse(localStorage.getItem("news")) || [];
    currentNews.unshift({ timestamp, text });
    localStorage.setItem("news", JSON.stringify(currentNews));

    input.value = '';
  });
});

function createNewsElement(timestamp, text) {
  const div = document.createElement('div');
  div.className = 'news-item';
  div.textContent = `${timestamp}: ${text}`;
  return div;
}
