// public/scripts/state.js
export const STORAGE_KEY = "entries_v1";
export const SETTINGS_KEY = "settings_v1";

export let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
export function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function loadSettings() {
  const def = {
    sources: ["Khách vãng lai", "Khách quen", "Online"],
    storages: [
      { name: "Tiền mặt", kind: "cash" },
      { name: "Chuyển khoản", kind: "transfer" },
    ],
    banks: [],
    defaultSource: "Khách vãng lai",
    defaultStorage: "Tiền mặt",
    defaultBank: "",
  };
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (!s) return def;
    if (!Array.isArray(s.sources)) s.sources = def.sources;
    if (!Array.isArray(s.storages)) s.storages = def.storages;
    if (!Array.isArray(s.banks)) s.banks = def.banks;
    if (!s.defaultSource) s.defaultSource = s.sources[0] || def.defaultSource;
    if (!s.defaultStorage)
      s.defaultStorage = s.storages[0]?.name || def.defaultStorage;
    if (typeof s.defaultBank !== "string") s.defaultBank = "";
    return s;
  } catch {
    return def;
  }
}
export let settings = loadSettings();
export function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export const selectedIds = new Set();
