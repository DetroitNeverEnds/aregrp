/**
 * Скрипт для проверки синхронизации ключей переводов между языками
 *
 * Проверяет:
 * - Наличие всех ключей во всех языках
 * - Отсутствие лишних ключей
 * - Структурную идентичность файлов переводов
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['ru', 'en'];

interface TranslationObject {
    [key: string]: string | TranslationObject;
}

interface MissingKey {
    key: string;
    language: string;
}

interface ExtraKey {
    key: string;
    language: string;
}

/**
 * Рекурсивно получает все ключи из объекта переводов
 */
function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === 'object' && value !== null) {
            keys.push(...getAllKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }

    return keys;
}

/**
 * Загружает файл переводов для указанного языка
 */
function loadTranslation(language: string): TranslationObject {
    const filePath = path.join(LOCALES_DIR, language, 'translation.json');

    if (!fs.existsSync(filePath)) {
        throw new Error(`Файл переводов не найден: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Проверяет синхронизацию ключей между языками
 */
function checkTranslations(): void {
    console.log('🔍 Проверка синхронизации переводов...\n');

    // Загружаем все переводы
    const translations: Record<string, TranslationObject> = {};
    const allKeys: Record<string, string[]> = {};

    for (const lang of LANGUAGES) {
        try {
            translations[lang] = loadTranslation(lang);
            allKeys[lang] = getAllKeys(translations[lang]);
            console.log(`✓ Загружен ${lang}: ${allKeys[lang].length} ключей`);
        } catch (error) {
            console.error(`✗ Ошибка загрузки ${lang}:`, error);
            process.exit(1);
        }
    }

    console.log('');

    // Находим базовый язык (с наибольшим количеством ключей)
    const baseLang = Object.entries(allKeys).reduce((a, b) =>
        a[1].length > b[1].length ? a : b,
    )[0];

    console.log(`📋 Базовый язык: ${baseLang}\n`);

    // Проверяем каждый язык
    let hasErrors = false;
    const missingKeys: MissingKey[] = [];
    const extraKeys: ExtraKey[] = [];

    for (const lang of LANGUAGES) {
        if (lang === baseLang) continue;

        const baseKeys = new Set(allKeys[baseLang]);
        const langKeys = new Set(allKeys[lang]);

        // Ключи, которых нет в текущем языке
        const missing = [...baseKeys].filter(key => !langKeys.has(key));
        // Ключи, которых нет в базовом языке
        const extra = [...langKeys].filter(key => !baseKeys.has(key));

        if (missing.length > 0) {
            hasErrors = true;
            console.log(`❌ В ${lang} отсутствуют ключи (${missing.length}):`);
            missing.forEach(key => {
                console.log(`   - ${key}`);
                missingKeys.push({ key, language: lang });
            });
            console.log('');
        }

        if (extra.length > 0) {
            hasErrors = true;
            console.log(`⚠️  В ${lang} лишние ключи (${extra.length}):`);
            extra.forEach(key => {
                console.log(`   - ${key}`);
                extraKeys.push({ key, language: lang });
            });
            console.log('');
        }

        if (missing.length === 0 && extra.length === 0) {
            console.log(`✅ ${lang}: все ключи синхронизированы\n`);
        }
    }

    // Итоговая статистика
    console.log('═══════════════════════════════════════');
    if (hasErrors) {
        console.log('❌ ОБНАРУЖЕНЫ ПРОБЛЕМЫ:');
        console.log(`   Отсутствующих ключей: ${missingKeys.length}`);
        console.log(`   Лишних ключей: ${extraKeys.length}`);
        console.log('═══════════════════════════════════════\n');

        // Генерируем шаблон для отсутствующих ключей
        if (missingKeys.length > 0) {
            console.log('📝 Шаблон для добавления отсутствующих ключей:\n');

            const missingByLang = missingKeys.reduce(
                (acc, { key, language }) => {
                    if (!acc[language]) acc[language] = [];
                    acc[language].push(key);
                    return acc;
                },
                {} as Record<string, string[]>,
            );

            for (const [lang, keys] of Object.entries(missingByLang)) {
                console.log(`${lang}:`);
                keys.forEach(key => {
                    const value = getNestedValue(translations[baseLang], key);
                    console.log(`  "${key}": "${value}" // TODO: перевести`);
                });
                console.log('');
            }
        }

        process.exit(1);
    } else {
        console.log('✅ ВСЕ ПЕРЕВОДЫ СИНХРОНИЗИРОВАНЫ');
        console.log('═══════════════════════════════════════\n');
        process.exit(0);
    }
}

/**
 * Получает значение по вложенному ключу
 */
function getNestedValue(obj: TranslationObject, key: string): string {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = obj;

    for (const k of keys) {
        value = value[k];
        if (value === undefined) return '';
    }

    return typeof value === 'string' ? value : '';
}

// Запуск проверки
checkTranslations();
