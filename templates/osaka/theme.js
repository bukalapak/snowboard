import { theme } from "@chakra-ui/core";

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    dark: "#1a202c",
    light: "#fff"
  },
  fontSizes: {
    ...theme.fontSizes,
    "2xs": "10px"
  }
};

export default customTheme;
