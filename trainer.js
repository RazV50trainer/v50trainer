let currentType = "";
let currentPattern = "";
let revealTimer = null;
let currentIndex = 0;
let answered = false;

let correctCount = 0;
let wrongCount = 0;
let bestStreak = 0;
let currentStreak = 0;
let totalPatterns = 0;

let sumReactionMs = 0;
let reactionSamples = 0;
let firstTickTime = null;

let revealIntervalMs = 1500; // базовая сложность (легкий)
let audioCtx = null;

// Метаданные по паттернам: название и что делать
const patternMeta = {
  impulse: {
    label: "импульс",
    action: "Вход",
    hint: "по нему входи по направлению движения"
  },
  imp_pull: {
    label: "импульс с откатом",
    action: "Вход",
    hint: "это сильный импульс с микрокоррекцией, по нему входи"
  },
  double: {
    label: "двойной укус",
    action: "Вход",
    hint: "после второго укуса можно входить по направлению"
  },
  break: {
    label: "breakout",
    action: "Вход",
    hint: "это пробой, по нему входи в сторону выхода"
  },
  stairs: {
    label: "лестница",
    action: "Вход",
    hint: "ступеньки по тренду, по ним входи"
  },
  bite: {
    label: "укус + импульс",
    action: "Вход",
    hint: "после укуса и входа импульса можно заходить"
  },
  noise: {
    label: "пила",
    action: "Пропуск",
    hint: "при ней пропускай"
  },
  late: {
    label: "поздний вход",
    action: "Пропуск",
    hint: "импульс перегрет, такие нужно пропускать"
  },
  fake: {
    label: "ложный выброс из флэта",
    action: "Пропуск",
    hint: "это ложный выброс из боковика, его нужно пропускать"
  },
  flat: {
    label: "флэт",
    action: "Пропуск",
    hint: "при флэте всегда пропускай"
  }
};

// Набор паттернов (10 типов)
const patterns = [
  // 1) Импульс (ВХОД)
  { type: "impulse",  p: "↑↑↑" },
  { type: "impulse",  p: "↓↓↓" },

  // 2) Импульс + микро-откат (ВХОД)
  { type: "imp_pull", p: "↑↑↑↓↑↑" },
  { type: "imp_pull", p: "↓↓↓↑↓↓" },

  // 3) Двойной укус (ВХОД)
  { type: "double",   p: "↑↓↑" },
  { type: "double",   p: "↓↑↓" },

  // 4) Breakout (ВХОД)
  { type: "break",    p: "→→→↑↑↑" },
  { type: "break",    p: "→→→↓↓↓" },

  // 5) Лестница (ВХОД)
  { type: "stairs",   p: "↑→↑→↑" },
  { type: "stairs",   p: "↓→↓→↓" },

  // 6) Укус + импульс (ВХОД)
  { type: "bite",     p: "↑↓↑↑↑" },
  { type: "bite",     p: "↓↑↓↓↓" },

  // 7) Пила (ПРОПУСК)
  { type: "noise",    p: "↑↓↑↓↑" },
  { type: "noise",    p: "↓↑↓↑↓" },

  // 8) Поздний вход (ПРОПУСК)
  { type: "late",     p: "↑↑↑↑↑" },
  { type: "late",     p: "↓↓↓↓↓" },

  // 9) Ложный выброс (ПРОПУСК)
  { type: "fake",     p: "→→→↑→→" },
  { type: "fake",     p: "→→→↓→→" },

  // 10) Флэт (ПРОПУСК)
  { type: "flat",     p: "→→→→→" },   // чистый
  { type: "flat",     p: "→→→→" },    // короткий
  { type: "flat",     p: "→↑→↓→" }    // «дышащий»
];

