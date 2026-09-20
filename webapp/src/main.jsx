import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Офлайн-заглушка: кешируем оболочку приложения и показываем понятный
// экран вместо белой страницы, когда связи нет.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* офлайн-режим просто не включится, приложение работает как обычно */
    });
  });
}
