/* ========================================================
   PUZZLE GAME — index.js
   ======================================================== */

/* ---------- PUZZLE DATA ---------- */
const PUZZLES = [
  {
    img: 'css/images/1.jpg',
    cols: 2, rows: 2,          /* 4 tiles */
    label: 'Puzzle One',
    hint: 'Slide the tiles to reveal the picture ✨',
    card: {
      emoji: '🌸',
      num: '1 of 7',
      title: 'One step closer…',
      msg: 'You did it! Every piece you place is like a memory being put back together. Keep going, there\'s more waiting for you.',
    }
  },
  {
    img: 'css/images/2.jpg',
    cols: 2, rows: 2,
    label: 'Puzzle Two',
    hint: 'Arrange the pieces just right 🌷',
    card: {
      emoji: '💕',
      num: '2 of 7',
      title: 'Two hearts, one picture',
      msg: 'Look at you go! Two down and still smiling. You make everything look easy.',
    }
  },
  {
    img: 'css/images/3.jpg',
    cols: 2, rows: 2,
    label: 'Puzzle Three',
    hint: 'You\'re getting the hang of it! 🌼',
    card: {
      emoji: '🌻',
      num: '3 of 7',
      title: 'Three is a charm ✨',
      msg: 'Halfway through the easy ones! The way you figure things out reminds me of why I admire you so much.',
    }
  },
  {
    img: 'css/images/4.jpg',
    cols: 3, rows: 2,          /* 6 tiles */
    label: 'Puzzle Four',
    hint: 'A little bigger now… you\'ve got this! 🦋',
    card: {
      emoji: '🦋',
      num: '4 of 7',
      title: 'Things are getting real',
      msg: 'Six pieces and you handled it like a pro. I knew you could. I\'m proud of you.',
    }
  },
  {
    img: 'css/images/5.jpg',
    cols: 3, rows: 2,
    label: 'Puzzle Five',
    hint: 'Focus… you\'re almost at the big ones 🌙',
    card: {
      emoji: '🌙',
      num: '5 of 7',
      title: 'Five ⭐ performance!',
      msg: 'Five puzzles solved! Your patience and care show in everything you do. Almost there, love.',
    }
  },
  {
    img: 'css/images/6.jpg',
    cols: 3, rows: 3,          /* 9 tiles */
    label: 'Puzzle Six',
    hint: 'Nine pieces… breathe, take your time 🌹',
    card: {
      emoji: '🌹',
      num: '6 of 7',
      title: 'One more to go…',
      msg: 'Nine tiles! You are incredible. One final puzzle remains — and it\'s the most special one. Ready?',
    }
  },
  {
    img: 'css/images/7.jpg',
    cols: 4, rows: 3,          /* 12 tiles */
    label: 'Puzzle Seven ✨',
    hint: 'The last one — pour your heart into it 💖',
    final: true,
    card: {
      title: 'You\'ve unlocked my heart 💖',
      msg: 'Every piece of this puzzle is a piece of how I feel about you. Thank you for playing, for smiling, and for being you. This was made with love — just for you. 🌸',
    }
  },
];

/* ---------- STATE ---------- */
let currentPuzzle = 0;
let tiles = [];
let emptyIndex = 0;
let moves = 0;
let tileSize = 0;
let cols = 0;
let rows = 0;
let solved = false;

/* ---------- ELEMENTS ---------- */
const startScreen   = document.getElementById('startScreen');
const puzzleScreen  = document.getElementById('puzzleScreen');
const cardScreen    = document.getElementById('cardScreen');
const finalScreen   = document.getElementById('finalScreen');
const startBtn      = document.getElementById('startBtn');
const bgMusic       = document.getElementById('bgMusic');
const puzzleBoard   = document.getElementById('puzzleBoard');
const puzzleLabel   = document.getElementById('puzzleLabel');
const moveCount     = document.getElementById('moveCount');
const hintText      = document.getElementById('hintText');
const completionCard= document.getElementById('completionCard');
const finalCard     = document.getElementById('finalCard');
const confettiArea  = document.getElementById('confettiArea');

