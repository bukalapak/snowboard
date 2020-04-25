import React, { Suspense } from "react";
import { Router, View } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import { ThemeProvider } from "./lib/theme";
import { StoreProvider } from "./lib/store";
import routes from "./routes";
import seeds from "./seeds";

const App = () => {
  return (
    <HelmetProvider>
      <Router routes={routes} context={seeds}>
        <ThemeProvider>
          <StoreProvider>
            <Suspense fallback={null}>
              <View />
            </Suspense>
          </StoreProvider>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
