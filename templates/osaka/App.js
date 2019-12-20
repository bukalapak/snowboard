import React, { Suspense } from "react";
import { Router, View } from "react-navi";
import { ThemeProvider } from "emotion-theming";
import { ColorModeProvider, useColorMode } from "@chakra-ui/core";
import { CSSReset } from "@chakra-ui/core";
import { ConfigProvider } from "./lib/hooks/config";
import routes from "./routes";
import theme from "./theme";
import config from "./config";

const App = () => {
  return (
    <Router routes={routes}>
      <ConfigProvider config={config}>
        <ThemeProvider theme={theme}>
          <CSSReset />
          <ColorModeProvider>
            <Suspense fallback={null}>
              <View />
            </Suspense>
          </ColorModeProvider>
        </ThemeProvider>
      </ConfigProvider>
    </Router>
  );
};

export default App;
