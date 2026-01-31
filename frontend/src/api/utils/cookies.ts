// /**
//  * Утилиты для работы с cookies
//  */

// /**
//  * Получить значение cookie по имени
//  */
// export function getCookie(name: string): string | null {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);

//     if (parts.length === 2) {
//         const cookieValue = parts.pop()?.split(';').shift();
//         return cookieValue || null;
//     }

//     return null;
// }

// /**
//  * Установить cookie
//  */
// export function setCookie(
//     name: string,
//     value: string,
//     options: {
//         days?: number;
//         path?: string;
//         domain?: string;
//         secure?: boolean;
//         sameSite?: 'Strict' | 'Lax' | 'None';
//     } = {},
// ): void {
//     const { days = 7, path = '/', domain, secure = true, sameSite = 'Strict' } = options;

//     let cookieString = `${name}=${value}`;

//     if (days) {
//         const expires = new Date(Date.now() + days * 864e5).toUTCString();
//         cookieString += `; expires=${expires}`;
//     }

//     cookieString += `; path=${path}`;

//     if (domain) {
//         cookieString += `; domain=${domain}`;
//     }

//     if (secure) {
//         cookieString += '; Secure';
//     }

//     cookieString += `; SameSite=${sameSite}`;

//     document.cookie = cookieString;
// }

// /**
//  * Удалить cookie
//  */
// export function deleteCookie(
//     name: string,
//     options: {
//         path?: string;
//         domain?: string;
//     } = {},
// ): void {
//     const { path = '/', domain } = options;

//     let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
//     cookieString += `; path=${path}`;

//     if (domain) {
//         cookieString += `; domain=${domain}`;
//     }

//     document.cookie = cookieString;
// }
