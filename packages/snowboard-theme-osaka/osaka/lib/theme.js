import React, { createContext, useContext } from "react";
import { BaseProvider } from "baseui";
import { Provider as StyletronProvider } from "styletron-react";
import { Client as Styletron } from "styletron-engine-atomic";
import useDarkMode from "use-dark-mode";
import { LightTheme, DarkTheme } from "../theme";

const ThemeContext = createContext();
const engine = new Styletron();
const themes = {
  light: LightTheme,
  dark: DarkTheme
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export const ThemeProvider = ({ children }) => {
  const { value: isDarkMode, toggle } = useDarkMode(false, {
    storageKey: "snowboard.darkMode"
  });

  const colorMode = isDarkMode ? "dark" : "light";

  const value = {
    darkMode: isDarkMode,
    toggleTheme: toggle
  };

  return (
    <StyletronProvider value={engine}>
      <ThemeContext.Provider value={value}>
        <BaseProvider theme={themes[colorMode]}>{children}</BaseProvider>
      </ThemeContext.Provider>
    </StyletronProvider>
  );
};
