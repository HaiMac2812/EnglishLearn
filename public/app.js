// ===== API BASE =====
const API = '/api';

// ===== STATE =====
let studyCards = [];
let currentCardIndex = 0;
let isFlipped = false;
let allWords = [];

let quizQuestions = [];
let quizCurrentIndex = 0;
let quizScore = 0;
let quizAnswers = [];

let manageWords = [];
let allSentences = [];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadHomeData();
    loadCategorySelects();
    loadSentenceCategorySelects();
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
});

// ===== NAVIGATION =====
function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    if (page === 'home') loadHomeData();
    if (page === 'study') loadStudyCards();
    if (page === 'manage') loadManageWords();
    if (page === 'sentences') loadSentences();
    if (page === 'progress') loadProgress();
}

// ===== THEME =====
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    if (body.getAttribute('data-theme') === 'light') {
        body.removeAttribute('data-theme');
        icon.textContent = '🌙';
    } else {
        body.setAttribute('data-theme', 'light');
        icon.textContent = '☀️';
    }
}

// ===== KEYBOARD =====
function handleKeyboard(e) {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    const pageId = activePage.id;

    if (pageId === 'page-study') {
        if (e.code === 'Space') { e.preventDefault(); flipCard(); }
        if (e.code === 'ArrowLeft') prevCard();
        if (e.code === 'ArrowRight') nextCard();
    }
}

// ===== HOME =====
async function loadHomeData() {
    try {
        const stats = await fetch(`${API}/progress/stats`).then(r => r.json());
        document.getElementById('stat-total').textContent = stats.total;
        document.getElementById('stat-known').textContent = stats.known;
        document.getElementById('stat-learning').textContent = stats.learning;
        document.getElementById('stat-new').textContent = stats.new;

        // Categories
        const categories = await fetch(`${API}/categories`).then(r => r.json());
        const emojis = { 'Animals': '🐾', 'Food': '🍕', 'Travel': '✈️', 'Business': '💼', 'Daily Life': '🏠', 'Technology': '💻' };
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = categories.map(cat => `
      <div class="category-card" onclick="navigateTo('study'); document.getElementById('study-category').value='${cat.name}'; loadStudyCards();">
        <span class="cat-emoji">${emojis[cat.name] || '📁'}</span>
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${cat.count} từ</div>
      </div>
    `).join('');

        // Quiz history
        renderQuizHistory(stats.recentQuizzes, 'home-quiz-history');
    } catch (err) {
        console.error('Error loading home data:', err);
    }
}

function renderQuizHistory(quizzes, containerId) {
    const container = document.getElementById(containerId);
    if (!quizzes || quizzes.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p>Chưa có lịch sử kiểm tra</p></div>';
        return;
    }
    container.innerHTML = quizzes.map(q => {
        const pct = q.percentage;
        const cls = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'bad';
        const date = new Date(q.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `
      <div class="quiz-history-item">
        <div>
          <span>${q.category || 'Tất cả'}</span>
          <span class="quiz-date">${date}</span>
        </div>
        <span class="quiz-score-badge ${cls}">${q.score}/${q.total} (${pct}%)</span>
      </div>
    `;
    }).join('');
}

// ===== CATEGORY SELECTS =====
async function loadCategorySelects() {
    try {
        const categories = await fetch(`${API}/categories`).then(r => r.json());
        const options = categories.map(c => `<option value="${c.name}">${c.name} (${c.count})</option>`).join('');
        ['study-category', 'quiz-category', 'manage-category'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const first = el.querySelector('option');
                el.innerHTML = first.outerHTML + options;
            }
        });
        // Datalist for add modal
        const datalist = document.getElementById('category-datalist');
        if (datalist) {
            datalist.innerHTML = categories.map(c => `<option value="${c.name}">`).join('');
        }
    } catch (err) {
        console.error('Error loading categories:', err);
    }
}

