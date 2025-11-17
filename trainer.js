let currentType = "";
let currentPattern = "";
let revealTimer = null;
let currentIndex = 0;

// Справочник паттернов: тип → надпись и режим (вход/пропуск)
const patternMeta = {
  impulse:   { name: "Импульс",           action: "ВХОД" },
  imp_pull:  { name: "Импульс + откат",   action: "ВХОД" },
  double:    { name: "Двойной укус",      action: "ВХОД" },
  break:     { name: "Breakout",          action: "ВХОД" },
  stairs:    { name: "Лестница",          action: "ВХОД" },
  noise:     { name: "Пила (шум)",        action: "ПРОПУСК" },
  late:      { name: "Поздний вход",      action: "ПРОПУСК" }
};

// Набор паттернов (как раньше, только через общий массив)
const patterns = [
  // Импульс
  { type: "impulse",  p: "↑↑↑" },
  { type: "impulse",  p: "↓↓↓" },

  // Импульс + микро-откат
  { type: "imp_pull", p: "↑↑↑↓↑↑" },
  { type: "imp_pull", p: "↓↓↓↑↓↓" },

  // Двойной укус
  { type: "double",   p: "↑↓↑" },
  { type: "double",   p: "↓↑↓" },

  // Breakout
  { type: "break",    p: "→→→↑↑↑" },
  { type: "break",    p: "→→→↓↓↓" },

  // Лестница
  { type: "stairs",   p: "↑→↑→↑" },
  { type: "stairs",   p: "↓→↓→↓" },

  // Пила / шум
  { type: "noise",    p: "↑↓↑↓↑" },
  { type: "noise",    p: "↓↑↓↑↓" },

  // Поздний вход (перегретый импульс)
  { type: "late",     p: "↑↑↑↑↑" },
  { type: "late",     p: "↓↓↓↓↓" }
];

// Отрисовка строки стрелок с цветами (как на тиках)
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
  // Останавливаем предыдущую анимацию, если была
  if (revealTimer) {
    clearInterval(revealTimer);
    revealTimer = null;
  }

  const pick = patterns[Math.floor(Math.random() * patterns.length)];
  currentType = pick.type;
  currentPattern = pick.p;
  currentIndex = 0;

  // Сброс отображения
  const res = document.getElementById("result");
  res.innerHTML = "";
  renderPattern(""); // очищаем поле

  // Каждую секунду добавляем по одной стрелке
  revealTimer = setInterval(() => {
    if (currentIndex < currentPattern.length) {
      currentIndex++;
      const part = currentPattern.slice(0, currentIndex);
      renderPattern(part);
    } else {
      clearInterval(revealTimer);
      revealTimer = null;
    }
  }, 1000); // 1000 мс = 1 секунда
}

// Проверка ответа
function check(answer) {
  if (!currentType) return;

  const res = document.getElementById("result");
  const meta = patternMeta[currentType] || { name: "Неизвестно", action: "" };

  if (answer === currentType) {
    // Верный ответ: показать режим (вход/пропуск) и название
    res.innerHTML =
      "<span style='color:#3ddc84'>Верно</span>" +
      ` — ${meta.name} (${meta.action})`;
  } else {
    // Неверный: показать, что это был за паттерн
    res.innerHTML =
      "<span style='color:#ff4d4f'>Неверно</span>" +
      `. Это: ${meta.name} (${meta.action}).`;
  }
}