document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.cat-btn');
  const cards = document.querySelectorAll('.movie-card');
  const modal = document.getElementById('player-modal');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const form = document.getElementById('comment-form');
  const commentsList = document.getElementById('comments-list');
  const noCommentsMsg = document.getElementById('no-comments-msg');

  // --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: Сброс фильтра ---
  function resetFilter() {
    cards.forEach(card => card.style.display = '');
    const activeCatBtn = document.querySelector('.cat-btn.active');
    if (activeCatBtn) {
      const cat = activeCatBtn.getAttribute('data-cat').toLowerCase();
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-cat').toLowerCase();
        const shouldShow = (cat === 'all') || cardCat.includes(cat);
        card.style.display = shouldShow ? '' : 'none';
      });
    }
  }

  // === ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ===
  if (buttons.length > 0 && cards.length > 0) {
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-cat').toLowerCase();

        cards.forEach(card => {
          const cardCat = card.getAttribute('data-cat').toLowerCase();
          const shouldShow = (cat === 'all') || cardCat.includes(cat);
          card.style.display = shouldShow ? '' : 'none';
        });
      });
    });
  }

  // === МОДАЛЬНОЕ ОКНО ===
  if (modal) {
    cards.forEach(card => {
      card.addEventListener('click', function () {
        const src = this.getAttribute('data-src');
        const poster = this.getAttribute('data-poster');
        const desc = this.getAttribute('data-desc');
        if (src) openPlayer(src, poster, desc);
      });
    });

    modal.addEventListener('click', function (e) {
      if (e.target === this) closePlayer(e);
    });
  }

  function getEmbedUrl(src) {
    const rutubeMatch = src.match(/rutube\.ru\/video\/([a-z0-9]+)/i);
    if (rutubeMatch && rutubeMatch.length > 1) {
      // ВАЖНО: берём именно [1], а не весь массив
      return 'https://rutube.ru/play/embed/' + rutubeMatch[1] + '/';
    }
    return src;
  }

  function openPlayer(src, poster, desc) {
    const iframe = document.getElementById('modal-iframe');
    const posterImg = document.getElementById('modal-poster');
    const descDiv = document.getElementById('modal-desc');

    if (posterImg) posterImg.src = poster;
    if (descDiv) descDiv.textContent = desc;
    if (iframe) iframe.src = getEmbedUrl(src);

    modal.style.display = 'flex';
  }

  function closePlayer(e) {
    if (e) e.preventDefault();
    const iframe = document.getElementById('modal-iframe');
    if (modal) modal.style.display = 'none';
    if (iframe) iframe.src = '';
  }

  // === ВКЛАДКИ (ФИЛЬМЫ / КОММЕНТАРИИ) ===
  if (tabBtns.length > 0 && tabPanes.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.id.replace('btn-', 'tab-');
        const targetPane = document.getElementById(targetId);
        
        if (targetPane) {
          targetPane.classList.add('active');
        }

        if (btn.id === 'btn-movies') {
          resetFilter();
        }
      });
    });
  }

  // === КОММЕНТАРИИ ===
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderComments() {
    const saved = localStorage.getItem('artem_entertainment_comments');
    // ИСПРАВЛЕНО: теперь явно возвращаем пустой массив, если нет данных
    const comments = saved ? JSON.parse(saved) : [];

    if (!commentsList) return;

    commentsList.innerHTML = '';

    if (comments.length === 0) {
      if (noCommentsMsg) noCommentsMsg.style.display = 'block';
      return;
    } else {
      if (noCommentsMsg) noCommentsMsg.style.display = 'none';
    }

    comments.slice().reverse().forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment-item';
      
      const dateObj = new Date(c.date);
      const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      div.innerHTML = `
        <span class="comment-author">${escapeHtml(c.name)}</span>
        <div class="comment-date">${dateStr}</div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      `;
      commentsList.appendChild(div);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('comment-name');
      const textInput = document.getElementById('comment-text');

      if (!nameInput || !textInput) return;

      const name = nameInput.value.trim();
      const text = textInput.value.trim();

      if (!name || !text) return;

      const saved = localStorage.getItem('artem_entertainment_comments');
      // ИСПРАВЛЕНО: пустой массив по умолчанию
      const comments = saved ? JSON.parse(saved) : [];

      comments.push({
        name: name,
        text: text,
        date: new Date().toISOString()
      });

      localStorage.setItem('artem_entertainment_comments', JSON.stringify(comments));
      form.reset();
      renderComments();
    });
  }

  renderComments();
});
