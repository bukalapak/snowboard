import React, { useContext } from "react";

const ConfigContext = React.createContext({});

export function ConfigProvider({ config, children }) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
