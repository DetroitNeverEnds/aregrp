/**
 * Нормализация redirect-пути после auth:
 * - допускаем только внутренние относительные пути
 * - поддерживаем случай, когда redirect пришел URL-encoded
 */
export const resolveAuthRedirect = (redirect: string | null): string => {
    if (!redirect) {
        return '/';
    }

    let nextRedirect = redirect;

    // Некоторые переходы могут принести уже закодированный redirect (%2Fpath%3F...)
    if (nextRedirect.startsWith('%2F') || nextRedirect.startsWith('%2f')) {
        try {
            nextRedirect = decodeURIComponent(nextRedirect);
        } catch {
            return '/';
        }
    }

    return nextRedirect.startsWith('/') ? nextRedirect : '/';
};
