// public/scripts/utils.js
export const pad2 = (n) => String(n).padStart(2, "0");
export const toISO = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const todayISO = () => toISO(new Date());
export const addDaysISO = (iso, days) => {
  const d = iso ? parseISO(iso) : new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
};
export const startOfWeekISO = (iso) => {
  const d = parseISO(iso);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return toISO(d);
};
export const endOfWeekISO = (iso) => addDaysISO(startOfWeekISO(iso), 6);
export const startOfMonthISO = (iso) => {
  const d = parseISO(iso);
  d.setDate(1);
  return toISO(d);
};
export const endOfMonthISO = (iso) => {
  const d = parseISO(iso);
  d.setMonth(d.getMonth() + 1, 0);
  return toISO(d);
};

export const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));
export const weekdayVN = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
export const fmtDateVN = (iso) =>
  iso ? iso.split("-").reverse().join("/") : "";
export const fmtDayVN = (iso) => {
  if (!iso) return "";
  const d = parseISO(iso);
  return `${weekdayVN[d.getDay()]} (${fmtDateVN(iso)})`;
};
export const escapeHTML = (s) =>
  s
    ? s.replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c])
      )
    : "";
export const normalize = (s) => (s || "").toString().toLowerCase();
