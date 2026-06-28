import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider delayDuration={150}>
          <App />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
