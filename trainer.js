let currentType = "";
let currentPattern = "";
let revealTimer = null;
let currentIndex = 0;
let answered = false;

let correctCount = 0;
let wrongCount = 0;

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

// Цвет стрелок
function renderPattern(str) {
  const container = document.getElementById("pattern");
  container.innerHTML = "";

  for (const ch of str) {
    const span = document.createElement("span");
    span.textContent = ch;

    if (ch === "↑") span.style.color = "#3ddc84";
    else if (ch === "↓") span.style.color = "#ff4d4f";
    else span.style.color = "#999999";

    span.style.marginRight = "3px";
    container.appendChild(span);
  }
}

// Появление стрелок по одной (1.5 секунды)
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

  const res = document.getElementById("result");
  res.innerHTML = "";
  renderPattern("");

  revealTimer = setInterval(() => {
    if (currentIndex < currentPattern.length) {
      currentIndex++;
      renderPattern(currentPattern.slice(0, currentIndex));
    } else {
      clearInterval(revealTimer);
      revealTimer = null;
    }
  }, 1500);
}

function check(answer) {
  if (!currentType || answered) return;
  answered = true;

  const res = document.getElementById("result");
  const meta = patternMeta[currentType];

  if (answer === currentType) {
    correctCount++;
    res.innerHTML =
      `<span style="color:#3ddc84">Верно. ${meta.action}.</span>`;
  } else {
    wrongCount++;
    res.innerHTML =
      `<span style="color:#ff4d4f">Неверно.</span> Это ${meta.label}, ${meta.hint}.`;
  }

  res.innerHTML += `<br>Счёт: верно ${correctCount}, неверно ${wrongCount}.`;
}