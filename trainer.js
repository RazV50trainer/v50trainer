let currentType = "";

const patterns = [
  // Импульс
  { type: "impulse", p: "↑↑↑" },
  { type: "impulse", p: "↓↓↓" },

  // Импульс + микро-откат
  { type: "imp_pull", p: "↑↑↑↓↑↑" },
  { type: "imp_pull", p: "↓↓↓↑↓↓" },

  // Двойной укус
  { type: "double", p: "↑↓↑" },
  { type: "double", p: "↓↑↓" },

  // Breakout
  { type: "break", p: "→→→↑↑↑" },
  { type: "break", p: "→→→↓↓↓" },

  // Лестница
  { type: "stairs", p: "↑→↑→↑" },
  { type: "stairs", p: "↓→↓→↓" },

  // Пила / шум
  { type: "noise", p: "↑↓↑↓↑" },
  { type: "noise", p: "↓↑↓↑↓" },

  // Поздний вход (перегретый импульс)
  { type: "late", p: "↑↑↑↑↑" },
  { type: "late", p: "↓↓↓↓↓" }
];

function renderPattern(str) {
  const container = document.getElementById("pattern");
  container.innerHTML = "";

  for (const ch of str) {
    const span = document.createElement("span");
    span.textContent = ch;

    if (ch === "↑") {
      span.style.color = "#3ddc84";      // зелёный, как рост
    } else if (ch === "↓") {
      span.style.color = "#ff4d4f";      // красный, как падение
    } else if (ch === "→") {
      span.style.color = "#999999";      // серый, флэт
    } else {
      span.style.color = "#e5e5e5";
    }

    container.appendChild(span);
  }
}

function generate() {
  const pick = patterns[Math.floor(Math.random() * patterns.length)];
  currentType = pick.type;
  renderPattern(pick.p);
  document.getElementById("result").innerHTML = "";
}

function check(answer) {
  if (!currentType) return;
  const res = document.getElementById("result");
  if (answer === currentType) {
    res.innerHTML = "<span style='color:#3ddc84'>Верно</span>";
  } else {
    res.innerHTML = "<span style='color:#ff4d4f'>Неверно</span>";
  }
}