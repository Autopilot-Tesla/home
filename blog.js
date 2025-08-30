// --- Google One Tap / OAuth2 simulation for demo ---
// In production, use Firebase Auth or Google Identity Services

const allowedEmails = [
  'jianjjlee@gmail.com',
  '395918@cusdk8.org'
];

// Basic Google Sign-In simulation. Replace with real Google Auth in production.
document.getElementById('login-btn').onclick = function() {
  const email = prompt('Enter your Gmail address for demo login:');
  if (allowedEmails.includes(email)) {
    document.getElementById('login-status').textContent = 'Login successful!';
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('blog-content').style.display = '';
    window.currentUserEmail = email;
    loadPosts();
  } else {
    document.getElementById('login-status').textContent = 'Access denied: email not allowed.';
  }
};

// --- Blog Post Storage (localStorage for demo) ---
function getPosts() {
  return JSON.parse(localStorage.getItem('blog-posts') || '[]');
}
function setPosts(posts) {
  localStorage.setItem('blog-posts', JSON.stringify(posts));
}
function loadPosts() {
  const posts = getPosts();
  const feed = document.getElementById('posts-feed');
  feed.innerHTML = '';
  posts.slice().reverse().forEach(post => {
    const div = document.createElement('div');
    div.className = 'blog-post';
    div.innerHTML = `<strong>${post.author}</strong>: ${post.content} <span class="date">${post.date}</span>`;
    feed.appendChild(div);
  });
}

document.getElementById('post-form')?.addEventListener('submit', function(e){
  e.preventDefault();
  const input = document.getElementById('post-input');
  const content = input.value.trim();
  if (!content) return;
  const posts = getPosts();
  posts.push({
    author: window.currentUserEmail,
    content,
    date: new Date().toLocaleString()
  });
  setPosts(posts);
  input.value = '';
  loadPosts();
});