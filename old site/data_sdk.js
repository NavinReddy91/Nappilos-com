(function () {
  const STORAGE_KEY = "nappilos_subscriptions";

  function readRows() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeRows(rows) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }

  window.dataSdk = {
    init(handler) {
      if (handler && typeof handler.onDataChanged === "function") {
        handler.onDataChanged(readRows());
      }
      return { isOk: true };
    },

    async create(row) {
      const rows = readRows();
      rows.push({ ...row, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) });
      writeRows(rows);
      return { isOk: true };
    }
  };
})();
