// --- Login simulation for demo ---
const allowedEmails = [
  'jianjjlee@gmail.com',
  '395918@cusdk8.org'
];

// Only show login/post form if user is logged in
function showEditOptions(loggedIn) {
  document.getElementById('post-form').style.display = loggedIn ? '' : 'none';
  document.getElementById('login-box').style.display = loggedIn ? 'none' : '';
}
document.getElementById('login-btn').onclick = function() {
  const email = prompt('Enter your email to login:');
  if (allowedEmails.includes(email)) {
    document.getElementById('login-status').textContent = 'Login successful!';
    window.currentUserEmail = email;
    showEditOptions(true);
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

// --- Render blog list view (cards) ---
function renderPostsList() {
  const posts = getPosts();
  const list = document.getElementById('posts-list-view');
  const singleView = document.getElementById('single-post-view');
  list.innerHTML = '';
  singleView.style.display = 'none';
  list.style.display = '';
  posts.slice().reverse().forEach((post, idx) => {
    const div = document.createElement('div');
    div.className = 'blog-card';
    div.innerHTML = `
      <div class="blog-card-content">
        <div class="blog-card-title">${escapeHTML(post.title)}</div>
        <div class="blog-card-date">${escapeHTML(post.date)}</div>
        <div class="blog-card-line"></div>
      </div>
    `;
    div.onclick = () => showSinglePost(posts.length - 1 - idx);
    list.appendChild(div);
  });
}

// --- Show single post view ---
function showSinglePost(idx) {
  const posts = getPosts();
  const post = posts[idx];
  if (!post) return;
  const singleView = document.getElementById('single-post-view');
  const hitsBadge = `<img src="https://hits.sh/autopilot-tesla.github.io/blog.html!badge.svg?style=flat-square&label=HITS" alt="HITS" style="vertical-align:middle;margin-left:15px">`;
  singleView.innerHTML = `
    <div class="single-post-layout">
      <div class="single-post-title">${escapeHTML(post.title)}</div>
      <div class="single-post-line"></div>
      <div class="single-post-meta">${escapeHTML(post.date)}, written by ${escapeHTML(post.author)}
        ${hitsBadge}
      </div>
      <div class="single-post-line"></div>
      <div class="single-post-content">${escapeHTML(post.content)}</div>
      <div class="comments-section">
        <h3>Comments</h3>
        <form id="comment-form">
          <input type="text" id="comment-username" placeholder="Your name" required />
          <input type="text" id="comment-message" placeholder="Your comment..." required />
          <button type="submit">Add Comment</button>
        </form>
        <div id="comments-list"></div>
      </div>
      <button class="back-to-list-btn">Back</button>
    </div>
  `;
  singleView.querySelector('.back-to-list-btn').onclick = renderPostsList;
  // Hook up comments for this post
  if (window.setupCommentsForPost) window.setupCommentsForPost(idx);
  document.getElementById('posts-list-view').style.display = 'none';
  singleView.style.display = '';
}

// --- Escape HTML utility ---
function escapeHTML(str) {
  return (str || '').replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// --- Submit handler for new posts ---
document.getElementById('post-form')?.addEventListener('submit', function(e){
  e.preventDefault();
  const titleInput = document.getElementById('post-title-input');
  const contentInput = document.getElementById('post-input');
  const title = titleInput.value.trim();
  const content = contentInput.value.trim();
  if (!title || !content) return;
  const posts = getPosts();
  posts.push({
    author: window.currentUserEmail,
    title,
    content,
    date: new Date().toLocaleDateString()
  });
  setPosts(posts);
  titleInput.value = '';
  contentInput.value = '';
  renderPostsList();
});

// Always show posts and comments to everyone
showEditOptions(false);
renderPostsList();
