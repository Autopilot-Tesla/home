const BIN_ID = '68b38eb880b27952c6e7410f';
const API_KEY = '$2a$10$zUL6NwE5DJypqSdYn2b4kuCKQ.PNDV7jmSARUAM5euXJKPj.gOTY6';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function loadAllComments() {
  try {
    const res = await fetch(`${BIN_URL}/latest`, {
      headers: { 'X-Access-Key': API_KEY }
    });
    if (!res.ok) throw new Error("Failed to fetch comments: " + res.status);
    const data = await res.json();
    console.log("Loaded comments:", data.record.commentsByPost);
    return data.record.commentsByPost || {};
  } catch (e) {
    console.error(e);
    return {};
  }
}

async function saveAllComments(commentsByPost) {
  try {
    const res = await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': API_KEY
      },
      body: JSON.stringify({ commentsByPost })
    });
    if (!res.ok) throw new Error("Failed to save comments: " + res.status);
    const data = await res.json();
    console.log("Saved comments:", data);
    return data;
  } catch (e) {
    console.error(e);
  }
}

window.setupCommentsForPost = function(postIdx) {
  console.log("setupCommentsForPost called, postIdx:", postIdx);
  renderComments(postIdx);

  setTimeout(() => {
    const form = document.getElementById('comment-form');
    if (form) {
      console.log("comment-form found, attaching onsubmit");
      form.onsubmit = async function(e) {
        e.preventDefault();
        console.log("comment-form submitted");
        const username = document.getElementById('comment-username').value.trim();
        const message = document.getElementById('comment-message').value.trim();
        if (!username || !message) {
          console.log("Empty username or message");
          return;
        }
        const now = new Date();
        const dateString = now.toLocaleDateString();
        const timeString = now.toLocaleTimeString();
        const commentsByPost = await loadAllComments();
        if (!commentsByPost[postIdx]) commentsByPost[postIdx] = [];
        commentsByPost[postIdx].push({
          username,
          message,
          date: dateString,
          time: timeString,
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

async function renderComments(postIdx) {
  const commentsByPost = await loadAllComments();
  const comments = commentsByPost[postIdx] || [];
  const list = document.getElementById('comments-list');
  if (!list) {
    console.error("comments-list not found in DOM");
    return;
  }
  list.innerHTML = '';
  comments.forEach((c, idx) => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.innerHTML = `
      <strong>${escapeHTML(c.username)}</strong> (${escapeHTML(c.date)} ${escapeHTML(c.time)}):<br>
      ${escapeHTML(c.message)}<br>
      <button class="upvote" data-idx="${idx}">⬆️</button>
      <span class="votes">${c.votes || 0}</span>
      <button class="downvote" data-idx="${idx}">⬇️</button>
    `;
    list.appendChild(div);
  });
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

function escapeHTML(str) {
  return (str || '').replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m];
  });
}
