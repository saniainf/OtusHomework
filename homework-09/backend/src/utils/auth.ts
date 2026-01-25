// Утилита для извлечения идентификатора пользователя из JWT токена.

/**
 * Извлекает userId из заголовка Authorization формата "Bearer <token>".
 * Декодирует JWT и возвращает значение поля "sub" из payload.
 * @param authHeader Строка заголовка Authorization
 * @returns Идентификатор пользователя или null
 */
export function extractUserIdFromToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.warn("Неверный формат Authorization header:", authHeader);
    return null;
  }

  const token = parts[1];
  if (!token) {
    return null;
  }

  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      console.warn("Неверный формат JWT токена");
      return null;
    }

    const payload = tokenParts[1];
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8");
    const payloadObj = JSON.parse(decoded);

    if (payloadObj.sub) {
      return String(payloadObj.sub);
    }

    console.warn("В JWT токене не найдено поле \"sub\"");
    return null;
  } catch (error) {
    console.warn("Ошибка при декодировании JWT токена:", (error as Error).message);
    return null;
  }
}
