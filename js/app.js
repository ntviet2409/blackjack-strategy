// ══════════════════════════════════════════
//  THEME & NAV
// ══════════════════════════════════════════
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  document.getElementById('themeToggle').textContent = isDark ? 'Light' : 'Dark';
  localStorage.setItem('bj-theme', isDark ? 'dark' : 'light');
}
(function initTheme() {
  if (localStorage.getItem('bj-theme') === 'dark') {
    document.body.classList.add('dark');
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = 'Light';
  }
})();

function toggleMobileMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
}

// ══════════════════════════════════════════
//  TAB SWITCHING
// ══════════════════════════════════════════
function switchTab(name) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name)?.classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase().includes(name)) b.classList.add('active');
  });
}

// ══════════════════════════════════════════
//  STRATEGY CHARTS
// ══════════════════════════════════════════
function renderChart(containerId, data, rowLabels, rowPrefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const table = document.createElement('table');
  table.className = 'strategy-table';
  const isPair = rowPrefix === 'Pair';

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  hr.innerHTML = '<th>' + rowPrefix + '</th>' + DEALER_CARDS.map(c => '<th>' + c + '</th>').join('');
  thead.appendChild(hr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rowLabels.forEach(label => {
    const row = data[label];
    if (!row) return;
    const handLabel = isPair ? ('Pair of ' + label + 's') : (containerId === 'softChart' ? 'Soft ' + label : label);
    const tr = document.createElement('tr');
    tr.innerHTML = '<td class="row-label">' + label + '</td>' +
      row.map((action, i) => {
        return '<td class="action-cell action-' + action +
               '" data-action="' + action +
               '" data-hand="' + handLabel +
               '" data-dealer="' + DEALER_CARDS[i] + '">' + action + '</td>';
      }).join('');
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// ══════════════════════════════════════════
//  CHART CELL TOOLTIP
// ══════════════════════════════════════════
let chartTooltipEl = null;
function ensureChartTooltip() {
  if (chartTooltipEl) return chartTooltipEl;
  chartTooltipEl = document.createElement('div');
  chartTooltipEl.className = 'chart-tooltip';
  document.body.appendChild(chartTooltipEl);
  return chartTooltipEl;
}
function positionChartTooltipAt(x, y) {
  const tip = chartTooltipEl;
  if (!tip) return;
  const pad = 14;
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let nx = x + pad;
  let ny = y + pad;
  if (nx + w > window.innerWidth - 8) nx = x - w - pad;
  if (nx < 8) nx = 8;
  if (ny + h > window.innerHeight - 8) ny = y - h - pad;
  if (ny < 8) ny = 8;
  tip.style.left = nx + 'px';
  tip.style.top = ny + 'px';
}
function positionChartTooltipForCell(cell) {
  const r = cell.getBoundingClientRect();
  const tip = chartTooltipEl;
  if (!tip) return;
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  const margin = 8;
  let x = r.left + (r.width / 2) - (w / 2);
  let y = r.top - h - margin;
  if (y < margin) y = r.bottom + margin;
  if (x < margin) x = margin;
  if (x + w > window.innerWidth - margin) x = window.innerWidth - w - margin;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}
function showChartTooltipFor(cell) {
  const action = cell.dataset.action;
  const info = ACTION_INFO[action];
  if (!info) return null;
  const tip = ensureChartTooltip();
  tip.innerHTML =
    '<div class="tt-context">Your <strong>' + cell.dataset.hand +
    '</strong> vs Dealer <strong>' + cell.dataset.dealer + '</strong></div>' +
    '<div class="tt-action action-' + action + '">' + action + ' — ' + info.label + '</div>' +
    '<div class="tt-desc">' + info.desc + '</div>';
  tip.classList.add('visible');
  return tip;
}
function hideChartTooltip() {
  if (chartTooltipEl) {
    chartTooltipEl.classList.remove('visible');
    chartTooltipEl.dataset.sticky = '';
  }
}
function initChartTooltips() {
  // Mouse / hover (desktop)
  document.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('.action-cell');
    if (!cell) return;
    if (chartTooltipEl && chartTooltipEl.dataset.sticky === '1') return; // tap-locked
    if (!showChartTooltipFor(cell)) return;
    positionChartTooltipAt(e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => {
    if (!chartTooltipEl || !chartTooltipEl.classList.contains('visible')) return;
    if (chartTooltipEl.dataset.sticky === '1') return;
    if (e.target.closest('.action-cell')) positionChartTooltipAt(e.clientX, e.clientY);
  });
  document.addEventListener('mouseout', (e) => {
    if (!chartTooltipEl || chartTooltipEl.dataset.sticky === '1') return;
    const cell = e.target.closest('.action-cell');
    if (cell && !cell.contains(e.relatedTarget)) hideChartTooltip();
  });

  // Tap (touch / mobile) — pointerup with non-mouse, OR fallback click on touch devices
  document.addEventListener('click', (e) => {
    // Treat as tap only when there is no hovering pointer (touch / pen). On desktop, hover already handled it.
    const isTouchLike = !window.matchMedia('(hover: hover)').matches;
    if (!isTouchLike) return;
    const cell = e.target.closest('.action-cell');
    if (cell) {
      showChartTooltipFor(cell);
      positionChartTooltipForCell(cell);
      chartTooltipEl.dataset.sticky = '1';
    } else if (chartTooltipEl && chartTooltipEl.classList.contains('visible')) {
      hideChartTooltip();
    }
  });
  // Dismiss sticky tooltip on scroll
  window.addEventListener('scroll', () => {
    if (chartTooltipEl && chartTooltipEl.dataset.sticky === '1') hideChartTooltip();
  }, { passive: true });
}

function renderAllCharts() {
  renderChart('hardChart', HARD_STRATEGY, [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21], 'Hand');
  renderChart('softChart', SOFT_STRATEGY, [13,14,15,16,17,18,19,20,21], 'Hand');
  renderChart('pairChart', PAIR_STRATEGY, ['A','2','3','4','5','6','7','8','9','10'], 'Pair');
}

function renderLegend() {
  const el = document.getElementById('legend');
  if (!el) return;
  el.innerHTML = Object.entries(ACTION_INFO).map(([code, info]) =>
    '<span class="legend-item action-' + code + '"><span class="legend-swatch"></span>' + code + ' = ' + info.label + '</span>'
  ).join('');
}

// ══════════════════════════════════════════
//  SHARED CARD UTILITIES
// ══════════════════════════════════════════
function createDeck(n) {
  const d = [];
  for (let i = 0; i < n; i++)
    for (const s of SUITS) for (const v of CARD_VALUES) d.push({ value:v, suit:s });
  return d;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardNum(v) { return v === 'A' ? 11 : ['K','Q','J'].includes(v) ? 10 : parseInt(v); }

function handValue(hand) {
  let t = 0, a = 0;
  for (const c of hand) { t += cardNum(c.value); if (c.value === 'A') a++; }
  while (t > 21 && a > 0) { t -= 10; a--; }
  return t;
}

function isSoft(hand) {
  let t = 0, a = 0;
  for (const c of hand) { t += cardNum(c.value); if (c.value === 'A') a++; }
  while (t > 21 && a > 0) { t -= 10; a--; }
  return a > 0 && t <= 21;
}

function isPair(hand) {
  if (hand.length !== 2) return false;
  const norm = v => v === 'A' ? 'A' : cardNum(v).toString();
  return norm(hand[0].value) === norm(hand[1].value);
}

function handType(hand) {
  if (isPair(hand)) return 'pairs';
  if (isSoft(hand)) return 'soft';
  return 'hard';
}

function getCorrectAction(hand, dealerUpcard) {
  const dup = ['J','Q','K'].includes(dealerUpcard) ? '10' : dealerUpcard;
  const dIdx = DEALER_CARDS.indexOf(dup);
  if (dIdx === -1) return 'S';

  if (isPair(hand)) {
    const pv = hand[0].value === 'A' ? 'A' : cardNum(hand[0].value).toString();
    if (PAIR_STRATEGY[pv]) return PAIR_STRATEGY[pv][dIdx];
  }
  const val = handValue(hand);
  if (isSoft(hand) && SOFT_STRATEGY[val]) return SOFT_STRATEGY[val][dIdx];
  const hv = Math.min(val, 21);
  if (hv >= 5 && HARD_STRATEGY[hv]) return HARD_STRATEGY[hv][dIdx];
  return 'H';
}

function actionMatches(chosen, correct) {
  if (chosen === correct) return true;
  if (correct === 'Ds' && (chosen === 'D' || chosen === 'S')) return true;
  if (correct === 'Ph' && (chosen === 'P' || chosen === 'H')) return true;
  if (correct === 'Rh' && (chosen === 'R' || chosen === 'H')) return true;
  return false;
}

function renderCard(card, faceDown) {
  if (faceDown) return '<div class="card card-back"><div class="card-inner">?</div></div>';
  const sym = SUIT_SYMBOLS[card.suit];
  const color = SUIT_COLORS[card.suit];
  return '<div class="card" style="color:' + color + '">' +
    '<div class="card-corner top-left"><span class="card-val">' + card.value + '</span><span class="card-suit">' + sym + '</span></div>' +
    '<div class="card-center">' + sym + '</div>' +
    '<div class="card-corner bottom-right"><span class="card-val">' + card.value + '</span><span class="card-suit">' + sym + '</span></div>' +
    '</div>';
}

function renderMiniCard(val, suit) {
  const sym = SUIT_SYMBOLS[suit || 'spades'];
  const color = SUIT_COLORS[suit || 'spades'];
  return '<div class="mini-card" style="color:' + color + '"><span>' + val + '</span><span>' + sym + '</span></div>';
}

function renderHand(hand, hideIdx) {
  return hand.map((c, i) => renderCard(c, i === hideIdx)).join('');
}

// ══════════════════════════════════════════
//  PRACTICE TRAINER (Step 3)
//  Multi-decision: player makes EVERY choice
// ══════════════════════════════════════════
let practiceDeck = [];
let pHand = [], dHand = [];
let pState = 'idle'; // idle, firstAction, playing, done
let pFilter = 'all';
let pIsFirstAction = true;
let pStats = JSON.parse(localStorage.getItem('bj-pstats') || '{"correct":0,"wrong":0,"streak":0,"best":0,"byType":{"hard":[0,0],"soft":[0,0],"pairs":[0,0]}}');

function ensurePracticeDeck() {
  if (practiceDeck.length < 20) practiceDeck = shuffle(createDeck(6));
}

function setPracticeFilter(f) {
  pFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.textContent.toLowerCase().includes(f === 'all' ? 'all' : f)));
}

function dealPracticeHand() {
  ensurePracticeDeck();

  // Keep dealing until we get the right type for the filter
  let attempts = 0;
  do {
    pHand = [practiceDeck.pop(), practiceDeck.pop()];
    dHand = [practiceDeck.pop(), practiceDeck.pop()];
    attempts++;
    if (attempts > 100) break; // safety valve
  } while (pFilter !== 'all' && handType(pHand) !== pFilter);

  pState = 'firstAction';
  pIsFirstAction = true;
  msg('practiceMsg', '', '');
  updatePracticeUI();
}

function updatePracticeUI() {
  const dc = document.getElementById('dealerCards');
  const pc = document.getElementById('playerCards');
  if (!dc) return;

  const hideDealer = pState === 'firstAction' || pState === 'playing';
  dc.innerHTML = renderHand(dHand, hideDealer ? 1 : -1);
  pc.innerHTML = renderHand(pHand, -1);

  document.getElementById('dealerTotal').textContent = hideDealer ? cardNum(dHand[0].value) : handValue(dHand);
  document.getElementById('playerTotal').textContent = handValue(pHand);

  const actions = document.getElementById('practiceActions');
  const dealBtn = document.getElementById('dealBtn');

  if (pState === 'firstAction' || pState === 'playing') {
    actions.style.display = 'flex';
    dealBtn.style.display = 'none';

    // Double only on first action with 2 cards
    document.getElementById('doubleBtn').style.display = (pIsFirstAction && pHand.length === 2) ? 'inline-flex' : 'none';
    // Split only on first action with pair
    document.getElementById('splitBtn').style.display = (pIsFirstAction && isPair(pHand)) ? 'inline-flex' : 'none';
    // Surrender only on very first action
    document.getElementById('surrenderBtn').style.display = pIsFirstAction ? 'inline-flex' : 'none';
  } else {
    actions.style.display = 'none';
    dealBtn.style.display = 'inline-flex';
  }

  // Stats
  document.getElementById('practiceStats').innerHTML =
    'Correct: <strong>' + pStats.correct + '</strong> | ' +
    'Wrong: <strong>' + pStats.wrong + '</strong> | ' +
    'Streak: <strong>' + pStats.streak + '</strong> | ' +
    'Best: <strong>' + pStats.best + '</strong>';

  // Accuracy breakdown
  const acc = document.getElementById('practiceAccuracy');
  if (acc) {
    const parts = [];
    for (const type of ['hard','soft','pairs']) {
      const [c, w] = pStats.byType[type];
      const total = c + w;
      if (total > 0) {
        const pct = Math.round(c / total * 100);
        parts.push('<span class="acc-chip ' + (pct >= 80 ? 'acc-good' : pct >= 60 ? 'acc-ok' : 'acc-bad') + '">' +
          type.charAt(0).toUpperCase() + type.slice(1) + ': ' + pct + '% (' + total + ')</span>');
      }
    }
    acc.innerHTML = parts.length ? '<span class="acc-label">Accuracy:</span> ' + parts.join(' ') : '';
  }
}

function practiceAction(chosen) {
  if (pState !== 'firstAction' && pState !== 'playing') return;

  const correct = getCorrectAction(pHand, dHand[0].value);
  const isRight = actionMatches(chosen, correct);
  const info = ACTION_INFO[correct];
  const type = handType(pHand);

  // Only track first-action decisions for strategy accuracy
  if (pState === 'firstAction') {
    if (isRight) {
      pStats.correct++;
      pStats.streak++;
      if (pStats.streak > pStats.best) pStats.best = pStats.streak;
      pStats.byType[type][0]++;
    } else {
      pStats.wrong++;
      pStats.streak = 0;
      pStats.byType[type][1]++;
    }
    localStorage.setItem('bj-pstats', JSON.stringify(pStats));
  }

  // Show feedback on first action
  if (pState === 'firstAction') {
    if (isRight) {
      msg('practiceMsg', 'Correct! <strong>' + info.label + '</strong> — ' + info.desc, 'msg-correct');
    } else {
      const ci = ACTION_INFO[chosen] || { label: chosen };
      msg('practiceMsg', 'Wrong! You chose <strong>' + ci.label + '</strong>, correct was <strong>' + info.label + '</strong> — ' + info.desc, 'msg-wrong');
    }
  }

  pIsFirstAction = false;

  // Execute the action
  if (chosen === 'S') {
    pState = 'done';
    dealerPlays(dHand, practiceDeck);
    updatePracticeUI();
    showPracticeResult();
    return;
  }
  if (chosen === 'R') {
    pState = 'done';
    // Reveal dealer but no play-out — player forfeits
    updatePracticeUI();
    appendMsg('practiceMsg', ' <span class="result-tag result-push">Surrendered — half bet returned</span>');
    return;
  }
  if (chosen === 'D') {
    pHand.push(practiceDeck.pop());
    pState = 'done';
    if (handValue(pHand) > 21) {
      updatePracticeUI();
      showPracticeResult();
      return;
    }
    dealerPlays(dHand, practiceDeck);
    updatePracticeUI();
    showPracticeResult();
    return;
  }
  if (chosen === 'P') {
    // Simplified split: just take the first card, add a new one, play as single hand
    pHand = [pHand[0], practiceDeck.pop()];
    pState = 'playing';
    updatePracticeUI();
    return;
  }
  // Hit
  pHand.push(practiceDeck.pop());
  if (handValue(pHand) > 21) {
    pState = 'done';
    updatePracticeUI();
    showPracticeResult();
    return;
  }
  if (handValue(pHand) === 21) {
    // Auto-stand on 21
    pState = 'done';
    dealerPlays(dHand, practiceDeck);
    updatePracticeUI();
    showPracticeResult();
    return;
  }
  // Still playing — player gets to make another decision
  pState = 'playing';
  updatePracticeUI();
}

function dealerPlays(hand, deck) {
  while (handValue(hand) < 17) hand.push(deck.pop());
}

function showPracticeResult() {
  const pv = handValue(pHand);
  const dv = handValue(dHand);
  let tag = '';
  if (pv > 21) tag = '<span class="result-tag result-lose">Bust — Dealer wins</span>';
  else if (dv > 21) tag = '<span class="result-tag result-win">Dealer busts — You win!</span>';
  else if (pv > dv) tag = '<span class="result-tag result-win">You win! (' + pv + ' vs ' + dv + ')</span>';
  else if (pv < dv) tag = '<span class="result-tag result-lose">Dealer wins (' + dv + ' vs ' + pv + ')</span>';
  else tag = '<span class="result-tag result-push">Push (' + pv + ')</span>';
  appendMsg('practiceMsg', ' ' + tag);
}

function resetPracticeStats() {
  pStats = { correct:0, wrong:0, streak:0, best:0, byType:{ hard:[0,0], soft:[0,0], pairs:[0,0] } };
  localStorage.setItem('bj-pstats', JSON.stringify(pStats));
  msg('practiceMsg', 'Stats reset!', '');
  updatePracticeUI();
}

// ══════════════════════════════════════════
//  QUIZ (Step 4)
// ══════════════════════════════════════════
let quiz = { questions:[], current:0, score:0, total:0, answered:false, history:[] };

function startQuiz() {
  const numQ = parseInt(document.getElementById('quizCount')?.value || '10');
  const cat = document.getElementById('quizCategory')?.value || 'all';
  let pool = cat === 'all' ? [...QUIZ_QUESTIONS] : QUIZ_QUESTIONS.filter(q => q.cat === cat);
  pool = pool.sort(() => Math.random() - 0.5);
  quiz.questions = pool.slice(0, Math.min(numQ, pool.length));
  quiz.current = 0;
  quiz.score = 0;
  quiz.total = quiz.questions.length;
  quiz.answered = false;
  quiz.history = [];

  document.getElementById('quizSetup').style.display = 'none';
  document.getElementById('quizArea').style.display = 'block';
  document.getElementById('quizResults').style.display = 'none';
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const q = quiz.questions[quiz.current];
  if (!q) { showQuizResults(); return; }
  quiz.answered = false;

  document.getElementById('quizProgress').textContent = 'Question ' + (quiz.current + 1) + ' of ' + quiz.total;
  document.getElementById('quizScore').textContent = 'Score: ' + quiz.score + '/' + quiz.current;
  document.getElementById('quizQuestion').textContent = q.q;
  document.getElementById('quizHandInfo').textContent = q.hand + ' vs Dealer ' + q.dealer;
  document.getElementById('quizFeedback').innerHTML = '';
  document.getElementById('quizFeedback').className = 'quiz-feedback';
  document.getElementById('quizNextBtn').style.display = 'none';

  // Visual cards
  const display = document.getElementById('quizCardsDisplay');
  if (display && q.playerCards && q.dealerUp) {
    const pCards = q.playerCards.map(v => renderMiniCard(v, v === 'A' || parseInt(v) % 2 === 0 ? 'hearts' : 'spades')).join('');
    const dCard = renderMiniCard(q.dealerUp, 'diamonds');
    display.innerHTML =
      '<div class="quiz-cards-row"><span class="qc-label">You:</span>' + pCards + '</div>' +
      '<div class="quiz-cards-row"><span class="qc-label">Dealer:</span>' + dCard + '<div class="mini-card mini-card-back">?</div></div>';
    display.style.display = 'flex';
  }

  // Answer buttons — show relevant options
  const btns = document.getElementById('quizBtns');
  const options = ['H','S','D','P','Rh'];
  btns.innerHTML = options.map(a => {
    const info = ACTION_INFO[a];
    return '<button class="quiz-opt-btn action-' + a + '" onclick="answerQuiz(\'' + a + '\')">' + info.label + '</button>';
  }).join('');
}

function answerQuiz(chosen) {
  if (quiz.answered) return;
  quiz.answered = true;

  const q = quiz.questions[quiz.current];
  const isCorrect = actionMatches(chosen, q.correct);
  const fb = document.getElementById('quizFeedback');

  if (isCorrect) {
    quiz.score++;
    fb.innerHTML = 'Correct! ' + q.hint;
    fb.className = 'quiz-feedback fb-correct';
  } else {
    fb.innerHTML = 'Wrong — correct: <strong>' + ACTION_INFO[q.correct].label + '</strong>. ' + q.hint;
    fb.className = 'quiz-feedback fb-wrong';
  }
  quiz.history.push({ q, chosen, correct: isCorrect });

  document.querySelectorAll('.quiz-opt-btn').forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });
  document.getElementById('quizNextBtn').style.display = 'inline-flex';
  document.getElementById('quizScore').textContent = 'Score: ' + quiz.score + '/' + (quiz.current + 1);
}

function nextQuizQuestion() {
  quiz.current++;
  quiz.current >= quiz.total ? showQuizResults() : renderQuizQuestion();
}

function showQuizResults() {
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('quizResults').style.display = 'block';

  const pct = Math.round(quiz.score / quiz.total * 100);
  let grade = pct >= 90 ? 'Excellent! You know basic strategy well.' :
              pct >= 70 ? 'Good! A few spots to review.' :
              pct >= 50 ? 'Keep studying — review the charts above.' :
              'Time to study the strategy charts more carefully!';

  document.getElementById('quizResultSummary').innerHTML =
    '<div class="quiz-result-score">' + quiz.score + ' / ' + quiz.total + ' (' + pct + '%)</div>' +
    '<div class="quiz-result-grade">' + grade + '</div>';

  document.getElementById('quizReview').innerHTML = quiz.history.map(h => {
    const cls = h.correct ? 'review-correct' : 'review-wrong';
    const icon = h.correct ? '&#10003;' : '&#10007;';
    return '<div class="review-item ' + cls + '">' +
      '<span class="review-icon">' + icon + '</span>' +
      '<span class="review-q">' + h.q.q + '</span>' +
      '<span class="review-a">' + (ACTION_INFO[h.chosen]?.label || h.chosen) +
      (h.correct ? '' : ' (Correct: ' + ACTION_INFO[h.q.correct]?.label + ')') + '</span></div>';
  }).join('');
}

function restartQuiz() {
  document.getElementById('quizSetup').style.display = 'block';
  document.getElementById('quizArea').style.display = 'none';
  document.getElementById('quizResults').style.display = 'none';
}

// ══════════════════════════════════════════
//  FREE PLAY (Step 5)
// ══════════════════════════════════════════
let playDeck = [];
let fpHand = [], fdHand = [];
let fpState = 'idle';
let fpFirstAction = true;
let fpBank = parseInt(localStorage.getItem('bj-bank') || '1000');
let fpBet = 25;
let fpHistory = JSON.parse(localStorage.getItem('bj-history') || '[]');

function ensurePlayDeck() {
  if (playDeck.length < 20) playDeck = shuffle(createDeck(6));
}

function dealPlayHand() {
  fpBet = parseInt(document.getElementById('playBetInput')?.value || '25');
  if (fpBet > fpBank) {
    msg('playMsg', 'Not enough in your bank! Lower your bet or reset.', 'msg-wrong');
    return;
  }

  ensurePlayDeck();
  fpHand = [playDeck.pop(), playDeck.pop()];
  fdHand = [playDeck.pop(), playDeck.pop()];
  fpState = 'playing';
  fpFirstAction = true;
  msg('playMsg', '', '');

  // Check natural blackjack
  if (handValue(fpHand) === 21) {
    if (handValue(fdHand) === 21) {
      // Push
      fpState = 'done';
      updatePlayUI();
      endPlayHand(0, 'Blackjack push!');
      return;
    }
    fpState = 'done';
    updatePlayUI();
    endPlayHand(Math.floor(fpBet * 1.5), 'Blackjack! Pays 3:2');
    return;
  }
  // Check dealer blackjack
  if (handValue(fdHand) === 21) {
    fpState = 'done';
    updatePlayUI();
    endPlayHand(-fpBet, 'Dealer has Blackjack!');
    return;
  }

  updatePlayUI();
}

function updatePlayUI() {
  const dc = document.getElementById('playDealerCards');
  const pc = document.getElementById('playPlayerCards');
  if (!dc) return;

  const hide = fpState === 'playing';
  dc.innerHTML = renderHand(fdHand, hide ? 1 : -1);
  pc.innerHTML = renderHand(fpHand, -1);

  document.getElementById('playDealerTotal').textContent = hide ? cardNum(fdHand[0].value) : handValue(fdHand);
  document.getElementById('playPlayerTotal').textContent = handValue(fpHand);
  document.getElementById('playBank').textContent = fpBank;
  document.getElementById('playBetDisplay').textContent = document.getElementById('playBetInput')?.value || '25';

  const actions = document.getElementById('playActions');
  const dealBtn = document.getElementById('playDealBtn');

  if (fpState === 'playing') {
    actions.style.display = 'flex';
    dealBtn.style.display = 'none';
    document.getElementById('playDoubleBtn').style.display = (fpFirstAction && fpHand.length === 2 && fpBet <= fpBank) ? 'inline-flex' : 'none';
    document.getElementById('playSplitBtn').style.display = (fpFirstAction && isPair(fpHand)) ? 'inline-flex' : 'none';
    document.getElementById('playSurrenderBtn').style.display = fpFirstAction ? 'inline-flex' : 'none';

    // Show hint
    if (document.getElementById('hintToggle')?.checked) {
      const correct = getCorrectAction(fpHand, fdHand[0].value);
      const info = ACTION_INFO[correct];
      document.getElementById('hintText').innerHTML = 'Basic strategy says: <strong>' + info.label + '</strong> — ' + info.desc;
      document.getElementById('hintBar').style.display = 'flex';
    } else {
      document.getElementById('hintBar').style.display = 'none';
    }
  } else {
    actions.style.display = 'none';
    dealBtn.style.display = 'inline-flex';
    document.getElementById('hintBar').style.display = 'none';
  }
}

function playAction(chosen) {
  if (fpState !== 'playing') return;
  fpFirstAction = false;

  if (chosen === 'S') {
    fpState = 'done';
    dealerPlays(fdHand, playDeck);
    updatePlayUI();
    resolvePlayHand();
    return;
  }
  if (chosen === 'R') {
    fpState = 'done';
    updatePlayUI();
    endPlayHand(-Math.floor(fpBet / 2), 'Surrendered — half bet lost');
    return;
  }
  if (chosen === 'D') {
    fpBet *= 2;
    fpHand.push(playDeck.pop());
    fpState = 'done';
    if (handValue(fpHand) > 21) {
      updatePlayUI();
      endPlayHand(-fpBet, 'Bust! Dealer wins');
      return;
    }
    dealerPlays(fdHand, playDeck);
    updatePlayUI();
    resolvePlayHand();
    return;
  }
  if (chosen === 'P') {
    fpHand = [fpHand[0], playDeck.pop()];
    updatePlayUI();
    return;
  }
  // Hit
  fpHand.push(playDeck.pop());
  if (handValue(fpHand) > 21) {
    fpState = 'done';
    updatePlayUI();
    endPlayHand(-fpBet, 'Bust! Dealer wins');
    return;
  }
  if (handValue(fpHand) === 21) {
    fpState = 'done';
    dealerPlays(fdHand, playDeck);
    updatePlayUI();
    resolvePlayHand();
    return;
  }
  updatePlayUI();
}

function resolvePlayHand() {
  const pv = handValue(fpHand), dv = handValue(fdHand);
  if (dv > 21) endPlayHand(fpBet, 'Dealer busts — You win! (' + pv + ' vs ' + dv + ')');
  else if (pv > dv) endPlayHand(fpBet, 'You win! (' + pv + ' vs ' + dv + ')');
  else if (pv < dv) endPlayHand(-fpBet, 'Dealer wins (' + dv + ' vs ' + pv + ')');
  else endPlayHand(0, 'Push (' + pv + ')');
}

function endPlayHand(delta, text) {
  fpBank += delta;
  localStorage.setItem('bj-bank', fpBank);

  const cls = delta > 0 ? 'result-win' : delta < 0 ? 'result-lose' : 'result-push';
  const prefix = delta > 0 ? '+$' + delta : delta < 0 ? '-$' + Math.abs(delta) : '$0';
  msg('playMsg', '<span class="result-tag ' + cls + '">' + prefix + '</span> ' + text, delta > 0 ? 'msg-correct' : delta < 0 ? 'msg-wrong' : '');

  fpHistory.unshift({ delta, text, time: Date.now() });
  if (fpHistory.length > 20) fpHistory.length = 20;
  localStorage.setItem('bj-history', JSON.stringify(fpHistory));

  updatePlayUI();
  renderPlayHistory();

  // Check bankrupt
  if (fpBank <= 0) {
    fpBank = 1000;
    localStorage.setItem('bj-bank', fpBank);
    appendMsg('playMsg', '<br><em>Bank reset to $1000</em>');
    updatePlayUI();
  }
}

function renderPlayHistory() {
  const el = document.getElementById('historyEntries');
  if (!el) return;
  el.innerHTML = fpHistory.slice(0, 10).map(h => {
    const cls = h.delta > 0 ? 'hist-win' : h.delta < 0 ? 'hist-lose' : 'hist-push';
    const sign = h.delta > 0 ? '+$' + h.delta : h.delta < 0 ? '-$' + Math.abs(h.delta) : 'Push';
    return '<div class="hist-entry ' + cls + '"><span class="hist-delta">' + sign + '</span><span class="hist-text">' + h.text + '</span></div>';
  }).join('');
}

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════
function msg(id, html, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html;
  el.className = 'practice-msg' + (cls ? ' ' + cls : '');
}
function appendMsg(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML += html;
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
  renderAllCharts();
  renderLegend();
  initChartTooltips();
  practiceDeck = shuffle(createDeck(6));
  playDeck = shuffle(createDeck(6));
  updatePracticeUI();
  updatePlayUI();
  renderPlayHistory();

  // Bet input sync
  const betInput = document.getElementById('playBetInput');
  if (betInput) betInput.addEventListener('input', () => {
    document.getElementById('playBetDisplay').textContent = betInput.value;
  });
});
