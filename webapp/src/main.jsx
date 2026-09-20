import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service worker намеренно НЕ регистрируем: при перевыкладке он отдавал
// закешированную старую оболочку («сайт не обновляется»). Заодно снимаем
// регистрацию и чистим кеши, если он остался от прошлых версий на этом origin.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  if (window.caches) {
    caches.keys?.().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
}
