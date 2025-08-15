// public/scripts/entries-ui.js
import { entries, saveEntries, settings, selectedIds } from "./state.js";
import {
  pad2,
  toISO,
  parseISO,
  todayISO,
  addDaysISO,
  startOfWeekISO,
  endOfWeekISO,
  startOfMonthISO,
  endOfMonthISO,
  fmtVND,
  fmtDayVN,
  fmtDateVN,
  escapeHTML,
  normalize,
} from "./utils.js";
import {
  getStorageKindByName,
  refreshSourceOptions,
  refreshStorageOptions,
  refreshBankOptions,
  toggleBankVisibility,
} from "./settings-ui.js";

export function initEntriesUI(els) {
  // filters
  function passFilters(e) {
    const q = normalize(els.search.value);
    const f = els.fromDate.value || null;
    const t = els.toDate.value || null;
    const intended = e.intendedDate || e.inputDate;
    const storageLabel = e.storage || "Tiền mặt";
    const hay = `${e.note || ""} ${e.client || ""} ${
      e.source || ""
    } ${storageLabel} ${e.bank || ""}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (f && intended < f) return false;
    if (t && intended > t) return false;
    return true;
  }
  function sortEntries(list) {
    const how = els.sort.value || "newest";
    const byCreated = (a, b) =>
      (b.createdAt || "").localeCompare(a.createdAt || "");
    const byAmountDesc = (a, b) =>
      (b.amountVND || 0) - (a.amountVND || 0) || byCreated(a, b);
    const byAmountAsc = (a, b) =>
      (a.amountVND || 0) - (b.amountVND || 0) || byCreated(a, b);
    const byOldest = (a, b) =>
      (a.createdAt || "").localeCompare(b.createdAt || "");
    switch (how) {
      case "amountDesc":
        return list.sort(byAmountDesc);
      case "amountAsc":
        return list.sort(byAmountAsc);
      case "oldest":
        return list.sort(byOldest);
      case "newest":
      default:
        return list.sort(byCreated);
    }
  }
  const dayBreakdown = (list) => {
    const acc = {};
    for (const e of list) {
      const k = (e.source || "Khác").trim();
      acc[k] = (acc[k] || 0) + (e.amountVND || 0);
    }
    return acc;
  };

  //   <div class="entry-date-main">${fmtDateVN(
  //   e.intendedDate || e.inputDate || ""
  // )}</div>

  function renderEntryRow(e) {
    const row = document.createElement("div");
    row.className = "entry-row";
    const colDate = document.createElement("div");
    colDate.className = "entry-col-date";
    colDate.innerHTML = `
      <div><input type="checkbox" class="entry-checkbox focus-ring fade" data-id="${
        e.id
      }" ${selectedIds.has(e.id) ? "checked" : ""}></div>`;
    const colMain = document.createElement("div");
    colMain.className = "entry-col-main";
    const clientLine = e.client
      ? `<span class = "muted">${escapeHTML(e.client)}</span>`
      : "";
    const noteLine = e.note
      ? `<span class="muted">${escapeHTML(e.note)}</span>`
      : "";
    const srcBadge = e.source
      ? `<span class="pill muted">${escapeHTML(e.source)}</span>`
      : "";
    const sourceLine = srcBadge ? `<span>${srcBadge}</span>` : "";
    const storageText =
      e.storage === "Chuyển khoản" || e.storage === "transfer"
        ? `Chuyển khoản${e.bank ? " (" + escapeHTML(e.bank) + ")" : ""}`
        : e.storage || "Tiền mặt";
    const storageLine = `<span class = "muted">${escapeHTML(
      storageText
    )}</span>`;

    const metaLeft = `
  <div class="entry-amount">${fmtVND(e.amountVND)}</div>
  <div class="entry-line" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
    ${[sourceLine, storageLine, clientLine, noteLine]
      .filter(Boolean)
      .join("<span>·</span>")}
  </div>
`;

    const metaRight = `
      <div class="entry-meta">
        <span>Ngày nhập: ${e.inputDate || ""}</span>
        <span>Ngày nhận tip: ${e.intendedDate || e.inputDate || ""}</span>
        <span>Lưu lúc: ${
          e.createdAt ? new Date(e.createdAt).toLocaleString("vi-VN") : ""
        }</span>
      </div>
    `;
    colMain.innerHTML = `<div class="meta">${metaLeft}${metaRight}</div>`;

    const colActions = document.createElement("div");
    colActions.className = "entry-col-actions";
    const btnEdit = document.createElement("button");
    btnEdit.className = "entry-btn entry-btn-edit focus-ring fade";
    // btnEdit.textContent = "✏️";
    btnEdit.innerHTML = `<img src="public/icons/edit.svg" alt="Sửa" style="width:16px;height:16px;">`;
    btnEdit.onclick = () => openForEdit(e.id);
    const btnDel = document.createElement("button");
    btnDel.className = "entry-btn entry-btn-del focus-ring fade";
    // btnDel.textContent = "🗑️";
    btnDel.innerHTML = `<img src="public/icons/trash.svg" alt="Xóa" style="width:16px;height:16px;">`;
    btnDel.onclick = () => {
      const idx = entries.findIndex((x) => x.id === e.id);
      if (idx >= 0) {
        entries.splice(idx, 1);
        selectedIds.delete(e.id);
        saveEntries();
        renderEverything();
      }
    };

    colActions.append(btnEdit, btnDel);
    const rowFrag = document.createDocumentFragment();
    rowFrag.append(colDate, colMain, colActions);
    row.appendChild(rowFrag);
    return row;
  }

  function renderList() {
    els.entries.innerHTML = "";
    const filtered = entries.filter(passFilters);
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.textContent = "Chưa có mục nào khớp bộ lọc. Nhấn '+ Thêm tip'.";
      empty.style.cssText = "text-align:center;color:#6b7280;margin-top:24px";
      els.entries.appendChild(empty);
      updateSelectedCount();
      return;
    }
    const groups = {};
    for (const e of filtered) {
      const d = e.intendedDate || e.inputDate;
      (groups[d] ||= []).push(e);
    }
    const dayKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    for (const day of dayKeys) {
      const list = groups[day];
      const wrap = document.createElement("div");
      wrap.className = "day-group";
      const sum = list.reduce((s, x) => s + (x.amountVND || 0), 0);
      const count = list.length;
      const header = document.createElement("div");
      header.className = "day-header";
      header.innerHTML = `<div class="day-head-left"><strong>${fmtDayVN(
        day
      )}</strong> <span class="muted">— ${count} mục</span></div>
                          <div class="day-subtotal">Tổng ngày: ${fmtVND(
                            sum
                          )}</div>`;
      wrap.appendChild(header);
      const bd = dayBreakdown(list);
      const bdStr = Object.entries(bd)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${k}: ${fmtVND(v)}`)
        .join(" · ");
      if (bdStr) {
        const el = document.createElement("div");
        el.className = "day-breakdown muted";
        el.style.margin = "6px 0 10px";
        el.textContent = bdStr;
        wrap.appendChild(el);
      }
      sortEntries([...list]).forEach((e) =>
        wrap.appendChild(renderEntryRow(e))
      );
      els.entries.appendChild(wrap);
    }
    updateSelectedCount();
  }

  function renderSummaries() {
    const today = todayISO(),
      tomorrow = addDaysISO(today, 1);
    const wStart = startOfWeekISO(today),
      wEnd = endOfWeekISO(today);
    const mStart = startOfMonthISO(today),
      mEnd = endOfMonthISO(today);
    const sum = { today: 0, tomorrow: 0, week: 0, month: 0 };
    for (const e of entries) {
      const d = e.intendedDate || e.inputDate,
        a = e.amountVND || 0;
      if (d === today) sum.today += a;
      if (d === tomorrow) sum.tomorrow += a;
      if (d >= wStart && d <= wEnd) sum.week += a;
      if (d >= mStart && d <= mEnd) sum.month += a;
    }
    els.lblToday.textContent = `Hôm nay (${today
      .split("-")
      .reverse()
      .join("/")})`;
    els.lblTomorrow.textContent = `Ngày mai (${tomorrow
      .split("-")
      .reverse()
      .join("/")})`;
    const wRange = `${wStart.split("-").reverse().join("/")} – ${wEnd
      .split("-")
      .reverse()
      .join("/")}`;
    els.lblThisWeek.textContent = `Tuần này (${wRange})`;
    const [y, m] = today.split("-");
    els.lblThisMonth.textContent = `Tháng này (${m}/${y})`;
    els.sumToday.textContent = fmtVND(sum.today);
    els.sumTomorrow.textContent = fmtVND(sum.tomorrow);
    els.sumWeek.textContent = fmtVND(sum.week);
    els.sumMonth.textContent = fmtVND(sum.month);
  }

  const setIntendedByRule = () => {
    const base = els.inputDate.value || todayISO();
    const auto = els.recordTomorrow.checked ? addDaysISO(base, 1) : base;
    if (!els.intendedDate.dataset.manual) els.intendedDate.value = auto;
    els.intendedPreview.textContent = (els.intendedDate.value || auto)
      .split("-")
      .reverse()
      .join("/");
  };

  function openForNew() {
    els.form.reset();
    els.entryId.value = "";
    els.amount.value = "";
    els.inputDate.value = todayISO();
    els.recordTomorrow.checked = true;
    els.intendedDate.value = "";
    delete els.intendedDate.dataset.manual;
    // defaults from settings
    refreshSourceOptions(
      els,
      settings.defaultSource || settings.sources[0] || ""
    );
    refreshStorageOptions(
      els,
      settings.defaultStorage || settings.storages[0]?.name || ""
    );
    refreshBankOptions(els, settings.defaultBank || settings.banks[0] || "");
    toggleBankVisibility(els);
    els.client.value = "";
    els.note.value = "";
    setIntendedByRule();
    els.dlg.showModal();
    setTimeout(() => els.amount.focus(), 0);
  }

  function openForEdit(id) {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    els.entryId.value = e.id;
    els.amount.value = (e.amountVND || "").toLocaleString("vi-VN");
    els.inputDate.value = e.inputDate || todayISO();
    const autoIfTomorrow = addDaysISO(els.inputDate.value, 1);
    const intended = e.intendedDate || e.inputDate;
    if (intended === autoIfTomorrow) {
      els.recordTomorrow.checked = true;
      delete els.intendedDate.dataset.manual;
      els.intendedDate.value = "";
    } else if (intended === els.inputDate.value) {
      els.recordTomorrow.checked = false;
      delete els.intendedDate.dataset.manual;
      els.intendedDate.value = "";
    } else {
      els.recordTomorrow.checked = false;
      els.intendedDate.value = intended;
      els.intendedDate.dataset.manual = "1";
    }
    refreshSourceOptions(
      els,
      e.source || settings.defaultSource || settings.sources[0] || ""
    );
    refreshStorageOptions(
      els,
      e.storage || settings.defaultStorage || settings.storages[0]?.name || ""
    );
    refreshBankOptions(
      els,
      e.bank || settings.defaultBank || settings.banks[0] || ""
    );
    toggleBankVisibility(els);
    els.client.value = e.client || "";
    els.note.value = e.note || "";
    setIntendedByRule();
    els.dlg.showModal();
    setTimeout(() => els.amount.focus(), 0);
  }

  function upsert(obj) {
    const idx = entries.findIndex((x) => x.id === obj.id);
    if (idx >= 0) entries[idx] = obj;
    else entries.push(obj);
    saveEntries();
    renderEverything();
  }

  function updateSelectedCount() {
    const ids = [...document.querySelectorAll(".entry-checkbox")].map(
      (c) => c.dataset.id
    );
    const n = ids.filter((id) => selectedIds.has(id)).length;
    els.lblSelectedCount.textContent = `${n} mục đã chọn`;
  }
  function toggleSelectAll() {
    const boxes = [...document.querySelectorAll(".entry-checkbox")];
    const all = boxes.length && boxes.every((b) => b.checked);
    boxes.forEach((b) => {
      b.checked = !all;
      if (b.checked) selectedIds.add(b.dataset.id);
      else selectedIds.delete(b.dataset.id);
    });
    updateSelectedCount();
  }
  function deleteSelected() {
    if (!selectedIds.size) {
      alert("Chưa chọn mục nào.");
      return;
    }
    if (!confirm("Xoá tất cả mục đã chọn?")) return;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (selectedIds.has(entries[i].id)) entries.splice(i, 1);
    }
    selectedIds.clear();
    saveEntries();
    renderEverything();
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const id =
      els.entryId.value ||
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    const existing = entries.find((x) => x.id === id);
    const amount = Number(String(els.amount.value).replace(/\D/g, "")) || 0;
    if (!amount) {
      alert("Vui lòng nhập số tiền.");
      return;
    }
    const inputDate = els.inputDate.value || todayISO();
    const intendedDate =
      els.intendedDate.value ||
      (els.recordTomorrow.checked ? addDaysISO(inputDate, 1) : inputDate);
    const storageName = els.storageSelect.value;
    const kind = getStorageKindByName(storageName);
    const bankName =
      kind === "transfer"
        ? els.bankSelect.value || settings.defaultBank || ""
        : "";
    if (kind === "transfer" && !bankName) {
      alert("Vui lòng chọn ngân hàng cho giao dịch chuyển khoản.");
      return;
    }
    const obj = {
      id,
      createdAt: existing?.createdAt || new Date().toISOString(),
      inputDate,
      intendedDate,
      amountVND: amount,
      source: els.sourceSelect.value.trim(),
      storage: storageName,
      bank: bankName,
      client: els.client.value.trim(),
      note: els.note.value.trim(),
    };
    upsert(obj);
    els.dlg.close();
  }

  function renderEverything() {
    renderList();
    renderSummaries();
  }

  // Wire here
  els.fab.addEventListener("click", openForNew);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-quick]");
    if (!btn) return;
    const inc = +btn.getAttribute("data-quick") || 0;
    const current = Number(String(els.amount.value).replace(/\D/g, "")) || 0;
    const next = Math.max(0, current + inc);
    els.amount.value = next.toLocaleString("vi-VN");
    els.amount.dispatchEvent(new Event("input"));
  });
  els.amount.addEventListener("input", () => {
    const d = String(els.amount.value).replace(/\D/g, "");
    els.amount.value = d ? Number(d).toLocaleString("vi-VN") : "";
  });
  els.inputDate.addEventListener("change", setIntendedByRule);
  els.recordTomorrow.addEventListener("change", setIntendedByRule);
  els.intendedDate.addEventListener("change", () => {
    if (els.intendedDate.value) els.intendedDate.dataset.manual = "1";
    else delete els.intendedDate.dataset.manual;
    setIntendedByRule();
  });
  els.storageSelect.addEventListener("change", () => toggleBankVisibility(els));
  [els.search, els.fromDate, els.toDate, els.sort].forEach((el) =>
    el.addEventListener("input", renderList)
  );
  els.btnClearFilters.addEventListener("click", () => {
    els.search.value = "";
    els.fromDate.value = "";
    els.toDate.value = "";
    els.sort.value = "newest";
    renderList();
  });
  els.btnSelectAll.addEventListener("click", toggleSelectAll);
  els.btnDeleteSelected.addEventListener("click", deleteSelected);
  els.entries.addEventListener("change", (ev) => {
    const box = ev.target.closest(".entry-checkbox");
    if (!box) return;
    if (box.checked) selectedIds.add(box.dataset.id);
    else selectedIds.delete(box.dataset.id);
    updateSelectedCount();
  });
  els.form.addEventListener("submit", handleSubmit);
  els.btnCancel.addEventListener("click", (e) => {
    e.preventDefault();
    els.dlg.close();
  });

  return { openForNew, openForEdit, renderEverything };
}
