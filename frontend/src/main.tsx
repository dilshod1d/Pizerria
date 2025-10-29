import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TranscriptProvider } from "./context/TranscriptContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <App />
      </TranscriptProvider>
    </Suspense>
  </StrictMode>
);
