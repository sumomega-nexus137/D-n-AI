/**
 * Локальный «аккаунт» и история анализов — без базы данных, всё в браузере
 * (localStorage). Для прототипа этого достаточно: вход демонстрационный,
 * история и профиль хранятся на устройстве пользователя.
 *
 * Все обращения к localStorage обёрнуты в try/catch — в приватном окне или
 * при заблокированных cookie он бросает исключение, и сайт не должен падать.
 */

const USER_KEY = "dnai.user";
const HISTORY_KEY = "dnai.history";
const MAX_HISTORY = 40;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим — молча игнорируем */
  }
}

export function getUser() {
  return read(USER_KEY, null);
}

export function signIn(name, email) {
  const user = {
    name: name?.trim() || "Агроном",
    email: email?.trim() || "",
    since: new Date().toISOString(),
  };
  write(USER_KEY, user);
  return user;
}

export function signOut() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

export function getHistory() {
  return read(HISTORY_KEY, []);
}

export function addHistory(entry) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  const next = [item, ...getHistory()].slice(0, MAX_HISTORY);
  write(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  write(HISTORY_KEY, []);
}
