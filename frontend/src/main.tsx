import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { SearchProvider } from "./context/searchContext.jsx";
import { NextUIProvider } from "@nextui-org/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NextUIProvider> {/* ✅ Add this wrapper */}
      <ThemeProvider>
        <SearchProvider>
          <AppWrapper>
            <App />
          </AppWrapper>
        </SearchProvider>
      </ThemeProvider>
    </NextUIProvider>
  </StrictMode>
);
