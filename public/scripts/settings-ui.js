// public/scripts/settings-ui.js
import { settings, saveSettings } from "./state.js";
import { escapeHTML } from "./utils.js";

export function getStorageKindByName(name) {
  const s = settings.storages.find((x) => x.name === name);
  return s?.kind || "cash";
}

export function refreshSourceOptions(els, selected) {
  els.sourceSelect.innerHTML = "";
  settings.sources.forEach((src) => {
    const opt = document.createElement("option");
    opt.value = src;
    opt.textContent = src;
    if (src === selected) opt.selected = true;
    els.sourceSelect.appendChild(opt);
  });
  if (selected && !settings.sources.includes(selected)) {
    const opt = document.createElement("option");
    opt.value = selected;
    opt.textContent = selected + " (đã xoá khỏi danh mục)";
    opt.selected = true;
    els.sourceSelect.appendChild(opt);
  }
}

export function refreshStorageOptions(els, selected) {
  els.storageSelect.innerHTML = "";
  settings.storages.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    if (s.name === selected) opt.selected = true;
    els.storageSelect.appendChild(opt);
  });
  if (selected && !settings.storages.some((x) => x.name === selected)) {
    const opt = document.createElement("option");
    opt.value = selected;
    opt.textContent = selected + " (đã xoá khỏi danh mục)";
    opt.selected = true;
    els.storageSelect.appendChild(opt);
  }
  toggleBankVisibility(els);
}

export function refreshBankOptions(els, selected) {
  els.bankSelect.innerHTML = "";
  settings.banks.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    if (b === selected) opt.selected = true;
    els.bankSelect.appendChild(opt);
  });
  if (selected && !settings.banks.includes(selected)) {
    const opt = document.createElement("option");
    opt.value = selected;
    opt.textContent = selected + " (đã xoá khỏi danh mục)";
    opt.selected = true;
    els.bankSelect.appendChild(opt);
  }
}

export function toggleBankVisibility(els) {
  const kind = getStorageKindByName(els.storageSelect.value);
  els.bankWrap.style.display = kind === "transfer" ? "block" : "none";
}

export function renderSettingsUI(els) {
  // sources
  els.sourcesList.innerHTML = "";
  settings.sources.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `
  <span class="chip">${escapeHTML(s)}</span>
  <button type="button" class="category-delete-button focus-ring fade" data-del-source="${idx}" aria-label="Xóa">
    <img src="public/icons/trash.svg" alt="" style="width:16px;height:16px;">
  </button>
`;
    els.sourcesList.appendChild(row);
  });
  // storages
  els.storagesList.innerHTML = "";
  settings.storages.forEach((s, idx) => {
    const row = document.createElement("div");
    row.className = "list-row";
    const kindLabel = s.kind === "transfer" ? "Chuyển khoản" : "Tiền mặt";
    row.innerHTML = `<span class="chip">${escapeHTML(s.name)}</span>
      <span class="muted-sm">${kindLabel}</span>
      <button type="button" class="category-delete-button" data-del-storage="${idx}">Xoá</button>`;
    els.storagesList.appendChild(row);
  });
  // banks
  els.banksList.innerHTML = "";
  settings.banks.forEach((b, idx) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `<span class="chip">${escapeHTML(b)}</span>
      <button type="button" class="category-delete-button" data-del-bank="${idx}">Xoá</button>`;
    els.banksList.appendChild(row);
  });
  // defaults
  els.selDefaultSource.innerHTML = "";
  settings.sources.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    els.selDefaultSource.appendChild(o);
  });
  els.selDefaultSource.value =
    settings.defaultSource || settings.sources[0] || "";

  els.selDefaultStorage.innerHTML = "";
  settings.storages.forEach((s) => {
    const o = document.createElement("option");
    o.value = s.name;
    o.textContent = s.name;
    els.selDefaultStorage.appendChild(o);
  });
  els.selDefaultStorage.value =
    settings.defaultStorage || settings.storages[0]?.name || "";

  els.selDefaultBank.innerHTML = "";
  settings.banks.forEach((b) => {
    const o = document.createElement("option");
    o.value = b;
    o.textContent = b;
    els.selDefaultBank.appendChild(o);
  });
  els.selDefaultBank.value = settings.defaultBank || "";
}

export function initSettingsUI(els) {
  // open/close hub
  els.btnSettings.addEventListener("click", () =>
    els.settingsHubDlg.showModal()
  );
  els.btnOpenCategoryManager.addEventListener("click", () => {
    els.settingsHubDlg.close();
    renderSettingsUI(els);
    els.settingsDlg.showModal();
  });
  els.btnCloseSettingsHub.addEventListener("click", () =>
    els.settingsHubDlg.close()
  );
  els.btnCloseSettings.addEventListener("click", () => els.settingsDlg.close());

  // add/remove
  document.addEventListener("click", (ev) => {
    const delSrc = ev.target.closest("[data-del-source]");
    if (delSrc) {
      const i = +delSrc.dataset.delSource;
      const removed = settings.sources.splice(i, 1)[0];
      if (settings.defaultSource === removed)
        settings.defaultSource = settings.sources[0] || "";
      saveSettings();
      renderSettingsUI(els);
      return;
    }
    const delSto = ev.target.closest("[data-del-storage]");
    if (delSto) {
      const i = +delSto.dataset.delStorage;
      const removed = settings.storages.splice(i, 1)[0];
      if (settings.defaultStorage === removed?.name)
        settings.defaultStorage = settings.storages[0]?.name || "";
      saveSettings();
      renderSettingsUI(els);
      return;
    }
    const delBank = ev.target.closest("[data-del-bank]");
    if (delBank) {
      const i = +delBank.dataset.delBank;
      const removed = settings.banks.splice(i, 1)[0];
      if (settings.defaultBank === removed)
        settings.defaultBank = settings.banks[0] || "";
      saveSettings();
      renderSettingsUI(els);
      return;
    }
  });
  els.btnAddSource.addEventListener("click", () => {
    const v = (els.inpNewSource.value || "").trim();
    if (!v) return;
    if (!settings.sources.includes(v)) settings.sources.push(v);
    els.inpNewSource.value = "";
    saveSettings();
    renderSettingsUI(els);
  });
  els.btnAddStorage.addEventListener("click", () => {
    const name = (els.inpNewStorageName.value || "").trim();
    if (!name) return;
    const kind =
      els.selNewStorageKind.value === "transfer" ? "transfer" : "cash";
    if (!settings.storages.some((s) => s.name === name))
      settings.storages.push({ name, kind });
    els.inpNewStorageName.value = "";
    saveSettings();
    renderSettingsUI(els);
  });
  els.btnAddBank.addEventListener("click", () => {
    const v = (els.inpNewBank.value || "").trim();
    if (!v) return;
    if (!settings.banks.includes(v)) settings.banks.push(v);
    els.inpNewBank.value = "";
    saveSettings();
    renderSettingsUI(els);
  });
  // defaults
  els.selDefaultSource.addEventListener("change", () => {
    settings.defaultSource = els.selDefaultSource.value;
    saveSettings();
  });
  els.selDefaultStorage.addEventListener("change", () => {
    settings.defaultStorage = els.selDefaultStorage.value;
    saveSettings();
  });
  els.selDefaultBank.addEventListener("change", () => {
    settings.defaultBank = els.selDefaultBank.value;
    saveSettings();
  });
}