/* ---------- PETAL RAIN ---------- */
function makePetals(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const symbols = ['🌸', '🌷', '🌺', '✿', '❀', '💮', '🌼'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.fontSize = (14 + Math.random() * 14) + 'px';
    p.style.animationDuration = (5 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    container.appendChild(p);
  }
}
['petals','petals2','petals3','petals4'].forEach(makePetals);

/* ---------- SCREEN SWITCHING ---------- */
function showScreen(el) {
  [startScreen, puzzleScreen, cardScreen, finalScreen].forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

/* ---------- SHUFFLE (solvable) ---------- */
function isSolvable(arr, cols) {
  let inv = 0;
  const flat = arr.filter(v => v !== null);
  for (let i = 0; i < flat.length - 1; i++)
    for (let j = i + 1; j < flat.length; j++)
      if (flat[i] > flat[j]) inv++;
  if (cols % 2 !== 0) return inv % 2 === 0;
  const emptyRow = Math.floor(arr.indexOf(null) / cols);
  const rowFromBottom = rows - emptyRow;
  return (inv + rowFromBottom) % 2 !== 0;
}

function shuffle(arr, c) {
  let a = [...arr];
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (!isSolvable(a, c) || isAlreadySolved(a));
  return a;
}

function isAlreadySolved(arr) {
  for (let i = 0; i < arr.length - 1; i++) if (arr[i] !== i) return false;
  return arr[arr.length - 1] === null;
}

/* ---------- BOARD SIZING ---------- */
function getBoardSize(c, r) {
  const maxW = Math.min(window.innerWidth  * 0.92, 520);
  const maxH = Math.min(window.innerHeight * 0.68, 520);
  const ts = Math.floor(Math.min(maxW / c, maxH / r));
  return Math.min(ts, 150);
}

/* ---------- BUILD PUZZLE ---------- */
function buildPuzzle(idx) {
  const pz = PUZZLES[idx];
  cols = pz.cols;
  rows = pz.rows;
  solved = false;
  moves = 0;

  puzzleLabel.textContent = pz.label;
  hintText.textContent    = pz.hint;
  moveCount.textContent   = 'Moves: 0';

  tileSize = getBoardSize(cols, rows);
  const total = cols * rows;

  /* Build initial ordered array, last = empty */
  let arr = Array.from({ length: total - 1 }, (_, i) => i).concat(null);
  tiles = shuffle(arr, cols);
  emptyIndex = tiles.indexOf(null);

  /* Grid layout */
  puzzleBoard.style.gridTemplateColumns = `repeat(${cols}, ${tileSize}px)`;
  puzzleBoard.style.gridTemplateRows    = `repeat(${rows}, ${tileSize}px)`;
  puzzleBoard.style.width  = (tileSize * cols + 4 * (cols - 1) + 20) + 'px';
  puzzleBoard.style.height = (tileSize * rows + 4 * (rows - 1) + 20) + 'px';

  renderBoard(pz.img, total);
}

/* ---------- RENDER BOARD ---------- */
function renderBoard(imgSrc, total) {
  puzzleBoard.innerHTML = '';
  const boardW = tileSize * cols;
  const boardH = tileSize * rows;

  tiles.forEach((val, pos) => {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile' + (val === null ? ' empty' : '');
    tile.dataset.pos = pos;

    if (val !== null) {
      const srcX = (val % cols) * tileSize;
      const srcY = Math.floor(val / cols) * tileSize;
      tile.style.backgroundImage    = `url('${imgSrc}')`;
      tile.style.backgroundSize     = `${boardW}px ${boardH}px`;
      tile.style.backgroundPosition = `-${srcX}px -${srcY}px`;
    }

    tile.style.width  = tileSize + 'px';
    tile.style.height = tileSize + 'px';

    tile.addEventListener('click', () => onTileClick(pos));
    puzzleBoard.appendChild(tile);
  });
}

/* ---------- CLICK HANDLER ---------- */
function onTileClick(pos) {
  if (solved) return;
  if (!canMove(pos)) return;

  /* Swap tile with empty */
  [tiles[pos], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[pos]];
  emptyIndex = pos;
  moves++;
  moveCount.textContent = `Moves: ${moves}`;

  /* Re-render (cheap for small grids) */
  const pz = PUZZLES[currentPuzzle];
  renderBoard(pz.img, cols * rows);

  /* Check if the moved tile is now in correct spot for pop anim */
  if (tiles[pos] === null) {
    /* the moved tile landed at pos — pos was old emptyIndex */
    const justMoved = puzzleBoard.children[emptyIndex]; /* old empty, now a tile */
    if (justMoved) {
      justMoved.classList.add('correct');
      setTimeout(() => justMoved.classList.remove('correct'), 350);
    }
  }

  if (checkSolved()) onSolved();
}

function canMove(pos) {
  const r1 = Math.floor(pos / cols), c1 = pos % cols;
  const r2 = Math.floor(emptyIndex / cols), c2 = emptyIndex % cols;
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

/* ---------- SOLVED CHECK ---------- */
function checkSolved() {
  for (let i = 0; i < tiles.length - 1; i++) if (tiles[i] !== i) return false;
  return tiles[tiles.length - 1] === null;
}

/* ---------- ON SOLVED ---------- */
function onSolved() {
  solved = true;

  /* Show full image briefly */
  const overlay = document.createElement('div');
  overlay.className = 'solved-overlay';
  overlay.innerHTML = '<span>✨ Solved! ✨</span><span style="font-size:1rem;font-family:Quicksand">Preparing your surprise…</span>';
  puzzleBoard.style.position = 'relative';
  puzzleBoard.appendChild(overlay);

  setTimeout(() => {
    const pz = PUZZLES[currentPuzzle];
    if (pz.final) {
      showFinalCard(pz.card);
    } else {
      showCard(pz.card, currentPuzzle + 1);
    }
  }, 1400);
}

/* ---------- CARD (puzzles 1-6) ---------- */
function showCard(cardData, nextIdx) {
  showScreen(cardScreen);

  completionCard.innerHTML = `
    <span class="card-emoji">${cardData.emoji}</span>
    <div class="card-num">${cardData.num}</div>
    <div class="card-divider"></div>
    <h2 class="card-title">${cardData.title}</h2>
    <p class="card-msg">${cardData.msg}</p>
    <button class="btn-proceed" id="proceedBtn">Continue ♡</button>
  `;

  document.getElementById('proceedBtn').addEventListener('click', () => {
    currentPuzzle = nextIdx;
    showScreen(puzzleScreen);
    buildPuzzle(currentPuzzle);
  });
}

/* ---------- FINAL CARD (7th) ---------- */
function showFinalCard(cardData) {
  showScreen(finalScreen);

  const titleEl = finalCard.querySelector('.final-title');
  const msgEl   = finalCard.querySelector('.final-msg');
  titleEl.textContent = cardData.title;
  msgEl.textContent   = cardData.msg;

  /* Add restart button */
  let btn = finalCard.querySelector('.btn-final');
  if (!btn) {
    btn = document.createElement('button');
    btn.className = 'btn-final';
    btn.textContent = 'Play Again ♡';
    btn.addEventListener('click', () => {
      currentPuzzle = 0;
      showScreen(puzzleScreen);
      buildPuzzle(0);
    });
    finalCard.querySelector('.final-inner').appendChild(btn);
  }

  /* Confetti */
  launchConfetti();
}

/* ---------- CONFETTI ---------- */
function launchConfetti() {
  confettiArea.innerHTML = '';
  const colors = ['#f9a8d4','#c4b5fd','#fda4af','#fbbf24','#86efac','#7dd3fc'];
  for (let i = 0; i < 55; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width  = (6 + Math.random() * 8) + 'px';
    c.style.height = (6 + Math.random() * 8) + 'px';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration  = (2.5 + Math.random() * 3) + 's';
    c.style.animationDelay     = (Math.random() * 1.5) + 's';
    confettiArea.appendChild(c);
  }
}

/* ---------- START BUTTON ---------- */
startBtn.addEventListener('click', () => {
  bgMusic.volume = 0.45;
  bgMusic.play().catch(() => {});   /* handle autoplay block gracefully */
  showScreen(puzzleScreen);
  buildPuzzle(0);
});

/* ---------- RESIZE ---------- */
window.addEventListener('resize', () => {
  if (!puzzleScreen.classList.contains('active')) return;
  buildPuzzle(currentPuzzle);
});