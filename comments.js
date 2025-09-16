// === JSONBIN.IO COMMENTS BACKEND ===
const BIN_ID = '68b38eb880b27952c6e7410f'; // your bin id
const API_KEY = '$2a$10$zUL6NwE5DJypqSdYn2b4kuCKQ.PNDV7jmSARUAM5euXJKPj.gOTY6'; // your api key
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Load all comments for all posts
async function loadAllComments() {
  try {
    const res = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Access-Key': API_KEY }
    });
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    return data.record.commentsByPost || {};
  } catch (e) {
    console.error(e);
    return {};
  }
}

// Save all comments for all posts
async function saveAllComments(commentsByPost) {
  try {
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': API_KEY
      },
      body: JSON.stringify({ commentsByPost })
    });
  } catch (e) {
    console.error(e);
  }
}

// Setup comment form and voting for a given post index
window.setupCommentsForPost = function(postIdx) {
  renderComments(postIdx);

  // Wait for the form to exist before attaching the handler!
  setTimeout(() => {
    const form = document.getElementById('comment-form');
    if (form) {
      form.onsubmit = async function(e) {
        e.preventDefault();
        const username = document.getElementById('comment-username').value.trim();
        const message = document.getElementById('comment-message').value.trim();
        if (!username || !message) return;
        const commentsByPost = await loadAllComments();
        if (!commentsByPost[postIdx]) commentsByPost[postIdx] = [];
        commentsByPost[postIdx].push({
          username,
          message,
          date: new Date().toLocaleString(),
          votes: 0
        });
        await saveAllComments(commentsByPost);
        document.getElementById('comment-username').value = '';
        document.getElementById('comment-message').value = '';
        renderComments(postIdx);
      };
    } else {
      console.error("comment-form not found in DOM");
    }
  }, 0);
};

// Render comments for a single post
async function renderComments(postIdx) {
  const commentsByPost = await loadAllComments();
  const comments = commentsByPost[postIdx] || [];
  const list = document.getElementById('comments-list');
  if (!list) return;
  list.innerHTML = '';
  comments.forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <strong>${escapeHTML(c.username)}</strong> (${escapeHTML(c.date)}):<br>
      ${escapeHTML(c.message)}<br>
      <button class="upvote" data-idx="${idx}">⬆️</button>
      <span class="votes">${c.votes || 0}</span>
      <button class="downvote" data-idx="${idx}">⬇️</button>
    `;
    list.appendChild(div);
  });
  // Add upvote/downvote listeners
  Array.from(list.querySelectorAll('.upvote')).forEach(btn => {
    btn.onclick = async function() {
      await voteComment(postIdx, parseInt(btn.getAttribute('data-idx')), 1);
    };
  });
  Array.from(list.querySelectorAll('.downvote')).forEach(btn => {
    btn.onclick = async function() {
      await voteComment(postIdx, parseInt(btn.getAttribute('data-idx')), -1);
    };
  });
}

async function voteComment(postIdx, commentIdx, delta) {
  const commentsByPost = await loadAllComments();
  const comments = commentsByPost[postIdx] || [];
  if (comments[commentIdx]) {
    comments[commentIdx].votes = (comments[commentIdx].votes || 0) + delta;
    await saveAllComments(commentsByPost);
    renderComments(postIdx);
  }
}

// Escape HTML utility
function escapeHTML(str) {
  return (str || '').replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m];
  });
}
