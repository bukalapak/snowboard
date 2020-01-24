import React, { Suspense } from "react";
import { Router, View, NotFoundBoundary } from "react-navi";
import HelmetProvider from "react-navi-helmet-async";
import { ThemeProvider } from "./lib/theme";
import routes from "./routes";
import seeds from "./seeds";

const App = () => {
  return (
    <HelmetProvider>
      <Router routes={routes} context={seeds}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <View />
          </Suspense>
        </ThemeProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
