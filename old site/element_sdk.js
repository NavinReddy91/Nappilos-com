(function () {
  let currentConfig = {};
  let changeHandler = null;

  window.elementSdk = {
    init(options) {
      currentConfig = { ...(options && options.defaultConfig ? options.defaultConfig : {}) };
      changeHandler = options && options.onConfigChange;
      if (typeof changeHandler === "function") {
        changeHandler(currentConfig);
      }
      return { isOk: true };
    },

    setConfig(nextConfig) {
      currentConfig = { ...currentConfig, ...nextConfig };
      if (typeof changeHandler === "function") {
        changeHandler(currentConfig);
      }
      return { isOk: true };
    }
  };
})();
