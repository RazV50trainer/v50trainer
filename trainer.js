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
    hint: "ступеньки по тренду, по ним входи в сторону движения"
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
  }
};

// Набор паттернов (9 типов, вверх/вниз)
const patterns = [
  // 1) Импульс
  { type: "impulse",  p: "↑↑↑" },
  { type: "impulse",  p: "↓↓↓" },

  // 2) Импульс + микро-откат
  { type: "imp_pull", p: "↑↑↑↓↑↑" },
  { type: "imp_pull", p: "↓↓↓↑↓↓" },

  // 3) Двойной укус
  { type: "double",   p: "↑↓↑" },
  { type: "double",   p: "↓↑↓" },

  // 4) Breakout (пробой флэта)
  { type: "break",    p: "→→→↑↑↑" },
  { type: "break",    p: "→→→↓↓↓" },

  // 5) Лестница по тренду
  { type: "stairs",   p: "↑→↑→↑" },
  { type: "stairs",   p: "↓→↓→↓" },

  // 6) Укус + импульс
  { type: "bite",     p: "↑↓↑↑↑" },
  { type: "bite",     p: "↓↑↓↓↓" },

  // 7) Пила / шум (ПРОПУСК)
  { type: "noise",    p: "↑↓↑↓↑" },
  { type: "noise",    p: "↓↑↓↑↓" },

  // 8) Поздний вход (перегретый импульс) (ПРОПУСК)
  { type: "late",     p: "↑↑↑↑↑" },
  { type: "late",     p: "↓↓↓↓↓" },

  // 9) Флет с ложным выбросом (ПРОПУСК)
  { type: "fake",     p: "→→→↑→→" },
  { type: "fake",     p: "→→→↓→→" }
];

// Отрисовка стрелок с цветом (как тики)
function renderPattern(str) {
  const container = document.getElementById("pattern");
  container.innerHTML = "";

  for (const ch of str) {
    const span = document.createElement("span");
    span.textContent = ch;

    if (ch === "↑") {
      span.style.color = "#3ddc84";    // вверх — зелёный
    } else if (ch === "↓") {
      span.style.color = "#ff4d4f";    // вниз — красный
    } else if (ch === "→") {
      span.style.color = "#999999";    // флэт — серый
    } else {
      span.style.color = "#e5e5e5";
    }

    span.style.marginRight = "3px";
    container.appendChild(span);
  }
}

// Генерация нового паттерна и ПОШАГОВАЯ отрисовка
function generate() {
  // Остановить прошлую анимацию
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

  // Появление стрелок по одной каждые 1.5 секунды
  revealTimer = setInterval(() => {
    if (currentIndex < currentPattern.length) {
      currentIndex++;
      const part = currentPattern.slice(0, currentIndex);
      renderPattern(part);
    } else {
      clearInterval(revealTimer);
      revealTimer = null;
    }
  }, 1500); // 1.5 секунды между стрелками
}

// Проверка ответа
function check(answer) {
  if (!currentType) return;
  if (answered) return; // не считаем повторные клики по одному паттерну
  answered = true;

  const res = document.getElementById("result");
  const meta = patternMeta[currentType] || {
    label: "неизвестный паттерн",
    action: "Пропуск",
    hint: "пропускай"
  };

  if (answer === currentType) {
    // Верно
    correctCount++;
    if (meta.action === "Вход") {
      res.innerHTML = `<span style="color:#3ddc84">Верно. Вход.</span>`;
    } else {
      res.innerHTML = `<span style="color:#3ddc84">Верно. Пропуск.</span>`;
    }
  } else {
    // Неверно
    wrongCount++;
    // Пример: "Неверно. Это пила, при ней пропускай."
    res.innerHTML =
      `<span style="color:#ff4d4f">Неверно.</span> Это ${meta.label}, ${meta.hint}.`;
  }

  // Счётчик
  res.innerHTML += `<br>Счёт: верно ${correctCount}, неверно ${wrongCount}.`;
}