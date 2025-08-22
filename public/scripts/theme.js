// public/scripts/theme.js
const THEME_KEY = "app.theme"; // 'dark' | 'light' | 'system' (tùy bạn)

function applyTheme(theme) {
  // Sử dụng class 'light-theme' để override biến màu (đã khai báo trong CSS)
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);

  // Cập nhật nút toggle nếu có
  const btn = document.getElementById("btnToggleTheme");
  if (btn) btn.textContent = isLight ? "🌙" : "☀️";
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

export function initThemeOnLoad() {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = saved || getSystemTheme();
  applyTheme(theme);

  // Nếu muốn theo dõi system theme khi user chưa chọn thủ công:
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    mq.addEventListener?.("change", () => applyTheme(getSystemTheme()));
  }
}

export function initThemeToggle() {
  const btn = document.getElementById("btnToggleTheme");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isLightNow = document.body.classList.toggle("light-theme");
    const nextTheme = isLightNow ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme); // 🔒 LƯU LẠI
    btn.textContent = isLightNow ? "🌙" : "☀️";
  });
}

export function initTheme() {
  initThemeOnLoad();
  initThemeToggle();
}