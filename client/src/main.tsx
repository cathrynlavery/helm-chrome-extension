import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initStorage } from "./lib/chromeStorage";

// Initialize storage before rendering
initStorage().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
