const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Задан явно — используем его (фронт и backend на разных доменах).
// Не задан: в dev ходим на локальный backend, в проде — на тот же origin,
// потому что собранный сайт раздаёт сам backend.
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

async function postImage(path, file) {
  const form = new FormData();
  form.append("file", file);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { method: "POST", body: form });
  } catch (err) {
    throw new ApiError("offline", 0);
  }

  if (!response.ok) {
    let detail = `Сервер вернул ошибку ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* тело не JSON — оставляем общий текст */
    }
    throw new ApiError(detail, response.status);
  }

  return response.json();
}

export const analyzeGrain = (file) => postImage("/predict/grain", file);
export const analyzeDisease = (file) => postImage("/predict/disease", file);

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
