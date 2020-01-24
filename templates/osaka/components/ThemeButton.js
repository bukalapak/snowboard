import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { Button, SIZE, KIND } from "baseui/button";
import { useTheme } from "../lib/theme";

export default function() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Button
      size={SIZE.compact}
      kind={KIND.primary}
      onClick={() => {
        toggleTheme();
      }}
    >
      {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
    </Button>
  );
}
