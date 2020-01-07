import React, { Suspense } from "react";
import { Router, View } from "react-navi";
import { ThemeProvider } from "emotion-theming";
import { ColorModeProvider, useColorMode } from "@chakra-ui/core";
import HelmetProvider from "react-navi-helmet-async";
import { CSSReset } from "@chakra-ui/core";
import { ConfigProvider } from "./lib/hooks/config";
import { StoreProvider } from "./lib/hooks/store";
import routes from "./routes";
import theme from "./theme";
import config from "./config";

const App = () => {
  return (
    <HelmetProvider>
      <Router routes={routes}>
        <ConfigProvider config={config}>
          <StoreProvider>
            <ThemeProvider theme={theme}>
              <CSSReset />
              <ColorModeProvider>
                <Suspense fallback={null}>
                  <View />
                </Suspense>
              </ColorModeProvider>
            </ThemeProvider>
          </StoreProvider>
        </ConfigProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
