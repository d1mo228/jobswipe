/** Тонкая обёртка над localStorage. Безопасна при отключённом хранилище (private mode). */
const PREFIX = 'jobswipe:'

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      /* квота или private mode — молча игнорируем */
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch {
      /* noop */
    }
  },
}