// ===== FLASHCARD STUDY =====
async function loadStudyCards() {
    try {
        const cat = document.getElementById('study-category').value;
        const url = cat ? `${API}/vocabulary?category=${encodeURIComponent(cat)}` : `${API}/vocabulary`;
        studyCards = await fetch(url).then(r => r.json());
        currentCardIndex = 0;
        isFlipped = false;
        updateCardDisplay();
    } catch (err) {
        console.error('Error loading cards:', err);
    }
}

function updateCardDisplay() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
    isFlipped = false;

    if (studyCards.length === 0) {
        document.getElementById('card-word').textContent = 'Không có từ nào';
        document.getElementById('card-phonetic').textContent = '';
        document.getElementById('card-category').textContent = '';
        document.getElementById('card-meaning').textContent = '';
        document.getElementById('card-example').textContent = '';
        document.getElementById('card-current').textContent = '0';
        document.getElementById('card-total').textContent = '0';
        return;
    }

    const card = studyCards[currentCardIndex];
    document.getElementById('card-word').textContent = card.word;
    document.getElementById('card-phonetic').textContent = card.phonetic || '';
    document.getElementById('card-category').textContent = card.category;
    document.getElementById('card-meaning').textContent = card.meaning;
    document.getElementById('card-example').textContent = card.example ? `"${card.example}"` : '';
    document.getElementById('card-current').textContent = currentCardIndex + 1;
    document.getElementById('card-total').textContent = studyCards.length;
}

function flipCard() {
    if (studyCards.length === 0) return;
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    isFlipped = !isFlipped;
}

function nextCard() {
    if (studyCards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % studyCards.length;
    updateCardDisplay();
}

function prevCard() {
    if (studyCards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + studyCards.length) % studyCards.length;
    updateCardDisplay();
}

function shuffleCards() {
    for (let i = studyCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [studyCards[i], studyCards[j]] = [studyCards[j], studyCards[i]];
    }
    currentCardIndex = 0;
    updateCardDisplay();
    showToast('Đã xáo trộn thẻ!', 'info');
}

async function markWord(correct) {
    if (studyCards.length === 0) return;
    const card = studyCards[currentCardIndex];
    try {
        await fetch(`${API}/progress/${card._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correct })
        });
        showToast(correct ? '✅ Đã đánh dấu thuộc!' : '❌ Sẽ ôn lại từ này', correct ? 'success' : 'info');
        nextCard();
    } catch (err) {
        showToast('Lỗi lưu tiến độ', 'error');
    }
}

// ===== PRONUNCIATION =====
function speakWord() {
    if (studyCards.length === 0) return;
    const word = studyCards[currentCardIndex].word;
    speak(word);
}

function speakQuizWord() {
    if (quizQuestions.length === 0) return;
    const word = quizQuestions[quizCurrentIndex].word;
    speak(word);
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        speechSynthesis.speak(utterance);
    }
}

// ===== QUIZ =====
async function startQuiz() {
    const cat = document.getElementById('quiz-category').value;
    const count = document.getElementById('quiz-count').value;
    const url = `${API}/quiz?count=${count}${cat ? '&category=' + encodeURIComponent(cat) : ''}`;

    try {
        quizQuestions = await fetch(url).then(r => r.json());
        if (quizQuestions.length === 0) {
            showToast('Không có đủ từ vựng để kiểm tra', 'error');
            return;
        }

        // Fetch all words for generating options
        allWords = await fetch(`${API}/vocabulary`).then(r => r.json());

        quizCurrentIndex = 0;
        quizScore = 0;
        quizAnswers = [];

        document.getElementById('quiz-setup').classList.add('hidden');
        document.getElementById('quiz-result').classList.add('hidden');
        document.getElementById('quiz-area').classList.remove('hidden');

        showQuizQuestion();
    } catch (err) {
        showToast('Lỗi tạo bài kiểm tra', 'error');
    }
}

function showQuizQuestion() {
    const q = quizQuestions[quizCurrentIndex];
    document.getElementById('quiz-word').textContent = q.word;
    document.getElementById('quiz-phonetic').textContent = q.phonetic || '';
    document.getElementById('quiz-counter').textContent = `${quizCurrentIndex + 1}/${quizQuestions.length}`;
    document.getElementById('quiz-progress-fill').style.width = `${((quizCurrentIndex) / quizQuestions.length) * 100}%`;

    // Generate 4 options
    const correctAnswer = q.meaning;
    const wrongOptions = allWords
        .filter(w => w._id !== q._id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);

    const options = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);

    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = options.map(opt => `
    <button class="quiz-option" onclick="answerQuiz(this, '${opt.replace(/'/g, "\\'")}', '${correctAnswer.replace(/'/g, "\\'")}')">${opt}</button>
  `).join('');
}

function answerQuiz(el, selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.classList.add('disabled');
        if (opt.textContent === correct) opt.classList.add('correct');
    });

    const isCorrect = selected === correct;
    if (!isCorrect) el.classList.add('wrong');
    if (isCorrect) quizScore++;

    quizAnswers.push({
        word: quizQuestions[quizCurrentIndex].word,
        correct: correct,
        selected: selected,
        isCorrect
    });

    // Update progress in DB
    fetch(`${API}/progress/${quizQuestions[quizCurrentIndex]._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct: isCorrect })
    }).catch(() => { });

    setTimeout(() => {
        quizCurrentIndex++;
        if (quizCurrentIndex < quizQuestions.length) {
            showQuizQuestion();
        } else {
            showQuizResult();
        }
    }, 1200);
}

