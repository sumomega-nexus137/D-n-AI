const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Явно задан — используем его. Иначе: в dev к локальному backend,
// в проде — тот же origin (собранный сайт раздаёт сам backend).
const BASE_URL =
  RAW_BACKEND_URL !== undefined
    ? RAW_BACKEND_URL.replace(/\/$/, "")
    : import.meta.env.DEV
      ? "http://localhost:8000"
      : "";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// ngrok на бесплатном плане показывает страницу-предупреждение для обычных
// запросов; этот заголовок её пропускает, чтобы fetch получал JSON.
const NGROK_HEADER = { "ngrok-skip-browser-warning": "true" };

// Режим витрины: статический билд без backend'а (превью-ссылка). Отдаёт
// реалистичные примеры, чтобы интерфейс можно было потрогать. В обычной
// сборке флаг не задан и весь этот код мёртв.
const PREVIEW = import.meta.env.VITE_PREVIEW === "1";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function postImage(path, file) {
  if (PREVIEW) {
    const { DEMO_GRAIN, DEMO_DISEASE } = await import("./demoResults.js");
    await wait(1100);
    const isDisease = path.includes("disease");
    const sample = isDisease ? DEMO_DISEASE : DEMO_GRAIN;
    return {
      ...sample,
      offline_sample: false,
      preview_sample: true,
      detected_module: isDisease ? "disease" : "grain",
    };
  }

  const form = new FormData();
  form.append("file", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      body: form,
      headers: NGROK_HEADER,
    });
  } catch {
    throw new ApiError("offline", 0);
  }

  if (!response.ok) {
    let detail = `Сервер вернул ошибку ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* тело не JSON */
    }
    throw new ApiError(detail, response.status);
  }
  return response.json();
}

export const analyzeGrain = (file) => postImage("/predict/grain", file);
export const analyzeDisease = (file) => postImage("/predict/disease", file);
// Сам определяет, зерно на фото или растение, и возвращает нужный разбор
// с полем detected_module.
export const analyzeAuto = (file) => postImage("/predict/auto", file);

/**
 * Консультант на Gemini. Ключ живёт ТОЛЬКО на backend — сюда уходит лишь
 * текст вопроса и (необязательно) контекст последнего анализа.
 */
export async function askConsultant(message, context) {
  if (PREVIEW) {
    await wait(900);
    return {
      reply:
        "Это демо-режим витрины — живой ИИ-консультант работает на развёрнутом " +
        "сервере с ключом Gemini. Там я отвечаю на вопросы про класс зерна, " +
        "болезни и хранение с учётом вашего анализа.",
    };
  }
  let response;
  try {
    response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_HEADER },
      body: JSON.stringify({ message, context: context ?? null }),
    });
  } catch {
    throw new ApiError("offline", 0);
  }
  if (!response.ok) {
    let detail = `Ошибка ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* тело не JSON */
    }
    throw new ApiError(detail, response.status);
  }
  return response.json();
}

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, {
      cache: "no-store",
      headers: NGROK_HEADER,
    });
    return res.ok;
  } catch {
    return false;
  }
}
