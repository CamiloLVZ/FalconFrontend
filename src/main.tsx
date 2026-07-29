import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./auth/context/AuthProvider.tsx";
import { ServerWakeupGate } from "./components/common/ServerWakeupGate.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ServerWakeupGate>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ServerWakeupGate>
    </AuthProvider>
  </React.StrictMode>,
);