async function showQuizResult() {
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');

    const pct = Math.round((quizScore / quizQuestions.length) * 100);
    document.getElementById('result-score').textContent = quizScore;
    document.getElementById('result-total').textContent = quizQuestions.length;
    document.getElementById('result-percentage').textContent = `${pct}%`;

    if (pct >= 80) {
        document.getElementById('result-emoji').textContent = '🎉';
        document.getElementById('result-title').textContent = 'Tuyệt vời!';
        document.getElementById('result-percentage').style.color = 'var(--success)';
    } else if (pct >= 50) {
        document.getElementById('result-emoji').textContent = '💪';
        document.getElementById('result-title').textContent = 'Khá tốt!';
        document.getElementById('result-percentage').style.color = 'var(--warning)';
    } else {
        document.getElementById('result-emoji').textContent = '📚';
        document.getElementById('result-title').textContent = 'Cần ôn thêm!';
        document.getElementById('result-percentage').style.color = 'var(--danger)';
    }

    // Details
    const details = document.getElementById('result-details');
    details.innerHTML = quizAnswers.map(a => `
    <div class="result-detail-item">
      <span>${a.isCorrect ? '✅' : '❌'} ${a.word}</span>
      <span>${a.correct}</span>
    </div>
  `).join('');

    // Save to history
    const cat = document.getElementById('quiz-category').value || 'Tất cả';
    try {
        await fetch(`${API}/quiz/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score: quizScore, total: quizQuestions.length, percentage: pct, category: cat })
        });
    } catch (err) {
        console.error('Error saving quiz history', err);
    }

    document.getElementById('quiz-progress-fill').style.width = '100%';
}

function showQuizSetup() {
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-setup').classList.remove('hidden');
}

// ===== MANAGE VOCABULARY =====
async function loadManageWords() {
    try {
        const cat = document.getElementById('manage-category').value;
        const url = cat ? `${API}/vocabulary?category=${encodeURIComponent(cat)}` : `${API}/vocabulary`;
        manageWords = await fetch(url).then(r => r.json());
        renderManageWords(manageWords);
    } catch (err) {
        showToast('Lỗi tải từ vựng', 'error');
    }
}

function filterManageWords() {
    const search = document.getElementById('manage-search').value.toLowerCase();
    const filtered = manageWords.filter(w =>
        w.word.toLowerCase().includes(search) || w.meaning.toLowerCase().includes(search)
    );
    renderManageWords(filtered);
}

function renderManageWords(words) {
    const list = document.getElementById('word-list');
    if (words.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><p>Chưa có từ vựng nào</p></div>';
        return;
    }
    list.innerHTML = words.map(w => `
    <div class="word-card">
      <div class="word-info">
        <div class="word-english">${w.word}</div>
        <div class="word-vietnamese">${w.meaning}</div>
        <div class="word-meta">
          <span class="word-tag">${w.category}</span>
          ${w.phonetic ? `<span style="color:var(--text-muted);font-size:12px">${w.phonetic}</span>` : ''}
        </div>
      </div>
      <div class="word-actions">
        <button class="btn-icon" onclick="speak('${w.word.replace(/'/g, "\\'")}')" title="Phát âm">🔊</button>
        <button class="btn-icon" onclick="editWord('${w._id}')" title="Sửa">✏️</button>
        <button class="btn-icon danger" onclick="deleteWord('${w._id}')" title="Xóa">🗑️</button>
      </div>
    </div>
  `).join('');
}

// ===== WORD MODAL =====
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Thêm từ mới';
    document.getElementById('word-id').value = '';
    document.getElementById('word-form').reset();
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

async function editWord(id) {
    try {
        const words = manageWords.length > 0 ? manageWords : await fetch(`${API}/vocabulary`).then(r => r.json());
        const word = words.find(w => w._id === id);
        if (!word) return;

        document.getElementById('modal-title').textContent = 'Sửa từ vựng';
        document.getElementById('word-id').value = word._id;
        document.getElementById('input-word').value = word.word;
        document.getElementById('input-meaning').value = word.meaning;
        document.getElementById('input-phonetic').value = word.phonetic || '';
        document.getElementById('input-example').value = word.example || '';
        document.getElementById('input-category').value = word.category;
        document.getElementById('modal-overlay').classList.remove('hidden');
    } catch (err) {
        showToast('Lỗi tải từ', 'error');
    }
}

async function saveWord(e) {
    e.preventDefault();
    const id = document.getElementById('word-id').value;
    const data = {
        word: document.getElementById('input-word').value.trim(),
        meaning: document.getElementById('input-meaning').value.trim(),
        phonetic: document.getElementById('input-phonetic').value.trim(),
        example: document.getElementById('input-example').value.trim(),
        category: document.getElementById('input-category').value.trim()
    };

    try {
        if (id) {
            await fetch(`${API}/vocabulary/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Đã cập nhật từ!', 'success');
        } else {
            await fetch(`${API}/vocabulary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Đã thêm từ mới!', 'success');
        }
        closeModal();
        loadManageWords();
        loadCategorySelects();
    } catch (err) {
        showToast('Lỗi lưu từ', 'error');
    }
}

async function deleteWord(id) {
    if (!confirm('Bạn có chắc muốn xóa từ này?')) return;
    try {
        await fetch(`${API}/vocabulary/${id}`, { method: 'DELETE' });
        showToast('Đã xóa!', 'success');
        loadManageWords();
        loadCategorySelects();
    } catch (err) {
        showToast('Lỗi xóa từ', 'error');
    }
}

// ===== SENTENCE STRUCTURES =====
async function loadSentenceCategorySelects() {
    try {
        const categories = await fetch(`${API}/sentences/categories`).then(r => r.json());
        const options = categories.map(c => `<option value="${c.name}">${c.name} (${c.count})</option>`).join('');
        const el = document.getElementById('sentence-category-filter');
        if (el) {
            const first = el.querySelector('option');
            el.innerHTML = first.outerHTML + options;
        }
        const datalist = document.getElementById('sent-category-datalist');
        if (datalist) {
            datalist.innerHTML = categories.map(c => `<option value="${c.name}">`).join('');
        }
    } catch (err) {
        console.error('Error loading sentence categories:', err);
    }
}

async function loadSentences() {
    try {
        const cat = document.getElementById('sentence-category-filter').value;
        const url = cat ? `${API}/sentences?category=${encodeURIComponent(cat)}` : `${API}/sentences`;
        allSentences = await fetch(url).then(r => r.json());
        renderSentences(allSentences);
    } catch (err) {
        showToast('Lỗi tải cấu trúc câu', 'error');
    }
}

function filterSentences() {
    const search = document.getElementById('sentence-search').value.toLowerCase();
    const filtered = allSentences.filter(s =>
        s.structure.toLowerCase().includes(search) ||
        s.meaning.toLowerCase().includes(search) ||
        (s.formula && s.formula.toLowerCase().includes(search))
    );
    renderSentences(filtered);
}

function renderSentences(sentences) {
    const list = document.getElementById('sentence-list');
    if (sentences.length === 0) {
        list.innerHTML = '<div class="empty-state"><div class="empty-icon">📐</div><p>Chưa có cấu trúc câu nào. Hãy thêm mới!</p></div>';
        return;
    }
    list.innerHTML = sentences.map(s => {
        const examplesHtml = s.examples && s.examples.length > 0
            ? `<div class="sentence-examples">${s.examples.map(ex => `
            <div class="ex-item"><span class="ex-en">🔹 ${ex.english}</span> → ${ex.vietnamese}</div>
          `).join('')}</div>`
            : '';
        return `
      <div class="sentence-card">
        <div class="sentence-info">
          <div class="sentence-structure">${s.structure}</div>
          <div class="sentence-meaning">${s.meaning}</div>
          ${s.formula ? `<div class="sentence-formula">${s.formula}</div>` : ''}
          ${examplesHtml}
          <div class="word-meta" style="margin-top:8px">
            <span class="word-tag">${s.category}</span>
          </div>
          ${s.note ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px">📝 ${s.note}</div>` : ''}
        </div>
        <div class="sentence-actions">
          <button class="btn-icon" onclick="editSentence('${s._id}')" title="Sửa">✏️</button>
          <button class="btn-icon danger" onclick="deleteSentence('${s._id}')" title="Xóa">🗑️</button>
        </div>
      </div>
    `;
    }).join('');
}

// ===== SENTENCE MODAL =====
function showAddSentenceModal() {
    document.getElementById('sentence-modal-title').textContent = 'Thêm cấu trúc câu';
    document.getElementById('sentence-id').value = '';
    document.getElementById('sentence-form').reset();
    document.getElementById('examples-container').innerHTML = `
    <div class="example-row">
      <input type="text" class="text-input example-en" placeholder="English: I eat rice.">
      <input type="text" class="text-input example-vi" placeholder="Vietnamese: Tôi ăn cơm.">
    </div>
  `;
    document.getElementById('sentence-modal-overlay').classList.remove('hidden');
}

function closeSentenceModal() {
    document.getElementById('sentence-modal-overlay').classList.add('hidden');
}

function addExampleRow() {
    const container = document.getElementById('examples-container');
    const row = document.createElement('div');
    row.className = 'example-row';
    row.innerHTML = `
    <input type="text" class="text-input example-en" placeholder="English">
    <input type="text" class="text-input example-vi" placeholder="Vietnamese">
  `;
    container.appendChild(row);
}

async function editSentence(id) {
    const sent = allSentences.find(s => s._id === id);
    if (!sent) return;

    document.getElementById('sentence-modal-title').textContent = 'Sửa cấu trúc câu';
    document.getElementById('sentence-id').value = sent._id;
    document.getElementById('input-structure').value = sent.structure;
    document.getElementById('input-sent-meaning').value = sent.meaning;
    document.getElementById('input-formula').value = sent.formula || '';
    document.getElementById('input-sent-category').value = sent.category;
    document.getElementById('input-note').value = sent.note || '';

    const container = document.getElementById('examples-container');
    if (sent.examples && sent.examples.length > 0) {
        container.innerHTML = sent.examples.map(ex => `
      <div class="example-row">
        <input type="text" class="text-input example-en" value="${ex.english || ''}" placeholder="English">
        <input type="text" class="text-input example-vi" value="${ex.vietnamese || ''}" placeholder="Vietnamese">
      </div>
    `).join('');
    } else {
        container.innerHTML = `
      <div class="example-row">
        <input type="text" class="text-input example-en" placeholder="English">
        <input type="text" class="text-input example-vi" placeholder="Vietnamese">
      </div>
    `;
    }

    document.getElementById('sentence-modal-overlay').classList.remove('hidden');
}

async function saveSentence(e) {
    e.preventDefault();
    const id = document.getElementById('sentence-id').value;

    // Collect examples
    const rows = document.querySelectorAll('#examples-container .example-row');
    const examples = [];
    rows.forEach(row => {
        const en = row.querySelector('.example-en').value.trim();
        const vi = row.querySelector('.example-vi').value.trim();
        if (en || vi) examples.push({ english: en, vietnamese: vi });
    });

    const data = {
        structure: document.getElementById('input-structure').value.trim(),
        meaning: document.getElementById('input-sent-meaning').value.trim(),
        formula: document.getElementById('input-formula').value.trim(),
        category: document.getElementById('input-sent-category').value.trim(),
        note: document.getElementById('input-note').value.trim(),
        examples
    };

    try {
        if (id) {
            await fetch(`${API}/sentences/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Đã cập nhật cấu trúc!', 'success');
        } else {
            await fetch(`${API}/sentences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            showToast('Đã thêm cấu trúc mới!', 'success');
        }
        closeSentenceModal();
        loadSentences();
        loadSentenceCategorySelects();
    } catch (err) {
        showToast('Lỗi lưu cấu trúc', 'error');
    }
}

async function deleteSentence(id) {
    if (!confirm('Bạn có chắc muốn xóa cấu trúc này?')) return;
    try {
        await fetch(`${API}/sentences/${id}`, { method: 'DELETE' });
        showToast('Đã xóa!', 'success');
        loadSentences();
        loadSentenceCategorySelects();
    } catch (err) {
        showToast('Lỗi xóa', 'error');
    }
}

// ===== PROGRESS =====
async function loadProgress() {
    try {
        const stats = await fetch(`${API}/progress/stats`).then(r => r.json());

        // Ring
        const pct = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0;
        document.getElementById('ring-percent').textContent = `${pct}%`;
        const circumference = 2 * Math.PI * 50; // r=50
        const offset = circumference - (pct / 100) * circumference;
        const ringFill = document.getElementById('ring-fill');
        ringFill.style.stroke = 'var(--accent-primary)';
        ringFill.style.strokeDasharray = circumference;
        setTimeout(() => { ringFill.style.strokeDashoffset = offset; }, 100);

        // Category progress
        const categories = await fetch(`${API}/categories`).then(r => r.json());
        const progress = await fetch(`${API}/progress`).then(r => r.json());

        const catProgress = document.getElementById('category-progress');
        catProgress.innerHTML = categories.map(cat => {
            const catWords = progress.filter(p => p.wordId && p.wordId.category === cat.name);
            const known = catWords.filter(p => p.status === 'known').length;
            const catPct = cat.count > 0 ? Math.round((known / cat.count) * 100) : 0;
            return `
        <div class="progress-bar-item">
          <div class="progress-bar-header">
            <span>${cat.name}</span>
            <span>${known}/${cat.count} (${catPct}%)</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width:${catPct}%"></div>
          </div>
        </div>
      `;
        }).join('');

        // Quiz history
        renderQuizHistory(stats.recentQuizzes, 'progress-quiz-history');
    } catch (err) {
        console.error('Error loading progress:', err);
    }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