// Цвет стрелок + "слепой" режим
function renderPattern(str) {
  const container = document.getElementById("pattern");
  container.innerHTML = "";

  const blindToggle = document.getElementById("blindToggle");
  const blind = blindToggle && blindToggle.checked;

  for (const ch of str) {
    const span = document.createElement("span");
    span.textContent = ch;

    if (blind) {
      span.style.color = "#e5e5e5";
    } else {
      if (ch === "↑") span.style.color = "#3ddc84";
      else if (ch === "↓") span.style.color = "#ff4d4f";
      else span.style.color = "#999999";
    }

    span.style.marginRight = "3px";
    container.appendChild(span);
  }
}

// Звук тика
function playTick() {
  const soundToggle = document.getElementById("soundToggle");
  if (soundToggle && !soundToggle.checked) return;

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = 900;
  gain.gain.value = 0.03;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

// Генерация паттерна и пошаговая отрисовка
function generate() {
  if (revealTimer) {
    clearInterval(revealTimer);
    revealTimer = null;
  }

  const pick = patterns[Math.floor(Math.random() * patterns.length)];
  currentType = pick.type;
  currentPattern = pick.p;

  currentIndex = 0;
  answered = false;
  firstTickTime = null;

  const res = document.getElementById("result");
  if (res) res.innerHTML = "";

  renderPattern("");

  revealTimer = setInterval(() => {
    if (currentIndex < currentPattern.length) {
      currentIndex++;
      const slice = currentPattern.slice(0, currentIndex);
      renderPattern(slice);

      if (currentIndex === 1) {
        firstTickTime = performance.now();
      }

      playTick();
    } else {
      clearInterval(revealTimer);
      revealTimer = null;
    }
  }, revealIntervalMs);
}

// Обновление блока статистики
function updateStatsView() {
  const stats = document.getElementById("stats");
  if (!stats) return;

  const totalAnswers = correctCount + wrongCount;
  let accuracy = 0;
  if (totalAnswers > 0) {
    accuracy = (correctCount / totalAnswers) * 100;
  }

  let avgReaction = 0;
  if (reactionSamples > 0) {
    avgReaction = (sumReactionMs / reactionSamples) / 1000; // в секундах
  }

  stats.innerHTML =
    `Всего паттернов: ${totalPatterns}<br>` +
    `Точность: ${accuracy.toFixed(1)}%<br>` +
    `Лучшая серия: ${bestStreak}<br>` +
    `Среднее время реакции: ${avgReaction.toFixed(2)} с`;
}

// Проверка ответа
function check(answer) {
  if (!currentType || answered) return;
  answered = true;

  const now = performance.now();
  if (firstTickTime) {
    const rt = now - firstTickTime;
    sumReactionMs += rt;
    reactionSamples++;
  }

  totalPatterns++;

  const res = document.getElementById("result");
  const meta = patternMeta[currentType];

  if (!meta) return;

  if (answer === currentType) {
    correctCount++;
    currentStreak++;
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    res.innerHTML =
      `<span style="color:#3ddc84">Верно. ${meta.action}.</span>`;
  } else {
    wrongCount++;
    currentStreak = 0;

    res.innerHTML =
      `<span style="color:#ff4d4f">Неверно.</span> Это ${meta.label}, ${meta.hint}.`;
  }

  res.innerHTML += `<br>Счёт: верно ${correctCount}, неверно ${wrongCount}.`;

  updateStatsView();
}

// Сброс статистики
function resetStats() {
  correctCount = 0;
  wrongCount = 0;
  bestStreak = 0;
  currentStreak = 0;
  totalPatterns = 0;
  sumReactionMs = 0;
  reactionSamples = 0;

  const res = document.getElementById("result");
  if (res) res.innerHTML = "Статистика сброшена.";

  updateStatsView();
}

// Настройка сложности по select
function applyDifficulty() {
  const sel = document.getElementById("difficulty");
  if (!sel) return;
  const v = sel.value;
  if (v === "easy") revealIntervalMs = 1500;
  else if (v === "medium") revealIntervalMs = 1000;
  else if (v === "hard") revealIntervalMs = 700;
}

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("difficulty");
  if (sel) {
    sel.addEventListener("change", applyDifficulty);
    applyDifficulty();
  }
  updateStatsView();
});