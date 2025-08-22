// public/scripts/app.js
import { initSettingsUI } from "./settings-ui.js";
import { initEntriesUI } from "./entries-ui.js";
import { initTheme } from "./theme.js";

function byId(id) {
  return document.getElementById(id);
}

export function initApp() {
  const els = {
    // main
    fab: byId("fab"),
    entries: byId("entries"),
    // entry dialog
    dlg: byId("entryDialog"),
    form: byId("entryForm"),
    entryId: byId("entryId"),
    amount: byId("amount"),
    inputDate: byId("inputDate"),
    recordTomorrow: byId("recordTomorrow"),
    intendedDate: byId("intendedDate"),
    intendedPreview: byId("intendedPreview"),
    sourceSelect: byId("sourceSelect"),
    storageSelect: byId("storageSelect"),
    bankWrap: byId("bankWrap"),
    bankSelect: byId("bankSelect"),
    client: byId("client"),
    note: byId("note"),
    btnCancel: byId("btnCancel"),
    // filters
    search: byId("search"),
    fromDate: byId("fromDate"),
    toDate: byId("toDate"),
    sort: byId("sort"),
    btnClearFilters: byId("btnClearFilters"),
    // bulk
    lblSelectedCount: byId("lblSelectedCount"),
    btnSelectAll: byId("btnSelectAll"),
    btnDeleteSelected: byId("btnDeleteSelected"),
    // summary labels
    lblToday: byId("lblToday"),
    lblTomorrow: byId("lblTomorrow"),
    lblThisWeek: byId("lblThisWeek"),
    lblThisMonth: byId("lblThisMonth"),
    sumToday: byId("sumToday"),
    sumTomorrow: byId("sumTomorrow"),
    sumWeek: byId("sumWeek"),
    sumMonth: byId("sumMonth"),
    // settings hub & dialog
    btnSettings: byId("btnSettings"),
    settingsHubDlg: byId("settingsHubDialog"),
    btnOpenCategoryManager: byId("btnOpenCategoryManager"),
    btnCloseSettingsHub: byId("btnCloseSettingsHub"),
    settingsDlg: byId("categoryManagerDialog"),
    btnCloseSettings: byId("btnCloseSettings"),
    // settings lists/inputs
    sourcesList: byId("sourcesList"),
    storagesList: byId("storagesList"),
    banksList: byId("banksList"),
    inpNewSource: byId("inpNewSource"),
    btnAddSource: byId("btnAddSource"),
    inpNewStorageName: byId("inpNewStorageName"),
    selNewStorageKind: byId("selNewStorageKind"),
    btnAddStorage: byId("btnAddStorage"),
    inpNewBank: byId("inpNewBank"),
    btnAddBank: byId("btnAddBank"),
    selDefaultSource: byId("selDefaultSource"),
    selDefaultStorage: byId("selDefaultStorage"),
    selDefaultBank: byId("selDefaultBank"),
  };

  initSettingsUI(els);
  const entriesUI = initEntriesUI(els);
  entriesUI.renderEverything();
}

initApp();
initTheme();

