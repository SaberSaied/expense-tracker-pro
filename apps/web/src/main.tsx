import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { applyInitialTheme } from "./utils/theme";

// Apply the saved/OS theme before the first paint to avoid a flash of the
// wrong theme (FOUC).
applyInitialTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
