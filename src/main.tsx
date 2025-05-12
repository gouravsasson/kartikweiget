import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import App from "./App.tsx";
import { WidgetProvider } from "./constexts/WidgetContext.tsx";

createRoot(document.getElementById("root")!).render(
  <WidgetProvider agent_id="715cc5a6-86b0-408a-b7a8-91607231699b" schema="danube" type="ravan">
    {/* <StrictMode> */}
    <App />
    <Analytics />
    {/* </StrictMode> */}
  </WidgetProvider>
);
